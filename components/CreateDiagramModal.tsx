'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2, Upload, Plus } from 'lucide-react'
import { toast } from 'sonner'

const formSchema = z.object({
  title: z.string().min(1, "Title is required blud"),
  description: z.string().optional(),
  thumbnail: z.any().optional(),
})

export default function CreateDiagramModal({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null) // State for the image preview
  const router = useRouter()
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsUploading(true)
    let publicUrl = null

    try {
      const fileInput = document.getElementById('thumbnail-upload') as HTMLInputElement
      const file = fileInput?.files?.[0]

      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${userId}/${Math.random()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('thumbnails')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('thumbnails')
          .getPublicUrl(fileName)
          
        publicUrl = urlData.publicUrl
      }

      const { data, error: insertError } = await supabase
        .from('diagrams')
        .insert({
            title: values.title,
            description: values.description,
            thumbnail_url: publicUrl,
            created_by: userId,
            code: 'graph TD;\n    A[Start] --> B[Lookin Good];\n    B --> C[Profit];',
        })
        .select()
        .single()

      if (insertError) throw insertError

      toast.success("Diagram Initiated.")
      setIsOpen(false)
      router.push(`/design/${data.diagram_id}`)

    } catch (error: any) {
        console.error(error)
        toast.error("Failed to create", { description: error.message })
    } finally {
        setIsUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
            className="hover:cursor-pointer bg-green-600 hover:bg-green-500 text-black font-bold border-2 border-green-400 shadow-[4px_4px_0px_0px_rgba(34,197,94,0.4)] hover:shadow-[2px_2px_0px_0px_rgba(34,197,94,0.4)] hover:translate-y-[2px] transition-all rounded-none"
        >
            <Plus className="w-5 h-5 mr-2" />
            INITIATE NEW DIAGRAM
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border-2 border-zinc-800 text-zinc-100 font-mono sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-green-500">NEW DIAGRAM PARAMETERS</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            
            <div className="space-y-2">
                <Label htmlFor="title" className="text-zinc-400">DIAGRAM TITLE</Label>
                <Input 
                    {...register("title")} 
                    id="title" 
                    placeholder="e.g. World Domination Plan" 
                    className="bg-zinc-900 border-zinc-700 focus:border-green-500 rounded-none"
                />
                {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="description" className="text-zinc-400">DESCRIPTION (OPTIONAL)</Label>
                <Textarea 
                    {...register("description")} 
                    id="description" 
                    placeholder="Briefing documents..." 
                    className="bg-zinc-900 border-zinc-700 focus:border-green-500 rounded-none resize-none"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="thumbnail-upload" className="text-zinc-400">COVER IMAGE</Label>
                <div className="border-2 border-dashed border-zinc-800 hover:border-green-500/50 transition-colors h-32 flex flex-col items-center justify-center cursor-pointer relative bg-zinc-900/50 group overflow-hidden">
                    {preview ? (
                        <img 
                            src={preview} 
                            alt="Preview" 
                            className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" 
                        />
                    ) : (
                        <div className="flex flex-col items-center pointer-events-none">
                            <Upload className="w-6 h-6 text-zinc-500 mb-2" />
                            <span className="text-xs text-zinc-500">CLICK TO UPLOAD</span>
                        </div>
                    )}
                    
                    <Input 
                        id="thumbnail-upload" 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                </div>
            </div>

            <Button 
                type="submit" 
                disabled={isUploading}
                className="w-full bg-green-600 hover:bg-green-500 text-black font-bold rounded-none mt-2 hover:cursor-pointer"
            >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : null}
                {isUploading ? 'COMPILING...' : 'INITIALIZE'}
            </Button>

        </form>
      </DialogContent>
    </Dialog>
  )
}