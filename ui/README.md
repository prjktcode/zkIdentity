# zkIdentity Testing UI

A React + Vite testing interface for the zkIdentity privacy-preserving digital identity verification system.

## Features

- **Phase 1 Tests**: Basic identity verification (age, citizenship)
- **Phase 2 Tests**: Merkle tree verification with nullifiers
- **Phase 3 Tests**: Advanced privacy-preserving proofs (multi-attribute, selective disclosure, aggregated credentials)
- **Merkle Tree Visualization**: Interactive visualization of depth-32 Merkle trees
- **Nullifier Tracker**: Track and manage nullifiers to prevent double-usage

## Getting Started

### Installation

```bash
cd ui
npm install
```

### Development

```bash
npm run dev
```

The UI will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage

### Testing Phase 1 (Basic Verification)

1. Navigate to the "Phase 1: Basic Verification" tab
2. Configure age and citizenship credentials
3. Set the issuer public key and age threshold
4. Click test buttons to generate Leo commands
5. Copy and run commands in your Leo environment

### Testing Phase 2 (Merkle & Nullifiers)

1. Navigate to the "Phase 2: Merkle & Nullifiers" tab
2. Configure credential leaf data (attr_type, attr_value, signatures)
3. Set up Merkle proof (32 siblings, index)
4. Configure nullifier parameters (credential_id, secret)
5. Click test buttons to generate Leo commands
6. Generated nullifiers are tracked in the Nullifier Tracker tab

### Testing Phase 3 (Advanced Proofs)

1. Navigate to the "Phase 3: Advanced Proofs" tab
2. Configure multiple leaves for multi-attribute verification
3. Set up selective disclosure parameters
4. Configure aggregated credentials from different trees
5. Click test buttons to generate Leo commands

### Merkle Tree Visualization

1. Navigate to the "Merkle Tree Viz" tab
2. Configure tree depth (1-5 for visualization)
3. Select active leaf to see proof path
4. Compute root to see tree structure
5. View Poseidon hashing examples with domain separation

### Nullifier Tracking

1. Navigate to the "Nullifier Tracker" tab
2. View all generated nullifiers from Phase 2/3 tests
3. Copy nullifiers to clipboard for use in Leo commands
4. Understand nullifier security properties and use cases

## Architecture

### Components

- `App.tsx`: Main application with tab navigation
- `Phase1Tests.tsx`: Phase 1 basic verification tests
- `Phase2Tests.tsx`: Phase 2 Merkle tree and nullifier tests
- `Phase3Tests.tsx`: Phase 3 advanced privacy-preserving proof tests
- `MerkleTreeVisualization.tsx`: Interactive Merkle tree visualizer
- `NullifierTracker.tsx`: Nullifier management and tracking

### Styling

- `App.css`: Main application styles
- `index.css`: Global styles and reset

## Technology Stack

- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **CSS**: Styling (no external UI libraries for minimal dependencies)

## Development Notes

This is a testing interface designed to help developers understand and test the zkIdentity Leo contract. It generates Leo commands that should be run in the Aleo development environment.

### Important

⚠️ This is a testing interface only. It does not execute Leo contracts directly. Copy the generated commands and run them in your Leo environment.

## License

MIT License - see main project LICENSE file for details
