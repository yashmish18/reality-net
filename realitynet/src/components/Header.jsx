import React from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

const Header = () => {
  const { connect, disconnect, account, connected } = useWallet();

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <header className="p-4 flex justify-between items-center border-b border-purple-500/30 backdrop-blur-sm bg-black/10 sticky top-0 z-50">
      <h1 className="text-2xl font-bold text-purple-400 tracking-wider font-sans">
        RealityNet
      </h1>
      {connected ? (
        <div className="flex items-center gap-4">
          <p className="text-lg text-gray-300 font-mono">{formatAddress(account?.address)}</p>
          <button 
            onClick={disconnect}
            className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 ease-in-out shadow-lg shadow-red-500/20 hover:shadow-red-500/50 border border-red-400"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button 
          onClick={() => connect(wallets[0].name)} // Assuming Petra is the first and only wallet
          className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 ease-in-out shadow-lg shadow-purple-500/20 hover:shadow-purple-500/50 border border-purple-400"
        >
          Connect Wallet
        </button>
      )}
    </header>
  );
};

// This is a bit of a hack because we don't have access to the wallets array from App.jsx
// In a real app, you might use a context or state management to share the wallets array.
const wallets = [{ name: 'Petra' }];

export default Header;
