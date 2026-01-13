import { useState } from 'react'

interface CredentialLeaf {
  attr_type: string
  attr_value: string
  signature_r: string
  signature_s: string
}

interface MerkleProof {
  siblings: string[]
  index: string
}

interface Phase2TestsProps {
  onNullifierGenerated: (nullifier: string) => void
}

const Phase2Tests = ({ onNullifierGenerated }: Phase2TestsProps) => {
  const [leaf, setLeaf] = useState<CredentialLeaf>({
    attr_type: '1', // 1=age, 2=citizenship
    attr_value: '25',
    signature_r: '0scalar',
    signature_s: '0scalar'
  })
  
  const [proof, setProof] = useState<MerkleProof>({
    siblings: Array(32).fill('0field'),
    index: '0'
  })
  
  const [root, setRoot] = useState('0field')
  const [threshold, setThreshold] = useState('18')
  const [credentialId, setCredentialId] = useState('1field')
  const [nullifierSecret, setNullifierSecret] = useState('12345field')
  const [result, setResult] = useState<string>('')

  const generateLeoCommand = (transition: string, params: string[]) => {
    return `leo run ${transition} ${params.join(' ')}`
  }

  const formatLeaf = (l: CredentialLeaf) => {
    return `"{attr_type: ${l.attr_type}u64, attr_value: ${l.attr_value}u64, signature_r: ${l.signature_r}, signature_s: ${l.signature_s}}"`
  }

  const formatProof = (p: MerkleProof) => {
    const siblingsStr = `[${p.siblings.join(', ')}]`
    return `"{siblings: ${siblingsStr}, index: ${p.index}u64}"`
  }

  const hashLeafSimulation = (l: CredentialLeaf) => {
    // Simulate Poseidon hash (in reality computed by Leo program)
    return `hash(${l.attr_type}, ${l.attr_value}, ${l.signature_r}, ${l.signature_s})`
  }

  const deriveNullifierSimulation = (credId: string, secret: string) => {
    const nullifier = `Poseidon4::hash(3field, ${credId}, ${secret}, 0field)`
    onNullifierGenerated(nullifier)
    return nullifier
  }

  const testAgeMerkle = () => {
    const leafStr = formatLeaf(leaf)
    const proofStr = formatProof(proof)
    
    const command = generateLeoCommand('verify_age_over_threshold_merkle', [
      leafStr,
      proofStr,
      root,
      `${threshold}u64`,
      credentialId,
      nullifierSecret
    ])
    
    const simulatedLeafHash = hashLeafSimulation(leaf)
    const simulatedNullifier = deriveNullifierSimulation(credentialId, nullifierSecret)
    
    setResult(`Command to run:\n${command}\n\n` +
      `Simulated Leaf Hash: ${simulatedLeafHash}\n` +
      `Simulated Nullifier: ${simulatedNullifier}\n\n` +
      `Verification Steps:\n` +
      `1. Hash leaf with Poseidon\n` +
      `2. Compute Merkle root from leaf and proof\n` +
      `3. Verify computed root matches expected root\n` +
      `4. Check attr_type == 1 (age)\n` +
      `5. Check attr_value >= ${threshold}\n` +
      `6. Derive nullifier from credential_id + secret\n` +
      `7. Check nullifier not already used\n` +
      `8. Mark nullifier as used`)
  }

  const testCitizenshipMerkle = () => {
    const leafStr = formatLeaf(leaf)
    const proofStr = formatProof(proof)
    
    const command = generateLeoCommand('verify_citizenship_merkle', [
      leafStr,
      proofStr,
      root,
      credentialId,
      nullifierSecret
    ])
    
    const simulatedLeafHash = hashLeafSimulation(leaf)
    const simulatedNullifier = deriveNullifierSimulation(credentialId, nullifierSecret)
    
    setResult(`Command to run:\n${command}\n\n` +
      `Simulated Leaf Hash: ${simulatedLeafHash}\n` +
      `Simulated Nullifier: ${simulatedNullifier}\n\n` +
      `Verification Steps:\n` +
      `1. Hash leaf with Poseidon\n` +
      `2. Compute Merkle root from leaf and proof\n` +
      `3. Verify computed root matches expected root\n` +
      `4. Check attr_type == 2 (citizenship)\n` +
      `5. Check attr_value == 1 (citizen)\n` +
      `6. Derive nullifier from credential_id + secret\n` +
      `7. Check nullifier not already used\n` +
      `8. Mark nullifier as used`)
  }

  const generateSampleTree = () => {
    // Generate a sample Merkle tree with random values
    const sampleSiblings = Array(32).fill(0).map((_, i) => `${i + 1}field`)
    setProof({ ...proof, siblings: sampleSiblings })
    setRoot('123456789field')
    setResult('Generated sample Merkle tree data. Note: This is for demonstration only.\nIn production, use actual Merkle tree construction.')
  }

  return (
    <div className="test-section">
      <h2>Phase 2: Merkle Tree Verification & Nullifiers</h2>
      
      <div className="info-box">
        <p><strong>About Phase 2:</strong> Advanced verification using Merkle trees (depth 32) and nullifier tracking.</p>
        <p>Prevents double-usage of credentials via on-chain nullifier storage.</p>
      </div>

      <div className="card">
        <h3>Credential Leaf</h3>
        <div className="grid-2">
          <div className="form-group">
            <label>Attribute Type (1=age, 2=citizenship):</label>
            <input
              type="number"
              value={leaf.attr_type}
              onChange={(e) => setLeaf({ ...leaf, attr_type: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Attribute Value:</label>
            <input
              type="number"
              value={leaf.attr_value}
              onChange={(e) => setLeaf({ ...leaf, attr_value: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Signature R:</label>
            <input
              type="text"
              value={leaf.signature_r}
              onChange={(e) => setLeaf({ ...leaf, signature_r: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Signature S:</label>
            <input
              type="text"
              value={leaf.signature_s}
              onChange={(e) => setLeaf({ ...leaf, signature_s: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Merkle Proof (Depth 32)</h3>
        <div className="form-group">
          <label>Leaf Index:</label>
          <input
            type="number"
            value={proof.index}
            onChange={(e) => setProof({ ...proof, index: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Siblings (32 field elements):</label>
          <textarea
            value={proof.siblings.join(', ')}
            onChange={(e) => setProof({ ...proof, siblings: e.target.value.split(',').map(s => s.trim()) })}
            placeholder="0field, 1field, 2field, ..."
          />
        </div>
        <button className="button-primary" onClick={generateSampleTree} style={{ marginTop: '0.5rem' }}>
          Generate Sample Tree
        </button>
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label>Expected Root:</label>
          <input
            type="text"
            value={root}
            onChange={(e) => setRoot(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Age Threshold:</label>
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <h3>Nullifier Parameters</h3>
        <div className="grid-2">
          <div className="form-group">
            <label>Credential ID:</label>
            <input
              type="text"
              value={credentialId}
              onChange={(e) => setCredentialId(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Nullifier Secret:</label>
            <input
              type="text"
              value={nullifierSecret}
              onChange={(e) => setNullifierSecret(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button className="button-primary" onClick={testAgeMerkle}>
          Test Age Verification (Merkle)
        </button>
        <button className="button-primary" onClick={testCitizenshipMerkle}>
          Test Citizenship (Merkle)
        </button>
      </div>

      {result && (
        <div className="result-box">
          <h3>Test Result</h3>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  )
}

export default Phase2Tests