import { useState } from 'react'

interface Credential {
  attribute: string
  signature_r: string
  signature_s: string
}

const Phase1Tests = () => {
  const [ageCredential, setAgeCredential] = useState<Credential>({
    attribute: '25',
    signature_r: '0scalar',
    signature_s: '0scalar'
  })
  const [citizenshipCredential, setCitizenshipCredential] = useState<Credential>({
    attribute: '1',
    signature_r: '0scalar',
    signature_s: '0scalar'
  })
  const [threshold, setThreshold] = useState('18')
  const [issuerPubkey, setIssuerPubkey] = useState('aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc')
  const [result, setResult] = useState<string>('')

  const generateLeoCommand = (transition: string, params: string[]) => {
    return `leo run ${transition} ${params.join(' ')}`
  }

  const testAgeVerification = () => {
    const credentialStr = `"{attribute: ${ageCredential.attribute}u64, signature_r: ${ageCredential.signature_r}, signature_s: ${ageCredential.signature_s}}"`
    const command = generateLeoCommand('verify_age_over_threshold', [
      credentialStr,
      `"${issuerPubkey}"`,
      `"${threshold}u64"`
    ])
    
    const expectedResult = parseInt(ageCredential.attribute) >= parseInt(threshold)
    
    setResult(`Command to run:\n${command}\n\nExpected Result: ${expectedResult}`)
  }

  const testCitizenshipVerification = () => {
    const credentialStr = `"{attribute: ${citizenshipCredential.attribute}u64, signature_r: ${citizenshipCredential.signature_r}, signature_s: ${citizenshipCredential.signature_s}}"`
    const command = generateLeoCommand('verify_citizenship', [
      credentialStr,
      `"${issuerPubkey}"`
    ])
    
    const expectedResult = citizenshipCredential.attribute === '1'
    
    setResult(`Command to run:\n${command}\n\nExpected Result: ${expectedResult}`)
  }

  const testCombinedVerification = () => {
    const ageCredStr = `"{attribute: ${ageCredential.attribute}u64, signature_r: ${ageCredential.signature_r}, signature_s: ${ageCredential.signature_s}}"`
    const citizenCredStr = `"{attribute: ${citizenshipCredential.attribute}u64, signature_r: ${citizenshipCredential.signature_r}, signature_s: ${citizenshipCredential.signature_s}}"`
    const command = generateLeoCommand('verify_citizen_over_18', [
      ageCredStr,
      citizenCredStr,
      `"${issuerPubkey}"`
    ])
    
    const expectedResult = parseInt(ageCredential.attribute) >= 18 && citizenshipCredential.attribute === '1'
    
    setResult(`Command to run:\n${command}\n\nExpected Result: ${expectedResult}`)
  }

  return (
    <div className="test-section">
      <h2>Phase 1: Basic Identity Verification</h2>
      
      <div className="info-box">
        <p><strong>About Phase 1:</strong> Basic credential verification without revealing exact values.</p>
        <p>Test age thresholds, citizenship status, and combined verifications.</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Age Credential</h3>
          <div className="form-group">
            <label>Age (attribute):</label>
            <input
              type="number"
              value={ageCredential.attribute}
              onChange={(e) => setAgeCredential({ ...ageCredential, attribute: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Signature R:</label>
            <input
              type="text"
              value={ageCredential.signature_r}
              onChange={(e) => setAgeCredential({ ...ageCredential, signature_r: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Signature S:</label>
            <input
              type="text"
              value={ageCredential.signature_s}
              onChange={(e) => setAgeCredential({ ...ageCredential, signature_s: e.target.value })}
            />
          </div>
        </div>

        <div className="card">
          <h3>Citizenship Credential</h3>
          <div className="form-group">
            <label>Citizenship (1=citizen, 0=non-citizen):</label>
            <input
              type="number"
              value={citizenshipCredential.attribute}
              onChange={(e) => setCitizenshipCredential({ ...citizenshipCredential, attribute: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Signature R:</label>
            <input
              type="text"
              value={citizenshipCredential.signature_r}
              onChange={(e) => setCitizenshipCredential({ ...citizenshipCredential, signature_r: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Signature S:</label>
            <input
              type="text"
              value={citizenshipCredential.signature_s}
              onChange={(e) => setCitizenshipCredential({ ...citizenshipCredential, signature_s: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>Issuer Public Key:</label>
        <input
          type="text"
          value={issuerPubkey}
          onChange={(e) => setIssuerPubkey(e.target.value)}
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

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button className="button-primary" onClick={testAgeVerification}>
          Test Age Verification
        </button>
        <button className="button-primary" onClick={testCitizenshipVerification}>
          Test Citizenship
        </button>
        <button className="button-primary" onClick={testCombinedVerification}>
          Test Combined (Citizen Over 18)
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

export default Phase1Tests