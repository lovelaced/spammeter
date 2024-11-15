// SpamButton.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

const LIMIT = 16000 // Number of Receiver accounts

export function SpamButton() {
  const [status, setStatus] = useState('idle')
  const [progress, setProgress] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [api, setApi] = useState<ApiPromise | null>(null)

  useEffect(() => {
    initializeApi()
  }, [])

  const initializeApi = async (): Promise<ApiPromise> => {
    if (api) {
      return api
    }
    try {
      console.log('Initializing API...')
      //const wsProvider = new WsProvider('ws://127.0.0.1:49764')
      const wsProvider = new WsProvider('wss://westend-yap-2022.parity-testnet.parity.io')
      const apiInstance = await ApiPromise.create({ provider: wsProvider })
      console.log('API initialized successfully.')
      setApi(apiInstance)
      return apiInstance
    } catch (error) {
      console.error('Error initializing API:', error)
      throw error
    }
  }

  const runTransfers = async () => {
    setIsRunning(true)
    setStatus('initializing')
    setProgress(0)

    try {
      const apiInstance = await initializeApi()

      // Update status to 'signing transactions' before starting the workers
      setStatus('signing transactions')

      // Get the number of CPU cores
      const numCores = navigator.hardwareConcurrency || 4 // Default to 4 if not available
      const numWorkers = numCores

      // Calculate workload per worker
      const chunkSize = Math.ceil(LIMIT / numWorkers)

      // Store references to workers and their promises
      const workerPromises = []
      const signedTxsArrays: string[][] = []
      const workerProgresses = new Array(numWorkers).fill(0)

      for (let i = 0; i < numWorkers; i++) {
        const worker = new Worker(new URL('./signingWorker.ts', import.meta.url), { type: 'module' })

        const start = i * chunkSize
        const end = Math.min((i + 1) * chunkSize, LIMIT)
        const workerLimit = end - start

        // Create a promise to handle each worker's completion
        const workerPromise = new Promise<void>((resolve, reject) => {
          worker.onmessage = (event) => {
            const { signedTxs, error, progress: workerProgress } = event.data

            if (error) {
              console.error(`Error in worker ${i}:`, error)
              setStatus('error')
              setIsRunning(false)
              reject(error)
              return
            }

            if (workerProgress !== undefined) {
              // Update progress based on worker progress
              workerProgresses[i] = workerProgress // workerProgress is between 0 and 100
              const totalWorkerProgress = workerProgresses.reduce((sum, curr) => sum + curr, 0) / numWorkers
              // Since signing is 50% of total progress
              const totalProgress = (totalWorkerProgress / 100) * 50 // totalProgress between 0 and 50
              setProgress(totalProgress)
              return
            }

            if (signedTxs) {
              signedTxsArrays[i] = signedTxs
              resolve()
            }
          }

          worker.onerror = (error) => {
            console.error(`Worker ${i} encountered an error:`, error)
            setStatus('error')
            setIsRunning(false)
            reject(error)
          }
        })

        worker.postMessage({
          privateKey: '//Alice//stash',
          startIndex: start,
          limit: workerLimit,
          apiInstanceUrl: 'ws://127.0.0.1:49764',
        })

        workerPromises.push(workerPromise)
      }

      // Wait for all workers to finish
      await Promise.all(workerPromises)

      // Combine all signed transactions
      const allSignedTxs = signedTxsArrays.flat()

      // Update status to 'submitting transactions'
      setStatus('submitting transactions')

      // Reset progress for submission phase
      setProgress(50)

      for (let i = 0; i < allSignedTxs.length; i++) {
        try {
          const txHex = allSignedTxs[i]
          await apiInstance.rpc.author.submitExtrinsic(txHex)
          console.log(`Transaction ${i} submitted successfully.`)
          // Update progress during submission phase
          const submissionProgress = ((i + 1) / allSignedTxs.length) * 50 // From 50 to 100%
          setProgress(50 + submissionProgress)
        } catch (error) {
          console.error(`Failed to submit transaction ${i}`, error)
        }
      }

      setStatus('done')
      setProgress(100)
      setIsRunning(false)
    } catch (error) {
      console.error('Error during transfer process:', error)
      setStatus('error')
      setIsRunning(false)
    }
  }

  return (
    <div className="w-full h-full bg-white p-2 font-mono text-black relative overflow-hidden">
      <div className="space-y-2">
        <Button
          onClick={runTransfers}
          disabled={isRunning}
          className="w-full bg-black text-white border-2 border-black px-2 py-1 text-xs font-bold hover:bg-white hover:text-black transition-colors shadow-md relative overflow-hidden group"
        >
          <span className="relative z-10 flex items-center justify-center">
            {isRunning ? 'Running...' : 'SPAM NOW'}
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Button>
        <div className="space-y-1 flex-grow mr-2">
          <p className="text-xs">
            Status: {status}{' '}
            {(status === 'signing transactions' || status === 'submitting transactions') &&
              `${progress.toFixed(1)}%`}
          </p>
          <Progress value={progress} className="h-2" />
        </div>
      </div>
    </div>
  )
}

export default SpamButton
