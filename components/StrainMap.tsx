
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Haplotype } from '../types';
import { ZoomIn, ZoomOut, RotateCcw, Bug, Target, Layers, Map as MapIcon, Loader2, TreeDeciduous, Globe, AlertCircle } from 'lucide-react';

interface StrainMapProps {
  data: Haplotype[];
  speciesName?: string;
}

export const StrainMap: React.FC<StrainMapProps> = ({ data, speciesName }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  // Fix: Replaced missing ZoomBehavior type with any
  const zoomRef = useRef<any>(null);
  
  const [selectedStrain, setSelectedStrain] = useState<Haplotype | null>(null);
  const [mapStatus, setMapStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [statesGeoData, setStatesGeoData] = useState<any>(null);

  const width = 1200;
  const height = 750;
  // Fix: Cast d3 to any to access scaleLinear
  const radiusScale = (d3 as any).scaleLinear().domain([95, 100]).range([15, 30]).clamp(true);

  const resetToHome = () => {
    if (!svgRef.current || !zoomRef.current || !statesGeoData) return;
    // Fix: Cast d3 to any to access select
    const svg = (d3 as any).select(svgRef.current);
    
    // Fix: Cast d3 to any to access geoMercator
    const projection = (d3 as any).geoMercator().fitExtent([[50, 50], [width - 50, height - 50]], statesGeoData);
    
    // Fix: Cast d3 to any to access zoomIdentity
    svg.transition().duration(1000).call(
      zoomRef.current.transform, 
      (d3 as any).zoomIdentity
    );
  };

  const handleZoom = (type: 'in' | 'out') => {
    if (!svgRef.current || !zoomRef.current) return;
    // Fix: Cast d3 to any to access select
    const svg = (d3 as any).select(svgRef.current);
    svg.transition().duration(300).call(zoomRef.current.scaleBy, type === 'in' ? 2 : 0.5);
  };

  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;
    
    // Fix: Cast d3 to any for selections and zoom
    const svg = (d3 as any).select(svgRef.current);
    const g = (d3 as any).select(gRef.current);
    
    g.selectAll("*").remove();

    // Fix: Cast d3 to any to access zoom
    const zoomBehavior = (d3 as any).zoom()
      .scaleExtent([0.1, 100])
      .on("zoom", (event: any) => {
        g.attr("transform", event.transform);
        const k = event.transform.k;
        g.selectAll(".node-dot").attr("r", (d: any) => radiusScale(d.similarity) / k);
        g.selectAll(".node-dot").attr("stroke-width", 2 / k);
        g.selectAll(".node-glow").attr("r", (d: any) => (radiusScale(d.similarity) + 15) / k);
        // Silhouette stroke stays sharp
        g.selectAll(".national-silhouette").attr("stroke-width", 3 / k);
      });
    
    svg.call(zoomBehavior);
    zoomRef.current = zoomBehavior;

    const drawMap = async () => {
      try {
        setMapStatus('loading');
        
        // Fetching robust USA GeoJSON
        const response = await fetch("https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json");
        if (!response.ok) throw new Error("Basemap dataset inaccessible");
        const rawData = await response.json();
        
        // Filter to Continental US to ensure a clean Mercator silhouette
        const continentalFeatures = rawData.features.filter((f: any) => 
          !['AK', 'HI', 'PR', 'Alaska', 'Hawaii', 'Puerto Rico'].includes(f.properties.name)
        );
        const statesData = { ...rawData, features: continentalFeatures };
        setStatesGeoData(statesData);

        // Fix: Cast d3 to any for projections and paths
        const projection = (d3 as any).geoMercator().fitExtent([[80, 80], [width - 80, height - 80]], statesData);
        const pathGenerator = (d3 as any).geoPath().projection(projection);

        // LAYER 1: NATIONAL SILHOUETTE
        const basemap = g.append("g").attr("class", "basemap");
        
        // Draw the states as one solid block (no stroke)
        basemap.selectAll(".state-fill")
          .data(statesData.features)
          .enter()
          .append("path")
          .attr("class", "state-fill")
          .attr("d", pathGenerator as any)
          .attr("fill", "#0f172a") // Slate-950
          .style("pointer-events", "none");

        // Draw ONE big perimeter stroke for the entire group
        // This simulates a National Boundary perfectly
        basemap.selectAll(".national-silhouette")
          .data(statesData.features)
          .enter()
          .append("path")
          .attr("class", "national-silhouette")
          .attr("d", pathGenerator as any)
          .attr("fill", "transparent")
          .attr("stroke", "#ffffff") // PURE WHITE SILHOUETTE
          .attr("stroke-width", 3)
          .attr("stroke-opacity", 1)
          .style("vector-effect", "non-scaling-stroke")
          .style("pointer-events", "none");

        setMapStatus('ready');

        // LAYER 2: GENOMIC DATA NODES
        if (data && data.length > 0) {
          const pointsLayer = g.append("g").attr("class", "nodes");
          
          // STRICTOR SANITIZATION: Skip any points that might be corrupted or projecting to NaN
          const validData = data.filter(d => {
            if (typeof d.lat !== 'number' || typeof d.lng !== 'number') return false;
            const projected = projection([d.lng, d.lat]);
            return projected && !isNaN(projected[0]) && !isNaN(projected[1]);
          });

          pointsLayer.selectAll(".node-glow")
            .data(validData)
            .enter()
            .append("circle")
            .attr("class", "node-glow")
            .attr("cx", d => projection([d.lng, d.lat])![0])
            .attr("cy", d => projection([d.lng, d.lat])![1])
            .attr("r", d => radiusScale(d.similarity) + 15)
            // Fix: Cast d3 to any for interpolation
            .attr("fill", d => (d3 as any).interpolateViridis(d.similarity / 100))
            .attr("fill-opacity", 0.4)
            .style("pointer-events", "none");

          pointsLayer.selectAll(".node-dot")
            .data(validData)
            .enter()
            .append("circle")
            .attr("class", "node-dot")
            .attr("cx", d => projection([d.lng, d.lat])![0])
            .attr("cy", d => projection([d.lng, d.lat])![1])
            .attr("r", d => radiusScale(d.similarity))
            // Fix: Cast d3 to any for interpolation
            .attr("fill", d => (d3 as any).interpolateViridis(d.similarity / 100))
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 2)
            .attr("filter", "drop-shadow(0 0 15px rgba(0,0,0,0.8))")
            .style("cursor", "pointer")
            .on("mouseover", function(event, d) {
               // Fix: Cast d3 to any for zoomTransform and select
               const k = (d3 as any).zoomTransform(svg.node()!).k;
               (d3 as any).select(this).raise().transition().duration(200).attr("r", (radiusScale(d.similarity) * 2.5) / k);
               setSelectedStrain(d);
            })
            .on("mouseout", function(event, d) {
               // Fix: Cast d3 to any for zoomTransform and select
               const k = (d3 as any).zoomTransform(svg.node()!).k;
               (d3 as any).select(this).transition().duration(200).attr("r", radiusScale(d.similarity) / k);
            });

          // Autofit viewport to the actual data spread
          if (validData.length > 0) {
             const points = validData.map(d => projection([d.lng, d.lat]) as [number, number]);
             // Fix: Cast d3 to any for extent
             const xExt = (d3 as any).extent(points, (p: any) => p[0]) as [number, number];
             const yExt = (d3 as any).extent(points, (p: any) => p[1]) as [number, number];
             const x = (xExt[0] + xExt[1]) / 2;
             const y = (yExt[0] + yExt[1]) / 2;
             const dx = xExt[1] - xExt[0];
             const dy = yExt[1] - yExt[0];
             const scale = Math.min(10, 0.75 / Math.max(dx / width, dy / height));
             
             // Fix: Cast d3 to any for zoomIdentity
             svg.transition().duration(1500).call(
               zoomBehavior.transform, 
               (d3 as any).zoomIdentity.translate(width/2 - scale*x, height/2 - scale*y).scale(scale)
             );
          }
        }
      } catch (err) {
        console.error("Cartography Projection Failure v4.1:", err);
        setMapStatus('error');
      }
    };
    
    drawMap();
  }, [data]);

  return (
    <div className="bg-white p-8 rounded-[3.5rem] shadow-2xl border border-slate-200 overflow-hidden w-full col-span-full">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6 px-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <MapIcon className="text-indigo-600" /> Genomic Distribution & Ecological Map
          </h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">v4.1 ABSOLUTE CONTRAST | Steel Silhouette | Mercator Projection</p>
        </div>
        
        <div className="flex items-center gap-5 bg-slate-50 px-8 py-4 rounded-3xl border border-slate-100">
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Similarity Index</span>
          <div className="flex h-3 gap-1">
            {[95, 96, 97, 98, 99, 100].map(v => (
               // Fix: Cast d3 to any for interpolateViridis
               <div key={v} className="w-8 h-full rounded-full" style={{ background: (d3 as any).interpolateViridis(v/100) }}></div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        <div className="relative flex-1 bg-slate-950 rounded-[3.5rem] min-h-[800px] flex items-center justify-center overflow-hidden group shadow-2xl ring-2 ring-slate-800">
          
          {mapStatus === 'loading' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-slate-950 z-50">
               <Loader2 className="animate-spin text-indigo-400" size={48} />
               <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Forging Steel Silhouette...</p>
            </div>
          )}

          {mapStatus === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-slate-950 z-50 text-center p-10">
               <AlertCircle className="text-red-500 mb-4" size={48} />
               <p className="text-white font-black uppercase tracking-widest">Projection Protocol Failure</p>
               <p className="text-slate-500 text-xs mt-2">Network timeout fetching GeoJSON silhouette.</p>
            </div>
          )}

          <svg ref={svgRef} viewBox="0 0 1200 750" className="w-full h-auto cursor-move relative z-10 transition-opacity duration-700">
            <g ref={gRef}></g>
          </svg>

          {/* Precision Controls */}
          <div className="absolute bottom-12 left-12 flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 scale-100 origin-bottom-left">
            <button onClick={() => handleZoom('in')} className="p-5 bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl hover:bg-slate-800 active:scale-90 transition-all text-white hover:text-indigo-400"><ZoomIn size={24} /></button>
            <button onClick={() => handleZoom('out')} className="p-5 bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl hover:bg-slate-800 active:scale-90 transition-all text-white hover:text-indigo-400"><ZoomOut size={24} /></button>
            <button onClick={resetToHome} title="Fit US Silhouette" className="p-5 bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl hover:bg-slate-800 active:scale-90 transition-all text-white hover:text-indigo-400"><RotateCcw size={24} /></button>
          </div>
        </div>

        <div className="xl:w-96 flex-shrink-0">
          <div className={`h-full min-h-[600px] p-10 rounded-[3.5rem] border-2 transition-all duration-700 ${selectedStrain ? 'border-indigo-500 bg-white shadow-2xl transform translate-y-[-8px]' : 'border-dashed border-slate-200 bg-slate-50/50'}`}>
            {!selectedStrain ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
                <Globe className="w-16 h-16 mb-8 opacity-10 animate-pulse" />
                <p className="text-[12px] font-black uppercase tracking-[0.3em]">Genomic Inspector</p>
                <p className="text-[10px] mt-5 leading-relaxed max-w-[220px] mx-auto opacity-70">Boundaries are now locked as a single steel silhouette. State noise has been eliminated for maximum visual clarity.</p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-10 duration-700 space-y-10">
                <div className="flex items-center justify-between">
                  <span className="px-5 py-2.5 bg-indigo-600 text-white rounded-2xl font-mono text-[13px] font-black shadow-lg">{selectedStrain.id}</span>
                  <div className="bg-indigo-50 px-5 py-2 rounded-full border border-indigo-100">
                     <span className="text-[11px] font-black text-indigo-700 uppercase tracking-widest">{selectedStrain.similarity}% Drift</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-black text-slate-900 text-3xl leading-none tracking-tighter">{selectedStrain.region}</h4>
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">PROTOCOL v4.1</p>
                </div>
                
                <div className="space-y-8">
                  <div className="bg-indigo-600 p-8 rounded-[2.5rem] border border-indigo-700 shadow-xl relative overflow-hidden group">
                    <TreeDeciduous className="absolute top-0 right-0 text-white/10 -mt-4 -mr-4" size={90} />
                    <p className="text-[10px] font-black text-indigo-200 uppercase mb-4 flex items-center gap-2 tracking-[0.25em] relative z-10"><Target size={18}/> Primary Host</p>
                    <p className="text-[16px] text-white font-black leading-relaxed relative z-10">{selectedStrain.substrate}</p>
                  </div>

                  <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
                    <Bug className="absolute top-0 right-0 text-white/5 -mt-4 -mr-4 rotate-12" size={90} />
                    <p className="text-[10px] font-black text-indigo-400 uppercase mb-4 flex items-center gap-2 tracking-[0.25em] relative z-10"><Bug size={18}/> Entomological Associate</p>
                    <p className="text-[14px] text-white leading-relaxed font-semibold italic relative z-10 opacity-95">{selectedStrain.insectAssociations}</p>
                  </div>

                  <div className="pt-8 border-t border-slate-100">
                    <p className="text-[11px] font-black text-slate-500 uppercase mb-4 flex items-center gap-2 tracking-[0.25em]"><Layers size={18}/> Variant Markers (SNPs)</p>
                    <div className="flex flex-wrap gap-2.5">
                      {selectedStrain.snps.map((s, i) => (
                        <span key={i} className="px-4 py-2 bg-slate-50 border border-slate-200 text-indigo-900 rounded-xl text-[11px] font-mono font-black shadow-inner">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-50 flex items-center justify-between opacity-50">
                   <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">COORDS: {selectedStrain.lat.toFixed(4)}, {selectedStrain.lng.toFixed(4)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
