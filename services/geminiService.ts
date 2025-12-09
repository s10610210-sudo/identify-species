import { GoogleGenAI, Content, Part } from "@google/genai";
import { Message, Role } from "../types";
import { GEMINI_MODEL, SYSTEM_INSTRUCTION } from "../constants";

// Initialize the client
// NOTE: We assume process.env.API_KEY is available in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Converts internal Message format to Gemini API Content format
 */
const mapMessagesToContent = (messages: Message[]): Content[] => {
  return messages.map((msg) => {
    const parts: Part[] = [];

    // If there is an image, add it as a part
    if (msg.imageData) {
      // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
      const base64Data = msg.imageData.split(',')[1] || msg.imageData;
      const mimeTypeMatch = msg.imageData.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';

      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      });
    }

    // Add text part
    if (msg.text) {
      parts.push({ text: msg.text });
    }

    return {
      role: msg.role === Role.USER ? 'user' : 'model',
      parts: parts,
    };
  });
};

/**
 * Streams a chat response from Gemini, handling multimodal input (text + images)
 */
export const streamSpeciesAnalysis = async function* (
  history: Message[],
  newMessageText: string,
  newMessageImage?: string
): AsyncGenerator<string, void, unknown> {
  
  // Construct the full history including the new message for the API call context
  // We don't rely on 'chat.sendMessage' because we want stateless control over multimodal history
  const historyContent = mapMessagesToContent(history);

  const newParts: Part[] = [{ text: newMessageText }];

  if (newMessageImage) {
    const base64Data = newMessageImage.split(',')[1] || newMessageImage;
    const mimeTypeMatch = newMessageImage.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
    
    // Prepend image to the parts (convention often puts image before text prompt)
    newParts.unshift({
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    });
  }

  const currentTurn: Content = {
    role: 'user',
    parts: newParts
  };

  const contents = [...historyContent, currentTurn];

  try {
    const responseStream = await ai.models.generateContentStream({
      model: GEMINI_MODEL,
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.5, // Lower temperature for more accurate identification
      }
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        yield text;
      }
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    yield "I'm sorry, I encountered an error while analyzing the image. Please check your connection or try again.";
  }
};
