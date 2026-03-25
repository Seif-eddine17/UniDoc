import { Link } from "react-router-dom";
 
export default function Navbar() {

  return (
<header className="border-b border-white/10 bg-slate-900/80 backdrop-blur">
<div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
<Link to="/" className="text-2xl font-bold tracking-tight">

          Advance UniDoc
</Link>
 
        <nav className="hidden gap-6 text-sm text-slate-300 md:flex">
<Link to="/" className="transition hover:text-white">

            HOME
</Link>
<Link to="/signup" className="transition hover:text-white">

            SIGNUP
</Link>
<Link to="/login" className="transition hover:text-white">

            LOGIN
</Link>
<Link to="/contact" className="transition hover:text-white">

            CONTACT
</Link>
</nav>
</div>
</header>

  );

}
 