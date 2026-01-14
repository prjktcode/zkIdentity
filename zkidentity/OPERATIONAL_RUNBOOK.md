# zkIdentity Operational Runbook

This runbook provides operational procedures for managing zkIdentity in production.

## Table of Contents

1. [Daily Operations](#daily-operations)
2. [Issuer Management](#issuer-management)
3. [Schema Management](#schema-management)
4. [Revocation Management](#revocation-management)
5. [Key Rotation](#key-rotation)
6. [Monitoring and Alerts](#monitoring-and-alerts)
7. [Incident Response](#incident-response)
8. [Backup and Recovery](#backup-and-recovery)

## Daily Operations

### Health Checks

Run daily to ensure system is operational:

```bash
# 1. Check program is accessible
curl https://api.explorer.aleo.org/v1/testnet/program/zkidentity.aleo

# 2. Verify admin mapping
leo run --query https://api.explorer.aleo.org/v1 \
  check_admin_status

# 3. Check recent transactions
# Visit: https://explorer.aleo.org/program/zkidentity.aleo
```

### Metrics to Monitor

- Number of registered issuers
- Number of registered schemas
- Number of credentials verified (nullifier count)
- Failed verification attempts
- Admin operations performed

## Issuer Management

### Adding a New Issuer

**When:** A new trusted organization wants to issue credentials.

**Prerequisites:**
- Identity verification of organization
- Secure exchange of issuer public key
- Agreement on credential schemas
- Admin account access

**Procedure:**

1. **Receive issuer information:**
   - Organization name
   - Public key (Aleo address)
   - Requested issuer ID
   - Credential types to issue

2. **Verify issuer identity:**
   - Conduct background check
   - Verify legal entity
   - Review security practices

3. **Select issuer ID:**
   ```python
   # Generate unique issuer ID
   import hashlib
   org_name = "Government ID Authority"
   issuer_id = int(hashlib.sha256(org_name.encode()).hexdigest()[:16], 16)
   print(f"{issuer_id}field")
   ```

4. **Register issuer on-chain:**
   ```bash
   leo run register_issuer \
     "<issuer_id>field" \
     "aleo1<issuer_pubkey>"
   ```

5. **Document registration:**
   - Add to CONFIG.md
   - Update issuer registry spreadsheet
   - Notify issuer of successful registration

6. **Test issuer:**
   - Request test credential
   - Verify signature
   - Confirm credential verifies on-chain

### Updating Issuer Key

**When:** Issuer key is compromised or scheduled rotation.

**Procedure:**

1. **Coordinate with issuer:**
   - Verify identity through secure channel
   - Obtain new public key
   - Set rotation date/time

2. **Update key on-chain:**
   ```bash
   leo run register_issuer \
     "<existing_issuer_id>field" \
     "aleo1<new_issuer_pubkey>"
   ```

3. **Notify stakeholders:**
   - Inform credential holders
   - Update documentation
   - Monitor for verification failures

4. **Revoke old credentials (if necessary):**
   - Update revocation root
   - See [Revocation Management](#revocation-management)

### Removing an Issuer

**Note:** Issuers cannot be deleted, only deprecated by not updating their keys.

**Procedure:**

1. **Deprecate issuer:**
   - Document deprecation in CONFIG.md
   - Stop accepting new registrations
   - Notify credential holders

2. **Revoke all credentials:**
   - Build revocation tree with all credentials
   - Update revocation root
   - See [Revocation Management](#revocation-management)

3. **Monitor:**
   - Watch for verification attempts
   - All should fail due to revocation

## Schema Management

### Adding a New Schema

**When:** New credential type is needed.

**Procedure:**

1. **Define schema:**
   ```json
   {
     "schema_id": 4,
     "name": "Professional License",
     "version": "1.0",
     "attributes": {
       "license_type": "u64",
       "license_number": "u64",
       "issue_date": "u32",
       "expiry_date": "u32"
     },
     "policy": {
       "revocable": true,
       "transferable": false,
       "max_verifications": null
     }
   }
   ```

2. **Compute schema hash:**
   ```python
   import json
   import hashlib
   
   schema = {
       "schema_id": 4,
       "name": "Professional License",
       # ... full schema
   }
   
   schema_json = json.dumps(schema, sort_keys=True)
   schema_hash = int(hashlib.sha256(schema_json.encode()).hexdigest()[:16], 16)
   print(f"{schema_hash}field")
   ```

3. **Register schema:**
   ```bash
   leo run register_schema \
     "4field" \
     "<schema_hash>field"
   ```

4. **Document:**
   - Add to CONFIG.md
   - Update schema registry
   - Publish to developers

5. **Test:**
   - Create test credential
   - Verify against schema
   - Confirm on-chain verification

### Updating a Schema

**Note:** Schemas cannot be modified. Create new schema version.

**Procedure:**

1. **Create new schema version:**
   ```json
   {
     "schema_id": 5,  // New ID
     "name": "Professional License",
     "version": "2.0",  // Incremented version
     // ... updated attributes
   }
   ```

2. **Register new schema (as above)**

3. **Deprecate old schema:**
   - Document deprecation
   - Set sunset date
   - Migrate credentials

## Revocation Management

### Understanding Revocation

Credentials are revoked by including their `credential_id` in a Merkle tree and updating the issuer's revocation root.

### Revoking a Single Credential

**When:** Credential is compromised, expired, or invalidated.

**Procedure:**

1. **Identify credential:**
   - Get `credential_id` from issuer
   - Verify revocation authority

2. **Get current revocation tree:**
   ```bash
   # Query current revocation root
   curl https://api.explorer.aleo.org/v1/testnet/program/zkidentity.aleo/mapping/revocation_roots/<issuer_id>
   ```

3. **Add credential to revocation tree:**
   ```python
   # Python pseudocode
   from merkle_tree import MerkleTree
   
   # Load current revocation tree
   revoked_ids = load_revoked_credentials(issuer_id)
   
   # Add new revocation
   revoked_ids.append(credential_id)
   
   # Build tree
   tree = MerkleTree(revoked_ids, depth=32)
   new_root = tree.root()
   ```

4. **Update revocation root:**
   ```bash
   leo run update_revocation_root \
     "<issuer_id>field" \
     "<new_revocation_root>field"
   ```

5. **Store revocation tree:**
   - Save tree structure
   - Index by issuer_id
   - Enable proof generation

6. **Notify:**
   - Inform credential holder (if appropriate)
   - Log revocation
   - Update monitoring

### Batch Revocation

**When:** Multiple credentials need revocation (e.g., issuer key compromised).

**Procedure:**

1. **Collect credential IDs:**
   - Get list from issuer
   - Verify authority for batch revocation

2. **Build revocation tree:**
   ```python
   # All credentials to revoke
   credentials_to_revoke = [
       "cred_id_1",
       "cred_id_2",
       # ... thousands of IDs
   ]
   
   # Build Merkle tree
   tree = MerkleTree(credentials_to_revoke, depth=32)
   new_root = tree.root()
   ```

3. **Update revocation root (as above)**

4. **Verify:**
   - Test that revoked credentials fail verification
   - Test that non-revoked credentials still work

### Generating Revocation Proofs

Credential holders need revocation proofs to verify their credentials.

**Procedure:**

1. **Request from user:**
   - User provides `credential_id`
   - Verify user owns credential

2. **Generate proof:**
   ```python
   # Load revocation tree
   tree = load_revocation_tree(issuer_id)
   
   # Generate non-membership proof
   # This requires showing a zero/empty leaf at the expected position
   proof = tree.generate_non_membership_proof(credential_id)
   
   return {
       "siblings": proof.siblings,
       "index": proof.index
   }
   ```

3. **Provide to user:**
   - Return proof
   - User includes in verification

### Revocation Tree Maintenance

**Daily tasks:**
- Backup revocation trees
- Monitor tree size
- Plan for tree rotation (if approaching 2^32 leaves)

**Weekly tasks:**
- Audit revocation logs
- Verify tree consistency
- Test proof generation

## Key Rotation

### Admin Key Rotation

**When:** Annually or if key compromised.

**Procedure:**

1. **Generate new key pair:**
   ```bash
   leo account new
   ```

2. **Transfer admin rights:**
   ```bash
   # From current admin account
   leo run update_admin \
     "aleo1<new_admin_address>"
   ```

3. **Verify:**
   ```bash
   # Test admin operation with new key
   leo run register_issuer \
     "999field" \
     "aleo1test_address"
   ```

4. **Secure old key:**
   - Archive securely
   - Do not destroy (for audit trail)
   - Restrict access

5. **Update documentation:**
   - Record rotation in audit log
   - Update emergency procedures
   - Notify team

### Issuer Key Rotation

See [Updating Issuer Key](#updating-issuer-key) above.

## Monitoring and Alerts

### Metrics to Track

1. **Usage Metrics:**
   - Verifications per day
   - Unique nullifiers used
   - Active issuers
   - Active schemas

2. **Security Metrics:**
   - Failed verification attempts
   - Revocations per day
   - Admin operations
   - Unknown issuers attempting registration

3. **Performance Metrics:**
   - Transaction confirmation time
   - Gas costs
   - Error rates

### Alert Conditions

Set up alerts for:

1. **Unauthorized admin operations**
   ```
   Alert: Admin operation from unexpected address
   Action: Investigate immediately
   ```

2. **Unusual revocation patterns**
   ```
   Alert: >100 revocations in 24h
   Action: Verify with issuer
   ```

3. **Failed verifications spike**
   ```
   Alert: Failed verifications >10% of total
   Action: Check issuer registrations and schemas
   ```

4. **New issuer registrations**
   ```
   Alert: New issuer registered
   Action: Verify authorization
   ```

### Monitoring Tools

Recommended setup:
- **Aleo Explorer:** Manual checks
- **Custom scripts:** Automated monitoring
- **Logging:** All operations logged
- **Dashboard:** Real-time metrics

## Incident Response

### Scenario: Admin Key Compromised

**Severity:** CRITICAL

**Immediate actions:**
1. Assess scope of compromise
2. If possible, rotate admin key immediately
3. Audit all recent admin operations
4. Notify stakeholders

**Recovery:**
1. Deploy new instance if necessary
2. Migrate legitimate issuers/schemas
3. Revoke all credentials from compromised period (if necessary)
4. Conduct security review

### Scenario: Issuer Key Compromised

**Severity:** HIGH

**Immediate actions:**
1. Revoke issuer's key by updating to zero address (register_issuer with 0address)
2. Add all credentials from that issuer to revocation tree
3. Notify credential holders
4. Coordinate new key with issuer

**Recovery:**
1. Issuer generates new key pair
2. Register new issuer key
3. Re-issue credentials
4. Update documentation

### Scenario: Schema Compromise

**Severity:** MEDIUM

**Immediate actions:**
1. Create new schema version
2. Deprecate old schema
3. Notify developers
4. Plan credential migration

**Recovery:**
1. Migrate to new schema
2. Update applications
3. Sunset old schema after grace period

## Backup and Recovery

### What to Backup

**Critical data:**
- Admin private key (offline, encrypted)
- Issuer registry (on-chain, but document locally)
- Schema registry (on-chain, but document locally)
- Revocation trees (off-chain storage)
- Nullifier database (on-chain, but index locally)
- Configuration files

**Backup schedule:**
- Real-time: Revocation trees
- Daily: Registry snapshots
- Weekly: Full system backup
- Monthly: Archive backup

### Backup Procedure

```bash
# 1. Export on-chain state
curl https://api.explorer.aleo.org/v1/testnet/program/zkidentity.aleo > backup_$(date +%Y%m%d).json

# 2. Backup revocation trees
tar -czf revocation_trees_$(date +%Y%m%d).tar.gz /path/to/trees/

# 3. Backup configuration
tar -czf config_$(date +%Y%m%d).tar.gz CONFIG.md .env

# 4. Store securely
aws s3 cp backup_*.* s3://zkidentity-backups/
```

### Recovery Procedure

**If program is lost:**
1. Redeploy from source
2. Restore admin via constructor
3. Re-register all issuers
4. Re-register all schemas
5. Restore revocation trees
6. Test thoroughly

**If data is corrupted:**
1. Identify corruption scope
2. Restore from most recent backup
3. Replay transactions if necessary
4. Verify integrity

## Change Management

### Making Changes to Production

1. **Test on testnet first**
2. **Document change in CHANGELOG.md**
3. **Get approval from stakeholders**
4. **Schedule maintenance window (if necessary)**
5. **Execute change**
6. **Monitor for issues**
7. **Document outcome**

### Version Control

- All configuration in git
- Tag releases: v1.0.0, v1.1.0, etc.
- Document breaking changes
- Maintain compatibility matrix

## Compliance and Audit

### Audit Log

Maintain log of:
- All admin operations
- All issuer registrations
- All schema registrations
- All revocations
- All key rotations

### Compliance Checks

**Monthly:**
- Review audit log
- Verify issuer registrations
- Check revocation process
- Test recovery procedures

**Quarterly:**
- Security audit
- Compliance review
- Update documentation
- Stakeholder review

**Annually:**
- Full security audit (external)
- Key rotation
- Disaster recovery test
- Policy review

## Contact Information

**⚠️ TEMPLATE - Update with actual contact information before deployment**

**Admin Team:**
- Primary: [TODO: Set admin email]
- Secondary: [TODO: Set backup admin email]

**Escalation:**
- On-call: [TODO: Set on-call phone/contact]
- Emergency: [TODO: Set emergency contact]

**External:**
- Aleo Support: https://discord.gg/aleo
- Security Issues: security@aleo.org
