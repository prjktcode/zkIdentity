# zkIdentity

A privacy-preserving digital identity system built on the Aleo blockchain for the Aleo Privacy Buildathon. zkIdentity allows users to prove credentials (e.g., they are a citizen over 18) from signed data attestations without revealing the underlying data.

## Overview

zkIdentity leverages zero-knowledge proofs on the Aleo blockchain to enable privacy-preserving identity verification. Users can prove specific attributes about themselves (age, citizenship status, qualifications, etc.) without revealing their actual identity or raw credential data.

## Features

### Phase 1: Basic Identity Verification ✅

The initial implementation provides foundational credential verification capabilities:

- **Age Verification**: Prove age meets a threshold (e.g., ≥18) without revealing exact age
- **Citizenship Verification**: Prove citizenship status without revealing personal details
- **Combined Verification**: Prove multiple credentials simultaneously (e.g., citizen over 18)
- **Signature-Ready Structure**: Credentials include signature components for future attestation verification

### Phase 2: Advanced Credential Verification (Coming Soon)

- Merkle tree verification for credential sets
- Functions for verifying multiple attributes
- Nullifier system to prevent double-spending

### Phase 3: Privacy-Preserving Identity Proofs (Coming Soon)

- Zero-knowledge proofs for selective disclosure
- Credential aggregation functions
- Verifier contracts

## Architecture

### Credential Structure

```leo
struct Credential {
    attribute: u64,        // The credential value (age, status code, etc.)
    signature_r: scalar,   // Signature component r (EdDSA)
    signature_s: scalar    // Signature component s (EdDSA)
}
```

### Core Transitions

1. **verify_age_over_threshold**: Verifies age credential meets minimum threshold
2. **verify_citizenship**: Verifies citizenship status
3. **verify_citizen_over_18**: Combined verification of age and citizenship

## Usage

### Prerequisites

- Leo v3.4.0 or higher
- Aleo development environment

### Installation

```bash
git clone https://github.com/prjktcode/zkIdentity.git
cd zkIdentity/zkidentity
leo build
```

### Running Transitions

#### Verify Age Over Threshold

```bash
leo run verify_age_over_threshold \
  "{attribute: 25u64, signature_r: 0scalar, signature_s: 0scalar}" \
  "aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc" \
  "18u64"
```

Output: `true` (age 25 >= 18)

#### Verify Citizenship

```bash
leo run verify_citizenship \
  "{attribute: 1u64, signature_r: 0scalar, signature_s: 0scalar}" \
  "aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc"
```

Output: `true` (1 = citizen)

#### Verify Citizen Over 18

```bash
leo run verify_citizen_over_18 \
  "{attribute: 25u64, signature_r: 0scalar, signature_s: 0scalar}" \
  "{attribute: 1u64, signature_r: 0scalar, signature_s: 0scalar}" \
  "aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc"
```

Output: `true` (citizen AND age >= 18)

## Testing

### Manual Testing

Test individual transitions with different inputs:

```bash
# Test with underage (should return false)
leo run verify_age_over_threshold \
  "{attribute: 16u64, signature_r: 0scalar, signature_s: 0scalar}" \
  "aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc" \
  "18u64"

# Test with non-citizen (should return false)
leo run verify_citizenship \
  "{attribute: 0u64, signature_r: 0scalar, signature_s: 0scalar}" \
  "aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc"
```

## Privacy Guarantees

- **No Data Leakage**: Exact age is never revealed, only proof of threshold compliance
- **Zero-Knowledge**: Verifiers learn nothing beyond the boolean claim result
- **On-Chain Privacy**: All computations happen in zero-knowledge proofs on Aleo
- **Selective Disclosure**: Users choose which attributes to prove

## Use Cases

1. **Age-Gated Services**: Access adult content, alcohol purchase, voting without revealing birthdate
2. **Identity Verification**: Prove citizenship without passport details
3. **KYC/AML Compliance**: Satisfy regulatory requirements with minimal data exposure
4. **Credential Verification**: Prove qualifications without sharing certificates
5. **Access Control**: Grant permissions based on attributes without revealing identity

## Technical Details

### Why Aleo?

- **Native Privacy**: Built-in zero-knowledge proof system
- **Efficient Verification**: Fast on-chain proof verification
- **Developer-Friendly**: Leo language designed for private applications
- **Production-Ready**: Mature tooling and active ecosystem

### Signature Verification (Future Enhancement)

The credential structure includes signature components (`signature_r`, `signature_s`) that will be used with Aleo's cryptographic primitives to verify attestations from trusted issuers. Full implementation will use:

```leo
// Pseudocode for future implementation
let message: field = BHP256::hash_to_field(credential.attribute);
let is_valid: bool = signature::verify(
    issuer_pubkey,
    message,
    credential.signature_r,
    credential.signature_s
);
```

## Roadmap

- [x] Phase 1: Basic identity verification with signature structure
- [ ] Phase 2: Merkle tree verification and nullifiers
- [ ] Phase 3: Advanced ZK proofs and credential aggregation
- [ ] Phase 4: Production deployment and issuer integration
- [ ] Phase 5: Mobile SDK and user-facing applications

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT License - see LICENSE file for details

## Acknowledgments

Built for the Aleo Privacy Buildathon. Special thanks to the Aleo team for providing the infrastructure for private computation.

## Contact

For questions or collaboration opportunities, please open an issue on GitHub.

---

**Note**: This is a demonstration implementation for the Aleo Privacy Buildathon. In production, proper signature verification with trusted issuers must be implemented, and security audits should be conducted before handling real identity data.
