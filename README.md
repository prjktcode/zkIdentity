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

### Phase 4: Production Deployment + Issuer Integration ✅

Phase 4 delivers production-ready features:

- **Issuer Registry**: On-chain registry of trusted credential issuers with admin-gated control
- **Schema Registry**: Standardized credential schemas with policy metadata
- **EdDSA/BHP256 Signatures**: Full cryptographic signature verification using Aleo primitives
- **Revocation System**: Per-issuer Merkle-tree-based credential revocation
- **Expiry Enforcement**: Block-height-based credential expiration
- **Admin Controls**: Secure admin-gated transitions for registry management
- **Deployment Ready**: Complete testnet/mainnet deployment infrastructure and documentation

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

#### Phase 2 & 4: Enhanced Credential Leaf (Production)

```leo
struct CredentialLeaf {
    attr_type: u64,        // Type of attribute (1=age, 2=citizenship, etc.)
    attr_value: u64,       // Value of the attribute
    schema_id: field,      // Schema ID for this credential type
    expiry: u32,           // Expiry block height
    credential_id: field,  // Unique credential identifier
    signature_r: scalar,   // Signature component r
    signature_s: scalar    // Signature component s
}

struct MerkleProof {
    siblings: [field; 32], // 32 sibling hashes for depth-32 tree
    index: u64            // Leaf index in the tree
}

struct RevocationProof {
    siblings: [field; 32], // Merkle siblings for revocation tree
    index: u64            // Index in revocation tree
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

#### Phase 4: Admin & Registry Management

9. **constructor**: Initialize program with admin address
10. **register_issuer**: Register or update issuer public key (admin only)
11. **register_schema**: Register credential schema (admin only)
12. **update_revocation_root**: Update issuer revocation Merkle root (admin only)
13. **update_admin**: Transfer admin rights (admin only)

### Utility Functions

- **hash_leaf**: Poseidon hash for credential leaves with domain separation (tag=1)
- **hash_node**: Poseidon hash for internal Merkle nodes with domain separation (tag=2)
- **compute_merkle_root**: Recompute Merkle root from leaf and 32-level proof
- **derive_nullifier**: Derive nullifier from credential_id + secret with domain separation (tag=3)
- **hash_credential_for_signature**: Hash credential data for signature verification (tag=4)
- **verify_credential_signature**: Verify EdDSA/BHP256 signature against issuer public key
- **check_not_revoked**: Check credential is not in revocation tree (tag=5)

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

## Phase 4: Production Features

### Issuer Registry

zkIdentity maintains an on-chain registry of trusted credential issuers. Only the admin can register or update issuers.

**Registering an Issuer:**

```bash
leo run register_issuer \
  "100field" \
  "aleo1issuer_public_key_address"
```

- `100field`: Unique issuer ID
- `aleo1issuer_public_key_address`: Issuer's public key for signature verification

**Key Features:**
- Admin-gated: Only admin can register/update issuers
- On-chain verification: All verifications check against registered issuers
- Key rotation: Update issuer keys without changing issuer ID

### Schema Registry

Schemas define credential types and their validation rules.

**Registering a Schema:**

```bash
leo run register_schema \
  "1field" \
  "123456789field"
```

- `1field`: Schema ID (e.g., 1 for age, 2 for citizenship)
- `123456789field`: Hash of schema definition

**Schema Example:**
```json
{
  "schema_id": 1,
  "name": "Age Credential",
  "attributes": {
    "attr_type": 1,
    "attr_value": "age in years (u64)"
  },
  "policy": {
    "revocable": true,
    "max_age_days": 365
  }
}
```

### EdDSA/BHP256 Signature Verification

All credential verifications now include signature verification:

```leo
// Implemented in Phase 4
function verify_credential_signature(
    issuer_pubkey: address,
    attr_type: u64,
    attr_value: u64,
    schema_id: field,
    expiry: u32,
    credential_id: field,
    signature_r: scalar,
    signature_s: scalar
) -> bool {
    let message: field = hash_credential_for_signature(
        attr_type, attr_value, schema_id, expiry, credential_id
    );
    let message_hash: group = BHP256::hash_to_group(message);
    let signature: signature = signature { sig_r: signature_r, sig_s: signature_s };
    return signature::verify(issuer_pubkey, message_hash, signature);
}
```

**Signing Procedure (Issuer Side):**

1. Issuer receives credential request
2. Validates requestor identity
3. Creates credential data (attr_type, attr_value, schema_id, expiry, credential_id)
4. Hashes data with domain separation (SIGNATURE_MESSAGE_DOMAIN_TAG = 4)
5. Signs using EdDSA with issuer's private key
6. Returns credential with signature components (signature_r, signature_s)

### Revocation System

Credentials can be revoked by issuers through a Merkle-tree-based system.

**Updating Revocation Root:**

```bash
leo run update_revocation_root \
  "100field" \
  "987654321field"
```

- `100field`: Issuer ID
- `987654321field`: New revocation Merkle root (root of tree containing revoked credential IDs)

**Revocation Process:**

1. Issuer maintains off-chain Merkle tree of revoked credential IDs
2. When revoking credentials:
   - Add credential_id to tree
   - Recompute Merkle root
   - Update on-chain revocation root
3. During verification:
   - Verifier provides non-membership proof
   - Contract checks credential_id is not in revocation tree

**Non-Membership Proof:**
- User provides Merkle proof for their credential_id
- If proof doesn't match revocation root, credential is not revoked
- If no revocation root exists (0field), all credentials are valid

### Expiry Enforcement

Credentials expire based on block height.

**Setting Expiry:**

```python
# Python example
current_block = 1000000  # Current block height
expiry_days = 365
blocks_per_day = 8640  # ~10 seconds per block
expiry_block = current_block + (expiry_days * blocks_per_day)
# expiry_block = 4153600
```

**Verification:**

```leo
// Contract automatically checks
assert(current_block_height <= leaf.expiry);
```

**Block Height Approximations:**
- 1 day ≈ 8,640 blocks
- 1 week ≈ 60,480 blocks  
- 1 month ≈ 259,200 blocks
- 1 year ≈ 3,153,600 blocks

### Admin Controls

The admin address has exclusive rights to:

1. **Register Issuers**: Add new trusted credential issuers
2. **Update Issuer Keys**: Rotate issuer public keys
3. **Register Schemas**: Define new credential types
4. **Update Revocation Roots**: Publish revocation updates
5. **Transfer Admin Rights**: Change admin to new address

**Setting Admin (During Deployment):**

```bash
leo run constructor "aleo1your_admin_address"
```

**Transferring Admin:**

```bash
leo run update_admin "aleo1new_admin_address"
```

⚠️ **Security Warning:** Admin key compromise allows full control over issuer registry. Use hardware wallet for mainnet admin key.

## Deployment

### Quick Start (Testnet)

```bash
cd zkidentity

# 1. Install dependencies
make install-leo

# 2. Configure deployment
cp .env.example .env
# Edit .env with your ADMIN_ADDRESS

# 3. Build program
make build

# 4. Deploy to testnet (requires snarkOS and private key)
make deploy-testnet

# 5. Initialize
leo run constructor "aleo1your_admin_address"

# 6. Register first issuer
leo run register_issuer "100field" "aleo1issuer_address"

# 7. Register first schema  
leo run register_schema "1field" "123456789field"
```

### Detailed Deployment Guide

See [zkidentity/DEPLOYMENT.md](zkidentity/DEPLOYMENT.md) for:
- Complete testnet deployment instructions
- Mainnet deployment procedures
- Post-deployment setup
- Troubleshooting guide

### Operational Runbook

See [zkidentity/OPERATIONAL_RUNBOOK.md](zkidentity/OPERATIONAL_RUNBOOK.md) for:
- Daily operations procedures
- Issuer management workflows
- Revocation management
- Key rotation procedures
- Incident response
- Monitoring and alerts

### Configuration

See [zkidentity/CONFIG.md](zkidentity/CONFIG.md) for:
- Network configuration
- Known issuer IDs
- Schema definitions
- Domain separation tags
- Block height calculations

## Roadmap

- [x] Phase 1: Basic identity verification with signature structure
- [x] Phase 2: Merkle tree verification and nullifiers
- [x] Phase 3: Advanced ZK proofs and credential aggregation
- [x] Testing UI: React/Vite interface for testing all features
- [x] Phase 4: Production deployment and issuer integration
  - [x] Issuer registry with admin controls
  - [x] Schema registry system
  - [x] EdDSA/BHP256 signature verification
  - [x] Revocation system (Merkle-tree-based)
  - [x] Credential expiry enforcement
  - [x] Deployment scripts and documentation
  - [x] Operational runbook
- [ ] Phase 5: Mobile SDK and user-facing applications
  - [ ] Mobile wallet for credential storage
  - [ ] Browser extension for web integration
  - [ ] Issuer dashboard and portal
  - [ ] Automated revocation management

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT License - see LICENSE file for details

## Acknowledgments

Built for the Aleo Privacy Buildathon. Special thanks to the Aleo team for providing the infrastructure for private computation.

## Contact

For questions or collaboration opportunities, please open an issue on GitHub.

---

## Security Considerations

**Phase 4 Production Features:**

zkIdentity Phase 4 implements production-grade security features including:
- ✅ EdDSA/BHP256 signature verification with registered issuers
- ✅ Admin-gated issuer and schema management
- ✅ Merkle-tree-based credential revocation
- ✅ Block-height-based expiry enforcement
- ✅ Domain-separated hashing for all operations

**Before Production Use:**

1. **Security Audit**: Conduct comprehensive security audit
2. **Key Management**: Implement secure admin key management (hardware wallet recommended)
3. **Monitoring**: Set up monitoring and alerts for all admin operations
4. **Incident Response**: Establish incident response procedures
5. **Testing**: Thoroughly test on testnet before mainnet deployment
6. **Documentation**: Review all operational procedures in OPERATIONAL_RUNBOOK.md

**Threat Model:**

- **Admin Key Compromise**: Admin has full control over issuer registry. Protect admin key with hardware wallet.
- **Issuer Key Compromise**: Compromised issuer can issue fraudulent credentials. Rotate keys immediately if compromised.
- **Revocation Delay**: Revocation updates require on-chain transaction. Plan for potential delay.
- **Expiry Granularity**: Expiry based on block height (~10 second granularity on Aleo).

See [OPERATIONAL_RUNBOOK.md](zkidentity/OPERATIONAL_RUNBOOK.md) for incident response procedures.
