---
layout: problem
title: "Electronic Structure of Hydrogen Rings"
summary: "Benchmarking the ground-state electronic energies of an eight-atom hydrogen ring in the cc-pVDZ basis across weakly to strongly correlated regimes, testing the accuracy and scalability of classical, quantum, and hybrid electronic-structure methods."
published: true
submitted_by: "Eric D. Switzer"
si_use: "Yes"

physical_model_classes:

  physical_system_model_type:
    - "Molecular"
    - "Atomistic"

  dimensionality_geometry:
    - "1D"
    - "Graph"
    - "Finite cluster"

  degrees_of_freedom:
    - "Fermionic"

  interactions:
    - "Long-range"
    - "Many-body"
    - "Strongly correlated"

  symmetry_constraints:
    - "Discrete"
    - "Continuous"
    - "Conservation laws"

  phases_physical_regimes:
    - "Electronic"

  composition_constituents:
    - "Inorganic"

property_classes:

  physical_observable:
    - "Energy/spectrum"

  time_dependence:
    - "Static"

  spatial_dependence:
    - "Global"

  physical_state:
    - "Ground"

  property_representation:
    - "Scalar"

  scale_limiting_behavior:
    - "Finite-system"

problem_specification:
  hamiltonian_or_action: "Nonrelativistic molecular electronic Hamiltonian under the Born-Oppenheimer approximation"
  system_size: "H8 ring: 8 electrons, 40 spatial orbitals and 80 spin-orbitals in the cc-pVDZ basis"
  model_parameters:
    molecule: "H8"
    basis_set: "cc-pVDZ"
    electron_count: 8
    nuclear_charge: 1
    ring_radii_angstrom: [1.3, 1.8, 2.2]
    nearest_neighbor_distances_angstrom: [0.995, 1.3777, 1.6838]
    active_space_full: "8e, 40o"
  boundary_conditions: "Finite isolated molecular ring"
  initial_conditions: "Not applicable; ground-state electronic structure"
  target_observable: "Ground-state total molecular energy as a function of hydrogen-ring radius"
  target_accuracy: "Report absolute energy errors relative to established reference calculations; chemical accuracy (~1.6 mHa) is a useful target"
  units: "Energy in Hartree (Ha) or milli-Hartree (mHa); distances in Angstrom"
---

## Scientific Question

Accurately calculating the electronic structure of molecular systems is a fundamental challenge in quantum chemistry and materials science. Electronic correlations become increasingly important as molecular bonds are stretched, leading to significant computational demands for accurate many-body calculations.

This benchmark investigates the **ground-state electronic energy of an eight-atom hydrogen ring**, using the correlation-consistent polarized valence double-zeta (cc-pVDZ) basis set. By varying the ring radius, the system transitions from a relatively weakly correlated regime to increasingly strongly correlated configurations.

* **Physical Problem:** Determine the ground-state electronic energy of an eight-atom hydrogen ring governed by the molecular electronic Hamiltonian.
* **Scientific Objective:** Evaluate how accurately computational methods reproduce ground-state energies as electronic correlations become stronger with increasing interatomic separation.
* **Physical Significance:** Understand the accuracy and computational scaling of electronic-structure methods in regimes where conventional approximations become increasingly difficult.
* **Target Regime:** Finite molecular systems with eight electrons and a sufficiently large orbital basis to challenge classical exact eigensolvers and near-term quantum algorithms.

The central challenge is to calculate reliable molecular ground-state energies while controlling the computational cost associated with the large electronic Hilbert space and increasing multireference character.

The benchmark supports comparisons between classical electronic-structure methods, quantum computational methods, and hybrid quantum-classical approaches.

**Primary Reference:**

> **Towards utility-scale electronic structure with sample-based quantum bootstrap embedding.** Joel Bierman and Yuan Liu, *Digital Discovery* **5**, 945–956 (2026). [DOI](https://doi.org/10.1039/D5DD00416K)

---

## Physical Model Definition

### Molecular Electronic Hamiltonian

The system is described by the nonrelativistic molecular electronic Hamiltonian under the Born-Oppenheimer approximation.

In atomic units,

$$
\hat{H}
=
-\frac{1}{2}\sum_{i=1}^{N_e}\nabla_i^2
-
\sum_{i=1}^{N_e}\sum_{A=1}^{N_n}
\frac{Z_A}{\lvert\mathbf{r}_i-\mathbf{R}_A\rvert}
+
\sum_{i<j}^{N_e}
\frac{1}{\lvert\mathbf{r}_i-\mathbf{r}_j\rvert}
+
E_{\mathrm{nuc}},
$$

where:

* $$N_e$$ is the number of electrons.
* $$N_n$$ is the number of atomic nuclei.
* $$\mathbf{r}_i$$ denotes the position of electron $$i$$.
* $$\mathbf{R}_A$$ denotes the position of nucleus $$A$$.
* $$Z_A$$ is the charge of nucleus $$A$$.
* $$E_{\mathrm{nuc}}$$ is the nuclear repulsion energy.

The nuclear repulsion energy is

$$
E_{\mathrm{nuc}}
=
\sum_{A<B}^{N_n}
\frac{Z_AZ_B}
{\lvert\mathbf{R}_A-\mathbf{R}_B\rvert}.
$$

For the hydrogen ring,

$$
N_e=N_n=8,\qquad Z_A=1.
$$

The ground-state energy is obtained from

$$
\hat{H}\lvert\Psi_0\rangle
=
E_0\lvert\Psi_0\rangle,
$$

where $$\lvert\Psi_0\rangle$$ is the normalized electronic ground state and $$E_0$$ includes the nuclear repulsion contribution.

The electronic Hamiltonian can alternatively be expressed in second quantization,

$$
\hat{H}
=
\sum_{pq}h_{pq}a_p^\dagger a_q
+
\frac{1}{2}
\sum_{pqrs}
g_{pqrs}
a_p^\dagger a_q^\dagger a_s a_r
+
E_{\mathrm{nuc}},
$$

where $$h_{pq}$$ and $$g_{pqrs}$$ represent the one-electron and two-electron integrals in an orthonormal spin-orbital basis, using the corresponding integral convention.

This formulation provides a common mathematical starting point for classical electronic-structure calculations, fermion-to-qubit mappings, quantum eigensolvers, and embedding approaches.

### Degrees of Freedom

The molecular system consists of eight interacting electrons distributed among molecular orbitals constructed from the cc-pVDZ Gaussian basis.

The full basis contains:

* **Electrons:** 8
* **Spatial orbitals:** 40
* **Spin-orbitals:** 80
* **Full active space:** (8e, 40o)

The dimension of the complete eight-electron determinant space, before spin or spatial symmetry reductions, is

$$
D_{\mathrm{FCI}}
=
\binom{80}{8}.
$$

The combinatorial growth of this space illustrates why brute-force full configuration interaction becomes computationally demanding.

### Dimensionality and Geometry

The molecule consists of eight equally spaced hydrogen atoms arranged on a planar ring.

Although the electrons interact through three-dimensional Coulomb interactions, the nuclear geometry has one-dimensional cyclic connectivity.

The system is therefore classified as a finite molecular cluster with a one-dimensional ring graph.

The published benchmark evaluates three ring radii:

| Ring Radius (Å) | Nearest-Neighbor H–H Distance (Å) | Electronic Regime |
| --- | ---: | --- |
| 1.3 | 0.9950 | Near-equilibrium, relatively weak correlation |
| 1.8 | 1.3777 | Moderately stretched, increasing correlation |
| 2.2 | 1.6838 | Strongly stretched, enhanced multireference character |

For an eight-atom regular ring, the nearest-neighbor separation is

$$
d_{\mathrm{H-H}}
=
2r\sin\left(\frac{\pi}{8}\right),
$$

where $$r$$ is the ring radius.

Varying the radius changes the orbital overlap and relative importance of electronic interactions, providing a controlled way to explore different correlation regimes without changing the number of atoms.

### Interactions

The molecular Hamiltonian includes:

* Electron kinetic energy.
* Electron-nucleus Coulomb attraction.
* Electron-electron Coulomb repulsion.
* Nuclear-nuclear Coulomb repulsion.

The long-range Coulomb interaction introduces electronic correlations that become increasingly important as the hydrogen atoms are separated.

At stretched geometries, multiple electronic configurations can make significant contributions to the ground state, reducing the accuracy of simple single-reference approximations.

### Symmetries and Physical Regimes

The nonrelativistic electronic Hamiltonian conserves total electron number and, in the absence of spin-dependent interactions, total spin.

The idealized regular molecular ring also possesses discrete spatial symmetries.

The benchmark investigates electronic ground-state properties across a range of correlation strengths rather than a bulk thermodynamic phase transition.

The principal regimes are:

* **Near-equilibrium:** Electronic configurations remain relatively compact, and single-reference approximations are generally more effective.
* **Intermediate correlation:** Multiple configurations contribute significantly to the ground state.
* **Strong correlation:** Near-degenerate configurations and enhanced multireference character increase the computational difficulty of accurately determining the ground-state energy.

---

## Target Property

The primary target property is the **ground-state total molecular energy as a function of ring radius**.

### Ground-State Energy

For each molecular geometry, the desired quantity is

$$
E_0(r)
=
\min_{\lvert\Psi\rangle}
\frac{
\langle\Psi\rvert\hat{H}(r)\lvert\Psi\rangle
}{
\langle\Psi\vert\Psi\rangle
},
$$

where $$r$$ denotes the ring radius and the minimization is performed over the allowed electronic states in the specified finite basis.

The benchmark evaluates the energy at the three specified geometries.

### Energy Accuracy

The primary accuracy metric is the absolute deviation from an established reference energy,

$$
\Delta E(r)
=
\lvert E_{\mathrm{method}}(r)-E_{\mathrm{ref}}(r)\rvert.
$$

Here:

* $$E_{\mathrm{method}}(r)$$ is the energy produced by a computational method.
* $$E_{\mathrm{ref}}(r)$$ is the chosen reference energy.
* $$\Delta E(r)$$ measures the absolute energy error.

Results should be reported in Hartree or milli-Hartree, with

$$
1\ \mathrm{mHa}=10^{-3}\ \mathrm{Ha}.
$$

A commonly used chemical-accuracy target is approximately 1.6 mHa for a total molecular energy difference. This is a useful target rather than an accuracy level already demonstrated by every solution.

For comparisons that report errors per atom,

$$
\Delta E_{\mathrm{atom}}
=
\frac{\Delta E}{N_n}.
$$

Total molecular energy errors and per-atom errors should be distinguished explicitly.

### Correlation Regime Dependence

An important objective is to determine how the accuracy of each method changes as the molecular bonds are stretched.

As the correlation strength increases, approximate wavefunctions may require a larger number of Slater determinants, tensor-network states with larger bond dimensions, or more expressive quantum-state preparation.

The benchmark therefore measures both the quality of the calculated energy and the ability of methods to maintain accuracy across the different molecular geometries.

### Additional Properties

Although ground-state energy is the primary benchmark target, supplementary quantities may include:

* One-particle reduced density matrices.
* Orbital occupations.
* Fragment correlation energies.
* Density-matching residuals in embedding methods.
* Energy convergence versus wavefunction subspace size.
* Energy differences between molecular geometries.

These supplementary properties are useful for diagnosing approximation errors and understanding the performance of embedding-based solutions.

---

## Problem Parameters and Conditions

### System Size and Basis

The benchmark evaluates an eight-atom hydrogen ring using the cc-pVDZ basis.

The complete electronic problem comprises eight electrons distributed among 40 spatial orbitals.

The basis size and electron count should be held fixed when comparing energies across methods.

Approaches that use orbital truncation, embedding, or reduced active spaces should clearly identify the approximations introduced.

### Molecular Geometry

Three ring radii are considered:

$$
r\in\{1.3,\ 1.8,\ 2.2\}\ \mathrm{\mathring{A}}.
$$

These correspond to near-equilibrium, moderately stretched, and strongly stretched configurations.

All eight atoms are equally spaced around the ring.

### Electronic State

The target is the lowest-energy electronic state of the neutral molecule within the specified Hamiltonian and basis.

Methods should preserve the required electron number and appropriately treat the relevant spin sector.

### Boundary Conditions

The system is an isolated, finite molecule without periodic boundary conditions in physical space.

The nuclear positions form a closed ring, but this molecular topology should not be confused with imposing periodic boundary conditions on an extended electronic lattice.

### Target Accuracy

The benchmark should support comparisons across multiple accuracy levels, including chemical accuracy where feasible.

Each solution should report:

* Total ground-state energy.
* Absolute error relative to the specified reference.
* Statistical uncertainty, if applicable.
* Convergence with respect to numerical or variational parameters.
* Dependence of accuracy on the molecular geometry.

---

## Computational Challenges

### Exponential Growth of Configuration Space

The number of electronic configurations increases combinatorially with the number of orbitals and electrons.

Full configuration interaction is exact within the chosen finite basis, up to numerical error, but becomes prohibitively expensive as the determinant space grows.

This motivates approximate classical methods, selected configuration interaction, tensor networks, and hybrid quantum-classical approaches.

### Increasing Strong Correlation

As the hydrogen ring is stretched, the electronic ground state develops stronger multireference character.

A larger number of Slater determinants can become important, reducing the effectiveness of methods that rely on compact representations of the wavefunction.

Methods must balance the size of the retained electronic subspace against the accuracy of the calculated energy.

### Orbital Basis and Active-Space Truncation

The full cc-pVDZ basis introduces more spatial orbitals than minimal-basis treatments of the same molecular system.

Reducing the active space can lower computational cost but also introduce errors by excluding electronically relevant configurations.

A fair benchmark must distinguish the error from the eigensolver itself from errors introduced by active-space truncation or embedding.

### Fragmentation and Embedding Accuracy

Embedding approaches divide the molecular system into smaller overlapping subsystems.

Their accuracy depends on the choice of fragments, treatment of the surrounding environment, orbital localization, and consistency of reduced density matrices between overlapping regions.

As the molecule becomes more strongly correlated, enforcing the necessary consistency conditions can become increasingly difficult.

### Quantum Hardware Noise and Sampling

Quantum algorithms can use quantum devices to generate information about the electronic wavefunction.

However, finite measurement statistics and hardware noise may corrupt sampled electronic configurations and reduce the efficiency of downstream classical calculations.

Relevant challenges include:

* Accurate preparation of correlated quantum states.
* Correct particle-number and spin-sector sampling.
* Sufficient sampling of important configurations.
* Control of circuit-depth and gate errors.
* Efficient classical recovery and diagonalization.
* Accounting for the total cost of repeated quantum-classical iterations.

### Computational Scaling

A central goal is to determine how the cost of obtaining a specified energy accuracy scales with molecular size, orbital count, and correlation strength.

This includes both classical memory and runtime requirements and the quantum resources needed for state preparation, sampling, and measurement.

---

## Accuracy and Validation Criteria

The benchmark should evaluate whether solutions recover reliable ground-state energies across the three molecular geometries.

### Reference Energies

The primary publication uses DMRG calculations in the full (8e, 40o) active space as reference values for assessing embedding accuracy.

The reported energies are:

| Ring Radius (Å) | DMRG Reference Energy (Ha) |
| --- | ---: |
| 1.3 | -4.38533 |
| 1.8 | -4.30252 |
| 2.2 | -4.17430 |

These are established high-accuracy numerical reference results, not mathematically exact full-CI energies.

For comparisons restricted to the (8e, 30o) active space, the publication also provides CASCI reference energies:

| Ring Radius (Å) | CASCI (8e, 30o) Energy (Ha) |
| --- | ---: |
| 1.3 | -4.37710 |
| 1.8 | -4.29319 |
| 2.2 | -4.16879 |

Because the two reference calculations use different orbital spaces, their energies should not be treated as interchangeable.

The full-basis DMRG calculations provide the more appropriate common reference when comparing overall accuracy for the specified cc-pVDZ molecular benchmark.

### Validation Criteria

A successful solution should satisfy the following:

* **Energy Accuracy:** Reproduce the reference ground-state energies within explicitly reported error tolerances.
* **Correlation Dependence:** Maintain and characterize accuracy across all three ring geometries.
* **Particle Number:** Preserve the correct electron number.
* **Spin Symmetry:** Respect the physical spin sector or quantify symmetry-related errors.
* **Convergence:** Demonstrate convergence with relevant approximation parameters.
* **Uncertainty:** Report statistical and systematic uncertainties, particularly for quantum sampling methods.
* **Consistency:** Distinguish orbital truncation, embedding, numerical, sampling, and hardware-induced errors.

For embedding approaches, additional validation should examine convergence of the fragment density-matching conditions.

The one-particle reduced density matrix is

$$
\gamma_{pq}
=
\langle\Psi\rvert a_p^\dagger a_q\lvert\Psi\rangle.
$$

Consistency of overlapping fragment density matrices provides an important diagnostic of embedding convergence, although density matching alone does not guarantee an exact global energy.

---

## Comparative Solutions and Performance

The primary study investigates sample-based quantum bootstrap embedding and compares it with several classical and quantum-assisted electronic-structure methods.

These represent distinct approaches to the same molecular ground-state energy problem and should ultimately be documented as separate entries in the Solutions Catalog.

### Representative Solution Methods

| Solution | Computational Paradigm | Method | Primary Limitation |
| --- | --- | --- | --- |
| Full Configuration Interaction | Classical computational | Exact diagonalization | Combinatorial growth of determinant space |
| DMRG | Classical computational | Tensor-network optimization | Bond-dimension requirements and convergence |
| SHCI | Classical computational | Selected configuration interaction | Selection thresholds and retained determinant space |
| Bootstrap Embedding with FCI | Classical computational | Fragmentation and FCI eigensolvers | Fragment size and embedding convergence |
| Sample-Based Quantum Diagonalization | Hybrid quantum-classical | Quantum sampling and classical subspace diagonalization | Sampling noise, subspace completeness, and circuit resources |
| Quantum Bootstrap Embedding with SQD | Hybrid quantum-classical | Quantum-assisted fragment diagonalization | Embedding convergence, sampling, and repeated quantum-classical execution |

### Classical Computational Approaches

The classical methods considered in the reference include:

* **DMRG:** Represents the electronic wavefunction as a matrix product state and optimizes its energy using tensor-network techniques.
* **SHCI:** Selects important electronic configurations to construct a compact approximation to the ground-state wavefunction.
* **BE-FCI:** Fragments the molecular system into overlapping embedded subsystems and solves their electronic ground states using FCI.

These approaches provide important references for evaluating accuracy and computational efficiency.

In particular, DMRG calculations in the full (8e, 40o) space serve as the primary energy reference in the embedding study.

### Quantum and Hybrid Computational Approaches

The published QBE-SQD method combines bootstrap embedding with sample-based quantum diagonalization.

The molecular system is partitioned into overlapping fragments, with effective embedded Hamiltonians constructed using bath orbitals derived from a mean-field state.

Each fragment is solved using a hybrid procedure:

1. A quantum circuit prepares an approximate correlated electronic state using a two-layer local-unitary cluster Jastrow (2-LUCJ) ansatz.
2. Quantum measurements generate samples of electronic configurations.
3. Classical configuration recovery and selected-subspace diagonalization estimate the fragment ground state.
4. Fragment reduced density matrices are calculated and used to update embedding potentials.
5. The process is repeated until the embedding convergence criteria are reached.

The study compares QBE-SQD with unfragmented SQD calculations using larger active spaces.

### Quantum Resource Comparison

The published implementation used the IBM `ibm_pittsburgh` Heron r3 quantum processor.

The following representative resources were reported for the 1.3 Å ring-radius geometry:

| Metric | QBE-SQD | SQD |
| --- | ---: | ---: |
| Active space | (8e, 19o) per fragment | (8e, 30o) |
| Physical qubit footprint | 43 | 67 |
| Circuit depth | 505 | 752 |
| Two-qubit gates | 1,638 | 3,876 |
| One-qubit gates | 8,244 | 20,700 |

The qubit footprints include the resources needed to implement the corresponding circuits; they should not be equated directly with the number of spin-orbitals in the active space.

For QBE-SQD, the molecular system is divided into eight overlapping fragments, each containing three neighboring hydrogen atoms.

The corresponding embedded subsystems contain 38 spin-orbitals, equivalent to 19 spatial orbitals.

The reduced fragment size allows the QBE-SQD implementation to use fewer qubits and a smaller circuit volume than the larger unfragmented SQD calculation in this reported setup.

The comparison does not, by itself, establish a reduction in total end-to-end computational cost because embedding requires multiple quantum and classical calculations.

### Reported Accuracy and Limitations

The published study finds that QBE-SQD improves upon unfragmented SQD in several comparisons involving similar numbers of retained Slater determinants and smaller quantum circuit volumes.

For the near-equilibrium geometry, QBE-SQD closely follows the convergence behavior of classical BE-FCI.

Across the geometries studied, embedding energy errors relative to the full-basis reference are reported at approximately 1–2.5 mHa per hydrogen atom.

For more strongly stretched geometries, the convergence of the embedding optimization becomes more challenging, and enforcing all density-matching conditions may be less effective than optimizing only the chemical potential.

The publication also reports that the classical SHCI implementation achieves better energy accuracy than QBE-SQD and SQD across the geometries studied.

These findings demonstrate the utility of quantum-assisted embedding and the importance of comparing against competitive classical algorithms, rather than establishing a general quantum advantage.

### Performance Metrics

For classical computational methods, the relevant metrics include:

* Runtime versus orbital count and system size.
* Peak memory allocation.
* Number of selected Slater determinants.
* Tensor-network bond dimension.
* Accuracy versus active-space size.
* Convergence with respect to truncation parameters.

For quantum and hybrid computational methods, the relevant metrics include:

* Physical qubit count.
* Quantum circuit depth and gate counts.
* Number of measurement shots.
* Number of retained electronic configurations.
* Fragment size and number of fragments.
* Number of embedding iterations.
* Classical configuration-recovery and diagonalization costs.
* End-to-end wall-clock time.
* Accuracy and uncertainty relative to the full-basis reference.

Metrics should be compared at matched accuracy wherever possible.

### Crossing-Point Analysis

Future comparisons should identify parameter regimes in which quantum, classical, or hybrid approaches offer advantages in computational cost at equivalent solution quality.

Relevant studies include:

* Classical runtime versus molecular and active-space size.
* FCI determinant-space growth versus fragment size.
* DMRG bond-dimension requirements versus correlation strength.
* Selected-CI accuracy versus determinant count.
* Quantum circuit resources versus active-space size.
* Embedding convergence versus molecular geometry.
* End-to-end hybrid runtime versus target energy accuracy.

Crossing-point analysis should include the cost of quantum sampling, classical diagonalization, embedding optimization, data transfer, and other computational overheads.

Where scaling predictions extend beyond demonstrated results, they should be clearly identified as extrapolations.

---

## Primary References

* **Towards utility-scale electronic structure with sample-based quantum bootstrap embedding.** Joel Bierman and Yuan Liu, *Digital Discovery* **5**, 945–956 (2026). [DOI: 10.1039/D5DD00416K](https://doi.org/10.1039/D5DD00416K).

### Supporting Data and Code

* [QBE-SQD experimental data and code repository](https://github.com/JoelHBierman/qbe_sqd_data)
* [Published dataset on Zenodo](https://doi.org/10.5281/zenodo.18225640)
