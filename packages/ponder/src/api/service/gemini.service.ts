
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

interface TextPayload {
  text: string;
}

export const geminiService = async (text: string) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `apakah server berjalan normal berdasarkan data ini ${text}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const geminiResponse = response.text();
  return geminiResponse;
};