# Quantum Encryption and Modern Cryptography

## Fundamentals of Encryption

### Classical Cryptography

**Symmetric Encryption**:
- AES-256: Current gold standard
- Key size: 256 bits (2^256 possible keys)
- Block cipher: Operates on 128-bit blocks
- Computationally secure against classical computers

**Asymmetric Encryption**:
- RSA: Based on factoring large prime numbers
- ECC (Elliptic Curve Cryptography): Based on discrete logarithm problem
- Key exchange: Diffie-Hellman protocol
- Digital signatures: Verify message authenticity

**Hash Functions**:
- SHA-256, SHA-3
- One-way functions: Easy to compute, hard to reverse
- Collision resistance
- Used for message integrity

## Quantum Mechanics Principles

### Superposition

- Quantum bits (qubits) exist in multiple states simultaneously
- Collapse upon measurement
- Represented by: |ψ⟩ = α|0⟩ + β|1⟩ where |α|² + |β|² = 1

### Entanglement

- Einstein's "spooky action at a distance"
- Two particles correlated regardless of separation
- Measurement of one instantly affects the other
- Bell states: Maximally entangled pairs

### No-Cloning Theorem

- Impossible to create identical copy of unknown quantum state
- Foundation of quantum cryptography security
- Any attempt to intercept destroys original information

### Uncertainty Principle

- Cannot simultaneously measure position and momentum precisely
- Δx · Δp ≥ ℏ/2
- Measuring one property disturbs the other
- Detection of eavesdropping is built into physics

## Quantum Key Distribution (QKD)

### BB84 Protocol

Developed by Bennett and Brassard (1984):

1. **Encoding**: Alice sends qubits in random bases (rectilinear or diagonal)
2. **Measurement**: Bob measures in random bases
3. **Basis reconciliation**: Public announcement of bases used
4. **Key sifting**: Keep bits where bases matched
5. **Error checking**: Detect eavesdropping by comparing subset
6. **Privacy amplification**: Reduce Eve's information to negligible

**Security**: Eavesdropper (Eve) introduces detectable errors due to quantum measurement disturbance

### E91 Protocol

Based on entanglement:
- Uses EPR pairs (entangled photon pairs)
- Bell inequality violations confirm security
- No need to trust source of photons
- Detects any classical or quantum eavesdropping

## Quantum Cryptography Properties

### Unconditional Security

- Based on laws of physics, not computational hardness
- Future computers cannot break it
- Information-theoretic security

### Eavesdropping Detection

- Any measurement disturbs quantum state
- Error rates reveal presence of interceptor
- Legitimate parties abort if threshold exceeded

### Distance Limitations

- Photon loss in fiber: ~0.2 dB/km at 1550nm
- Practical range: ~100 km direct fiber
- Quantum repeaters needed for longer distances
- Satellite-based QKD extends to 1000+ km

## Post-Quantum Cryptography

Classical algorithms resistant to quantum computers:

### Lattice-Based Cryptography

- NTRU, Ring-LWE
- Based on hardness of lattice problems
- Resistant to Shor's algorithm
- Efficient implementation possible

### Code-Based Cryptography

- McEliece cryptosystem
- Based on error-correcting codes
- Large key sizes (hundreds of KB)
- Decades of cryptanalysis without breaks

### Hash-Based Signatures

- Lamport signatures, SPHINCS+
- Security relies only on hash function properties
- One-time signature schemes
- Quantum-resistant by design

### Multivariate Cryptography

- Systems of multivariate polynomial equations
- Solving is NP-hard
- Compact signatures
- Some schemes broken, active research area

## Quantum Computing Threats

### Shor's Algorithm

- Factors large numbers in polynomial time
- Breaks RSA, ECC, Diffie-Hellman
- Requires large-scale quantum computer (1000+ logical qubits)
- Current quantum computers too small and noisy

### Grover's Algorithm

- Quadratic speedup for search problems
- Reduces AES-256 to AES-128 equivalent security
- Affects symmetric cryptography less severely
- Solution: Double key sizes

## Hybrid Approaches

Combining classical and quantum:

- **Quantum-Safe Hybrid**: Use both classical and post-quantum algorithms
- **Graceful degradation**: If one system breaks, security remains
- **Transition strategy**: Migrate to quantum-resistant systems

## Steganography and Information Hiding

### Classical Steganography

- Hide message existence, not just content
- Digital images, audio, text
- Least significant bit (LSB) encoding
- Detection: Statistical analysis, visual inspection

### Quantum Steganography

- Hide information in quantum channels
- Undetectable if done correctly
- Combine with QKD for complete security

### Biological Encoding

- DNA as data storage: 5 exabytes per gram
- Protein folding patterns
- Bacterial plasmids for long-term storage
- Ultra-high density, extreme longevity

## Information-Theoretic Security

### Shannon Entropy

- Measure of uncertainty/information content
- H(X) = -Σ p(x) log₂ p(x)
- Maximum entropy: Uniform random distribution
- Minimum entropy: Deterministic

### Perfect Secrecy

- One-time pad: Only provably secure classical encryption
- Key must be: (1) truly random, (2) as long as message, (3) used only once
- Ciphertext reveals zero information about plaintext

### Unconditional vs Computational Security

- Unconditional: Secure regardless of adversary's resources (quantum crypto, OTP)
- Computational: Secure if adversary has limited computing power (RSA, AES)

## Error Correction and Privacy Amplification

### Error Correction

- Cascade protocol
- LDPC (Low-Density Parity-Check) codes
- Turbo codes
- Reveal minimal information during correction

### Privacy Amplification

- Universal hashing
- Reduce eavesdropper's knowledge to arbitrarily small amount
- Two-universal hash families
- Extract shorter but secure key from partially compromised data

## Practical Implementations

### Hardware Requirements

- Single-photon sources and detectors
- Beam splitters and phase modulators
- Synchronized clocks (picosecond precision)
- Low-loss optical components
- Quantum random number generators

### Environmental Challenges

- Temperature stability
- Vibration isolation
- Electromagnetic interference
- Photon loss and noise
- Dark counts in detectors

### Commercial Systems

- ID Quantique (Switzerland)
- Toshiba QKD systems
- Chinese quantum satellite Micius
- Quantum networks in operation (China, Europe)

## Encoding Information in Physical Systems

### Binary Encoding

- Photon polarization: Horizontal/Vertical or Diagonal
- Spin states: Up/Down
- Energy levels: Ground/Excited
- Phase: 0/π

### Higher-Dimensional Encoding

- Orbital angular momentum: Multiple bits per photon
- Time-bin encoding: Temporal superposition
- Frequency encoding: Multiple wavelengths
- Spatial modes: Transverse patterns

## Long-Term Information Preservation

### Classical Methods

- Stone inscription: Millennia
- Paper: Centuries (with care)
- Magnetic tape: Decades
- Optical media: 50-100 years

### Quantum Information Storage

- Quantum memory: Milliseconds to seconds (current tech)
- Rare-earth ion doping: Minutes to hours
- Nuclear spins: Hours to days
- Room temperature diamond NV centers: Seconds

### Biological Storage

- DNA: Millennia (if preserved)
- Spores: Decades to centuries
- Encoding in genome: Permanent (inherited)
- Synthetic biology: Engineered genetic messages

## Time-Release Cryptography

### Timed Commitments

- Computational time-lock puzzles
- Require specific amount of computation
- Cannot be parallelized
- Release information at predetermined time

### Witness Encryption

- Encrypt to true statement (mathematical theorem)
- Decryption requires proof/witness
- Future knowledge unlocks past messages

### Quantum Time-Lock

- Store quantum states
- Decoherence provides timing mechanism
- Environmental interaction as clock

## Message Authentication

### Classical MACs

- HMAC: Hash-based message authentication
- GMAC: Galois/Counter Mode authentication
- Poly1305: One-time authenticator

### Quantum Authentication

- Quantum digital signatures
- Unconditionally secure authentication
- Based on quantum mechanics, not computational hardness

## Network Topologies for Secret Sharing

### Threshold Schemes

- (k, n) threshold: k parties needed to reconstruct secret
- Shamir's secret sharing: Polynomial interpolation
- Blakley's scheme: Hyperplane intersection

### Distributed Systems

- No single point of failure
- Redundancy and fault tolerance
- Byzantine agreement protocols

## Random Number Generation

### True Randomness

- Quantum mechanical processes (photon detection)
- Radioactive decay
- Atmospheric noise
- Required for cryptographic security

### Pseudorandom Generators

- Deterministic algorithms
- Computationally indistinguishable from random
- Insufficient for one-time pads
- Acceptable for session keys (if properly seeded)

## Paranoia and Security Mindset

### Adversary Models

- Passive eavesdropper: Listens only
- Active attacker: Intercepts and modifies
- Quantum adversary: Has quantum computer
- Global passive adversary: Records all traffic

### Side-Channel Attacks

- Timing attacks
- Power analysis
- Electromagnetic emanations
- Acoustic cryptanalysis
- Even quantum systems vulnerable

### Defense in Depth

- Multiple layers of security
- Assume compromise at any level
- Compartmentalization
- Minimizing trust requirements

## Cryptographic Time Scales

- Key generation: Milliseconds
- Encryption/decryption: Microseconds
- QKD session: Minutes
- Key lifetime: Hours to days (rotated)
- Quantum computer threat: 10-30 years (estimate)
- Information lifespan: Decades to millennia (depending on value)

## Theoretical Limits

- Speed of light: Maximum information transfer rate
- Channel capacity: Shannon-Hartley theorem
- Quantum channel capacity: Holevo bound
- Landauer's principle: Energy cost of information erasure
