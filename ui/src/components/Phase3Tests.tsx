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

interface Phase3TestsProps {
  onNullifierGenerated: (nullifier: string) => void
}

const Phase3Tests = ({ onNullifierGenerated }: Phase3TestsProps) => {
  const [leaves, setLeaves] = useState<CredentialLeaf[]>([
    { attr_type: '1', attr_value: '25', signature_r: '0scalar', signature_s: '0scalar' },
    { attr_type: '2', attr_value: '1', signature_r: '0scalar', signature_s: '0scalar' },
    { attr_type: '3', attr_value: '100', signature_r: '0scalar', signature_s: '0scalar' }
  ])
  
  const [proofs] = useState<MerkleProof[]>([
    { siblings: Array(32).fill('0field'), index: '0' },
    { siblings: Array(32).fill('0field'), index: '1' },
    { siblings: Array(32).fill('0field'), index: '2' }
  ])
  
  const [roots, setRoots] = useState(['0field', '0field'])
  const [credentialIds, setCredentialIds] = useState(['1field', '2field'])
  const [nullifierSecret, setNullifierSecret] = useState('12345field')
  const [disclosedType, setDisclosedType] = useState('1')
  const [disclosedValue, setDisclosedValue] = useState('25')
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

  const deriveNullifierSimulation = (credId: string, secret: string) => {
    const nullifier = `Poseidon4::hash(3field, ${credId}, ${secret}, 0field)`
    onNullifierGenerated(nullifier)
    return nullifier
  }

  const testMultiAttributes = () => {
    const command = generateLeoCommand('verify_multi_attributes', [
      formatLeaf(leaves[0]),
      formatProof(proofs[0]),
      formatLeaf(leaves[1]),
      formatProof(proofs[1]),
      formatLeaf(leaves[2]),
      formatProof(proofs[2]),
      roots[0],
      credentialIds[0],
      nullifierSecret
    ])
    
    const simulatedNullifier = deriveNullifierSimulation(credentialIds[0], nullifierSecret)
    
    setResult(`Command to run:\n${command}\n\n` +
      `Simulated Nullifier: ${simulatedNullifier}\n\n` +
      `Verification Steps:\n` +
      `1. Verify all 3 leaves against the same Merkle root\n` +
      `2. Each leaf must compute to the same root\n` +
      `3. Derive combined nullifier for all attributes\n` +
      `4. Check nullifier not already used\n` +
      `5. Mark nullifier as used\n\n` +
      `Use Case: Prove multiple attributes (age, citizenship, qualification) from same credential set`)
  }

  const testSelectiveDisclosure = () => {
    const command = generateLeoCommand('verify_selective_disclosure', [
      formatLeaf(leaves[0]),
      formatProof(proofs[0]),
      roots[0],
      `${disclosedType}u64`,
      `${disclosedValue}u64`,
      credentialIds[0],
      nullifierSecret
    ])
    
    const simulatedNullifier = deriveNullifierSimulation(credentialIds[0], nullifierSecret)
    
    setResult(`Command to run:\n${command}\n\n` +
      `Simulated Nullifier: ${simulatedNullifier}\n\n` +
      `Verification Steps:\n` +
      `1. Verify leaf is in Merkle tree\n` +
      `2. Only disclose selected attributes (type: ${disclosedType}, value: ${disclosedValue})\n` +
      `3. Other attributes remain private\n` +
      `4. Derive nullifier from credential_id + secret\n` +
      `5. Check nullifier not already used\n` +
      `6. Mark nullifier as used\n\n` +
      `Use Case: Minimal disclosure - only reveal what's necessary`)
  }

  const testAggregatedCredentials = () => {
    const command = generateLeoCommand('verify_aggregated_credentials', [
      formatLeaf(leaves[0]),
      formatProof(proofs[0]),
      roots[0],
      formatLeaf(leaves[1]),
      formatProof(proofs[1]),
      roots[1],
      credentialIds[0],
      credentialIds[1],
      nullifierSecret
    ])
    
    const nullifier1 = deriveNullifierSimulation(credentialIds[0], nullifierSecret)
    const nullifier2 = deriveNullifierSimulation(credentialIds[1], nullifierSecret)
    
    setResult(`Command to run:\n${command}\n\n` +
      `Simulated Nullifier 1: ${nullifier1}\n` +
      `Simulated Nullifier 2: ${nullifier2}\n\n` +
      `Verification Steps:\n` +
      `1. Verify first credential against root1\n` +
      `2. Verify second credential against root2\n` +
      `3. Derive nullifier for each credential\n` +
      `4. Check both nullifiers not already used\n` +
      `5. Mark both nullifiers as used\n\n` +
      `Use Case: Batch verify credentials from different issuers/trees`)
  }

  const updateLeaf = (index: number, field: keyof CredentialLeaf, value: string) => {
    const newLeaves = [...leaves]
    newLeaves[index] = { ...newLeaves[index], [field]: value }
    setLeaves(newLeaves)
  }

  return (
    <div className="test-section">
      <h2>Phase 3: Advanced Privacy-Preserving Proofs</h2>
      
      <div className="info-box">
        <p><strong>About Phase 3:</strong> Advanced features for selective disclosure, multi-attribute proofs, and credential aggregation.</p>
        <p>Enables complex privacy-preserving verifications with minimal data exposure.</p>
      </div>

      <div className="card">
        <h3>Multi-Attribute Verification</h3>
        <p style={{ marginBottom: '1rem', color: '#666' }}>Verify multiple attributes from the same credential tree</p>
        
        {leaves.map((leaf, i) => (
          <div key={i} style={{ marginBottom: '1rem', padding: '1rem', background: '#f0f0f0', borderRadius: '8px' }}>
            <h4>Leaf {i + 1}</h4>
            <div className="grid-2">
              <div className="form-group">
                <label>Attribute Type:</label>
                <input
                  type="number"
                  value={leaf.attr_type}
                  onChange={(e) => updateLeaf(i, 'attr_type', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Attribute Value:</label>
                <input
                  type="number"
                  value={leaf.attr_value}
                  onChange={(e) => updateLeaf(i, 'attr_value', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
        
        <button className="button-primary" onClick={testMultiAttributes}>
          Test Multi-Attribute Verification
        </button>
      </div>

      <div className="card">
        <h3>Selective Disclosure</h3>
        <p style={{ marginBottom: '1rem', color: '#666' }}>Verify membership but only disclose selected attributes</p>
        
        <div className="grid-2">
          <div className="form-group">
            <label>Disclosed Attribute Type:</label>
            <input
              type="number"
              value={disclosedType}
              onChange={(e) => setDisclosedType(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Disclosed Attribute Value:</label>
            <input
              type="number"
              value={disclosedValue}
              onChange={(e) => setDisclosedValue(e.target.value)}
            />
          </div>
        </div>
        
        <button className="button-primary" onClick={testSelectiveDisclosure}>
          Test Selective Disclosure
        </button>
      </div>

      <div className="card">
        <h3>Aggregated Credentials</h3>
        <p style={{ marginBottom: '1rem', color: '#666' }}>Batch verify multiple credentials from different trees/issuers</p>
        
        <div className="grid-2">
          <div className="form-group">
            <label>Root 1:</label>
            <input
              type="text"
              value={roots[0]}
              onChange={(e) => setRoots([e.target.value, roots[1]])}
            />
          </div>
          <div className="form-group">
            <label>Root 2:</label>
            <input
              type="text"
              value={roots[1]}
              onChange={(e) => setRoots([roots[0], e.target.value])}
            />
          </div>
          <div className="form-group">
            <label>Credential ID 1:</label>
            <input
              type="text"
              value={credentialIds[0]}
              onChange={(e) => setCredentialIds([e.target.value, credentialIds[1]])}
            />
          </div>
          <div className="form-group">
            <label>Credential ID 2:</label>
            <input
              type="text"
              value={credentialIds[1]}
              onChange={(e) => setCredentialIds([credentialIds[0], e.target.value])}
            />
          </div>
        </div>
        
        <button className="button-primary" onClick={testAggregatedCredentials}>
          Test Aggregated Credentials
        </button>
      </div>

      <div className="form-group">
        <label>Nullifier Secret (shared):</label>
        <input
          type="text"
          value={nullifierSecret}
          onChange={(e) => setNullifierSecret(e.target.value)}
        />
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

export default Phase3Tests