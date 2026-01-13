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

### Phase 2: Advanced Credential Verification ✅

Phase 2 introduces Merkle tree verification and nullifier tracking for preventing double-usage:

- **Merkle Tree Verification**: Credentials stored in depth-32 Merkle trees using Poseidon hashing with domain separation
- **Nullifier System**: Prevents credential reuse through on-chain nullifier tracking
- **Enhanced Data Structures**: `CredentialLeaf`, `MerkleProof`, and `Nullifier` structs for advanced verification
- **Merkle Transitions**: `verify_age_over_threshold_merkle` and `verify_citizenship_merkle` with nullifier checks

### Phase 3: Privacy-Preserving Identity Proofs ✅

Phase 3 adds advanced privacy-preserving features:

- **Multi-Attribute Verification**: Verify multiple attributes from the same credential tree in one transaction
- **Selective Disclosure**: Prove membership while only revealing selected attributes
- **Aggregated Credentials**: Batch verify multiple credentials from different issuers/trees
- **Advanced Privacy**: Minimal data exposure with maximum verification flexibility

## Architecture

### Credential Structure

#### Phase 1: Basic Credential

```leo
struct Credential {
    attribute: u64,        // The credential value (age, status code, etc.)
    signature_r: scalar,   // Signature component r (EdDSA)
    signature_s: scalar    // Signature component s (EdDSA)
}
```

#### Phase 2: Enhanced Credential Leaf

```leo
struct CredentialLeaf {
    attr_type: u64,        // Type of attribute (1=age, 2=citizenship, etc.)
    attr_value: u64,       // Value of the attribute
    signature_r: scalar,   // Signature component r
    signature_s: scalar    // Signature component s
}

struct MerkleProof {
    siblings: [field; 32], // 32 sibling hashes for depth-32 tree
    index: u64            // Leaf index in the tree
}

struct Nullifier {
    value: field          // Derived nullifier value
}
```

### Core Transitions

#### Phase 1: Basic Verification

1. **verify_age_over_threshold**: Verifies age credential meets minimum threshold
2. **verify_citizenship**: Verifies citizenship status
3. **verify_citizen_over_18**: Combined verification of age and citizenship

#### Phase 2: Merkle Tree & Nullifiers

4. **verify_age_over_threshold_merkle**: Verify age with Merkle proof and nullifier tracking
5. **verify_citizenship_merkle**: Verify citizenship with Merkle proof and nullifier tracking

#### Phase 3: Advanced Privacy Proofs

6. **verify_multi_attributes**: Verify multiple attributes from the same tree
7. **verify_selective_disclosure**: Verify membership with selective attribute disclosure
8. **verify_aggregated_credentials**: Batch verify credentials from different trees

### Utility Functions

- **hash_leaf**: Poseidon hash for credential leaves with domain separation (tag=1)
- **hash_node**: Poseidon hash for internal Merkle nodes with domain separation (tag=2)
- **compute_merkle_root**: Recompute Merkle root from leaf and 32-level proof
- **derive_nullifier**: Derive nullifier from credential_id + secret with domain separation (tag=3)

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

#### Phase 1: Basic Verification

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

#### Phase 2: Merkle Tree Verification

#### Verify Age with Merkle Proof

```bash
leo run verify_age_over_threshold_merkle \
  "{attr_type: 1u64, attr_value: 25u64, signature_r: 0scalar, signature_s: 0scalar}" \
  "{siblings: [0field, 0field, /* ... 32 fields */], index: 0u64}" \
  "123456789field" \
  "18u64" \
  "1field" \
  "12345field"
```

Verifies age >= 18 using Merkle proof and prevents reuse via nullifier.

#### Phase 3: Multi-Attribute Verification

```bash
leo run verify_multi_attributes \
  "{attr_type: 1u64, attr_value: 25u64, signature_r: 0scalar, signature_s: 0scalar}" \
  "{siblings: [...], index: 0u64}" \
  "{attr_type: 2u64, attr_value: 1u64, signature_r: 0scalar, signature_s: 0scalar}" \
  "{siblings: [...], index: 1u64}" \
  "{attr_type: 3u64, attr_value: 100u64, signature_r: 0scalar, signature_s: 0scalar}" \
  "{siblings: [...], index: 2u64}" \
  "123456789field" \
  "1field" \
  "12345field"
```

Verifies three attributes (age, citizenship, score) from the same credential tree.

## Testing UI

A comprehensive React + Vite testing interface is available in the `ui/` directory.

### Features

- **Interactive Testing**: Test all Phase 1, 2, and 3 transitions
- **Merkle Tree Visualization**: Visual representation of depth-32 Merkle trees
- **Nullifier Tracker**: Track and manage nullifiers
- **Command Generation**: Automatically generate Leo commands for testing

### Quick Start

```bash
cd ui
npm install
npm run dev
```

Visit `http://localhost:5173` to access the testing UI.

For more details, see [ui/README.md](ui/README.md).

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
- [x] Phase 2: Merkle tree verification and nullifiers
- [x] Phase 3: Advanced ZK proofs and credential aggregation
- [x] Testing UI: React/Vite interface for testing all features
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
