---
layout: solution
title: "Embedded Wavefunction with Trimmed Sample-based Quantum Diagonalization (EWF-TrimSQD)"
published: true
submitted_by: "Eric D. Switzer"
si_use: "Yes"

solution_classes:
  computational_paradigm: "Hybrid quantum–classical"
  method_family:
    - "Exact diagonalization/subspace"
    - "Quantum circuit"
  algorithmic_approach:
    - "Stochastic"
    - "Iterative"
    - "Projection/subspace"
  approximation_error_control:
    - "Variationally bounded"
    - "Heuristic/uncontrolled"
    - "Statistically estimated"
    - "Noise-limited"
  si_ml_involvement:
    - "None"

problems_applied:
  - "Quantum Chemistry of Protein-Ligand Complexes"

summary: "A heterogeneous quantum-classical electronic-structure workflow combining spatially localized embedded wavefunction theory, quantum sampling of electronic configurations, trimmed selected-subspace diagonalization, and distributed GPU-accelerated eigensolvers. The method enables protein-scale ground-state and binding-energy calculations while retaining explicit controls over embedding, sampling, and fragment-solver approximations."

solution_status:
  role: "Candidate"
  validation: "Partially validated"

code_repository: ""
data_repository: ""
---

## Algorithm Overview

Embedded Wavefunction with Trimmed Sample-based Quantum Diagonalization (EWF-TrimSQD) is a heterogeneous quantum-classical method for approximating molecular ground-state energies and protein-ligand electronic binding energies. It integrates localized embedded wavefunction theory (EWF), quantum-assisted configuration sampling, trimmed selected-subspace diagonalization (TrimSQD), and distributed GPU-accelerated Selected-Basis Diagonalization (SBD-G). An automated workflow coordinates these components across quantum processors and classical high-performance computing resources. The method is intended for molecular systems whose full correlated electronic problem is intractable, but whose important correlations can be approximated through a collection of smaller embedded calculations.

The approach addresses two computational bottlenecks that should be distinguished. The first is the molecular scale: generating embedded Hamiltonians for proteins containing tens of thousands of orbitals can require expensive global orbital transformations, perturbative bath construction, and electron-repulsion integral processing. Spatially localized orbital and integral truncation reduces these costs by using primarily the electronic environment near each fragment. The second is the correlated fragment calculation: even after embedding, individual fragment Hilbert spaces can remain far too large for full configuration interaction (FCI). TrimSQD addresses this problem by using quantum circuits to sample candidate determinants, refining and extending the selected configuration spaces classically, and diagonalizing the corresponding projected Hamiltonians with distributed GPU resources.

The quantum processor does not directly return the final correlated fragment energy by measuring all Hamiltonian terms. Instead, its measurements identify electronic occupation configurations that serve as candidates for a classical eigenvalue problem. The final energy and approximate wavefunction of each TrimSQD-treated fragment are obtained through classical selected-subspace diagonalization. Other fragments can be assigned to classical FCI or coupled-cluster singles and doubles (CCSD), so the complete implementation is a heterogeneous embedding workflow rather than a quantum eigensolver applied indiscriminately to every fragment.

The principal application considered here is the calculation of electronic energies for trypsin-benzamidine and T4-lysozyme-n-butylbenzene complexes. These systems test correlated electronic-structure approximations in contrasting electrostatic and dispersion-influenced binding environments. A central objective is to determine whether the combination of locality, quantum-generated determinant spaces, and scalable classical diagonalization can deliver accurate correlated fragment solutions while reducing the total cost relative to competitive classical alternatives. Accurate fragment calculations alone do not establish accurate molecular binding energies, nor does the successful use of quantum hardware establish a general computational advantage.

## Methodology and Execution

### Electronic Hamiltonian and Embedded Representation

The molecular electronic problem is specified by the nonrelativistic Hamiltonian in a finite spin-orbital basis,

$$
\hat{H}=\sum_{pq}h_{pq}a_p^\dagger a_q
+\frac{1}{2}\sum_{pqrs}g_{pqrs}a_p^\dagger a_q^\dagger a_s a_r
+E_{\mathrm{nuc}},
$$

where the operators create and annihilate fermions, the integrals follow a stated two-electron index convention, and $$E_{\mathrm{nuc}}$$ is the nuclear repulsion energy. For $$N_e$$ electrons distributed among $$M$$ spatial orbitals, the dimension of the complete fixed-electron-number determinant space is $$D_{\mathrm{FCI}}=\binom{2M}{N_e}$$. Direct treatment of this space becomes infeasible at protein-scale orbital counts.

EWF partitions the molecule into locally correlated subsystems. Each fragment contains a designated molecular region, an associated set of localized occupied and virtual orbitals, bath orbitals representing relevant interactions with its environment, and a corresponding embedded Hamiltonian $$\hat{H}_c$$. The fragment-bath orbitals are obtained using mean-field and perturbative information, with their number controlled in part by a bath occupation threshold $$\eta$$. The exact fragment ground state would satisfy

$$
\hat{H}_c\lvert\Psi_c\rangle=E_{0,c}\lvert\Psi_c\rangle.
$$

The purpose of embedding is to make this correlated problem substantially smaller than the original molecular Hamiltonian while retaining the local electronic structure important for energy reconstruction. The treatment remains approximate because the bath and fragment partitions do not generally capture all nonlocal correlations. EWF reconstructs the molecular energy from the correlated fragment results; it does not construct or diagonalize the full molecular FCI Hamiltonian.

### Spatially Localized Fragment Construction

The protein-scale implementation avoids constructing the correlated bath and electron-repulsion integrals from the full molecular orbital space for every fragment. Instead, the MP2-informed bath expansion uses localized orbitals whose centers are within a chosen distance of the fragment. For a fragment centered at $$\mathbf{R}_c$$, the reported locality radius is $$R_{\mathrm{cut}}=7\ \mathrm{\mathring{A}}$$. The integral-construction region includes an additional buffer $$R_{\mathrm{buf}}=3\ \mathrm{\mathring{A}}$$, giving

$$
R_{\mathrm{ERI}}=R_{\mathrm{cut}}+R_{\mathrm{buf}}=10\ \mathrm{\mathring{A}}.
$$

The buffer reduces artificial boundary effects when assembling fragment integrals. These radii are parameters of the reported implementation, not universal physical cutoffs. Their adequacy depends on the locality of the electronic correlations and on long-range electrostatic or polarization effects, so convergence should be assessed when the molecular environment makes such contributions important.

Under fixed radii and approximately bounded local orbital density, the reported cost of constructing an individual fragment changes from approximately $$\mathcal{O}(M^3)$$ in the conventional workflow to $$\mathcal{O}(1)$$ with respect to the total orbital count $$M$$. This statement concerns the *local fragment-construction stage*. It does not imply constant cost for the full molecular calculation: the number of fragments increases with system size, while global Hartree-Fock calculations, correlated fragment solutions, scheduling, and molecular energy reconstruction retain their own computational costs.

### Fragment Solver Assignment and Quantum Sampling

The published workflow assigns different fragment solvers according to the size and computational requirements of the embedded problem. Hydrogen-centered fragments containing fewer than 13 spatial orbitals are treated with classical FCI; selected larger fragments that fit within the available quantum resource threshold are treated with TrimSQD; and fragments exceeding the supported TrimSQD size are assigned to classical CCSD. The quantum-eligible upper orbital threshold, denoted $$M_c^*$$, depends on the implementation and hardware. Consequently, the choice of solver is part of the reproducible computational specification and must be reported for each fragment.

For a fragment assigned to TrimSQD, a parameterized circuit prepares an approximate electronic state,

$$
\lvert\Psi_c(\boldsymbol{\theta})\rangle
=U_c(\boldsymbol{\theta})\lvert\Phi_c\rangle,
$$

where $$\lvert\Phi_c\rangle$$ is a reference state. Computational-basis measurement yields an occupation bitstring $$\mathbf{x}\in\{0,1\}^{N_q}$$ with ideal probability

$$
P(\mathbf{x})=\left\lvert\langle\mathbf{x}\vert\Psi_c(\boldsymbol{\theta})\rangle\right\rvert^2.
$$

The prepared state need not approximate the fragment ground state with high fidelity in every component; its relevant function is to generate a distribution containing determinants useful for the selected-subspace solver. Finite measurements and hardware noise can omit important configurations or produce bitstrings violating electron-number or spin-projection constraints. The workflow therefore performs classical configuration recovery and uses recovered configurations, including selected configurations retained from earlier processing stages, to construct improved candidate spaces.

### Trimmed Sample-Based Quantum Diagonalization

TrimSQD extends sample-based and extended sample-based quantum diagonalization by refining the candidate determinant space in stages. Recovered configurations are merged with retained candidates and distributed across subgroups of classical computing ranks. Each subgroup solves a projected eigenvalue problem and retains a fraction $$k_1$$ of configurations with the largest wavefunction contributions. The retained configurations are then combined across subgroups and diagonalized again; a second trimming fraction $$k_2$$ further reduces the configuration space. This two-stage selection allows information from different subgroups to influence the final retained set, rather than treating their independent selections as the complete result.

For an approximate fragment state in a selected configuration space $$\mathcal{S}$$,

$$
\lvert\Psi_{c,\mathcal{S}}\rangle
=\sum_{\mathbf{x}\in\mathcal{S}}c_{\mathbf{x}}\lvert\mathbf{x}\rangle,
$$

the coefficient magnitudes $$\lvert c_{\mathbf{x}}\rvert$$ provide a measure of determinant importance for the current approximate eigenvector. The trimming thresholds control the balance between retaining significant configurations and limiting the dimension of the subsequent classical calculation. They are numerical selection parameters rather than physical approximation parameters of the underlying Hamiltonian.

After trimming, the algorithm extends the selected space with determinants connected through nonzero fragment Hamiltonian matrix elements. For candidate determinants $$\mathbf{x}$$ and $$\mathbf{y}$$, the relevant condition is $$H_{\mathbf{x}\mathbf{y}}=\langle\mathbf{x}\rvert\hat{H}_c\lvert\mathbf{y}\rangle\neq0$$, subject in the reported procedure to a Hamming-distance restriction $$d_{\mathrm H}(\mathbf{x},\mathbf{y})\leq2$$. A final coefficient threshold $$\varepsilon$$ controls the retained configurations for the large-scale diagonalization. These extensions can produce a space considerably larger than the set directly observed through quantum measurement.

The projector onto the resulting determinant set is

$$
\hat{P}_{\mathcal{S}}
=\sum_{\mathbf{x}\in\mathcal{S}}
\lvert\mathbf{x}\rangle\langle\mathbf{x}\rvert,
$$

and the projected fragment eigenvalue problem is

$$
\hat{P}_{\mathcal{S}}\hat{H}_c\hat{P}_{\mathcal{S}}
\lvert\Psi_{\mathcal{S}}\rangle
=E_{\mathcal{S}}\lvert\Psi_{\mathcal{S}}\rangle.
$$

For an accurately assembled Hermitian projected Hamiltonian and a valid symmetry-restricted determinant space, the Rayleigh-Ritz principle ensures $$E_{\mathcal{S}}\geq E_{0,c}$$ for the *same embedded fragment Hamiltonian*. The inequality does not quantify the size of the approximation error. Independently generated subspaces are not necessarily nested, and the complete EWF molecular energy reconstructed from approximate fragments is not generally variationally bounded relative to the exact molecular ground-state energy.

### GPU-Accelerated Selected-Basis Diagonalization

The final TrimSQD eigenvalue problem may contain an extremely large number of retained configurations. The study uses GPU-accelerated Selected-Basis Diagonalization (SBD-G), which distributes selected-space wavefunction vectors and the operations needed to apply the Hamiltonian across high-performance computing nodes. Its central operation is a sparse, matrix-free Hamiltonian action,

$$
\mathbf{y}=H_{\mathcal{S}}\mathbf{x}.
$$

Rather than explicitly storing the full projected Hamiltonian or caching every connected determinant, the implementation employs compact data structures encoding excitation relationships and GPU-oriented kernels for the resulting vector updates. The principal challenges are distributed vector storage, generation of Hamiltonian-connected determinants, memory access, inter-node communication, and synchronization of concurrent contributions. SBD-G addresses the classical eigensolver bottleneck; its gains should not be attributed exclusively to quantum configuration sampling, since a similar accelerator may also be useful for classically selected determinant spaces.

### Molecular Energy Reconstruction and Computational Platform

The correlated fragment wavefunctions are used to obtain local one-particle density matrices and two-particle correlation information. In standard notation,

$$
\gamma_{pq}=\langle a_p^\dagger a_q\rangle,
\qquad
\Gamma_{pqrs}=\langle a_p^\dagger a_q^\dagger a_s a_r\rangle.
$$

Two-particle cumulants distinguish connected correlations from contributions reconstructible from the one-particle density matrix. EWF combines appropriately partitioned local one-body and two-body information to estimate the molecular energy. Schematically,

$$
E_{\mathrm{EWF}}
=E_{\mathrm{HF}}+\sum_{c=1}^{N_f}\Delta E_{\mathrm{corr}}^{(c)},
$$

where the fragment contributions must be assembled according to an energy-partitioning convention that avoids double counting. The exact reconstruction formula is implementation dependent; the total energy is not the simple sum of fragment eigenvalues. For protein-ligand calculations, the electronic binding energy is

$$
E_{\mathrm{binding}}
=E_{\mathrm{bound}}-E_{\mathrm{unbound}}-E_{\mathrm{ligand}}.
$$

A negative result indicates stabilization of the specified bound structure relative to the separated components under this sign convention. These fixed-geometry electronic energy differences must not be equated with experimental binding free energies, which also depend on structural sampling, solvent reorganization, and entropic contributions.

The study combines two IBM Heron r2 quantum processors, `ibm_cleveland` and `ibm_kobe`, with classical computing resources including Fugaku, Miyabi-G, and ROQUO. Quantum processors generate fragment configurations, while CPUs and GPUs perform molecular preprocessing, fragment construction, configuration recovery, diagonalization, and molecular energy reconstruction. A Prefect-based workflow coordinates fragment-level execution, backend selection, HPC scheduling, persistent job state, restarts, and reuse of completed work. Because independent fragments can proceed concurrently, elapsed wall-clock time and aggregate processor-hours are different measures of computational expense. No superintelligence or machine learning is required by the reported numerical method.

## Approximation and Error Control

EWF-TrimSQD has distinct sources of error in the physical embedding, quantum sampling and selected-subspace construction, classical eigenvalue solution, and global energy reconstruction. These effects should not be conflated. A fragment eigenvalue close to an accurate reference can demonstrate a successful TrimSQD solution of that embedded Hamiltonian, but it cannot by itself establish that the embedding or reconstructed protein-ligand binding energy is equally accurate.

The embedding approximation depends on the fragment definitions, the retained correlated bath orbitals, and the treatment of nonlocal correlations. The reported bath occupation thresholds are $$\eta=10^{-5}$$ for protein and ligand regions and $$\eta=10^{-7}$$ for surrounding water molecules; the refined T4-lysozyme calculation uses $$\eta=10^{-8}$$ near the binding region. Tightening the threshold generally increases the embedded orbital space and classical solution cost. The fixed locality radii for MP2 bath and integral construction introduce further truncation errors, especially in environments with substantial long-range charge redistribution or polarization. Convergence should therefore be tested against bath size and spatial cutoff where computationally feasible.

Quantum sampling introduces finite-shot uncertainty and may fail to identify low-probability but important configurations. Noise from imperfect gates, decoherence, and readout alters the observed bitstring distribution and can produce configurations outside the target electronic sector. Classical recovery, carryover, trimming, and subspace extension can improve the determinant selection, but none eliminates the sampling limitations by construction. Increasing the selected-space dimension can reduce missing-configuration error at the expense of larger GPU memory and eigensolver cost; comparisons between independently generated spaces do not necessarily show monotonic energy improvement.

Classical diagonalization adds residual numerical error through finite iterative-eigensolver tolerance, precision, and distributed arithmetic. At the molecular level, approximate embedding and energy partitioning remain even if a selected fragment subspace is solved accurately. In particular, there is no general guarantee that $$E_{\mathrm{EWF-TrimSQD}}\geq E_{\mathrm{exact}}$$ for the fully reconstructed molecular energy. The variational property of a fixed projected fragment Hamiltonian cannot be promoted to a rigorous global error bound.

| Error Source | Main Origin | Useful Validation |
| --- | --- | --- |
| Embedding and bath | Finite fragments and retained environment orbitals | Increase bath and fragment sizes |
| Locality | Truncated orbital and integral regions | Vary $$R_{\mathrm{cut}}$$ and $$R_{\mathrm{buf}}$$ |
| Quantum sampling | Finite shots and incomplete configuration discovery | Increase shots; repeat independent runs |
| Hardware noise | Imperfect state preparation and measurement | Compare hardware with noiseless sampling |
| Trimming and extension | Missing important determinants | Vary $$k_1$$, $$k_2$$, and selection thresholds |
| Classical diagonalization | Finite numerical accuracy | Tighten eigensolver tolerances and check residuals |
| Energy reconstruction | Approximate fragment combination and long-range interactions | Compare with full-system references where feasible |
| Orbital basis | Incomplete polarization and correlation description | Evaluate basis-set convergence |

Because protein-ligand binding energies are differences between very large molecular total energies, error cancellation and error accumulation must both be examined. Statistical and systematic errors in each of the bound-complex, unbound-environment, and isolated-ligand calculations can influence the final binding-energy difference. This is distinct from the numerical accuracy of any individual embedded fragment.

## Applied Problems

### Quantum Chemistry of Protein-Ligand Complexes

EWF-TrimSQD is applied to two large biomolecular complexes representing different dominant binding interactions. The molecular inputs and corresponding electronic dimensions are summarized below; the finite-basis model, explicit solvent configuration, protonation state, and reconstruction conventions must be matched when comparing the methods.

| Molecular System | Atoms | Electrons | Spatial Orbitals | Basis / Model |
| --- | ---: | ---: | ---: | --- |
| Trypsin-benzamidine | 12,635 | 43,858 | 31,795 | STO-3G, PDB 3PTB |
| T4-lysozyme-n-butylbenzene | 11,608 | 39,880 | 28,844 | STO-3G, PDB 4W57 |
| T4-lysozyme-n-butylbenzene | 11,608 | 39,880 | 29,455 | Mixed STO-3G / 3-21G |

The trypsin-benzamidine model includes 3,135 explicitly retained water molecules and emphasizes the sensitivity of charged binding sites to long-range electrostatics. The largest embedded fragment is (66e, 45o). In the corresponding fixed-spin determinant sector, the complete configuration space contains approximately $$8.27\times10^{20}$$ determinants, far beyond the practical capacity of conventional FCI for that fragment. TrimSQD instead uses quantum-sampled candidate configurations and a distributed classical selected-space calculation.

The T4-lysozyme-n-butylbenzene model includes 2,986 retained water molecules and provides a contrasting noncovalent, dispersion-influenced binding environment. The study uses both the minimal STO-3G basis and a mixed basis in which 3-21G is assigned to the ligand and selected nearby protein residues while STO-3G is retained elsewhere. The refined treatment also tightens the correlated bath threshold near the binding site. These calculations are different finite-basis electronic problems and should not be presented as numerical approximations to one identical Hamiltonian.

### Fragment-Level Accuracy

The publication compares representative TrimSQD fragment energies with high-accuracy classical DMRG calculations for the same embedded problems. The largest reported fragment comparisons are:

| Molecular System | Fragment Active Space | Energy Error Relative to DMRG |
| --- | --- | ---: |
| Trypsin-benzamidine, STO-3G | (66e, 45o) | 0.10 mHa |
| T4-lysozyme, STO-3G | (36e, 35o) | 0.16 mHa |
| T4-lysozyme, mixed basis | (34e, 42o) | 2.23 mHa |

These errors assess the correlated solver for particular embedded fragment Hamiltonians; they are not uncertainties or errors for the entire protein-ligand electronic binding energies. DMRG is a high-accuracy numerical reference here rather than an exact full-system FCI calculation. The results show that large selected configuration spaces can recover demanding fragment energies accurately, but full molecular accuracy also depends on the embedding approximation and energy reconstruction.

### Published Electronic Binding Energies

The reported calculations compare the EWF-TrimSQD workflow with classical EWF-CCSD under corresponding model treatments:

| Molecular System | Treatment | EWF-CCSD (kcal/mol) | EWF-TrimSQD (kcal/mol) |
| --- | --- | ---: | ---: |
| Trypsin-benzamidine | STO-3G | +28.46 | +35.89 |
| Trypsin-benzamidine | STO-3G with electrostatic correction | -130.59 | -131.32 |
| T4-lysozyme-n-butylbenzene | STO-3G | +10.45 | +9.30 |
| T4-lysozyme-n-butylbenzene | Mixed STO-3G / 3-21G | -17.31 | -21.07 |

Both minimal-basis uncorrected calculations yield positive binding energies under the stated convention. The refined mixed-basis T4-lysozyme result is negative, while the additional electrostatic correction changes the sign of the trypsin-benzamidine energy. These substantial shifts emphasize the importance of the orbital basis, long-range environment, and reconstruction scheme. Agreement between EWF-CCSD and EWF-TrimSQD within a comparable embedding treatment is informative about the different fragment solvers, but does not establish chemical accuracy against experimental binding free energies.

## Performance Metrics and Scaling

The main performance variables are molecular size, number and size of embedded fragments, quantum circuit resources, sampling budgets, selected-subspace dimensions, GPU memory and communication, and the time required by the complete heterogeneous workflow. For meaningful comparisons, these should be associated with the accuracy achieved for the target fragment or binding-energy observable.

### Quantum Sampling and Circuit Resources

The September 2026 revision reports aggregate quantum usage across multiple calculations, not the resources required for one fragment or one complete binding-energy evaluation.

| Resource | Reported Aggregate or Maximum |
| --- | ---: |
| IBM quantum processors | 2 Heron r2 devices, 156 qubits each |
| Maximum qubits used in one computation | 94 |
| Total circuits | 21,006 |
| Aggregate QPU execution | More than 239 hours |
| Measurement outcomes | Approximately 3.0 billion |

Representative compiled quantum circuits have the following resources:

| Fragment | One-Qubit Gates | Two-Qubit Gates | Two-Qubit Depth |
| --- | ---: | ---: | ---: |
| Trypsin fragment 3211 | 95,844 | 5,758 | 246 |
| T4-lysozyme fragment 2580 | 62,598 | 3,820 | 176 |
| T4-lysozyme mixed-basis fragment 1801 | 78,916 | 5,346 | 202 |

The study uses representative fragment sampling budgets between $$2.5\times10^4$$ and $$5.0\times10^5$$ shots. Neither the compiled depth nor a fixed number of shots establishes the attainable electronic accuracy independently of circuit noise, the sampling distribution, recovery efficiency, and the subsequent selected-space solver.

### Selected-Subspace and GPU Scaling

The determinant-space reduction can be expressed through the selected fraction $$f_{\mathrm{sub}}=D_{\mathrm{selected}}/D_{\mathrm{FCI}}$$, but a small fraction can still correspond to billions of determinants when the full configuration space is extremely large. A useful performance report should distinguish dimensions after quantum recovery, subgroup trimming, combined trimming, Hamiltonian-connected extension, and final diagonalization. Energy error must be reported alongside the corresponding space sizes and sampling costs.

The distributed eigensolver repeatedly evaluates the action $$\mathbf{y}=H_{\mathcal{S}}\mathbf{x}$$. For an explicitly specified sparse connectivity structure, the operation count can be characterized in terms of the number of nonzero Hamiltonian contributions, but the SBD-G implementation generates the action without storing the complete sparse matrix. Actual performance depends on determinant excitation generation, memory layout, communication, and GPU execution efficiency.

The publication reports approximately 72.5% strong-scaling parallel efficiency for a representative TrimSQD calculation at 64 nodes. Using $$P_0$$ as the baseline node count, the conventional definition is

$$
\eta_{\mathrm{parallel}}(P)
=\frac{T(P_0)}{(P/P_0)T(P)}.
$$

The study also reports selected spaces of approximately $$2^{32}\approx4.29\times10^9$$ configurations and individual GPU-accelerated matrix-vector multiplications taking approximately 11 seconds or less at sufficiently large node counts. This is a kernel benchmark, not the time required for a complete eigenvalue calculation, fragment solution, or molecular binding-energy prediction.

The reported comparison of ExtSQD and TrimSQD for three trypsin fragments illustrates the accuracy-cost tradeoff:

| Fragment | Active Space | ExtSQD Error (mHa) | TrimSQD Error (mHa) | ExtSQD Time (min) | TrimSQD Time (min) |
| --- | --- | ---: | ---: | ---: | ---: |
| 178 | (36e, 35o) | 14.091 | 2.323 | 31 | 43 |
| 1098 | (34e, 33o) | 6.608 | 0.437 | 42 | 56 |
| 3211 | (66e, 45o) | 0.604 | 0.098 | 39 | 11 |

All three TrimSQD fragment energies are closer to the DMRG references in these reported runs, but the solver is not faster in every case. Fragments 178 and 1098 show improved accuracy at greater runtime, whereas fragment 3211 shows improvements in both metrics. These results should not be generalized without accounting for hardware, configuration selection, and differing active spaces.

The primary publication also contrasts the earlier 303-atom Trp-cage study, whose cited fragment energy deviation was approximately 21 mHa, with the approximately 0.10 mHa deviation for the largest trypsin fragment. The roughly 210-fold ratio applies specifically to this cross-study fragment-error comparison; it does not imply the same improvement in reconstructed binding-energy accuracy. Similarly, the increase from 303 atoms to 12,635 atoms is more than 40-fold in molecular size, not in quantum algorithmic speed.

### Automated Molecular Workflow

For the **bound T4-lysozyme complex in the mixed basis**, the study reports execution from fragment construction through molecular energy reconstruction using the coordinated quantum-classical workflow:

| Metric | Reported Value |
| --- | ---: |
| Elapsed wall-clock time | 62.4 hours |
| Quantum circuits | 4,296 |
| Measurement outcomes | 608 million |
| Aggregate QPU execution | 50.0 hours |
| GPU/HPC node-hours | 7,620 |

This is the timing of the *bound-complex calculation*, not of a complete binding-energy prediction; additional calculations of the unbound protein environment and isolated ligand are required. The overlap of QPU and HPC tasks also means that aggregate resource-hours should not be summed and interpreted as elapsed runtime.

At fixed locality and bounded fragment dimensions, per-fragment construction and some correlated computations may remain approximately constant as the molecular system grows. However, the number of fragments, global molecular preprocessing, total QPU sampling, selected-space processing, scheduling, and reconstruction introduce additional cost. Practical limits can arise from available physical qubits, circuit fidelity, shot budgets, selected-space size, GPU memory, inter-node communication, or missing nonlocal correlations. There is no universal molecular-size or fragment-size breaking point independent of the target accuracy and hardware configuration.

## Comparative Evaluation and Crossing-Point Analysis

EWF-TrimSQD should be compared with methods that solve the same embedded Hamiltonians and reconstruct the same molecular observables. The most direct classical reference for the reported protein-scale applications is EWF-CCSD, although CCSD is itself an approximate, nonvariational fragment solver. Classical FCI or high-accuracy DMRG provides a more stringent fragment-level reference where feasible; classically selected CI provides a particularly informative baseline for assessing whether the *quantum* sampling stage identifies useful determinants more efficiently than classical selection.

| Method | Computational Paradigm | Fragment Solver or Representation | Principal Limitation |
| --- | --- | --- | --- |
| EWF-FCI | Classical computational | Full fragment configuration interaction | Combinatorial fragment-space growth |
| EWF-CCSD | Classical computational | Coupled-cluster singles and doubles | CCSD truncation and embedding error |
| EWF-selected CI | Classical computational | Classically selected determinant spaces | Selection and classical diagonalization cost |
| EWF-DMRG | Classical computational | Tensor-network fragment solver | Bond dimension and convergence |
| EWF-ExtSQD | Hybrid quantum-classical | Quantum sampling with extended subspace diagonalization | Selected-space completeness |
| EWF-TrimSQD | Hybrid quantum-classical | Quantum sampling, two-stage trimming, and SBD-G | Sampling and heterogeneous workflow cost |

To assess the fragment solver, calculations should use *fixed, identical embedded Hamiltonians* and compare energies with independent accurate references. For EWF-CCSD and TrimSQD, the difference

$$
\Delta E_c=\left\lvert E_c^{\mathrm{TrimSQD}}-E_c^{\mathrm{CCSD}}\right\rvert
$$

measures agreement between the solvers, but not which is closer to the exact fragment eigenvalue. At the molecular level, differences between reconstructed binding energies additionally incorporate the embedding approximation, environment treatment, and energy reconstruction. These are separate comparisons and should not be conflated.

The role of quantum sampling should also be separated from the contribution of SBD-G. A GPU-accelerated projected eigensolver can improve classical determinant subspace calculations regardless of how those determinants were identified. Benchmarking quantum-assisted selection against classical selected-CI or other determinant-generation procedures using the same final diagonalization infrastructure is therefore important for attributing any advantage to the quantum component.

For a problem family characterized by molecular or fragment size $$N$$ and target observable accuracy $$\varepsilon$$, the relevant metric is the complete time-to-solution $$T_{\mathrm{solve}}(N,\varepsilon)$$. It must include global mean-field preprocessing, orbital localization, bath and integral construction, quantum circuit preparation and execution, configuration recovery, trimming, extension, distributed diagonalization, and energy reconstruction. For a full binding-energy benchmark, the costs of the bound complex, unbound protein environment, and isolated ligand must be included, together with any electrostatic corrections.

A computational crossing point between EWF-TrimSQD and a classical alternative may be defined by

$$
T_{\mathrm{EWF-TrimSQD}}(N^*,\varepsilon)
=T_{\mathrm{classical}}(N^*,\varepsilon),
$$

with both sides measured under equivalent physical conditions and a common accuracy criterion. Resource-hours and elapsed time should be reported separately because the workflows may use different parallel scheduling. Relevant studies include quantum shots versus fragment energy error, selected-space dimension versus diagonalization cost, GPU strong scaling, locality and bath thresholds versus binding-energy convergence, and total workload versus molecular size. Any crossing-point estimate should identify whether it is measured or extrapolated.

The published results establish the feasibility of integrating quantum sampling, large-scale selected-space diagonalization, and localized electronic embedding in protein-scale calculations. They demonstrate improvements over ExtSQD for selected fragment comparisons and efficient coordination of quantum and classical resources. They do not, by themselves, establish a general quantum computational advantage or experimentally validated chemical accuracy for protein-ligand binding energies.

## Applied Problem Links

{% assign applied_problem = site.problems | where: "title", "Quantum Chemistry of Protein-Ligand Complexes" | first %}
{% if applied_problem %}
[Quantum Chemistry of Protein-Ligand Complexes]({{ applied_problem.url | relative_url }}) — Heterogeneous quantum-classical calculations of embedded electronic states and binding-energy differences in trypsin-benzamidine and T4-lysozyme-n-butylbenzene.
{% else %}
**Quantum Chemistry of Protein-Ligand Complexes** — Protein-scale electronic-structure calculations using localized EWF and quantum-assisted fragment solvers.
{% endif %}

## Reproducibility

Reproducing the calculations requires both a complete physical model specification and detailed records of the distributed numerical workflow. Molecular inputs must include the protein and ligand structures, protonation and charge assignments, explicit solvent configuration, electron count and spin sector, orbital basis, frozen-core treatment, Hartree-Fock reference, and conventions for generating the electronic Hamiltonian. The fragment assignment, localized orbital definitions, bath-construction procedure, occupation thresholds, spatial cutoffs, buffer regions, and final embedded Hamiltonians must also be recorded. This information is essential for distinguishing physical model differences from changes in numerical approximation.

For each quantum-sampled fragment, a reproducible record should identify the state-preparation ansatz, circuit parameters, fermion-to-qubit mapping, physical qubit layout, transpiled one- and two-qubit gate counts, depth, shot count, backend, and relevant calibration information. Raw or processed occupation bitstrings, random seeds, and independent-run counts should be retained where available. The configuration recovery, carryover, subgroup definitions, trimming fractions $$k_1$$ and $$k_2$$, Hamiltonian-connected extension, final selection thresholds, and selected-space dimensions must be documented separately from the circuit resources.

Classical diagonalization records should include the SBD-G version, selected-determinant data structures, numerical eigensolver and convergence settings, precision, GPU architecture, node counts, memory allocation, matrix-vector timings, and total fragment solution times. The orchestration specification should identify the workflow controller, QPU and HPC scheduler interfaces, solver assignment rules, job concurrency limits, checkpoint and restart procedures, queueing time, quantum execution time, classical resource-hours, and actual end-to-end elapsed time. These values permit reproduction of both the physical results and the measured computational performance.

Molecular energy reconstruction must be specified through the fragment density matrices, two-particle cumulants, correlation-energy partitioning, overlap handling, long-range electrostatic treatment, and the total energies used for the bound, unbound, and ligand systems. Reported numerical datasets should include fragment Hamiltonians or sufficient data to regenerate them, reference fragment energies, selected-space convergence data, molecular total and binding energies, uncertainties, runtime logs, and scaling measurements.

The primary study describes research implementations of EWF, TrimSQD, and SBD-G, together with Prefect-based workflow orchestration and IBM Quantum Runtime. No verified public repository for the complete study-specific workflow is assigned in the present Solution metadata; the `code_repository` and `data_repository` fields are therefore left blank rather than populated with speculative links. Exact software revisions and execution scripts should be supplied when available.

## Primary References

Kenneth M. Merz, Jr., Akhil Shajan, Danil Kaliakin, Fangchun Liang, et al., “Crossing the 12,000-atom barrier with heterogeneous quantum-classical supercomputing: quantum chemistry of protein-ligand complexes,” arXiv:2605.01138v2 (September 2026). [arXiv preprint](https://arxiv.org/abs/2605.01138v2). [Full-text HTML](https://arxiv.org/html/2605.01138v2).

Akhil Shajan et al., “Molecular Quantum Computations on a Protein,” *Journal of Chemical Theory and Computation* (2026). [DOI: 10.1021/acs.jctc.6c00364](https://doi.org/10.1021/acs.jctc.6c00364).

Max Nusspickel and George H. Booth, “Systematic Improvability in Quantum Embedding for Real Materials,” *Physical Review X* **12**, 011046 (2022). [DOI: 10.1103/PhysRevX.12.011046](https://doi.org/10.1103/PhysRevX.12.011046).

Javier Robledo-Moreno et al., “Chemistry beyond the scale of exact diagonalization on a quantum-centric supercomputer,” *Science Advances* **11**, eadu9991 (2025).

H. Zhang and M. J. Otten, “From Random Determinants to the Ground State,” arXiv:2511.14734 (2025). [arXiv preprint](https://arxiv.org/abs/2511.14734).

### Supporting Resources

[Protein-scale EWF-TrimSQD study (PDF)](https://arxiv.org/pdf/2605.01138v2). [IBM Quantum documentation](https://quantum.cloud.ibm.com/docs). [Prefect workflow documentation](https://docs.prefect.io/).
