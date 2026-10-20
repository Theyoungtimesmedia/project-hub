import { BarChart3, CircleDollarSign, Search, ShoppingBag } from "lucide-react";
import type { Project } from "@/lib/mock-data";

export function ProjectPreview({ tone }: { tone: Project["tone"] }) {
  if (tone === "violet") return (
    <div className="mini-page mini-violet">
      <div className="mini-nav"><span className="mini-logo">ATELIER</span><Search size={9} /></div>
      <div className="mini-fashion"><div><small>NEW COLLECTION</small><b>Quiet form,<br/>lasting objects.</b></div><ShoppingBag size={15}/></div>
    </div>
  );
  if (tone === "blue") return (
    <div className="mini-page mini-blue">
      <div className="mini-nav"><span className="mini-logo">NORTHSTAR</span><span>Overview</span></div>
      <div className="mini-dashboard"><aside/><main><small>Pipeline value</small><b>$284,900</b><div className="mini-bars"><i/><i/><i/><i/><i/></div></main></div>
    </div>
  );
  if (tone === "mint") return (
    <div className="mini-page mini-mint">
      <div className="mini-nav"><span className="mini-logo">SIGNAL</span><span>•••</span></div>
      <div className="mini-notes"><small>RESEARCH  /  04</small><b>The shape of<br/>better questions</b><p>Notes on craft, focus, and the work worth keeping.</p></div>
    </div>
  );
  return (
    <div className="mini-page mini-coral">
      <div className="mini-nav"><span className="mini-logo">ORBIT</span><CircleDollarSign size={10}/></div>
      <div className="mini-dashboard"><aside/><main><small>Net worth</small><b>$128,460</b><div className="mini-chart"><BarChart3 size={30}/></div></main></div>
    </div>
  );
}