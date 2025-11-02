import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '../contexts/WalletContext'
import { createDAOProposal } from '../services/aptos'

export default function DAO() {
  const { address, connected, aptos } = useWallet()
  const [proposals, setProposals] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    // Mock proposals - replace with actual blockchain query
    setProposals([
      {
        id: 1,
        title: 'Update Oracle Validators',
        description: 'Add new oracle validators to improve verification accuracy',
        votesFor: 1500000,
        votesAgainst: 200000,
        endTime: Date.now() + 86400000,
        executed: false,
      },
    ])
  }, [])

  const handleCreateProposal = async () => {
    if (!connected || !title || !description) return

    setCreating(true)
    try {
      await createDAOProposal(title, description)
      alert('Proposal created successfully!')
      setTitle('')
      setDescription('')
    } catch (error) {
      console.error('Failed to create proposal:', error)
      alert('Failed to create proposal')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="pt-20 container mx-auto px-4 max-w-6xl">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-cosmic-cyan to-cosmic-pink bg-clip-text text-transparent">
        DAO Governance
      </h1>

      {connected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 mb-8"
        >
          <h2 className="text-2xl font-semibold mb-4">Create Proposal</h2>
          <div className="space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Proposal Title"
              className="w-full px-4 py-3 glass rounded-lg focus:outline-none focus:ring-2 focus:ring-cosmic-cyan"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Proposal Description"
              rows={5}
              className="w-full px-4 py-3 glass rounded-lg focus:outline-none focus:ring-2 focus:ring-cosmic-cyan resize-none"
            />
            <button
              onClick={handleCreateProposal}
              disabled={creating}
              className="px-6 py-3 bg-gradient-to-r from-cosmic-purple to-cosmic-blue rounded-lg font-semibold disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Proposal'}
            </button>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold mb-4">Active Proposals</h2>
        {proposals.map((proposal) => (
          <motion.div
            key={proposal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">{proposal.title}</h3>
                <p className="text-gray-400">{proposal.description}</p>
              </div>
              {!proposal.executed && (
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded text-sm">
                  Active
                </span>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-400">Votes For: {proposal.votesFor.toLocaleString()}</span>
                <span className="text-red-400">Votes Against: {proposal.votesAgainst.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                  style={{
                    width: `${(proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100}%`,
                  }}
                />
              </div>
            </div>

            {connected && !proposal.executed && (
              <div className="flex gap-4 mt-4">
                <button className="flex-1 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors">
                  Vote For
                </button>
                <button className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
                  Vote Against
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

