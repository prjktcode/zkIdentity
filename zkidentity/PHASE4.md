# Phase 4: Production Deployment and Issuer Integration

This document provides detailed information about zkIdentity Phase 4 features, implementation details, and integration guides.

## Table of Contents

1. [Overview](#overview)
2. [Architecture Changes](#architecture-changes)
3. [Issuer Integration Guide](#issuer-integration-guide)
4. [Credential Lifecycle](#credential-lifecycle)
5. [Security Model](#security-model)
6. [API Reference](#api-reference)
7. [Examples](#examples)

## Overview

Phase 4 transforms zkIdentity from a proof-of-concept to a production-ready system with:

- **Issuer Registry**: On-chain registry of trusted credential issuers
- **Signature Verification**: Full EdDSA/BHP256 cryptographic signature verification
- **Schema Registry**: Standardized credential schemas with metadata
- **Revocation System**: Merkle-tree-based credential revocation
- **Expiry Enforcement**: Block-height-based expiration
- **Admin Controls**: Secure admin-gated registry management

## Architecture Changes

### New Data Structures

#### Enhanced CredentialLeaf

```leo
struct CredentialLeaf {
    attr_type: u64,        // Attribute type (1=age, 2=citizenship, etc.)
    attr_value: u64,       // Attribute value
    schema_id: field,      // Schema ID for validation
    expiry: u32,           // Expiry block height
    credential_id: field,  // Unique identifier
    signature_r: scalar,   // EdDSA signature component r
    signature_s: scalar    // EdDSA signature component s
}
```

**Breaking Change from Phase 3:**
- Added `schema_id`, `expiry`, and `credential_id` fields
- All hash_leaf calls updated to include new fields

#### RevocationProof

```leo
struct RevocationProof {
    siblings: [field; 32], // Merkle siblings for revocation tree
    index: u64            // Index in revocation tree
}
```

### New Mappings

```leo
mapping admin: u8 => address;                    // Admin address (key=0)
mapping issuers: field => address;               // issuer_id → issuer_pubkey
mapping schemas: field => field;                 // schema_id → schema_hash
mapping revocation_roots: field => field;        // issuer_id → revocation_root
```

### Domain Separation Tags

```leo
const LEAF_DOMAIN_TAG: field = 1field;              // Credential leaf hashing
const NODE_DOMAIN_TAG: field = 2field;              // Merkle node hashing
const NULLIFIER_DOMAIN_TAG: field = 3field;         // Nullifier derivation
const SIGNATURE_MESSAGE_DOMAIN_TAG: field = 4field; // Signature message hashing
const REVOCATION_DOMAIN_TAG: field = 5field;        // Revocation leaf hashing
```

## Issuer Integration Guide

### Becoming an Issuer

#### Step 1: Generate Key Pair

```bash
# Generate Aleo account
leo account new

# Output:
#  Private Key: APrivateKey1...
#  Address: aleo1...
```

Save the private key securely. The address is your issuer public key.

#### Step 2: Register with Admin

Contact the zkIdentity admin and provide:
- Organization name
- Organization verification documents
- Issuer public key (address)
- Credential types you wish to issue
- Security and compliance documentation

#### Step 3: Admin Registers Issuer

Admin executes:

```bash
leo run register_issuer \
  "<issuer_id>field" \
  "aleo1<your_issuer_address>"
```

Example:
```bash
leo run register_issuer \
  "100field" \
  "aleo1abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567890"
```

#### Step 4: Register Schema

Define your credential schema:

```json
{
  "schema_id": 1,
  "name": "Age Credential",
  "version": "1.0",
  "attributes": {
    "attr_type": 1,
    "attr_value": "age in years (u64)"
  },
  "policy": {
    "revocable": true,
    "max_age_days": 365,
    "renewable": true
  }
}
```

Compute schema hash:

```python
import json
import hashlib

schema = {...}  # Your schema
schema_json = json.dumps(schema, sort_keys=True)
schema_hash = int(hashlib.sha256(schema_json.encode()).hexdigest()[:16], 16)
print(f"{schema_hash}field")
```

Admin registers schema:

```bash
leo run register_schema \
  "1field" \
  "<schema_hash>field"
```

### Issuing Credentials

#### Step 1: Verify Credential Request

When a user requests a credential:

1. Verify user identity through your process
2. Confirm user meets credential requirements
3. Generate unique credential_id

```python
import uuid
import hashlib

# Generate unique credential ID
request_id = str(uuid.uuid4())
credential_id = int(hashlib.sha256(request_id.encode()).hexdigest()[:16], 16)
```

#### Step 2: Set Expiry

Calculate expiry block height:

```python
# Get current block height from Aleo API
import requests

response = requests.get("https://api.explorer.aleo.org/v1/testnet/latest/height")
current_height = response.json()

# Set expiry (e.g., 1 year)
blocks_per_day = 8640
expiry_days = 365
expiry_height = current_height + (blocks_per_day * expiry_days)
```

#### Step 3: Create and Sign Credential

```python
from aleo import Account, Program

# Issuer's account (load from secure storage)
issuer_account = Account.from_private_key("APrivateKey1...")

# Credential data
attr_type = 1  # Age
attr_value = 25  # 25 years old
schema_id = 1
expiry = expiry_height
credential_id = <generated_credential_id>

# Hash for signature (domain-separated)
def hash_for_signature(attr_type, attr_value, schema_id, expiry, credential_id):
    # This should match the Leo contract's hash_credential_for_signature
    # Pseudocode - actual implementation needs Aleo SDK
    from aleo import Poseidon
    
    preimage = Poseidon.hash_to_field(4, attr_type, attr_value, schema_id)
    message = Poseidon.hash_to_field(preimage, expiry, credential_id, 0)
    return message

message = hash_for_signature(attr_type, attr_value, schema_id, expiry, credential_id)

# Sign using EdDSA
signature = issuer_account.sign(message)

# Return credential to user
credential = {
    "attr_type": attr_type,
    "attr_value": attr_value,
    "schema_id": schema_id,
    "expiry": expiry,
    "credential_id": credential_id,
    "signature_r": signature.r,
    "signature_s": signature.s,
    "issuer_id": 100  # Your issuer ID
}
```

#### Step 4: Build Merkle Tree

Add credential to your Merkle tree:

```python
from merkle_tree import MerkleTree

# Your credential tree (persistent storage)
credential_tree = MerkleTree.load("credential_tree.db")

# Hash credential leaf
def hash_leaf(credential):
    # Must match Leo contract's hash_leaf
    from aleo import Poseidon
    
    preimage1 = Poseidon.hash_to_field(
        1,  # LEAF_DOMAIN_TAG
        credential["attr_type"],
        credential["attr_value"],
        credential["schema_id"]
    )
    
    preimage2 = Poseidon.hash_to_field(
        preimage1,
        credential["expiry"],
        credential["credential_id"],
        credential["signature_r"]
    )
    
    leaf_hash = Poseidon.hash_to_field(preimage2, credential["signature_s"])
    return leaf_hash

leaf_hash = hash_leaf(credential)
index = credential_tree.add_leaf(leaf_hash)

# Generate Merkle proof for user
proof = credential_tree.get_proof(index)

# Return proof to user
credential["merkle_proof"] = {
    "siblings": proof.siblings,
    "index": proof.index,
    "root": credential_tree.root()
}

# Save tree
credential_tree.save("credential_tree.db")
```

#### Step 5: Provide to User

Return complete credential package:

```json
{
  "credential": {
    "attr_type": 1,
    "attr_value": 25,
    "schema_id": 1,
    "expiry": 4153600,
    "credential_id": "123456789",
    "signature_r": "...",
    "signature_s": "..."
  },
  "merkle_proof": {
    "siblings": ["0field", "0field", ...],
    "index": 42,
    "root": "987654321field"
  },
  "issuer_id": 100,
  "revocation_proof": {
    "siblings": ["0field", "0field", ...],
    "index": 0
  }
}
```

## Credential Lifecycle

### 1. Issuance

```
User Request → Issuer Verification → Credential Generation → Signing → Merkle Tree → User Receives
```

### 2. Verification

```
User Presents Credential → On-Chain Verification:
  ├─ Signature Check (issuer registered?)
  ├─ Schema Check (schema registered?)
  ├─ Expiry Check (not expired?)
  ├─ Merkle Proof (in credential tree?)
  ├─ Revocation Check (not revoked?)
  └─ Nullifier Check (not double-spent?)
```

### 3. Revocation

```
Issuer Decision → Update Revocation Tree → Update On-Chain Root → Credentials Become Invalid
```

### 4. Expiry

```
Block Height Exceeds Expiry → Automatic Rejection → User Must Renew
```

## Security Model

### Trust Model

**Trusted Components:**
- Admin: Controls issuer and schema registries
- Issuers: Sign credentials, maintain credential trees
- Aleo Blockchain: Provides consensus and state integrity

**Trustless Components:**
- Users: Cannot forge credentials without issuer signature
- Verifiers: Cannot learn more than proven attributes
- Contract: Enforces all security checks automatically

### Threat Analysis

#### 1. Admin Key Compromise

**Impact:** Attacker can register malicious issuers

**Mitigation:**
- Use hardware wallet for admin key
- Multi-sig admin (future enhancement)
- Monitor all admin operations
- Regular security audits

#### 2. Issuer Key Compromise

**Impact:** Attacker can issue fraudulent credentials

**Mitigation:**
- Issuer key rotation procedures
- Immediate revocation of compromised issuer's credentials
- Credential expiry limits damage window
- Monitor for unusual issuance patterns

#### 3. Credential Theft

**Impact:** Attacker uses stolen credential

**Mitigation:**
- Nullifier system prevents double-spending
- User-controlled nullifier secret
- Credential bound to user's secret

#### 4. Revocation Delay

**Impact:** Revoked credentials remain valid until on-chain update

**Mitigation:**
- Fast revocation update procedures
- Short credential expiry times
- Real-time revocation monitoring

### Best Practices

#### For Admins

1. **Key Security:**
   - Use hardware wallet for admin key
   - Never store private key in plaintext
   - Regular key rotation schedule

2. **Issuer Vetting:**
   - Thorough background checks
   - Legal agreements
   - Regular compliance audits

3. **Monitoring:**
   - Alert on all admin operations
   - Regular registry audits
   - Incident response procedures

#### For Issuers

1. **Key Management:**
   - Secure key storage (HSM recommended)
   - Key rotation procedures
   - Backup and recovery plans

2. **Credential Issuance:**
   - Thorough identity verification
   - Unique credential IDs
   - Appropriate expiry times
   - Merkle tree backups

3. **Revocation:**
   - Clear revocation policies
   - Fast revocation procedures
   - User notification on revocation

#### For Users

1. **Credential Storage:**
   - Secure storage of credentials
   - Backup credential data
   - Protect nullifier secrets

2. **Usage:**
   - Verify issuer identity
   - Check credential expiry
   - Use appropriate nullifier secrets

## API Reference

### Admin Transitions

#### constructor

Initialize program with admin address.

```leo
transition constructor(admin_address: address) -> Future
```

**Parameters:**
- `admin_address`: Address that will have admin privileges

**Example:**
```bash
leo run constructor "aleo1admin_address"
```

#### register_issuer

Register or update an issuer.

```leo
async transition register_issuer(
    public issuer_id: field,
    public issuer_pubkey: address
) -> Future
```

**Parameters:**
- `issuer_id`: Unique issuer identifier
- `issuer_pubkey`: Issuer's public key (address)

**Requires:** Caller must be admin

**Example:**
```bash
leo run register_issuer "100field" "aleo1issuer_address"
```

#### register_schema

Register a credential schema.

```leo
async transition register_schema(
    public schema_id: field,
    public schema_hash: field
) -> Future
```

**Parameters:**
- `schema_id`: Unique schema identifier
- `schema_hash`: Hash of schema definition

**Requires:** Caller must be admin

**Example:**
```bash
leo run register_schema "1field" "123456789field"
```

#### update_revocation_root

Update an issuer's revocation root.

```leo
async transition update_revocation_root(
    public issuer_id: field,
    public new_revocation_root: field
) -> Future
```

**Parameters:**
- `issuer_id`: Issuer whose revocation root to update
- `new_revocation_root`: New Merkle root of revoked credentials

**Requires:** Caller must be admin

**Example:**
```bash
leo run update_revocation_root "100field" "987654321field"
```

#### update_admin

Transfer admin rights.

```leo
async transition update_admin(
    public new_admin: address
) -> Future
```

**Parameters:**
- `new_admin`: New admin address

**Requires:** Caller must be current admin

**Warning:** This operation cannot be undone. Verify address carefully.

**Example:**
```bash
leo run update_admin "aleo1new_admin_address"
```

### Verification Transitions

All verification transitions now include production security checks. See main README for complete API.

## Examples

### Complete Flow: Government ID

#### 1. Admin Setup

```bash
# Deploy and initialize
leo run constructor "aleo1admin_address"

# Register government issuer
leo run register_issuer \
  "100field" \
  "aleo1government_issuer_address"

# Register age schema
leo run register_schema \
  "1field" \
  "123456789field"
```

#### 2. Issuer Issues Credential

```python
# User proves they are 25 years old
credential = {
    "attr_type": 1,
    "attr_value": 25,
    "schema_id": 1,
    "expiry": 4153600,  # 1 year from now
    "credential_id": 123456789,
    "signature_r": "...",  # Signed by issuer
    "signature_s": "..."
}
```

#### 3. User Verifies Age > 18

```bash
leo run verify_age_over_threshold_merkle \
  "{attr_type: 1u64, attr_value: 25u64, schema_id: 1field, expiry: 4153600u32, credential_id: 123456789field, signature_r: 0scalar, signature_s: 0scalar}" \
  "{siblings: [0field; 32], index: 0u64}" \
  "987654321field" \
  "18u64" \
  "secret_123field" \
  "100field" \
  "1000000u32" \
  "{siblings: [0field; 32], index: 0u64}"
```

#### 4. Issuer Revokes Credential

```python
# Add credential to revocation tree
revocation_tree.add_leaf(credential_id)
new_root = revocation_tree.root()

# Update on-chain
leo run update_revocation_root "100field" f"{new_root}field"
```

#### 5. Verification Now Fails

```bash
# Same verification as step 3 will now fail
# because credential is in revocation tree
```

## Migration from Phase 3

If you have Phase 3 credentials, you need to:

1. **Update Credential Structure:**
   - Add `schema_id`, `expiry`, `credential_id` fields
   - Re-sign with updated hash

2. **Register Issuers:**
   - Register all issuers in on-chain registry

3. **Register Schemas:**
   - Define and register all schemas

4. **Update Merkle Trees:**
   - Rebuild trees with new leaf hash format

5. **Update Verification Calls:**
   - Add `issuer_id`, `current_block_height`, `revocation_proof` parameters

See [MIGRATION.md](MIGRATION.md) for detailed migration guide (coming soon).

## Support

For questions or issues:

- **GitHub Issues:** https://github.com/prjktcode/zkIdentity/issues
- **Documentation:** See DEPLOYMENT.md and OPERATIONAL_RUNBOOK.md
- **Aleo Discord:** https://discord.gg/aleo
