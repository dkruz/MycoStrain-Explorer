
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Haplotype, ComponentTrust } from '../types';
import { Share2, Users, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { DataTrustIndicator } from './DataTrustIndicator';

export const NetworkGraph: React.FC<{ data: Haplotype[], trust?: ComponentTrust, mode?: 'amateur' | 'professional' }> = ({ data, trust, mode = 'professional' }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<any>(null);
  const [hoveredNode, setHoveredNode] = useState<Haplotype | null>(null);

  const width = 800;
  const height = 600;
  const normalizeSim = (val: number) => (val <= 1 ? val * 100 : val);

  const resetZoom = () => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(750).call(zoomRef.current.transform, d3.zoomIdentity);
  };

  useEffect(() => {
    if (!svgRef.current || !gRef.current || !data || data.length === 0) return;
    const svg = d3.select(svgRef.current);
    const container = d3.select(gRef.current);
    container.selectAll("*").remove();

    const zoomBehavior = d3.zoom().scaleExtent([0.1, 10]).on("zoom", (event) => {
      container.attr("transform", event.transform);
    });
    svg.call(zoomBehavior as any);
    zoomRef.current = zoomBehavior;

    const nodes = data.map(d => ({ ...d }));
    const links: any[] = [];
    
    nodes.forEach((node, idx) => {
      if (idx > 0) {
        const potentialParents = nodes.slice(0, idx);
        const nodeSim = normalizeSim(node.similarity);
        const parent = potentialParents.reduce((prev, curr) => {
          const currDiff = Math.abs(normalizeSim(curr.similarity) - nodeSim);
          const prevDiff = Math.abs(normalizeSim(prev.similarity) - nodeSim);
          return currDiff < prevDiff ? curr : prev;
        });
        if (parent && parent.id) links.push({ source: parent.id, target: node.id });
      }
    });

    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "glow").attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
    filter.append("feGaussianBlur").attr("stdDeviation", "3.5").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(60));

    const link = container.append("g").selectAll("line").data(links).enter().append("line")
      .attr("stroke", mode === 'amateur' ? "#10b981" : "#6366f1").attr("stroke-width", 2).attr("stroke-opacity", 0.4).attr("stroke-dasharray", "5,5");

    const node = container.append("g").selectAll("g").data(nodes).enter().append("g")
      .on("mouseenter", (e, d: any) => setHoveredNode(d)).on("mouseleave", () => setHoveredNode(null))
      .style("cursor", "pointer")
      .call(d3.drag<any, any>().on("start", (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on("end", (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }) as any);

    node.append("circle").attr("r", 24)
      .attr("fill", (d: any) => {
        const s = normalizeSim(d.similarity) / 100;
        return mode === 'amateur' ? d3.interpolateYlGnBu(s) : d3.interpolateMagma(s);
      })
      .attr("stroke", "#ffffff").attr("stroke-width", 3).style("filter", mode === 'professional' ? "url(#glow)" : "none");

    node.append("text").text((d: any) => d.id).attr("dy", 4).attr("text-anchor", "middle").attr("class", "text-[10px] font-black fill-white pointer-events-none drop-shadow-md");

    simulation.on("tick", () => {
      link.attr("x1", (d: any) => d.source.x).attr("y1", (d: any) => d.source.y).attr("x2", (d: any) => d.target.x).attr("y2", (d: any) => d.target.y);
      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [data, mode]);

  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-200">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <Share2 className={mode === 'amateur' ? 'text-emerald-600' : 'text-fuchsia-600'} /> 
            {mode === 'amateur' ? 'The Family Web' : 'Mutational Network'}
          </h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
            {mode === 'amateur' ? 'Tracing the connections between regional cousins' : 'Interconnected Phylogenetic Spanning Tree'}
          </p>
        </div>
        <div className="flex items-center gap-8">
           {trust && <DataTrustIndicator metrics={trust} label="Network Confidence" />}
           <button onClick={resetZoom} className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all shadow-sm">
             <RotateCcw size={16} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
        <div className="xl:col-span-3 bg-slate-950 rounded-[2.5rem] border-4 border-slate-900 overflow-hidden h-[550px] shadow-inner relative group">
          <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="w-full h-full cursor-move">
            <g ref={gRef}></g>
          </svg>
        </div>
        <div className="xl:col-span-1">
          <div className={`h-full p-8 rounded-[2.5rem] border-2 transition-all duration-300 ${hoveredNode ? 'border-fuchsia-400 bg-white shadow-xl' : 'border-dashed border-slate-200 bg-slate-50/50'}`}>
            {!hoveredNode ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-400">
                <Users size={32} className="mx-auto mb-4 opacity-10 animate-pulse" />
                <p className="text-[11px] font-black uppercase tracking-widest">Hover to Inspect</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-lg text-white font-mono font-black text-[10px] ${mode === 'amateur' ? 'bg-emerald-600' : 'bg-fuchsia-600'}`}>{hoveredNode.id}</span>
                  <p className="text-xs font-black text-slate-900">{(normalizeSim(hoveredNode.similarity) ?? 0).toFixed(1)}%</p>
                </div>
                <p className="font-black text-slate-900 text-xl leading-tight">{hoveredNode.region}</p>
                <div className="space-y-4">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Habitat Notes</p>
                    <p className="text-xs text-slate-600 leading-relaxed italic">{hoveredNode.substrate}</p>
                  </div>
                  <div className="p-5 bg-slate-900 rounded-2xl text-white shadow-lg">
                    <p className="text-[9px] font-black text-indigo-400 uppercase mb-2">Defining Property</p>
                    <p className="text-[11px] font-medium leading-relaxed">{hoveredNode.chemistry}</p>
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
