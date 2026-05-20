import { Link } from "react-router-dom";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 font-display text-xl font-bold ${className}`}>
      <span className="grid h-9 w-9 place-items-center rounded-2xl gradient-rose text-primary-foreground shadow-soft">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-4.5-7-11a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 6.5-7 11-7 11z" />
        </svg>
      </span>
      <span>
        <span className="text-gradient">Brow</span>
        <span className="text-foreground">sion</span>
      </span>
    </Link>
  );
}
