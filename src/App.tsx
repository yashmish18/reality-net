import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { WalletProvider } from './contexts/WalletContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Upload from './pages/Upload'
import Explore from './pages/Explore'
import Feed from './pages/Feed'
import DAO from './pages/DAO'
import Profile from './pages/Profile'

function App() {
  return (
    <WalletProvider>
      <Router>
        <div className="min-h-screen bg-cosmic-dark">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/dao" element={<DAO />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </Router>
    </WalletProvider>
  )
}

export default App
