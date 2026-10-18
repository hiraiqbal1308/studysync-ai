import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { material } = await request.json();

    if (!material || typeof material !== "string" || !material.trim()) {
      return Response.json(
        { error: "Please enter your study material." },
        { status: 400 }
      );
    }

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content:
            "You are StudySync AI Notes Generator. Convert the provided study material into clear, well-organized study notes. Use headings, bullet points, key definitions, and short explanations. Preserve important facts and do not invent information.",
        },
        {
          role: "user",
          content: material,
        },
      ],
      max_tokens: 1500,
    });

    const notes =
      completion.choices[0]?.message?.content ??
      "Unable to generate notes.";

    return Response.json({ notes });
  } catch (error) {
    console.error("Notes API error:", error);

    return Response.json(
      { error: "Failed to generate notes. Please try again." },
      { status: 500 }
    );
  }
}