/// <reference types="vite/client" />

interface Window {
  aptos?: {
    connect: () => Promise<{ address?: string }>
    disconnect: () => Promise<void>
    account: () => Promise<{ address: string }>
    signAndSubmitTransaction: (transaction: any) => Promise<{ hash: string }>
    isConnected: () => Promise<boolean>
    network: () => Promise<string>
  }
  martian?: {
    connect: () => Promise<{ address?: string }>
    disconnect: () => Promise<void>
    account: () => Promise<{ address: string }>
    signAndSubmitTransaction: (transaction: any) => Promise<{ hash: string }>
    isConnected: () => Promise<boolean>
  }
}

