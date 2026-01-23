
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Haplotype } from '../types';
import { GitBranch, Share2, Bug, Target, Sparkles } from 'lucide-react';

interface SimulationNode extends Haplotype, d3.SimulationNodeDatum {}

export const NetworkGraph: React.FC<{ data: Haplotype[] }> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<Haplotype | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;
    const width = 800;
    const height = 500;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const g = svg.append("g");
    const nodes: SimulationNode[] = data.map(d => ({ ...d }));
    const links: any[] = [];
    nodes.forEach((node, idx) => {
      if (idx > 0) {
        const parent = nodes.slice(0, idx).reduce((prev, curr) => 
          Math.abs(curr.similarity - node.similarity) < Math.abs(prev.similarity - node.similarity) ? curr : prev
        );
        links.push({ source: parent.id, target: node.id, value: 2 });
      }
    });

    const simulation = d3.forceSimulation<SimulationNode>(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-800))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(60));

    const link = g.append("g").attr("stroke", "#e2e8f0").selectAll("line").data(links).enter().append("line").attr("stroke-width", 2).attr("stroke-dasharray", "4,4");
    const node = g.append("g").selectAll("g").data(nodes).enter().append("g")
      .call(d3.drag<SVGGElement, SimulationNode>()
        .on("start", (event, d) => { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on("end", (event, d) => { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }));

    node.append("circle").attr("r", 22).attr("fill", d => d3.interpolateViridis(d.similarity / 100)).attr("stroke", "#fff").attr("stroke-width", 3).style("cursor", "pointer")
      .on("mouseover", (event, d) => setHoveredNode(d)).on("mouseout", () => setHoveredNode(null));
    node.append("text").text(d => d.id).attr("dy", 35).attr("text-anchor", "middle").attr("font-size", "9px").attr("font-weight", "900").attr("class", "uppercase tracking-widest fill-slate-400");
    simulation.on("tick", () => {
      link.attr("x1", (d: any) => d.source.x).attr("y1", (d: any) => d.source.y).attr("x2", (d: any) => d.target.x).attr("y2", (d: any) => d.target.y);
      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });
  }, [data]);

  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-200">
      <div className="mb-8">
        <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
          <Share2 className="text-fuchsia-600" /> Niche-Driven Mutational Network
        </h3>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
        <div className="xl:col-span-3 bg-slate-50 rounded-[2.5rem] border border-slate-100 overflow-hidden h-[500px] shadow-inner">
          <svg ref={svgRef} viewBox="0 0 800 500" className="w-full h-full"></svg>
        </div>
        <div className="xl:col-span-1">
          <div className={`h-full p-8 rounded-[2rem] border-2 transition-all ${hoveredNode ? 'border-fuchsia-300 bg-fuchsia-50/20 shadow-xl' : 'border-dashed border-slate-200 bg-slate-50/50'}`}>
            {!hoveredNode ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-400">
                <GitBranch size={32} />
                <p className="text-xs font-black uppercase tracking-widest mt-4">Inspect Drift</p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-fuchsia-600 text-white rounded-lg font-mono text-[11px] font-black">{hoveredNode.id}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{hoveredNode.similarity}%</span>
                </div>
                <h4 className="font-black text-slate-900 text-lg leading-tight">{hoveredNode.region}</h4>
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-2xl border border-fuchsia-100 shadow-sm">
                    <p className="text-[9px] font-black text-fuchsia-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Bug size={10}/> Ecological Partner</p>
                    <p className="text-xs font-black text-slate-700">{hoveredNode.insectAssociations}</p>
                  </div>
                  <div className="pt-4 border-t border-fuchsia-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1"><Sparkles size={10}/> Chemistry</p>
                    <p className="text-[11px] text-slate-600 leading-relaxed italic">{hoveredNode.chemistry}</p>
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
