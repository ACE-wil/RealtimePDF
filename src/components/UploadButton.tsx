'use client'

import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { useState } from 'react'
import { Button } from './ui/button'
import { Progress } from './ui/progress'

import Dropzone from 'react-dropzone'
import { Cloud, File, Loader2 } from 'lucide-react'
import { useUploadThing } from '@/lib/uploadthing'
import { useToast } from '@/hooks/use-toast'
import { trpc } from '@/app/_trpc/client'
import { useRouter } from 'next/navigation'

const UploadDropzone = () => {
    const router = useRouter()


    const [isUploading, setIsUploading] = useState<boolean>(false)
    const [uploadProgress, setUploadProgress] = useState<number>(0)
    const {toast} = useToast()

    const { startUpload } = useUploadThing("pdfUploader")

    const {mutate: startPolling} = trpc.getFile.useMutation({
        onSuccess: (file) => {
            router.push(`/dashboard/${file.id}`)
        },
        retry: true,
        retryDelay: 500
    })
    
    const startSimulateProgress = () => {
        setUploadProgress(0)

        const interval = setInterval(() => {
            setUploadProgress((prevProgress) => {
                if(prevProgress >= 95) {
                    clearInterval(interval)
                    return prevProgress
                }
                return prevProgress + 5
            })
        },500)
        return interval
    }

    return <Dropzone 
              multiple={false} 
              onDrop={async (acceptedFile) => {
            setIsUploading(true)

            const progressInterval = startSimulateProgress()

            // 模拟上传
            const res = await startUpload(acceptedFile)

            if(!res) {
                return toast({
                    title: '上传失败',
                    description: '文件格式错误或文件过大，请重新选择',
                    variant: 'destructive'
                })
            }

            const [fileResponse] = res

            const key = fileResponse?.key

            if(!key) {
                return toast({
                    title: '上传失败',
                    description: '文件格式错误或文件过大，请重新选择',
                    variant: 'destructive'
                })
            }

            clearInterval(progressInterval)
            setUploadProgress(100)

            startPolling({ key })

        }}>
        {({getRootProps, getInputProps, acceptedFiles}) => {
            return (
                <div {...getRootProps()} className='border h-64 m-4 border-dashed border-gray-300 rounded-lg'>
                    <div className='flex items-center justify-center h-full w-full'>
                        <label
                          htmlFor='dropzone-file'
                            className='flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100'>
                                <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                                    <Cloud className='h-6 w-6 text-zinc-500 mb-2'/>
                                    <p className='mb-2 text-sm text-zinc-700'>
                                        <span className='font-semibold'>
                                            点击上传文件
                                        </span>{' '}
                                        或拖拽文件到这里
                                    </p>
                                    <p className='text-xs text-zinc-500'>PDF (小于4MB)</p>
                                </div>
                                {/* 如果有文件 */}
                                {acceptedFiles && acceptedFiles[0] ? (
                                    <div className='max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200'>
                                        <div className='px-3 py-2 h-full grid place-items-center'>
                                            <File className='h-4 w-4 text-blue-500' />
                                        </div>
                                        <div className='px-3 py-2 h-full text-sm truncate'>
                                            {acceptedFiles[0].name}
                                        </div>
                                    </div>
                                ) : null}

                                {isUploading ? (
                                    <div className='w-full mt-4 max-w-xs mx-auto'>
                                        <Progress 
                                        indicatorColor={
                                            uploadProgress === 100 ? 'bg-green-500' : ''
                                        }
                                          value={uploadProgress} 
                                          className='h-1 w-full bg-zinc-200'
                                        />
                                        {uploadProgress === 100 ? (
                                            <div className='flex gap-1 items-center justify-center text-sm text-zinc-700 text-center pt-2'>
                                                <Loader2 className='h-3 w-3 animate-spin' />
                                                正在重定向···
                                            </div>
                                        ) : null}
                                    </div>
                                ) : null}

                                <input type='file' {...getInputProps()} id='dropzone-file' hidden />
                            </label>
                    </div>
                </div>
                )
        }

        }
    </Dropzone>
}

const UploadButton = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    
    return (
        <Dialog open={isOpen} 
        onOpenChange={(v)=>{
            if(!v){
                setIsOpen(v)
            }
        }}>
            <DialogTrigger onClick={() => setIsOpen(true)} asChild>
                <Button>上传PDF</Button>
            </DialogTrigger>

            <DialogContent>
                <UploadDropzone />
            </DialogContent>
        </Dialog>
    )

}

export default UploadButton