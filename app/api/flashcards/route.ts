import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

type Flashcard = {
  question: string;
  answer: string;
};

export async function POST(request: Request) {
  try {
    const { studyMaterial } = await request.json();

    if (
      typeof studyMaterial !== "string" ||
      studyMaterial.trim().length < 20
    ) {
      return NextResponse.json(
        { error: "Please enter at least 20 characters of study material." },
        { status: 400 }
      );
    }

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: `You are StudySync AI, an educational flashcard generator.

Generate exactly 6 useful flashcards from the supplied study material.

Return ONLY valid JSON in this exact format:

{
  "flashcards": [
    {
      "question": "What is ...?",
      "answer": "Clear and simple answer."
    }
  ]
}

Rules:
- Each flashcard must contain one question and one answer.
- Answers should be short, accurate, and easy to understand.
- Do not include Markdown formatting.
- Do not include any text outside the JSON.
- Base all flashcards on the supplied study material.`,
        },
        {
          role: "user",
          content: studyMaterial.trim(),
        },
      ],
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("AI returned an empty response.");
    }

    const cleanedContent = content
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const result = JSON.parse(cleanedContent);

    if (
      !Array.isArray(result.flashcards) ||
      result.flashcards.length === 0
    ) {
      throw new Error("Invalid flashcards format.");
    }

    const flashcards: Flashcard[] = result.flashcards;

    for (const card of flashcards) {
      if (
        typeof card.question !== "string" ||
        typeof card.answer !== "string" ||
        !card.question.trim() ||
        !card.answer.trim()
      ) {
        throw new Error("Invalid flashcard data.");
      }
    }

    return NextResponse.json({ flashcards });
  } catch (error) {
    console.error("Flashcards API error:", error);

    return NextResponse.json(
      { error: "Flashcards generate nahi ho sake. Please try again." },
      { status: 500 }
    );
  }
}