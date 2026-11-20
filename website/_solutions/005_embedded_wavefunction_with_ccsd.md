---
layout: solution
title: "Embedded Wavefunction with Coupled-Cluster Singles and Doubles (EWF-CCSD)"
published: true
submitted_by: "Eric D. Switzer"
si_use: "Yes"

solution_classes:
  computational_paradigm: "Classical computational"
  method_family:
    - "Perturbative/diagrammatic"
  algorithmic_approach:
    - "Deterministic"
    - "Iterative"
  approximation_error_control:
    - "Heuristic/uncontrolled"
  si_ml_involvement:
    - "None"

problems_applied:
  - "Quantum Chemistry of Protein-Ligand Complexes"

summary: "A classical quantum-embedding method that partitions large molecular systems into localized fragments and correlated bath orbitals, then solves the embedded electronic-structure problems using coupled-cluster singles and doubles. Fragment correlation information is reconstructed into approximate molecular ground-state and binding energies, enabling classical reference calculations for protein-scale systems."

solution_status:
  role: "Reference"
  validation: "Partially validated"

code_repository: ""
data_repository: ""
---

## Algorithm Overview

Embedded Wavefunction with Coupled-Cluster Singles and Doubles (EWF-CCSD) is a classical correlated electronic-structure method that approximates molecular ground-state energies by solving smaller electronic problems embedded within a larger molecular environment. It combines an embedded wavefunction (EWF) framework with coupled-cluster theory truncated to single and double excitations (CCSD) as the correlated solver for each fragment. The principal motivation is to retain a wavefunction-based description of electronic correlation in systems, including protein–ligand complexes, for which applying conventional CCSD to the complete molecular orbital space is computationally impractical.

EWF exploits the spatial locality of many electronic correlation effects. Starting from a global mean-field description, the calculation identifies localized molecular orbitals associated with individual atoms or chemically meaningful regions and embeds them in compact sets of environment orbitals. The initial bath captures fragment–environment entanglement present in the mean-field state, while a perturbative interacting-bath construction incorporates additional orbitals important for correlated excitations. CCSD is then solved within each embedded orbital space, and the resulting one- and two-body correlation information is combined to approximate the energy of the full molecule.

For large biomolecules, the efficiency of this approach depends not only on the fragment solver but also on avoiding global operations during bath and electron-repulsion-integral construction. The protein-scale implementation considered here introduces spatially restricted orbital selection and local integral generation, limiting the work required to construct a given fragment under fixed-locality assumptions. These modifications make protein-scale calculations more tractable while introducing additional convergence parameters that must be tested against the physical observables of interest.

The primary benchmark is the electronic binding energy of trypsin–benzamidine and T4-lysozyme–n-butylbenzene. These systems probe different noncovalent interaction regimes and require energy differences between very large molecular total energies. EWF-CCSD provides a classical correlated-embedding comparator for EWF-TrimSQD, a hybrid quantum–classical approach that uses quantum-sampled configurations and classical selected-basis diagonalization instead of fragment CCSD. A close agreement between the two embedding calculations is informative about their relative numerical behavior, but neither method is automatically exact or guaranteed to reproduce experimental binding free energies.

EWF-CCSD is entirely classical. Its accuracy depends on the locality and bath approximations, the suitability of single-reference CCSD for the fragments, the reconstruction of the molecular energy, and the finite molecular basis. In particular, a numerically converged fragment CCSD calculation is not an exact fragment solution, and a collection of accurate local correlation contributions does not by itself establish an accurate full-system binding energy.

## Methodology and Execution

### Electronic Hamiltonian and CCSD Fragment Solver

The starting point is the nonrelativistic molecular electronic Hamiltonian in a finite spin-orbital basis,

$$
\hat{H}
=
\sum_{pq}h_{pq}a_p^\dagger a_q
+
\frac{1}{2}\sum_{pqrs}g_{pqrs}a_p^\dagger a_q^\dagger a_s a_r
+
E_{\mathrm{nuc}},
$$

where $$a_p^\dagger$$ and $$a_p$$ are fermionic creation and annihilation operators, $$h_{pq}$$ and $$g_{pqrs}$$ are the one- and two-electron integrals under the selected index convention, and $$E_{\mathrm{nuc}}$$ denotes the nuclear repulsion energy. The method seeks an approximation to the electronic ground-state energy for the specified geometry, electron number, charge state, and orbital basis.

In CCSD, the correlated electronic state is represented by an exponential cluster ansatz,

$$
\lvert\Psi_{\mathrm{CCSD}}\rangle
=
e^{\hat{T}_1+\hat{T}_2}\lvert\Phi_0\rangle,
$$

where $$\lvert\Phi_0\rangle$$ is a reference Slater determinant. In spin-orbital notation, the retained excitation operators are

$$
\hat{T}_1=\sum_{ia}t_i^a a_a^\dagger a_i,
\qquad
\hat{T}_2=\frac{1}{4}\sum_{ijab}t_{ij}^{ab}a_a^\dagger a_b^\dagger a_j a_i,
$$

with $$i,j$$ labeling occupied orbitals and $$a,b$$ labeling virtual orbitals. The cluster amplitudes are obtained by solving the projected equations involving the similarity-transformed Hamiltonian $$\bar{H}=e^{-\hat{T}}\hat{H}e^{\hat{T}}$$, where $$\hat{T}=\hat{T}_1+\hat{T}_2$$. Specifically, the residuals $$\langle\Phi_\mu\rvert\bar{H}\lvert\Phi_0\rangle$$ vanish for the retained singles and doubles excitation manifold, and the CCSD energy is evaluated as $$E_{\mathrm{CCSD}}=\langle\Phi_0\rvert\bar{H}\lvert\Phi_0\rangle$$.

The exponential form includes disconnected higher-order excitation products but omits independent connected triple and higher excitation amplitudes. CCSD is therefore an approximate, generally nonvariational electronic-structure method even when the iterative amplitude equations are tightly converged. EWF-CCSD applies this solver separately to the fragment–bath electronic Hamiltonians rather than to the full molecular Hamiltonian.

### Localized Orbitals and Correlated Bath Construction

The calculation begins with a global Hartree–Fock reference for the specified molecule. Occupied and virtual molecular orbitals are transformed into localized representations, including chemically motivated constructions based on intrinsic atomic orbitals or projected virtual spaces. Local regions, often associated with atoms or groups of atoms, define the fragments used for embedded correlated calculations. The full molecular orbital space can contain tens of thousands of spatial orbitals, whereas each embedded fragment retains a substantially smaller set.

An initial bath is derived from the mean-field fragment–environment entanglement, as in density matrix embedding theory (DMET). A Schmidt decomposition of the Hartree–Fock reference state can be written schematically as

$$
\lvert\Phi_{\mathrm{HF}}\rangle
=
\sum_\alpha\lambda_\alpha
\lvert f_\alpha\rangle\otimes\lvert e_\alpha\rangle,
$$

where the coefficients $$\lambda_\alpha$$ and paired fragment and environment states describe the bipartite entanglement of the reference. For a Slater determinant, the corresponding one-particle bath orbitals can be constructed efficiently from its mean-field density matrix. Such a bath captures reference-state entanglement but is not guaranteed to retain all the orbitals required to describe dynamic electronic correlation.

EWF therefore augments the initial bath with interacting bath natural orbitals obtained using second-order Møller–Plesset perturbation theory (MP2). Perturbative correlation information is used to rank occupied and virtual environment orbitals by their importance to the selected fragment, and an occupation threshold $$\eta$$ controls their retention. Tightening this threshold generally increases the embedded orbital-space dimension and the cost of the fragment calculation. MP2 is used to select the correlated bath; it is **not** the final fragment energy solver, which remains CCSD.

An embedded fragment Hamiltonian has the schematic form

$$
\hat{H}_c
=
\sum_{pq\in\mathcal{C}_c}h_{pq}^{(c)}a_p^\dagger a_q
+
\frac{1}{2}\sum_{pqrs\in\mathcal{C}_c}
 g_{pqrs}^{(c)}a_p^\dagger a_q^\dagger a_s a_r
+
E_{\mathrm{env}}^{(c)},
$$

where $$\mathcal{C}_c$$ is the retained fragment–bath orbital space and $$E_{\mathrm{env}}^{(c)}$$ denotes contributions from the molecular environment not explicitly represented as correlated degrees of freedom. This expression illustrates the effective electronic problem; the precise embedding integrals, frozen-environment terms, and orbital conventions depend on the implementation. Each embedded Hamiltonian is passed to a classical CCSD solver to obtain fragment amplitudes and correlation information.

### Molecular Energy Reconstruction

The full molecular energy is reconstructed from the embedded fragment calculations rather than obtained by summing their independent CCSD energies. The reconstruction uses appropriately partitioned one-body contributions and two-body correlated information, with special care to avoid double counting when environmental orbitals contribute to multiple embedded spaces. A schematic decomposition is

$$
E_{\mathrm{EWF}}
=
E_{\mathrm{HF}}
+
\sum_{c=1}^{N_f}\Delta E_{\mathrm{corr}}^{(c)},
$$

where $$\Delta E_{\mathrm{corr}}^{(c)}$$ represents the correlated contribution attributed to fragment $$c$$ under the specified reconstruction scheme. This is not a complete implementation formula: the actual construction uses fragment-projected one-body density matrices and two-body correlation cumulants or equivalent quantities.

For an electronic state, the reduced density matrices are defined formally by $$\gamma_{pq}=\langle a_p^\dagger a_q\rangle$$ and $$\Gamma_{pqrs}=\langle a_p^\dagger a_q^\dagger a_s a_r\rangle$$. In CCSD, physical density matrices require the appropriate left-hand-state or response formalism because the similarity-transformed eigenvalue problem is non-Hermitian. The two-body cumulant isolates the connected two-particle correlation contribution after subtracting the antisymmetrized products of one-body density matrices. Their accurate partitioning is important to recovering the total energy from overlapping local electronic calculations.

The final EWF energy is approximate and does not generally furnish a variational upper bound to the full molecular ground-state energy. Errors in the fragment solver, bath selection, locality truncation, and reconstruction can have distinct effects, and their interaction becomes particularly important for binding energies involving differences of large molecular totals.

### Spatially Localized Bath and Integral Construction

At protein-scale orbital counts, construction of embedded environments can itself become a limiting computational task. Conventional global MP2 bath generation and electron-repulsion-integral (ERI) transformations may depend strongly on the total molecular orbital count $$M$$ even when the final embedded fragments are small. The implementation studied here restricts the orbitals considered during the interacting-bath expansion to a region surrounding each fragment, using orbital localization centers to define spatial locality.

For a fragment centered at $$\mathbf{R}_c$$, candidate orbitals with centers $$\mathbf{R}_p$$ are retained within a chosen radius,

$$
\lVert\mathbf{R}_p-\mathbf{R}_c\rVert\leq R_{\mathrm{cut}},
\qquad R_{\mathrm{cut}}=7\ \mathrm{\mathring{A}}.
$$

A second local restriction is applied to ERI construction, using a larger radius $$R_{\mathrm{ERI}}=R_{\mathrm{cut}}+R_{\mathrm{buf}}$$ with a buffer $$R_{\mathrm{buf}}=3\ \mathrm{\mathring{A}}$$. The buffer is intended to reduce boundary artifacts introduced by truncating integral-generation regions. Both radii are numerical approximation parameters, not universal physical cutoffs, and their adequacy depends on the locality of the relevant correlations.

Under fixed cutoffs, bounded local orbital density, and the reported implementation assumptions, the cost of constructing an individual embedded fragment can become approximately $$\mathcal{O}(1)$$ with respect to the total orbital count. The corresponding conventional construction bottlenecks were reported to exhibit roughly $$\mathcal{O}(M^3)$$ dependence in the implementation analyzed by the study. These estimates concern *particular fragment-construction stages*; they do not imply constant or linear end-to-end scaling of all EWF-CCSD calculations. The number of fragments increases with molecular size, and global Hartree–Fock preprocessing, distributed scheduling, data movement, and fragment CCSD remain significant costs.

### Classical Computational Platform

EWF-CCSD runs entirely on classical hardware. The protein-scale study describes MPI-parallelized ORCA calculations for the global Hartree–Fock reference, research implementations of the EWF fragment-construction and energy-reconstruction procedures, and PySCF for classical CCSD fragment solutions. Its broader computational workflow uses high-performance resources including Fugaku, Miyabi-G, and ROQUO. The quantum-processor resources discussed in the same study belong to the separate EWF-TrimSQD approach, not to EWF-CCSD.

The classical workflow is naturally distributed because fragment Hamiltonians can be built and solved independently once the global reference and locality definitions are specified. The performance of a distributed calculation nevertheless depends on the distribution of fragment sizes, available memory, scheduling, storage, and communication overhead. No machine learning or superintelligence is required; the method consists of conventional electronic-structure theory, perturbative bath construction, coupled-cluster solvers, and classical numerical processing.

## Approximation and Error Control

EWF-CCSD contains two conceptually different families of approximations. First, CCSD approximates the correlated state within each embedded Hamiltonian by omitting independent connected excitations beyond doubles. Second, embedding approximates the full molecular correlation problem by restricting correlated calculations to finite fragment–bath spaces and reconstructing the molecular energy from their contributions. Convergence of the coupled-cluster amplitudes addresses neither missing long-range correlations nor inaccuracies in the reconstructed binding energy.

The quality of the single-reference CCSD solver depends on the electronic correlation regime. Weakly and moderately correlated fragments may be well represented, while fragments with substantial multireference character can require higher-order or multireference treatments. CCSD energies are generally nonvariational; neither the fragment energy nor the reconstructed EWF-CCSD energy is guaranteed to be above the exact finite-basis ground-state energy. The solver approximation should therefore be assessed through comparisons with CCSD(T), higher-order coupled cluster, selected configuration interaction, DMRG, or FCI on matched embedded Hamiltonians where feasible.

The embedding approximation depends on the choice of localized orbitals, the size of each fragment, and the correlation-informed bath. In the protein-scale calculations, the MP2 bath selection threshold $$\eta$$ provides an important convergence parameter. The reported settings include $$\eta=10^{-5}$$ for protein and ligand regions, $$\eta=10^{-7}$$ for surrounding water molecules, and a tighter value of $$\eta=10^{-8}$$ near the T4-lysozyme binding site in the refined calculation. These thresholds are specific to the published computational protocol and do not represent generally optimal values for other molecules or functionals.

Local orbital truncation and local ERI construction introduce additional errors when physical correlation, polarization, or electrostatic response extends beyond the selected radius. This sensitivity is especially important for charged environments and spatially delocalized electronic states. Where practical, calculations should test the convergence of the total and binding energies with respect to $$R_{\mathrm{cut}}$$, $$R_{\mathrm{buf}}$$, fragment definition, and bath occupation threshold. A numerically stable fragment energy at one cutoff does not establish convergence with respect to omitted environmental correlations.

The molecular orbital basis is another independent source of approximation. A minimal basis can fail to represent the polarization and dispersion interactions needed to predict noncovalent binding accurately. Improving the local basis can substantially change an electronic binding energy even when the underlying CCSD and embedding calculations are internally converged. Basis-set effects should therefore be identified separately from CCSD truncation, bath selection, and spatial locality.

Binding-energy calculations are particularly sensitive to the reconstruction of small differences between large energies. With the convention

$$
E_{\mathrm{binding}}
=
E_{\mathrm{bound}}-E_{\mathrm{unbound}}-E_{\mathrm{ligand}},
$$

the corresponding energy error obeys

$$
\delta E_{\mathrm{binding}}
=
\delta E_{\mathrm{bound}}-\delta E_{\mathrm{unbound}}-\delta E_{\mathrm{ligand}},
$$

where each $$\delta E$$ is the signed error in an individual molecular total energy. These contributions may cancel or accumulate, making the final binding-energy error much larger or smaller than suggested by the error in any single fragment. For charged ligands, errors in the long-range electrostatic treatment can dominate the binding-energy difference despite apparently accurate local electronic correlation.

The main errors and their appropriate numerical checks are summarized below.

| Error Source | Origin | Validation Approach |
| --- | --- | --- |
| CCSD truncation | Missing connected triples and higher excitations | Compare with higher-order or multireference solvers on matched fragments |
| Embedded fragment and bath | Correlations outside the retained embedded space | Increase fragment size or tighten bath occupation threshold |
| Spatial locality | Omitted distant orbitals or correlation effects | Increase orbital and ERI construction radii |
| Orbital basis | Missing basis functions needed for polarization or dispersion | Basis-set convergence studies |
| Energy reconstruction | Approximate assembly of fragment correlation information | Compare with full-system benchmarks when feasible |
| Long-range electrostatics | Incomplete environmental charge and polarization effects | Converge electrostatic corrections and environmental treatment |
| Numerical CCSD convergence | Incomplete amplitude or energy convergence | Tighten solver residuals and iteration tolerances |

These tests make EWF-CCSD a systematically assessable framework, but they do not provide a universal rigorous bound on the full molecular energy or binding-energy error.

## Applied Problems

### Quantum Chemistry of Protein-Ligand Complexes

The primary application is the calculation of ground-state electronic energies and electronic binding-energy differences for the trypsin–benzamidine and T4-lysozyme–n-butylbenzene complexes. The two systems provide contrasting noncovalent interaction regimes and demonstrate the computational demands of extending correlated wavefunction embedding to molecular models containing more than 10,000 atoms. The calculations reported here are classical EWF-CCSD results, even though the same study also develops and evaluates a quantum-assisted EWF-TrimSQD approach.

The benchmark systems and basis specifications are as follows.

| Molecular System | Atoms | Spatial Orbitals | Molecular and Electronic Description |
| --- | ---: | ---: | --- |
| Trypsin–benzamidine | 12,635 | 31,795 | STO-3G; PDB 3PTB; electrostatically important binding region |
| T4-lysozyme–n-butylbenzene | 11,608 | 28,844 | STO-3G; PDB 4W57; dispersion and hydrophobic binding |
| T4-lysozyme–n-butylbenzene | 11,608 | 29,455 | Mixed STO-3G / 3-21G basis near the binding site |

The trypsin–benzamidine model includes 3,135 retained water molecules, while T4-lysozyme–n-butylbenzene includes 2,986. Both use an explicit-solvent cutoff of 10 Å relative to the protein boundary. In the mixed-basis T4 calculation, 3-21G is used for the ligand and protein residues containing atoms within 3 Å of the ligand, with STO-3G elsewhere. The refined model also adopts a tighter bath threshold near the binding site. These molecular, basis, and embedding differences are part of the benchmark conditions and must be distinguished when interpreting the calculated binding energies.

For each system, the EWF-CCSD electronic binding energy is constructed from separate bound-complex, unbound-protein-environment, and isolated-ligand energies. Under the stated sign convention, a negative value indicates that the bound configuration is electronically stabilized relative to the specified separated components. These quantities are not the same as experimental binding free energies, which additionally involve entropic, conformational, solvent, and thermodynamic effects beyond the fixed-geometry electronic-energy comparison.

The September 2026 revision of the protein-scale study reports the following EWF-CCSD estimates.

| System | Basis and Treatment | Binding Energy (Ha) | Binding Energy (kcal/mol) |
| --- | --- | ---: | ---: |
| Trypsin–benzamidine | STO-3G | +0.0454 | +28.46 |
| Trypsin–benzamidine | STO-3G with electrostatic correction | -0.2081 | -130.59 |
| T4-lysozyme–n-butylbenzene | STO-3G | +0.0166 | +10.45 |
| T4-lysozyme–n-butylbenzene | Mixed STO-3G / 3-21G | -0.0275 | -17.31 |

The values in Hartree are rounded as reported, so the more precise kcal/mol values should not be recalculated solely from the displayed four-decimal Hartree numbers. Both uncorrected minimal-basis calculations yield positive binding energies, notwithstanding the use of correlated CCSD fragment solvers. The mixed-basis T4 calculation instead yields a negative value. For trypsin–benzamidine, the additional electrostatic correction produces a much larger change and reverses the sign of the binding energy. These differences underscore the sensitivity of molecular binding to basis-set quality and the long-range environment; none of the quoted values by itself demonstrates chemical accuracy relative to experiment.

The published study also compares EWF-CCSD with EWF-TrimSQD, which replaces the classical fragment CCSD solver with quantum-assisted configuration sampling and classical selected-basis diagonalization. For the directly tabulated common treatments, the binding energies are:

| Molecular System | Basis and Treatment | EWF-CCSD (kcal/mol) | EWF-TrimSQD (kcal/mol) |
| --- | --- | ---: | ---: |
| Trypsin–benzamidine | STO-3G | +28.46 | +35.89 |
| T4-lysozyme–n-butylbenzene | STO-3G | +10.45 | +9.30 |
| T4-lysozyme–n-butylbenzene | Mixed basis | -17.31 | -21.07 |

These results measure the agreement of two approximate correlated embedding calculations. Differences may arise from their fragment solvers and from how the resulting correlated information enters reconstruction. Agreement is useful for cross-validation, but it does not establish that either approach has reached the exact molecular ground-state energy or an experimentally accurate binding free energy. The electrostatic-correction result for trypsin is reported separately and should not be conflated with the uncorrected comparison above.

## Performance Metrics and Scaling

The principal computational resources for EWF-CCSD are the global reference calculation, fragment and bath construction, local ERI generation, fragment CCSD solves, and assembly of the full molecular energy. Runtime and memory depend on the number and distribution of embedded fragments, their occupied and virtual orbital dimensions, numerical thresholds, and the parallel execution strategy. Consequently, comparisons should report not only the total molecular size but also the dimensions and costs of the embedded problems actually solved.

Conventional dense CCSD has a leading contraction cost of approximately

$$
\mathcal{O}(o_c^2v_c^4),
$$

where $$o_c$$ and $$v_c$$ denote the occupied and virtual orbitals in embedded fragment $$c$$. Storage of the doubles amplitudes scales as $$\mathcal{O}(o_c^2v_c^2)$$, apart from other integral and intermediate arrays. These estimates describe conventional dense fragment CCSD; factorization, locality, distributed execution, and other implementation details may modify the practical cost. Even if fragment construction is local, an unusually large fragment–bath space can still dominate memory or runtime through its CCSD calculation.

For the published locality-optimized construction, the computational effort required to prepare one fragment becomes approximately independent of the total orbital count when the cutoff radii and local orbital density remain fixed. If the number of fragments grows proportionally with molecular size, aggregate fragment-construction work can then approach linear scaling with that size. This does not account for global mean-field operations, and it should not be interpreted as an established linear scaling for end-to-end EWF-CCSD at fixed binding-energy accuracy. Increasing system size or demanding greater accuracy may require larger spatial cutoffs, more bath orbitals, or different fragment definitions.

A useful decomposition of the total computational work is

$$
W_{\mathrm{EWF-CCSD}}
=
W_{\mathrm{setup}}
+
\sum_{c=1}^{N_f}
\left(
W_{\mathrm{bath}}^{(c)}
+
W_{\mathrm{CCSD}}^{(c)}
+
W_{\mathrm{reconstruction}}^{(c)}
\right),
$$

where the terms distinguish global setup, local embedding construction, correlated fragment solves, and the fragment contributions to reconstruction. This expression describes accumulated work rather than elapsed time. Parallel fragment execution may reduce wall-clock time, but it introduces scheduling, memory-distribution, communication, and data-movement considerations that should be measured separately.

The following metrics are particularly informative for evaluating the method.

| Metric | Benchmark Quantity |
| --- | --- |
| Molecular scale | Atom, electron, and orbital counts; number of fragments |
| Embedded-system size | Occupied and virtual orbitals per fragment; bath dimensions |
| Embedding convergence | MP2 occupation thresholds, locality cutoffs, and basis dependence |
| Fragment solver cost | CCSD iterations, wall-clock time, CPU/GPU node-hours, and peak memory |
| Preprocessing | Global Hartree–Fock, orbital localization, and ERI construction cost |
| Energy quality | Total-energy and binding-energy differences relative to specified references |
| Distributed execution | Concurrency, I/O volume, communication, and scheduling overhead |
| End-to-end performance | Total elapsed time, aggregate resource usage, and numerical convergence |

The practical computational breaking point can arise from several mechanisms: an embedded fragment becomes too large for available CCSD memory, molecular integral or bath construction becomes expensive, long-range electronic correlations invalidate a fixed locality cutoff, or distributed overhead becomes excessive as the number of fragments increases. A meaningful breaking-point study must therefore report the physical accuracy achieved at the largest tractable molecular and embedded-fragment sizes, along with the specific hardware and numerical settings used. No universal protein-size or fragment-size threshold is assigned by this entry.

Digital quantum metrics such as qubit counts, circuit depth, quantum shots, and QPU time are not applicable to running EWF-CCSD. Such costs belong to EWF-TrimSQD or another quantum-assisted Solution. Likewise, no machine-learning training or inference costs enter the classical EWF-CCSD algorithm.

## Comparative Evaluation and Crossing-Point Analysis

EWF-CCSD is a classical reference for evaluating correlated embedding methods that differ in their fragment solvers or in their treatment of the environment. Relevant comparisons include full-system CCSD where feasible, alternative embedded correlation methods, and the quantum-assisted EWF-TrimSQD implementation developed for the same protein-scale molecular systems.

| Method | Computational Paradigm | Correlated Treatment | Principal Limitation |
| --- | --- | --- | --- |
| Full-system CCSD | Classical computational | Global singles-and-doubles cluster amplitudes | High polynomial cost with total orbital count |
| EWF-MP2 | Classical computational | Perturbative embedded correlation | MP2 accuracy and embedding approximation |
| EWF-CCSD | Classical computational | Embedded fragment CCSD | Bath/locality errors and CCSD truncation |
| EWF-FCI | Classical computational | Embedded fragment FCI | Combinatorial fragment-space growth |
| DMRG-based embedding | Classical computational | Tensor-network fragment or active-space solver | Bond dimension and entanglement structure |
| EWF-TrimSQD | Hybrid quantum–classical | Quantum-sampled configurations and classical selected-basis diagonalization | Sampling quality, selected-space size, and hybrid overhead |

When full-system CCSD is tractable, comparing it with EWF-CCSD on an identical finite-basis molecular Hamiltonian assesses the effects of embedding and reconstruction under a common CCSD truncation. The absolute difference can be written as

$$
\Delta E_{\mathrm{embedding}}
=
\left\lvert
E_{\mathrm{EWF-CCSD}}-E_{\mathrm{CCSD}}
\right\rvert.
$$

For a fixed embedded fragment Hamiltonian, comparing CCSD with a higher-accuracy solver such as CCSD(T), DMRG, selected CI, or FCI instead evaluates the error of the fragment CCSD approximation. These are distinct tests: a comparison in which the embedding spaces or Hamiltonians differ cannot isolate the fragment solver from the embedding construction.

The same distinction applies to EWF-TrimSQD. On a fixed fragment Hamiltonian, the difference

$$
\Delta E_c
=
\left\lvert
E_c^{\mathrm{TrimSQD}}-E_c^{\mathrm{CCSD}}
\right\rvert
$$

measures solver disagreement, not necessarily the error of TrimSQD relative to the exact fragment solution because CCSD is approximate. Comparing the reconstructed protein–ligand binding energies then probes the combined consequences of the fragment solvers and their treatment within the larger embedding workflow. Independent higher-accuracy fragment calculations are required to determine which solver gives a better approximation when their results differ.

Fair performance comparisons require matching the molecular geometries, charge and protonation states, basis sets, fragment and bath definitions where applicable, electrostatic treatment, and target physical accuracy. Protein-scale binding energies should be compared at the level of the same electronic observable, not conflated with experimental binding free energies or with results based on different molecular environments. Computational differences must be assessed using the complete resource requirements of each workflow.

The end-to-end execution can be separated into nonoverlapping stages,

$$
T_{\mathrm{EWF-CCSD}}
=
T_{\mathrm{HF}}
+
T_{\mathrm{embedding}}
+
T_{\mathrm{CCSD}}
+
T_{\mathrm{reconstruction}}
+
T_{\mathrm{other}},
$$

where the categories denote global mean-field preparation, localized bath and integral construction, fragment CCSD, molecular energy reconstruction, and remaining work. The sum describes a sequential workflow; when fragments execute concurrently, actual wall-clock time should be measured directly and reported separately from accumulated node-hours or processor time.

A potential crossing point against an alternative method can be defined at a system or fragment size $$N^*$$ and target accuracy $$\varepsilon$$ by

$$
T_{\mathrm{EWF-CCSD}}(N^*,\varepsilon)
=
T_{\mathrm{alternative}}(N^*,\varepsilon).
$$

The relevant accuracy must be defined for the same physical quantity, ideally the electronic binding-energy difference and its uncertainty. The most informative scaling studies examine the dependence of fragment CCSD cost on occupied and virtual orbital counts, bath and locality parameters on energy accuracy, full-system size on embedding preparation, and end-to-end EWF-CCSD and EWF-TrimSQD runtimes at matched numerical accuracy. A reduction in quantum-sampled configuration-space dimension or an improvement in the cost of one embedded eigensolver does not itself establish a reduction in complete computational cost.

The published calculations demonstrate that classical EWF-CCSD can contribute correlated wavefunction results in protein-scale embedding workflows and provide an informative baseline for quantum-assisted fragment solvers. They do not establish chemical accuracy of the resulting binding energies relative to experiment or a general quantum computational advantage for EWF-TrimSQD.

## Applied Problem Links

{% assign applied_problem = site.problems | where: "title", "Quantum Chemistry of Protein-Ligand Complexes" | first %}
{% if applied_problem %}
[Quantum Chemistry of Protein-Ligand Complexes]({{ applied_problem.url | relative_url }}) — Classical EWF-CCSD estimates of molecular ground-state and electronic binding energies for trypsin–benzamidine and T4-lysozyme–n-butylbenzene complexes.
{% else %}
**Quantum Chemistry of Protein-Ligand Complexes** — Classical correlated embedding calculations for protein–ligand molecular systems.
{% endif %}

## Reproducibility

A reproducible EWF-CCSD calculation requires the complete molecular model, the construction of the global mean-field reference, the embedded fragment and bath spaces, the correlated solver settings, and the molecular energy-reconstruction procedure. Molecular inputs should identify the protein and ligand structures, atomic coordinates, total charge and spin state, protonation assignments, retained water molecules, orbital basis, frozen-core conventions, and the procedure used to generate molecular integrals. The bound complex, unbound protein environment, and isolated ligand must be specified separately under compatible physical conventions.

The embedding configuration must document orbital localization, fragment definitions and counts, mean-field bath construction, MP2 interacting-bath generation, occupied and virtual bath truncation thresholds, and final embedded orbital dimensions. For the protein-scale locality approximation, the values of $$R_{\mathrm{cut}}$$ and $$R_{\mathrm{buf}}$$, the definition of orbital localization centers, and the local ERI construction protocol must be recorded. Numerical convergence data with respect to these settings should be retained wherever available.

Each CCSD fragment calculation should specify its reference determinant and spin treatment, occupied and virtual orbital counts, amplitude initialization, convergence thresholds, maximum iterations, integral representation, numerical precision, and final correlation contribution. The reconstruction protocol should identify how one-body density matrices and two-body cumulants are calculated and attributed to fragments, how overlapping orbital contributions are handled, and how any long-range electrostatic corrections are incorporated. The bound, unbound, and ligand total energies should be reported alongside the derived binding-energy differences.

The computational environment should identify the ORCA, PySCF, and study-specific EWF implementations used, their versions and input settings, CPU and GPU architecture where relevant, MPI and threading configurations, number of nodes and processes, available memory, scratch storage, and data-movement requirements. Stage-level runtimes and aggregate processor-hours should be distinguished from the end-to-end elapsed wall-clock time. Source inputs, convergence tests, fragment outputs, and relevant comparison data should be preserved when possible.

The primary study identifies ORCA for global Hartree–Fock calculations, in-house EWF software for embedding and reconstruction, and PySCF for classical CCSD. A verified public repository for the specific EWF-CCSD protein-scale implementation has not been assigned in this Solution. General [PySCF documentation](https://pyscf.org/) is available, but it should not be substituted for a verified study-specific code release.

## Primary References

Kenneth M. Merz, Jr., Akhil Shajan, Danil Kaliakin, Fangchun Liang, et al., “Crossing the 12,000-atom barrier with heterogeneous quantum-classical supercomputing: quantum chemistry of protein-ligand complexes,” arXiv:2605.01138v2 (September 2026). [arXiv preprint](https://arxiv.org/abs/2605.01138v2). [Full-text HTML](https://arxiv.org/html/2605.01138v2).

Akhil Shajan et al., “Molecular Quantum Computations on a Protein,” *Journal of Chemical Theory and Computation* (2026). [DOI: 10.1021/acs.jctc.6c00364](https://doi.org/10.1021/acs.jctc.6c00364).

Max Nusspickel and George H. Booth, “Systematic Improvability in Quantum Embedding for Real Materials,” *Physical Review X* **12**, 011046 (2022). [DOI: 10.1103/PhysRevX.12.011046](https://doi.org/10.1103/PhysRevX.12.011046).

Max Nusspickel, Basil Ibrahim, and George H. Booth, “Effective Reconstruction of Expectation Values from Ab Initio Quantum Embedding,” *Journal of Chemical Theory and Computation* **19**, 2769–2791 (2023). [DOI: 10.1021/acs.jctc.2c01063](https://doi.org/10.1021/acs.jctc.2c01063).

### Supporting Resources

The [PySCF documentation](https://pyscf.org/) covers the correlated molecular solvers used in related classical calculations. The [Vayesta embedding framework documentation](https://boothgroup.github.io/Vayesta/intro.html) provides background on embedded wavefunction methods but is not identified here as the study-specific implementation. The primary preprint supplies the protein-scale methodology and numerical context for the reported EWF-CCSD benchmarks.
