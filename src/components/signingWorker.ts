// signingWorker.ts

/// <reference lib="webworker" />
export default null;

import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import type { AccountInfo } from '@polkadot/types/interfaces';
import { cryptoWaitReady } from '@polkadot/util-crypto';

self.onmessage = async (event) => {
  const { privateKey, startIndex, limit, apiInstanceUrl } = event.data;

  try {
    await cryptoWaitReady();

    const wsProvider = new WsProvider(apiInstanceUrl);
    const api = await ApiPromise.create({ provider: wsProvider });
    const genesisHash = api.genesisHash;
    //const runtimeVersion = api.runtimeVersion;
    const keyring = new Keyring({ type: 'sr25519' });

    const alice = keyring.addFromUri(privateKey);
    const aliceAddress = alice.address;


    // Fetch the account information and cast it to AccountInfo
    const accountInfo = (await api.query.system.account(aliceAddress)) as AccountInfo;
    const startingNonce = accountInfo.nonce.toNumber();
    const baseNonce = startingNonce + startIndex;

    const signedTxs = [];

    for (let i = 0; i < limit; i++) {
      const txNonce = baseNonce + i;
      const receiverIndex = startIndex + i;
      const receiverKeyPair = keyring.addFromUri(`//Receiver/${receiverIndex}`, { name: `Receiver ${receiverIndex}` });
      const receiverAddress = receiverKeyPair.address;

      const tx = api.tx.balances.transferKeepAlive(receiverAddress, 1_000_000_000_000);

      // Sign the transaction using signAsync
      await tx.signAsync(alice, {
        nonce: txNonce,
        era: 0,
        blockHash: genesisHash,
        // specVersion: runtimeVersion.specVersion,
        // transactionVersion: runtimeVersion.transactionVersion,
      });

      // Serialize the signed transaction
      const signedTxHex = tx.toHex();
      signedTxs.push(signedTxHex);

      // Optionally, send progress updates to the main thread
// In signingWorker.ts
if ((i + 1) % Math.max(1, Math.floor(limit / 100)) === 0) {
  const progress = ((i + 1) / limit) * 100 // Progress between 0 and 100
  self.postMessage({ progress })
}

    }

    self.postMessage({ signedTxs });
  } catch (error) {
    if (error instanceof Error) {
      self.postMessage({ error: error.message });
    } else {
      self.postMessage({ error: String(error) });
    }
  }
};
