---
layout: solution
title: "Quantum Krylov Subspace Methods"
published: true
submitted_by: "Abel Carreras"
contributions_by: "Eric D. Switzer"
si_use: "Yes"

solution_classes:
  computational_paradigm: "Hybrid quantum–classical"
  method_family:
    - "Exact diagonalization/subspace"
    - "Quantum circuit"
  algorithmic_approach:
    - "Projection/subspace"
    - "Iterative"
    - "Stochastic"
  approximation_error_control:
    - "Variationally bounded"
    - "Heuristic/uncontrolled"
    - "Statistically estimated"
    - "Noise-limited"
  si_ml_involvement:
    - "None"

problems_applied:
  - "Electronic Structure of Large and Highly Correlated Molecular Systems"

summary: "A family of hybrid quantum-classical eigensolvers that construct reduced spaces from quantum-generated states or computational-basis configurations sampled from those states. Conventional quantum Krylov subspace diagonalization estimates projected Hamiltonian and overlap matrices, whereas sample-based Krylov methods diagonalize classically in a selected determinant basis. Accuracy and cost depend on reference-state overlap, subspace size, Hamiltonian simulation, measurement precision, numerical conditioning, and classical postprocessing."

solution_status:
  role: "Candidate"
  validation: "Partially validated"

code_repository: ""
data_repository: ""
---

## Algorithm Overview

Quantum Krylov subspace methods are hybrid quantum-classical algorithms for approximating low-energy eigenvalues and eigenstates of quantum many-body Hamiltonians. They replace an eigenvalue problem in a potentially exponential-dimensional Hilbert space with a smaller projected problem constructed using quantum-generated states. The quantum processor prepares states or supplies information about their configuration-space support, while classical numerical methods determine approximate eigenvalues and, where accessible, eigenvectors. Unlike conventional variational quantum eigensolvers, these methods need not repeatedly optimize a large parameterized circuit to minimize the energy; their principal approximation is the choice and numerical resolution of the reduced subspace.

The underlying idea is closely related to classical Krylov and Lanczos methods. Starting from a reference state, repeated applications of the Hamiltonian generate a space enriched in the spectral components already present in that reference. Quantum hardware cannot generally implement nonunitary Hamiltonian powers directly, so practical constructions commonly use Hamiltonian time evolution or related quantum transformations. The resulting states can capture low-energy information without explicitly storing the full many-electron wavefunction as a classical vector. Their usefulness nevertheless depends on the cost of quantum state generation and on whether the reduced space contains a sufficiently accurate representation of the desired eigenstate.

This Solution encompasses two closely related but computationally distinct approaches. In **conventional quantum Krylov subspace diagonalization (QKSD)**, quantum measurements estimate Hamiltonian and overlap matrices between generally nonorthogonal Krylov states. A classical generalized eigensolver then determines the Ritz energies. In **sample-based Krylov quantum diagonalization (SKQD)**, the quantum Krylov states are measured in a computational basis to identify important electronic configurations. Those configurations define an orthonormal determinant subspace, and the projected Hamiltonian is constructed and diagonalized classically. The former approach is limited principally by matrix-element estimation and conditioning; the latter shifts more of the cost toward configuration discovery and potentially large classical selected-subspace calculations.

The associated benchmark is **Electronic Structure of Large and Highly Correlated Molecular Systems**, for which the principal targets are the molecular electronic ground-state energy and the corresponding many-electron state. Low-energy excited states are accessible in some Krylov constructions, but they constitute supplementary observables unless an associated Problem explicitly includes them. The benchmark is concerned with whether these methods can deliver accurate ground-state estimates at useful end-to-end computational cost compared with competitive classical and quantum alternatives.

The methods are especially interesting for correlated systems where conventional exact diagonalization is infeasible and where a well-chosen initial state has appreciable overlap with the relevant low-energy eigenstates. Their limitations are equally important: limited initial-state overlap, costly coherent evolution, noisy matrix measurements, nearly linearly dependent Krylov vectors, and—in sample-based implementations—large selected determinant spaces can prevent efficient convergence. Consequently, neither a compact reduced eigenvalue problem nor successful execution on quantum hardware is sufficient, by itself, to establish a quantum computational advantage.

## Methodology and Execution

### Hamiltonian Representation and Krylov-State Construction

For molecular electronic structure, the nonrelativistic Hamiltonian in a finite spin-orbital basis is

$$
\hat{H}
=
\sum_{pq}h_{pq}a_p^\dagger a_q
+
\frac{1}{2}\sum_{pqrs}g_{pqrs}
a_p^\dagger a_q^\dagger a_s a_r
+
E_{\mathrm{nuc}},
$$

where $$a_p^\dagger$$ and $$a_p$$ are fermionic creation and annihilation operators, $$h_{pq}$$ and $$g_{pqrs}$$ are the one- and two-electron integrals under the specified convention, and $$E_{\mathrm{nuc}}$$ is the nuclear repulsion energy. In a conventional occupation-number encoding, $$M$$ spatial orbitals correspond to $$N_q=2M$$ spin-orbital qubits before symmetry reductions. Jordan–Wigner, Bravyi–Kitaev, and parity mappings are possible; the choice changes circuit implementation and measurement costs without changing the physical Hamiltonian being benchmarked.

The target eigenvalue equation is $$\hat{H}\lvert\Psi_n\rangle=E_n\lvert\Psi_n\rangle$$. Given a normalized reference state $$\lvert\phi_0\rangle$$, the conventional Hamiltonian-power Krylov space is

$$
\mathcal{K}_K(\hat{H},\lvert\phi_0\rangle)
=
\operatorname{span}\left\{
\lvert\phi_0\rangle,
\hat{H}\lvert\phi_0\rangle,
\ldots,
\hat{H}^{K-1}\lvert\phi_0\rangle
\right\}.
$$

Because direct preparation of $$\hat{H}^k\lvert\phi_0\rangle$$ is not generally a unitary circuit operation, real-time quantum Krylov methods commonly prepare

$$
\lvert\phi_k\rangle
=
e^{-i\hat{H}t_k}\lvert\phi_0\rangle,
\qquad
k=0,\ldots,K-1,
$$

with $$\hbar=1$$ and a specified time grid. For equally spaced times $$t_k=k\Delta t$$, the construction samples phase evolution at multiples of one time step. The accessible spectral information depends on the reference-state overlaps, total evolution-time range, time spacing, simulation accuracy, and spectral gaps. A very small time step can yield almost linearly dependent states, whereas longer evolution can improve spectral discrimination at the cost of deeper circuits and increased noise.

The reference state is often a Hartree–Fock determinant because it is straightforward to prepare in an occupation encoding. Multireference states, selected-CI approximations, shallow variational states, or states transferred from nearby molecular geometries may be preferable in strongly correlated regimes. The reference has a decisive role: if $$\langle\Psi_n\vert\phi_0\rangle=0$$, applying functions of the same Hamiltonian to $$\lvert\phi_0\rangle$$ cannot generate a component of eigenstate $$n$$. Nonzero overlap is necessary for the corresponding spectral component to be present, but does not by itself guarantee economical extraction of that component.

### Projected Matrices and the Generalized Eigenvalue Problem

The quantum-generated Krylov states are generally nonorthogonal. For a basis containing $$K$$ states, define the reduced Hamiltonian and overlap matrices by

$$
H_{ij}
=
\langle\phi_i\rvert\hat{H}\lvert\phi_j\rangle,
\qquad
S_{ij}
=
\langle\phi_i\vert\phi_j\rangle.
$$

An approximate eigenvector is represented as $$\lvert\widetilde\Psi_n\rangle=\sum_{j=0}^{K-1}c_j^{(n)}\lvert\phi_j\rangle$$. Stationarity of its Rayleigh quotient,

$$
E(\mathbf{c})
=
\frac{\mathbf{c}^\dagger H\mathbf{c}}
{\mathbf{c}^\dagger S\mathbf{c}},
$$

leads to the generalized eigenvalue problem

$$
H\mathbf{c}^{(n)}
=
E_n^{(K)}S\mathbf{c}^{(n)}.
$$

For exact matrix elements and a valid nonzero subspace of the original Hilbert space, the lowest Ritz value is variational: $$E_0^{(K)}\geq E_0$$. If the exact subspaces are nested, their lowest Ritz values are nonincreasing as additional states are added. This variational property concerns exact projected matrices; it does not automatically carry over to arbitrary statistically estimated and regularized matrices.

For equally spaced **exact** Hamiltonian evolution, the projected matrices have the structure

$$
S_{ij}
=
\langle\phi_0\rvert
 e^{-i(j-i)\hat{H}\Delta t}
\lvert\phi_0\rangle,
$$

$$
H_{ij}
=
\langle\phi_0\rvert
\hat{H}e^{-i(j-i)\hat{H}\Delta t}
\lvert\phi_0\rangle.
$$

Their dependence only on the time-index difference makes them Toeplitz matrices. Thus the number of distinct time-difference quantities can be $$\mathcal{O}(K)$$ rather than the generic $$\mathcal{O}(K^2)$$ matrix-element count. This reduction does not imply a corresponding reduction in total quantum measurements: estimating a given Hamiltonian matrix element can still require many circuits or shots, and approximate evolution or measurement protocols may not preserve the ideal structure automatically.

### Matrix-Element Measurement and Numerical Conditioning

Conventional QKSD must estimate the complex overlaps and Hamiltonian transition amplitudes required by the reduced matrices. Hadamard-test approaches use ancilla-assisted interference and controlled operations to access real and imaginary parts of these amplitudes. Such constructions can be general but may be costly in circuit depth and controlled time evolution. Other approaches exploit Hamiltonian symmetries, reference-state properties, multifidelity measurements, operator grouping, or measurement reuse to reduce circuit requirements under specific assumptions. The estimation protocol must therefore be identified for each benchmark result rather than treated as an interchangeable component.

The overlap matrix is a Gram matrix. For exact linearly independent Krylov states it is positive definite, but its smallest eigenvalues may become very small when the generated states are nearly dependent. A useful diagnostic is its condition number,

$$
\kappa(S)
=
\frac{\lambda_{\max}(S)}{\lambda_{\min}(S)},
$$

when $$S$$ is positive definite. Large $$\kappa(S)$$ indicates sensitivity of the generalized eigenvalue problem to matrix-element perturbations. Shot noise and hardware bias can make the estimated overlap matrix indefinite or the estimated Hamiltonian matrix non-Hermitian, so matrix symmetrization and subspace regularization may be necessary.

One standard regularization diagonalizes the estimated or symmetrized overlap matrix, $$S=U\Lambda U^\dagger$$, and retains only eigenvectors with $$\lambda_\alpha>\lambda_{\mathrm{cut}}$$. If $$U_r$$ and $$\Lambda_r$$ denote the retained eigenvectors and positive eigenvalues, the orthonormalized Hamiltonian is

$$
\widetilde H
=
\Lambda_r^{-1/2}U_r^\dagger H U_r\Lambda_r^{-1/2},
$$

and the reduced problem becomes $$\widetilde H\mathbf{v}=E\mathbf{v}$$. The resulting effective rank is

$$
K_{\mathrm{eff}}
=
\#\left\{\alpha:\lambda_\alpha(S)>\lambda_{\mathrm{cut}}\right\}.
$$

Regularization stabilizes the numerical problem but discards directions that may contain useful spectral information. Both $$K$$ and $$K_{\mathrm{eff}}$$ should be reported, together with the overlap spectrum and the sensitivity of the estimated energies to $$\lambda_{\mathrm{cut}}$$. A large nominal Krylov dimension is not evidence of a comparably large well-resolved spectral subspace.

### Sample-Based Krylov Diagonalization

Sample-based Krylov quantum diagonalization (SKQD) uses the same broad idea of generating informative Hamiltonian-evolved states, but changes how their information enters the reduced eigenvalue problem. Instead of estimating nonorthogonal transition matrices, the time-evolved states are measured in a computational basis. For state $$\lvert\phi_k\rangle$$, the ideal probability of observing configuration $$\mathbf{x}$$ is

$$
P_k(\mathbf{x})
=
\left\lvert\langle\mathbf{x}\vert\phi_k\rangle\right\rvert^2.
$$

The configurations observed at multiple evolution times are combined into a selected set $$\mathcal{S}=\bigcup_k\mathcal{S}_k$$. Their computational-basis vectors span the determinant space

$$
\mathcal{D}
=
\operatorname{span}\left\{
\lvert\mathbf{x}\rangle:\mathbf{x}\in\mathcal{S}
\right\}.
$$

The Hamiltonian is projected onto $$\mathcal{D}$$ and diagonalized classically using matrix elements between the selected determinants. For an electronic Hamiltonian, those matrix elements can be computed from the second-quantized integrals and the determinant excitation rules. Because distinct occupation configurations are orthonormal, SKQD does not normally require a measured Krylov-state overlap matrix. Its dominant classical problem can nevertheless be much larger than the small generalized eigenproblem of conventional QKSD.

The distinction between the two subspaces is fundamental. Conventional QKSD diagonalizes in the span of the prepared Krylov **states**; SKQD diagonalizes in the span of the sampled computational-basis **configurations**. The latter need not equal the former, even when its configurations were generated by measurements of those states. For an exact projected Hamiltonian on a valid selected determinant subspace, the lowest SKQD eigenvalue is variational, but its accuracy depends on recovering the configurations needed to approximate the target state.

Sampling efficiency is particularly sensitive to the distribution of ground-state amplitudes in the chosen measurement basis. A state concentrated on relatively few important determinants may be accessible through compact selected spaces, whereas a highly delocalized state may require many more measurements and determinants. Published SKQD convergence statements apply under specific assumptions about initial-state overlap and configuration-space structure; they are not general polynomial-runtime guarantees for arbitrary molecular Hamiltonians.

### Computational Platform and SI/ML Involvement

Both QKSD and SKQD are hybrid quantum-classical methods. The quantum component prepares the reference, implements Hamiltonian evolution or related transformations, and either estimates projected matrix elements or samples computational-basis configurations. Classical processing supplies the molecular Hamiltonian, fermion-to-qubit transformation, circuit compilation, measurement analysis, numerical regularization, and final eigensolver. In conventional QKSD the final dense generalized eigenproblem is often small; in SKQD the construction and sparse diagonalization of the selected determinant Hamiltonian can become a substantial classical workload.

Digital quantum circuits are the standard implementations described here. Analog evolution could be used to construct suitable states in a separately specified realization, but its control, calibration, and measurement resources would then require their own benchmark definitions. The standard algorithms do not require superintelligence or machine learning: their state generation, subspace construction, and linear algebra are numerical procedures rather than trained-model inference.

## Approximation and Error Control

The ideal approximation is the restriction of the eigenvalue problem to a finite subspace. Its accuracy depends on reference-state overlap, number and diversity of generated states, evolution-time grid, spectral gaps, and the ability of the selected subspace to represent the low-energy eigenvectors. Increasing the number of exact Krylov states can enrich a nested subspace, but may simultaneously introduce nearly dependent directions and greater sensitivity to numerical error. For time-evolution methods, inaccurate Hamiltonian simulation also modifies the prepared states. Product-formula errors, imperfect circuit compilation, and accumulated gate noise can therefore affect both the subspace and the projected matrices.

A convenient measure of the reference-state ground-state weight is

$$
p_0
=
\left\lvert\langle\Psi_0\vert\phi_0\rangle\right\rvert^2.
$$

A zero overlap excludes the target state from any subspace generated solely by functions of the Hamiltonian acting on that reference, while a small nonzero value can make its spectral component difficult to resolve. Changing the reference state is therefore a physical and computational design choice, not merely a numerical initialization detail. In near-degenerate systems, a multireference initial state or a benchmark of the relevant low-energy eigenspace can be more informative than a single-determinant comparison.

For conventional QKSD, finite measurements perturb the reduced matrices,

$$
\widetilde H=H+\delta H,
\qquad
\widetilde S=S+\delta S.
$$

Even small entrywise errors can produce large eigenvalue deviations when $$S$$ is poorly conditioned. Statistical uncertainty must consequently be assessed at the **eigenvalue** level rather than inferred solely from the uncertainty of individual matrix elements. Matrix symmetrization, positive-semidefinite regularization, and singular-value thresholding can improve stability, but they introduce additional choices that may bias or change the estimated Ritz values. Their numerical effects should be quantified by varying shot budgets, regularization thresholds, and the retained effective rank.

The lowest exact Ritz energy obeys the variational bound, but a generalized eigenvalue obtained from noisy matrices need not be an upper bound to the true ground-state energy. Specialized robust estimators may offer qualified guarantees under specific assumptions and confidence levels; such statements must be attributed to the particular estimation procedure. Similarly, in SKQD, accurate classical diagonalization yields a variational energy for the **selected** determinant space, not a guarantee that the space captures the full ground state.

SKQD introduces an additional sampling and selection error. Rare but physically important determinants can be missed, and the selected-space dimension can grow rapidly when the ground state is distributed over many configurations. Increasing measurement shots, sampling more Krylov times, changing the basis, or enlarging the selected space may improve the approximation, but each increases quantum or classical cost. Where relevant, particle-number and spin filtering must be enforced consistently so that the selected subspace corresponds to the intended molecular sector.

For a benchmark reference energy, the ground-state energy error is

$$
\Delta E
=
\left\lvert E_{\mathrm{method}}-E_{\mathrm{ref}}\right\rvert.
$$

When a compatible reference wavefunction is available, the state fidelity is

$$
F
=
\left\lvert
\langle\Psi_{\mathrm{ref}}\vert\Psi_{\mathrm{method}}\rangle
\right\rvert^2.
$$

Energy and fidelity should be evaluated separately because near-degenerate states can have similar energies but different electronic structures. For an exactly degenerate or intentionally grouped low-energy manifold, the overlap with the appropriate reference subspace is preferable to fidelity with one arbitrarily chosen eigenvector. On physical quantum hardware, direct fidelity estimation may itself be impractical and should not be claimed without an explicit evaluation protocol.

| Error Source | Origin | Validation Strategy |
| --- | --- | --- |
| Reference-state overlap | Weak or absent target eigenstate component | Compare reference preparations and overlap diagnostics |
| Krylov truncation | Insufficient spectral content in the generated basis | Increase times and subspace dimension |
| Hamiltonian simulation | Approximate time evolution and circuit noise | Tighten simulation error; compare ideal and noisy circuits |
| Matrix measurements | Finite-shot and hardware-biased estimates of $$H$$ and $$S$$ | Increase shots and propagate uncertainty to eigenvalues |
| Overlap conditioning | Nearly linearly dependent Krylov states | Inspect singular spectrum, $$\kappa(S)$$, and effective rank |
| Regularization | Discarded or altered subspace directions | Vary $$\lambda_{\mathrm{cut}}$$ and matrix-processing protocol |
| SKQD configuration sampling | Missing important determinants | Increase sampling and selected-space size |
| Classical eigensolver | Numerical residuals and finite precision | Tighten eigensolver tolerances |
| Molecular model | Finite orbital basis or incomplete active space | Perform consistent basis- and active-space convergence studies |

These validation procedures distinguish a mathematically accurate projected eigenvalue from a physically accurate molecular prediction. Neither an apparently converged generalized eigensolver nor a small selected-space residual alone establishes agreement with the exact many-electron state.

## Applied Problems

### Electronic Structure of Large and Highly Correlated Molecular Systems

Quantum Krylov subspace methods address the electronic ground-state eigenvalue problem for correlated molecular Hamiltonians. The principal benchmark outputs are the ground-state energy and, where a compatible reference is accessible, the quality of the approximate many-electron wavefunction. The associated Problem defines a **family** of molecular electronic-structure calculations rather than a fixed list of molecule-specific numerical instances. Accordingly, a valid numerical submission must specify the molecular geometry, basis, active electrons and orbitals, spin sector, initial state, and Krylov construction before quantitative accuracy or performance claims can be assessed.

For a system with an available FCI reference, the energy error at Krylov dimension $$K$$ is

$$
\Delta E_0^{(K)}
=
\left\lvert E_0^{(K)}-E_0^{\mathrm{FCI}}\right\rvert.
$$

The benchmark should investigate how this error depends on subspace dimension, maximum evolution time, measurement precision, overlap conditioning, and the effective rank retained by regularization. Ground-state fidelity and other electronic observables provide complementary evidence of wavefunction quality. For strongly correlated systems, multireference character, small spectral gaps, and the distribution of important configurations can substantially change the resources required by both QKSD and SKQD.

Conventional QKSD can also produce several low-energy Ritz values from one projected problem. For a reference spectrum, an optional excitation-energy error is

$$
\Delta\omega_n
=
\left\lvert
\left(E_n^{(K)}-E_0^{(K)}\right)
-
\left(E_n^{\mathrm{ref}}-E_0^{\mathrm{ref}}\right)
\right\rvert.
$$

Such excited-state calculations are useful additional validation of the subspace, but should not be conflated with the ground-state target unless excited energies are included explicitly in the corresponding Problem specification.

The primary QKSD reference of Cortes and Gray develops quantum Krylov methods for ground- and excited-state estimation, including quantum-chemistry-oriented numerical examples and strategies for reducing quantum circuit requirements. These investigations establish methodology and numerical behavior, not a general quantum advantage for large, highly correlated molecules.

The SKQD reference by Yu and collaborators reports a quantum-hardware demonstration for a **single-impurity Anderson model with 41 bath sites**, using **85 qubits** on an IBM Heron processor and circuits containing up to approximately **6,000 two-qubit gates**. The study compares its results with classical density matrix renormalization group calculations. This is evidence of sample-based Krylov feasibility in a substantial correlated fermionic model, but it is **not** a molecular electronic-structure result for the associated Problem. Any extrapolation to molecular chemistry requires additional Hamiltonian-specific accuracy and cost studies.

No specific large molecular Hamiltonian or corresponding measured quantum–classical crossing point is supplied in this Solution entry. The entry remains published, with validation classified as **partially validated**, because general algorithm demonstrations are available but a fully specified benchmark of the associated molecular Problem has not yet been reported here.

## Performance Metrics and Scaling

Quantum Krylov performance depends on the number of prepared states, circuit cost for Hamiltonian evolution, matrix-measurement precision, overlap conditioning, and classical processing. For conventional QKSD, a basis of $$K$$ states produces $$K\times K$$ Hamiltonian and overlap matrices, requiring $$\mathcal{O}(K^2)$$ classical storage. A dense generalized eigensolver typically costs $$\mathcal{O}(K^3)$$ operations, but its nominally small matrix size does not guarantee numerical stability or low quantum measurement overhead.

The generic number of projected matrix elements is $$\mathcal{O}(K^2)$$. Under equally spaced exact time evolution, Toeplitz structure reduces the number of distinct time differences to $$\mathcal{O}(K)$$; however, each quantity can involve multiple Hamiltonian terms and substantial shot requirements. For an unbiased estimate with finite variance, the standard error typically scales as $$N_{\mathrm{shots}}^{-1/2}$$, so additive precision $$\delta$$ often requires $$\mathcal{O}(\delta^{-2})$$ independent samples at fixed variance. Poor overlap conditioning can amplify matrix-element errors and require substantially more stringent precision than this elementary estimate might suggest.

The quantum time-evolution resources depend on the Hamiltonian decomposition, simulation algorithm, physical evolution times, requested simulation accuracy, and hardware connectivity. Longer times may improve spectral resolution but increase circuit duration and accumulated hardware error. There is no universal gate-depth scaling law that applies independently of the Hamiltonian or chosen simulation technique. Both logical simulation resources and compiled physical gate counts must therefore be reported.

For SKQD, the main classical dimension is not the number of evolved Krylov states but the number of unique sampled determinants retained after configuration filtering and selection. The complete fixed-electron-number FCI space has dimension

$$
D_{\mathrm{FCI}}
=
\binom{2M}{N_e},
$$

where $$M$$ is the number of spatial orbitals and $$N_e$$ the number of electrons. SKQD seeks a selected determinant space with $$D_{\mathrm{selected}}\ll D_{\mathrm{FCI}}$$, but this inequality alone does not quantify cost or accuracy. Classical Hamiltonian construction, sparse matrix-vector operations, eigensolver iterations, and memory can dominate when the selected space is large. A benchmark should report the number of sampled states, shots per state, unique configurations, final selected-space size, and classical diagonalization cost.

| Metric | Conventional QKSD | Sample-Based SKQD |
| --- | --- | --- |
| Quantum-generated data | Hamiltonian and overlap matrix elements | Computational-basis configurations |
| Primary reduced dimension | Krylov size $$K$$ and effective rank $$K_{\mathrm{eff}}$$ | Selected determinant count $$D_{\mathrm{selected}}$$ |
| Quantum measurement cost | Complex transition amplitudes and matrix elements | Samples across Krylov states and evolution times |
| Main numerical limitation | Conditioning and matrix-estimation uncertainty | Missing configurations and large classical selected spaces |
| Classical eigensolver | Small generalized Hermitian problem | Potentially large sparse determinant Hamiltonian |
| Primary accuracy measures | Ritz energy, fidelity, eigenvalue uncertainty | Selected-space energy, fidelity, sampling convergence |
| Shared resource requirements | State preparation, Hamiltonian evolution, qubits, gates, total wall-clock time | State preparation, Hamiltonian evolution, qubits, gates, total wall-clock time |

A practical computational breaking point may occur because state preparation has too little target-state overlap, time evolution exceeds hardware coherence, matrix measurements become prohibitively expensive, the effective overlap rank collapses, or the selected determinant basis grows beyond classical storage and eigensolver capacity. These limits depend on the molecular Hamiltonian, desired accuracy, circuit implementation, and quantum and classical hardware. They cannot be summarized by a universal maximum orbital count or Krylov dimension.

## Comparative Evaluation and Crossing-Point Analysis

Quantum Krylov methods should be compared with classical eigensolvers and alternative quantum algorithms using identical physical Hamiltonians, symmetry sectors, and target accuracies. Classical FCI or Lanczos provides an exact finite-basis reference where feasible; selected configuration interaction and DMRG provide additional competitive baselines for larger active spaces. ADAPT-VQE offers a contrasting quantum approach in which the trial state is built through adaptive operator selection and nonlinear parameter optimization, rather than through Krylov-state generation followed by a reduced eigenvalue problem.

| Method | Computational Paradigm | Representation | Principal Limitation |
| --- | --- | --- | --- |
| FCI / classical Lanczos | Classical computational | Full fixed-sector determinant vectors | Combinatorial state-vector size |
| Selected configuration interaction | Classical computational | Selected determinant expansion | Selection and convergence of configurations |
| DMRG | Classical computational | Tensor-network electronic state | Required bond dimension and orbital entanglement |
| ADAPT-VQE | Hybrid quantum-classical | Adaptively constructed variational circuit | Gradient measurements and repeated optimization |
| QKSD | Hybrid quantum-classical | Nonorthogonal quantum-generated Krylov states | Matrix estimation and overlap conditioning |
| SKQD | Hybrid quantum-classical | Sampled computational-basis determinant space | Sampling efficiency and classical diagonalization |
| Quantum phase estimation | Digital quantum | Coherent eigenphase estimation | Initial-state overlap and fault-tolerant resources |

The distinction between QKSD and SKQD is important for fair algorithm comparisons. QKSD directly projects onto the span of the generated states and requires estimating nonorthogonal transition matrices. SKQD instead converts measurements of those states into candidate determinants and constructs a generally different subspace. The absence of a noisy overlap matrix in SKQD may simplify the numerical problem, but the cost of configuration discovery and classical diagonalization must then be included. The two approaches should not be ranked solely by nominal Krylov dimension or by the number of quantum measurement settings.

Comparisons with ADAPT-VQE should account for the differing overheads: ADAPT-VQE repeatedly measures operator-pool gradients and reoptimizes circuit parameters, while QKSD uses evolution-based state generation and matrix estimation followed by generalized diagonalization. Comparisons with classical selected CI should test whether quantum sampling discovers useful determinant spaces more efficiently than classical selection methods when both are paired with comparably optimized projected-Hamiltonian solvers. Gains attributable to an improved classical eigensolver must be distinguished from gains attributable to quantum state generation or sampling.

The end-to-end time-to-solution for a method solving a problem family of size $$N$$ at physical accuracy $$\varepsilon$$ may be written as $$T_{\mathrm{solve}}(N,\varepsilon)$$. For QKSD, this includes molecular preprocessing, reference-state preparation, all evolution and matrix-estimation circuits, numerical regularization, and the final generalized eigensolver. For SKQD, it additionally includes computational-basis sampling, configuration filtering or recovery, selected Hamiltonian construction, and potentially substantial sparse diagonalization. Actual elapsed time and aggregate hardware resource consumption should be reported separately when stages execute concurrently.

A computational crossing point may be defined for a specified problem family and accuracy metric by

$$
T_{\mathrm{Krylov}}(N^*,\varepsilon)
=
T_{\mathrm{classical}}(N^*,\varepsilon),
$$

where both costs represent the complete workflow. The quantum-side method—QKSD or SKQD—and the classical baseline must be identified explicitly. Relevant studies should relate molecular size and correlation strength to energy error, ground-state fidelity, Krylov dimension, effective overlap rank, evolution depth, measurement shots, selected determinant count, peak memory, and complete runtime.

The published literature demonstrates that quantum-generated reduced subspaces can provide useful low-energy estimates, including a hardware demonstration of SKQD in a large correlated impurity model. It does not establish a general quantum computational advantage for molecular electronic structure. An advantage claim requires reproducible, matched-accuracy comparisons against competitive classical methods, with all quantum and classical computational stages accounted for.

## Applied Problem Links

{% assign applied_problem = site.problems | where: "title", "Electronic Structure of Large and Highly Correlated Molecular Systems" | first %}
{% if applied_problem %}
[Electronic Structure of Large and Highly Correlated Molecular Systems]({{ applied_problem.url | relative_url }}) — Ground-state energy and electronic wavefunction estimation using quantum Krylov-state projection or sample-based determinant selection.
{% else %}
**Electronic Structure of Large and Highly Correlated Molecular Systems** — Ground-state energy and electronic wavefunction estimation using quantum Krylov methods.
{% endif %}

## Reproducibility

Reproducing a quantum Krylov calculation requires the physical Hamiltonian, reference state, state-generation protocol, measurement method, numerical regularization, and end-to-end computational settings. The molecular specification should include atomic coordinates, charge, spin sector, orbital basis, active electrons and orbitals, frozen-core treatment, and the one- and two-electron integrals or their reproducible construction procedure. For independent accuracy assessment, the reference energy and reference state, where available, should be reported together with their convergence status.

The quantum representation should identify the fermion-to-qubit mapping, number and layout of qubits, symmetry tapering, reference-state circuit, Hamiltonian decomposition, and compilation settings. The Krylov construction must specify whether it uses Hamiltonian powers, real-time evolution, or another transformation; the number of states; evolution-time grid; simulation method and tolerance; and whether controlled operations are required. When the reference overlap is estimated, its evaluation protocol and uncertainty should be retained.

For conventional QKSD, report the measurement protocols for both $$H$$ and $$S$$, including shot allocation, complex-phase reconstruction, use of symmetries or grouping, and any matrix symmetrization. Retain the estimated matrices or sufficient measurement records to reconstruct them, together with uncertainties. Report the overlap eigenvalue spectrum, conditioning diagnostic, regularization threshold, effective retained rank, generalized eigensolver, and final eigenvalue residuals. The sensitivity of the result to these choices is part of the numerical validation.

For SKQD, report the evolution times used for sampling, shots per time, raw or processed bitstrings, symmetry and particle-number filtering, any configuration-recovery procedure, the number of unique configurations, the selected determinant set, Hamiltonian construction method, classical solver tolerances, and resulting energies. When a selected-space energy is claimed to be variational, the projected Hamiltonian and retained basis must correspond to the same specified physical Hamiltonian and symmetry sector.

For hardware executions, document the backend and calibration period, native gate set, qubit layout, compiled one- and two-qubit gate counts, circuit depths, number of ancillary qubits, shot budgets, noise-suppression and error-mitigation settings, quantum execution time, and queueing or orchestration overhead where relevant. Classical CPU/GPU resources, software versions, random seeds, memory consumption, postprocessing runtimes, and the measured total elapsed wall-clock time should also be supplied. Simulator-based studies and physical hardware results should be identified separately.

A complete benchmark dataset should contain the ground-state energy as a function of Krylov or selected-subspace dimension, final error and uncertainty, ground-state fidelity where available, overlap conditioning and effective ranks for QKSD, selected configuration counts for SKQD, quantum gate and measurement resources, classical diagonalization costs, and matched classical reference calculations. No verified repository for a specific molecular QKSD implementation is assigned in this entry. Relevant software ecosystems include Qiskit, Qiskit SQD for related sample-based electronic-structure workflows, PySCF, and classical numerical linear algebra libraries such as NumPy and SciPy; using these tools does not by itself identify the software used in a particular published calculation.

## Primary References

Cristian L. Cortes and Stephen K. Gray, “Quantum Krylov subspace algorithms for ground- and excited-state energy estimation,” *Physical Review A* **105**, 022417 (2022). [DOI: 10.1103/PhysRevA.105.022417](https://doi.org/10.1103/PhysRevA.105.022417). [arXiv preprint](https://arxiv.org/abs/2109.06868).

Jeffery Yu, Javier Robledo Moreno, Joseph T. Iosue, et al., “Quantum-Centric Algorithm for Sample-Based Krylov Diagonalization,” arXiv:2501.09702 (2025). [arXiv preprint](https://arxiv.org/abs/2501.09702).

Zongkang Zhang, Anbang Wang, Xiaosi Xu, and Ying Li, “Measurement-efficient quantum Krylov subspace diagonalisation,” *Quantum* **8**, 1438 (2024). [DOI: 10.22331/q-2024-08-13-1438](https://doi.org/10.22331/q-2024-08-13-1438).

### Supporting References

Ethan N. Epperly, Lin Lin, and Yuji Nakatsukasa, “A theory of quantum subspace diagonalization,” *SIAM Journal on Matrix Analysis and Applications* **43**, 1263–1290 (2022).

“Efficient strategies for reducing sampling error in quantum Krylov subspace diagonalization,” *Digital Discovery* **4**, 954–969 (2025). [DOI: 10.1039/D4DD00321G](https://doi.org/10.1039/D4DD00321G).

### Supporting Resources

[Quantum Krylov subspace algorithms — *Physical Review A*](https://doi.org/10.1103/PhysRevA.105.022417).

[Sample-based Krylov quantum diagonalization — arXiv](https://arxiv.org/abs/2501.09702).

[IBM Quantum SKQD learning resource](https://qiskit.qotlabs.org/learning/courses/quantum-diagonalization-algorithms/skqd).

[Qiskit SQD documentation](https://qiskit.github.io/qiskit-sqd/).
