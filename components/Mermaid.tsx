'use client'
import React, { useEffect, useState } from 'react';
import mermaid from 'mermaid';

// Config it once
mermaid.initialize({ 
  startOnLoad: false, 
  theme: 'dark',
  securityLevel: 'loose', 
});

const Mermaid = ({ chart }: { chart: string }) => {
  const [svg, setSvg] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const renderMermaid = async () => {
      try {
        setIsError(false);
        // Create unique ID or mermaid crashes on re-renders
        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
        
        // This generates the SVG string
        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
      } catch (error) {
        // Mermaid throws if syntax is cooked
        console.error("Mermaid died:", error);
        setIsError(true);
      }
    };

    // Tiny timeout to let UI settle before rendering
    const timeoutId = setTimeout(() => {
      if (chart) renderMermaid();
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [chart]);

  if (isError) return <div className="text-red-500 font-mono text-sm p-4">Syntax Error: Check your code, gang.</div>;

  return <div className="w-full flex justify-center" dangerouslySetInnerHTML={{ __html: svg }} />;
};

export default Mermaid;