# Phase 4 Deployment Checklist

Use this checklist when deploying zkIdentity Phase 4 to ensure all steps are completed.

## Pre-Deployment Checklist

### Environment Setup
- [ ] Leo compiler installed (v3.4.0+)
  ```bash
  leo --version
  ```
- [ ] snarkOS CLI installed (for deployment)
  ```bash
  snarkos --version
  ```
- [ ] Aleo wallet created
- [ ] Testnet account funded (from https://faucet.aleo.org/)
- [ ] Environment variables configured
  - [ ] `.env` file created from `.env.example`
  - [ ] `ADMIN_ADDRESS` set
  - [ ] `NETWORK` set to "testnet"
- [ ] Private key secured (NOT in `.env` if committing)

### Code Review
- [ ] Review all contract changes in `src/main.leo`
- [ ] Verify all 5 domain separation tags are unique
- [ ] Confirm all mappings are declared
- [ ] Check all admin transitions have proper access control
- [ ] Verify signature verification logic
- [ ] Review revocation check implementation
- [ ] Confirm expiry enforcement in all verification transitions

### Documentation Review
- [ ] Read DEPLOYMENT.md
- [ ] Read OPERATIONAL_RUNBOOK.md
- [ ] Read PHASE4.md
- [ ] Understand security model
- [ ] Review incident response procedures

## Build and Test

### Build
- [ ] Clean previous builds
  ```bash
  make clean
  ```
- [ ] Build program
  ```bash
  make build
  ```
- [ ] Verify build artifacts in `build/` directory
- [ ] Check program name is `zkidentity.aleo`

### Environment Check
- [ ] Run environment check
  ```bash
  make check-env
  ```
- [ ] Verify all required variables are set
- [ ] Confirm admin address is correct

## Testnet Deployment

### Deploy Program
- [ ] Review deployment command
  ```bash
  make deploy-testnet
  ```
- [ ] Execute deployment with private key
  ```bash
  snarkos developer deploy zkidentity.aleo \
    --private-key YOUR_PRIVATE_KEY \
    --query https://api.explorer.aleo.org/v1 \
    --broadcast https://api.explorer.aleo.org/v1/testnet/transaction/broadcast \
    --priority-fee 0
  ```
- [ ] Save transaction ID
- [ ] Wait for confirmation (2-5 minutes)
- [ ] Verify deployment
  ```bash
  make verify-deployment
  ```

### Initialize Program
- [ ] Run constructor
  ```bash
  leo run constructor "aleo1your_admin_address"
  ```
- [ ] Verify admin is set
- [ ] Document admin address

## Post-Deployment Setup

### Register First Issuer
- [ ] Choose issuer ID (e.g., 100field)
- [ ] Get issuer public key
- [ ] Register issuer
  ```bash
  leo run register_issuer "100field" "aleo1issuer_address"
  ```
- [ ] Verify issuer is registered
- [ ] Document issuer ID and address

### Register First Schema
- [ ] Define schema (e.g., age credential)
- [ ] Compute schema hash
- [ ] Register schema
  ```bash
  leo run register_schema "1field" "123456789field"
  ```
- [ ] Verify schema is registered
- [ ] Document schema ID and hash

### Set Initial Revocation Root (Optional)
- [ ] Decide if starting with revocation enabled
- [ ] If yes, set empty root
  ```bash
  leo run update_revocation_root "100field" "0field"
  ```
- [ ] Document revocation status

## Testing

### Test Basic Verification
- [ ] Create test credential
- [ ] Test age verification
  ```bash
  leo run verify_age_over_threshold_merkle \
    "{...credential...}" \
    "{...proof...}" \
    "root" \
    "18u64" \
    "secret" \
    "100field" \
    "1000u32" \
    "{...revocation_proof...}"
  ```
- [ ] Verify transaction succeeds
- [ ] Check nullifier is set

### Test Admin Operations
- [ ] Test registering second issuer
- [ ] Test registering second schema
- [ ] Test updating revocation root
- [ ] Verify all operations require admin

### Test Security
- [ ] Try verification with unregistered issuer (should fail)
- [ ] Try verification with unregistered schema (should fail)
- [ ] Try verification with expired credential (should fail)
- [ ] Try double-spending credential (should fail)

## Documentation

### Update Documentation
- [ ] Add deployed program address to CONFIG.md
- [ ] Document registered issuers
- [ ] Document registered schemas
- [ ] Update deployment date in docs

### Create Operational Log
- [ ] Create operations log file
- [ ] Record deployment transaction
- [ ] Record admin initialization
- [ ] Record issuer registrations
- [ ] Record schema registrations

## Security

### Key Management
- [ ] Admin private key stored securely
- [ ] Backup of admin key created
- [ ] Key recovery procedure documented
- [ ] Key rotation schedule set

### Access Control
- [ ] Verify only admin can register issuers
- [ ] Verify only admin can register schemas
- [ ] Verify only admin can update revocation roots
- [ ] Verify only admin can transfer admin rights

### Monitoring Setup
- [ ] Set up monitoring for admin operations
- [ ] Configure alerts for unusual activity
- [ ] Set up logging for all operations
- [ ] Create monitoring dashboard (optional)

## Communication

### Stakeholder Notification
- [ ] Notify team of deployment
- [ ] Share deployed program address
- [ ] Share admin address
- [ ] Share registered issuer IDs
- [ ] Share registered schema IDs

### Developer Communication
- [ ] Update developer documentation
- [ ] Provide integration examples
- [ ] Share API reference
- [ ] Announce deployment in channels

## Mainnet Preparation (When Ready)

### Pre-Mainnet Checklist
- [ ] All testnet testing completed successfully
- [ ] Security audit completed
- [ ] Operational procedures tested
- [ ] Incident response plan in place
- [ ] Monitoring and alerts configured
- [ ] Backup and recovery tested
- [ ] Admin key stored in hardware wallet
- [ ] Sufficient mainnet credits acquired

### Mainnet Deployment
- [ ] Update `.env` to `NETWORK=mainnet`
- [ ] Review all procedures
- [ ] Execute deployment (with confirmation)
  ```bash
  make deploy-mainnet
  ```
- [ ] Follow all post-deployment steps above
- [ ] Announce mainnet deployment

## Post-Deployment Monitoring

### First 24 Hours
- [ ] Monitor all transactions
- [ ] Check for any errors
- [ ] Verify all operations work as expected
- [ ] Respond to any issues immediately

### First Week
- [ ] Daily health checks
- [ ] Monitor issuer registrations
- [ ] Track verification transactions
- [ ] Gather user feedback

### Ongoing
- [ ] Weekly operational reviews
- [ ] Monthly security audits
- [ ] Quarterly key rotation consideration
- [ ] Regular documentation updates

## Troubleshooting Reference

If issues occur, refer to:
- [ ] DEPLOYMENT.md "Troubleshooting" section
- [ ] OPERATIONAL_RUNBOOK.md "Incident Response"
- [ ] GitHub Issues
- [ ] Aleo Discord support

## Sign-Off

Deployment completed by: ___________________________

Date: ___________________________

Verified by: ___________________________

Date: ___________________________

Notes:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

**Keep this checklist for audit trail and future deployments.**
