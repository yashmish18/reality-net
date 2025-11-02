import { useState, useEffect, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { motion } from 'framer-motion'
import VerificationCard from '../components/VerificationCard'

function Timeline3D({ events }: { events: any[] }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <OrbitControls enableZoom={true} enablePan={true} />
      <PerspectiveCamera makeDefault position={[0, 5, 10]} />
      
      {events.map((_, i) => {
        const angle = (i / events.length) * Math.PI * 2
        const radius = 5
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        const y = (i / events.length) * 10 - 5
        
        return (
          <group key={i} position={[x, y, z]}>
            <mesh>
              <boxGeometry args={[0.5, 0.5, 0.5]} />
              <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[0, 1, 0]}>
              <boxGeometry args={[2, 0.1, 2]} />
              <meshStandardMaterial color="#3b82f6" transparent opacity={0.3} />
            </mesh>
          </group>
        )
      })}
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
    </>
  )
}

export default function Explore() {
  const [events, setEvents] = useState<any[]>([])
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null)

  useEffect(() => {
    // Mock events - replace with actual blockchain query
    setEvents([
      {
        id: '1',
        description: 'Sample Reality Event',
        timestamp: Date.now(),
        location: { lat: 40.7128, lng: -74.0060 },
        verified: true,
        ipfsCID: 'QmExample',
      },
    ])
  }, [])

  return (
    <div className="pt-20 container mx-auto px-4">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-cosmic-cyan to-cosmic-pink bg-clip-text text-transparent">
        Reality Ledger
      </h1>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="glass rounded-2xl p-6 h-[600px]">
          <Suspense fallback={<div className="text-center py-20">Loading 3D Timeline...</div>}>
            <Canvas>
              <Timeline3D events={events} />
            </Canvas>
          </Suspense>
        </div>

        <div className="space-y-4">
          {events.map((event) => (
            <VerificationCard
              key={event.id}
              tokenId={event.id}
              description={event.description}
              verified={event.verified}
              verifierCount={event.verifierCount || 0}
              challengeCount={event.challengeCount || 0}
            />
          ))}
        </div>
      </div>

      {selectedEvent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setSelectedEvent(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="glass rounded-2xl p-8 max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">{selectedEvent.description}</h2>
            <img
              src={`https://ipfs.io/ipfs/${selectedEvent.ipfsCID}`}
              alt={selectedEvent.description}
              className="w-full rounded-lg mb-4"
            />
            <p className="text-gray-400">
              Verified on-chain at {new Date(selectedEvent.timestamp).toLocaleString()}
            </p>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

