'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-zinc-950 p-4">
       <Card className="w-full max-w-md border-red-800 bg-zinc-900">
        <CardHeader>
           <div className="flex items-center gap-2 text-red-500 mb-2">
             <AlertTriangle />
             <span className="font-mono uppercase font-bold">System Failure</span>
           </div>
           <CardTitle className="text-white">Authentication Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="text-zinc-400">
              The verification code from GitHub was invalid or expired. This happens if:
            </p>
            <ul className="list-disc list-inside text-sm text-zinc-500 space-y-1 font-mono">
                <li>You refreshed the page mid-login.</li>
                <li>The link was clicked twice.</li>
                <li>Cookies are disabled.</li>
            </ul>
            <Button asChild className="w-full bg-white text-black hover:bg-zinc-200 mt-4">
                <Link href="/login">Try Again</Link>
            </Button>
        </CardContent>
       </Card>
    </div>
  )
}