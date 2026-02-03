import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Haplotype } from '../types';
import { GitBranch, Share2, Bug, Target, Sparkles, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface SimulationNode extends Haplotype {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
  index?: number;
}

export const NetworkGraph: React.FC<{ data: Haplotype[] }> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<any>(null);
  const [hoveredNode, setHoveredNode] = useState<Haplotype | null>(null);

  const width = 800;
  const height = 600;

  const handleZoom = (type: 'in' | 'out' | 'reset') => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = (d3 as any).select(svgRef.current);
    if (type === 'reset') {
      svg.transition().duration(750).call(zoomRef.current.transform, (d3 as any).zoomIdentity);
    } else {
      svg.transition().duration(300).call(zoomRef.current.scaleBy, type === 'in' ? 1.5 : 0.6);
    }
  };

  useEffect(() => {
    if (!svgRef.current || !gRef.current || !data || data.length === 0) return;

    const svg = (d3 as any).select(svgRef.current);
    const g = (d3 as any).select(gRef.current);
    g.selectAll("*").remove();

    // Zoom setup
    const zoomBehavior = (d3 as any).zoom()
      .scaleExtent([0.2, 5])
      .on("zoom", (event: any) => {
        g.attr("transform", event.transform);
      });
    
    svg.call(zoomBehavior);
    zoomRef.current = zoomBehavior;

    const nodes: SimulationNode[] = data.map(d => ({ ...d }));
    const links: any[] = [];

    // Create a minimum spanning tree based on similarity to ensure connectivity
    nodes.forEach((node, idx) => {
      if (idx > 0) {
        const parent = nodes.slice(0, idx).reduce((prev, curr) => 
          Math.abs(curr.similarity - node.similarity) < Math.abs(prev.similarity - node.similarity) ? curr : prev
        );
        links.push({ source: parent.id, target: node.id });
      }
    });

    const simulation = (d3 as any).forceSimulation(nodes)
      .force("link", (d3 as any).forceLink(links).id((d: any) => d.id).distance(100))
      .force("charge", (d3 as any).forceManyBody().strength(-400)) // Reduced strength to keep them on screen
      .force("center", (d3 as any).forceCenter(width / 2, height / 2))
      .force("collision", (d3 as any).forceCollide().radius(45)); // Tighter collision for 12 nodes

    const linkLayer = g.append("g").attr("class", "links");
    const nodeLayer = g.append("g").attr("class", "nodes");

    const link = linkLayer.selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "#cbd5e1")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "4,4")
      .attr("opacity", 0.6);

    const node = nodeLayer.selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .style("cursor", "grab")
      .call((d3 as any).drag()
        .on("start", (event: any, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
          (d3 as any).select(event.sourceEvent.target.parentNode).style("cursor", "grabbing");
        })
        .on("drag", (event: any, d: any) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event: any, d: any) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
          (d3 as any).select(event.sourceEvent.target.parentNode).style("cursor", "grab");
        }));

    // Node Glow/Shadow
    node.append("circle")
      .attr("r", 28)
      .attr("fill", "white")
      .attr("filter", "drop-shadow(0 4px 6px rgba(0,0,0,0.1))");

    // Main Circle
    node.append("circle")
      .attr("r", 24)
      .attr("fill", (d: any) => (d3 as any).interpolateViridis(d.similarity / 100))
      .attr("stroke", "#fff")
      .attr("stroke-width", 3)
      .on("mouseover", (event: any, d: any) => {
        setHoveredNode(d);
        (d3 as any).select(event.currentTarget).transition().attr("r", 30);
      })
      .on("mouseout", (event: any) => {
        setHoveredNode(null);
        (d3 as any).select(event.currentTarget).transition().attr("r", 24);
      });

    // ID Text
    node.append("text")
      .text((d: any) => d.id)
      .attr("dy", 42)
      .attr("text-anchor", "middle")
      .attr("class", "text-[10px] font-black fill-slate-900 uppercase tracking-tighter pointer-events-none");

    // Similarity %
    node.append("text")
      .text((d: any) => `${d.similarity}%`)
      .attr("dy", 4)
      .attr("text-anchor", "middle")
      .attr("class", "text-[8px] font-black fill-white opacity-80 pointer-events-none");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    // Cleanup simulation on unmount
    return () => simulation.stop();
  }, [data]);

  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-200">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <Share2 className="text-fuchsia-600" /> Niche-Driven Mutational Network
          </h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Interconnected Phylogenetic Graph — 12 Haplotypes</p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => handleZoom('in')} className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors" title="Zoom In"><ZoomIn size={18}/></button>
           <button onClick={() => handleZoom('out')} className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors" title="Zoom Out"><ZoomOut size={18}/></button>
           <button onClick={() => handleZoom('reset')} className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors" title="Reset View"><RotateCcw size={18}/></button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
        <div className="xl:col-span-3 bg-slate-50 rounded-[2.5rem] border border-slate-100 overflow-hidden h-[600px] shadow-inner relative group">
          <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="w-full h-full cursor-move">
            <g ref={gRef}></g>
          </svg>
          <div className="absolute top-6 left-6 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="px-4 py-2 bg-white/80 backdrop-blur rounded-full text-[10px] font-black text-slate-400 border border-slate-200 shadow-sm uppercase tracking-widest">
              Drag nodes or use mouse wheel to explore
            </div>
          </div>
        </div>

        <div className="xl:col-span-1">
          <div className={`h-full p-8 rounded-[2rem] border-2 transition-all duration-500 ${hoveredNode ? 'border-fuchsia-300 bg-fuchsia-50/20 shadow-xl' : 'border-dashed border-slate-200 bg-slate-50/50'}`}>
            {!hoveredNode ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-400">
                <GitBranch size={40} className="mb-4 opacity-20" />
                <p className="text-xs font-black uppercase tracking-widest">Select a node to inspect</p>
                <p className="text-[10px] mt-4 leading-relaxed opacity-60">Hover over any of the 12 haplotypes to view specialized regional traits and chemistry markers.</p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-fuchsia-600 text-white rounded-lg font-mono text-[11px] font-black shadow-md">{hoveredNode.id}</span>
                  <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-fuchsia-500" style={{ width: `${hoveredNode.similarity}%` }}></div>
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{hoveredNode.similarity}%</span>
                </div>
                
                <h4 className="font-black text-slate-900 text-xl leading-tight tracking-tight">{hoveredNode.region}</h4>
                
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-2xl border border-fuchsia-100 shadow-sm group">
                    <p className="text-[9px] font-black text-fuchsia-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <Bug size={12} className="group-hover:rotate-12 transition-transform"/> Ecological Partner
                    </p>
                    <p className="text-xs font-bold text-slate-700 leading-relaxed italic">{hoveredNode.insectAssociations}</p>
                  </div>
                  
                  <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <Target size={12}/> Host Strategy
                    </p>
                    <p className="text-xs font-semibold text-slate-600 leading-relaxed">{hoveredNode.substrate}</p>
                  </div>

                  <div className="pt-4 border-t border-fuchsia-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-2 flex items-center gap-1">
                      <Sparkles size={12} className="text-amber-400"/> Metamorphotic Chemistry
                    </p>
                    <p className="text-[11px] text-slate-600 leading-relaxed italic font-medium">{hoveredNode.chemistry}</p>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between text-[9px] font-mono text-slate-400">
                   <span>DIV: {hoveredNode.divergenceTime} MYA</span>
                   <span>LAT: {hoveredNode.lat.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
