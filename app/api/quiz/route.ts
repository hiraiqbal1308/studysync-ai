import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { studyMaterial } = await request.json();

   if (
  typeof studyMaterial !== "string" ||
  !studyMaterial.trim()
) {
  return NextResponse.json(
    { error: "Please enter a subject, topic, or study material." },
    { status: 400 }
  );
}

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: `You are an educational quiz generator.
Generate exactly 5 multiple-choice questions based on the user's input.
The input may be a subject name, a short topic, or detailed study material.
If only a topic is provided, use your educational knowledge to create relevant questions.
Each question must have exactly 4 options.
Return ONLY valid JSON in this format:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Short explanation"
    }
  ]
}
correctAnswer must be a number from 0 to 3 representing the correct option's index.
Ensure all questions are accurate, educational, and relevant to the user's chosen subject or topic.`,
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
      !Array.isArray(result.questions) ||
      result.questions.length === 0
    ) {
      throw new Error("Invalid quiz format.");
    }

    for (const question of result.questions) {
      if (
        typeof question.question !== "string" ||
        !Array.isArray(question.options) ||
        question.options.length !== 4 ||
        !question.options.every(
          (option: unknown) => typeof option === "string"
        ) ||
        !Number.isInteger(question.correctAnswer) ||
        question.correctAnswer < 0 ||
        question.correctAnswer > 3 ||
        typeof question.explanation !== "string"
      ) {
        throw new Error("AI generated an invalid quiz.");
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Quiz API error:", error);

    return NextResponse.json(
      { error: "Quiz generate nahi ho saka. Please try again." },
      { status: 500 }
    );
  }
}