import { useState } from 'react'
import './App.css'
import Phase1Tests from './components/Phase1Tests'
import Phase2Tests from './components/Phase2Tests'
import Phase3Tests from './components/Phase3Tests'
import MerkleTreeVisualization from './components/MerkleTreeVisualization'
import NullifierTracker from './components/NullifierTracker'

function App() {
  const [activeTab, setActiveTab] = useState<'phase1' | 'phase2' | 'phase3' | 'merkle' | 'nullifiers'>('phase1')
  const [nullifiers, setNullifiers] = useState<string[]>([])

  const addNullifier = (nullifier: string) => {
    if (!nullifiers.includes(nullifier)) {
      setNullifiers([...nullifiers, nullifier])
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🔐 zkIdentity Testing UI</h1>
        <p className="subtitle">Privacy-Preserving Digital Identity Verification System</p>
      </header>

      <nav className="nav-tabs">
        <button 
          className={activeTab === 'phase1' ? 'active' : ''}
          onClick={() => setActiveTab('phase1')}
        >
          Phase 1: Basic Verification
        </button>
        <button 
          className={activeTab === 'phase2' ? 'active' : ''}
          onClick={() => setActiveTab('phase2')}
        >
          Phase 2: Merkle & Nullifiers
        </button>
        <button 
          className={activeTab === 'phase3' ? 'active' : ''}
          onClick={() => setActiveTab('phase3')}
        >
          Phase 3: Advanced Proofs
        </button>
        <button 
          className={activeTab === 'merkle' ? 'active' : ''}
          onClick={() => setActiveTab('merkle')}
        >
          Merkle Tree Viz
        </button>
        <button 
          className={activeTab === 'nullifiers' ? 'active' : ''}
          onClick={() => setActiveTab('nullifiers')}
        >
          Nullifier Tracker
        </button>
      </nav>

      <main className="content">
        {activeTab === 'phase1' && <Phase1Tests />}
        {activeTab === 'phase2' && <Phase2Tests onNullifierGenerated={addNullifier} />}
        {activeTab === 'phase3' && <Phase3Tests onNullifierGenerated={addNullifier} />}
        {activeTab === 'merkle' && <MerkleTreeVisualization />}
        {activeTab === 'nullifiers' && <NullifierTracker nullifiers={nullifiers} />}
      </main>

      <footer className="footer">
        <p>Built for Aleo Privacy Buildathon | zkIdentity.aleo</p>
        <p className="warning">⚠️ Testing Interface - Not for Production Use</p>
      </footer>
    </div>
  )
}

export default App
