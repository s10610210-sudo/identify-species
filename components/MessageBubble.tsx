import React from 'react';
import { Message, Role } from '../types';
import { User, Bot, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-indigo-600' : 'bg-nature-600'}`}>
          {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
        </div>

        {/* Content Bubble */}
        <div className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
          
          {/* Image Attachment */}
          {message.imageData && (
            <div className="rounded-xl overflow-hidden border-2 border-slate-700 max-w-[200px] md:max-w-[300px]">
              <img 
                src={message.imageData} 
                alt="Uploaded by user" 
                className="w-full h-auto object-cover" 
              />
            </div>
          )}

          {/* Text Content */}
          <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed overflow-hidden ${
            isUser 
              ? 'bg-indigo-600 text-white rounded-tr-none' 
              : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
          }`}>
            {message.text ? (
              <div className="markdown-content">
                <ReactMarkdown 
                  components={{
                    // Style basic markdown elements
                    strong: ({node, ...props}) => <span className="font-bold text-nature-400" {...props} />,
                    em: ({node, ...props}) => <span className="italic text-slate-300" {...props} />,
                    p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                  }}
                >
                  {message.text}
                </ReactMarkdown>
              </div>
            ) : (
              // Empty text usually implies waiting for stream or just image upload
              <span className="italic text-slate-400">傳送了一張圖片</span>
            )}
            
            {message.isStreaming && (
              <span className="inline-block ml-2 animate-pulse">▍</span>
            )}
          </div>
          
          <span className="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity px-1">
             {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
