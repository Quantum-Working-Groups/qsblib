---
layout: solution
title: "Bootstrap Embedding with Full Configuration Interaction (BE-FCI)"
published: true
submitted_by: "Eric D. Switzer"
si_use: "Yes"

solution_classes:
  computational_paradigm: "Classical computational"
  method_family:
    - "Exact diagonalization/subspace"
    - "Variational/optimization"
  algorithmic_approach:
    - "Deterministic"
    - "Iterative"
  approximation_error_control:
    - "Heuristic/uncontrolled"
  si_ml_involvement:
    - "None"

problems_applied:
  - "Electronic Structure of Moderate-Size Molecules"

summary: "A classical quantum embedding method that partitions molecular systems into overlapping fragments with mean-field-derived bath orbitals. Each embedded fragment is solved using full configuration interaction, while self-consistent one-particle reduced-density-matrix matching and chemical-potential optimization approximate the electronic correlations of the complete molecular system."

solution_status:
  role: "Reference"
  validation: "Partially validated"

code_repository: "https://github.com/oimeitei/quemb"
data_repository: "https://github.com/JoelHBierman/qbe_sqd_data"
---

## Algorithm Overview

Bootstrap Embedding with Full Configuration Interaction (BE-FCI) is a classical electronic-structure method that approximates molecular ground-state energies by solving correlated electronic problems in smaller, overlapping fragments. It combines local fragment descriptions with mean-field-derived bath orbitals and a self-consistent procedure that reconciles the one-particle density matrices of neighboring embedded regions. The objective is to recover the energetics of a larger molecule without constructing or diagonalizing its complete many-electron Hamiltonian in the full configuration space.

Full configuration interaction (FCI) provides an exact solution within a specified finite orbital basis and electronic symmetry sector, up to numerical precision, but the number of electronic configurations grows combinatorially with system size. Bootstrap embedding replaces this single large calculation with several embedded fragment problems. The bath orbitals represent the entanglement between each fragment and its environment present in a Hartree–Fock reference state, while a correlated FCI solver determines the electronic state within the resulting fragment–bath space.

The distinguishing feature of bootstrap embedding is the use of overlapping fragments. Orbitals close to the boundary of one fragment can appear in the more reliable central region of a neighboring fragment, allowing their electronic descriptions to be compared. Self-consistent one-body embedding potentials are adjusted to reduce discrepancies between the corresponding one-particle reduced density matrices, and a chemical potential can be optimized to enforce the desired total electron number. The final molecular energy is reconstructed from fragment contributions using a prescription that accounts for the overlap between embedded regions.

BE-FCI is particularly useful when significant correlations can be captured within embedded fragments of manageable size, including molecular clusters, hydrogen rings and chains, and other finite electronic systems exhibiting spatially localized correlation. Its accuracy depends on the chosen orbital representation, fragment overlaps, bath construction, and matching procedure. Although the fragment solvers are exact within their respective embedded spaces, neither the reconstructed molecular energy nor the self-consistent embedding approximation is generally exact or variational with respect to the full molecular Hamiltonian.

In the benchmark considered here, BE-FCI provides a classical reference for Quantum Bootstrap Embedding with Sample-Based Quantum Diagonalization (QBE-SQD). The two methods share a common embedding framework but differ in their fragment eigensolvers: BE-FCI uses classical FCI, whereas QBE-SQD uses quantum-sampled configurations followed by classical selected-subspace diagonalization. This correspondence allows fragment-solver errors to be studied separately from the accuracy of the embedding approximation, provided the same embedded Hamiltonians and numerical conditions are used.

## Methodology and Execution

### Molecular Hamiltonian and Embedded Representation

The molecular electronic problem is defined by the nonrelativistic Hamiltonian in a finite spin-orbital basis,

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

where $$a_p^\dagger$$ and $$a_p$$ are fermionic creation and annihilation operators, $$h_{pq}$$ and $$g_{pqrs}$$ are one- and two-electron integrals in the specified convention, and $$E_{\mathrm{nuc}}$$ is the nuclear repulsion energy. For $$N_e$$ electrons distributed among $$M$$ spatial orbitals, the full fixed-electron-number determinant space has dimension

$$
D_{\mathrm{FCI}}=\binom{2M}{N_e}.
$$

If the spin-up and spin-down populations are fixed separately, the dimension becomes $$D_{\mathrm{FCI}}=\binom{M}{N_\alpha}\binom{M}{N_\beta}$$, with $$N_\alpha+N_\beta=N_e$$. This growth motivates reducing the electronic problem to embedded fragment spaces rather than attempting FCI over the complete molecular orbital basis.

The embedding calculation begins with a mean-field electronic-structure solution, typically Hartree–Fock, followed by a transformation to a localized orbital representation. Löwdin orthogonalization, Boys localization, and intrinsic atomic orbitals are examples of possible constructions, although they need not produce equivalent fragment descriptions. The localized basis affects the spatial extent of the fragment orbitals, the bath dimensions, and the ease with which correlated electronic behavior can be recovered. In particular, large or diffuse Gaussian bases can complicate the definition of compact fragments and the numerical convergence of embedding calculations.

The localized orbitals are organized into overlapping fragments $$F_A$$, each having a designated center and a surrounding edge region. Neighboring fragments can share orbitals, schematically $$F_A\cap F_B\neq\varnothing$$. The overlap is used to compare electronic information obtained from different embedded calculations. Center–edge matching exploits the idea that an orbital represented near the boundary of one fragment may be described more accurately when it lies nearer the center of another fragment. Fragment sizes, overlap structure, and matching regions must be specified for a reproducible calculation.

### Mean-Field Bath Construction and Fragment FCI

For each fragment, bath orbitals are constructed from its entanglement with the environment in the mean-field reference state. A bipartition of the electronic Hilbert space into fragment and environment sectors permits the Schmidt representation

$$
\lvert\Psi\rangle
=
\sum_\alpha \lambda_\alpha
\lvert f_\alpha\rangle\otimes\lvert e_\alpha\rangle,
$$

where $$\lambda_\alpha$$ are Schmidt coefficients and the associated fragment and environment vectors form the corresponding paired states. In BE-FCI, the exact correlated molecular state is unknown. Instead, the Hartree–Fock reference supplies a tractable set of bath orbitals that describe its fragment–environment entanglement. Correlations beyond that reference are then treated within the resulting embedded fragment–bath Hamiltonian.

For fragment $$A$$, the embedded Hamiltonian can be expressed schematically as

$$
\hat{H}_{\mathrm{emb}}^{(A)}
=
\hat{P}_A\hat{H}\hat{P}_A
+
\hat{V}_{\mathrm{env}}^{(A)},
$$

where $$\hat{P}_A$$ denotes restriction to the selected fragment–bath space and $$\hat{V}_{\mathrm{env}}^{(A)}$$ summarizes contributions from the environment not retained explicitly. This formula is a conceptual representation, rather than a complete prescription for generating the embedded electronic integrals; an actual implementation must specify the core/environment contributions, projected one- and two-electron terms, and electron-number sector.

The embedded electronic eigenvalue problem is solved using classical FCI,

$$
\hat{H}_{\mathrm{emb}}^{(A)}\lvert\Psi_A\rangle
=
E_A\lvert\Psi_A\rangle,
\qquad
\lvert\Psi_A\rangle
=
\sum_{I\in\mathcal{C}_A}c_I^{(A)}\lvert D_I^{(A)}\rangle.
$$

For an embedded space with $$N_e^{(A)}$$ electrons and $$M_A$$ spatial orbitals, the fixed-electron-number determinant dimension is $$D_A=\binom{2M_A}{N_e^{(A)}}$$, before any additional symmetry restrictions. FCI gives the exact correlated eigenstate of the specified embedded Hamiltonian within this finite space, up to solver tolerance. It does not establish exactness of the full molecular calculation, because the bath representation, fragment selection, and global reconstruction remain approximate.

The fragment eigenstates yield the reduced density matrices needed for self-consistency and energy reconstruction. In the embedded orbital basis, the one- and two-particle reduced density matrices are

$$
\gamma_{pq}^{(A)}
=
\langle\Psi_A\rvert a_p^\dagger a_q\lvert\Psi_A\rangle,
\qquad
\Gamma_{pqrs}^{(A)}
=
\langle\Psi_A\rvert
 a_p^\dagger a_q^\dagger a_s a_r
\lvert\Psi_A\rangle.
$$

The one-particle density matrix determines the occupations and one-body correlations used in overlap matching, while both reduced density matrices contribute to the reconstructed correlated molecular energy.

### Overlap Matching and Embedding Optimization

Bootstrap embedding aims to make the electronic descriptions of overlapping fragment regions mutually consistent. For selected matrix elements $$p,q$$ in the overlap of fragments $$A$$ and $$B$$, the target condition is $$\gamma_{pq}^{(A)}=\gamma_{pq}^{(B)}$$ under the appropriate common orbital convention. A corresponding residual is

$$
R_{pq}^{(A,B)}
=
\gamma_{pq}^{(A)}-\gamma_{pq}^{(B)}.
$$

For a collection of matching elements $$\Omega_{AB}$$, one useful aggregate diagnostic is

$$
\varepsilon_{\mathrm{match}}
=
\left[
\sum_{(A,B)}
\sum_{(p,q)\in\Omega_{AB}}
\left\lvert R_{pq}^{(A,B)}\right\rvert^2
\right]^{1/2}.
$$

The set of matched elements depends on the embedding protocol. In a center–edge scheme, selected density-matrix elements near the edge of one fragment are matched to corresponding elements near the center of another. Other protocols may impose fewer conditions, including selected blocks or diagonal occupations. A small residual demonstrates satisfaction of the chosen consistency constraints, but it is not by itself a guarantee of a small ground-state energy error.

The density-matching conditions can be enforced by adjusting effective one-body embedding potentials. A general fragment potential has the form

$$
\hat{V}_A
=
\sum_{pq}\lambda_{pq}^{(A)}a_p^\dagger a_q,
$$

and the effective fragment Hamiltonian used in an iteration may be written schematically as

$$
\hat{H}_A^{\mathrm{opt}}
=
\hat{H}_{\mathrm{emb}}^{(A)}
+
\hat{V}_A
-
\mu\hat{N}_A.
$$

Here the coefficients $$\lambda_{pq}^{(A)}$$ are varied to reduce the prescribed density-matching residuals, $$\mu$$ is a global chemical potential, and $$\hat{N}_A$$ represents the electron-number operator used by the embedding formulation. The precise sign conventions, potential parameterization, and residual minimization procedure depend on the implementation. Fragment FCI calculations are repeated as these potentials change, coupling otherwise independent embedded solves through the self-consistency conditions.

An alternative optimization strategy adjusts only the global chemical potential to enforce the reconstructed total electron number, $$N_{\mathrm{reconstructed}}=N_e$$, without imposing the complete center–edge density-matching conditions. This procedure is not equivalent to full one-particle density matching, and the two choices can behave differently as electronic correlation increases. In the hydrogen-ring comparison described below, the published study evaluates both approaches and finds that their numerical convergence properties can differ substantially.

### Molecular Energy Reconstruction and Computational Platform

Once the embedded states have been obtained, the molecular energy is assembled from fragment contributions using a partitioning prescription designed to avoid double-counting overlapping regions. A schematic representation is

$$
E_{\mathrm{BE}}
=
E_{\mathrm{HF}}
+
\sum_{A=1}^{N_f}\Delta E_A^{\mathrm{center}},
$$

where $$E_{\mathrm{HF}}$$ is the mean-field reference energy and $$\Delta E_A^{\mathrm{center}}$$ represents a correlated contribution assigned to the designated center of fragment $$A$$. The actual reconstruction depends on the chosen BE formulation and can use fragment one- and two-particle density matrices or related cumulants. In particular, the molecular energy is not simply the sum of the fragment FCI eigenvalues.

This distinction also determines the method's variational properties. Although each FCI fragment eigenvalue is variational for its fixed embedded Hamiltonian, the reconstructed BE energy need not equal the expectation value of the full Hamiltonian in any single normalized global wavefunction. BE-FCI therefore does not generally provide a variational upper bound to the exact full-molecule energy.

The complete calculation uses classical computing resources for Hartree–Fock, orbital localization, bath and embedded-integral construction, FCI diagonalization, reduced-density-matrix evaluation, embedding-potential optimization, and molecular energy reconstruction. Fragment FCI calculations can be distributed across processors at a fixed embedding iteration, but the overall procedure remains coupled through the matching conditions and chemical-potential optimization. Parallel execution can reduce elapsed time without eliminating the underlying computational work.

The public `QuEmb` package provides bootstrap embedding infrastructure, including fragmentation, bath construction, embedded Hamiltonians, and embedding optimization, with PySCF supplying electronic-structure and FCI capabilities. The published eight-hydrogen benchmark uses QuEmb with classical FCI solvers, Löwdin-localized orbitals, and the BE2 fragmentation scheme. BE-FCI requires neither quantum hardware nor machine-learning models; its classification is classical computational with no SI/ML involvement.

## Approximation and Error Control

BE-FCI has several distinct sources of approximation error. The fragment FCI eigenstates are exact within their embedded Hamiltonians, but the correlated molecular state is represented through a finite set of overlapping fragment–bath problems rather than a single full-system wavefunction. The quality of this representation depends on the fragment sizes and overlaps, the mean-field-derived bath, the localized orbital basis, the degree of density-matching convergence, and the procedure used to reconstruct the total energy.

Fragmentation determines which correlations can be represented explicitly within an embedded calculation. Small fragments can omit physically important correlations extending beyond their boundaries, whereas increasing the fragment extent generally improves coverage at the expense of larger FCI problems. The bath orbitals partially recover coupling to the environment, but their construction from a Hartree–Fock state cannot guarantee that all correlated fragment–environment entanglement is retained. These limitations become more consequential for extended basis sets, delocalized electronic states, and stretched molecular geometries with significant multireference character.

The choice of localized orbitals is therefore both a numerical and physical modeling decision. The published hydrogen-ring work uses Löwdin-localized orbitals; other constructions, such as intrinsic atomic orbitals, may alter the fragment–environment partition and the behavior of the embedding optimization. A change in localization can affect the accuracy even when the original molecular Hamiltonian and finite basis remain fixed. Reproducible comparisons should document the localization method and assess sensitivity to it when feasible.

Embedding-potential optimization introduces a separate convergence requirement. Changes in the matching residual, embedding potentials, reconstructed electron number, and total energy should be monitored independently. Convergence to a small density-matching residual establishes agreement under the imposed one-body constraints, but does not guarantee that the reconstructed molecular energy agrees with a high-accuracy full-system reference. Conversely, chemical-potential-only optimization can sometimes exhibit favorable energy behavior without satisfying the full set of density-matching constraints. These strategies should be evaluated separately rather than assumed to be interchangeable.

Importantly, BE-FCI is not generally globally variational. The Rayleigh–Ritz bound on each embedded fragment eigenvalue cannot be transferred to the reconstructed total energy, and the inequality $$E_{\mathrm{BE}}\geq E_{\mathrm{FCI}}$$ is not guaranteed for the full molecular problem. The molecular energy error must consequently be evaluated against an independent full-system reference when one is available, with the approximation and uncertainty of that reference stated explicitly.

The principal error sources and validation strategies are summarized below.

| Error Source | Origin | Validation Approach |
| --- | --- | --- |
| Fragmentation | Correlations extending beyond fragment boundaries | Increase fragment size or overlap |
| Bath approximation | Mean-field representation of the environment | Compare bath definitions and convergence |
| Orbital localization | Spatial distribution of localized orbitals | Compare localization procedures |
| Density matching | Incomplete consistency between overlapping regions | Monitor residuals and potential convergence |
| Chemical potential | Inaccurate reconstructed electron number | Check particle-number convergence |
| Fragment FCI | Finite eigensolver tolerance | Tighten FCI residual and energy thresholds |
| Energy reconstruction | Approximate assembly of correlated fragment contributions | Compare against full-system references |
| Molecular basis | Finite one-electron orbital representation | Perform basis-set studies |

A reliable validation combines fragment-size and bath-sensitivity studies, monitoring of matching and electron-number residuals, numerical convergence of FCI and optimization, and comparison of the final molecular energy against a high-quality full-system calculation. Agreement between BE-FCI and another embedding method that shares the same fragments and bath construction primarily tests their differing numerical components; it does not independently validate the shared embedding approximation.

## Applied Problems

### Electronic Structure of Moderate-Size Molecules

The reported application is an eight-atom hydrogen ring, which provides a controlled test of molecular ground-state energies as electronic correlation increases during bond stretching. The ring contains eight equally spaced hydrogen atoms in a planar geometry and is described using the cc-pVDZ basis. The full molecular electronic space has eight electrons in 40 spatial orbitals, corresponding to 80 spin-orbitals. This system is large enough to make correlated full-space treatment demanding while remaining accessible to high-accuracy classical reference methods.

The study considers ring radii

$$
r\in\{1.3,\ 1.8,\ 2.2\}\ \mathrm{\mathring{A}}.
$$

These quantities are **ring radii**, not nearest-neighbor H–H separations. For an eight-atom regular ring, the nearest-neighbor distance is $$d_{\mathrm{H-H}}=2r\sin(\pi/8)$$. Increasing the radius moves the system from relatively weakly correlated geometries toward stretched configurations with stronger multireference character.

The BE2 fragmentation used in the published comparison assigns a central hydrogen atom and its two nearest neighbors to each overlapping fragment, producing eight fragments in total. Each fragment contains three hydrogen atoms corresponding to 30 fragment spin-orbitals, supplemented by eight bath spin-orbitals. The resulting embedded problem contains 38 spin-orbitals, or 19 spatial orbitals, with eight electrons: an $$(8e,19o)$$ active space. These counts describe the complete embedded fragment–bath problem and are the relevant dimensions for its FCI solver, rather than the three-atom fragment alone.

| Benchmark Specification | Value |
| --- | --- |
| Molecular system | Planar H8 ring |
| Orbital basis | cc-pVDZ |
| Full-system active space | (8e, 40o) |
| Ring radii | 1.3, 1.8, and 2.2 Å |
| Fragmentation | BE2, eight overlapping three-atom fragments |
| Orbitals per fragment | 30 fragment spin-orbitals |
| Bath size | 8 bath spin-orbitals |
| Embedded active space | (8e, 19o), or 38 spin-orbitals |
| Fragment solver | Classical FCI |
| Full-system energy reference | DMRG in (8e, 40o) |

The target observable is the molecular ground-state energy $$E_0(r)$$ at each geometry. The reconstructed BE-FCI energy is assessed through

$$
\Delta E_{\mathrm{BE}}(r)
=
\left\lvert E_{\mathrm{BE-FCI}}(r)-E_{\mathrm{ref}}(r)\right\rvert.
$$

The reference energies in the published comparison come from full-basis DMRG calculations in the (8e, 40o) active space. These are high-accuracy classical numerical references, not exact molecular FCI values. Their convergence status should be reported when using them as quantitative accuracy benchmarks.

The primary study compares BE-FCI against QBE-SQD using the same general embedding framework. At the near-equilibrium ring radius of 1.3 Å, the reported calculations show close agreement in energy and density-matching behavior. At larger radii, the full center–edge matching procedure becomes more challenging as the electronic state develops stronger correlations. For the radius of 1.8 Å, the published BE-FCI full-matching calculation reports a residual of approximately $$2\times10^{-3}$$ and a molecular energy error of approximately 20 mHa after five embedding iterations. These are observations for the stated numerical protocol, not general accuracy limits of BE-FCI.

The publication also investigates optimization of the global chemical potential without imposing the complete set of center–edge one-particle density-matrix constraints. For the hydrogen-ring geometries considered, this reduced optimization exhibits more favorable energy convergence than the tested full-matching protocol in certain cases. The source reports improvements of approximately 6 mHa at 1.8 Å and 3.6 mHa at 2.2 Å **for the QBE-SQD comparisons**; those improvements should not be attributed to BE-FCI without separate corresponding evidence. The result illustrates why the density-matching residual and the molecular energy error must be monitored as distinct metrics.

The H8 benchmark therefore serves two purposes. It tests the accuracy and convergence of classical overlapping-fragment embedding across correlation regimes, and it supplies a common embedding framework against which the effect of replacing the classical FCI fragment solver with quantum-assisted selected-subspace diagonalization can be evaluated.

## Performance Metrics and Scaling

The main computational costs of BE-FCI are mean-field and orbital preprocessing, construction of fragment–bath Hamiltonians, FCI diagonalization of the embedded subsystems, iterative embedding-potential optimization, and energy reconstruction. The dominant bottleneck can shift with the molecular basis, fragment size, number of fragments, and strength of electronic correlation. Total system size alone is therefore insufficient to predict the computational effort.

The FCI dimension for an embedded subsystem with $$N_e$$ electrons and $$M$$ spatial orbitals is $$D_{\mathrm{FCI}}=\binom{2M}{N_e}$$, or $$\binom{M}{N_\alpha}\binom{M}{N_\beta}$$ in a fixed-spin-population determinant sector. At fixed filling, this dimension grows exponentially with the number of embedded orbitals. Iterative FCI eigensolvers need not construct the dense Hamiltonian matrix, but still operate on potentially large coefficient vectors, making embedded-space size and symmetry sector central to runtime and memory requirements.

Overlapping fragmentation can reduce the correlated workload when the embedded active spaces remain bounded as molecular size increases. Under this assumption, the *sum of fragment-solver costs* may increase approximately with the number of fragments. That observation does not imply linear scaling of the complete BE-FCI calculation, because Hartree–Fock, orbital localization, bath construction, electronic integral transformations, density matching, and energy reconstruction may incur substantial global costs. The bath can also make an embedded subsystem considerably larger than its original fragment, so performance should be reported using the complete fragment–bath active-space dimensions.

The iterative character of bootstrap embedding adds another computational factor. At fixed potentials, the individual fragment calculations can be performed in parallel, but the updated density matrices must be combined before the next matching or chemical-potential iteration. A schematic expression for total computational work is

$$
W_{\mathrm{BE-FCI}}
\approx
W_{\mathrm{setup}}
+
\sum_{k=1}^{N_{\mathrm{iter}}}
\sum_{A=1}^{N_f}W_{\mathrm{FCI}}^{(A,k)}
+
W_{\mathrm{optimization}},
$$

where $$N_{\mathrm{iter}}$$ denotes embedding iterations, $$N_f$$ the number of fragments, and $$W_{\mathrm{FCI}}^{(A,k)}$$ the work of the FCI calculation for fragment $$A$$ at iteration $$k$$. This measures work rather than elapsed wall-clock time; parallel execution changes the latter, and measured runtime should be reported independently.

The most useful performance metrics are summarized below.

| Metric | Description |
| --- | --- |
| Molecular size | Atoms, electrons, basis functions, and orbitals |
| Fragmentation | Number of fragments, overlap structure, and center–edge regions |
| Embedded space | Fragment and bath orbital counts, electron count, and spin sector |
| FCI complexity | Determinant dimension, solver runtime, iterations, and memory |
| Embedding convergence | Density-matching residual, electron-number error, and iteration count |
| Ground-state accuracy | Deviation from a clearly specified full-system reference |
| Preprocessing | Hartree–Fock, localization, bath, and integral-construction costs |
| Parallel resources | CPU/HPC allocation and scaling of fragment solves |
| End-to-end runtime | Total elapsed time including all embedding stages |
| Peak memory | Maximum memory allocation of the complete calculation |

The practical breaking point is reached when the required embedded fragment–bath Hilbert space, global preprocessing, or embedding optimization becomes too expensive to satisfy the target accuracy within available resources. Large baths, poor localization, strongly correlated fragments, slow matching convergence, and integral-transformation costs can all become limiting. A reproducible breaking-point study should report the complete embedded-space dimensions, symmetry sectors, numerical tolerances, hardware, and measured resources rather than assigning a universal maximum fragment size.

BE-FCI does not use a quantum processor, and quantum gate, qubit, and measurement-shot metrics do not apply to its execution. These become relevant only in comparisons with separately documented quantum or hybrid embedding Solutions.

## Comparative Evaluation and Crossing-Point Analysis

BE-FCI provides a classical reference for studying both the benefits of fragment embedding and the cost of accurately solving its embedded electronic problems. Comparisons with full-system FCI or converged DMRG assess the accuracy of the **embedding approximation**, while comparisons with alternative fragment solvers test whether the same embedded Hamiltonians can be solved more efficiently. These two questions must be kept separate.

| Method | Computational Paradigm | Main Representation or Solver | Principal Limitation |
| --- | --- | --- | --- |
| Full-system FCI | Classical computational | Complete molecular determinant space | Combinatorial configuration-space growth |
| DMRG | Classical computational | Tensor-network correlated wavefunction | Bond dimension and convergence |
| Selected CI | Classical computational | Selected determinant subspace | Selected-space completeness |
| BE-FCI | Classical computational | Overlapping fragments with FCI solvers | Embedded FCI size and embedding error |
| BE-CCSD | Classical computational | Overlapping fragments with coupled-cluster solvers | Correlation approximation and embedding error |
| QBE-SQD | Hybrid quantum-classical | Quantum-sampled fragment subspaces | Sampling, selected-space convergence, and hybrid overhead |

For sufficiently small molecular systems, full-system FCI provides an exact finite-basis reference. The BE-FCI error is then

$$
\Delta E_{\mathrm{embedding}}
=
\left\lvert E_{\mathrm{BE-FCI}}-E_{\mathrm{FCI}}\right\rvert.
$$

This quantity combines the effects of fragment truncation, bath construction, density matching, and energy reconstruction. Because the reconstructed BE energy is not generally variational, it may lie either above or below the exact molecular energy. The absolute difference is therefore more informative than an assumed upper-bound relationship. Where full-system FCI is not feasible, sufficiently converged DMRG or another characterized high-accuracy method can provide a numerical reference, with its uncertainty stated.

QBE-SQD uses the same embedding framework but replaces embedded FCI with quantum sampling and classical selected-subspace diagonalization. A comparison of total reconstructed energies,

$$
\Delta E_{\mathrm{solver}}
=
\left\lvert E_{\mathrm{QBE-SQD}}-E_{\mathrm{BE-FCI}}\right\rvert,
$$

measures agreement between the complete embedding calculations. It can contain effects from different self-consistent potentials and convergence histories as well as from fragment eigensolver accuracy. To isolate the eigensolver approximation, SQD and FCI should first be compared on **identical fixed embedded Hamiltonians**, before separately evaluating the resulting differences after the full embedding optimization. The same distinction applies when comparing BE-FCI with BE-CCSD or other approximate embedded solvers.

A fair performance comparison requires the same molecular geometry, electron count, orbital basis, physical Hamiltonian, compatible fragmentation and bath definitions where applicable, and matched target accuracy. Fragment FCI solves must be compared with the complete classical or hybrid cost of their alternatives, including any quantum sampling, configuration recovery, selected-subspace construction, and classical diagonalization. For comparisons against DMRG, the bond dimension and convergence requirements should be reported alongside the BE fragment and bath sizes.

The total BE-FCI runtime may be decomposed schematically as

$$
T_{\mathrm{BE-FCI}}
=
T_{\mathrm{setup}}
+
T_{\mathrm{bath}}
+
T_{\mathrm{fragment}}
+
T_{\mathrm{optimization}}
+
T_{\mathrm{reconstruction}},
$$

where the terms respectively represent mean-field and orbital setup, bath/embedded-Hamiltonian construction, fragment FCI solutions, matching and chemical-potential optimization, and molecular energy reconstruction. This additive expression applies to nonoverlapping timed stages; the actual wall-clock runtime must account for concurrent fragment calculations and any work shared between stages.

For a specified problem family and target energy tolerance $$\varepsilon$$, a computational crossing point between BE-FCI and an alternative can be defined by

$$
T_{\mathrm{BE-FCI}}(N^*,\varepsilon)
=
T_{\mathrm{alternative}}(N^*,\varepsilon),
$$

where $$N^*$$ characterizes the relevant molecular or embedded-space size. The comparison should investigate fragment FCI cost versus embedded-space dimension, embedding error versus fragment size, accuracy versus density-matching residual, and end-to-end runtime versus correlation strength and molecular size. A reduced selected-space dimension, a smaller quantum measurement workload, or difficulty with a particular classical FCI implementation does not independently establish a quantum computational advantage.

The published H8 results establish BE-FCI as a useful classical comparison for QBE-SQD and demonstrate both the promise and limitations of overlapping fragment embedding. They do not establish a universal computational crossing point or that either fragment-solver approach is optimal for all molecular systems. Those conclusions require matched-accuracy resource measurements against competitive classical methods and careful separation of embedding error from solver error.

## Applied Problem Links

{% assign applied_problem = site.problems | where: "title", "Electronic Structure of Moderate-Size Molecules" | first %}
{% if applied_problem %}
[Electronic Structure of Moderate-Size Molecules]({{ applied_problem.url | relative_url }}) — Classical bootstrap embedding with FCI fragment solvers for the ground-state energies of a planar H8 ring across different correlation regimes.
{% else %}
**Electronic Structure of Moderate-Size Molecules** — Classical bootstrap embedding of a planar H8 ring using overlapping fragments and FCI eigensolvers.
{% endif %}

## Reproducibility

A reproducible BE-FCI calculation requires a complete molecular specification, the orbital representation used for embedding, the fragment and bath construction, the embedded FCI settings, and the self-consistency protocol. The molecular inputs should include the atomic coordinates and geometry definition, electron count and spin sector, Gaussian basis, frozen-core convention, Hartree–Fock procedure, and the method for generating or transforming molecular integrals. For the H8 benchmark, the reported ring radii must not be confused with nearest-neighbor H–H distances.

The fragmentation specification must identify the BE scheme, number of overlapping fragments, center and edge regions, orbital localization method, overlap topology, bath construction, and resulting embedded electron and orbital counts. Because the bath orbitals derive from a mean-field reference, the associated reference state and any bath-selection tolerances should be recorded. The full fragment–bath active space, rather than only the atom count of a fragment, defines the FCI eigensolver problem.

The fragment solver should be documented through its software implementation, electron-number and spin constraints, determinant-space dimensions, numerical precision, and convergence criteria. Embedded eigenstates, energies, and one- and two-particle reduced density matrices should be retained where practical to support independent validation and re-analysis. Since fragments may be solved in parallel, the processor allocation and stage-specific runtimes should also be reported.

The embedding optimization must specify whether full center–edge density matching or chemical-potential-only optimization is used, the matched matrix elements and their orbital conventions, the potential parameterization, initialization, solver tolerances, maximum iteration count, and final residuals. Reporting the reconstructed electron number, energy trajectory, and matching residual across iterations is especially important in stretched, strongly correlated geometries, where the two convergence diagnostics need not behave similarly.

The computational environment should identify the CPU/HPC hardware, available memory, parallelization settings, numerical libraries, software versions, and total wall-clock time. The published H8 comparison uses QuEmb and PySCF with classical FCI solvers. For repeatable results, the corresponding software commits, input scripts, fragment definitions, convergence settings, and reconstructed energy data should be made available.

The public [QuEmb repository](https://github.com/oimeitei/quemb) and [QuEmb documentation](https://quemb.readthedocs.io/) describe the embedding software. The associated [H8 benchmark data and scripts](https://github.com/JoelHBierman/qbe_sqd_data) and [dataset record](https://doi.org/10.5281/zenodo.18225640) provide supporting resources for the published BE-FCI/QBE-SQD comparison. These links are also retained in the YAML metadata where relevant.

## Primary References

Hong-Zhou Ye, Nathan D. Ricke, Henry K. Tran, and Troy Van Voorhis, “Bootstrap Embedding for Molecules,” *Journal of Chemical Theory and Computation* **15**, 4497–4506 (2019). [DOI: 10.1021/acs.jctc.9b00529](https://doi.org/10.1021/acs.jctc.9b00529). [Full text](https://pmc.ncbi.nlm.nih.gov/articles/PMC6727622/).

Joel Bierman and Yuan Liu, “Towards utility-scale electronic structure with sample-based quantum bootstrap embedding,” *Digital Discovery* **5**, 945–956 (2026). [DOI: 10.1039/D5DD00416K](https://doi.org/10.1039/D5DD00416K). [Published article](https://pubs.rsc.org/en/content/articlehtml/2026/dd/d5dd00416k).

### Supporting Resources

The [QuEmb source code](https://github.com/oimeitei/quemb), [QuEmb documentation](https://quemb.readthedocs.io/), and [H8 benchmark repository](https://github.com/JoelHBierman/qbe_sqd_data) support reproduction of the embedding calculations and their comparison with QBE-SQD. The [archived numerical dataset](https://doi.org/10.5281/zenodo.18225640) should be cited together with the publication when its results are reused.
