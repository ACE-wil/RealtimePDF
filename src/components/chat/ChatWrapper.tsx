"use client"

import React from 'react'
import Messages from './Messages'
import ChatInput from './ChatInput'
import { trpc } from '@/app/_trpc/client'
import { ChevronLeft, Loader2, XCircle } from 'lucide-react'
import { buttonVariants } from '../ui/button'
import Link from 'next/link'
import { ChatContextProvider } from './ChatContext'


interface ChatWrapperProps {
  fileId: string
}

const ChatWrapper = ({fileId} : ChatWrapperProps) => {

  const {data, isLoading} = trpc.getFileUploadStatus.useQuery(
    {
    fileId,
  },{
    refetchInterval: (data) => 
      data?.status === 'SUCCESS' || data?.status === 'FAILD' 
      ? false 
      : 500 
  })

  if (isLoading) return (
    <div className='relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2'>
        <div className='flex-1 flex justify-center items-center flex-col mb-28'>
          <div className='flex flex-col items-center gap-2'>
            <Loader2 className='h-8 w-8 text-blue-500 animate-spin' />
            <h3 className='font-semibold text-xl'>
              加载中...
            </h3>
            <p className='text-zinc-500 text-sm'>
              我们正在准备您的pdf文件，请耐心等待
            </p>
          </div>
        </div>
        <ChatInput isDisabled/>
      </div>
  )

if(data?.status === 'PROCESSING') return (
<div className='relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2'>
        <div className='flex-1 flex justify-center items-center flex-col mb-28'>
          <div className='flex flex-col items-center gap-2'>
            <Loader2 className='h-8 w-8 text-blue-500 animate-spin' />
            <h3 className='font-semibold text-xl'>
              正在处理pdf中...
            </h3>
            <p className='text-zinc-500 text-sm'>
              我们正在处理您的pdf文件，请耐心等待
            </p>
          </div>
        </div>
        <ChatInput isDisabled/>
      </div>
)

if(data?.status === 'FAILD') return (
  <div className='relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2'>
          <div className='flex-1 flex justify-center items-center flex-col mb-28'>
            <div className='flex flex-col items-center gap-2'>
              <XCircle className='h-8 w-8 text-red-500' />
              <h3 className='font-semibold text-xl'>
                您的文件太大了
              </h3>
              <p className='text-zinc-500 text-sm'>
                已经超过免费的4M限制，请联系我们以获得更多帮助
              </p>
              <Link href='/dashboard' className={buttonVariants({
                variant: "secondary",
                className: "mt-4"
              })}>
              <ChevronLeft className='h-3 w-3 mr-1.5'/>
              返回
              </Link>
            </div>
          </div>

          <ChatInput isDisabled/>
        </div>
  )

  return (
    <ChatContextProvider fileId={fileId}>
    <div className='relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2'>
        <div className='flex-1 justify-between flex flex-col mb-28'>
          <Messages fileId={fileId}/>
        </div>

        <ChatInput />
    </div>
    </ChatContextProvider>
  )
}

export default ChatWrapper