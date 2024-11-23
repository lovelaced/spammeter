'use client';

import { useState, useEffect } from 'react';
import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { mnemonicGenerate } from '@polkadot/util-crypto';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowUp, XCircle } from 'lucide-react';
import { AccountInfo } from '@polkadot/types/interfaces';

interface SpamButtonProps {
  rpcUrl: string;
  disabled: boolean;
}

const LIMIT = 5000;

export function SpamButton({ rpcUrl, disabled }: SpamButtonProps) {
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [isApiReady, setIsApiReady] = useState(false);
  const [generatedAccount, setGeneratedAccount] = useState<{ mnemonic: string; address: string } | null>(null);

  let activeWsProvider: WsProvider | null = null; // Track the active websocket provider

  const initializeApi = async (): Promise<ApiPromise | null> => {
    const timeout = 5_000; // 5 seconds timeout for API initialization
  
    // Cleanup old API instance and WebSocket provider
    if (api) {
      console.log('Cleaning up previous API instance...');
      try {
        await api.disconnect();
      } catch (e) {
        console.warn('Failed to clean up old API instance:', e);
      }
      setApi(null);
    }
  
    if (activeWsProvider) {
      console.log('Terminating old WebSocket provider...');
      try {
        activeWsProvider.disconnect(); // Explicitly close the WebSocket
      } catch (e) {
        console.warn('Failed to terminate old WebSocket provider:', e);
      }
      activeWsProvider = null;
    }
  
    if (!rpcUrl) {
      console.log('No RPC URL provided. Skipping API initialization.');
      setIsApiReady(false);
      return null;
    }
  
    console.log('Initializing API with RPC URL:', rpcUrl);
    setIsApiReady(false);
    setStatus('Connecting to chain');
  
    const wsProvider = new WsProvider(rpcUrl); // Use default reconnect logic
    activeWsProvider = wsProvider; // Track the new provider
  
    const initApi = async (): Promise<ApiPromise | null> => {
      try {
        const apiInstance = await Promise.race([
          ApiPromise.create({ provider: wsProvider }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('API initialization timed out')), timeout)
          ),
        ]);
  
        if (activeWsProvider !== wsProvider) {
          console.warn('API initialization aborted due to RPC URL change.');
          await apiInstance.disconnect();
          return null;
        }
  
        console.log('API initialized successfully.');
        setApi(apiInstance);
        setIsApiReady(true);
        setStatus('Idle');
        return apiInstance;
      } catch (error) {
        console.error('Error during API initialization:', error);
  
        // Update the status with a user-friendly message
        setStatus('Connection failed, try another!');
        setIsApiReady(false);
  
        // Cleanup failed provider
        if (activeWsProvider === wsProvider) {
          console.log('Cleaning up failed WebSocket provider...');
          wsProvider.disconnect();
          activeWsProvider = null;
        }
  
        return null;
      }
    };
  
    return initApi();
  };
  
  
  useEffect(() => {
    const abortController = new AbortController();
  
    if (rpcUrl) {
      initializeApi().catch((error) => console.error('Failed to initialize API:', error));
    } else {
      setIsApiReady(false);
      if (api) {
        console.log('Disconnecting API as RPC URL is unset...');
        api.disconnect().catch((e) => console.warn('Error disconnecting API:', e));
        setApi(null);
      }
      if (activeWsProvider) {
        console.log('Terminating active WebSocket provider...');
        activeWsProvider.disconnect();
        activeWsProvider = null;
      }
    }
  
    // Cleanup logic for unmounting or rpcUrl change
    return () => {
      abortController.abort();
      if (api) {
        console.log('Cleaning up API instance...');
        api.disconnect().catch((e) => console.warn('Error during API cleanup:', e));
        setApi(null);
      }
      if (activeWsProvider) {
        console.log('Cleaning up WebSocket provider...');
        activeWsProvider.disconnect();
        activeWsProvider = null;
      }
    };
  }, [rpcUrl]);
  

  const generateFundedAccount = async (api: ApiPromise) => {
    if (generatedAccount) {
      console.log('Reusing generated account:', generatedAccount);
      const accountInfo = (await api.query.system.account(generatedAccount.address)) as AccountInfo;
  
      if (!accountInfo.data.free.isZero()) {
        console.log('Account already funded:', generatedAccount.address);
        return generatedAccount; // reuse the existing account
      } else {
        console.log('Account exists but has zero balance, requesting funds again...');
      }
    }
  
    // generate a new account if no valid existing one
    const mnemonic = mnemonicGenerate();
    console.log('Generated mnemonic:', mnemonic);
  
    const keyring = new Keyring({ type: 'sr25519' });
    const account = keyring.addFromMnemonic(mnemonic);
    const address = account.address;
  
    console.log('Generated account address:', address);
  
    try {
      console.log(`Requesting funds for account: ${address}`);
      const magicMint = api.tx.balances.magicMintExperimental(address);
      const hash = await api.rpc.author.submitExtrinsic(magicMint);
      console.log('Submitted magicMintExperimental extrinsic with hash:', hash.toHex());
  
      let balance = (await api.query.system.account(address)) as AccountInfo;
      let retries = 10;
      while (balance.data.free.isZero() && retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 6000));
        balance = (await api.query.system.account(address)) as AccountInfo;
        retries--;
      }
  
      if (balance.data.free.isZero()) {
        throw new Error('Account did not receive funds');
      }
  
      console.log('Account funded successfully!');
      const fundedAccount = { mnemonic, address };
      setGeneratedAccount(fundedAccount); // store the account in state
      return fundedAccount;
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
      if (!apiInstance) {
        throw new Error('API instance is not initialized');
      }
      const fundedAccount = await generateFundedAccount(apiInstance);
      console.log('Funded account:', fundedAccount);

      // fetch starting nonce
      const accountInfo = await apiInstance.query.system.account(fundedAccount.address) as AccountInfo;
      const startingNonce = accountInfo.nonce.toNumber();

      console.log(`Fetched starting nonce for Alice: ${startingNonce}`);
      console.log(`Total transactions to be signed (LIMIT): ${LIMIT}`);

      setStatus('signing transactions');

      const batchSize = 100; // transactions per batch
      const totalBatches = Math.ceil(LIMIT / batchSize); // total number of batches
      console.log(`Batch size: ${batchSize}`);
      console.log(`Total batches: ${totalBatches}`);

      const numCores = navigator.hardwareConcurrency || 4;
      const numWorkers = Math.min(numCores, totalBatches); // limit workers to available batches
      console.log(`Number of available CPU cores: ${numCores}`);
      console.log(`Number of workers to be spawned: ${numWorkers}`);

      const batchesPerWorker = Math.ceil(totalBatches / numWorkers); // distribute batches evenly
      console.log(`Batches per worker: ${batchesPerWorker}`);

      const workerPromises = [];
      const signedTxsArrays: string[][] = [];
      const workerProgresses = new Array(numWorkers).fill(0);

      for (let i = 0; i < numWorkers; i++) {
        const worker = new Worker(new URL('./signingWorker.ts', import.meta.url), { type: 'module' });

        const startBatch = i * batchesPerWorker; // starting batch index for this worker
        const endBatch = Math.min((i + 1) * batchesPerWorker, totalBatches); // ending batch index
        const workerBatches = endBatch - startBatch;
        const workerBaseNonce = startingNonce + startBatch; // nonce incremented per batch

        console.log(`Worker ${i}:`);
        console.log(`  Start batch index: ${startBatch}`);
        console.log(`  End batch index: ${endBatch}`);
        console.log(`  Total batches assigned: ${workerBatches}`);
        console.log(`  Base nonce for this worker: ${workerBaseNonce}`);

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
              workerProgresses[i] = workerProgress;
              const totalWorkerProgress = workerProgresses.reduce((sum, curr) => sum + curr, 0) / numWorkers;
              const totalProgress = (totalWorkerProgress / 100) * 50; // signing is 50% of total progress
              setProgress(totalProgress);
              return;
            }

            if (signedTxs) {
              console.log(`Worker ${i} completed signing ${signedTxs.length} batches.`);
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

        worker.postMessage({
          privateKey: fundedAccount.mnemonic,
          startIndex: startBatch * batchSize, // start index for transactions
          limit: workerBatches * batchSize, // total transactions for this worker
          baseNonce: workerBaseNonce, // nonce for the first batch
          apiInstanceUrl: rpcUrl,
          batchSize, // size of each batch
        });

        workerPromises.push(workerPromise);
      }

      console.log('Waiting for all workers to complete signing...');
      await Promise.all(workerPromises);

      const allSignedTxs = signedTxsArrays.flat();
      console.log(`All workers completed. Total signed batches: ${allSignedTxs.length}`);

      setStatus('submitting transactions');
      setProgress(50);

      for (let i = 0; i < allSignedTxs.length; i++) {
        try {
          const txHex = allSignedTxs[i];
          await apiInstance.rpc.author.submitExtrinsic(txHex);
          console.log(`Batch ${i + 1}/${allSignedTxs.length} submitted successfully.`);
          const submissionProgress = ((i + 1) / allSignedTxs.length) * 50; // submission phase is 50%
          setProgress(50 + submissionProgress);
        } catch (error) {
          console.error(`Failed to submit batch ${i + 1}`, error);
        }
      }

      setStatus('completed');
      setProgress(100);
      console.log('All batches submitted successfully.');

      setIsRunning(false);

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
        disabled={!rpcUrl || !isApiReady || disabled || isRunning} // Disable until chain is selected, API is ready, or running
        className={`w-full h-[38px] bg-black text-white border-4 border-black px-4 py-2 text-sm font-bold transition-colors shadow-md relative overflow-hidden group ${
          !rpcUrl || !isApiReady || disabled || isRunning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white hover:text-black'
        }`}
      >
        <span className="relative z-10 flex items-center justify-center">
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running spam program...
            </>
          ) : !rpcUrl ? (
            // No chain selected
            <span className="flex items-center">
              <span className="hidden sm:block">&lt;-- Select a chain to spam</span>
              <span className="block sm:hidden flex items-center">
                <ArrowUp className="mr-2 h-4 w-4" />
                Select a chain to spam
              </span>
            </span>
          ) : status === 'Connection failed, try another!' ? (
            // API connection failed
            <span className="flex items-center text-red-600">
              <XCircle className="mr-2 h-4 w-4" />
              API not initialized
            </span>
          ) : !isApiReady ? (
            // API is initializing
            <span className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Initializing API...
            </span>
          ) : (
            // Ready to spam
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
          {status !== 'idlez' && (
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
