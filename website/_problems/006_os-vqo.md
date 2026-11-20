---
layout: problem
title: "Ground-State Electronic Structure and AIMD of Hydrogen Complexes"
summary: "Benchmarking ground-state electronic energies, natural orbital occupations, potential-energy surfaces, and Born-Oppenheimer molecular dynamics, with emphasis on occupation-based quantum algorithms, hydrogen-cluster dissociation, and accurate nuclear-force calculations."
published: false
submitted_by: "Edison Salazar"
contributions_by: "Eric D. Switzer"
si_use: "Yes"

physical_model_classes:
  physical_system_model_type:
    - "Molecular"
    - "Atomistic"
  dimensionality_geometry:
    - "3D"
    - "Finite cluster"
  degrees_of_freedom:
    - "Fermionic"
    - "Classical"
    - "Mixed"
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
    - "Structure/order"
    - "Dynamics"
  time_dependence:
    - "Static"
    - "Transient"
  spatial_dependence:
    - "Local"
    - "Global"
  physical_state:
    - "Ground"
  property_representation:
    - "Scalar"
    - "Tensor"
    - "Distribution"
  scale_limiting_behavior:
    - "Finite-system"
    - "Finite-time"

problem_specification:
  hamiltonian_or_action: "Nonrelativistic molecular electronic Hamiltonian coupled to classical nuclear motion under the Born-Oppenheimer approximation"
  system_size: "H2 molecular dynamics and hydrogen-cluster electronic structure, including cubic H8 and H216 systems"

  model_parameters:
    molecular_systems:
      - name: "Hydrogen molecule"
        formula: "H2"
        atoms: 2
        target: "Ground-state energy, nuclear forces, and AIMD trajectories"
        reference: "Fedorov et al. (2021)"

      - name: "Cubic hydrogen cluster"
        formula: "H8"
        atoms: 8
        geometry: "Cubic hydrogen cluster"
        target: "Ground-state energy and natural occupation numbers"
        reference: "ON-VQE (2026)"

      - name: "Large cubic hydrogen cluster"
        formula: "H216"
        atoms: 216
        geometry: "6 x 6 x 6 simple-cubic hydrogen arrangement"
        electron_pairs: 108
        occupation_spaces: 108
        reported_qubit_encoding: "108 pair-space qubits for m=1"
        target: "Ground-state energy and occupation redistribution along symmetric dissociation"
        reference: "OS-VQO (2026)"

    electronic_structure:
      - "Natural orbital functional theory"
      - "Ground-state electronic energy"
      - "Natural occupation numbers"
      - "Potential-energy surfaces"

    molecular_dynamics:
      - "Born-Oppenheimer approximation"
      - "Classical nuclear propagation"
      - "Electronic ground-state forces"
      - "Trajectory stability"

    correlation_regimes:
      - "Weakly correlated"
      - "Strongly correlated"
      - "Metallic-like"
      - "Mott-insulating-like"

    natural_orbital_functionals:
      - "PNOF7"

    orbital_optimization: "Required or fixed according to the selected electronic-structure protocol"

  boundary_conditions: "Finite molecular systems; electronic boundary conditions and nuclear geometries specified for each calculation"
  initial_conditions: "Electronic ground state at each nuclear geometry; AIMD requires specified initial nuclear coordinates and velocities"
  target_observable: "Ground-state electronic energy, natural occupation numbers, potential-energy surface, nuclear forces, and Born-Oppenheimer molecular trajectories"
  target_accuracy: "Report energy, occupation-number, and force errors against matched references; assess molecular-dynamics energy conservation, trajectory stability, and accumulated uncertainty"
  units: "Hartree (Ha), milli-Hartree (mHa), Angstrom, atomic units of force, and femtoseconds"
---

## Scientific Question

Ab initio molecular dynamics (AIMD) describes the evolution of atomic nuclei using forces derived from an electronic-structure calculation. Within the Born-Oppenheimer approximation, the nuclei move on a potential-energy surface determined by the electronic ground-state energy at each nuclear configuration. The reliability of a molecular trajectory therefore depends not only on the accuracy of the calculated electronic energies but also on the quality of their nuclear-coordinate derivatives. Since the electronic problem must be solved repeatedly as the geometry evolves, molecular dynamics provides a demanding test of both physical accuracy and computational efficiency.

This benchmark investigates the ability of quantum and hybrid quantum-classical methods to determine molecular ground-state energies, reproduce potential-energy surfaces, and provide the nuclear forces required for Born-Oppenheimer molecular dynamics. Particular emphasis is placed on approaches based on natural orbital functional theory (NOFT), which describes electronic energies in terms of natural orbitals and their occupation numbers. Quantum algorithms that obtain these occupations directly from measurements offer an alternative to methods that reconstruct larger sets of electronic observables or evaluate the many-electron Hamiltonian expectation value through extensive Pauli-operator measurements.

The benchmark encompasses three related but distinct computational targets. The first concerns ground-state electronic structure, including total energies and natural occupation numbers. The second concerns the geometry dependence of those energies and the resulting nuclear forces. The third concerns the propagation of nuclear coordinates and velocities under the calculated forces. These targets represent increasing levels of computational complexity: agreement with reference electronic energies at selected geometries does not establish accurate nuclear forces, and accurate forces at isolated configurations do not automatically guarantee stable molecular dynamics.

The representative physical systems are the hydrogen molecule, an eight-atom cubic hydrogen cluster, and a 216-atom cubic hydrogen cluster. They provide complementary benchmarks rather than different sizes of one identical computational task. The hydrogen molecule serves as a reference for quantum-assisted AIMD, while the larger hydrogen clusters probe electronic correlation and occupation redistribution during symmetric dissociation. In the largest system, increasing interatomic separation produces behavior evolving from relatively delocalized electronic states toward a strongly correlated, Mott-insulating-like limit.

Published work has demonstrated VQE-based AIMD for H₂ and occupation-based quantum electronic-structure calculations for hydrogen clusters. However, the proposed extension of occupation-space variational quantum optimization (OS-VQO) to molecular dynamics remains under development. Accordingly, the present benchmark distinguishes demonstrated electronic-structure results from completed molecular-dynamics calculations and from prospective applications that have not yet been validated.

The central scientific question is whether quantum occupation-based representations can reproduce electronic energies and nuclear forces accurately while reducing the resources required for repeated electronic-structure calculations. A meaningful answer requires comparisons with competitive classical methods using consistent Hamiltonians, electronic-structure approximations, convergence criteria, and complete quantum-classical resource accounting.

## Physical Model Definition

### Electronic Hamiltonian and Born-Oppenheimer Approximation

The molecular systems are described by the nonrelativistic many-electron Hamiltonian, with the nuclear positions treated as fixed parameters during each electronic-structure calculation. In atomic units, the Hamiltonian, including the nuclear repulsion energy, is

$$
\hat{H}_e(\mathbf{R})
=
-\frac{1}{2}
\sum_{i=1}^{N_e}\nabla_i^2
-
\sum_{i=1}^{N_e}
\sum_{A=1}^{N_n}
\frac{Z_A}
{\lvert\mathbf{r}_i-\mathbf{R}_A\rvert}
+
\sum_{i<j}^{N_e}
\frac{1}
{\lvert\mathbf{r}_i-\mathbf{r}_j\rvert}
+
E_{\mathrm{nuc}}(\mathbf{R}),
$$

where $$N_e$$ and $$N_n$$ are the numbers of electrons and nuclei, respectively; $$\mathbf{r}_i$$ and $$\mathbf{R}_A$$ are their positions; and $$Z_A$$ is the charge of nucleus $$A$$. The nuclear repulsion contribution is

$$
E_{\mathrm{nuc}}(\mathbf{R})
=
\sum_{A<B}^{N_n}
\frac{Z_AZ_B}
{\lvert\mathbf{R}_A-\mathbf{R}_B\rvert}.
$$

For each nuclear configuration, the stationary electronic states satisfy

$$
\hat{H}_e(\mathbf{R})
\lvert\Psi_n(\mathbf{R})\rangle
=
E_n(\mathbf{R})
\lvert\Psi_n(\mathbf{R})\rangle.
$$

The ground-state energy defines the Born-Oppenheimer potential-energy surface, $$E_{\mathrm{BO}}(\mathbf{R})=E_0(\mathbf{R})$$. This surface determines the forces acting on the nuclei and provides the connection between the electronic and nuclear parts of the problem.

In a finite spin-orbital basis, the same electronic Hamiltonian takes the second-quantized form

$$
\hat{H}_e(\mathbf{R})
=
\sum_{pq}
h_{pq}(\mathbf{R})a_p^\dagger a_q
+
\frac{1}{2}
\sum_{pqrs}
g_{pqrs}(\mathbf{R})
a_p^\dagger a_q^\dagger a_s a_r
+
E_{\mathrm{nuc}}(\mathbf{R}),
$$

where $$a_p^\dagger$$ and $$a_p$$ are fermionic creation and annihilation operators, and $$h_{pq}$$ and $$g_{pqrs}$$ are the one- and two-electron integrals under the specified operator convention. The molecular geometry enters through the electron-nuclear potential, nuclear repulsion, and geometry-dependent orbital representation. This formulation provides a common physical basis for conventional classical electronic-structure methods and quantum eigensolvers.

### Natural Orbital Functional Representation

Natural orbital functional theory provides an alternative description of molecular electronic energies based on the one-particle reduced density matrix. For a normalized many-electron state, the spin-orbital one-particle reduced density matrix is

$$
\gamma_{pq}
=
\langle\Psi\rvert
a_p^\dagger a_q
\lvert\Psi\rangle.
$$

The natural orbitals are its eigenfunctions,

$$
\hat{\gamma}\lvert\phi_p\rangle
=
n_p\lvert\phi_p\rangle,
$$

where $$n_p$$ is the occupation number of natural orbital $$p$$. For spin-orbital occupations, the physical constraints include $$0\leq n_p\leq1$$ and $$\sum_p n_p=N_e$$. Additional restrictions may apply when the electronic structure is represented through electron-pair subspaces or when particular spin symmetries are imposed.

A natural orbital functional expresses the electronic energy schematically as

$$
E_{\mathrm{NOF}}
=
E_{\mathrm{NOF}}
\left(
\{n_p\},
\{\phi_p\};
\mathbf{R}
\right).
$$

The functional depends on the occupation numbers, natural orbitals, and nuclear geometry through the associated molecular integrals. Practical NOFT calculations employ approximate functionals, such as PNOF7, to reconstruct electronic correlation contributions that are not determined by the occupations alone.

In conventional NOFT, the natural orbitals and occupations are optimized classically subject to the relevant physical constraints. Occupation-based quantum methods instead use quantum measurements to obtain occupations or occupation-space probabilities that enter the functional. The distinction concerns the computational representation of the electronic variables, not the definition of the physical target. In both cases, the desired outputs are accurate molecular energies, electronic occupations, and eventually their derivatives with respect to nuclear coordinates.

Agreement between a quantum occupation-based calculation and a classical implementation of the same functional establishes consistency with that functional. It does not, by itself, establish agreement with the exact many-electron ground-state energy, since both calculations may share the same functional approximation error.

### Nuclear Motion and Force Evaluation

In Born-Oppenheimer molecular dynamics, the atomic nuclei are treated as classical particles evolving under forces obtained from the electronic ground-state potential-energy surface. Their equations of motion are

$$
M_A
\frac{d^2\mathbf{R}_A}{dt^2}
=
\mathbf{F}_A(\mathbf{R}),
\qquad
\mathbf{F}_A(\mathbf{R})
=
-\nabla_{\mathbf{R}_A}
E_{\mathrm{BO}}(\mathbf{R}),
$$

where $$M_A$$ is the mass of nucleus $$A$$. An AIMD trajectory consists of the time-dependent nuclear coordinates and velocities, $$\{\mathbf{R}_A(t),\mathbf{V}_A(t)\}$$, obtained by numerical integration of these equations.

For an exact normalized electronic eigenstate, the Hellmann-Feynman theorem relates the derivative of the ground-state energy to the derivative of the Hamiltonian,

$$
\frac{\partial E_0}
{\partial R_{A\alpha}}
=
\left\langle
\Psi_0
\left\lvert
\frac{\partial\hat{H}_e}
{\partial R_{A\alpha}}
\right\rvert
\Psi_0
\right\rangle,
$$

where $$R_{A\alpha}$$ denotes a Cartesian nuclear coordinate. In practical finite-basis calculations, geometry-dependent basis functions and incomplete electronic optimization may introduce additional Pulay or response contributions. These terms must be treated consistently to obtain accurate nuclear forces.

For occupation-based electronic-structure methods, the central difficulty is that the energy depends on both the optimized occupations and the natural orbital basis. Reliable forces therefore require appropriate treatment of the nuclear-coordinate dependence of the functional, molecular integrals, and electronic variational variables. Numerical differentiation provides one possible approach, but introduces additional electronic calculations and errors associated with finite displacement steps and statistical noise.

The physical AIMD problem is independent of the method used to calculate the electronic energies and forces. The benchmark consequently evaluates the same nuclear equations of motion whether the electronic quantities are obtained from classical NOFT, conventional VQE, occupation-based quantum methods, or another electronic-structure solver.

## Target Property

The benchmark targets electronic ground-state energies, natural occupation numbers, potential-energy surfaces, nuclear forces, and molecular-dynamics trajectories. These observables are related through the electronic Hamiltonian and Born-Oppenheimer approximation, but require distinct accuracy criteria.

### Electronic Energies and Natural Occupations

For fixed nuclear coordinates, the ground-state energy is defined by the variational principle,

$$
E_0(\mathbf{R})
=
\min_{\lvert\Psi\rangle\neq0}
\frac{
\langle\Psi\rvert
\hat{H}_e(\mathbf{R})
\lvert\Psi\rangle
}{
\langle\Psi\vert\Psi\rangle
}.
$$

For an approximate electronic energy and a reference calculated under matched physical conditions, define

$$
\Delta E(\mathbf{R})
=
\left\lvert
E_{\mathrm{method}}(\mathbf{R})
-
E_{\mathrm{ref}}(\mathbf{R})
\right\rvert.
$$

The reference must use the same molecular geometry and finite-basis Hamiltonian when the objective is to assess algorithmic accuracy. Comparisons between different electronic-structure approximations should additionally identify the physical approximation errors associated with the chosen methods.

The natural occupation numbers provide complementary information about the electronic state. For a method producing occupations $$n_p^{\mathrm{method}}$$ and a corresponding reference, the orbital-resolved error is

$$
\Delta n_p
=
\left\lvert
n_p^{\mathrm{method}}
-
n_p^{\mathrm{ref}}
\right\rvert.
$$

An aggregate measure is the root-mean-square occupation error,

$$
\Delta n_{\mathrm{RMS}}
=
\sqrt{
\frac{1}{M}
\sum_{p=1}^{M}
\left(
n_p^{\mathrm{method}}
-
n_p^{\mathrm{ref}}
\right)^2
},
$$

where $$M$$ is the number of occupations included in the comparison. The orbital basis, spin convention, and treatment of degenerate natural orbitals must be consistent. Occupation redistribution is particularly informative during hydrogen-cluster dissociation, where increasing interatomic separation changes the character and strength of electronic correlations.

### Potential-Energy Surfaces and Nuclear Forces

The potential-energy surface describes the dependence of the electronic ground-state energy on nuclear geometry. For a symmetric dissociation coordinate $$R$$, the corresponding energy curve is $$E_{\mathrm{PES}}(R)=E_0(R)$$. A successful calculation should reproduce the relevant energy differences, the shape and smoothness of the curve, and the behavior in weakly and strongly correlated regimes. Agreement at isolated geometries is insufficient if the reconstructed surface develops artificial discontinuities or incorrect gradients.

Nuclear forces are obtained from the spatial derivatives of the energy surface. For atom $$A$$, the error relative to a reference force can be defined as

$$
\Delta F_A
=
\left\lVert
\mathbf{F}_A^{\mathrm{method}}
-
\mathbf{F}_A^{\mathrm{ref}}
\right\rVert.
$$

The reference forces must be calculated using compatible molecular conditions and sufficiently converged electronic-structure approximations. Small energy errors do not necessarily imply small force errors, particularly when the energies contain geometry-dependent statistical fluctuations or the electronic optimization is incomplete. Force accuracy must therefore be established independently before the electronic-structure method is used for molecular dynamics.

### Molecular-Dynamics Trajectories

The dynamical target is the evolution of nuclear coordinates and velocities under the calculated electronic forces. For microcanonical Born-Oppenheimer molecular dynamics, the total energy is

$$
E_{\mathrm{tot}}(t)
=
\sum_A
\frac{1}{2}M_A
\left\lVert\mathbf{V}_A(t)\right\rVert^2
+
E_0(\mathbf{R}(t)).
$$

An ideal microcanonical trajectory conserves this quantity, while a numerical calculation may exhibit deviations caused by finite time steps, electronic convergence errors, and noisy force estimates. A useful energy-conservation diagnostic is

$$
D_E(t)
=
E_{\mathrm{tot}}(t)
-
E_{\mathrm{tot}}(0).
$$

Trajectory accuracy should also be assessed through bond lengths, nuclear velocities, force fluctuations, and comparison with suitable reference dynamics. Pointwise trajectory differences are informative over short times, but may grow rapidly in chaotic systems even when the underlying statistical dynamics remain accurate. Long-time validation should therefore consider physical observables and trajectory statistics in addition to direct coordinate agreement.

## Problem Parameters and Conditions

The benchmark contains three representative hydrogen systems that address different components of the broader electronic-structure and molecular-dynamics problem.

| Molecular System | Size | Primary Target | Demonstrated Scope |
| --- | --- | --- | --- |
| Hydrogen molecule (H2) | 2 atoms | Electronic energies, nuclear forces, and trajectories | Published VQE-based AIMD |
| Cubic hydrogen cluster (H8) | 8 atoms | Ground-state energy and natural occupations | ON-VQE electronic structure |
| Cubic hydrogen cluster (H216) | 216 atoms | Energy and occupation redistribution during dissociation | Reported OS-VQO electronic structure |

These calculations should not be treated as equivalent demonstrations of molecular dynamics. H₂ provides the AIMD reference, whereas H₈ and H₂₁₆ primarily test the electronic-structure methods that might eventually be incorporated into molecular-dynamics workflows.

### Hydrogen Molecule: Quantum-Assisted AIMD

The hydrogen molecule provides a computationally accessible setting for evaluating the combination of quantum electronic-structure calculations, nuclear forces, and classical propagation. The primary reference is the work of Fedorov et al., which demonstrates VQE-based AIMD using correlated-sampling techniques for estimating electronic force contributions on quantum hardware.

A reproducible H₂ benchmark must specify the electronic Hamiltonian and orbital basis, the initial bond length and nuclear velocities, the nuclear masses, the integration time step, and the force-estimation procedure. Quantum measurement statistics and electronic convergence tolerances are also necessary to distinguish numerical integration errors from errors originating in the electronic calculation.

The objective is to determine whether a quantum electronic-structure solver can provide sufficiently accurate and stable forces over a complete molecular trajectory. The computational cost must be measured over the trajectory rather than inferred solely from the resources needed for one electronic-energy evaluation.

### Hydrogen Clusters and Symmetric Dissociation

Cubic hydrogen clusters provide controlled models for examining electronic correlation as the separation between atoms changes. At relatively small interatomic distances, the electronic states can exhibit more delocalized character, whereas increasing separation produces stronger localization and multireference behavior. The accompanying redistribution of natural occupations makes these systems particularly relevant for occupation-based electronic-structure methods.

The ON-VQE work includes electronic-structure calculations for a cubic H₈ cluster. The larger OS-VQO benchmark considers a 216-atom hydrogen cluster arranged in a $$6\times6\times6$$ simple-cubic geometry. In both cases, symmetric dissociation changes the characteristic interatomic spacing while preserving the underlying geometric arrangement.

The H₂₁₆ calculation investigates the evolution from relatively metallic-like electronic behavior toward a strongly correlated, Mott-insulating-like regime. Because the model contains a finite number of atoms, these observations should be interpreted as finite-system signatures of localization and correlation rather than as evidence of a thermodynamic phase transition.

The reported minimal OS-VQO representation uses $$m=1$$ and partitions the 216 electrons into 108 electron-pair occupation spaces. One occupation-space qubit is assigned to each pair, giving an algorithmic encoding of 108 qubits. This count describes the reduced occupation representation rather than a general spin-orbital encoding of the full many-electron wavefunction, and it should not be described as a fault-tolerant logical-qubit count.

A reproducible comparison requires the exact occupation-space mapping, natural orbital functional, molecular basis, circuit specification, and optimization protocol. Particular care is needed when comparing a quantum occupation-based result with classical NOFT, since the two calculations must use the same functional and electronic representation to isolate the computational effects of quantum measurements.

### Initial Conditions and Numerical Specifications

Static electronic-structure calculations require fixed nuclear geometries, specified electron counts, molecular orbital bases, and electronic-state constraints. AIMD additionally requires initial nuclear coordinates and velocities, nuclear masses, an integration algorithm, and a time step. The finite hydrogen systems are treated as isolated molecules or clusters unless a particular calculation explicitly introduces different boundary conditions.

The target accuracy depends on the observable. Ground-state energies and occupations should be compared against matched references, while potential-energy surfaces require accuracy across an entire set of nuclear geometries. AIMD calculations additionally require converged forces and stable nuclear propagation. No single energy-error threshold is sufficient to validate all three levels of the benchmark.

## Computational Challenges

The benchmark combines the difficulty of correlated electronic-structure calculations with the repeated force evaluations required for molecular dynamics. These challenges become more pronounced as the electronic structure changes with nuclear geometry, particularly when molecular dissociation produces strongly correlated states that cannot be described adequately by a single reference determinant.

Natural occupation numbers provide a reduced description of electronic correlation, but their usefulness depends on the accuracy of the energy functional and the ability to determine the corresponding natural orbital basis. In occupation-based quantum methods, a compact quantum representation may reduce the number of measurement observables without eliminating the classical costs of orbital optimization, integral evaluation, and functional reconstruction. The effectiveness of this division of computational work must be assessed using the complete algorithm.

Measurement precision is a further limitation. Occupation numbers estimated from quantum circuits are affected by finite sampling statistics, gate errors, and readout noise. These errors propagate through the natural orbital functional and may produce geometry-dependent fluctuations in the calculated energy. Even when such fluctuations have a modest effect on individual energy estimates, their influence on numerical derivatives can be amplified, making accurate force evaluation more demanding than single-point electronic-structure calculations.

The geometry dependence of the natural orbitals introduces additional complications. A complete electronic calculation may require self-consistent optimization of occupations, orbital coefficients, and quantum circuit parameters. Incomplete convergence can influence both the energy and its nuclear derivatives. The evaluation of forces must therefore account for the derivative of the molecular integrals, basis-set dependence, and the response of the optimized electronic variables, or employ a numerical differentiation method with controlled truncation and statistical errors.

AIMD also requires the electronic calculation to be repeated over many nuclear configurations. An improvement in the cost of one occupation measurement does not necessarily translate into an improvement in the cost of a complete trajectory. The number of optimization iterations, the ability to reuse information from previous geometries, and the expense of force estimation can dominate total computational requirements. Benchmarking must therefore separate single-point electronic performance from the cost of repeated electronic calculations within molecular dynamics.

Finally, the physical approximation introduced by the natural orbital functional must be distinguished from errors associated with the quantum hardware or optimization algorithm. A quantum method may reproduce a classical PNOF7 calculation accurately while both retain systematic deviations from the exact electronic ground state. A complete assessment consequently requires comparisons both within the same approximate functional and, where possible, against higher-accuracy electronic-structure references.

## Accuracy and Validation Criteria

The benchmark requires separate validation of electronic energies, natural occupations, nuclear forces, and molecular trajectories. Each level introduces additional sources of error and cannot be inferred solely from the accuracy achieved at the preceding level.

### Electronic-Structure Validation

For each nuclear geometry, the calculated ground-state energy should be compared against a reference obtained using the same molecular Hamiltonian and finite orbital basis. When the objective is to evaluate ON-VQE or OS-VQO as an implementation of a particular natural orbital functional, a classical calculation using that same functional provides the most direct comparison. This isolates errors arising from quantum occupation measurements, variational optimization, and orbital processing.

Agreement with classical NOFT is not equivalent to agreement with the exact electronic ground state. Where computationally feasible, higher-accuracy references should also be used to assess the physical error of the chosen functional. These two comparisons answer different questions and should be reported separately.

Natural occupation-number validation should include orbital-resolved and aggregate errors, conservation of electron number, compliance with the relevant occupation bounds, and the behavior of occupations across dissociation. For electron-pair representations, normalization within each pair subspace must also be checked. Accurate occupation redistribution is an important indicator that the electronic model reproduces the changing correlation regime.

The potential-energy surface should be validated over the full geometry range rather than at a small number of selected points. Relevant quantities include absolute and relative energies, dissociation behavior, equilibrium geometry where applicable, and the smoothness of the calculated curve. A method that reproduces individual energies but introduces irregular variations between neighboring geometries may be unsuitable for force calculations.

### Force and Trajectory Validation

For an AIMD implementation, nuclear forces must be compared with sufficiently converged references. Validation should examine the effects of incomplete electronic optimization, geometry-dependent orbital bases, finite-difference truncation, and quantum measurement noise. Agreement in the electronic potential-energy surface does not automatically establish accurate derivatives, especially when the energy is evaluated through stochastic measurements.

A completed molecular-dynamics benchmark should report total-energy conservation in microcanonical simulations, force fluctuations, bond-length evolution, sensitivity to the integration time step, and stability over the simulated trajectory. Comparisons should use matched nuclear masses, initial conditions, electronic Hamiltonians, and propagation algorithms.

The effects of force errors can accumulate over multiple time steps, so a useful validation should include both short-time agreement with reference dynamics and longer-time physical behavior. Quantum measurement uncertainty should be propagated into the force and trajectory analysis rather than treated as an isolated uncertainty in the electronic energy.

### Current Validation Status

The reported results correspond to different stages of the electronic-structure and AIMD workflow.

| Benchmark Target | Status |
| --- | --- |
| H2 VQE-based AIMD | Published quantum-assisted molecular-dynamics demonstration |
| H8 ON-VQE electronic structure | Preprint reporting simulations and quantum-hardware calculations |
| H216 OS-VQO electronic structure | Reported in the associated 2026 OS-VQO manuscript and project description |
| H2 AIMD using OS-VQO | Under development; no completed trajectory reported in this entry |
| Large-system AIMD using OS-VQO | Proposed future application |

The OS-VQO hardware calculations for H₂₁₆ evaluate occupation-space circuits along a dissociation path. In the reported protocol, circuit parameters were optimized noiselessly and subsequently evaluated on quantum hardware. These results therefore concern the hardware execution of electronic-structure circuits rather than complete hardware-in-the-loop optimization or molecular dynamics.

The available evidence establishes the feasibility of occupation-based electronic-structure calculations on quantum hardware, but does not yet validate the full AIMD-OS-VQO workflow. Performance claims concerning that extension must remain conditional until numerical forces and complete trajectories have been demonstrated.

## Comparative Solutions and Performance

The benchmark supports comparisons among conventional classical electronic-structure methods, natural orbital functional approaches, variational quantum algorithms, and hybrid molecular-dynamics workflows. The principal objective is to determine whether quantum occupation-based methods can obtain the electronic quantities required for accurate molecular dynamics with lower total computational cost than competitive classical alternatives.

### Representative Solution Methods

| Solution | Computational Paradigm | Primary Approach | Principal Limitation |
| --- | --- | --- | --- |
| Classical NOFT / PNOF | Classical computational | Natural occupation and orbital optimization | Functional approximation and optimization cost |
| Classical DFT-AIMD | Classical computational | Density-functional energies and nuclear forces | Functional accuracy and repeated electronic calculations |
| Full Configuration Interaction | Classical computational | Exact finite-basis diagonalization | Combinatorial configuration-space growth |
| Conventional VQE | Hybrid quantum-classical | Variational Hamiltonian expectation values | Measurement and optimization overhead |
| VQE-AIMD | Hybrid quantum-classical | VQE electronic calculations and classical nuclear propagation | Force estimation and repeated quantum calculations |
| ON-VQE | Hybrid quantum-classical | Quantum measurement of natural occupations | Occupation and orbital optimization |
| OS-VQO | Hybrid quantum-classical | Direct occupation-space quantum representation | Functional accuracy, sampling, and total optimization cost |
| AIMD-OS-VQO | Hybrid quantum-classical | Proposed occupation-based energies and nuclear forces | Force implementation and trajectory validation |

### Classical and Quantum Electronic-Structure Approaches

Classical NOFT determines electronic energies by optimizing natural occupations and natural orbitals within a selected approximate functional. PNOF7 provides an important reference for the occupation-based calculations considered in this benchmark. A comparison between classical PNOF7 and a quantum occupation-based calculation using the same functional can isolate the additional computational costs and errors associated with quantum occupation preparation and measurement. Comparisons with other classical electronic-structure methods, including FCI and DFT, provide complementary information about the physical accuracy of the functional itself.

Conventional VQE instead prepares a many-electron quantum state and estimates its Hamiltonian expectation value. This typically requires measurements of multiple Pauli operators associated with the electronic Hamiltonian. Occupation-based approaches seek to reduce the quantum measurement requirements by obtaining the natural occupations directly. For a suitable spin-orbital encoding, the occupation of orbital $$p$$ can be extracted from the Pauli-Z expectation value,

$$
n_p
=
\frac{1-\langle Z_p\rangle}{2}.
$$

All occupations in the corresponding computational basis can be estimated from the same measurement setting. This reduces the number of distinct measurement bases, although the required number of shots remains dependent on the desired statistical precision and the sensitivity of the energy functional to occupation errors.

ON-VQE applies this principle to a quantum state designed to provide natural occupation numbers for subsequent classical NOF energy evaluation. The published preprint reports electronic-structure calculations, including hardware results for the cubic H₈ cluster. These calculations demonstrate the occupation-measurement approach but do not constitute a molecular-dynamics implementation.

OS-VQO uses a more direct occupation-space representation in which quantum states encode the occupation distributions of electron-pair subspaces. The H₂₁₆ benchmark employs this representation to study electronic-energy and occupation changes along symmetric dissociation. As reported in the supplied manuscript description, the minimal encoding uses 108 algorithmic qubits and hardware experiments on an IBM BasqueCountry Heron R2 processor, with 10,000 shots per circuit and ten independent executions per geometry. The reported raw hardware comparison does not apply additional error mitigation or postprocessing, and the evaluated circuit parameters were obtained from noiseless optimization.

The H₂₁₆ calculations provide a test of occupation-space electronic structure in a strongly correlated finite system. They do not establish a general quantum computational advantage over classical NOFT, since the total cost of obtaining and optimizing the occupations, evaluating the functional, and processing the results must also be considered.

### Quantum-Assisted Molecular Dynamics

The VQE-AIMD method of Fedorov et al. provides the principal published reference for quantum-assisted nuclear propagation. It combines VQE electronic energies with force estimation based on numerical Hellmann-Feynman gradients and correlated sampling. The methodology is designed to reduce the measurement overhead associated with obtaining forces at successive nuclear geometries, and its published demonstration includes H₂ dynamics on IBM quantum hardware.

The proposed AIMD-OS-VQO approach seeks to replace the conventional VQE electronic solver with an occupation-based method. In a complete implementation, the electronic occupations and natural orbitals would be optimized or updated at each nuclear geometry, the NOF would provide the corresponding energy, and a suitable force estimator would determine the nuclear forces used for classical propagation.

The feasibility of this workflow depends on several unresolved questions. These include whether occupation measurements can achieve the precision required for stable force evaluation, how efficiently the natural orbitals can be optimized as the geometry changes, and whether quantum measurement information can be reused between force calculations or successive molecular-dynamics steps. The resulting trajectory must also be compared with classical NOFT-AIMD and established quantum-assisted AIMD methods under matched physical conditions.

No completed AIMD-OS-VQO trajectories are reported in the present benchmark. The proposed extension is therefore treated as a future Solution rather than as an established computational result.

### Performance Metrics and Scaling

The electronic-structure component should be evaluated using the number of electrons, orbital and occupation-space dimensions, quantum circuit resources, occupation-measurement precision, and the total cost of energy evaluation. For occupation-based methods, it is particularly important to distinguish the number of measured occupation variables from the number of distinct measurement settings and the total number of quantum measurements.

The optimization cost depends on the number of occupation variables, circuit parameters, classical functional evaluations, and natural orbital optimization iterations. A compact quantum representation may reduce some of these quantities while leaving others unchanged or increasing the amount of classical processing. Both quantum and classical resources must therefore be included in performance measurements.

For AIMD, the relevant computational task is the complete nuclear trajectory rather than an isolated electronic calculation. The cost depends on the number of propagation steps, the electronic and force evaluations required per step, the possibility of reusing information between geometries, and the numerical stability of the propagation.

A useful decomposition of the total molecular-dynamics runtime is

$$
T_{\mathrm{AIMD}}
=
T_{\mathrm{setup}}
+
\sum_{k=1}^{N_{\mathrm{steps}}}
\left[
T_{\mathrm{electronic}}^{(k)}
+
T_{\mathrm{forces}}^{(k)}
+
T_{\mathrm{propagation}}^{(k)}
\right],
$$

where the electronic and force contributions should be defined without double-counting measurements or numerical work reused between them. For quantum-assisted calculations, the electronic component includes state preparation, circuit execution, measurement, classical optimization, and functional evaluation as applicable.

A complete benchmark should report both quantum hardware execution time and classical computational time, together with total elapsed wall-clock time and aggregate resource consumption. The number of electronic calculations, force evaluations, and quantum shots per molecular-dynamics step is especially relevant when comparing methods that differ in how electronic information is reused.

### Crossing-Point Analysis

The benchmark aims to identify whether occupation-based quantum approaches can achieve the same physical accuracy as classical electronic-structure and molecular-dynamics methods with lower total computational cost. The first comparison should use the same natural orbital functional to isolate the computational effect of quantum occupation generation and optimization. A broader comparison can then evaluate physical accuracy relative to other electronic-structure approximations.

For a system characterized by size $$N$$ and a specified accuracy target $$\varepsilon$$, a computational crossing point may be defined by

$$
T_{\mathrm{quantum}}(N^*,\varepsilon)
=
T_{\mathrm{classical}}(N^*,\varepsilon),
$$

where $$N^*$$ denotes the system size at which the methods require equal end-to-end computational time. For AIMD, the accuracy criterion must include electronic energies, nuclear forces, and appropriate trajectory observables rather than a single-point energy tolerance alone.

The most informative scaling studies compare occupation-measurement requirements against energy precision, classical and quantum occupation-optimization costs, natural orbital optimization versus orbital count, force-estimation cost versus nuclear degrees of freedom, and total trajectory runtime versus simulated physical time. Circuit depth, physical qubit requirements, and the effects of hardware noise must also be included for quantum implementations.

An apparent advantage in measurement-setting count or qubit encoding does not establish an advantage in end-to-end runtime. Any crossing-point claim must specify the physical model, electronic-structure functional, accuracy target, hardware, and computational baseline. Measured results should be distinguished from theoretical scaling estimates and extrapolations.

The existing occupation-based electronic-structure demonstrations motivate this investigation, but they do not establish a computational advantage for quantum-assisted AIMD. Resolving that question requires a validated force implementation, complete molecular trajectories, and matched-accuracy comparisons against optimized classical methods.

## Primary References

Dmitry A. Fedorov, Matthew J. Otten, Stephen K. Gray, and Yuri Alexeev, “Ab initio molecular dynamics on quantum computers,” *Journal of Chemical Physics* **154**, 164103 (2021). [DOI: 10.1063/5.0046930](https://doi.org/10.1063/5.0046930).

Edison X. Salazar, Juan Felipe Huan Lew-Yee, and Mario Piris, “Electronic Structure Calculations from Occupation Numbers on Quantum Computers,” arXiv:2607.15425 (2026). [arXiv preprint](https://arxiv.org/abs/2607.15425).

Edison X. Salazar and Mario Piris, “Occupation-Space Variational Quantum Optimization,” *ChemRxiv* (2026). [DOI: 10.26434/chemrxiv.15008226/v1](https://doi.org/10.26434/chemrxiv.15008226/v1).

### Supporting References

“Microcanonical and finite-temperature ab initio molecular dynamics simulations on quantum computers,” *Physical Review Research* **3**, 013125 (2021). [DOI: 10.1103/PhysRevResearch.3.013125](https://doi.org/10.1103/PhysRevResearch.3.013125).

### Reproducibility Requirements

Each numerical benchmark submission should identify the molecular geometry, electronic Hamiltonian, orbital basis, natural orbital functional, occupation-space representation, and optimization protocol. Quantum calculations must specify circuit parameters, qubit resources, measurement statistics, noise treatment, and the distinction between simulator-based optimization and actual hardware execution.

For AIMD calculations, the initial nuclear coordinates and velocities, nuclear masses, force-estimation procedure, integration time step, and trajectory duration must also be supplied. Energy, occupation, force, and trajectory accuracy should be reported against clearly identified references, together with classical and quantum computational resources and any available code or numerical datasets.
