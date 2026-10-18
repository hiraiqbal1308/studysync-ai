"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function TutorPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const question = message.trim();

    if (!question || loading) return;

    setMessages((previous) => [
      ...previous,
      { role: "user", content: question },
    ]);

    setMessage("");
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: question }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setMessages((previous) => [
        ...previous,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setError(
        "AI se connection nahi ho saka. Please dobara try karo."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-bold text-cyan-400"
          >
            StudySync AI
          </Link>

          <Link
            href="/"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
          >
            ← Home
          </Link>
        </header>

        <section className="mb-8 text-center">
          <div className="mb-4 text-5xl">🎓</div>

          <h1 className="text-3xl font-bold sm:text-4xl">
            AI Study Tutor
          </h1>

          <p className="mt-3 text-slate-400">
            Ask questions, understand concepts, and learn at your own pace.
          </p>
        </section>

        <section className="flex min-h-[420px] flex-col rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6">
          <div className="mb-4 flex-1 space-y-4">
            {messages.length === 0 && (
              <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                <div className="mb-3 text-4xl">💡</div>

                <h2 className="text-xl font-semibold">
                  What would you like to learn?
                </h2>

                <p className="mt-2 max-w-md text-sm text-slate-400">
                  Ask me about programming, mathematics, science,
                  or any topic you want to understand.
                </p>
              </div>
            )}

            {messages.map((item, index) => (
              <div
                key={index}
                className={`flex ${
                  item.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[80%] ${
                    item.role === "user"
                      ? "bg-cyan-600 text-white"
                      : "border border-slate-700 bg-slate-800 text-slate-100"
                  }`}
                >
                  {item.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="text-sm text-cyan-400">
                StudySync AI is thinking...
              </div>
            )}
          </div>

          {error && (
            <p className="mb-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <form
            onSubmit={sendMessage}
            className="flex gap-2 border-t border-slate-800 pt-4"
          >
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask your study question..."
              aria-label="Your study question"
              disabled={loading}
              className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-cyan-500 disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "..." : "Send"}
            </button>
          </form>
        </section>

        <p className="mt-4 text-center text-xs text-slate-500">
          StudySync AI can make mistakes. Verify important information.
        </p>
      </div>
    </main>
  );
}