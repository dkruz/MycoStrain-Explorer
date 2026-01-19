
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Haplotype } from '../types';
import { GitBranch, Share2, Activity, Zap } from 'lucide-react';

interface NetworkGraphProps {
  data: Haplotype[];
}

// Defining internal node structure for D3 simulation
interface SimulationNode extends Haplotype, d3.SimulationNodeDatum {}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<Haplotype | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    const width = 800;
    const height = 500;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g");
    // Cast nodes to SimulationNode to satisfy D3 and TS
    const nodes: SimulationNode[] = data.map(d => ({ ...d }));
    
    const links: any[] = [];
    nodes.forEach((node, idx) => {
      let parent = nodes.find(n => n.id === node.parentHaplotypeId);
      
      if ((!parent || parent.id === node.id) && idx > 0) {
        const previousNodes = nodes.slice(0, idx);
        parent = previousNodes.reduce((prev, curr) => 
          Math.abs(curr.similarity - node.similarity) < Math.abs(prev.similarity - node.similarity) ? curr : prev
        );
      }

      if (parent && parent.id !== node.id) {
        links.push({
          source: parent.id,
          target: node.id,
          value: Math.max(1, 10 - (node.similarity / 10))
        });
      }
    });

    const simulation = d3.forceSimulation<SimulationNode>(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-1200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(70))
      .force("x", d3.forceX(width / 2).strength(0.1))
      .force("y", d3.forceY(height / 2).strength(0.1));

    const link = g.append("g")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke-width", d => d.value)
      .attr("stroke-dasharray", "5,5");

    const node = g.append("g")
      .selectAll("g")
      .data(nodes)
      .enter().append("g")
      .attr("class", "node-group")
      .call(d3.drag<SVGGElement, SimulationNode>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    const sizeScale = d3.scaleLinear().domain([95, 100]).range([15, 30]).clamp(true);

    node.append("circle")
      .attr("r", d => sizeScale(d.similarity))
      .attr("fill", d => d3.interpolateViridis(d.similarity / 100))
      .attr("stroke", "#fff")
      .attr("stroke-width", 3)
      .style("filter", "drop-shadow(0 4px 6px rgba(0,0,0,0.1))")
      .style("cursor", "pointer")
      .on("mouseover", (event, d) => setHoveredNode(d))
      .on("mouseout", () => setHoveredNode(null));

    node.append("text")
      .text(d => d.id)
      .attr("dy", d => sizeScale(d.similarity) + 22)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("font-weight", "900")
      .attr("class", "uppercase tracking-widest fill-slate-700 select-none");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);
      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

  }, [data]);

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <Share2 className="text-fuchsia-600" />
            Genetic Mutation Network
          </h3>
          <p className="text-slate-500 text-sm mt-1">Modeling niche-driven mutational pathways.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div ref={containerRef} className="xl:col-span-3 relative bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-inner h-[550px] cursor-grab active:cursor-grabbing">
          <svg ref={svgRef} viewBox="0 0 800 500" className="w-full h-full"></svg>
        </div>

        <div className="xl:col-span-1">
          <div className={`h-full p-6 rounded-2xl border-2 transition-all duration-300 ${hoveredNode ? 'border-fuchsia-300 bg-fuchsia-50/20 shadow-lg' : 'border-dashed border-slate-200 bg-slate-50/50'}`}>
            {!hoveredNode ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-400">
                <GitBranch size={28} />
                <p className="text-xs font-black uppercase tracking-widest mt-4">Hover Node</p>
                <p className="text-[10px] mt-2 px-4">Observe substrate-specific drift patterns.</p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-fuchsia-600 text-white rounded-lg font-mono text-[11px] font-black">{hoveredNode.id}</span>
                </div>
                <h4 className="font-black text-slate-900 mb-1 text-lg leading-tight">{hoveredNode.region}</h4>
                <div className="space-y-4 mt-6">
                  <div className="p-3 bg-white rounded-xl border border-fuchsia-100 shadow-sm">
                    <p className="text-[9px] font-black text-fuchsia-500 uppercase tracking-widest mb-1">Substrate / Niche</p>
                    <p className="text-xs font-black text-slate-700">{hoveredNode.substrate}</p>
                  </div>
                  <div className="p-3 bg-slate-100/50 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Defining Markers</p>
                    <div className="flex flex-wrap gap-1.5">
                      {hoveredNode.snps.map((snp, i) => (
                        <span key={i} className="px-2 py-1 bg-white border border-slate-200 text-slate-700 rounded-md font-mono text-[9px] font-bold">
                          {snp}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Inferred Bio-Potential</p>
                    <p className="text-xs text-slate-600 leading-relaxed italic">{hoveredNode.chemistry}</p>
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
