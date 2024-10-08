"use client"

import { ArrowRight } from 'lucide-react'
import { Button } from './ui/button'
import { trpc } from '@/app/_trpc/client'

const UpgradeButton = () => {

  

  return (
    <Button  className='w-full'>
      现在升级 <ArrowRight className='h-5 w-5 ml-1.5' />
    </Button>
  )
}

export default UpgradeButton
