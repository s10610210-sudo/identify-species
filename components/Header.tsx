import React from 'react';
import { Leaf } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-nature-600 p-2 rounded-xl shadow-lg shadow-nature-900/20">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">SpeciesLens</h1>
            <p className="text-xs text-slate-400">AI 智慧物種辨識</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
