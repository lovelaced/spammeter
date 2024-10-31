import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

function AnimatedBackground() {
  const [paths, setPaths] = useState<{ id: number; d: string }[]>([])

  useEffect(() => {
    const newPaths = [...Array(15)].map((_, i) => ({
      id: i,
      d: `M -10 ${Math.random() * 100} Q ${window.innerWidth / 2} ${Math.random() * 100}, ${window.innerWidth + 10} ${Math.random() * 100}`
    }))
    setPaths(newPaths)
  }, [])

  return (
    <svg className="fixed inset-0 w-full h-full pointer-events-none" style={{ filter: 'blur(1px)' }}>
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ec4899" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      {paths.map((path) => (
        <motion.path
          key={path.id}
          d={path.d}
          stroke="url(#lineGradient)"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: [0, 1],
            opacity: [0, 0.5, 0],
            d: `M -10 ${Math.random() * 100} Q ${window.innerWidth / 2} ${Math.random() * 100}, ${window.innerWidth + 10} ${Math.random() * 100}`
          }}
          transition={{
            duration: Math.random() * 5 + 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2
          }}
        />
      ))}
    </svg>
  )
}
export default AnimatedBackground