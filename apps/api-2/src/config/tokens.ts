import { base, baseSepolia } from 'viem/chains';

// Fill these with your actual contract addresses per chain.
// Keep empty string to disable on that chain until ready.
export const USDC = {
  [base.id]: '' as `0x${string}`,
  [baseSepolia.id]: '' as `0x${string}`,
} as const;

export const USDT = {
  [base.id]: '' as `0x${string}`,
  [baseSepolia.id]: '' as `0x${string}`,
} as const;

export type ChainId = keyof typeof USDC | keyof typeof USDT;
