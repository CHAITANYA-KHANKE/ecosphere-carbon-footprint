import { Leaf } from "lucide-react";
import { Link } from "react-router-dom";

export default function Logo({ compact = false }) {
  return (
    <Link to="/" className="flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-eco-300 to-cyan-400 text-ink shadow-glow">
        <Leaf size={21} strokeWidth={2.5} />
      </span>
      {!compact && <span className="font-display text-lg font-extrabold tracking-tight">EcoTrack <span className="text-eco-500">AI</span></span>}
    </Link>
  );
}
