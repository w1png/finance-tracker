import { OpenAI } from "openai";
import { env } from "~/env";

const globalForOpenAi = globalThis as unknown as {
  openAiClient: OpenAI | undefined;
};

export const ai =
  globalForOpenAi.openAiClient ??
  new OpenAI({
    apiKey: env.OPENAI_API_KEY,
  });
