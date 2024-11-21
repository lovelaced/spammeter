// SpamButton.tsx

'use client';

import { useState, useEffect } from 'react';
import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { mnemonicGenerate } from '@polkadot/util-crypto';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowUp } from 'lucide-react';
import type { AccountInfo } from '@polkadot/types/interfaces';

interface SpamButtonProps {
  rpcUrl: string;
  disabled: boolean;
}

const LIMIT = 1;

export function SpamButton({ rpcUrl, disabled }: SpamButtonProps) {
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [api, setApi] = useState<ApiPromise | null>(null);

  useEffect(() => {
    if (rpcUrl) {
      initializeApi();
    }
  }, [rpcUrl]);

  const initializeApi = async (): Promise<ApiPromise> => {
    if (api || !rpcUrl) {
      return api!;
    }
    try {
      console.log('Initializing API...');
      const wsProvider = new WsProvider(rpcUrl);
      const apiInstance = await ApiPromise.create({ provider: wsProvider });
      console.log('API initialized successfully.');
      setApi(apiInstance);
      return apiInstance;
    } catch (error) {
      console.error('Error initializing API:', error);
      throw error;
    }
  };

  const generateFundedAccount = async (api: ApiPromise) => {
    // Generate a random mnemonic
    const mnemonic = mnemonicGenerate();
    console.log('Generated mnemonic:', mnemonic);

    // Derive the account from the mnemonic
    const keyring = new Keyring({ type: 'sr25519' });
    const account = keyring.addFromMnemonic(mnemonic);
    const address = account.address;

    console.log('Generated account address:', address);

    // Create the unsigned extrinsic using magicMintExperimental
    try {
      console.log(`Requesting funds for account: ${address}`);

      const magicMint = api.tx.balances.magicMintExperimental(address);

      // Submit the unsigned extrinsic
      const hash = await api.rpc.author.submitExtrinsic(magicMint);
      console.log('Submitted magicMintExperimental extrinsic with hash:', hash.toHex());

      // Wait for the balance to be updated
      let balance = await api.query.system.account(address) as AccountInfo;
      let retries = 10;
      while (balance.data.free.isZero() && retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 6000)); // Wait for 6 seconds
        balance = await api.query.system.account(address) as AccountInfo;
        retries--;
      }

      if (balance.data.free.isZero()) {
        throw new Error('Account did not receive funds');
      }

      console.log('Account funded successfully!');
      return { account, address, mnemonic };
    } catch (error) {
      console.error('Error funding account:', error);
      throw error;
    }
  };

  const runTransfers = async () => {
    if (!api) {
      console.error('API is not initialized');
      return;
    }

    setIsRunning(true);
    setStatus('initializing');
    setProgress(0);

    try {
      const apiInstance = await initializeApi();

      // Generate and fund a new account
      setStatus('generating account');
      const fundedAccount = await generateFundedAccount(apiInstance);

      // Update status to 'signing transactions' before starting the workers
      setStatus('signing transactions');

      // Get the number of CPU cores
      const numCores = navigator.hardwareConcurrency || 4; // Default to 4 if not available
      const numWorkers = numCores;

      // Calculate workload per worker
      const chunkSize = Math.ceil(LIMIT / numWorkers);

      // Get the starting nonce
      const accountInfo = await apiInstance.query.system.account(fundedAccount.address) as AccountInfo;
      const startingNonce = accountInfo.nonce.toNumber();

      // Store references to workers and their promises
      const workerPromises = [];
      const signedTxsArrays: string[][] = [];
      const workerProgresses = new Array(numWorkers).fill(0);

      for (let i = 0; i < numWorkers; i++) {
        const worker = new Worker(new URL('./signingWorker.ts', import.meta.url), { type: 'module' });

        const start = i * chunkSize;
        const end = Math.min((i + 1) * chunkSize, LIMIT);
        const workerLimit = end - start;

        // Create a promise to handle each worker's completion
        const workerPromise = new Promise<void>((resolve, reject) => {
          worker.onmessage = (event) => {
            const { signedTxs, error, progress: workerProgress } = event.data;

            if (error) {
              console.error(`Error in worker ${i}:`, error);
              setStatus('error');
              setIsRunning(false);
              reject(error);
              return;
            }

            if (workerProgress !== undefined) {
              // Update progress based on worker progress
              workerProgresses[i] = workerProgress; // workerProgress is between 0 and 100
              const totalWorkerProgress = workerProgresses.reduce((sum, curr) => sum + curr, 0) / numWorkers;
              // We'll just say signing is 50% of total progress
              const totalProgress = (totalWorkerProgress / 100) * 50; // totalProgress between 0 and 50
              setProgress(totalProgress);
              return;
            }

            if (signedTxs) {
              signedTxsArrays[i] = signedTxs;
              resolve();
            }
          };

          worker.onerror = (error) => {
            console.error(`Worker ${i} encountered an error:`, error);
            setStatus('error');
            setIsRunning(false);
            reject(error);
          };
        });

        const workerNonce = startingNonce + i;

        worker.postMessage({
          mnemonic: fundedAccount.mnemonic,
          startIndex: start,
          limit: workerLimit,
          apiInstanceUrl: rpcUrl, // Use the rpcUrl directly
          nonce: workerNonce,
        });

        workerPromises.push(workerPromise);
      }

      // Wait for all workers to finish
      await Promise.all(workerPromises);

      // Combine all signed transactions
      const allSignedTxs = signedTxsArrays.flat();

      // Update status to 'submitting transactions'
      setStatus('submitting transactions');

      // Reset progress for submission phase
      setProgress(50);

      // Submit the batched transactions sequentially
      for (let i = 0; i < allSignedTxs.length; i++) {
        try {
          const txHex = allSignedTxs[i];
          await apiInstance.rpc.author.submitExtrinsic(txHex);
          console.log(`Transaction ${i + 1} submitted successfully.`);
          // Update progress during submission phase
          const submissionProgress = ((i + 1) / allSignedTxs.length) * 50; // From 50 to 100%
          setProgress(50 + submissionProgress);
        } catch (error) {
          console.error(`Failed to submit transaction ${i + 1}`, error);
        }
      }

      setStatus('completed');
      setProgress(100);
      setIsRunning(false);

      // change status back to "idle" after 1 second
      setTimeout(() => {
        setStatus('idle');
      }, 1000);
    } catch (error) {
      console.error('Error during transfer process:', error);
      setStatus('error');
      setIsRunning(false);
    }
  };

  return (
    <div className="w-80 flex flex-col items-start space-y-2">
      <Button
        onClick={runTransfers}
        disabled={disabled || isRunning}
        className="w-full h-[38px] bg-black text-white border-4 border-black px-4 py-2 text-sm font-bold hover:bg-white hover:text-black transition-colors shadow-md relative overflow-hidden group"
      >
        <span className="relative z-10 flex items-center justify-center">
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running spam program...
            </>
          ) : disabled ? (
            // show different icons based on screen size
            <span className="flex items-center">
              <span className="hidden sm:block">&lt;-- Select a chain to spam</span>
              <span className="block sm:hidden flex items-center">
                <ArrowUp className="mr-2 h-4 w-4" />
                Select a chain to spam
              </span>
            </span>
          ) : (
            'SPAM NOW'
          )}
        </span>
        <span className="absolute inset-0 bg-gradient-to-r from-[#7916F3] to-[#ea4070] opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className="absolute inset-0 opacity-0 group-hover:opacity-20" />
      </Button>
      <SpamStatus status={status} progress={progress} />
    </div>
  );
}

function SpamStatus({ status, progress }: { status: string; progress: number }) {
  return (
    <div className="w-full space-y-1">
      <div className="flex justify-between items-center">
        <p className={`text-xs font-medium ${status}`}>
          {status !== 'idle' && (
            <>
              {`Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`}
              {(status === 'signing transactions' || status === 'submitting transactions') && (
                <span className="ml-1 font-bold">{progress.toFixed(1)}%</span>
              )}
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default SpamButton;