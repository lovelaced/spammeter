// src/types/chains.ts
import { Zap, Rabbit, Contact, Mail, ArrowsUpFromLine, Bitcoin, Power, Bird, Cloud, Heart, Smile, Globe, Sun, Snail, Cat, Beer, Dog, Turtle, Fish, Bug, Leaf, Moon, Stars, ChartCandlestick, Worm, Coins,  } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Define the type for Chain
export type ChainsConfig = Record<string, ChainConfig>;

// Chain configuration for different parachains
export type ChainConfig = {
  paraId: number;
  displayName: string;
  icon?: LucideIcon;
  color?: string;
  rpcUrl?: string;
};

// Create a central configuration object for chains
export const polkadotChainsConfig: ChainsConfig = {
  Polkadot: { paraId: 1, displayName: 'Polkadot' },
  AssetHub: { paraId: 1000, displayName: 'AssetHub' },
  BridgeHub: { paraId: 1002, displayName: 'BridgeHub' },
  Collectives: { paraId: 1001, displayName: 'Collectives' },
  Coretime: { paraId: 1005, displayName: 'Coretime' },
  People: { paraId: 1004, displayName: 'People' },
  Acala: { paraId: 2000, displayName: 'Acala' },
  Ajuna: { paraId: 2051, displayName: 'Ajuna Network' },
  Astar: { paraId: 2006, displayName: 'Astar' },
  Aventus: { paraId: 2056, displayName: 'Aventus' },
  Bifrost: { paraId: 2030, displayName: 'Bifrost' },
  Bitgreen: { paraId: 2048, displayName: 'Bitgreen' },
  Centrifuge: { paraId: 2031, displayName: 'Centrifuge' },
  Composable: { paraId: 2019, displayName: 'Composable Finance' },
  Continuum: { paraId: 3346, displayName: 'Continuum' },
  Crust: { paraId: 2008, displayName: 'Crust' },
  Darwinia: { paraId: 2046, displayName: 'Darwinia' },
  EnergyWebX: { paraId: 3345, displayName: 'Energy Web X' },
  Frequency: { paraId: 2091, displayName: 'Frequency' },
  Hashed: { paraId: 2093, displayName: 'Hashed Network' },
  Hydration: { paraId: 2034, displayName: 'Hydration' },
  Integritee: { paraId: 3359, displayName: 'Integritee Network' },
  Interlay: { paraId: 2032, displayName: 'Interlay' },
  InvArch: { paraId: 3340, displayName: 'InvArch' },
  KILT: { paraId: 2086, displayName: 'KILT Spiritnet' },
  Laos: { paraId: 3370, displayName: 'Laos' },
  Litentry: { paraId: 2013, displayName: 'Litentry' },
  Logion: { paraId: 3354, displayName: 'Logion' },
  Manta: { paraId: 2104, displayName: 'Manta' },
  Moonbeam: { paraId: 2004, displayName: 'Moonbeam' },
  Mythos: { paraId: 3369, displayName: 'Mythos' },
  NeuroWeb: { paraId: 2043, displayName: 'NeuroWeb' },
  Nodle: { paraId: 2026, displayName: 'Nodle' },
  Pendulum: { paraId: 2094, displayName: 'Pendulum' },
  Phala: { paraId: 2035, displayName: 'Phala Network' },
  Polimec: { paraId: 3344, displayName: 'Polimec' },
  Polkadex: { paraId: 2040, displayName: 'Polkadex' },
  Robonomics: { paraId: 3388, displayName: 'Robonomics' },
  SORA: { paraId: 2025, displayName: 'SORA' },
  Subsocial: { paraId: 2101, displayName: 'Subsocial' },
  t3rn: { paraId: 3333, displayName: 't3rn' },
  Unique: { paraId: 2037, displayName: 'Unique Network' },
  Zeitgeist: { paraId: 2092, displayName: 'Zeitgeist' },
} as const;

export const kusamaChainsConfig: ChainsConfig = {
  YAP3363: { paraId: 3363, displayName: 'YAP3363', icon: Bird, color: '#3316F3', rpcUrl: "wss://kusama-yap-3363.parity-chains.parity.io" }, // Blue
  YAP3362: { paraId: 3362, displayName: 'YAP3362', icon: Snail, color: '#2BD900', rpcUrl: "wss://kusama-yap-3362.parity-chains.parity.io" }, // Green
  YAP3361: { paraId: 3361, displayName: 'YAP3361', icon: Cat, color: '#FACC14', rpcUrl: "wss://kusama-yap-3361.parity-chains.parity.io" }, // Yellow
  YAP3360: { paraId: 3360, displayName: 'YAP3360', icon: Beer, color: '#FF7926', rpcUrl: "wss://kusama-yap-3360.parity-chains.parity.io" }, // Orange
  YAP3359: { paraId: 3359, displayName: 'YAP3359', icon: Rabbit, color: '#FF2670', rpcUrl: "wss://kusama-yap-3359.parity-chains.parity.io" }, // Pink
  YAP3379: { paraId: 3379, displayName: 'YAP3379', icon: Dog, color: '#7F16F3', rpcUrl: "wss://kusama-yap-3379.parity-chains.parity.io" }, // Purple
  YAP3380: { paraId: 3380, displayName: 'YAP3380', icon: Turtle, color: '#1ADDA8', rpcUrl: "wss://kusama-yap-3380.parity-chains.parity.io" }, // Teal
  YAP3381: { paraId: 3381, displayName: 'YAP3381', icon: Leaf, color: '#F07D16', rpcUrl: "wss://kusama-yap-3381.parity-chains.parity.io" }, // Burnt Orange
  YAP3382: { paraId: 3382, displayName: 'YAP3382', icon: Worm, color: '#F31689', rpcUrl: "wss://kusama-yap-3382.parity-chains.parity.io" }, // Magenta
  YAP3383: { paraId: 3383, displayName: 'YAP3383', icon: ChartCandlestick, color: '#16A2F3', rpcUrl: "wss://kusama-yap-3383.parity-chains.parity.io" }, // Sky Blue
  YAP3384: { paraId: 3384, displayName: 'YAP3384', icon: Fish, color: '#13D916', rpcUrl: "wss://kusama-yap-3384.parity-chains.parity.io" }, // Bright Green
  YAP3385: { paraId: 3385, displayName: 'YAP3385', icon: Bug, color: '#E916F3', rpcUrl: "wss://kusama-yap-3385.parity-chains.parity.io" }, // Neon Purple
  YAP3386: { paraId: 3386, displayName: 'YAP3386', icon: Stars, color: '#F3A216', rpcUrl: "wss://kusama-yap-3386.parity-chains.parity.io" }, // Golden Orange
  YAP3387: { paraId: 3387, displayName: 'YAP3387', icon: Moon, color: '#168CF3', rpcUrl: "wss://kusama-yap-3387.parity-chains.parity.io" }, // Deep Blue
  YAP3388: { paraId: 3388, displayName: 'YAP3388', icon: Coins, color: '#D91645', rpcUrl: "wss://kusama-yap-3388.parity-chains.parity.io" }, // Crimson
  Kusama: { paraId: 2, displayName: 'Kusama' },
  AssetHub: { paraId: 1000, displayName: 'AssetHub' },
  BridgeHub: { paraId: 1002, displayName: 'BridgeHub' },
  Collectives: { paraId: 1001, displayName: 'Collectives' },
  Coretime: { paraId: 1005, displayName: 'Coretime' },
  People: { paraId: 1004, displayName: 'People' },
  Acurast: { paraId: 2239, displayName: 'Acurast' },
  Altair: { paraId: 2088, displayName: 'Altair' },
  Amplitude: { paraId: 2124, displayName: 'Amplitude' },
  Bajun: { paraId: 2119, displayName: 'Bajun' },
  Basilisk: { paraId: 2090, displayName: 'Basilisk' },
  Bifrost: { paraId: 2001, displayName: 'Bifrost' },
  Calamari: { paraId: 2084, displayName: 'Calamari' },
  Crab: { paraId: 2105, displayName: 'Crab' },
  Crust: { paraId: 2012, displayName: 'Crust Shadow' },
  Curio: { paraId: 3339, displayName: 'Curio' },
  Imbue: { paraId: 2121, displayName: 'Imbue' },
  Integritee: { paraId: 2015, displayName: 'Integritee' },
  InvArch: { paraId: 2125, displayName: 'InvArch Tinkernet' },
  Karura: { paraId: 2000, displayName: 'Karura' },
  Khala: { paraId: 2004, displayName: 'Khala' },
  KintsugiBTC: { paraId: 2092, displayName: 'Kintsugi BTC' },
  Krest: { paraId: 2241, displayName: 'Krest' },
  Moonriver: { paraId: 2023, displayName: 'Moonriver' },
  Parallel: { paraId: 2085, displayName: 'Parallel Heiko' },
  Picasso: { paraId: 2087, displayName: 'Picasso' },
  QUARTZ: { paraId: 2095, displayName: 'QUARTZ by UNIQUE' },
  Robonomics: { paraId: 2048, displayName: 'Robonomics' },
  Robonomics2: { paraId: 2240, displayName: 'Robonomics 2' },
  Shiden: { paraId: 2007, displayName: 'Shiden' },
  Shiden2: { paraId: 2120, displayName: 'Shiden 2' },
  SORA: { paraId: 2011, displayName: 'SORA' },
  Turing: { paraId: 2114, displayName: 'Turing' },
  Xode: { paraId: 3344, displayName: 'Xode' },
  ZERO: { paraId: 2236, displayName: 'ZERO' },
  Encointer: { paraId: 1001, displayName: 'Encointer' },

} as const;

export const westendChainsConfig: ChainsConfig = {
  Westend: { paraId: 3, displayName: 'Westend', icon: ArrowsUpFromLine, color: '#FF2670' }, // Pink
  Assethub: { paraId: 1000, displayName: 'Assethub', icon: Bitcoin, color: '#7916F3' }, // Purple
  Bridgehub: { paraId: 1002, displayName: 'Bridgehub', icon: Mail, color: '#3316F3' }, // Dark Blue
  Collectives: { paraId: 1001, displayName: 'Collectives', icon: Power, color: '#FF7926' }, // Orange
  Coretime: { paraId: 1005, displayName: 'Coretime', icon: Zap, color: '#2BD900' }, // Green
  People: { paraId: 1004, displayName: 'People', icon: Contact, color: '#FACC14' }, // Yellow
  YAP2022: { paraId: 2022, displayName: 'YAP2022', icon: Rabbit, color: '#FF262A' }, // Red
  YAPersi2020: { paraId: 2020, displayName: 'Versi-2020' },
  YAPVersi2021: { paraId: 2021, displayName: 'YAP-Versi-2021', icon: Bird, color: '#16A2F3', rpcUrl: "wss://versi-yap-2021.parity-versi.parity.io" }, // Blue
  YAPVersi2022: { paraId: 2022, displayName: 'YAP-Versi-2022', icon: Turtle, color: '#F39C12', rpcUrl: "wss://versi-yap-2022.parity-versi.parity.io" }, // Orange
  YAPVersi2023: { paraId: 2023, displayName: 'YAP-Versi-2023', icon: Zap, color: '#E74C3C', rpcUrl: "wss://versi-yap-2023.parity-versi.parity.io" }, // Red
  YAPVersi2024: { paraId: 2024, displayName: 'YAP-Versi-2024', icon: Stars, color: '#27AE60', rpcUrl: "wss://versi-yap-2024.parity-versi.parity.io" }, // Green
  YAPVersi2025: { paraId: 2025, displayName: 'YAP-Versi-2025', icon: Sun, color: '#8E44AD', rpcUrl: "wss://versi-yap-2025.parity-versi.parity.io" }, // Purple
  YAPVersi2026: { paraId: 2026, displayName: 'YAP-Versi-2026', icon: Moon, color: '#34495E', rpcUrl: "wss://versi-yap-2026.parity-versi.parity.io" }, // Dark Gray
  YAPVersi2027: { paraId: 2027, displayName: 'YAP-Versi-2027', icon: Cloud, color: '#95A5A6', rpcUrl: "wss://versi-yap-2027.parity-versi.parity.io" }, // Light Gray
  YAPVersi2028: { paraId: 2028, displayName: 'YAP-Versi-2028', icon: Heart, color: '#C0392B', rpcUrl: "wss://versi-yap-2028.parity-versi.parity.io" }, // Crimson
  YAPVersi2029: { paraId: 2029, displayName: 'YAP-Versi-2029', icon: Smile, color: '#F1C40F', rpcUrl: "wss://versi-yap-2029.parity-versi.parity.io" }, // Yellow
  YAPVersi2030: { paraId: 2030, displayName: 'YAP-Versi-2030', icon: Globe, color: '#2ECC71', rpcUrl: "wss://versi-yap-2030.parity-versi.parity.io" }, // Emerald
  YAPVersi2031: { paraId: 2031, displayName: 'YAP-Versi-2031', rpcUrl: "wss://versi-yap-2031.parity-versi.parity.io" },
  YAPVersi2032: { paraId: 2032, displayName: 'YAP-Versi-2032', rpcUrl: "wss://versi-yap-2032.parity-versi.parity.io" },
  YAPVersi2033: { paraId: 2033, displayName: 'YAP-Versi-2033', rpcUrl: "wss://versi-yap-2033.parity-versi.parity.io" },
  YAPVersi2034: { paraId: 2034, displayName: 'YAP-Versi-2034', rpcUrl: "wss://versi-yap-2034.parity-versi.parity.io" },
  YAPVersi2035: { paraId: 2035, displayName: 'YAP-Versi-2035', rpcUrl: "wss://versi-yap-2035.parity-versi.parity.io" },
  YAPVersi2036: { paraId: 2036, displayName: 'YAP-Versi-2036', rpcUrl: "wss://versi-yap-2036.parity-versi.parity.io" },
  YAPVersi2037: { paraId: 2037, displayName: 'YAP-Versi-2037', rpcUrl: "wss://versi-yap-2037.parity-versi.parity.io" },
  YAPVersi2038: { paraId: 2038, displayName: 'YAP-Versi-2038', rpcUrl: "wss://versi-yap-2038.parity-versi.parity.io" },
  YAPVersi2039: { paraId: 2039, displayName: 'YAP-Versi-2039', rpcUrl: "wss://versi-yap-2039.parity-versi.parity.io" },
  YAPVersi2040: { paraId: 2040, displayName: 'YAP-Versi-2040', rpcUrl: "wss://versi-yap-2040.parity-versi.parity.io" },
  YAPVersi2041: { paraId: 2041, displayName: 'YAP-Versi-2041', rpcUrl: "wss://versi-yap-2041.parity-versi.parity.io" },
  YAPVersi2042: { paraId: 2042, displayName: 'YAP-Versi-2042', rpcUrl: "wss://versi-yap-2042.parity-versi.parity.io" },
  YAPVersi2043: { paraId: 2043, displayName: 'YAP-Versi-2043', rpcUrl: "wss://versi-yap-2043.parity-versi.parity.io" },
  YAPVersi2044: { paraId: 2044, displayName: 'YAP-Versi-2044', rpcUrl: "wss://versi-yap-2044.parity-versi.parity.io" },
  YAPVersi2045: { paraId: 2045, displayName: 'YAP-Versi-2045', rpcUrl: "wss://versi-yap-2045.parity-versi.parity.io" },
  YAPVersi2046: { paraId: 2046, displayName: 'YAP-Versi-2046', rpcUrl: "wss://versi-yap-2046.parity-versi.parity.io" },
  YAPVersi2047: { paraId: 2047, displayName: 'YAP-Versi-2047', rpcUrl: "wss://versi-yap-2047.parity-versi.parity.io" },
  YAPVersi2048: { paraId: 2048, displayName: 'YAP-Versi-2048', rpcUrl: "wss://versi-yap-2048.parity-versi.parity.io" },
  YAPVersi2049: { paraId: 2049, displayName: 'YAP-Versi-2049', rpcUrl: "wss://versi-yap-2049.parity-versi.parity.io" },
  YAPVersi2050: { paraId: 2050, displayName: 'YAP-Versi-2050', rpcUrl: "wss://versi-yap-2050.parity-versi.parity.io" }
} as const;


// Type for chain names for both networks
export type PolkadotChainName = keyof typeof polkadotChainsConfig;
export type KusamaChainName = keyof typeof kusamaChainsConfig;
export type WestendChainName = keyof typeof westendChainsConfig;

// Extract chain names automatically from the config
export const polkadotChainNames = Object.keys(polkadotChainsConfig) as PolkadotChainName[];
export const kusamaChainNames = Object.keys(kusamaChainsConfig) as KusamaChainName[];
export const westendChainNames = Object.keys(westendChainsConfig) as KusamaChainName[];

// Create paraId to chainName mappings for easier lookup
export const polkadotParaIdToChainName = Object.fromEntries(
  Object.entries(polkadotChainsConfig).map(([chain, config]) => [config.paraId, chain])
) as Record<number, PolkadotChainName>;

export const kusamaParaIdToChainName = Object.fromEntries(
  Object.entries(kusamaChainsConfig).map(([chain, config]) => [config.paraId, chain])
) as Record<number, KusamaChainName>;

export const westendParaIdToChainName = Object.fromEntries(
  Object.entries(westendChainsConfig).map(([chain, config]) => [config.paraId, chain])
) as Record<number, WestendChainName>;

// Define the structure for the metrics of each chain
export type ChainMetrics = {
  tps: number;
  block: number;
  kbps: number;
};

// Define types
export type ChainData = {
  id: string;
  name: string;
  paraId: number;
  relay: string;
  blockNumber: number;
  extrinsics: number;
  accumulatedExtrinsics: number;
  blockTime: number;
  timestamp: number;
  recentBlocks: Array<{ extrinsics: number; blockTime: number; timestamp: number }>;
};

export type BlockData = {
  id: string;
  name: string;
  relay: string;
  blockNumber: number;
  extrinsics: number;
  blockTime: number;
};

