"use client";

import { useState } from "react";

type Question = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

export default function QuizPage() {
  const [studyMaterial, setStudyMaterial] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function generateQuiz() {
    if (studyMaterial.trim().length < 30) {
      setError("Please enter at least 30 characters of study material.");
      return;
    }

    setLoading(true);
    setError("");
    setQuestions([]);
    setAnswers({});
    setSubmitted(false);

    try {
      const response = await fetch("/api/quiz", {
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
        throw new Error(
          data.error || "Quiz generate nahi ho saka."
        );
      }

      if (!Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error("No questions received. Please try again.");
      }

      setQuestions(data.questions);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function submitQuiz() {
    if (Object.keys(answers).length !== questions.length) {
      setError("Please answer all questions first.");
      return;
    }

    setError("");
    setSubmitted(true);
  }

  const score = questions.reduce(
    (total, question, index) =>
      total + (answers[index] === question.correctAnswer ? 1 : 0),
    0
  );

  function retryQuiz() {
    setAnswers({});
    setSubmitted(false);
    setError("");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10 text-center">
          <p className="mb-3 font-semibold tracking-widest text-cyan-400">
            STUDYSYNC AI
          </p>

          <h1 className="text-4xl font-bold sm:text-5xl">
            Smart Quiz Maker
          </h1>

          <p className="mt-4 text-slate-400">
            Generate AI-powered quizzes from your study material.
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
            placeholder="Paste your notes or study material here (at least 30 characters)..."
            rows={7}
            disabled={loading}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none focus:border-cyan-400 disabled:opacity-60"
          />

          <p className="mt-2 text-sm text-slate-500">
            {studyMaterial.length} characters
          </p>

          <button
            onClick={generateQuiz}
            disabled={loading}
            className="mt-4 w-full rounded-xl bg-cyan-500 px-6 py-3 font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
          >
            {loading ? "Generating Quiz..." : "✨ Generate Quiz"}
          </button>

          {error && (
            <p className="mt-4 rounded-lg bg-red-500/10 p-3 text-red-300">
              {error}
            </p>
          )}
        </section>

        {questions.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-6 text-2xl font-bold">
              Your Quiz
            </h2>

            {submitted && (
              <div className="mb-6 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-6 text-center">
                <h3 className="text-xl font-bold">Your Final Score</h3>

                <p className="mt-3 text-4xl font-extrabold text-cyan-400">
                  {score} / {questions.length}
                </p>

                <p className="mt-2 text-slate-300">
                  {score === questions.length
                    ? "Excellent! All answers are correct! 🎉"
                    : "Good effort! Review the correct answers below."}
                </p>

                <button
                  onClick={retryQuiz}
                  className="mt-5 rounded-xl bg-cyan-500 px-5 py-3 font-bold text-slate-950 hover:bg-cyan-400"
                >
                  Retry Quiz
                </button>
              </div>
            )}

            <div className="space-y-6">
              {questions.map((question, index) => (
                <article
                  key={index}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                >
                  <h3 className="mb-5 text-lg font-bold">
                    <span className="mr-2 text-cyan-400">
                      Q{index + 1}.
                    </span>
                    {question.question}
                  </h3>

                  <div className="space-y-3">
                    {question.options.map((option, optionIndex) => {
                      const selected = answers[index] === optionIndex;
                      const correct =
                        question.correctAnswer === optionIndex;

                      let style =
                        "border-slate-700 bg-slate-950 hover:border-cyan-400";

                      if (selected && !submitted) {
                        style = "border-cyan-400 bg-cyan-500/10";
                      }

                      if (submitted && correct) {
                        style = "border-green-500 bg-green-500/10";
                      } else if (submitted && selected && !correct) {
                        style = "border-red-500 bg-red-500/10";
                      }

                      return (
                        <button
                          key={optionIndex}
                          type="button"
                          disabled={submitted}
                          onClick={() =>
                            setAnswers((previous) => ({
                              ...previous,
                              [index]: optionIndex,
                            }))
                          }
                          className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left ${style}`}
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 font-bold">
                            {String.fromCharCode(65 + optionIndex)}
                          </span>

                          <span className="flex-1">{option}</span>

                          {submitted && correct && (
                            <span className="text-green-400">✓</span>
                          )}

                          {submitted && selected && !correct && (
                            <span className="text-red-400">✕</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {submitted && (
                    <div className="mt-4 rounded-xl bg-slate-800 p-4">
                      <p className="mb-1 font-semibold text-cyan-400">
                        Explanation
                      </p>
                      <p className="text-sm leading-relaxed text-slate-300">
                        {question.explanation}
                      </p>
                    </div>
                  )}
                </article>
              ))}
            </div>

            {!submitted && (
              <button
                onClick={submitQuiz}
                className="mt-6 w-full rounded-xl bg-green-500 px-6 py-4 font-bold text-slate-950 hover:bg-green-400"
              >
                Submit Quiz
              </button>
            )}
          </section>
        )}

        <footer className="mt-12 text-center text-sm text-slate-500">
          StudySync AI — Your Personal Study Companion ❤️
        </footer>
      </div>
    </main>
  );
}