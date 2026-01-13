import { useState } from 'react'

interface TreeNode {
  value: string
  left?: TreeNode
  right?: TreeNode
  level: number
  position: number
}

const MerkleTreeVisualization = () => {
  const [treeDepth, setTreeDepth] = useState(5) // Show 5 levels for visualization (full tree is 32)
  const [leafValues, setLeafValues] = useState<string[]>(Array(32).fill('Leaf'))
  const [activeLeafIndex, setActiveLeafIndex] = useState(0)
  const [computedRoot, setComputedRoot] = useState('')

  const buildTree = (leaves: string[], depth: number): TreeNode | null => {
    if (leaves.length === 0) return null
    
    const maxLeaves = Math.pow(2, depth)
    const paddedLeaves = [...leaves]
    while (paddedLeaves.length < maxLeaves) {
      paddedLeaves.push('0')
    }

    const buildLevel = (values: string[], level: number): TreeNode[] => {
      if (values.length === 1) {
        return [{
          value: values[0],
          level,
          position: 0
        }]
      }

      const nodes: TreeNode[] = []
      for (let i = 0; i < values.length; i += 2) {
        const left = values[i]
        const right = values[i + 1] || '0'
        const hash = `H(${left.slice(0, 4)}...${right.slice(0, 4)})`
        
        nodes.push({
          value: hash,
          level,
          position: i / 2
        })
      }

      return buildLevel(nodes.map(n => n.value), level + 1)
    }

    // Build the root and return it
    const root = buildLevel(paddedLeaves.slice(0, maxLeaves), 0)[0]
    return root
  }

  const visualizeProofPath = () => {
    const proof: string[] = []
    const index = activeLeafIndex
    let currentIndex = index

    for (let level = 0; level < treeDepth; level++) {
      const siblingIndex = currentIndex % 2 === 0 ? currentIndex + 1 : currentIndex - 1
      proof.push(`Sibling at level ${level}: Index ${siblingIndex}`)
      currentIndex = Math.floor(currentIndex / 2)
    }

    return proof
  }

  const computeRoot = () => {
    const tree = buildTree(leafValues.slice(0, Math.pow(2, treeDepth)), treeDepth)
    if (tree) {
      setComputedRoot(tree.value)
    }
  }

  const resetTree = () => {
    setLeafValues(Array(32).fill('Leaf'))
    setComputedRoot('')
    setActiveLeafIndex(0)
  }

  return (
    <div className="test-section">
      <h2>Merkle Tree Visualization</h2>
      
      <div className="info-box">
        <p><strong>About Merkle Trees:</strong> A Merkle tree is a binary hash tree where each leaf represents data and each parent is the hash of its children.</p>
        <p>zkIdentity uses depth-32 Merkle trees with Poseidon hashing for efficient credential verification.</p>
      </div>

      <div className="card">
        <h3>Tree Configuration</h3>
        <div className="grid-2">
          <div className="form-group">
            <label>Visualization Depth (max 5 for display):</label>
            <input
              type="number"
              min="1"
              max="5"
              value={treeDepth}
              onChange={(e) => setTreeDepth(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
            />
            <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
              Full tree depth: 32 (can contain 2³² = 4,294,967,296 leaves)
            </p>
          </div>
          <div className="form-group">
            <label>Active Leaf Index:</label>
            <input
              type="number"
              min="0"
              max={Math.pow(2, treeDepth) - 1}
              value={activeLeafIndex}
              onChange={(e) => setActiveLeafIndex(Math.max(0, Math.min(Math.pow(2, treeDepth) - 1, parseInt(e.target.value) || 0)))}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button className="button-primary" onClick={computeRoot}>
            Compute Root
          </button>
          <button className="button-primary" onClick={resetTree}>
            Reset Tree
          </button>
        </div>
      </div>

      {computedRoot && (
        <div className="success-box">
          <h3>Computed Root</h3>
          <pre>{computedRoot}</pre>
        </div>
      )}

      <div className="card">
        <h3>Tree Structure (Simplified)</h3>
        <div style={{ 
          padding: '2rem', 
          background: '#f9f9f9', 
          borderRadius: '8px',
          overflowX: 'auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              display: 'inline-block',
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '8px',
              fontWeight: 'bold'
            }}>
              ROOT
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
              {Array(Math.pow(2, Math.min(1, treeDepth - 1))).fill(0).map((_, i) => (
                <div key={i} style={{
                  padding: '0.8rem 1.5rem',
                  background: '#4a90e2',
                  color: 'white',
                  borderRadius: '6px',
                  fontSize: '0.9rem'
                }}>
                  L1-{i}
                </div>
              ))}
            </div>
          </div>

          {treeDepth >= 3 && (
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                {Array(Math.pow(2, Math.min(2, treeDepth - 1))).fill(0).map((_, i) => (
                  <div key={i} style={{
                    padding: '0.6rem 1rem',
                    background: '#7cb342',
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '0.85rem'
                  }}>
                    L2-{i}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {Array(Math.pow(2, Math.min(treeDepth, 5))).fill(0).map((_, i) => (
                <div key={i} style={{
                  padding: '0.5rem 0.8rem',
                  background: i === activeLeafIndex ? '#f44336' : '#ffb300',
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onClick={() => setActiveLeafIndex(i)}
                >
                  Leaf {i}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Merkle Proof Path for Leaf {activeLeafIndex}</h3>
        <div className="result-box">
          <pre>{visualizeProofPath().join('\n')}</pre>
        </div>
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#e3f2fd', borderRadius: '6px' }}>
          <p style={{ color: '#1976d2', margin: 0 }}>
            <strong>How it works:</strong> To prove Leaf {activeLeafIndex} is in the tree, provide {treeDepth} sibling hashes 
            (one per level). The verifier recomputes the root using these siblings and checks it matches the known root.
          </p>
        </div>
      </div>

      <div className="card">
        <h3>Poseidon Hashing with Domain Separation</h3>
        <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '6px' }}>
          <p style={{ marginBottom: '1rem' }}><strong>Leaf Hash:</strong></p>
          <pre style={{ background: 'white', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
{`// Hash leaf with domain tag = 1
preimage = Poseidon4::hash_to_field(
  1field,              // LEAF_DOMAIN_TAG
  attr_type,           // e.g., 1u64 for age
  attr_value,          // e.g., 25u64
  signature_r          // signature component
)
leaf_hash = Poseidon2::hash_to_field(preimage, signature_s)`}
          </pre>

          <p style={{ marginBottom: '1rem', marginTop: '1.5rem' }}><strong>Node Hash:</strong></p>
          <pre style={{ background: 'white', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
{`// Hash two children with domain tag = 2
node_hash = Poseidon4::hash_to_field(
  2field,              // NODE_DOMAIN_TAG
  left_child,          // left child hash
  right_child,         // right child hash
  0field               // padding
)`}
          </pre>

          <p style={{ marginTop: '1.5rem', color: '#666' }}>
            Domain separation ensures leaf hashes cannot collide with internal node hashes,
            preventing second-preimage attacks on the Merkle tree.
          </p>
        </div>
      </div>
    </div>
  )
}

export default MerkleTreeVisualization