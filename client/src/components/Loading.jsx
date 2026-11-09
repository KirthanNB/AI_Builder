import React from 'react'
import { Loader } from 'lucide-react'

const Loading = () => {
  return (
    <div className="flex items-center justify-center  h-[100vh] w-full">
      <Loader className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  )
}

export default Loading