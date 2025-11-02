import React from 'react';
import Header from './components/Header.jsx';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import { PetraWallet } from 'petra-plugin-wallet-adapter';

const wallets = [new PetraWallet()];

function App() {
  return (
    <AptosWalletAdapterProvider plugins={wallets} autoConnect={true}>
      <div className="min-h-screen bg-grid-pattern bg-[length:3rem_3rem]">
        <Header />
        <main className="p-4">
          <div className="flex justify-center items-center h-[calc(100vh-200px)]">
              <h2 className="text-4xl text-center font-bold text-gray-400">Welcome to RealityNet</h2>
          </div>
        </main>
      </div>
    </AptosWalletAdapterProvider>
  )
}

export default App
