'use client'
import React, { useEffect, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({ 
  startOnLoad: false, 
  theme: 'dark',
  securityLevel: 'loose',
  suppressErrorRendering: true, 
});

const Mermaid = ({ chart }: { chart: string }) => {
  const [svg, setSvg] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    mermaid.parseError = (err) => {
        console.warn("Mermaid Syntax Error (Suppressed):", err);
    };

    const renderMermaid = async () => {
      try {
        setIsError(false);
        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
        await mermaid.parse(chart);
        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
      } catch (error) {
        console.error("Mermaid died:", error);
        setIsError(true);
      }
    };

    const timeoutId = setTimeout(() => {
      if (chart) renderMermaid();
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [chart]);

  if (isError) return (
      <div className="flex h-full w-full items-center justify-center text-red-500 font-mono text-xs p-4 border border-red-900/50 bg-red-950/10">
          Syntax Error: Check your code.
      </div>
  );

  return <div className="w-full flex justify-center" dangerouslySetInnerHTML={{ __html: svg }} />;
};

export default Mermaid;