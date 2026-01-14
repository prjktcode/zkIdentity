# zkIdentity Deployment Configuration

## Network Configuration

This file contains configuration constants and known values for zkIdentity deployment.

### Admin Address

The admin address is set during program deployment via the constructor.
Only the admin can:
- Register new issuers
- Register new schemas
- Update revocation roots
- Transfer admin rights

**Important:** Set your admin address in `.env` before deployment.

### Known Issuer IDs

Register issuer IDs after deployment using the `register_issuer` transition.

Example issuer IDs (for reference):
```
Government ID Issuer: 100field
University Issuer: 200field
Healthcare Issuer: 300field
```

### Schema IDs

Register schema IDs after deployment using the `register_schema` transition.

Example schema IDs:
```
Age Schema: 1field
Citizenship Schema: 2field
Education Schema: 3field
```

### Domain Separation Tags

These are hardcoded in the contract:
```
LEAF_DOMAIN_TAG: 1field
NODE_DOMAIN_TAG: 2field
NULLIFIER_DOMAIN_TAG: 3field
SIGNATURE_MESSAGE_DOMAIN_TAG: 4field
REVOCATION_DOMAIN_TAG: 5field
```

### Attribute Types

Standardized attribute type codes:
```
1u64: Age
2u64: Citizenship
3u64: Education Level
4u64: Employment Status
5u64: Healthcare Status
```

### Block Height for Expiry

Credentials expire based on block height. Current Aleo testnet produces blocks approximately every 10 seconds.

Approximate conversions:
- 1 day ≈ 8,640 blocks
- 1 week ≈ 60,480 blocks
- 1 month ≈ 259,200 blocks
- 1 year ≈ 3,153,600 blocks

To set an expiry, add desired blocks to current block height.

### Network Endpoints

**Testnet:**
- API: https://api.explorer.aleo.org/v1
- Broadcast: https://api.explorer.aleo.org/v1/testnet/transaction/broadcast
- Explorer: https://explorer.aleo.org/

**Mainnet:**
- API: https://api.explorer.aleo.org/v1
- Broadcast: https://api.explorer.aleo.org/v1/mainnet/transaction/broadcast
- Explorer: https://explorer.aleo.org/

### Gas and Fees

Deployment and transaction fees vary based on network congestion.
Set `PRIORITY_FEE` in `.env` to prioritize your transactions.

Typical ranges (testnet):
- Program deployment: ~1000 credits
- Transition execution: ~100-500 credits
- Admin operations: ~100-200 credits
