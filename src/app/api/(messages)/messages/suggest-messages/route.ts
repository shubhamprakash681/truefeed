import { StatusCodes } from "http-status-codes";
import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { error } from "console";

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const dynamic = "force-dynamic";

export const GET = async (req: Request) => {
  try {
    const prompt = `Create a list of three open-ended and engaging questions formatted as a single string.
      Each question should be separated by '||'.
      These questions are for an anonymous social messaging platform, like qooh.me, and should be suitable for a diverse audience.
      Avoid personal or sensitive topics, focus instead on universal themes that encourages friendly interactions.
      For example, your output should be structured like this: 'What's a hobby you've recently started? || If you could have dinner with any historical figure, who would it be? || What's a simple thing that makes you happy?'.
      Ensure that questions are intriguing, foster curiosity, and contribute a positive and welcoming conversational environment.`;

    // Ask OpenAI for a streaming chat completion given the prompt
    const response = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      max_tokens: 400,
      stream: true,
      prompt,
    });

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response);
    // Respond with the stream
    return new StreamingTextResponse(stream);
  } catch (err) {
    console.error("Error suggesting Messages", err);

    if (err instanceof OpenAI.APIError) {
      const { name, status, headers, message } = err;

      return Response.json(
        {
          success: false,
          message,
          name,
          headers,
          status,
        },
        { status }
      );
    }

    return Response.json(
      {
        success: false,
        message: "Error suggesting Message",
      },
      {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      }
    );
  }
};
