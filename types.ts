export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  imageData?: string; // Base64 string of the image
  isStreaming?: boolean;
  timestamp: number;
}

export interface GeminiConfig {
  systemInstruction?: string;
  temperature?: number;
}
