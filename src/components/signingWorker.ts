// signingWorker.ts

/// <reference lib="webworker" />
export default null;

import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { cryptoWaitReady } from '@polkadot/util-crypto';

self.onmessage = async (event) => {
  const { mnemonic, startIndex, limit, apiInstanceUrl, nonce } = event.data;

  try {
    await cryptoWaitReady();

    const wsProvider = new WsProvider(apiInstanceUrl);
    const api = await ApiPromise.create({ provider: wsProvider });

    const genesisHash = api.genesisHash;
    const keyring = new Keyring({ type: 'sr25519' });

    const sender = keyring.addFromMnemonic(mnemonic);

    const transfers = [];

    for (let i = 0; i < limit; i++) {
      const receiverIndex = startIndex + i;
      const receiverKeyPair = keyring.addFromUri(`//Receiver/${receiverIndex}`, { name: `Receiver ${receiverIndex}` });
      const receiverAddress = receiverKeyPair.address;

      const tx = api.tx.balances.transferKeepAlive(receiverAddress, 1_000_000_000_000);
      transfers.push(tx);

      // Optionally send progress updates
      if ((i + 1) % Math.max(1, Math.floor(limit / 100)) === 0) {
        const progress = ((i + 1) / limit) * 100; // Progress between 0 and 100
        self.postMessage({ progress });
      }
    }

    // Create a batched transaction
    const batchedTx = api.tx.utility.batch(transfers);

    // Sign the batched transaction
    await batchedTx.signAsync(sender, {
      nonce: nonce,
      era: 0,
      blockHash: genesisHash,
    });

    // Serialize the signed batched transaction
    const signedTxHex = batchedTx.toHex();

    // Send the signed batched transaction back to the main thread
    self.postMessage({ signedTxs: [signedTxHex] });
  } catch (error) {
    if (error instanceof Error) {
      self.postMessage({ error: error.message });
    } else {
      self.postMessage({ error: String(error) });
    }
  }
};
