'use client'
import { useState } from 'react';
import Mermaid from '@/components/Mermaid';

export default function Home() {
  // Default code that actually works
  const [code, setCode] = useState(`graph TD
  A[Start: InvoiceEditor Mounts] --> B{Got invoiceId?}
  
  %% New Invoice
  B -- No --> C[Store: init null]
  C --> D[Reset Header]
  D --> E[Render: Unlocked]

  %% Edit Invoice
  B -- Yes --> G[Store: init id]
  G --> H[Store: refreshData]
  H --> I[(GraphQL: GET_ID)]
  I --> J[Store: Update]
  J --> K[Render: Locked]

  style A fill:#f9f,stroke:#333
  style I fill:#bbf,stroke:#333`);

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
      <div className="w-1/3 flex flex-col border-r border-zinc-800">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900 flex justify-between items-center">
          <span className="font-bold text-sm tracking-wider text-zinc-400">EDITOR</span>
          <button 
            onClick={downloadSVG}
            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded transition"
          >
            Export SVG
          </button>
        </div>
        <textarea
          className="flex-1 bg-zinc-950 p-4 font-mono text-sm text-zinc-300 resize-none outline-none focus:bg-zinc-900/50 transition"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
        />
      </div>

      {/* Right: Preview */}
      <div className="w-2/3 flex flex-col bg-zinc-950 relative">
         <div className="p-4 border-b border-zinc-800 bg-zinc-900">
          <span className="font-bold text-sm tracking-wider text-zinc-400">PREVIEW</span>
        </div>
        
        {/* Scrollable area for the diagram */}
        <div className="flex-1 overflow-auto p-10 flex items-center justify-center bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px]">
          <Mermaid chart={code} />
        </div>
      </div>
    </div>
  );
}