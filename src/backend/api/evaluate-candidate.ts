import OpenAI from "openai";
import { CandidateDocument } from "../../frontend/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function evaluateCandidate(
  documents: CandidateDocument[],
  jobDescription: string
) {
  const prompt = `Evaluate the following candidate based on their documents and the job description.
  Job Description: ${jobDescription}
  
  Candidate Documents:
  ${documents.map((doc) => `${doc.type}: ${doc.content}`).join("\n\n")}
  
  Provide a score from 1-100 and a detailed evaluation.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content:
          "You are an expert recruiter evaluating candidates. Provide a score from 1-100 and a detailed evaluation.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  // Parse the response to extract score and evaluation
  const response = completion.choices[0].message?.content;
  // Add logic to parse the response and extract score and evaluation

  return {
    score: 85, // Example score
    summary: response,
  };
}
