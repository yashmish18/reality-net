import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '../contexts/WalletContext'
import { uploadToIPFS } from '../services/ipfs'
import { mintRealityNFT } from '../services/aptos'
import { analyzeEvent } from '../services/ai'

export default function Upload() {
  const { address, connected, aptos } = useWallet()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [eventType, setEventType] = useState('')
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onload = () => setPreview(reader.result as string)
      reader.readAsDataURL(selectedFile)
    }
  }

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      })
    }
  }

  const calculateHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const handleUpload = async () => {
    if (!file || !connected || !address || !location) return

    setUploading(true)
    try {
      // Calculate media hash
      const mediaHash = await calculateHash(file)
      
      // Upload to IPFS
      const ipfsCID = await uploadToIPFS(file)
      
      // AI analysis
      const analysis = await analyzeEvent(description, mediaHash, location)
      
      if (analysis.contradiction_detected) {
        alert('AI detected potential contradictions. Please verify your upload.')
        setUploading(false)
        return
      }

      // Mint Reality NFT
      const txHash = await mintRealityNFT(
        aptos,
        address!,
        mediaHash,
        ipfsCID,
        location.lat,
        location.lng,
        eventType || 'General',
        description,
      )

      alert(`Reality NFT minted! Transaction: ${txHash}`)
      
      // Reset form
      setFile(null)
      setPreview(null)
      setDescription('')
      setEventType('')
      setLocation(null)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  if (!connected) {
    return (
      <div className="pt-20 container mx-auto px-4 text-center">
        <p className="text-xl text-gray-400">Please connect your wallet to upload Reality events.</p>
      </div>
    )
  }

  return (
    <div className="pt-20 container mx-auto px-4 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-8"
      >
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-cosmic-cyan to-cosmic-pink bg-clip-text text-transparent">
          Upload Reality Event
        </h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Media File</label>
            <div
              className="border-2 border-dashed border-white/20 rounded-xl p-12 text-center cursor-pointer hover:border-cosmic-cyan/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {preview ? (
                <img src={preview} alt="Preview" className="max-w-full max-h-64 mx-auto rounded-lg" />
              ) : (
                <div>
                  <div className="text-4xl mb-4">📸</div>
                  <p className="text-gray-400">Drag & drop or click to select</p>
                  <p className="text-sm text-gray-500 mt-2">Images, Videos supported</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Event Type</label>
            <input
              type="text"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              placeholder="e.g., Protest, Natural Disaster, News Event"
              className="w-full px-4 py-3 glass rounded-lg focus:outline-none focus:ring-2 focus:ring-cosmic-cyan"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened, when, and where..."
              rows={5}
              className="w-full px-4 py-3 glass rounded-lg focus:outline-none focus:ring-2 focus:ring-cosmic-cyan resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Location</label>
            <div className="flex gap-4">
              <button
                onClick={getLocation}
                className="px-6 py-3 glass rounded-lg hover:bg-white/10 transition-colors"
              >
                📍 Get GPS Location
              </button>
              {location && (
                <div className="flex-1 px-4 py-3 glass rounded-lg">
                  <p className="text-sm">
                    Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                  </p>
                </div>
              )}
            </div>
          </div>

          <motion.button
            onClick={handleUpload}
            disabled={!file || !description || !location || uploading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-8 py-4 bg-gradient-to-r from-cosmic-purple to-cosmic-blue rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Minting Reality NFT...' : 'Mint Reality NFT'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

