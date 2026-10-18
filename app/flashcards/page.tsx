"use client";

import { useState } from "react";

type Flashcard = {
  question: string;
  answer: string;
};

export default function FlashcardsPage() {
  const [studyMaterial, setStudyMaterial] = useState("");
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateFlashcards() {
    if (studyMaterial.trim().length < 20) {
      setError("Please enter at least 20 characters of study material.");
      return;
    }

    setLoading(true);
    setError("");
    setFlashcards([]);
    setCurrentIndex(0);
    setFlipped(false);

    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studyMaterial: studyMaterial.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate flashcards.");
      }

      if (!Array.isArray(data.flashcards) || data.flashcards.length === 0) {
        throw new Error("No flashcards received.");
      }

      setFlashcards(data.flashcards);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  function nextCard() {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex((previous) => previous + 1);
      setFlipped(false);
    }
  }

  function previousCard() {
    if (currentIndex > 0) {
      setCurrentIndex((previous) => previous - 1);
      setFlipped(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <header className="mb-10 text-center">
          <p className="mb-3 font-semibold tracking-widest text-cyan-400">
            STUDYSYNC AI
          </p>

          <h1 className="text-4xl font-bold sm:text-5xl">
            Smart Flashcards
          </h1>

          <p className="mt-4 text-slate-400">
            Turn your study material into interactive AI flashcards.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <label
            htmlFor="studyMaterial"
            className="mb-3 block font-semibold"
          >
            Enter your study material
          </label>

          <textarea
            id="studyMaterial"
            value={studyMaterial}
            onChange={(event) => setStudyMaterial(event.target.value)}
            placeholder="Paste your notes or study material here..."
            rows={6}
            disabled={loading}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none focus:border-cyan-400"
          />

          <p className="mt-2 text-sm text-slate-500">
            {studyMaterial.length} characters
          </p>

          <button
            onClick={generateFlashcards}
            disabled={loading}
            className="mt-4 w-full rounded-xl bg-cyan-500 px-6 py-3 font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
          >
            {loading ? "Generating Flashcards..." : "✨ Generate Flashcards"}
          </button>

          {error && (
            <p role="alert" className="mt-4 rounded-lg bg-red-500/10 p-3 text-red-300">
              {error}
            </p>
          )}
        </section>

        {flashcards.length > 0 && (
          <section className="mt-10">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold">Your Flashcards</h2>
              <span className="text-sm text-cyan-400">
                Card {currentIndex + 1} of {flashcards.length}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setFlipped((previous) => !previous)}
              className="flex min-h-64 w-full flex-col items-center justify-center rounded-2xl border border-cyan-500/40 bg-slate-900 p-8 text-center transition hover:border-cyan-400"
            >
              <span className="mb-5 text-xs font-bold uppercase tracking-widest text-cyan-400">
                {flipped ? "ANSWER" : "QUESTION"}
              </span>

              <p className="text-xl font-semibold leading-relaxed sm:text-2xl">
                {flipped
                  ? flashcards[currentIndex].answer
                  : flashcards[currentIndex].question}
              </p>

              <span className="mt-7 text-sm text-slate-400">
                Click to {flipped ? "show question" : "reveal answer"}
              </span>
            </button>

            <div className="mt-6 flex gap-4">
              <button
                onClick={previousCard}
                disabled={currentIndex === 0}
                className="flex-1 rounded-xl bg-slate-800 px-5 py-3 font-semibold hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Previous
              </button>

              <button
                onClick={nextCard}
                disabled={currentIndex === flashcards.length - 1}
                className="flex-1 rounded-xl bg-cyan-500 px-5 py-3 font-bold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>
            </div>

            <button
              onClick={() => {
                setCurrentIndex(0);
                setFlipped(false);
              }}
              className="mt-4 w-full rounded-xl border border-slate-700 px-5 py-3 font-semibold hover:bg-slate-800"
            >
              🔄 Restart Flashcards
            </button>
          </section>
        )}

        <footer className="mt-12 text-center text-sm text-slate-500">
          StudySync AI — Your Personal Study Companion
        </footer>
      </div>
    </main>
  );
}