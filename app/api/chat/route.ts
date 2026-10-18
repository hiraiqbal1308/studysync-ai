import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return Response.json(
        { error: "Please enter a question." },
        { status: 400 }
      );
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are StudySync AI, a friendly study tutor. Explain concepts in simple language, help students understand their subjects, and use examples when helpful. Keep answers clear and educational.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      model: "openai/gpt-oss-20b",
      temperature: 0.7,
      max_tokens: 700,
    });

    const reply =
      completion.choices[0]?.message?.content ??
      "Sorry, I could not generate an answer.";

    return Response.json({ reply });
  } catch (error) {
    console.error("Groq API error:", error);

    return Response.json(
      { error: "AI response failed. Please check your API configuration." },
      { status: 500 }
    );
  }
}