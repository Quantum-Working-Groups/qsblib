---
layout: solution
title: "Adaptive Variational Quantum Eigensolver (ADAPT-VQE)"
published: true
submitted_by: "Abel Carreras"
contributions_by: "Eric D. Switzer"
si_use: "Yes"

solution_classes:
  computational_paradigm: "Hybrid quantum–classical"
  method_family:
    - "Variational/optimization"
    - "Quantum circuit"
  algorithmic_approach:
    - "Variational"
    - "Iterative"
  approximation_error_control:
    - "Variationally bounded"
    - "Heuristic/uncontrolled"
    - "Statistically estimated"
    - "Noise-limited"
  si_ml_involvement:
    - "None"

problems_applied:
  - "Electronic Structure of Large and Highly Correlated Molecular Systems"

summary: "A hybrid quantum-classical ground-state algorithm that adaptively constructs a variational quantum circuit by selecting operators according to measured energy gradients. By iteratively expanding and reoptimizing the ansatz, ADAPT-VQE seeks compact representations of correlated molecular wavefunctions while balancing energy accuracy, circuit depth, gradient-measurement overhead, and classical optimization cost."

solution_status:
  role: "Candidate"
  validation: "Partially validated"

code_repository: ""
data_repository: ""
---

## Algorithm Overview

The Adaptive Variational Quantum Eigensolver (ADAPT-VQE) is a hybrid quantum-classical algorithm for approximating ground-state electronic energies and wavefunctions. Unlike conventional variational quantum eigensolvers, which begin with a fixed parameterized circuit, ADAPT-VQE builds the ansatz incrementally. At each iteration, the algorithm evaluates the energy response associated with candidate excitation operators, appends a selected operator to the circuit, and reoptimizes the complete set of variational parameters. The resulting circuit structure is therefore determined by the molecular Hamiltonian and the evolving approximate electronic state rather than prescribed in advance.

The motivation is that a fixed ansatz may contain unnecessary operators in weakly correlated regimes yet remain insufficiently expressive in strongly correlated or multireference systems. Adaptive construction seeks to allocate circuit resources to the electronic excitations that are most relevant at the current stage of optimization. This can produce compact, problem-dependent representations of correlated ground states, although the additional operator-gradient measurements and repeated optimization steps introduce costs absent from a single fixed-ansatz optimization.

The original method employs a pool of anti-Hermitian fermionic excitation generators and selects the candidate having the largest magnitude of its energy derivative at the current state. After each selection, the new parameter is initialized so that the previously optimized state remains accessible, and all circuit parameters are optimized again. The procedure terminates according to a specified operator-pool gradient criterion or a practical resource limit. A small gradient within the chosen pool, however, is not an exact-ground-state certificate: it establishes approximate stationarity only with respect to the tested generator directions.

ADAPT-VQE is particularly relevant to molecular bond dissociation and strongly correlated electronic structures, where the importance of electronic configurations changes with geometry and a single reference determinant may become inadequate. Its performance depends on the reference state, operator-pool completeness, adaptive operator ordering, circuit compilation, gradient precision, and classical optimization. The primary publication demonstrates the approach numerically for LiH, BeH2, and linear H6. Those demonstrations establish the usefulness of adaptive operator selection in selected molecular systems, but do not establish efficient convergence or a quantum computational advantage for arbitrary large active spaces.

The method uses quantum computation for state preparation and expectation-value estimation, together with classical computation for electronic Hamiltonian construction, operator selection, and parameter optimization. It does not require machine learning or superintelligence; its adaptivity follows from explicitly evaluated energy derivatives.

## Methodology and Execution

### Electronic Hamiltonian and Variational Representation

The target molecular electronic structure is described by a nonrelativistic many-electron Hamiltonian in a finite spin-orbital basis,

$$
\hat{H}
=
\sum_{pq} h_{pq}a_p^\dagger a_q
+
\frac{1}{2}\sum_{pqrs}g_{pqrs}
 a_p^\dagger a_q^\dagger a_s a_r
+
E_{\mathrm{nuc}},
$$

where $$a_p^\dagger$$ and $$a_p$$ are fermionic creation and annihilation operators, $$h_{pq}$$ and $$g_{pqrs}$$ are the one- and two-electron integrals under the specified convention, and $$E_{\mathrm{nuc}}$$ is the nuclear repulsion energy. The desired state is the lowest-energy eigenstate of this Hamiltonian within the electron-number and symmetry sector selected for the calculation.

ADAPT-VQE prepares a normalized parameterized state,

$$
\lvert\Psi(\boldsymbol{\theta})\rangle
=
U(\boldsymbol{\theta})\lvert\Phi_{\mathrm{ref}}\rangle,
$$

and minimizes the corresponding expectation value,

$$
E(\boldsymbol{\theta})
=
\langle\Psi(\boldsymbol{\theta})\rvert
\hat{H}
\lvert\Psi(\boldsymbol{\theta})\rangle.
$$

For exact expectation values and ideal state preparation, the Rayleigh–Ritz principle ensures that every trial-state energy is an upper bound to the exact ground-state energy of the same Hamiltonian and physical sector. This guarantee concerns the energy of the actual normalized trial state; finite sampling, noise processing, and other imperfect estimators need not obey the bound for their reported numerical values.

A conventional spin-orbital occupation encoding uses $$N_q=2M$$ qubits for $$M$$ spatial orbitals before symmetry tapering or other reductions. Fermionic operators may be mapped to qubit operators using Jordan–Wigner, Bravyi–Kitaev, or parity-based transformations. The mapping, reference-state preparation, and circuit implementation affect both the resource requirements and the physical symmetries preserved by the calculation.

A Hartree–Fock determinant is a common initial state because it can be prepared efficiently in an occupation encoding. In a strongly correlated regime, however, the overlap between a single determinant and the target state can be small. Multireference approximations, classically prepared correlated states, or optimized states from nearby molecular geometries may be used as alternative references, provided that the additional preparation cost is included in performance comparisons.

### Operator Pool and Adaptive Selection

The ansatz is generated from an operator pool

$$
\mathcal{P}
=
\{\hat{A}_1,\ldots,\hat{A}_{P}\},
\qquad
\hat{A}_\mu^\dagger=-\hat{A}_\mu,
$$

whose anti-Hermitian elements generate unitary transformations $$e^{\theta\hat{A}_\mu}$$. In the original fermionic formulation, the pool is constructed from spin-complemented generalized single and double excitations. Representative anti-Hermitian generators are

$$
\hat{A}_{pq}
=
a_p^\dagger a_q-a_q^\dagger a_p,
$$

and

$$
\hat{A}_{pqrs}
=
a_p^\dagger a_q^\dagger a_s a_r
-
a_r^\dagger a_s^\dagger a_q a_p.
$$

These expressions indicate the excitation structure; the implemented spin adaptation, allowed orbital indices, symmetries, and removal of redundant generators must be specified for each calculation. Such choices determine which states can be reached by the adaptive circuit, the size of the operator pool, and the cost of the candidate-gradient measurements. Pool operators need not be removed after selection, so an operator may appear more than once in the final sequence.

After $$K$$ adaptive iterations, the prepared state has the form

$$
\lvert\Psi_K\rangle
=
e^{\theta_K\hat{A}_{\mu_K}}
\cdots
e^{\theta_1\hat{A}_{\mu_1}}
\lvert\Phi_{\mathrm{ref}}\rangle.
$$

For a candidate operator $$\hat{A}_\mu$$ appended to the current optimized state, define the directional energy response

$$
E_\mu(\alpha)
=
\langle\Psi_K\rvert
 e^{-\alpha\hat{A}_\mu}
 \hat{H}
 e^{\alpha\hat{A}_\mu}
\lvert\Psi_K\rangle.
$$

The gradient at the unperturbed state is

$$
g_\mu^{(K)}
=
\left.\frac{\partial E_\mu(\alpha)}{\partial\alpha}\right|_{\alpha=0}
=
\langle\Psi_K\rvert
[\hat{H},\hat{A}_\mu]
\lvert\Psi_K\rangle.
$$

ADAPT-VQE selects the generator associated with the largest absolute gradient,

$$
\mu^*
=
\operatorname*{arg\,max}_{\mu\in\mathcal{P}}
\lvert g_\mu^{(K)}\rvert.
$$

This is a local sensitivity criterion rather than a prediction of the largest achievable energy reduction following full reoptimization. The gradient estimates may be evaluated by measuring the Pauli terms of the commutators or by other compatible quantum estimation procedures. Their statistical precision is consequential because gradients close in magnitude may be ranked incorrectly under finite sampling or hardware noise.

After selection, the new unitary is appended on the left of the existing ansatz,

$$
U_{K+1}
=
e^{\theta_{K+1}\hat{A}_{\mu^*}}U_K.
$$

Initializing $$\theta_{K+1}=0$$ reproduces the previous circuit state and permits reuse of earlier optimized parameters as an initial guess. A classical optimizer then minimizes the energy with respect to all $$K+1$$ parameters. The original numerical work used BFGS; other derivative-based, stochastic, or derivative-free optimizers are possible, but their convergence tolerances and measurement costs should be reported independently.

### Convergence and Computational Execution

A common ADAPT-VQE stopping criterion is the Euclidean norm of the pool-gradient vector,

$$
\lVert\mathbf{g}^{(K)}\rVert_2
=
\sqrt{\sum_{\mu=1}^{P}\lvert g_\mu^{(K)}\rvert^2}
<
\varepsilon_{\mathrm{grad}}.
$$

A small value indicates that the present state is approximately stationary under the tested pool directions. It does not rule out a lower-energy state accessible through a different operator sequence, a generator absent from the pool, or a change too large to be described by a local gradient. In a practical calculation, the gradient threshold must be selected in light of the uncertainties of the measured gradients and the target energy accuracy. Alternative stopping rules based on energy changes, the largest individual gradient, maximum circuit depth, or shot budget should be identified explicitly.

An implementation begins by constructing the molecular Hamiltonian, choosing its fermion-to-qubit mapping, preparing a reference state, and defining a symmetry-compatible operator pool. It then alternates between measuring candidate gradients, selecting and appending a generator, and reoptimizing the complete circuit. The final output consists of the optimized energy, selected operator sequence, circuit parameters, convergence diagnostics, and target electronic observables. When wavefunction references are available, the result can also be assessed through overlaps or fidelity metrics.

Quantum hardware is used for the state preparation and measurements required by energy and gradient estimation. Classical processors construct the Hamiltonian and pool, transform or group the observables, choose the adaptive operators, optimize the variational parameters, and process the results. The original 2019 demonstrations were classical numerical simulations of quantum circuits; their resource counts should not be presented as experimentally measured execution costs on a physical quantum processor.

## Approximation and Error Control

The central algorithmic approximation is the finite adaptive ansatz. Even when every variational parameter is optimized perfectly, a truncated sequence of operators may fail to contain the target ground state. Enlarging the ansatz increases the accessible variational family if existing parameters can be retained and the new angle initialized to zero, but does not guarantee efficient convergence with circuit size. The effectiveness of the expansion also depends on the starting state, operator ordering, and whether the chosen pool connects the relevant physical states.

The operator pool is a separate source of systematic limitation. If its generators fail to span the directions needed to approach the target state, a small pool-gradient norm may coexist with a substantial energy error. Symmetry restrictions can be beneficial when they preserve the intended physical sector, but overly restrictive or redundant pools may prevent efficient exploration of the correlated electronic state. Completeness claims should therefore be made for the specific pool and Hilbert-space sector, not for ADAPT-VQE in general.

For an ideal normalized circuit state, the calculated expectation value satisfies

$$
E_{\mathrm{ADAPT}}
=
\langle\Psi_{\mathrm{ADAPT}}\rvert\hat{H}\lvert\Psi_{\mathrm{ADAPT}}\rangle
\geq E_0.
$$

This is a variational upper bound, not an upper bound on the magnitude of the energy error. A finite-shot estimate may fluctuate below the exact ground-state energy, and hardware or error-mitigation procedures can introduce systematic bias into reported expectation values. Noise also affects the selected generator sequence by perturbing the estimated gradients, potentially increasing circuit depth or terminating the adaptive procedure prematurely.

Classical parameter optimization introduces errors distinct from ansatz expressivity and gradient estimation. The reoptimization problem is nonlinear and may converge to local minima or terminate before the best accessible energy is found. The sequential construction offers a useful continuation strategy, but it does not eliminate optimizer dependence. Reporting the parameter-optimization history and testing alternative initializations or optimization tolerances can help assess this source of error.

Energy accuracy should be evaluated relative to a reliable reference for the same finite-basis Hamiltonian and physical sector,

$$
\Delta E
=
\left\lvert
E_{\mathrm{ADAPT}}-E_{\mathrm{ref}}
\right\rvert.
$$

Where the reference wavefunction is known, the squared overlap

$$
F
=
\left\lvert
\langle\Psi_{\mathrm{ref}}\vert\Psi_{\mathrm{ADAPT}}\rangle
\right\rvert^2
$$

provides an independent measure of state accuracy. Small energy errors do not necessarily imply large fidelity when several electronic states are nearly degenerate. For a degenerate target manifold, overlap with the corresponding eigenspace is preferable to overlap with a single arbitrary reference eigenvector.

The main error sources and their validation strategies are summarized below.

| Error Source | Origin | Validation Approach |
| --- | --- | --- |
| Operator-pool restriction | Missing or unsuitable generators | Compare pool definitions and symmetry-sector reachability |
| Finite adaptive ansatz | Too few selected generators | Increase ansatz length and monitor energy and fidelity |
| Gradient estimation | Finite shots and measurement bias | Increase measurement precision and repeat selections |
| Classical reoptimization | Local minima and incomplete convergence | Tighten optimizer tolerances and test initializations |
| Hardware noise | Gate, decoherence, and readout errors | Compare ideal, noisy, and hardware measurements |
| Molecular basis | Finite orbital representation | Perform basis-set convergence studies |
| Active-space restriction | Omitted correlated orbitals | Increase active space and compare electronic observables |

The benchmark should distinguish uncertainty in the measured energy from error relative to the true ground state. Repeated hardware runs characterize statistical variability, whereas reference comparisons and convergence studies are required to assess systematic algorithmic bias. No general polynomial resource bound is established for reaching a prescribed ground-state accuracy in arbitrary molecular Hamiltonians.

## Applied Problems

### Electronic Structure of Large and Highly Correlated Molecular Systems

ADAPT-VQE is a candidate Solution for the Problem **Electronic Structure of Large and Highly Correlated Molecular Systems**, whose principal targets are ground-state electronic energies and, where classically accessible, wavefunction fidelities. The method provides a flexible operator-based ansatz for finite fermionic Hamiltonians, with particular interest in regimes where several configurations contribute substantially to the ground state. Its effectiveness should be assessed over a range of active-space sizes, spin sectors, correlation strengths, and molecular geometries.

The original publication demonstrates adaptive ansatz construction for LiH, BeH2, and linear H6, including molecular geometries that test bond stretching and increasingly correlated electronic states. These are algorithm-validation examples from the literature rather than a specified numerical dataset in the associated general Problem entry. The published comparisons illustrate that ADAPT-VQE can produce compact ansätze and favorable energy convergence relative to the fixed UCCSD construction tested in those cases, but they do not establish corresponding performance for unspecified large molecular Hamiltonians.

Linear H6 is especially relevant because stretching the chain increases multireference character and reduces the adequacy of a single Hartree–Fock determinant. The adaptive procedure selects a problem-dependent sequence of fermionic excitation generators, seeking to represent the correlated state without committing to every operator in a fixed excitation ansatz. The number of required generators, optimization steps, and measurements must nevertheless be determined for each Hamiltonian rather than inferred from the small-system demonstrations.

For validation instances where full configuration interaction is feasible, the ADAPT-VQE energy should be compared against the FCI energy of the same Hamiltonian and, if available, the wavefunction overlap should be evaluated using compatible orbital and symmetry conventions. The benchmark should report energy convergence versus adaptive iteration, pool-gradient norms, selected operator sequences, compiled circuit resources, and the cost of parameter optimization. At larger active-space sizes, selected CI, DMRG, or another carefully converged classical method may provide the best available reference, but its own uncertainty should be identified.

A useful aspirational electronic-energy target is approximately 1 kcal/mol, or 1.59 mHa using $$1\ \mathrm{Ha}\approx627.5095\ \mathrm{kcal/mol}$$. This absolute-energy threshold should not be confused with chemical accuracy in molecular energy differences such as reaction or binding energies. The additional resources required to reach a given threshold, and whether the same ansatz accurately reproduces electronic observables beyond the energy, are central questions for benchmark submissions.

This entry does not yet contain a standardized large-molecule ADAPT-VQE dataset for the associated Problem. Its role is to define the method and the validation criteria required to compare future calculations without treating small-system demonstrations as evidence of a general quantum advantage.

## Performance Metrics and Scaling

The resources consumed by ADAPT-VQE are determined by the electronic active space, operator-pool size, number of adaptive iterations, circuit depth, precision of gradient measurements, and cost of repeated variational optimization. Compared with fixed-ansatz VQE, the principal additional workload comes from evaluating candidate gradients throughout the adaptive procedure; the potential benefit is a smaller circuit at the target physical accuracy.

For a conventional generalized fermionic singles-and-doubles pool, the number of candidate generators can grow as

$$
P=\mathcal{O}(N_q^4),
$$

before spin and spatial symmetry reductions, elimination of redundant operators, or other pool-specific simplifications. This is an upper-order characterization of that particular operator construction rather than a universal scaling law for all ADAPT variants. More compact qubit-operator pools may reduce pool size or the cost of individual generators, but can also change the symmetry and reachability properties of the ansatz.

If the algorithm selects $$K$$ operators from a pool of $$P$$ candidates and evaluates every candidate at every adaptive step, the number of gradient estimations scales schematically as

$$
N_{\mathrm{grad}}=\mathcal{O}(KP).
$$

This count does not equal the number of quantum circuits or total shots, since each gradient may require measurements of many Pauli terms and measurements may be grouped or reused. For independent sampling with bounded observable variance, the uncertainty of a mean typically decreases as $$N_{\mathrm{shots}}^{-1/2}$$, implying a nominal $$\mathcal{O}(\delta^{-2})$$ shot dependence for fixed-variance estimation to additive precision $$\delta$$. The constants, covariance structure, and desired confidence level remain important, particularly when candidate gradients are close in magnitude.

Each selected operator generally increases circuit depth. A useful accounting expression is

$$
D_{\mathrm{circuit}}
\approx
D_{\mathrm{ref}}+\sum_{k=1}^{K}D_k,
$$

where $$D_{\mathrm{ref}}$$ is the compiled depth of reference preparation and $$D_k$$ is the compiled contribution of operator $$k$$ under the chosen architecture. This is a schematic resource estimate; transpiler optimizations, operator cancellation, and routing can alter the compiled result. Ansatz length alone is therefore not an adequate measure of circuit cost.

The performance metrics should be reported together with the physical accuracy they support.

| Metric | Purpose |
| --- | --- |
| Active-space size and qubit count | Specify the electronic Hamiltonian and encoding resources |
| Operator-pool size and composition | Define candidate-gradient measurement workload |
| Adaptive iterations and ansatz length | Track growth of the variational representation |
| Energy and gradient measurements | Quantify measurement cost and precision |
| Compiled gate counts and circuit depth | Characterize physical quantum execution requirements |
| Optimizer iterations | Measure classical reoptimization overhead |
| Energy error and wavefunction fidelity | Assess electronic-state accuracy |
| Quantum execution time and shots | Measure QPU resource consumption |
| Classical time and memory | Include Hamiltonian preprocessing and optimization |
| End-to-end elapsed time | Compare complete workflows at matched accuracy |

The total computational work may be represented as

$$
W_{\mathrm{ADAPT}}
=
W_{\mathrm{setup}}
+
\sum_{k=1}^{K}
\left(W_{\mathrm{gradient}}^{(k)}+W_{\mathrm{optimization}}^{(k)}\right)
+
W_{\mathrm{final}},
$$

where the terms denote setup, adaptive gradient estimation, parameter reoptimization, and final measurement or validation. Actual wall-clock time must be measured separately when hardware and classical work overlap or when queueing, compilation, and calibration introduce additional delays.

The practical breaking point depends on the molecular state and the hardware as well as the nominal circuit size. Large operator pools can make gradient screening expensive; deep selected circuits amplify noise; repeated reoptimization increases measurement cost; and weak or statistically unresolved gradients can obscure which operator should be selected. The published small-molecule simulations do not establish a universal orbital-count threshold at which the method becomes intractable. Resource limits should instead be defined for a specified Hamiltonian, pool, hardware configuration, and accuracy requirement.

## Comparative Evaluation and Crossing-Point Analysis

ADAPT-VQE should be compared both with fixed-ansatz variational quantum eigensolvers and with competitive classical electronic-structure algorithms. Its central algorithmic claim is not that adaptive circuits are always smaller, but that problem-dependent operator selection can sometimes reproduce the target state more efficiently than a predetermined excitation sequence. Whether the reduction in circuit size compensates for operator-gradient measurements and repeated optimization is an empirical performance question.

| Method | Computational Paradigm | Representation | Principal Limitation |
| --- | --- | --- | --- |
| Full Configuration Interaction | Classical computational | Complete determinant space | Combinatorial configuration-space growth |
| Selected Configuration Interaction | Classical computational | Selected determinant expansion | Configuration selection and convergence |
| DMRG | Classical computational | Tensor-network wavefunction | Bond dimension and orbital entanglement |
| Fixed UCCSD-VQE | Hybrid quantum–classical | Predetermined excitation circuit | Expressivity and circuit resources |
| ADAPT-VQE | Hybrid quantum–classical | Adaptively selected excitation circuit | Gradient measurements and optimization |
| Qubit-ADAPT-VQE | Hybrid quantum–classical | Adaptively selected qubit operators | Pool design, symmetry, and compilation |
| Quantum Krylov Methods | Hybrid quantum–classical | Quantum-generated projected subspace | Matrix estimation and numerical conditioning |

The comparison with fixed UCCSD-VQE should hold the molecular Hamiltonian, symmetry sector, reference state, and target error fixed while recording the number of optimized parameters, compiled gate counts, circuit depth, energy and gradient evaluations, total shots, and elapsed time. A shorter ADAPT ansatz may reduce the cost of executing an individual energy measurement, but the full adaptive search can still be more expensive when the operator pool is large or many iterations are necessary.

Comparison with classical selected CI and DMRG addresses the physical efficiency of alternative wavefunction representations. Selected CI builds a linear subspace of determinants, whereas ADAPT-VQE generates a nonlinear manifold through products of unitaries. DMRG instead compresses the wavefunction into a tensor-network representation whose cost depends on orbital entanglement. The appropriate benchmark compares energy error, fidelity where available, memory, and complete computational cost, not merely the number of determinants, circuit operators, or tensor-network bonds.

Qubit-ADAPT-VQE retains the adaptive-gradient framework but uses a different pool of qubit operators. Such operators can be cheaper to implement in selected architectures, although their symmetry properties and effective reachable states may differ from a fermionic excitation pool. Published comparisons report reduced circuit depths in particular molecular examples; those improvements should be associated with the specified pool and compiled circuit resources rather than attributed to every variant of adaptive VQE.

For a family of molecular Hamiltonians characterized by active-space size $$N$$ and target error $$\varepsilon$$, a prospective time-to-solution crossing point with a classical method can be defined through

$$
T_{\mathrm{ADAPT}}(N^*,\varepsilon)
=
T_{\mathrm{classical}}(N^*,\varepsilon).
$$

Both costs must account for the complete workflow, including state preparation, all operator-gradient measurements, parameter optimization, energy estimation, classical preprocessing, and any hardware error treatment. At a minimum, the comparison should quantify energy error versus circuit depth, ansatz length versus active-space size, gradient-measurement cost versus pool size, and end-to-end runtime at matched physical accuracy. Wavefunction fidelity provides a valuable additional criterion where reference states are available.

The original numerical demonstrations show favorable ansatz compactness and convergence for selected molecular Hamiltonians. They do not establish a general quantum computational advantage over optimized classical methods or a universal crossing point in large, strongly correlated active spaces. Such conclusions require reproducible performance data and explicit comparison assumptions.

## Applied Problem Links

{% assign applied_problem = site.problems | where: "title", "Electronic Structure of Large and Highly Correlated Molecular Systems" | first %}
{% if applied_problem %}
[Electronic Structure of Large and Highly Correlated Molecular Systems]({{ applied_problem.url | relative_url }}) — Adaptive variational ground-state energy and wavefunction calculations for strongly correlated molecular Hamiltonians.
{% else %}
**Electronic Structure of Large and Highly Correlated Molecular Systems** — Adaptive variational quantum circuits for correlated molecular ground-state calculations.
{% endif %}

## Reproducibility

Reproducing an ADAPT-VQE calculation requires both the physical electronic-structure specification and the complete adaptive optimization record. The molecular inputs should include nuclear coordinates, charge, electron count, spin sector, orbital basis, active space, treatment of frozen orbitals, and either the Hamiltonian integrals or a procedure for constructing them. Reference energies and wavefunctions should be identified where available, together with their convergence status.

The quantum representation must specify the fermion-to-qubit mapping, any qubit tapering, initial state and reference-preparation circuit, operator-pool definition, spin or particle-number constraints, and the resulting selected sequence. The variational record should contain every selected generator, its initial and optimized parameter, the candidate gradients and their uncertainties, the stopping rule, and the classical optimizer and convergence settings. This information is necessary because different operator pools or initializations can produce different adaptive circuits even for the same Hamiltonian.

For hardware calculations, report the processor backend, qubit layout, native gate set, compiled gate counts and depths, shot allocations, error-mitigation procedure, relevant calibration data, and quantum execution times. Classical resources should include the software versions, circuit compilation settings, numerical precision, processor resources, optimization history, and total elapsed runtime. Random seeds and repeated-run statistics should be supplied when selection or optimization is stochastic.

Numerical benchmark data should retain the energy and pool-gradient norm at each adaptive iteration, selected operator sequence, final circuit parameters, observable uncertainties, circuit resources, and comparisons against fixed VQE and classical reference calculations. Where reference wavefunctions are available, fidelity should be reported using compatible orbital bases and physical symmetry sectors. For multiple molecular geometries, each calculation should identify its geometry-specific initial state and any parameter or circuit reuse from neighboring points.

The original numerical study used Psi4 for molecular electronic-structure calculations, OpenFermion and OpenFermion-Psi4 for fermionic Hamiltonian handling, SciPy for numerical optimization, and study-specific adaptive-selection software. It reported that numerical simulation code and data were available upon reasonable request. No verified public repository for the original implementation is specified in this entry; alternative public implementations should identify their differences in operator pools, optimization, and compilation.

## Primary References

Harper R. Grimsley, Sophia E. Economou, Edwin Barnes, and Nicholas J. Mayhall, “An adaptive variational algorithm for exact molecular simulations on a quantum computer,” *Nature Communications* **10**, 3007 (2019). [DOI: 10.1038/s41467-019-10988-2](https://doi.org/10.1038/s41467-019-10988-2).

Ho Lun Tang, V. O. Shkolnikov, George S. Barron, Harper R. Grimsley, Nicholas J. Mayhall, Edwin Barnes, and Sophia E. Economou, “Qubit-ADAPT-VQE: An Adaptive Algorithm for Constructing Hardware-Efficient Ansätze on a Quantum Processor,” *PRX Quantum* **2**, 020310 (2021). [DOI: 10.1103/PRXQuantum.2.020310](https://doi.org/10.1103/PRXQuantum.2.020310).

Harper R. Grimsley, George S. Barron, Edwin Barnes, Sophia E. Economou, and Nicholas J. Mayhall, “Adaptive, problem-tailored variational quantum eigensolver mitigates rough parameter landscapes and barren plateaus,” *npj Quantum Information* **9**, 19 (2023). [DOI: 10.1038/s41534-023-00681-0](https://doi.org/10.1038/s41534-023-00681-0).

### Supporting Resources

The [original ADAPT-VQE preprint](https://arxiv.org/abs/1812.11173), [OpenFermion documentation](https://quantumai.google/openfermion), and [Psi4 documentation](https://psicode.org/) provide additional background on the algorithm and associated software infrastructure.