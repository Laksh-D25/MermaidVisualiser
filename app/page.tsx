'use client'
import { useState } from 'react';
import Mermaid from '@/components/Mermaid';

export default function Home() {
  // Simple default flow
  const [code, setCode] = useState(`graph TD
  A[Start] --> B{Is it cooked?}
  B -- Yes --> C[Restart]
  B -- No --> D[Let him cook]`);

  // Zoom State
  const [zoom, setZoom] = useState(1);

  const handleZoom = (delta: number) => {
    setZoom(prev => {
      const newZoom = prev + delta;
      return Math.min(Math.max(newZoom, 0.5), 5); // Clamp between 0.5x and 5x
    });
  };

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

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-200 font-sans overflow-hidden">
      
      {/* Left: Editor */}
      <div className="w-1/3 flex flex-col border-r border-zinc-800 z-10 bg-zinc-950">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900 flex justify-between items-center shadow-md">
          <span className="font-bold text-sm tracking-wider text-zinc-400">EDITOR</span>
          <button 
            onClick={downloadSVG}
            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded transition font-medium"
          >
            Export SVG
          </button>
        </div>
        <textarea
          className="flex-1 bg-zinc-950 p-4 font-mono text-sm text-zinc-300 resize-none outline-none focus:bg-zinc-900/50 transition selection:bg-indigo-500/30"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
        />
      </div>

      {/* Right: Preview */}
      <div className="w-2/3 flex flex-col bg-zinc-950 relative h-full">
         <div className="p-4 border-b border-zinc-800 bg-zinc-900 flex justify-between items-center shadow-md z-10">
          <span className="font-bold text-sm tracking-wider text-zinc-400">PREVIEW</span>
          
          {/* Zoom Controls */}
          <div className="flex gap-2 items-center bg-zinc-800 rounded-lg p-1">
            <button 
              onClick={() => handleZoom(-0.2)}
              className="w-8 h-8 flex items-center justify-center hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition"
              title="Zoom Out"
            >
              -
            </button>
            <span className="text-xs font-mono w-12 text-center text-zinc-500">{Math.round(zoom * 100)}%</span>
            <button 
              onClick={() => handleZoom(0.2)}
              className="w-8 h-8 flex items-center justify-center hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition"
              title="Zoom In"
            >
              +
            </button>
            <div className="w-px h-4 bg-zinc-700 mx-1"></div>
            <button 
              onClick={() => setZoom(1)}
              className="text-xs px-2 hover:bg-zinc-700 h-8 rounded text-zinc-400 hover:text-white transition"
            >
              Reset
            </button>
          </div>
        </div>
        
        {/* Scrollable area for the diagram */}
        <div className="flex-1 overflow-auto bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] relative">
            <div 
              className="w-full h-full flex items-center justify-center min-w-max min-h-max p-20 transition-transform duration-200 ease-out origin-center"
              style={{ 
                transform: `scale(${zoom})`
              }}
            >
              <Mermaid chart={code} />
            </div>
        </div>
      </div>
    </div>
  );
}