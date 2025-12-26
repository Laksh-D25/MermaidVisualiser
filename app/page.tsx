'use client'
import { useState, useCallback } from 'react';
import Mermaid from '@/components/Mermaid';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown'; // or import { markdown } if this fails
import { tokyoNight } from '@uiw/codemirror-theme-tokyo-night';

export default function Home() {
  const [code, setCode] = useState(`graph TD
  A[Start] --> B{Is it cooked?}
  B -- Yes --> C[Restart]
  B -- No --> D[Let him cook]`);

  const [zoom, setZoom] = useState(1);

  // Zoom Logic
  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(Math.max(prev + delta, 0.5), 5));
  };

  // Download Logic
  const downloadSVG = () => {
    const svg = document.querySelector('svg[id^="mermaid-"]');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'diagram.svg';
    link.click();
  };

  // Handle Editor Change
  const onChange = useCallback((val: string) => {
    setCode(val);
  }, []);

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-200 font-sans overflow-hidden">
      
      {/* Left: Editor */}
      <div className="w-1/3 flex flex-col border-r border-zinc-800 z-10 bg-[#1a1b26]">
        <div className="p-4 border-b border-zinc-800 bg-[#1a1b26] flex justify-between items-center shadow-md">
          <span className="font-bold text-sm tracking-wider text-zinc-400">EDITOR</span>
          <button 
            onClick={downloadSVG}
            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded transition font-medium"
          >
            Export SVG
          </button>
        </div>
        
        {/* The Upgrade: CodeMirror */}
        <div className="flex-1 overflow-auto text-sm">
          <CodeMirror
            value={code}
            height="100%"
            theme={tokyoNight}
            extensions={[markdown()]} // Gives syntax highlighting
            onChange={onChange}
            className="h-full"
            basicSetup={{
              autocompletion: true,  // Tries to guess words
              bracketMatching: true, // Highlights matching brackets
              closeBrackets: true,   // Auto-closes brackets () [] {}
              indentOnInput: true,   // Smart indent
              tabSize: 2,
            }}
          />
        </div>
      </div>

      {/* Right: Preview (Unchanged) */}
      <div className="w-2/3 flex flex-col bg-zinc-950 relative h-full">
         <div className="p-4 border-b border-zinc-800 bg-zinc-900 flex justify-between items-center shadow-md z-10">
          <span className="font-bold text-sm tracking-wider text-zinc-400">PREVIEW</span>
          <div className="flex gap-2 items-center bg-zinc-800 rounded-lg p-1">
            <button onClick={() => handleZoom(-0.2)} className="w-8 h-8 flex items-center justify-center hover:bg-zinc-700 rounded text-zinc-400">-</button>
            <span className="text-xs font-mono w-12 text-center text-zinc-500">{Math.round(zoom * 100)}%</span>
            <button onClick={() => handleZoom(0.2)} className="w-8 h-8 flex items-center justify-center hover:bg-zinc-700 rounded text-zinc-400">+</button>
            <div className="w-px h-4 bg-zinc-700 mx-1"></div>
            <button onClick={() => setZoom(1)} className="text-xs px-2 hover:bg-zinc-700 h-8 rounded text-zinc-400">Reset</button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] relative">
            <div className="w-full h-full flex items-center justify-center min-w-max min-h-max p-20 transition-transform duration-200 ease-out origin-center" style={{ transform: `scale(${zoom})` }}>
              <Mermaid chart={code} />
            </div>
        </div>
      </div>
    </div>
  );
}