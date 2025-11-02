import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useWallet } from '../contexts/WalletContext'

export default function Navbar() {
  const location = useLocation()
  const { address, connected, connect, disconnect } = useWallet()

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/upload', label: 'Upload Reality' },
    { path: '/explore', label: 'Explore' },
    { path: '/dao', label: 'DAO' },
    { path: '/profile', label: 'Profile' },
  ]

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-white/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              className="w-10 h-10 holographic rounded-lg"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-cosmic-cyan to-cosmic-pink bg-clip-text text-transparent">
              RealityNet
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {[
              { path: '/', label: 'Home' },
              { path: '/feed', label: 'Feed' },
              { path: '/upload', label: 'Upload' },
              { path: '/explore', label: 'Explore' },
              { path: '/dao', label: 'DAO' },
              { path: '/profile', label: 'Profile' },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-3 py-2 transition-colors ${
                  location.pathname === item.path
                    ? 'text-cosmic-cyan'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {item.label}
                {location.pathname === item.path && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cosmic-cyan to-cosmic-pink"
                    layoutId="underline"
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {connected ? (
              <>
                <span className="text-sm text-gray-400">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                <button
                  onClick={disconnect}
                  className="px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={connect}
                className="px-6 py-2 bg-gradient-to-r from-cosmic-purple to-cosmic-blue rounded-lg hover:opacity-90 transition-opacity font-semibold"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

