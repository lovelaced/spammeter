'use client'

import React, { useRef, useEffect, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'

interface ParticleEffectProps {
  tps: number
}

const MAX_PARTICLES = 500 // Maximum number of particles to render

const ParticleEffect: React.FC<ParticleEffectProps> = React.memo(({ tps }) => {
  const [particles, setParticles] = useState<JSX.Element[]>([])
  const visibleParticlesRef = useRef(0)

  useEffect(() => {
    const newParticleCount = Math.min(MAX_PARTICLES, Math.max(20, Math.floor(tps / 10)))
    
    if (particles.length === 0) {
      // Initialize particles only once
      const initialParticles = Array.from({ length: MAX_PARTICLES }, (_, index) => (
        <Particle key={index} index={index} />
      ))
      setParticles(initialParticles)
    }

    visibleParticlesRef.current = newParticleCount
  }, [tps, particles.length])

  return (
    <div className="fixed inset-0 pointer-events-none">
      {particles.slice(0, visibleParticlesRef.current)}
    </div>
  )
})

const Particle: React.FC<{ index: number }> = React.memo(({ index }) => {
  const controls = useAnimation()

  useEffect(() => {
    const animate = async () => {
      while (true) {
        await controls.start({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          opacity: [0, 1, 0],
          scale: [1, 1.5, 1],
          transition: {
            duration: Math.random() * 5 + 5,
            ease: "easeInOut",
          },
        })
      }
    }
    animate()
  }, [controls])

  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full"
      style={{ backgroundColor: '#e6007a' }}
      animate={controls}
    />
  )
})

ParticleEffect.displayName = 'ParticleEffect'
Particle.displayName = 'Particle'

export default ParticleEffect