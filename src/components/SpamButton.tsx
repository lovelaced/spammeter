'use client';

import { useReducer, useEffect, useCallback } from 'react';
import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { mnemonicGenerate } from '@polkadot/util-crypto';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowUp, XCircle } from 'lucide-react';
import { AccountInfo } from '@polkadot/types/interfaces';
import { useRef } from 'react';


interface SpamButtonProps {
  rpcUrl: string;
  disabled: boolean;
}

const LIMIT = 5000;

interface State {
  status: string;
  progress: number;
  isRunning: boolean;
  isApiReady: boolean;
  api: ApiPromise | null;
  generatedAccount: { mnemonic: string; address: string } | null;
  workers: Worker[];
  activeRpcUrl: string | null;
}

type Action =
  | { type: 'SET_STATUS'; payload: string }
  | { type: 'SET_PROGRESS'; payload: number }
  | { type: 'SET_API_READY'; payload: boolean }
  | { type: 'SET_RUNNING'; payload: boolean }
  | { type: 'SET_API'; payload: ApiPromise | null }
  | { type: 'SET_GENERATED_ACCOUNT'; payload: { mnemonic: string; address: string } | null }
  | { type: 'SET_WORKERS'; payload: Worker[] }
  | { type: 'SET_ACTIVE_RPC_URL'; payload: string | null };

const initialState: State = {
  status: 'Idle',
  progress: 0,
  isRunning: false,
  isApiReady: false,
  api: null,
  generatedAccount: null,
  workers: [],
  activeRpcUrl: null,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_STATUS':
      return { ...state, status: action.payload };
    case 'SET_PROGRESS':
      return { ...state, progress: action.payload };
    case 'SET_API_READY':
      return { ...state, isApiReady: action.payload };
    case 'SET_RUNNING':
      return { ...state, isRunning: action.payload };
    case 'SET_API':
      return { ...state, api: action.payload };
    case 'SET_GENERATED_ACCOUNT':
      return { ...state, generatedAccount: action.payload };
    case 'SET_WORKERS':
      return { ...state, workers: action.payload };
    case 'SET_ACTIVE_RPC_URL':
      return { ...state, activeRpcUrl: action.payload };
    default:
      return state;
  }
};

let activeWsProvider: WsProvider | null = null;

const cleanupApiAndProvider = async (api: ApiPromise | null) => {
  if (api) {
    console.log('Disconnecting API instance...');
    try {
      await api.disconnect();
    } catch (e) {
      console.warn('Error disconnecting API:', e);
    }
  }
  if (activeWsProvider) {
    console.log('Disconnecting WebSocket provider...');
    try {
      activeWsProvider.disconnect();
    } catch (e) {
      console.warn('Error disconnecting WebSocket provider:', e);
    }
    activeWsProvider = null;
  }
};

export function SpamButton({ rpcUrl, disabled }: SpamButtonProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const timeoutRef = useRef<number | null>(null);

  const initializeApi = useCallback(async (): Promise<ApiPromise | null> => {
    if (state.api && state.activeRpcUrl === rpcUrl) {
      console.log('Reusing existing API instance.');
      return state.api;
    }

    if (!rpcUrl) {
      console.warn('No RPC URL provided. Skipping API initialization.');
      dispatch({ type: 'SET_API_READY', payload: false });
      return null;
    }

    console.log('Initializing new API with RPC URL:', rpcUrl);
    dispatch({ type: 'SET_STATUS', payload: 'Connecting to chain' });
    dispatch({ type: 'SET_API_READY', payload: false });

    await cleanupApiAndProvider(state.api);

    const wsProvider = new WsProvider(rpcUrl);
    activeWsProvider = wsProvider;

    try {
      const apiInstance = await Promise.race([
        ApiPromise.create({ provider: wsProvider }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('API initialization timed out')), 5000)
        ),
      ]);

      if (activeWsProvider !== wsProvider) {
        console.warn('API initialization aborted due to RPC URL change.');
        await apiInstance.disconnect();
        return null;
      }

      console.log('API initialized successfully.');
      dispatch({ type: 'SET_API', payload: apiInstance });
      dispatch({ type: 'SET_API_READY', payload: true });
      dispatch({ type: 'SET_ACTIVE_RPC_URL', payload: rpcUrl });
      dispatch({ type: 'SET_STATUS', payload: 'Idle' });
      return apiInstance;
    } catch (error) {
      console.error('Error during API initialization:', error);
      dispatch({ type: 'SET_STATUS', payload: 'Connection failed, try another!' });
      if (activeWsProvider === wsProvider) {
        wsProvider.disconnect();
        activeWsProvider = null;
      }
      return null;
    }
  }, [rpcUrl, state.api, state.activeRpcUrl]);

  useEffect(() => {
    let isUnmounting = false;
  
    const handleApiReinitialization = async () => {
      if (!rpcUrl) {
        console.warn('No RPC URL provided. Cleaning up API...');
        dispatch({ type: 'SET_API_READY', payload: false });
        if (state.api) {
          await cleanupApiAndProvider(state.api);
          dispatch({ type: 'SET_API', payload: null });
        }
        return;
      }
  
      // reinitialize the api only if the rpcUrl changes
      if (state.api && state.activeRpcUrl === rpcUrl) {
        console.log('Reusing existing API instance.');
        return; // no change in rpcUrl
      }
  
      console.log('RPC URL changed. Reinitializing API...');
      dispatch({ type: 'SET_STATUS', payload: 'Connecting to new chain...' });
  
      if (state.api) {
        await cleanupApiAndProvider(state.api);
        dispatch({ type: 'SET_API', payload: null });
      }
  
      const newApi = await initializeApi();
      if (!isUnmounting) {
        dispatch({ type: 'SET_API', payload: newApi });
      }
    };
  
    handleApiReinitialization().catch((err) => {
      console.error('Error during API reinitialization:', err);
      dispatch({ type: 'SET_STATUS', payload: 'Error connecting to chain.' });
    });
  
    return () => {
      isUnmounting = true;
    };
  }, [rpcUrl]); // triggers when rpcUrl changes
  
  const generateFundedAccount = async (api: ApiPromise) => {
    if (state.generatedAccount) {
      console.log('Checking if existing account is funded...');
      const accountInfo = (await api.query.system.account(state.generatedAccount.address)) as AccountInfo;
  
      if (!accountInfo.data.free.isZero()) {
        console.log('Account already funded:', {
          address: state.generatedAccount.address,
          balance: accountInfo.data.free.toHuman(),
        });
        return state.generatedAccount;
      } else {
        console.log('Existing account has zero balance, generating a new account...');
      }
    }
  
    dispatch({ type: 'SET_STATUS', payload: 'Generating account...' });
  
    console.log('Generating new mnemonic and account...');
    const mnemonic = mnemonicGenerate();
    console.log('Generated mnemonic:', mnemonic);
  
    const keyring = new Keyring({ type: 'sr25519' });
    const account = keyring.addFromMnemonic(mnemonic);
    console.log('Generated account address:', account.address);
  
    try {
      console.log('Requesting funds for account:', account.address);
      const magicMint = api.tx.balances.magicMintExperimental(account.address);
      const hash = await api.rpc.author.submitExtrinsic(magicMint);
      console.log('Submitted mint transaction. Hash:', hash.toHex());
  
      console.log('Waiting for account to be funded...');
      for (let i = 0; i < 10; i++) {
        const accountInfo = (await api.query.system.account(account.address)) as AccountInfo;
       // console.log(`Attempt ${i + 1}: Account balance:`, accountInfo.data.free.toHuman());
  
        if (!accountInfo.data.free.isZero()) {
          console.log('Account funded successfully:', {
            address: account.address,
            balance: accountInfo.data.free.toHuman(),
          });
          const fundedAccount = { mnemonic, address: account.address };
          dispatch({ type: 'SET_GENERATED_ACCOUNT', payload: fundedAccount });
          return fundedAccount;
        }
  
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
  
      throw new Error('Account funding failed after 10 attempts');
    } catch (error) {
      console.error('Error funding account:', error);
      throw error;
    }
  };
  
  
  const runTransfers = async () => {
    if (state.isRunning) {
      console.warn('Run already in progress. Please wait.');
      return;
    }

  // clear any existing timeout to prevent race conditions
  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }
  
    dispatch({ type: 'SET_RUNNING', payload: true });
    dispatch({ type: 'SET_STATUS', payload: 'initializing...' });
    dispatch({ type: 'SET_PROGRESS', payload: 0 });
  
    try {
      // initialize the api
      const apiInstance = await initializeApi();
      if (!apiInstance) {
        throw new Error('API initialization failed.');
      }
  
      // generate a funded account
      dispatch({ type: 'SET_STATUS', payload: 'Generating account...' });
      const fundedAccount = await generateFundedAccount(apiInstance);
      const accountInfo = (await apiInstance.query.system.account(fundedAccount.address)) as AccountInfo;
      const startingNonce = accountInfo.nonce.toNumber();
  
      // configure worker and batching logic
      const batchSize = 100;
      const totalBatches = Math.ceil(LIMIT / batchSize);
      const numCores = navigator.hardwareConcurrency || 4;
      const numWorkers = Math.min(numCores, totalBatches);
      const batchesPerWorker = Math.ceil(totalBatches / numWorkers);
  
      const workerPromises: Promise<void>[] = [];
      const workers: Worker[] = [];
      const signedTxsArrays: string[][] = [];
      const workerProgresses = Array(numWorkers).fill(0);
  
      dispatch({ type: 'SET_STATUS', payload: 'Signing transactions...' });
  
      for (let i = 0; i < numWorkers; i++) {
        const worker = new Worker(new URL('./signingWorker.ts', import.meta.url), { type: 'module' });
        workers.push(worker);
  
        const startBatch = i * batchesPerWorker;
        const endBatch = Math.min((i + 1) * batchesPerWorker, totalBatches);
  
        const workerPromise = new Promise<void>((resolve, reject) => {
          worker.onmessage = ({ data }) => {
            const { signedTxs, error, progress: workerProgress } = data;
  
            if (error) {
              console.error(`Error in worker ${i}:`, error);
              dispatch({ type: 'SET_STATUS', payload: 'Error during signing.' });
              reject(error);
              return;
            }
  
            if (workerProgress !== undefined) {
              workerProgresses[i] = workerProgress;
              const totalWorkerProgress = workerProgresses.reduce((sum, curr) => sum + curr, 0) / numWorkers;
              const totalProgress = (totalWorkerProgress / 100) * 50; // signing is 50% of total progress
              dispatch({ type: 'SET_PROGRESS', payload: totalProgress });
              return;
            }
  
            if (signedTxs) {
        //      console.log(`Worker ${i} completed signing ${signedTxs.length} batches.`);
              signedTxsArrays[i] = signedTxs;
              resolve();
            }
          };
  
          worker.onerror = (error) => {
            console.error(`Worker ${i} encountered an error:`, error);
            dispatch({ type: 'SET_STATUS', payload: 'Error during signing.' });
            reject(error);
          };
        });
  
        worker.postMessage({
          privateKey: fundedAccount.mnemonic,
          startIndex: startBatch * batchSize,
          limit: (endBatch - startBatch) * batchSize,
          baseNonce: startingNonce + startBatch,
          rpcUrl: rpcUrl,
          batchSize,
        });
  
        workerPromises.push(workerPromise);
      }
  
      console.log('Waiting for all workers to complete signing...');
      await Promise.all(workerPromises);
  
      const allSignedTxs = signedTxsArrays.flat();
  
      console.log(`All workers completed signing.`);
      dispatch({ type: 'SET_STATUS', payload: 'Submitting transactions...' });
      dispatch({ type: 'SET_PROGRESS', payload: 50 }); // start submission phase
  
      for (let i = 0; i < allSignedTxs.length; i++) {
        try {
          const txHex = allSignedTxs[i];
          await apiInstance.rpc.author.submitExtrinsic(txHex);
          //console.log(`Transaction ${i + 1}/${allSignedTxs.length} submitted successfully.`);
          const submissionProgress = ((i + 1) / allSignedTxs.length) * 50; // submission phase is 50%
          dispatch({ type: 'SET_PROGRESS', payload: 50 + submissionProgress });
        } catch (error) {
          console.error(`Failed to submit transaction ${i + 1}:`, error);
        }
      }
  
      console.log('All transactions submitted successfully.');
      dispatch({ type: 'SET_STATUS', payload: 'Complete' });
      dispatch({ type: 'SET_PROGRESS', payload: 100 });
  
      timeoutRef.current = window.setTimeout(() => {
        dispatch({ type: 'SET_STATUS', payload: 'Idle' });
        timeoutRef.current = null;
      }, 1000);
    } catch (error) {
      console.error('Error during transfers:', error);
      dispatch({ type: 'SET_STATUS', payload: 'Error occurred.' });
    } finally {
      dispatch({ type: 'SET_RUNNING', payload: false });
    }
  };
  
  
  return (
    <div className="w-80 flex flex-col items-start space-y-2">
      <Button
        onClick={runTransfers}
        disabled={!rpcUrl || !state.isApiReady || disabled || state.isRunning}
        className={`w-full h-[38px] bg-black text-white border-4 border-black px-4 py-2 text-sm font-bold transition-colors shadow-md relative overflow-hidden group ${
          !rpcUrl || !state.isApiReady || disabled || state.isRunning
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-white hover:text-black'
        }`}
      >
        <span className="relative z-10 flex items-center justify-center">
          {state.isRunning ? (
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
          ) : state.status === 'Connection failed, try another!' ? (
            // API connection failed
            <span className="flex items-center text-red-600">
              <XCircle className="mr-2 h-4 w-4" />
              API not initialized
            </span>
          ) : !state.isApiReady ? (
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
      <SpamStatus status={state.status} progress={state.progress} />
    </div>
  );
  
}

function SpamStatus({ status, progress }: { status: string; progress: number }) {
  return (
    <div className="w-full space-y-1">
      <div className="flex justify-between items-center">
        <p className="text-xs font-medium">{`Status: ${status}`}</p>
        {(status === 'Signing transactions...' ||
          status === 'Submitting transactions...' ||
          status === 'Running transfers...') && (
          <p className="text-xs font-bold">{`${progress.toFixed(1)}%`}</p>
        )}
      </div>
    </div>
  );
}


export default SpamButton;