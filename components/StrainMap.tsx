
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Haplotype } from '../types';
// Fixed: Added Globe to the lucide-react imports
import { Download, Maximize2, ZoomIn, ZoomOut, RotateCcw, Bug, Target, Layers, Globe } from 'lucide-react';

interface StrainMapProps {
  data: Haplotype[];
  speciesName?: string;
}

export const StrainMap: React.FC<StrainMapProps> = ({ data, speciesName }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedStrain, setSelectedStrain] = useState<Haplotype | null>(null);

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
    const projection = d3.geoAlbersUsa().scale(1500).translate([width / 2, height / 2]);
    const pathGenerator = d3.geoPath().projection(projection);
    const radiusScale = d3.scaleLinear().domain([95, 100]).range([8, 20]).clamp(true);
    const zoom = d3.zoom().scaleExtent([1, 12]).on("zoom", (event) => {
      g.attr("transform", event.transform);
      content.selectAll(".state-path").style("stroke-width", 0.7 / event.transform.k);
    });
    svg.call(zoom as any);
    (svg as any).__zoomBehavior = zoom;

    const drawMap = async () => {
      try {
        const response = await fetch("https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json");
        const geoData: any = await response.json();
        content.append("g").selectAll("path").data(geoData.features).enter().append("path").attr("class", "state-path").attr("d", pathGenerator as any).attr("fill", "#f8fafc").attr("stroke", "#cbd5e1").attr("stroke-width", 0.7);
        if (data && data.length > 0) {
          const pointsLayer = content.append("g");
          const dots = pointsLayer.selectAll(".node-group").data(data).enter().append("g").attr("class", "node-group");
          dots.append("circle").attr("cx", d => projection([d.lng, d.lat])?.[0] || -1000).attr("cy", d => projection([d.lng, d.lat])?.[1] || -1000).attr("r", d => radiusScale(d.similarity) + 15).attr("fill", d => d3.interpolateViridis(d.similarity / 100)).attr("fill-opacity", 0.1).style("pointer-events", "none");
          dots.append("circle").attr("cx", d => projection([d.lng, d.lat])?.[0] || -1000).attr("cy", d => projection([d.lng, d.lat])?.[1] || -1000).attr("r", d => radiusScale(d.similarity)).attr("fill", d => d3.interpolateViridis(d.similarity / 100)).attr("stroke", "#ffffff").attr("stroke-width", 2).style("cursor", "pointer")
            .on("mouseover", function(event, d) { d3.select(this).raise().transition().duration(200).attr("r", radiusScale(d.similarity) * 1.5); setSelectedStrain(d); })
            .on("mouseout", function(event, d) { d3.select(this).transition().duration(200).attr("r", radiusScale(d.similarity)); });

          const projectedPoints = data.map(d => projection([d.lng, d.lat])).filter(p => p !== null) as [number, number][];
          if (projectedPoints.length > 0) {
            const xExtent = d3.extent(projectedPoints, p => p[0]) as [number, number];
            const yExtent = d3.extent(projectedPoints, p => p[1]) as [number, number];
            const x = (xExtent[0] + xExtent[1]) / 2;
            const y = (yExtent[0] + yExtent[1]) / 2;
            const dx = xExtent[1] - xExtent[0];
            const dy = yExtent[1] - yExtent[0];
            const scale = Math.min(6, 0.75 / Math.max(dx / width, dy / height));
            svg.transition().duration(1500).call(zoom.transform, d3.zoomIdentity.translate(width / 2 - scale * x, height / 2 - scale * y).scale(scale));
          }
        }
      } catch (err) { console.error(err); }
    };
    drawMap();
  }, [data]);

  return (
    <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-200 overflow-hidden w-full col-span-full">
      <div className="mb-6">
        <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
          <Globe className="text-indigo-600" /> Genomic Distribution & Insect Vector Map
        </h3>
      </div>
      <div className="flex flex-col xl:flex-row gap-8">
        <div ref={containerRef} className="relative flex-1 bg-slate-50 rounded-[2.5rem] border border-slate-200 min-h-[600px] flex items-center justify-center overflow-hidden group shadow-inner">
          <svg ref={svgRef} viewBox="0 0 1200 750" className="w-full h-auto drop-shadow-2xl cursor-move"><rect width="1200" height="750" fill="transparent" /><g ref={gRef}></g></svg>
          <div className="absolute bottom-6 left-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => handleZoom('in')} className="p-3 bg-white border border-slate-200 rounded-xl shadow-lg hover:bg-slate-50"><ZoomIn size={20}/></button>
            <button onClick={() => handleZoom('out')} className="p-3 bg-white border border-slate-200 rounded-xl shadow-lg hover:bg-slate-50"><ZoomOut size={20}/></button>
            <button onClick={() => handleZoom('reset')} className="p-3 bg-white border border-slate-200 rounded-xl shadow-lg hover:bg-slate-50"><RotateCcw size={20}/></button>
          </div>
        </div>
        <div className="xl:w-96 flex-shrink-0">
          <div className={`h-full min-h-[500px] p-8 rounded-[2rem] border-2 transition-all duration-500 ${selectedStrain ? 'border-indigo-500 bg-white shadow-2xl' : 'border-dashed border-slate-200 bg-slate-50/50'}`}>
            {!selectedStrain ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
                <Maximize2 className="w-10 h-10 mb-4 opacity-20" />
                <p className="text-xs font-black uppercase tracking-widest">Select Node</p>
                <p className="text-[10px] mt-2">Inspect niche substrate, SNPs, and entomological associations.</p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-indigo-600 text-white rounded-lg font-mono text-[11px] font-black">{selectedStrain.id}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{selectedStrain.similarity}% Sim</span>
                </div>
                <h4 className="font-black text-slate-900 text-xl leading-tight">{selectedStrain.region}</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase mb-1 flex items-center gap-1"><Target size={12}/> Association</p>
                    <p className="italic text-slate-800 font-bold text-sm">{selectedStrain.substrate}</p>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                    <p className="text-[10px] font-black text-indigo-600 uppercase mb-2 flex items-center gap-1"><Bug size={12}/> Insect Context</p>
                    <p className="text-xs text-indigo-900 leading-relaxed font-medium">{selectedStrain.insectAssociations}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2 flex items-center gap-1"><Layers size={12}/> SNPs</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedStrain.snps.map((s, i) => <span key={i} className="px-2 py-1 bg-slate-50 border border-slate-200 text-indigo-700 rounded text-[9px] font-mono shadow-sm">{s}</span>)}
                    </div>
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
