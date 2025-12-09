import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import ChatInput from './components/ChatInput';
import MessageBubble from './components/MessageBubble';
import { Message, Role } from './types';
import { streamSpeciesAnalysis } from './services/geminiService';
import { Leaf, Camera } from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string, image?: string) => {
    // 1. Create User Message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text: text,
      imageData: image,
      timestamp: Date.now(),
    };

    // 2. Add User Message to State
    const currentHistory = [...messages, userMessage];
    setMessages(currentHistory);
    setIsLoading(true);

    try {
      // 3. Create Placeholder Bot Message
      const botMessageId = (Date.now() + 1).toString();
      const botMessage: Message = {
        id: botMessageId,
        role: Role.MODEL,
        text: '',
        isStreaming: true,
        timestamp: Date.now(),
      };
      
      setMessages((prev) => [...prev, botMessage]);

      // 4. Stream Response
      // We pass the *previous* messages as history, and the current input separately
      // The service reconstructs the full context.
      const stream = streamSpeciesAnalysis(messages, text, image);
      
      let fullResponse = '';

      for await (const chunk of stream) {
        fullResponse += chunk;
        
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === botMessageId 
              ? { ...msg, text: fullResponse } 
              : msg
          )
        );
      }

      // 5. Finalize Bot Message
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === botMessageId 
            ? { ...msg, isStreaming: false } 
            : msg
        )
      );

    } catch (error) {
      console.error("Failed to generate response", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0f172a] text-slate-200 font-sans">
      <Header />

      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-3xl mx-auto px-4 py-8">
          
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 opacity-0 animate-in fade-in duration-700">
              <div className="relative">
                <div className="absolute inset-0 bg-nature-500 blur-3xl opacity-20 rounded-full"></div>
                <div className="relative bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-2xl">
                   <Camera className="w-16 h-16 text-nature-400 mx-auto mb-2" />
                   <div className="absolute -bottom-2 -right-2 bg-nature-600 text-white p-2 rounded-full border-4 border-slate-900">
                     <Leaf size={16} />
                   </div>
                </div>
              </div>
              
              <div className="space-y-2 max-w-md">
                <h2 className="text-2xl font-bold text-white">瞬間辨識大自然物種</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  上傳植物、動物或昆蟲的照片，我將為您辨識並提供有趣的知識。
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full max-w-xs text-xs text-slate-500">
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 flex items-center justify-center gap-2">
                  <span>🌿</span> 植物
                </div>
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 flex items-center justify-center gap-2">
                  <span>🦁</span> 動物
                </div>
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 flex items-center justify-center gap-2">
                  <span>🍄</span> 真菌
                </div>
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 flex items-center justify-center gap-2">
                  <span>🐞</span> 昆蟲
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 pb-4">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default App;
