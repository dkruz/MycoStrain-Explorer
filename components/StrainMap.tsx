
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Haplotype } from '../types';
import { ZoomIn, ZoomOut, RotateCcw, Target, Layers, Map as MapIcon, Loader2, TreeDeciduous, Globe, MapPin } from 'lucide-react';

interface StrainMapProps {
  data: Haplotype[];
  mode?: 'amateur' | 'professional';
  onStatusChange?: (status: 'pending' | 'success' | 'blocked') => void;
}

export const StrainMap: React.FC<StrainMapProps> = ({ data, mode = 'professional', onStatusChange }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<any>(null);
  
  const [selectedStrain, setSelectedStrain] = useState<Haplotype | null>(null);
  const [mapStatus, setMapStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  const width = 1200;
  const height = 750;

  // Normalization helper: handles 0.98 vs 98
  const normalizeSim = (val: number) => (val <= 1 ? val * 100 : val);
  
  const radiusScale = (d3 as any).scaleLinear()
    .domain([0, 100])
    .range([10, 32])
    .clamp(true);

  const resetToHome = () => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = (d3 as any).select(svgRef.current);
    svg.transition().duration(1000).call(zoomRef.current.transform, (d3 as any).zoomIdentity);
  };

  const handleZoom = (type: 'in' | 'out') => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = (d3 as any).select(svgRef.current);
    svg.transition().duration(300).call(zoomRef.current.scaleBy, type === 'in' ? 2 : 0.5);
  };

  useEffect(() => {
    let isMounted = true;
    if (!svgRef.current || !gRef.current) return;
    
    const svg = (d3 as any).select(svgRef.current);
    const g = (d3 as any).select(gRef.current);
    g.selectAll("*").remove();

    const zoomBehavior = (d3 as any).zoom()
      .scaleExtent([0.1, 100])
      .on("zoom", (event: any) => {
        g.attr("transform", event.transform);
        const k = event.transform.k;
        g.selectAll(".node-dot").attr("r", (d: any) => radiusScale(normalizeSim(d.similarity)) / k);
        g.selectAll(".node-dot").attr("stroke-width", 2 / k);
        g.selectAll(".state-border").attr("stroke-width", 0.5 / k);
        g.selectAll(".national-border").attr("stroke-width", 2 / k);
      });
    
    svg.call(zoomBehavior);
    zoomRef.current = zoomBehavior;

    const drawMap = async () => {
      try {
        if (isMounted) {
          setMapStatus('loading');
          onStatusChange?.('pending');
        }
        
        const response = await fetch("https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json");
        if (!response.ok) throw new Error("Map geometry fetch failed");
        const rawData = await response.json();
        
        if (!isMounted) return;

        const continentalFeatures = (rawData.features || []).filter((f: any) => 
          f.properties && !['AK', 'HI', 'PR', 'Alaska', 'Hawaii', 'Puerto Rico'].includes(f.properties.name)
        );
        const statesData = { ...rawData, features: continentalFeatures };

        const projection = (d3 as any).geoMercator().fitExtent([[50, 50], [width - 50, height - 70]], statesData);
        const pathGenerator = (d3 as any).geoPath().projection(projection);

        const basemap = g.append("g").attr("class", "basemap");

        // Fills
        basemap.selectAll(".state-fill")
          .data(statesData.features)
          .enter()
          .append("path")
          .attr("d", pathGenerator as any)
          .attr("fill", mode === 'amateur' ? "#064e3b" : "#0f172a");

        // Borders
        basemap.selectAll(".state-border")
          .data(statesData.features)
          .enter()
          .append("path")
          .attr("d", pathGenerator as any)
          .attr("fill", "transparent")
          .attr("stroke", mode === 'amateur' ? "#059669" : "#334155")
          .attr("stroke-width", 0.5);

        // National Boundary
        basemap.append("path")
          .datum(statesData)
          .attr("d", pathGenerator as any)
          .attr("fill", "transparent")
          .attr("stroke", mode === 'amateur' ? "#10b981" : "#ffffff")
          .attr("stroke-width", 2);

        if (isMounted) {
          setMapStatus('ready');
          onStatusChange?.('success');
        }

        if (data && data.length > 0) {
          const pointsLayer = g.append("g").attr("class", "nodes");
          
          const validData = data.filter(d => {
            const pos = projection([d.lng, d.lat]);
            return pos !== null && !isNaN(pos[0]) && !isNaN(pos[1]);
          });

          pointsLayer.selectAll(".node-dot")
            .data(validData)
            .enter()
            .append("circle")
            .attr("class", "node-dot")
            .attr("cx", (d: any) => projection([d.lng, d.lat])![0])
            .attr("cy", (d: any) => projection([d.lng, d.lat])![1])
            .attr("r", (d: any) => radiusScale(normalizeSim(d.similarity)))
            .attr("fill", (d: any) => {
              const s = normalizeSim(d.similarity) / 100;
              // Use Magma for professional mode - it's brighter at high similarity on dark backgrounds
              return mode === 'amateur' ? (d3 as any).interpolateYlGnBu(s) : (d3 as any).interpolateMagma(s);
            })
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .style("cursor", "pointer")
            .style("filter", "drop-shadow(0 0 10px rgba(0,0,0,0.6))")
            .on("mouseover", (e: any, d: any) => setSelectedStrain(d));

          const points = validData.map(d => projection([d.lng, d.lat]) as [number, number]);
          if (points.length > 0) {
            const xExt = (d3 as any).extent(points, (p: [number, number]) => p[0]) as [number, number];
            const yExt = (d3 as any).extent(points, (p: [number, number]) => p[1]) as [number, number];
            const x = (xExt[0] + xExt[1]) / 2;
            const y = (yExt[0] + yExt[1]) / 2;
            const dx = (xExt[1] - xExt[0]) || 100;
            const dy = (yExt[1] - yExt[0]) || 100;
            const scale = Math.min(6, 0.75 / Math.max(dx / width, dy / height));
            
            svg.transition().duration(1200).call(
              zoomBehavior.transform, 
              (d3 as any).zoomIdentity.translate(width/2 - scale*x, height/2 - scale*y).scale(scale)
            );
          }
        }
      } catch (err) {
        if (isMounted) {
          setMapStatus('error');
          onStatusChange?.('blocked');
        }
      }
    };
    drawMap();
    
    return () => { 
      isMounted = false;
      if (svgRef.current) (d3 as any).select(svgRef.current).on(".zoom", null);
    };
  }, [data, mode]);

  return (
    <div className="bg-white p-8 rounded-[3.5rem] shadow-2xl border border-slate-200 overflow-hidden w-full col-span-full">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6 px-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <MapIcon className={mode === 'amateur' ? 'text-emerald-600' : 'text-indigo-600'} /> 
            {mode === 'amateur' ? 'Local Variety Map' : 'Genomic Distribution Map'}
          </h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
            {mode === 'amateur' ? 'Regional cousins across the landscape' : 'v4.2 absolute phylogenetic contrast'}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
          <Globe size={14} className="text-slate-400" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Projection: Continental Mercator</span>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        <div className="relative flex-1 bg-slate-950 rounded-[3.5rem] min-h-[600px] shadow-inner ring-4 ring-slate-900 overflow-hidden group">
          {mapStatus === 'loading' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 z-50 backdrop-blur-md">
              <Loader2 className="animate-spin text-indigo-400 mb-4" size={40} />
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Re-rendering Genomic Baseline...</p>
            </div>
          )}
          <svg ref={svgRef} viewBox="0 0 1200 750" className="w-full h-auto cursor-move">
            <g ref={gRef}></g>
          </svg>
          <div className="absolute bottom-8 left-8 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
            <button onClick={() => handleZoom('in')} className="p-4 bg-slate-900/90 text-white rounded-2xl border border-slate-700 hover:bg-slate-800 shadow-xl"><ZoomIn size={20}/></button>
            <button onClick={() => handleZoom('out')} className="p-4 bg-slate-900/90 text-white rounded-2xl border border-slate-700 hover:bg-slate-800 shadow-xl"><ZoomOut size={20}/></button>
            <button onClick={resetToHome} className="p-4 bg-slate-900/90 text-white rounded-2xl border border-slate-700 hover:bg-slate-800 shadow-xl"><RotateCcw size={20}/></button>
          </div>
        </div>

        <div className="xl:w-80 flex-shrink-0">
          <div className={`h-full min-h-[400px] p-8 rounded-[3rem] border-2 transition-all duration-500 ${selectedStrain ? 'border-indigo-500 bg-white shadow-xl' : 'border-dashed border-slate-200 bg-slate-50/50'}`}>
            {!selectedStrain ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-400">
                <MapPin className="mx-auto mb-6 opacity-10 animate-bounce" size={48} />
                <p className="text-[12px] font-black uppercase tracking-[0.2em] mb-4">Select Node</p>
                <p className="text-[10px] leading-relaxed max-w-[180px] mx-auto opacity-70">Interactive boundaries are calibrated for {mode} mode. Select any node to inspect genetic properties.</p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                <div className="flex items-center justify-between">
                  <span className={`px-4 py-1.5 rounded-xl text-white font-mono font-black text-xs ${mode === 'amateur' ? 'bg-emerald-600' : 'bg-indigo-600'}`}>{selectedStrain.id}</span>
                  <p className="text-sm font-black text-slate-900">{(normalizeSim(selectedStrain.similarity) ?? 0).toFixed(1)}%</p>
                </div>
                <h4 className="font-black text-2xl text-slate-900 tracking-tight">{selectedStrain.region}</h4>
                <div className={`p-6 rounded-[2rem] text-white shadow-lg ${mode === 'amateur' ? 'bg-emerald-700' : 'bg-slate-900'}`}>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-3 opacity-60">{mode === 'amateur' ? 'Usual Home' : 'Substrate Index'}</p>
                  <p className="text-sm font-bold leading-relaxed">{selectedStrain.substrate}</p>
                </div>
                <div className="space-y-3 pt-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"><Layers size={14}/> {mode === 'amateur' ? 'What to Look For' : 'Functional Ontology'}</p>
                  <p className="text-xs text-slate-600 italic leading-relaxed border-l-2 border-slate-100 pl-4">{selectedStrain.functionalTrait}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
