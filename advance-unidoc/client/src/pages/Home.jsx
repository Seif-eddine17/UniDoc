import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
 
export default function Home() {

  return (
<>
<Navbar />
 
      <main className="mx-auto flex max-w-6xl flex-col items-center px-6 py-20 text-center">
<span className="mb-4 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-sm text-cyan-300">

          Generate Your Internship Documents in Seconds
</span>
 
        <h2 className="max-w-3xl text-4xl font-extrabold leading-tight md:text-6xl">

          Create professional internship PDF documents with a simple workflow
</h2>
 
        <p className="mt-6 max-w-2xl text-lg text-slate-300">

          Advance UniDoc helps students generate internship request letters in a

          clean and professional PDF format.
</p>
 
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
<Link

            to="/generate"

            className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
>

            Get Started
</Link>
</div>
</main>
</>

  );

}
 