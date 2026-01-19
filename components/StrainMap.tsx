
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Haplotype } from '../types';
import { Download, Maximize2, ZoomIn, ZoomOut, RotateCcw, MapPin } from 'lucide-react';

interface StrainMapProps {
  data: Haplotype[];
  speciesName?: string;
}

export const StrainMap: React.FC<StrainMapProps> = ({ data, speciesName }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedStrain, setSelectedStrain] = useState<Haplotype | null>(null);

  // Helper for manual zoom controls
  const handleZoom = (type: 'in' | 'out' | 'reset') => {
    const svg = d3.select(svgRef.current);
    const zoomBehavior = (svg as any).__zoomBehavior;
    if (!zoomBehavior) return;

    if (type === 'reset') {
      svg.transition().duration(750).call(zoomBehavior.transform, d3.zoomIdentity);
    } else {
      svg.transition().duration(300).call(zoomBehavior.scaleBy, type === 'in' ? 1.5 : 0.6);
    }
  };

  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;

    const width = 1200;
    const height = 750;
    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);
    
    svg.selectAll(".map-content").remove();
    const content = g.append("g").attr("class", "map-content");

    const projection = d3.geoAlbersUsa()
      .scale(1500)
      .translate([width / 2, height / 2]);

    const pathGenerator = d3.geoPath().projection(projection);
    const radiusScale = d3.scaleLinear().domain([99, 100]).range([6, 16]).clamp(true);
    const densityScale = d3.scaleLinear().domain([1, 10]).range([0, 35]).clamp(true);

    // Setup Zoom Behavior
    const zoom = d3.zoom()
      .scaleExtent([1, 12])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        // Adjust stroke width of states as we zoom so they don't get too thick
        content.selectAll(".state-path").style("stroke-width", 0.7 / event.transform.k);
      });

    svg.call(zoom as any);
    (svg as any).__zoomBehavior = zoom; // Store for external controls

    const drawMap = async () => {
      try {
        const response = await fetch("https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json");
        const geoData: any = await response.json();

        // States layer
        content.append("g")
          .selectAll("path")
          .data(geoData.features)
          .enter().append("path")
          .attr("class", "state-path")
          .attr("d", pathGenerator as any)
          .attr("fill", "#f8fafc")
          .attr("stroke", "#cbd5e1")
          .attr("stroke-width", 0.7);

        // US Border
        content.append("path")
          .datum({type: "FeatureCollection", features: geoData.features})
          .attr("d", pathGenerator as any)
          .attr("fill", "none")
          .attr("stroke", "#334155")
          .attr("stroke-width", 2.5);

        if (data && data.length > 0) {
          const pointsLayer = content.append("g");

          // Animation styles
          svg.append("defs")
            .append("style")
            .text(`
              @keyframes pulse-glow {
                0% { fill-opacity: 0.1; r: var(--min-r); }
                50% { fill-opacity: 0.3; r: var(--max-r); }
                100% { fill-opacity: 0.1; r: var(--min-r); }
              }
              .pulse {
                animation: pulse-glow 3s infinite ease-in-out;
              }
            `);

          // Points
          const dots = pointsLayer.selectAll(".node-group")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "node-group");

          dots.append("circle")
            .attr("class", d => d.regionalPrevalence > 7 ? "density-halo pulse" : "density-halo")
            .attr("cx", d => projection([d.lng, d.lat])?.[0] || -1000)
            .attr("cy", d => projection([d.lng, d.lat])?.[1] || -1000)
            .attr("r", d => radiusScale(d.similarity) + densityScale(d.regionalPrevalence))
            .style("--min-r", d => `${radiusScale(d.similarity) + densityScale(d.regionalPrevalence)}px`)
            .style("--max-r", d => `${radiusScale(d.similarity) + densityScale(d.regionalPrevalence) + 10}px`)
            .attr("fill", d => d3.interpolateViridis(d.similarity / 100))
            .attr("fill-opacity", 0.15)
            .style("pointer-events", "none");

          dots.append("circle")
            .attr("class", "main-dot")
            .attr("cx", d => projection([d.lng, d.lat])?.[0] || -1000)
            .attr("cy", d => projection([d.lng, d.lat])?.[1] || -1000)
            .attr("r", d => radiusScale(d.similarity))
            .attr("fill", d => d3.interpolateViridis(d.similarity / 100))
            .attr("stroke", "#ffffff")
            .attr("stroke-width", d => radiusScale(d.similarity) / 4)
            .style("cursor", "pointer")
            .on("mouseover", function(event, d) {
              const baseR = radiusScale(d.similarity);
              d3.select(this).raise().transition().duration(200).attr("r", baseR * 1.5);
              setSelectedStrain(d);
            })
            .on("mouseout", function(event, d) {
              d3.select(this).transition().duration(200).attr("r", radiusScale(d.similarity));
            });

          // AUTO-ZOOM LOGIC: 
          // Find the bounds of the returned points and transition the zoom
          const projectedPoints = data
            .map(d => projection([d.lng, d.lat]))
            .filter(p => p !== null) as [number, number][];

          if (projectedPoints.length > 0) {
            const xExtent = d3.extent(projectedPoints, p => p[0]) as [number, number];
            const yExtent = d3.extent(projectedPoints, p => p[1]) as [number, number];
            
            // Add padding (15%)
            const dx = xExtent[1] - xExtent[0];
            const dy = yExtent[1] - yExtent[0];
            const x = (xExtent[0] + xExtent[1]) / 2;
            const y = (yExtent[0] + yExtent[1]) / 2;
            
            // Calculate scale to fit. Limit maximum auto-zoom to 6x to avoid disorienting the user.
            const scale = Math.min(6, 0.8 / Math.max(dx / width, dy / height));
            const translate = [width / 2 - scale * x, height / 2 - scale * y];

            svg.transition()
              .duration(1500)
              .call(
                zoom.transform,
                d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
              );
          }
        }
      } catch (err) { console.error("Map rendering error:", err); }
    };
    drawMap();
  }, [data]);

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 overflow-hidden w-full col-span-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <span className="w-4 h-4 bg-indigo-600 rounded-full animate-pulse"></span>
            Focused Spatial Strain Map
          </h3>
          <p className="text-slate-500 text-sm mt-1">Nodes indicate documented population clades. Auto-zoomed to distribution bounds.</p>
        </div>
      </div>
      
      <div className="flex flex-col xl:flex-row gap-8">
        <div ref={containerRef} className="relative flex-1 bg-slate-50 rounded-2xl border border-slate-200 min-h-[600px] flex items-center justify-center overflow-hidden group">
          <svg ref={svgRef} viewBox="0 0 1200 750" className="w-full h-auto drop-shadow-2xl cursor-move">
            <rect width="1200" height="750" fill="transparent" />
            <g ref={gRef}></g>
          </svg>

          {/* Map Controls */}
          <div className="absolute bottom-6 left-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button onClick={() => handleZoom('in')} className="p-3 bg-white border border-slate-200 rounded-xl shadow-lg hover:bg-slate-50 text-slate-700" title="Zoom In"><ZoomIn size={20}/></button>
            <button onClick={() => handleZoom('out')} className="p-3 bg-white border border-slate-200 rounded-xl shadow-lg hover:bg-slate-50 text-slate-700" title="Zoom Out"><ZoomOut size={20}/></button>
            <button onClick={() => handleZoom('reset')} className="p-3 bg-white border border-slate-200 rounded-xl shadow-lg hover:bg-slate-50 text-slate-700" title="Reset View"><RotateCcw size={20}/></button>
          </div>
          
          <div className="absolute top-6 right-6 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-400">
            Scroll to zoom • Drag to pan
          </div>
        </div>

        <div className="xl:w-80 flex-shrink-0">
          <div className={`h-full min-h-[400px] p-6 rounded-2xl border-2 transition-all duration-500 ${selectedStrain ? 'border-indigo-500 bg-white shadow-2xl' : 'border-dashed border-slate-200 bg-slate-50/50'}`}>
            {!selectedStrain ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
                <Maximize2 className="w-8 h-8 mb-4 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">Select Node</p>
                <p className="text-[10px] mt-2">Inspect niche substrate and SNP divergence.</p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center justify-between mb-4 text-[10px] font-black uppercase tracking-widest">
                  <span className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{selectedStrain.id}</span>
                </div>
                <h4 className="font-black text-slate-900 text-lg mb-4 leading-tight">{selectedStrain.region}</h4>
                <div className="space-y-4">
                  <div className="text-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Substrate / Niche</p>
                    <p className="italic text-slate-800 font-medium">{selectedStrain.substrate}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Inferred Markers</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedStrain.snps.map((s, i) => <span key={i} className="px-1.5 py-0.5 bg-white border border-slate-200 text-indigo-700 rounded text-[9px] font-mono shadow-sm">{s}</span>)}
                    </div>
                  </div>
                  <div className="text-sm pt-3 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Bio-Potential</p>
                    <p className="text-slate-600 leading-relaxed text-xs italic">{selectedStrain.chemistry}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
