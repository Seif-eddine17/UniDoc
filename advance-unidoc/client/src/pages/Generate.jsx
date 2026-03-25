import { useState } from "react";
import Navbar from "../components/Navbar";
import { API_BASE_URL } from "../config";

export default function Generate() {
  const [form, setForm] = useState({
    fullName: "",
    studentId: "",
    department: "",
    company: "",
    date: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage(data.message || "Please login first.");
        setLoading(false);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Internship-${form.fullName}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setMessage("PDF generated successfully.");
    } catch {
      setMessage("Cannot connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-lg">
          <h2 className="text-3xl font-bold">Generate Internship PDF</h2>
          <p className="mt-2 text-slate-300">
            Fill in your information to generate your internship request letter.
          </p>

          <form onSubmit={handleGenerate} className="mt-8 space-y-4">
            <input
              name="fullName"
              placeholder="Full Name"
              value={form.fullName}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
            />
            <input
              name="studentId"
              placeholder="Student ID"
              value={form.studentId}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
            />
            <input
              name="department"
              placeholder="Department"
              value={form.department}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
            />
            <input
              name="company"
              placeholder="Company Name"
              value={form.company}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
            />
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
            >
              {loading ? "Generating..." : "Generate PDF"}
            </button>
          </form>

          {message && <p className="mt-4 text-sm text-cyan-300">{message}</p>}
        </div>
      </div>
    </>
  );
}