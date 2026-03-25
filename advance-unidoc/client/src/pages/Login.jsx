import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { API_BASE_URL } from "../config";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        navigate("/generate");
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch {
      setMessage("Cannot connect to server. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl">
          <h2 className="mb-2 text-3xl font-bold">Login</h2>
          <p className="mb-6 text-sm text-slate-300">
            Access your account to create internship documents.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {message && <p className="mt-4 text-sm text-red-400">{message}</p>}

          <p className="mt-6 text-sm text-slate-300">
            No account yet?{" "}
            <Link to="/signup" className="text-cyan-300 hover:text-cyan-200">
              Register
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}