import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'


export default function Home() {
  return (
    <>
    <MaxWidthWrapper className="mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center">
      <div className="mx-auto mb-4 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-gray-200 bg-white px-7 py-2 shadow-md backdrop-blur transition-all hover:border-gray-300 hover:bg-white/50">
        <p className='text-sm font-semibold text-gray-700'>
          Shen Lian Jie
        </p>
      </div>
      <h1 className='max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl'>
        跟你的<span className='text-blue-600'>文档</span>聊一会吧！
      </h1>
      <p className='mt-5 max-w-prose text-zinc-700 sm:text-lg'>
        它允许您跟您的文档进行互动，并帮助您更好地理解您的文档。简单上传您的文件，然后开始提问问题。
      </p>

      <Link className={buttonVariants({
        size: 'lg',
        className: "mt-5"
      })} href='/dashboard' target='_blank'>
        开始吧<ArrowRight className='ml-2 h-5 w-5'/>
      </Link>
    </MaxWidthWrapper>
    </>
  )
}
