'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Github, Terminal, ArrowRight, Boxes } from 'lucide-react'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleGithubLogin = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      })
    } catch (error) {
      console.error('GitHub Auth error:', error)
    } finally {
    }
  }

  const handleGuestLogin = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInAnonymously()
      if (error) throw error
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Guest Auth error:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 relative overflow-hidden">
      {/* --- Background Noise & Texture --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         {/* CSS Grain pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* --- Floating Abstract Diagram Elements (Vibe setter) --- */}
      <div className="absolute top-20 left-20 text-zinc-800 animate-pulse duration-[5000ms]">
        <Boxes size={120} strokeWidth={1} />
      </div>
       <div className="absolute bottom-20 right-20 text-zinc-800 animate-bounce duration-[8000ms]">
        <Terminal size={100} strokeWidth={1} />
      </div>


      {/* --- The Funky Poster Card --- */}
      <Card className="w-full max-w-md relative z-10 border-4 border-white bg-zinc-900 shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] rounded-none transform -rotate-2 hover:rotate-0 transition-transform duration-300">
        
        <CardHeader className="text-center pb-2 space-y-4">
            {/* A little decorative tape element at the top */}
            <div className="w-16 h-4 bg-yellow-400 mx-absolute -top-6 left-1/2 -translate-x-1/2 rotate-12 opacity-80 border-2 border-black"></div>
            
          <CardTitle className="text-4xl font-black tracking-tighter text-white uppercase leading-none flex flex-col items-center">
            <span className="text-yellow-400 text-5xl">VISUALIZE</span>
            <span className="relative">
                YOUR CHAOS.
                {/* Glitch effect layer */}
                <span className="absolute top-0 left-1 text-red-500 opacity-50 -z-10" aria-hidden="true">YOUR CHAOS.</span>
                 <span className="absolute top-0 -left-1 text-blue-500 opacity-50 -z-10" aria-hidden="true">YOUR CHAOS.</span>
            </span>
          </CardTitle>
          <CardDescription className="font-mono text-zinc-400 uppercase tracking-widest text-xs border-b-2 border-zinc-800 pb-4 inline-block">
            /// System Entry Point v1.0 ///
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-6 py-6">
          {/* --- GitHub Button (High Contrast) --- */}
          <Button 
            onClick={handleGithubLogin}
            disabled={isLoading}
            className="w-full h-14 text-lg font-bold bg-white text-black hover:bg-zinc-200 rounded-none border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:shadow-none active:translate-y-[4px] active:translate-x-[4px] group"
          >
            <Github className="mr-2 h-6 w-6 group-hover:rotate-12 transition-transform" />
            JACK IN WITH GITHUB
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t-2 border-dashed border-zinc-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase font-mono">
              <span className="bg-zinc-900 px-2 text-zinc-500">OR STAY ANONYMOUS</span>
            </div>
          </div>

           {/* --- Guest Button (Terminal Style) --- */}
          <Button
            variant="ghost"
            onClick={handleGuestLogin}
            disabled={isLoading}
            className="w-full font-mono text-zinc-300 hover:text-yellow-400 hover:bg-zinc-800/50 rounded-none border-2 border-dashed border-zinc-700 hover:border-yellow-400 transition-colors h-12 group"
          >
            <Terminal className="mr-2 h-5 w-5" />
            ACCESS AS GUEST ALIAS
            <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
          </Button>
        </CardContent>

        <CardFooter className="justify-center border-t-4 border-white bg-white pt-4 pb-4">
          <p className="text-xs text-center font-bold text-black uppercase tracking-wider flex items-center gap-2">
            <Boxes size={16} />
            No data saved remotely in guest mode
          </p>
        </CardFooter>
      </Card>
      
        {/* Footer copyright for poster vibe */}
       <div className="absolute bottom-4 font-mono text-[10px] text-zinc-600 uppercase tracking-[0.2em]">
            © 2026 LAKSH D. // ALL RIGHTS RESERVED.
       </div>
    </div>
  )
}