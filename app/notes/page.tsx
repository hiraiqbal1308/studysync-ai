"use client";

import { useState } from "react";
import Link from "next/link";

export default function NotesPage() {
  const [material, setMaterial] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateNotes() {
    if (!material.trim() || loading) return;

    setLoading(true);
    setError("");
    setNotes("");

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ material }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate notes.");
      }

      setNotes(data.notes);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Notes generate nahi ho sake. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-4xl">

        <header className="mb-12 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-cyan-400">
            StudySync AI
          </Link>

          <Link href="/" className="text-sm text-slate-300">
            ← Home
          </Link>
        </header>

        <section className="text-center">
          <div className="text-5xl">📚</div>

          <h1 className="mt-4 text-4xl font-bold">
            AI Notes Generator
          </h1>

          <p className="mt-3 text-slate-400">
            Turn your study material into clear, organized notes.
          </p>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <label
            htmlFor="material"
            className="mb-3 block font-semibold"
          >
            Paste Your Study Material
          </label>

          <textarea
            id="material"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            placeholder="Paste your chapter, lecture, or study material here..."
            className="h-64 w-full resize-y rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none focus:border-cyan-500"
          />

          <button
            type="button"
            onClick={generateNotes}
            disabled={loading || !material.trim()}
            className="mt-5 rounded-xl bg-cyan-500 px-6 py-3 font-bold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Generating..." : "✨ Generate Notes"}
          </button>

          {error && (
            <p className="mt-4 text-red-400">
              {error}
            </p>
          )}

        </section>

        {notes && (
          <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <h2 className="mb-5 text-2xl font-bold text-cyan-400">
              Your Generated Notes
            </h2>

            <div className="whitespace-pre-wrap leading-8 text-slate-200">
              {notes}
            </div>

            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(notes)}
              className="mt-6 rounded-xl border border-cyan-500 px-5 py-2 text-cyan-400 hover:bg-slate-800"
            >
              📋 Copy Notes
            </button>

          </section>
        )}

      </div>
    </main>
  );
}