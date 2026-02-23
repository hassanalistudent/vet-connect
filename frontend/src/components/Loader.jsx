import React from 'react'

const Loader = ({ small = false }) => {
  return (
    <div className="flex items-center justify-center">
      <div
        className={`
          animate-spin rounded-full 
          border-t-4 border-b-4 
          border-navigray border-opacity-20 
          border-t-navigray border-b-navigray
          ${small ? 'h-8 w-8 border-t-2 border-b-2' : 'h-16 w-16 border-t-4 border-b-4'}
        `}
      >
        <div className="sr-only">Loading...</div>
      </div>
    </div>
  )
}

export default Loader;