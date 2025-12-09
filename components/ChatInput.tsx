import React, { useState, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { Send, Image as ImageIcon, X, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string, image?: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("圖片太大。請選擇小於 5MB 的圖片。");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = () => {
    if ((!inputText.trim() && !selectedImage) || isLoading) return;

    onSendMessage(inputText, selectedImage || undefined);
    
    // Reset state
    setInputText('');
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 bg-slate-900 border-t border-slate-800 sticky bottom-0 z-20">
      <div className="max-w-3xl mx-auto">
        
        {/* Image Preview */}
        {selectedImage && (
          <div className="relative inline-block mb-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="relative group">
              <img 
                src={selectedImage} 
                alt="Preview" 
                className="h-20 w-20 object-cover rounded-lg border border-slate-600 shadow-md"
              />
              <button
                onClick={() => {
                  setSelectedImage(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="absolute -top-2 -right-2 bg-slate-700 hover:bg-red-500 text-white rounded-full p-1 shadow-lg transition-colors border border-slate-600"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-2xl border border-slate-700 focus-within:ring-2 focus-within:ring-nature-500/50 focus-within:border-nature-500 transition-all shadow-sm">
          
          {/* File Input Trigger */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className={`p-2 rounded-xl text-slate-400 hover:text-nature-400 hover:bg-slate-700/50 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="上傳照片"
          >
            <ImageIcon size={20} />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedImage ? "加入訊息 (選填)..." : "詢問物種資訊或上傳照片..."}
            disabled={isLoading}
            className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none px-2"
          />

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={isLoading || (!inputText.trim() && !selectedImage)}
            className={`p-2 rounded-xl flex items-center justify-center transition-all duration-200 ${
              (inputText.trim() || selectedImage) && !isLoading
                ? 'bg-nature-600 hover:bg-nature-500 text-white shadow-lg shadow-nature-900/20'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
        
        <div className="text-center mt-2">
           <p className="text-[10px] text-slate-500">
             由 Gemini 2.5 Flash 驅動 • 專為快速視覺辨識優化
           </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
