'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/store/userStore'
import CreateDiagramModal from '@/components/CreateDiagramModal'
import { useRouter } from 'next/navigation'
import { Trash2, Edit3, Loader2, Database, FileCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Image from 'next/image'

interface Diagram {
  diagram_id: string
  title: string
  code: string
  thumbnail_url: string | null
  created_at: string
}

export default function Dashboard() {
  const supabase = createClient()
  const { user, profile } = useUserStore()
  const router = useRouter()
  
  const [diagrams, setDiagrams] = useState<Diagram[]>([])
  const [isFetching, setIsFetching] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return
    if (!user) {
        router.replace('/login')
        return
    }

    const fetchDiagrams = async () => {
      try {
        const { data, error } = await supabase
            .from('diagrams')
            .select('*')
            .eq('created_by', user.id)
            .order('created_at', { ascending: false })

        if (error) throw error
        setDiagrams(data || [])
      } catch (err: any) {
         console.error("Fetch failed:", err)
      } finally {
        setIsFetching(false)
      }
    }

    fetchDiagrams()

  }, [isMounted, user, router, supabase]) 

  const handleDelete = async (id: string) => {
     toast.promise(
        async () => {
            const { error } = await supabase.from('diagrams').delete().eq('diagram_id', id)
            if (error) throw error
            setDiagrams((prev) => prev.filter(d => d.diagram_id !== id))
        },
        { loading: 'Deleting...', success: 'Deleted', error: 'Failed' }
    )
  }

  if (!isMounted) return null 
  if (!user) return null 

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-mono relative">
      
      {/* HEADER */}
      <header className="border-b-2 border-zinc-800 bg-zinc-900/80 p-4 flex justify-between items-center sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
          <h1 className="text-xl font-bold tracking-tighter">MERMAIDJS<span className="text-zinc-500">_DASHBOARD</span></h1>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="hidden md:flex flex-col text-right text-xs text-zinc-500 leading-tight">
              <span>USER: {profile?.name.toUpperCase()}</span>
           </div>
           <Button 
             variant="destructive"
             className="h-8 text-xs uppercase bg-red-950/30 hover:bg-red-900 text-red-500 hover:text-white border border-red-900 hover:cursor-pointer rounded-none"
             onClick={async () => {
                await supabase.auth.signOut()
                router.refresh()
             }}
           >
             DISCONNECT
           </Button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="p-6 max-w-7xl mx-auto z-10 relative">
        <div className="flex justify-between items-end mb-8 border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-3xl font-black text-white mb-1">DIAGRAM INDEX</h2>
            <p className="text-zinc-500 text-sm flex items-center gap-2">
              <Database className="w-4 h-4" />
              {diagrams.length} FILES FOUND
            </p>
          </div>
          <CreateDiagramModal userId={user.id} />
        </div>

        {/* LOADING SKELETON */}
        {isFetching ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3].map((i) => (
                    <div key={i} className="h-64 bg-zinc-900/50 border border-zinc-800 animate-pulse rounded-sm" />
                ))}
            </div>
        ) : diagrams.length === 0 ? (
           <div className="border-2 border-dashed border-zinc-800 rounded-lg h-64 flex flex-col items-center justify-center text-zinc-600 gap-4">
              <p>MEMORY BANKS EMPTY.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {diagrams.map((diagram) => (
              <div 
                key={diagram.diagram_id}
                className="group relative bg-zinc-900 border border-zinc-800 hover:border-green-500/50 transition-all duration-300 flex flex-col"
              >
                <div className="h-32 w-full bg-zinc-950 relative border-b border-zinc-800 overflow-hidden">
                    {diagram.thumbnail_url ? (
                        <Image 
                            src={diagram.thumbnail_url} 
                            alt={diagram.title} 
                            fill 
                            className="object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                            unoptimized
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <FileCode className="w-8 h-8 text-zinc-800" />
                        </div>
                    )}
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-white mb-1 truncate">{diagram.title}</h3>
                  <p className="text-xs text-zinc-500 font-mono mb-4 flex-1">
                    {new Date(diagram.created_at).toLocaleDateString()}
                  </p>

                  <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        className="flex-1 bg-transparent border-zinc-700 hover:cursor-pointer hover:bg-green-950/30 hover:text-green-400 hover:border-green-500 rounded-none h-8 text-xs"
                        onClick={() => router.push(`/design/${diagram.diagram_id}`)}
                    >
                        <Edit3 className="w-3 h-3 mr-2" />
                        ACCESS
                    </Button>
                    <Button 
                        variant="destructive"
                        className="hover:cursor-pointer rounded-none h-8 w-8 p-0 bg-red-950/30 hover:bg-red-900 text-red-500 hover:text-white border border-red-900"
                        onClick={() => handleDelete(diagram.diagram_id)}
                    >
                        <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}