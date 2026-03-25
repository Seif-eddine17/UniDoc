import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";

import Login from "./pages/Login";

import Signup from "./pages/Signup";

import Contact from "./pages/Contact";

import Generate from "./pages/Generate";
 
export default function App() {

  return (
<div className="min-h-screen bg-slate-950 text-white">
<Routes>
<Route path="/" element={<Home />} />
<Route path="/signup" element={<Signup />} />
<Route path="/login" element={<Login />} />
<Route path="/contact" element={<Contact />} />
<Route path="/generate" element={<Generate />} />
</Routes>
</div>

  );

}
 