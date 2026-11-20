---
layout: solution
title: "Localized Active Space Sample-based Quantum Diagonalization (LASSQD)"
published: true
submitted_by: "Eric D. Switzer"
si_use: "Yes"

solution_classes:
  computational_paradigm: "Hybrid quantum–classical"
  method_family:
    - "Exact diagonalization/subspace"
    - "Variational/optimization"
    - "Quantum circuit"
  algorithmic_approach:
    - "Stochastic"
    - "Iterative"
    - "Variational"
    - "Projection/subspace"
  approximation_error_control:
    - "Variationally bounded"
    - "Heuristic/uncontrolled"
    - "Statistically estimated"
    - "Noise-limited"
  si_ml_involvement:
    - "None"

problems_applied:
  - "Transition Metal Complexes"

summary: "A hybrid quantum-classical multireference electronic-structure method that replaces full configuration interaction fragment solvers in localized active space self-consistent field calculations with sample-based quantum diagonalization. Quantum circuits sample important electronic configurations, while classical subspace diagonalization, configuration carryover, and orbital optimization enable approximate treatment of strongly correlated molecular fragments."

solution_status:
  role: "Candidate"
  validation: "Partially validated"

code_repository: ""
data_repository: ""
---

## Algorithm Overview

Localized Active Space Sample-based Quantum Diagonalization (LASSQD) is a hybrid quantum-classical method for approximating the electronic ground states of strongly correlated molecular systems. It combines the localized active space self-consistent field (LASSCF) framework with sample-based quantum diagonalization (SQD), replacing the full configuration interaction (FCI) solvers conventionally used for individual active-space fragments with quantum-assisted selected-configuration calculations. The approach is intended to extend localized multireference electronic-structure calculations to fragment sizes for which classical FCI becomes computationally prohibitive.

LASSCF addresses the combinatorial growth of the electronic configuration space by partitioning a molecular active space into smaller, spatially localized fragments. Each fragment contains correlated electrons whose wavefunction is optimized together with the molecular orbitals. Although this decomposition substantially reduces the dimensions of the individual electronic problems, conventional LASSCF retains an FCI bottleneck when the number of active electrons and orbitals within a fragment becomes large.

LASSQD addresses this bottleneck by using quantum circuits to prepare approximate correlated fragment states and sample electronic occupation configurations. The measured configurations are processed into selected determinant subspaces, within which the fragment Hamiltonians are diagonalized classically. The resulting fragment wavefunctions and reduced density matrices provide the electronic information required for subsequent orbital optimization. Quantum hardware therefore contributes to the identification of relevant electronic configurations, while the projected eigenvalue problems and molecular self-consistency calculations remain classical.

A central feature of LASSQD is configuration carryover, which retains important electronic configurations between successive orbital-optimization iterations. Independently sampled determinant spaces can differ substantially between iterations, producing fluctuations in fragment energies and reduced density matrices that disrupt self-consistent convergence. Carryover mitigates this problem by preserving configurations selected from previously calculated fragment states, thereby improving the continuity of the approximate electronic representation as the molecular orbitals evolve.

The method is particularly relevant to transition-metal complexes, multimetallic systems, and metal-organic molecules containing strongly correlated electronic fragments. Its suitability depends on two distinct physical conditions: the localized active-space approximation must adequately describe the coupling between fragments, and the important configurations within each fragment must be accessible through quantum sampling and classical subspace diagonalization. The first condition concerns the physical approximation of LASSCF, while the second determines the accuracy and computational efficiency of the SQD fragment solver.

The primary application considered here includes bimetallic and trimetallic iron complexes and iron-porphyrin. These systems provide controlled tests of fragment-level accuracy, self-consistent orbital convergence, and spin-state energetics across active spaces of increasing computational difficulty.

## Methodology and Execution

### Localized Active-Space Representation

The underlying electronic structure is described by the nonrelativistic molecular Hamiltonian in a finite spin-orbital basis,

$$
\hat{H}
=
\sum_{pq}h_{pq}a_p^\dagger a_q
+
\frac{1}{2}
\sum_{pqrs}g_{pqrs}
a_p^\dagger a_q^\dagger a_s a_r
+
E_{\mathrm{nuc}},
$$

where $$a_p^\dagger$$ and $$a_p$$ are fermionic creation and annihilation operators, $$h_{pq}$$ and $$g_{pqrs}$$ denote the one- and two-electron integrals under the chosen index convention, and $$E_{\mathrm{nuc}}$$ is the nuclear repulsion energy. The objective is to approximate the lowest-energy electronic state within the specified electron-number and spin sector.

LASSCF partitions the correlated orbital space into $$N_f$$ localized fragments and represents the active-space wavefunction as an antisymmetrized product of fragment wavefunctions. Schematically,

$$
\lvert\Psi_{\mathrm{LAS}}\rangle
=
\mathcal{A}
\left[
\left(
\bigotimes_{K=1}^{N_f}
\lvert\Psi_K\rangle
\right)
\otimes
\lvert\Phi_{\mathrm{core}}\rangle
\right],
$$

where $$\lvert\Psi_K\rangle$$ is the correlated wavefunction of fragment $$K$$, $$\lvert\Phi_{\mathrm{core}}\rangle$$ represents the inactive electronic orbitals, and $$\mathcal{A}$$ enforces fermionic antisymmetry. The fragment wavefunctions and molecular orbitals are optimized self-consistently, but the product-state structure restricts explicit interfragment entanglement.

The computational advantage of this representation follows from replacing one large correlated electronic problem with several smaller fragment problems. For a fragment containing $$N_e$$ active electrons and $$M$$ spatial orbitals, the complete fixed-electron-number determinant space has dimension

$$
D_{\mathrm{FCI}}
=
\binom{2M}{N_e}.
$$

When the spin-up and spin-down electron numbers are specified separately, the corresponding dimension is

$$
D_{\mathrm{FCI}}
=
\binom{M}{N_\alpha}
\binom{M}{N_\beta},
\qquad
N_\alpha+N_\beta=N_e.
$$

These dimensions can remain prohibitively large even after localization. In conventional LASSCF, the fragment FCI solver must represent the corresponding configuration space explicitly or through an iterative eigensolver operating on that space. LASSQD replaces this step with SQD, seeking a substantially smaller set of determinants that retains the information necessary for an accurate approximation of the fragment ground state.

### Quantum State Preparation and Configuration Sampling

The published implementation uses a local-unitary cluster Jastrow (LUCJ) ansatz to prepare approximate correlated fragment states. A schematic form of the circuit-generated wavefunction is

$$
\lvert\Psi_{\mathrm{LUCJ}}\rangle
=
\left[
\prod_{\ell=1}^{L}
e^{\hat{K}_{\ell}}
e^{i\hat{J}_{\ell}}
e^{-\hat{K}_{\ell}}
\right]
\lvert\Phi_{\mathrm{HF}}\rangle,
$$

where $$L$$ is the number of ansatz layers, $$\hat{K}_{\ell}$$ generates orbital transformations, $$\hat{J}_{\ell}$$ represents density-density correlations, and $$\lvert\Phi_{\mathrm{HF}}\rangle$$ is a Hartree-Fock reference state. The locality restrictions imposed on the Jastrow interactions are intended to reduce circuit complexity while retaining a sampling distribution enriched in electronically important configurations.

In a conventional occupation-number encoding, each spin-orbital is represented by a qubit, with computational-basis states corresponding to unoccupied and occupied orbitals. A fragment containing $$M$$ spatial orbitals therefore requires $$N_q=2M$$ occupation qubits before any symmetry reductions or hardware-specific modifications. Measurements in the computational basis produce bitstrings representing electronic configurations.

For an ideal prepared state, the probability of observing configuration $$\mathbf{x}$$ is

$$
P(\mathbf{x})
=
\left\lvert
\langle\mathbf{x}
\vert\Psi_{\mathrm{LUCJ}}\rangle
\right\rvert^2.
$$

The purpose of quantum sampling is not to reconstruct every amplitude of the fragment wavefunction. Instead, it identifies configurations with sufficient weight in the prepared state to provide useful candidates for a reduced classical eigenvalue problem. The quality of this sampling distribution is important because physically significant determinants with small measurement probabilities may be missed in a finite measurement budget.

The measured configurations are processed through particle-number and spin-resolved recovery procedures. Noise and imperfect state preparation can produce bitstrings outside the intended electronic sector; recovery attempts to restore physically admissible configurations using information obtained from the sampled occupation distributions. The resulting candidates are assembled into one or more selected determinant subspaces for classical diagonalization.

### Sample-Based Quantum Diagonalization

For a selected determinant set $$\mathcal{S}$$, define the corresponding projector

$$
\hat{P}_{\mathcal{S}}
=
\sum_{I\in\mathcal{S}}
\lvert D_I\rangle
\langle D_I\rvert.
$$

The fragment Hamiltonian is restricted to this subspace, with matrix elements

$$
H_{IJ}
=
\langle D_I\rvert
\hat{H}_{K}
\lvert D_J\rangle,
\qquad
I,J\in\mathcal{S},
$$

where $$\hat{H}_{K}$$ denotes the effective electronic Hamiltonian for fragment $$K$$ under the current localized active-space environment. The lowest eigenvalue and eigenvector of the projected Hamiltonian provide approximate fragment energies and wavefunctions.

The corresponding selected-space state is

$$
\lvert\Psi_K^{\mathcal{S}}\rangle
=
\sum_{I\in\mathcal{S}}
c_I\lvert D_I\rangle.
$$

The coefficients $$c_I$$ are obtained through classical diagonalization, rather than directly from the measured quantum probabilities. This distinction is central to SQD: quantum measurements identify candidate configurations, but the electronic amplitudes and energy are determined by solving the Hamiltonian in the selected space. As a consequence, an imperfect quantum state can still provide useful configurations if its measurement distribution overlaps sufficiently with determinants important to the target eigenstate.

The implementation can use multiple sampling batches and selected subspaces. Numerical convergence depends on the number and quality of retained determinants, the electronic symmetry constraints, and the tolerances of the classical eigensolver. These parameters must be reported separately from the quantum circuit resources because a larger or more accurate classical subspace calculation does not necessarily require a proportional increase in quantum measurements.

### Configuration Carryover and Orbital Self-Consistency

LASSQD couples the stochastic selection of electronic configurations to the iterative orbital optimization of LASSCF. This creates a numerical challenge because independently generated determinant subspaces may differ between successive self-consistent-field iterations. Even when the physical electronic state changes only moderately, the stochastic selection process can introduce fluctuations in the fragment energies and reduced density matrices that are passed to the orbital optimizer.

Configuration carryover is designed to preserve continuity between these iterations. After diagonalizing a selected fragment Hamiltonian, configurations associated with sufficiently important wavefunction contributions are retained for use in subsequent calculations. A schematic amplitude-based selection is

$$
\mathcal{C}^{(n)}
=
\left\{
D_I:
\lvert c_I^{(n)}\rvert
>
\epsilon_{\mathrm{carry}}
\right\},
$$

where $$n$$ labels the self-consistent-field iteration and $$\epsilon_{\mathrm{carry}}$$ is a selection threshold. The next determinant space can then be augmented according to

$$
\widetilde{\mathcal{S}}^{(n+1)}
=
\mathcal{S}^{(n+1)}
\cup
\mathcal{C}^{(n)}.
$$

This expression illustrates the carryover principle rather than specifying every detail of the published selection procedure. The implementation retains spin-resolved configurations and uses orbital-overlap information to maintain consistency as the molecular orbital basis changes. Such mapping is necessary because an occupation bitstring defined relative to one orbital basis does not automatically represent the same physical configuration after an orbital transformation.

Once the fragment eigenstates are obtained, their reduced density matrices are calculated classically. The one- and two-particle reduced density matrices are

$$
\gamma_{pq}
=
\langle\Psi_K\rvert
a_p^\dagger a_q
\lvert\Psi_K\rangle,
$$

and

$$
\Gamma_{pqrs}
=
\langle\Psi_K\rvert
a_p^\dagger a_q^\dagger a_s a_r
\lvert\Psi_K\rangle.
$$

These quantities provide the electronic information required for orbital optimization within the localized active-space framework. The fragment calculations are updated at fixed orbitals, while outer self-consistent-field iterations modify the orbital basis using the resulting electronic densities and energy derivatives.

The overall optimization can be represented schematically as the minimization of the localized active-space energy,

$$
E_{\mathrm{LAS}}
=
E_{\mathrm{LAS}}
\left(
\{\Psi_K\},
\boldsymbol{\kappa}
\right),
$$

where $$\boldsymbol{\kappa}$$ denotes orbital-rotation parameters and the fragment states are represented by selected determinant expansions. Configuration carryover reduces the changes in approximate fragment wavefunctions between iterations, improving the stability of orbital optimization without eliminating the underlying selected-space approximation.

### Computational Implementation

LASSQD divides its workload between quantum sampling and classical molecular electronic-structure calculations. Quantum circuits prepare approximate fragment states and generate computational-basis measurement samples. Classical processors construct the fragment Hamiltonians, recover candidate configurations, assemble selected determinant spaces, diagonalize the projected Hamiltonians, evaluate reduced density matrices, and optimize the molecular orbitals.

The primary study reports calculations using IBM superconducting quantum processors, including `ibm_torino` and `ibm_fez`, together with noiseless quantum-circuit simulations for controlled numerical comparisons. The associated software workflow uses PySCF for molecular electronic-structure calculations, `mrh` for localized active-space methods, Qiskit and Qiskit SQD for quantum sampling and selected-subspace processing, and `ffsim` for fermionic circuit simulation or construction.

The method does not require machine learning or superintelligence. Configuration selection arises from quantum sampling and classical processing, while the molecular energy and orbital optimization are determined by electronic-structure calculations. Its computational paradigm is therefore hybrid quantum-classical rather than machine-learning-assisted electronic structure.

## Approximation and Error Control

LASSQD introduces several approximation mechanisms operating at different levels of the calculation. The localized active-space ansatz restricts the molecular wavefunction to an antisymmetrized product of fragment states, SQD approximates each fragment wavefunction in a selected determinant subspace, quantum sampling determines which configurations are considered, and self-consistent orbital optimization introduces further numerical convergence requirements. These sources of error must be distinguished when assessing the accuracy of the final molecular energy.

### Localized Active-Space and Selected-Subspace Errors

The localized active-space approximation is most suitable when strong electronic correlations are concentrated within identifiable fragments. Although each fragment can contain a multiconfigurational electronic state, the product-state structure does not explicitly represent arbitrary entanglement between different active-space fragments. Significant interfragment correlation can therefore produce systematic errors even if the individual fragment electronic problems are solved exactly.

SQD introduces a separate approximation by retaining only a subset of the fragment determinant space. For a valid selected subspace and accurately evaluated Hamiltonian matrix elements, the Rayleigh-Ritz variational principle gives

$$
E_{\mathcal{S}}
\geq
E_{\mathrm{FCI}},
$$

where both energies refer to the same fragment Hamiltonian and physical symmetry sector. The selected-subspace result is therefore variationally bounded relative to the exact fragment FCI energy. If a sequence of subspaces is nested, expanding the space cannot increase the lowest projected eigenvalue when the Hamiltonian remains fixed.

Independently sampled subspaces are not necessarily nested, however, and their calculated energies need not improve monotonically with additional sampling. Configuration carryover can improve the continuity of the selected spaces, but the general stochastic workflow does not guarantee systematic convergence from one orbital iteration to the next.

The fragment-level variational bound must not be interpreted as a rigorous bound on the error of the complete molecular calculation. The localized active-space approximation, changes in the optimized orbitals, incomplete convergence, and other electronic-structure approximations can all affect the final result. Consequently, a fragment energy close to FCI does not establish that the total LASSQD energy is close to the exact full-molecule ground-state energy.

### Statistical, Hardware, and Self-Consistency Errors

Finite quantum sampling can omit electronically important configurations, particularly when their probabilities in the prepared state are small. Sampling uncertainty therefore affects the selected determinant space and can propagate into fragment energies, reduced density matrices, and molecular orbital optimization. Repeated sampling experiments and convergence studies with respect to measurement count and selected-space dimension are necessary to characterize this contribution.

Quantum hardware errors modify the measured configuration distribution through imperfect gates, decoherence, and readout errors. Configuration recovery can partially mitigate the resulting occupation-sector violations, but it does not guarantee recovery of every important determinant or complete removal of hardware-induced sampling bias. Comparisons with noiseless circuit simulations help separate the effects of hardware noise from limitations intrinsic to the prepared quantum state and selected-subspace approximation.

The self-consistent-field calculation introduces additional errors when fragment solutions or orbital rotations are insufficiently converged. Configuration carryover improves stability by reducing stochastic discontinuities in the fragment representation, but the converged result may still depend on carryover thresholds, selected-space dimensions, initial orbitals, and numerical optimization tolerances.

The principal error sources and corresponding validation procedures are summarized below.

| Error Source | Origin | Validation Approach |
| --- | --- | --- |
| Localized active space | Neglected interfragment correlations | Comparison with CASSCF or higher-level references where feasible |
| Selected determinant space | Missing configurations | Increase selected-space dimension |
| Quantum sampling | Finite measurement statistics | Increase shots and repeat independent runs |
| Hardware noise | Imperfect state preparation and readout | Compare hardware results with noiseless simulations |
| Configuration carryover | Selection and orbital-basis mapping approximations | Vary carryover thresholds and mapping settings |
| Orbital optimization | Incomplete self-consistency | Monitor energy and orbital-gradient convergence |
| Classical diagonalization | Finite eigensolver tolerances | Tighten solver residuals and convergence criteria |

LASSQD is therefore best described as a partially validated, approximate hybrid electronic-structure method. It possesses a variationally bounded selected-subspace component, but the complete workflow does not provide a general rigorous bound on the error relative to the exact molecular electronic energy.

## Applied Problems

### Transition Metal Complexes

The primary application concerns strongly correlated iron-based transition-metal complexes, including a bimetallic iron-bipyrimidine system, a trimetallic iron-oxo-formate complex, and iron-porphyrin. These molecular systems differ in the number of correlated metal centers, the sizes of their localized fragments, and the importance of metal-ligand electronic correlations. Together, they test the ability of quantum-sampled fragment solvers to reproduce classical localized-active-space references and support self-consistent orbital optimization.

The active spaces considered in the published study are summarized below.

| Molecular System | Localized Fragment Active Spaces | Principal Target |
| --- | --- | --- |
| Bimetallic iron-bipyrimidine | Two (6e, 5o) fragments | Intermediate-spin electronic energy |
| Bimetallic iron-bipyrimidine | Two (6e, 10o) fragments | Intermediate-spin electronic energy |
| Trimetallic iron-oxo-formate | (6e, 10o), (5e, 10o), (5e, 10o) | Specified intermediate-spin energy |
| Iron-porphyrin | (6e, 5o) and (26e, 24o) | Singlet-quintet energy difference |

The bimetallic iron-bipyrimidine complex, $$[\mathrm{Fe}(\mathrm{H}_2\mathrm{O})_4]_2\mathrm{bpym}^{4+}$$, provides a controlled comparison between conventional LASSCF and LASSQD. In the smaller active space, each fragment contains six electrons in five spatial orbitals, allowing accurate classical FCI fragment solutions. The published LASSQD calculations reproduce the corresponding LASSCF energy to nearly numerical precision, demonstrating that the selected-space solver can recover the relevant fragment solution in a tractable validation regime.

The extended bimetallic calculation uses two (6e, 10o) fragments, increasing the cost of full fragment diagonalization. The reported LASSCF reference energy is

$$
E_{\mathrm{LASSCF}}
=
-3655.610977\ \mathrm{Ha}.
$$

With configuration carryover, LASSQD approaches this reference using reduced determinant spaces. Selected comparisons achieve agreement within approximately 1 kcal/mol while retaining around 50% of the complete fragment configuration space, and a reported hardware calculation reaches the same accuracy range with a final selected space below approximately 70% of the corresponding FCI dimension. These fractions describe particular numerical experiments and do not imply a universal reduction in determinant-space requirements.

The trimetallic iron-oxo-formate complex contains three correlated iron centers and is represented by localized active spaces of (6e, 10o), (5e, 10o), and (5e, 10o). The system provides a direct test of the interaction between stochastic fragment selection and molecular orbital optimization. Conventional SQD exhibits noticeable energy fluctuations as the orbital basis changes, whereas configuration carryover reduces these variations and allows smoother convergence toward the classical LASSCF reference. The published carryover simulations reach sub-1 kcal/mol deviations in selected calculations, illustrating the importance of preserving relevant configurations through the self-consistent procedure.

Iron-porphyrin presents a more demanding active-space problem because correlated iron orbitals interact with an extended conjugated ligand system. The reported active space contains 32 electrons in 29 spatial orbitals, partitioned into an iron-centered (6e, 5o) fragment and a porphyrin-centered (26e, 24o) fragment. The latter exceeds the practical FCI capabilities of the conventional fragment solver used in the study, motivating the use of quantum-sampled configurations and classical subspace diagonalization.

The primary target for iron-porphyrin is the singlet-minus-quintet energy difference,

$$
\Delta E_{\mathrm{S-Q}}
=
E_0(S=0)-E_0(S=2).
$$

The reported energy-variance-extrapolated results are:

| Method | Singlet-Quintet Gap (Ha) | Reported Uncertainty (Ha) |
| --- | ---: | ---: |
| LASSCI | 0.153064 | ±0.017056 |
| LASSQD | 0.135391 | ±0.064818 |

Both calculations predict a lower quintet energy than singlet energy within the specified active-space treatment, and their estimates agree within the reported uncertainties. The uncertainty associated with LASSQD remains substantial, so the result is better interpreted as a demonstration of quantum-assisted calculations involving a large correlated fragment than as a high-precision determination of the spin gap. Because the triplet sector is not included in this comparison, the result also does not establish the global spin ground state of iron-porphyrin.

These applications collectively demonstrate fragment-level accuracy in tractable cases, improved self-consistent convergence through carryover, and the feasibility of quantum-assisted calculations for a fragment beyond the classical FCI size used in the study. They do not establish systematic accuracy for arbitrary strongly correlated molecules or a general computational advantage over optimized classical selected-configuration methods.

## Performance Metrics and Scaling

The performance of LASSQD depends on quantum state preparation and measurement, the dimension of the selected determinant spaces, classical subspace diagonalization, and the number of self-consistent-field iterations. Its computational cost cannot be characterized by a single qubit count or circuit depth because a substantial fraction of the workload is performed classically.

### Quantum Sampling and Circuit Resources

The published implementation uses LUCJ-based fragment state preparation and computational-basis measurements. Relevant quantum resources include the number of occupation qubits, circuit layers, compiled gate counts and depth, hardware connectivity, measurement shots, and execution time. These quantities should be reported for each fragment, together with the preparation and sampling protocol used to obtain the selected configurations.

Representative measurement-shot counts reported in the study are:

| Molecular System | Reported Hardware Shots |
| --- | ---: |
| Bimetallic (6e, 5o) fragments | 30,000 |
| Bimetallic (6e, 10o) fragments | 80,000 |
| Trimetallic fragments | 90,000 |
| Iron-porphyrin fragments | 80,000 |

These counts correspond to specific experimental configurations rather than universal minimum requirements. The shots needed to achieve a prescribed energy accuracy depend on the prepared sampling distribution, fragment correlation structure, selected-space construction, and recovery procedure. Comparisons should therefore report energy error and selected-space dimension alongside measurement resources.

The LUCJ ansatz contains fermionic orbital transformations and density-density interaction operators. Under suitable circuit construction and connectivity assumptions, the orbital-rotation component admits a depth scaling of $$\mathcal{O}(N_q)$$, where $$N_q$$ is the number of qubits. Local density-density operations may have constant-depth implementations in the specified architecture. These component-level results should not be interpreted as a universal linear-depth bound for the complete compiled circuit, whose resources also depend on the number of ansatz layers, routing requirements, native gate decomposition, and hardware topology.

### Selected-Subspace and Classical Computational Costs

The principal numerical objective of SQD is to reduce the dimension of the fragment eigenvalue problem. A useful representation-efficiency metric is the selected-space fraction,

$$
f_{\mathrm{subspace}}
=
\frac{D_{\mathrm{selected}}}
{D_{\mathrm{FCI}}},
$$

where $$D_{\mathrm{selected}}$$ is the number of retained determinants and $$D_{\mathrm{FCI}}$$ is the dimension of the corresponding complete fragment configuration space. Energy accuracy should be evaluated as a function of this fraction, together with the quantum measurement cost required to construct the selected space.

Smaller selected spaces generally reduce the size of the projected Hamiltonian problem, but the total classical workload also includes configuration recovery, Hamiltonian matrix-element generation, eigensolver iterations, reduced-density-matrix evaluation, and orbital optimization. The cost of these operations depends on the sparsity and structure of the selected space, the fragment Hamiltonian, and the numerical algorithms used. A reduction in retained determinant count does not by itself quantify the overall computational savings.

Configuration carryover introduces another performance tradeoff. Retaining more configurations can improve the continuity of the fragment representation and reduce fluctuations during self-consistency, but it may also increase the subspace dimensions and classical diagonalization costs. The carryover threshold should therefore be evaluated through its combined effect on energy accuracy, orbital convergence, measurement requirements, and total runtime.

The principal performance metrics are summarized below.

| Metric | Description |
| --- | --- |
| Fragment active space | Number of electrons and spatial orbitals |
| Fragment count | Number of localized correlated subsystems |
| Selected-space dimension | Number of retained determinants per fragment |
| Energy accuracy | Deviation from a specified LASSCF or higher-level reference |
| Quantum resources | Qubits, circuit depth, gate counts, shots, and execution time |
| Sampling efficiency | Useful configurations obtained per measurement budget |
| Configuration carryover | Retention threshold and influence on convergence |
| Classical eigensolver cost | Hamiltonian construction, diagonalization time, and memory |
| Orbital optimization | Number of macro-iterations and convergence tolerances |
| End-to-end performance | Total elapsed runtime and aggregate computational resources |

The computational breaking point may arise from quantum state-preparation quality, hardware noise, insufficient sampling of important configurations, growing selected-subspace dimensions, or unstable orbital optimization. Strong interfragment correlations and omitted electronic correlation outside the active space introduce additional physical limitations that cannot be resolved simply by increasing the quantum sampling budget.

The published calculations extend quantum-assisted fragment treatment beyond the practical FCI capability of the conventional LASSCF solver considered in the study. They do not establish universal resource scaling or a computational crossing point against optimized classical multireference methods.

## Comparative Evaluation and Crossing-Point Analysis

The most direct comparison for LASSQD is with methods that solve the same localized active-space electronic-structure problem using different fragment eigensolvers. In particular, classical LASSCF provides an FCI-based fragment reference where feasible, while localized active-space selected configuration interaction (LASSCI) provides a more direct comparison of classical and quantum-assisted determinant selection.

| Method | Computational Paradigm | Fragment Treatment | Principal Limitation |
| --- | --- | --- | --- |
| LASSCF | Classical computational | FCI fragment solvers | Fragment configuration-space growth |
| LASSCI | Classical computational | Classically selected determinant subspaces | Configuration selection and convergence |
| DMRG-SCF | Classical computational | Tensor-network electronic-state optimization | Required bond dimension and orbital optimization |
| LASSQD | Hybrid quantum-classical | Quantum-sampled determinants and classical diagonalization | Sampling, selected-space convergence, and hybrid overhead |

LASSCI and LASSQD share the objective of representing correlated fragment wavefunctions in reduced determinant spaces. Their principal difference is how candidate configurations are obtained: LASSCI relies on classical selection procedures, while LASSQD uses quantum measurements, configuration recovery, and carryover. Comparing these methods at matched selected-space dimensions and energy accuracy provides insight into the effectiveness of quantum-generated configuration distributions.

A fair comparison must use the same molecular Hamiltonian, basis set, localized fragment definitions, electron-number and spin sectors, and accuracy criteria. When LASSCF supplies the reference energy, the reported deviation,

$$
\Delta E
=
\left\lvert
E_{\mathrm{method}}
-
E_{\mathrm{LASSCF}}
\right\rvert,
$$

measures agreement with the classical localized-active-space calculation. It does not directly measure error relative to the exact full-molecule ground-state energy, since LASSCF itself restricts the correlated wavefunction through its fragment ansatz.

The published results show that LASSQD can attain accuracy comparable to classical LASSCI for selected molecular problems and subspace dimensions. Configuration carryover also improves self-consistent convergence in cases where independent stochastic sampling produces unstable energy and density-matrix updates. These findings demonstrate useful quantum-assisted configuration selection, but they do not determine whether quantum sampling is less expensive than optimized classical selection at equal physical accuracy.

### End-to-End Computational Cost

A complete performance comparison must include the full molecular workflow rather than only the quantum sampling stage. The total computational workload can be decomposed schematically as

$$
T_{\mathrm{LASSQD}}
=
T_{\mathrm{setup}}
+
T_{\mathrm{quantum}}
+
T_{\mathrm{recovery}}
+
T_{\mathrm{diagonalization}}
+
T_{\mathrm{orbital}}
+
T_{\mathrm{other}},
$$

where the terms represent molecular and circuit setup, quantum execution, configuration recovery and carryover, classical projected-space diagonalization, orbital optimization, and remaining overhead. These categories should be defined without double-counting operations that are shared between stages. When tasks execute concurrently, total elapsed wall-clock time should be measured directly rather than inferred from the sum of independently reported execution times.

For a family of fragment problems characterized by size $$N$$ and target accuracy $$\varepsilon$$, a computational crossing point between LASSQD and a classical alternative may be defined by

$$
T_{\mathrm{LASSQD}}(N^*,\varepsilon)
=
T_{\mathrm{classical}}(N^*,\varepsilon),
$$

where $$N^*$$ is the fragment size at which both approaches require equal end-to-end computational time. The comparison must use compatible physical and numerical accuracy requirements, and should specify the classical baseline, quantum hardware, and resource metric.

The most informative scaling studies relate quantum shot requirements to energy accuracy, selected-space dimension to fragment correlation strength, classical diagonalization cost to the number of retained determinants, and orbital convergence to carryover settings. Circuit resources and measurement overhead must also be measured as the fragment active space increases. Where possible, comparisons should include both LASSCI and tensor-network-based alternatives rather than relying solely on conventional fragment FCI as the classical baseline.

A smaller determinant space or access to a fragment beyond the reach of a particular FCI implementation does not establish a general quantum computational advantage. Such a claim requires evidence that quantum-assisted selection reduces complete computational cost relative to competitive classical algorithms at matched physical accuracy. No universal crossing point is established by the reported LASSQD results.

## Applied Problem Links

{% assign applied_problem = site.problems | where: "title", "Transition Metal Complexes" | first %}
{% if applied_problem %}
[Transition Metal Complexes]({{ applied_problem.url | relative_url }}) — Quantum-assisted localized active-space calculations of electronic energies and spin-state energetics in strongly correlated bimetallic, trimetallic, and iron-porphyrin systems.
{% else %}
**Transition Metal Complexes** — Quantum-assisted localized active-space calculations of electronic energies and spin-state energetics in strongly correlated bimetallic, trimetallic, and iron-porphyrin systems.
{% endif %}

## Reproducibility

Reproducing an LASSQD calculation requires the complete molecular specification, localized active-space partition, quantum sampling procedure, classical selected-subspace solver, and orbital-optimization settings. The molecular inputs must identify the nuclear geometry, charge and spin sector, orbital basis, frozen-core treatment, active electrons and orbitals, fragment assignments, and the initial localized orbital representation. Hamiltonian integrals or a reproducible procedure for constructing them are required to ensure that independent calculations solve the same electronic problem.

The quantum specification should include the LUCJ circuit definition, number of ansatz layers, parameter initialization or optimization procedure, fermion-to-qubit mapping, qubit layout, hardware backend, and compiled circuit resources. Measurement-shot counts, calibration information, and error-suppression settings must be associated with each reported calculation. Noiseless circuit simulations and physical hardware executions should be identified separately.

The SQD procedure must specify the construction of sampling batches, particle-number and spin-resolved configuration recovery, selected-subspace dimensions, classical eigensolver tolerances, and random seeds. For configuration carryover, the selection threshold, retained configuration criteria, and mapping between successive orbital bases are essential reproducibility parameters. Because carryover directly influences the fragment spaces supplied to later self-consistent-field iterations, its implementation must be documented alongside the quantum sampling protocol.

Orbital optimization should be reported through the number of macro-iterations, fragment solver convergence criteria, orbital-gradient tolerances, and the final molecular orbital coefficients. Fragment reduced density matrices, converged electronic energies, and numerical uncertainties should be retained where feasible. The calculation should also identify whether the reported result was obtained from ideal circuit simulation, noisy simulation, or quantum hardware.

The computational environment must include quantum processor architecture and calibration data, classical CPU or GPU resources, peak memory usage, software versions, and the measured execution times of the major workflow components. End-to-end elapsed time should be reported in addition to quantum processor time and classical diagonalization cost, allowing meaningful comparisons with fully classical electronic-structure methods.

The primary study identifies PySCF, `mrh`, Qiskit, Qiskit SQD, and `ffsim` as relevant software components. The precise versions, configuration files, and numerical scripts used for each benchmark should be documented. Verified project code and data repositories should be added to the YAML metadata when available.

## Primary References

Qiaohong Wang, Kevin J. Sung, Ruhee D'Cunha, Matthew R. Hermes, Tanvi Gujarati, Yukio Kawashima, Yu-Ya Ohnishi, Gavin O. Jones, Mario Motta, and Laura Gagliardi, “Localized sample-based quantum diagonalization for strongly correlated chemistry,” *Proceedings of the National Academy of Sciences* **123** (28), e2603914123 (2026). [DOI: 10.1073/pnas.2603914123](https://doi.org/10.1073/pnas.2603914123). [Published full text](https://pmc.ncbi.nlm.nih.gov/articles/PMC13367814/).

Qiaohong Wang et al., “Sample-based quantum diagonalization as parallel fragment solver for the localized active space self-consistent field method,” arXiv:2512.14936 (2025). [arXiv preprint](https://arxiv.org/abs/2512.14936). [HTML version](https://arxiv.org/html/2512.14936).

### Supporting Resources

[Qiskit SQD documentation](https://qiskit.github.io/qiskit-sqd/) provides information on the sample-based quantum diagonalization software used in related implementations. The specific numerical settings and software versions employed in the published LASSQD calculations should be obtained from the associated implementation and supplementary materials.