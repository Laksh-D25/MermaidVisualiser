'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import Mermaid from '@/components/Mermaid'
import { Loader2, ArrowLeft, Download, Terminal, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

// Zoom/Pan Library
import { TransformWrapper, TransformComponent, ReactZoomPanPinchContentRef } from "react-zoom-pan-pinch"

// CodeMirror Imports
import CodeMirror from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { tokyoNight } from '@uiw/codemirror-theme-tokyo-night'

// Debounce helper
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

export default function EditorPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()

  const [code, setCode] = useState('')
  const [title, setTitle] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedCode, setLastSavedCode] = useState('')
  const [zoomLevel, setZoomLevel] = useState(1)
  const transformComponentRef = useRef<ReactZoomPanPinchContentRef>(null)

  // 1. Fetch initial data
  useEffect(() => {
    const fetchDiagram = async () => {
      const { data, error } = await supabase
        .from('diagrams')
        .select('*')
        .eq('diagram_id', id)
        .single()

      if (error) {
        toast.error("Diagram not found")
        router.push('/')
        return
      }

      setTitle(data.title)
      setCode(data.code || '')
      setLastSavedCode(data.code || '')
      setIsLoading(false)
    }

    if (id) fetchDiagram()
  }, [id, router, supabase])

  // 2. Autosave Logic
  const debouncedCode = useDebounce(code, 1500)

  useEffect(() => {
    if (isLoading || debouncedCode === lastSavedCode) return

    const saveToDb = async () => {
      setIsSaving(true)
      try {
        const { error } = await supabase
            .from('diagrams')
            .update({ 
                code: debouncedCode,
                updated_at: new Date().toISOString()
            })
            .eq('diagram_id', id)

          if (error) throw error
          setLastSavedCode(debouncedCode)
      } catch (error: any) {
        console.error("Save Error:", error)
        toast.error("Sync Failed", { description: error.message })
      } finally {
        setIsSaving(false)
      }
    }

    saveToDb()
  }, [debouncedCode, id, supabase, lastSavedCode, isLoading])

  // 3. Handlers
  const downloadSVG = () => {
    const svg = document.querySelector('.mermaid-output svg')
    if (!svg) {
        toast.error("Nothing to render yet.")
        return
    }
    const serializer = new XMLSerializer()
    const svgData = serializer.serializeToString(svg)
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${title.replace(/\s+/g, '_') || 'diagram'}.svg`
    link.click()
    toast.success("Blueprint exported.")
  };

  const onChange = useCallback((val: string) => {
    setCode(val);
  }, []);

  if (isLoading) {
    return (
        <div className="h-screen bg-zinc-950 flex flex-col items-center justify-center font-mono text-green-500">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="animate-pulse">DECRYPTING...</p>
        </div>
    )
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-200 font-mono overflow-hidden">
      
      {/* LEFT PANEL: EDITOR */}
      <div className="w-1/3 flex flex-col border-r-2 border-zinc-800 z-10 bg-zinc-950">
        
        {/* Header */}
        <div className="h-14 border-b-2 border-zinc-800 bg-zinc-900/80 p-4 flex justify-between items-center backdrop-blur-sm">
          <div className="flex items-center gap-3 overflow-hidden">
             <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => router.push('/')} 
                className="h-8 w-8 rounded-none hover:bg-red-950/50 hover:text-red-500 text-zinc-400"
             >
                <ArrowLeft className="w-4 h-4" />
             </Button>
             <div className="flex flex-col">
                <span className="font-bold text-xs tracking-widest text-zinc-500 uppercase">DIAGRAM ID</span>
                <span className="font-bold text-sm tracking-tighter text-white truncate max-w-[150px] uppercase">
                    {title}
                </span>
             </div>
          </div>
          
          {/* Save Status Indicator */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 mr-2 px-2 py-1 bg-zinc-900 border border-zinc-800">
                {isSaving ? (
                    <Loader2 className="w-3 h-3 animate-spin text-yellow-500" />
                ) : (
                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_4px_#22c55e]" />
                )}
            </div>
          </div>
        </div>
        
        {/* CodeMirror Editor */}
        <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-zinc-950 bg-[#1a1b26]">
          <div className="text-[10px] text-zinc-500 bg-zinc-900 px-2 py-1 border-b border-zinc-800 flex items-center gap-2 sticky top-0 z-10">
            <Terminal className="w-3 h-3" />
            SOURCE_CODE.MMD
          </div>
          <CodeMirror
            value={code}
            height="100%"
            theme={tokyoNight}
            extensions={[markdown()]} 
            onChange={onChange}
            className="h-full font-mono text-sm"
            basicSetup={{
              lineNumbers: true,
              autocompletion: true,
              bracketMatching: true,
              closeBrackets: true,
              indentOnInput: true,
              tabSize: 2,
              highlightActiveLine: true,
            }}
          />
        </div>
        
        {/* Footer Actions */}
        <div className="p-3 border-t-2 border-zinc-800 bg-zinc-900">
             <Button 
                onClick={downloadSVG}
                className="w-full bg-green-600 hover:bg-green-500 text-black font-bold border-2 border-green-400 shadow-[4px_4px_0px_0px_rgba(34,197,94,0.4)] hover:shadow-[2px_2px_0px_0px_rgba(34,197,94,0.4)] hover:translate-y-[2px] transition-all rounded-none h-10 text-xs tracking-wider"
             >
                <Download className="w-4 h-4 mr-2" />
                COMPILE & EXPORT .SVG
             </Button>
        </div>
      </div>

      {/* RIGHT PANEL: PREVIEW & PAN/ZOOM */}
      <div className="w-2/3 flex flex-col bg-zinc-950 relative h-full overflow-hidden">
         
         <TransformWrapper
            ref={transformComponentRef}
            initialScale={1}
            minScale={0.1}
            maxScale={8}
            centerOnInit
            limitToBounds={false}
            onTransformed={(ref) => setZoomLevel(ref.state.scale)}
         >
            {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                    {/* Floating Controls */}
                    <div className="absolute top-4 right-4 z-50 flex gap-2">
                        <div className="flex items-center bg-zinc-900 border-2 border-zinc-800 shadow-xl p-1">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => zoomOut()} 
                                className="h-8 w-8 rounded-none hover:bg-zinc-800 text-zinc-400"
                            >
                                <ZoomOut className="w-4 h-4" />
                            </Button>
                            
                            <div className="w-12 text-center font-mono text-xs text-green-500 font-bold border-x-2 border-zinc-800 h-8 flex items-center justify-center bg-zinc-950">
                                {Math.round(zoomLevel * 100)}%
                            </div>

                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => zoomIn()} 
                                className="h-8 w-8 rounded-none hover:bg-zinc-800 text-zinc-400"
                            >
                                <ZoomIn className="w-4 h-4" />
                            </Button>

                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => {
                                    resetTransform();
                                    setZoomLevel(1);
                                }} 
                                className="h-8 w-8 rounded-none hover:bg-zinc-800 text-zinc-400 border-l-2 border-zinc-800 ml-1"
                            >
                                <RotateCcw className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>

                    {/* Background Grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0 opacity-50" />

                    {/* Canvas */}
                    <div className="flex-1 w-full h-full z-10">
                        <TransformComponent
                            wrapperStyle={{ width: "100%", height: "100%" }}
                            contentStyle={{ width: "100%", height: "100%" }}
                        >
                             <div className="w-full h-full flex items-center justify-center p-20">
                                 <div className="bg-zinc-900/50 p-8 border border-zinc-800 backdrop-blur-sm shadow-2xl min-w-max">
                                    <Mermaid chart={code} />
                                 </div>
                             </div>
                        </TransformComponent>
                    </div>
                </>
            )}
         </TransformWrapper>
      </div>
    </div>
  )
}