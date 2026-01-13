# zkIdentity Usage Examples

This document provides practical examples of using zkIdentity for various real-world scenarios.

## Table of Contents

1. [Basic Age Verification](#basic-age-verification)
2. [Citizenship Verification](#citizenship-verification)
3. [Combined Verifications](#combined-verifications)
4. [Real-World Scenarios](#real-world-scenarios)

## Basic Age Verification

### Example 1: Access 18+ Content

**Scenario**: A user wants to access adult content without revealing their exact age.

```bash
# User's credential: Age 25
# Requirement: Age >= 18

leo run verify_age_over_threshold \
  "{attribute: 25u64, signature_r: 0scalar, signature_s: 0scalar}" \
  "aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc" \
  "18u64"

# Output: true
# Result: Access granted, exact age (25) never revealed
```

### Example 2: Senior Discount Eligibility

**Scenario**: Check if a user qualifies for senior discount (65+) without revealing exact age.

```bash
# User's credential: Age 68
# Requirement: Age >= 65

leo run verify_age_over_threshold \
  "{attribute: 68u64, signature_r: 0scalar, signature_s: 0scalar}" \
  "aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc" \
  "65u64"

# Output: true
# Result: Senior discount applied, exact age never revealed
```

### Example 3: Underage User

**Scenario**: A user under 18 tries to access restricted content.

```bash
# User's credential: Age 16
# Requirement: Age >= 18

leo run verify_age_over_threshold \
  "{attribute: 16u64, signature_r: 0scalar, signature_s: 0scalar}" \
  "aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc" \
  "18u64"

# Output: false
# Result: Access denied, exact age (16) never revealed
```

### Example 4: Age Exactly at Threshold

**Scenario**: User just turned 21 and wants to purchase alcohol.

```bash
# User's credential: Age 21
# Requirement: Age >= 21

leo run verify_age_over_threshold \
  "{attribute: 21u64, signature_r: 0scalar, signature_s: 0scalar}" \
  "aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc" \
  "21u64"

# Output: true
# Result: Purchase approved, exact birthday information never revealed
```

## Citizenship Verification

### Example 5: Voting Registration

**Scenario**: Verify citizenship for voter registration without revealing personal details.

```bash
# User's credential: Citizen (1)
# Requirement: Is citizen

leo run verify_citizenship \
  "{attribute: 1u64, signature_r: 0scalar, signature_s: 0scalar}" \
  "aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc"

# Output: true
# Result: Eligible to vote, no passport/ID details revealed
```

### Example 6: Government Services Access

**Scenario**: Access domestic government services with citizenship proof.

```bash
# User's credential: Citizen (1)
# Requirement: Is citizen

leo run verify_citizenship \
  "{attribute: 1u64, signature_r: 0scalar, signature_s: 0scalar}" \
  "aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc"

# Output: true
# Result: Service access granted, identity protected
```

### Example 7: Non-Citizen

**Scenario**: A non-citizen attempts to access citizen-only services.

```bash
# User's credential: Non-citizen (0)
# Requirement: Is citizen

leo run verify_citizenship \
  "{attribute: 0u64, signature_r: 0scalar, signature_s: 0scalar}" \
  "aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc"

# Output: false
# Result: Access denied, immigration status not disclosed
```

## Combined Verifications

### Example 8: Voter Eligibility

**Scenario**: Complete voter eligibility check (citizen AND 18+).

```bash
# User's credentials: Age 25, Citizen
# Requirements: Age >= 18 AND Citizen

leo run verify_citizen_over_18 \
  "{attribute: 25u64, signature_r: 0scalar, signature_s: 0scalar}" \
  "{attribute: 1u64, signature_r: 0scalar, signature_s: 0scalar}" \
  "aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc"

# Output: true
# Result: Eligible to vote, neither age nor personal details revealed
```

### Example 9: Underage Citizen

**Scenario**: Citizen under 18 attempts to vote.

```bash
# User's credentials: Age 16, Citizen
# Requirements: Age >= 18 AND Citizen

leo run verify_citizen_over_18 \
  "{attribute: 16u64, signature_r: 0scalar, signature_s: 0scalar}" \
  "{attribute: 1u64, signature_r: 0scalar, signature_s: 0scalar}" \
  "aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc"

# Output: false
# Result: Not eligible (underage), exact age not revealed
```

### Example 10: Adult Non-Citizen

**Scenario**: Adult non-citizen attempts to access citizen-only services.

```bash
# User's credentials: Age 30, Non-citizen
# Requirements: Age >= 18 AND Citizen

leo run verify_citizen_over_18 \
  "{attribute: 30u64, signature_r: 0scalar, signature_s: 0scalar}" \
  "{attribute: 0u64, signature_r: 0scalar, signature_s: 0scalar}" \
  "aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc"

# Output: false
# Result: Not eligible (non-citizen), specific status not revealed
```

## Real-World Scenarios

### Scenario 1: Age-Gated E-Commerce

**Use Case**: Online alcohol delivery service

```bash
# Step 1: User creates account and gets age credential from ID verification service
# Step 2: During checkout, prove age >= 21

leo run verify_age_over_threshold \
  "{attribute: 28u64, signature_r: 0scalar, signature_s: 0scalar}" \
  "aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc" \
  "21u64"

# Output: true
# Benefits:
# - User's exact birthdate never stored by merchant
# - Privacy-compliant age verification
# - Reduced data breach risk
# - Regulatory compliance maintained
```

### Scenario 2: Digital ID for Government Services

**Use Case**: Access to government digital services

```bash
# Step 1: Government issues citizenship credential
# Step 2: Prove citizenship for service access

leo run verify_citizenship \
  "{attribute: 1u64, signature_r: 0scalar, signature_s: 0scalar}" \
  "aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc"

# Output: true
# Benefits:
# - No need to upload passport/ID documents
# - Reduced identity theft risk
# - Instant verification
# - Privacy-preserving
```

### Scenario 3: Voting System Integration

**Use Case**: Online voting platform

```bash
# Step 1: Electoral authority issues credentials
# Step 2: Prove eligibility (citizen + 18+) to cast vote

leo run verify_citizen_over_18 \
  "{attribute: 35u64, signature_r: 0scalar, signature_s: 0scalar}" \
  "{attribute: 1u64, signature_r: 0scalar, signature_s: 0scalar}" \
  "aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc"

# Output: true
# Benefits:
# - Anonymous but verified voters
# - Prevents vote buying (no way to prove how you voted)
# - Maintains ballot secrecy
# - Fraud-resistant
```

### Scenario 4: Age-Restricted Content Platform

**Use Case**: Streaming service with age restrictions

```bash
# Different age gates for different content:

# For 13+ content:
leo run verify_age_over_threshold \
  "{attribute: 15u64, signature_r: 0scalar, signature_s: 0scalar}" \
  "aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc" \
  "13u64"
# Output: true

# For 18+ content:
leo run verify_age_over_threshold \
  "{attribute: 15u64, signature_r: 0scalar, signature_s: 0scalar}" \
  "aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc" \
  "18u64"
# Output: false

# Benefits:
# - Single credential, multiple age gates
# - Privacy-friendly parental controls
# - Compliance with content rating systems
# - No detailed profile building
```

### Scenario 5: KYC/AML Compliance

**Use Case**: Cryptocurrency exchange compliance

```bash
# Exchange requires age >= 18 AND citizenship verification

leo run verify_citizen_over_18 \
  "{attribute: 42u64, signature_r: 0scalar, signature_s: 0scalar}" \
  "{attribute: 1u64, signature_r: 0scalar, signature_s: 0scalar}" \
  "aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc"

# Output: true
# Benefits:
# - Regulatory compliance (KYC/AML)
# - User privacy preserved
# - Reduced data storage obligations
# - Lower operational risk
```

## Integration Patterns

### Pattern 1: Web Application Integration

```javascript
// Frontend JavaScript (pseudocode)
async function verifyUserAge(userAge, requiredAge) {
    const credential = {
        attribute: `${userAge}u64`,
        signature_r: "0scalar",
        signature_s: "0scalar"
    };
    
    const issuerKey = "aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc";
    
    // Call Leo transition via RPC
    const result = await aleoClient.run(
        "zkidentity.aleo",
        "verify_age_over_threshold",
        [credential, issuerKey, `${requiredAge}u64`]
    );
    
    return result; // true or false
}
```

### Pattern 2: Smart Contract Integration

```leo
// Another Leo program using zkIdentity
import zkidentity.aleo;

program myapp.aleo {
    transition access_restricted_feature(
        age_credential: zkidentity.aleo/Credential,
        issuer: address
    ) -> bool {
        // Verify age before granting access
        let is_eligible: bool = zkidentity.aleo/verify_age_over_threshold(
            age_credential,
            issuer,
            18u64
        );
        
        if is_eligible {
            // Execute restricted feature
            // ...
        }
        
        return is_eligible;
    }
}
```

### Pattern 3: API Gateway Integration

```python
# Python API server (pseudocode)
from aleo_sdk import AleoClient

def check_voting_eligibility(age_cred, citizen_cred, issuer):
    """Verify voter eligibility via zkIdentity."""
    
    client = AleoClient()
    result = client.execute_transition(
        program="zkidentity.aleo",
        function="verify_citizen_over_18",
        inputs=[age_cred, citizen_cred, issuer]
    )
    
    if result:
        # Grant access to voting system
        return {"eligible": True, "access_token": generate_token()}
    else:
        # Deny access
        return {"eligible": False, "reason": "Requirements not met"}
```

## Privacy Considerations

### What Gets Revealed

❌ **Never Revealed**:
- Exact age or birthdate
- Full name or identity
- Passport/ID numbers
- Address or other personal details

✅ **Only Revealed**:
- Boolean verification result (true/false)
- The specific claim being verified (e.g., "age >= 18")

### Best Practices

1. **Minimum Necessary**: Only verify what you need
2. **Batch Proofs**: Combine multiple checks in one verification when possible
3. **Regular Rotation**: Credentials should have expiration dates (future feature)
4. **Secure Issuers**: Only accept credentials from trusted issuers
5. **Audit Logs**: Log verification requests (not results) for compliance

## Troubleshooting

### Common Issues

**Issue**: Verification returns false unexpectedly

**Solutions**:
- Check credential attribute value is correct format (e.g., `25u64`)
- Verify issuer address matches expected format
- Ensure threshold value is correct type (`u64`)

**Issue**: Signature fields are zeros

**Explanation**: Phase 1 uses placeholder signatures (`0scalar`)
- This is intentional for demonstration
- Phase 2 will implement real signature verification
- Production systems MUST use real signatures

## Next Steps

After mastering these basic examples, explore:

1. **Phase 2 Features** (Coming Soon):
   - Merkle tree membership proofs
   - Nullifier-based one-time proofs
   - Multi-attribute verification

2. **Custom Integration**:
   - Build your own verification logic
   - Create custom credential types
   - Integrate with existing systems

3. **Production Deployment**:
   - Set up issuer infrastructure
   - Implement signature verification
   - Add credential revocation

## Conclusion

These examples demonstrate zkIdentity's power for privacy-preserving identity verification. The system proves credentials without revealing underlying data, enabling compliant, secure, and privacy-friendly applications.

For more information, see:
- [README.md](../README.md) - Project overview
- [IMPLEMENTATION.md](IMPLEMENTATION.md) - Technical details
- [src/main.leo](src/main.leo) - Source code
