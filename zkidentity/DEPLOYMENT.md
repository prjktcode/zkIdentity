# zkIdentity Deployment Guide

This guide walks through deploying zkIdentity to Aleo testnet and mainnet.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Building the Program](#building-the-program)
4. [Testnet Deployment](#testnet-deployment)
5. [Post-Deployment Setup](#post-deployment-setup)
6. [Mainnet Deployment](#mainnet-deployment)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Tools

1. **Leo Compiler** (v3.4.0 or higher)
   ```bash
   curl -L https://raw.githubusercontent.com/AleoHQ/leo/testnet/install.sh | bash
   ```

2. **snarkOS CLI** (for deployment)
   ```bash
   cargo install snarkos
   ```

3. **Aleo Account**
   - Create a wallet at https://www.provable.com/
   - Fund your testnet account from the faucet: https://faucet.aleo.org/

### Required Information

- Admin address (your Aleo address)
- Private key (for signing deployment transaction)
- Sufficient credits for deployment (~1000 credits for testnet)

## Environment Setup

1. **Copy environment template:**
   ```bash
   cd zkidentity
   cp .env.example .env
   ```

2. **Configure .env file:**
   ```bash
   # Edit .env with your values
   NETWORK=testnet
   ADMIN_ADDRESS=aleo1your_address_here
   # Note: Do not put your private key in .env if committing to version control
   ```

3. **Verify configuration:**
   ```bash
   make check-env
   ```

## Building the Program

Build the zkIdentity program:

```bash
make build
```

This will:
- Compile the Leo program
- Generate proving and verifying keys
- Create the program manifest
- Output build artifacts to `build/` directory

Verify the build:
```bash
ls -la build/
```

You should see:
- `main.aleo` - Compiled Aleo program
- `zkidentity.aleo` - Program with correct naming

## Testnet Deployment

### Step 1: Deploy Program

Deploy to Aleo testnet:

```bash
# Using snarkOS
snarkos developer deploy zkidentity.aleo \
  --private-key YOUR_PRIVATE_KEY \
  --query https://api.explorer.aleo.org/v1 \
  --broadcast https://api.explorer.aleo.org/v1/testnet/transaction/broadcast \
  --priority-fee 0
```

Or use the Makefile (which will show you the command):
```bash
make deploy-testnet
```

**Important:** Keep your private key secure. Never commit it to version control.

### Step 2: Wait for Confirmation

Monitor deployment status:
```bash
# Check transaction status on explorer
# Visit: https://explorer.aleo.org/
```

Deployment typically takes 2-5 minutes on testnet.

### Step 3: Verify Deployment

Verify the program is deployed:

```bash
# Check program exists
curl https://api.explorer.aleo.org/v1/testnet/program/zkidentity.aleo

# Or use make target
make verify-deployment
```

You should see the program JSON with all transitions.

## Post-Deployment Setup

After deployment, initialize the program and register issuers.

### Step 1: Initialize Admin

Run the constructor to set the admin address:

```bash
leo run constructor "aleo1your_admin_address"
```

### Step 2: Register Issuer

Register your first issuer:

```bash
leo run register_issuer \
  "100field" \
  "aleo1issuer_public_key_address"
```

Where:
- `100field` - Unique issuer ID
- `aleo1issuer_public_key_address` - Issuer's public key (address)

### Step 3: Register Schema

Register credential schema:

```bash
leo run register_schema \
  "1field" \
  "123456789field"
```

Where:
- `1field` - Schema ID (e.g., 1 for age credentials)
- `123456789field` - Schema hash (hash of schema definition)

### Step 4: Set Initial Revocation Root (Optional)

If using revocation from the start:

```bash
leo run update_revocation_root \
  "100field" \
  "0field"
```

Where:
- `100field` - Issuer ID
- `0field` - Empty revocation root (no revocations yet)

### Step 5: Test a Verification

Test age verification (example with dummy data):

```bash
leo run verify_age_over_threshold_merkle \
  "{attr_type: 1u64, attr_value: 25u64, schema_id: 1field, expiry: 10000u32, credential_id: 1field, signature_r: 0scalar, signature_s: 0scalar}" \
  "{siblings: [0field; 32], index: 0u64}" \
  "0field" \
  "18u64" \
  "1field" \
  "100field" \
  "1000u32" \
  "{siblings: [0field; 32], index: 0u64}"
```

## Mainnet Deployment

⚠️ **WARNING: Mainnet deployment uses real credits and is permanent.**

### Pre-Mainnet Checklist

Before deploying to mainnet, ensure:

- [ ] Thoroughly tested on testnet
- [ ] Security audit completed (recommended)
- [ ] Admin key management process in place
- [ ] Issuer registration process documented
- [ ] Revocation strategy defined
- [ ] Sufficient mainnet credits for deployment
- [ ] Backup of all deployment keys

### Mainnet Deployment Steps

1. **Update configuration:**
   ```bash
   # In .env
   NETWORK=mainnet
   ```

2. **Build for mainnet:**
   ```bash
   make clean
   make build
   ```

3. **Deploy:**
   ```bash
   snarkos developer deploy zkidentity.aleo \
     --private-key YOUR_MAINNET_PRIVATE_KEY \
     --query https://api.explorer.aleo.org/v1 \
     --broadcast https://api.explorer.aleo.org/v1/mainnet/transaction/broadcast \
     --priority-fee 1000
   ```

   Or with confirmation:
   ```bash
   make deploy-mainnet
   ```

4. **Follow post-deployment steps** as with testnet

5. **Document deployment:**
   - Save program ID
   - Save admin address
   - Save all registered issuer IDs
   - Save all schema IDs

## Operational Procedures

### Registering New Issuer

```bash
leo run register_issuer \
  "<NEW_ISSUER_ID>field" \
  "aleo1<issuer_public_key>"
```

Only admin can execute this.

### Updating Issuer Key

Same command as registration (will overwrite):

```bash
leo run register_issuer \
  "<EXISTING_ISSUER_ID>field" \
  "aleo1<new_public_key>"
```

### Updating Revocation Root

When credentials are revoked:

```bash
leo run update_revocation_root \
  "<ISSUER_ID>field" \
  "<NEW_REVOCATION_ROOT>field"
```

The new revocation root should be the Merkle root of all revoked credential IDs.

### Transferring Admin

To transfer admin rights to a new address:

```bash
leo run update_admin \
  "aleo1<new_admin_address>"
```

⚠️ **WARNING:** This cannot be undone. Verify the address carefully.

## Troubleshooting

### Build Failures

**Error: Leo not found**
```bash
make install-leo
source ~/.bashrc  # or ~/.zshrc
```

**Error: Invalid syntax**
- Ensure Leo version is 3.4.0+
- Check `leo --version`

### Deployment Failures

**Error: Insufficient credits**
- Fund your account from faucet (testnet) or buy credits (mainnet)
- Check balance: `snarkos account balance`

**Error: Program already exists**
- The program name is taken
- Change program name in `program.json` or use existing deployment

**Error: Network timeout**
- Retry deployment
- Check network status: https://explorer.aleo.org/

### Transaction Failures

**Error: Nullifier already used**
- The credential has already been verified
- This is expected behavior for double-spend protection

**Error: Issuer not found**
- Register the issuer first using `register_issuer`

**Error: Schema not found**
- Register the schema first using `register_schema`

**Error: Signature verification failed**
- Ensure credential is signed by registered issuer
- Verify issuer public key matches registered key

**Error: Credential expired**
- The credential's expiry block height has passed
- Issue a new credential with updated expiry

**Error: Credential revoked**
- The credential is in the revocation tree
- This is expected for revoked credentials

### Getting Help

- **Aleo Discord:** https://discord.gg/aleo
- **Aleo Forum:** https://community.aleo.org/
- **GitHub Issues:** https://github.com/prjktcode/zkIdentity/issues

## Security Considerations

1. **Private Key Management:**
   - Never commit private keys to version control
   - Use hardware wallet for mainnet admin key
   - Rotate keys periodically

2. **Admin Key Security:**
   - Admin has full control over issuer registry
   - Consider multi-sig or time-lock for admin operations
   - Document admin key recovery process

3. **Issuer Verification:**
   - Verify issuer identity before registration
   - Use secure channels for issuer key exchange
   - Monitor issuer registrations

4. **Revocation Management:**
   - Plan revocation strategy before launch
   - Automate revocation root updates
   - Monitor revocation tree growth

5. **Monitoring:**
   - Monitor all admin transactions
   - Set up alerts for unauthorized operations
   - Regular audits of issuer/schema registries

## Next Steps

After successful deployment:

1. Register your issuers and schemas
2. Integrate with issuer systems for credential signing
3. Build credential verification applications
4. Monitor usage and performance
5. Plan for key rotation and updates

See [OPERATIONAL_RUNBOOK.md](OPERATIONAL_RUNBOOK.md) for ongoing operations guide.
