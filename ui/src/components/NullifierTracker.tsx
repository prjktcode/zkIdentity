interface NullifierTrackerProps {
  nullifiers: string[]
}

const NullifierTracker = ({ nullifiers }: NullifierTrackerProps) => {
  const formatNullifier = (nullifier: string) => {
    // Truncate long nullifiers for display
    if (nullifier.length > 50) {
      return `${nullifier.slice(0, 30)}...${nullifier.slice(-20)}`
    }
    return nullifier
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Nullifier copied to clipboard!')
  }

  return (
    <div className="test-section">
      <h2>Nullifier Tracker</h2>
      
      <div className="info-box">
        <p><strong>About Nullifiers:</strong> Nullifiers prevent double-usage of credentials by marking them as "spent" on-chain.</p>
        <p>Each credential verification generates a unique nullifier derived from credential_id + secret.</p>
      </div>

      <div className="card">
        <h3>How Nullifiers Work</h3>
        <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '6px' }}>
          <ol style={{ marginLeft: '1.5rem', color: '#333' }}>
            <li style={{ marginBottom: '0.8rem' }}>
              <strong>Derivation:</strong> Nullifier = Poseidon4::hash(NULLIFIER_DOMAIN_TAG, credential_id, secret, 0)
            </li>
            <li style={{ marginBottom: '0.8rem' }}>
              <strong>Privacy:</strong> The nullifier reveals nothing about the credential content
            </li>
            <li style={{ marginBottom: '0.8rem' }}>
              <strong>Uniqueness:</strong> Same credential + secret always produces same nullifier
            </li>
            <li style={{ marginBottom: '0.8rem' }}>
              <strong>Checking:</strong> Before accepting verification, check if nullifier already exists
            </li>
            <li style={{ marginBottom: '0.8rem' }}>
              <strong>Storage:</strong> On success, store nullifier in on-chain mapping to prevent reuse
            </li>
          </ol>
        </div>
      </div>

      <div className="card">
        <h3>Active Nullifiers ({nullifiers.length})</h3>
        
        {nullifiers.length === 0 ? (
          <div style={{ 
            padding: '2rem', 
            textAlign: 'center', 
            color: '#666',
            background: '#f9f9f9',
            borderRadius: '8px'
          }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No nullifiers generated yet</p>
            <p>Run Phase 2 or Phase 3 tests to generate nullifiers</p>
          </div>
        ) : (
          <div>
            {nullifiers.map((nullifier, index) => (
              <div 
                key={index}
                style={{
                  padding: '1rem',
                  marginBottom: '1rem',
                  background: '#f9f9f9',
                  borderRadius: '8px',
                  border: '2px solid #e0e0e0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ 
                      background: '#667eea', 
                      color: 'white', 
                      padding: '0.2rem 0.6rem', 
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: 'bold'
                    }}>
                      #{index + 1}
                    </span>
                    <span style={{ color: '#666', fontSize: '0.9rem' }}>
                      Used
                    </span>
                  </div>
                  <code style={{ 
                    fontSize: '0.9rem',
                    wordBreak: 'break-all',
                    color: '#333'
                  }}>
                    {formatNullifier(nullifier)}
                  </code>
                </div>
                <button
                  onClick={() => copyToClipboard(nullifier)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Copy
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3>Nullifier Security Properties</h3>
        <div style={{ padding: '1rem', background: '#e8f5e9', borderRadius: '6px', border: '2px solid #4caf50' }}>
          <h4 style={{ color: '#2e7d32', marginBottom: '1rem' }}>✓ Security Guarantees</h4>
          <ul style={{ marginLeft: '1.5rem', color: '#2e7d32' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>One-time use:</strong> Credentials can only be verified once with same secret
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Anonymous:</strong> Nullifier doesn't reveal identity or credential data
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Deterministic:</strong> Same inputs always produce same nullifier
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Collision-resistant:</strong> Poseidon hash prevents nullifier collisions
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Domain-separated:</strong> Nullifiers can't collide with other hash types
            </li>
          </ul>
        </div>
      </div>

      <div className="card">
        <h3>On-Chain Storage</h3>
        <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '6px' }}>
          <p style={{ marginBottom: '1rem', color: '#333' }}>
            Nullifiers are stored in an on-chain mapping in the zkIdentity contract:
          </p>
          <pre style={{ background: 'white', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
{`mapping nullifiers: field => bool;

// In finalize function:
async function finalize_verify_age_merkle(nullifier: field) {
    // Check nullifier hasn't been used
    let is_used: bool = Mapping::get_or_use(nullifiers, nullifier, false);
    assert(!is_used);
    
    // Mark nullifier as used
    Mapping::set(nullifiers, nullifier, true);
}`}
          </pre>
        </div>
      </div>

      <div className="card">
        <h3>Use Cases</h3>
        <div className="grid-2">
          <div style={{ padding: '1rem', background: '#e3f2fd', borderRadius: '6px' }}>
            <h4 style={{ color: '#1976d2', marginBottom: '0.5rem' }}>Voting</h4>
            <p style={{ fontSize: '0.9rem', color: '#1976d2' }}>
              Ensure each citizen can only vote once without revealing their identity
            </p>
          </div>
          <div style={{ padding: '1rem', background: '#f3e5f5', borderRadius: '6px' }}>
            <h4 style={{ color: '#7b1fa2', marginBottom: '0.5rem' }}>Airdrops</h4>
            <p style={{ fontSize: '0.9rem', color: '#7b1fa2' }}>
              Claim tokens once per credential without linking to identity
            </p>
          </div>
          <div style={{ padding: '1rem', background: '#fff3e0', borderRadius: '6px' }}>
            <h4 style={{ color: '#e65100', marginBottom: '0.5rem' }}>Access Control</h4>
            <p style={{ fontSize: '0.9rem', color: '#e65100' }}>
              Grant one-time access to services while preserving privacy
            </p>
          </div>
          <div style={{ padding: '1rem', background: '#e8f5e9', borderRadius: '6px' }}>
            <h4 style={{ color: '#2e7d32', marginBottom: '0.5rem' }}>Redemptions</h4>
            <p style={{ fontSize: '0.9rem', color: '#2e7d32' }}>
              Redeem benefits without revealing personal information
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NullifierTracker