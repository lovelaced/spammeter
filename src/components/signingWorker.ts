/// <reference lib="webworker" />
export default null;

import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { cryptoWaitReady } from '@polkadot/util-crypto';

self.onmessage = async (event) => {
  const { privateKey, startIndex, limit, baseNonce, rpcUrl, batchSize } = event.data;

  try {
    await cryptoWaitReady();

    const wsProvider = new WsProvider(rpcUrl);
    const api = await ApiPromise.create({ provider: wsProvider });
    const keyring = new Keyring({ type: 'sr25519' });

    const alice = keyring.addFromUri(privateKey);

    const signedTxs = [];
    let batch = [];
    let currentBatchNonce = baseNonce;

    for (let i = 0; i < limit; i++) {
      const receiverIndex = startIndex + i;
      const receiverKeyPair = keyring.addFromUri(`//Receiver/${receiverIndex}`, { name: `Receiver ${receiverIndex}` });
      const receiverAddress = receiverKeyPair.address;

      const tx = api.tx.balances.transferKeepAlive(receiverAddress, 1_000);
      batch.push(tx);

      if (batch.length === batchSize || i === limit - 1) {
        const batchTx = api.tx.utility.batch(batch);
        await batchTx.signAsync(alice, { nonce: currentBatchNonce });
        signedTxs.push(batchTx.toHex());

        currentBatchNonce++;
        batch = [];
      }

      if ((i + 1) % Math.max(1, Math.floor(limit / 100)) === 0) {
        const progress = ((i + 1) / limit) * 100;
        self.postMessage({ progress });
      }
    }

    self.postMessage({ signedTxs });
  } catch (error) {
    self.postMessage({ error: error instanceof Error ? error.message : String(error) });
  }
};
