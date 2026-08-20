import { NextRequest, NextResponse } from "next/server";
import { ScheduleInput } from "@/lib/types";
import { generateMockPacingGuide } from "@/lib/mockPacingGuide";

// Uncomment and configure to use real OpenAI via Vercel AI SDK:
//
// import OpenAI from "openai";
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
//
// async function generateWithAI(input: ScheduleInput) {
//   const prompt = buildPrompt(input);
//   const completion = await openai.chat.completions.create({
//     model: "gpt-4o-mini",
//     messages: [
//       {
//         role: "system",
//         content:
//           "You are an expert homeschool curriculum planner. Given the user's grade levels, curricula, and schedule constraints, generate a detailed weekly pacing guide in JSON format.",
//       },
//       { role: "user", content: prompt },
//     ],
//     response_format: { type: "json_object" },
//   });
//   return JSON.parse(completion.choices[0].message.content ?? "{}");
// }

export async function POST(req: NextRequest) {
  try {
    const body: ScheduleInput = await req.json();

    // Validate required fields
    if (
      !body.children?.length ||
      !body.startDate ||
      !body.endDate ||
      !body.schoolDaysPerWeek ||
      !body.dailyHours
    ) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Use mock generator (swap for generateWithAI(body) once OPENAI_API_KEY is set)
    const pacingGuide = generateMockPacingGuide(body);

    // Simulate a short AI processing delay for UX realism
    await new Promise((r) => setTimeout(r, 800));

    return NextResponse.json(pacingGuide);
  } catch (err) {
    console.error("[generate-schedule]", err);
    return NextResponse.json(
      { error: "Failed to generate schedule." },
      { status: 500 }
    );
  }
}
