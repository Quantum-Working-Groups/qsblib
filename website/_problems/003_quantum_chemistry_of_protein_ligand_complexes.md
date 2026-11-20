---
layout: problem
title: "Quantum Chemistry of Protein-Ligand Complexes"
summary: "Benchmarking quantum-mechanical ground-state and binding-energy calculations for biologically relevant protein-ligand complexes containing over 10,000 atoms, including trypsin-benzamidine and T4-lysozyme-n-butylbenzene, across electrostatic and dispersion-dominated binding regimes."
published: true
submitted_by: "Eric D. Switzer"
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
  interactions:
    - "Long-range"
    - "Many-body"
  symmetry_constraints:
    - "Continuous"
    - "Conservation laws"
  phases_physical_regimes:
    - "Electronic"
  composition_constituents:
    - "Organic"
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
  hamiltonian_or_action: "Nonrelativistic many-electron molecular Hamiltonian under the Born-Oppenheimer approximation"
  system_size: "Two protein-ligand complexes containing 12,635 and 11,608 atoms"
  model_parameters:
    molecular_systems:
      - name: "Trypsin-benzamidine"
        atoms: 12635
        spatial_orbitals: 31795
        electrons: 43858
        basis_set: "STO-3G"
        pdb_id: "3PTB"
        solvent_water_molecules: 3135

      - name: "T4-lysozyme-n-butylbenzene"
        atoms: 11608
        spatial_orbitals_sto3g: 28844
        spatial_orbitals_mixed: 29455
        electrons: 39880
        basis_sets:
          - "STO-3G"
          - "Mixed STO-3G / 3-21G"
        pdb_id: "4W57"
        solvent_water_molecules: 2986

    solvent_cutoff: "10 Angstrom from the protein boundary"
    binding_regimes:
      - "Electrostatic"
      - "Dispersion"
    electronic_structure: "Ground-state molecular electronic structure"

  boundary_conditions: "Finite molecular complexes with explicitly retained solvent molecules; no periodic boundary conditions"
  initial_conditions: "Not applicable; electronic ground-state problem"
  target_observable: "Ground-state total electronic energies and protein-ligand binding-energy differences"
  target_accuracy: "Chemical accuracy (~1 kcal/mol) is an aspirational target; report errors against specified classical or experimental references and distinguish fragment accuracy from full binding-energy accuracy"
  units: "Hartree (Ha), milli-Hartree (mHa), kcal/mol, and Angstrom"
---

## Scientific Question

Accurately predicting the binding of small molecules to proteins is a central challenge in computational chemistry and molecular biophysics. Protein-ligand interactions arise from a delicate balance of electrostatics, dispersion, polarization, exchange, and electronic correlation, often involving molecular systems containing thousands of atoms. Although high-accuracy wavefunction methods are well established for small molecules, extending their computational capabilities to entire protein-ligand complexes remains difficult because of the rapid growth of electronic configuration spaces and the associated computational and memory requirements.

This benchmark investigates the ground-state electronic energies and binding-energy differences of large protein-ligand complexes containing more than 10,000 atoms. The objective is to determine whether computational methods can retain sufficient accuracy in the underlying electronic structure while scaling to biologically relevant molecular sizes. Particular attention is given to the relationship between the accuracy of local electronic-structure calculations and that of the reconstructed molecular binding energy, since small errors distributed across a large system can substantially influence the final energy difference.

Two representative protein-ligand systems are considered. The trypsin-benzamidine complex contains 12,635 atoms and provides a test of binding strongly influenced by electrostatic interactions involving charged molecular groups. The T4-lysozyme-n-butylbenzene complex contains 11,608 atoms and represents a contrasting regime in which dispersion and hydrophobic interactions contribute substantially to molecular recognition. Both models include explicitly retained water molecules and electronic basis sets containing tens of thousands of spatial orbitals.

The computational problem is to solve, or systematically approximate, the molecular electronic ground-state problem for the bound complex and its separated components under consistent physical conditions. The resulting total energies are combined to obtain the electronic binding-energy difference. Unlike an isolated small-molecule calculation, this requires controlling electronic correlation and long-range molecular interactions across a highly heterogeneous environment, where the binding energy is obtained from differences between very large total energies.

The benchmark supports comparisons between classical correlated wavefunction methods, localized electronic-structure approaches, and hybrid quantum-classical algorithms. It is particularly relevant for assessing whether localized descriptions of electronic correlation can reduce the computational burden without losing the interactions necessary for accurate molecular energetics. The physical problem and target observables are defined independently of the computational method used to evaluate them.

## Physical Model Definition

### Molecular Electronic Hamiltonian

The protein-ligand systems are described by the nonrelativistic molecular electronic Hamiltonian within the Born-Oppenheimer approximation, in which the nuclear positions are fixed during the electronic-structure calculation. In atomic units, the molecular Hamiltonian, including the nuclear repulsion contribution, is

$$
\hat{H}
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
E_{\mathrm{nuc}},
$$

where $$N_e$$ and $$N_n$$ denote the numbers of electrons and nuclei, respectively; $$\mathbf{r}_i$$ and $$\mathbf{R}_A$$ are their positions; and $$Z_A$$ is the nuclear charge. The nuclear repulsion energy is

$$
E_{\mathrm{nuc}}
=
\sum_{A<B}
\frac{Z_AZ_B}
{\lvert\mathbf{R}_A-\mathbf{R}_B\rvert}.
$$

The electronic ground state satisfies the eigenvalue equation

$$
\hat{H}\lvert\Psi_0\rangle
=
E_0\lvert\Psi_0\rangle,
$$

where $$\lvert\Psi_0\rangle$$ is the ground-state electronic wavefunction and $$E_0$$ is the total Born-Oppenheimer energy for the specified nuclear geometry.

In a finite spin-orbital basis, the Hamiltonian takes the second-quantized form

$$
\hat{H}
=
\sum_{pq}
h_{pq}a_p^\dagger a_q
+
\frac{1}{2}
\sum_{pqrs}
g_{pqrs}
a_p^\dagger a_q^\dagger a_s a_r
+
E_{\mathrm{nuc}},
$$

where $$a_p^\dagger$$ and $$a_p$$ are fermionic creation and annihilation operators, and $$h_{pq}$$ and $$g_{pqrs}$$ are the one- and two-electron integrals under the chosen operator convention. This formulation provides a common Hamiltonian for classical wavefunction methods, approximate electronic-structure approaches, and quantum-assisted eigensolvers.

### Electronic Degrees of Freedom and Molecular Scale

The principal quantum degrees of freedom are interacting electrons occupying molecular spin-orbitals. For $$N_e$$ electrons distributed among $$M$$ spatial orbitals, the dimension of the full fixed-electron-number configuration space is

$$
D_{\mathrm{FCI}}
=
\binom{2M}{N_e}.
$$

This combinatorial scaling makes a direct full configuration interaction calculation impossible for the molecular sizes considered here. Even after exploiting electron-number and spin symmetries, the corresponding many-electron spaces remain far beyond practical classical storage and diagonalization.

The benchmark systems have the following electronic dimensions:

| Molecular System | Atoms | Electrons | Spatial Orbitals |
| --- | ---: | ---: | ---: |
| Trypsin-benzamidine, STO-3G | 12,635 | 43,858 | 31,795 |
| T4-lysozyme-n-butylbenzene, STO-3G | 11,608 | 39,880 | 28,844 |
| T4-lysozyme-n-butylbenzene, mixed basis | 11,608 | 39,880 | 29,455 |

The orbital count depends on the selected basis set and is therefore part of the benchmark specification. Calculations using different orbital bases correspond to different finite-basis Hamiltonians and should not be treated as identical numerical problems.

### Molecular Geometry and Interaction Regimes

The first system is the trypsin-benzamidine complex, based on Protein Data Bank structure **3PTB**. Trypsin is a serine protease, while benzamidine is a well-characterized inhibitor that binds within a charged protein pocket. The model contains 12,635 atoms, including 3,135 explicitly retained water molecules, and is represented using 31,795 spatial orbitals in the STO-3G basis. Binding is strongly influenced by electrostatic interactions involving the positively charged benzamidinium ligand and the surrounding protein environment.

The second system is T4-lysozyme complexed with n-butylbenzene, based on Protein Data Bank structure **4W57**. This model provides an example of hydrophobic molecular recognition in which dispersion and other noncovalent interactions play an important role. The system contains 11,608 atoms and 2,986 retained water molecules. Its electronic structure is described using 28,844 spatial orbitals in the STO-3G basis or 29,455 spatial orbitals in a refined mixed-basis representation.

Both molecular models are treated as finite, isolated systems without periodic boundary conditions. The surrounding environment is represented explicitly through water molecules retained within a 10 Å cutoff from the protein boundary. Molecular geometry, protonation states, solvent composition, and electronic charge distributions must be specified consistently, since each can significantly affect the calculated binding-energy difference.

### Electronic Interactions and Physical Regimes

The molecular Hamiltonian contains electron kinetic energy, electron-nuclear attraction, electron-electron repulsion, and nuclear repulsion. The resulting correlated electronic structure determines the electrostatic, exchange, polarization, and dispersion contributions relevant to molecular binding. These interactions span different spatial scales: local electron correlation can strongly influence individual molecular regions, while electrostatic interactions between charged groups may remain significant across much larger distances.

The trypsin-benzamidine and T4-lysozyme-n-butylbenzene complexes represent complementary interaction regimes. The former emphasizes the sensitivity of binding energetics to long-range electrostatics and molecular charge redistribution, whereas the latter highlights the importance of noncovalent correlation and basis-set quality in a hydrophobic binding environment. Both require a consistent treatment of local electronic structure and the interactions connecting different molecular regions.

The nonrelativistic electronic Hamiltonian conserves electron number and, in the absence of spin-dependent interactions, total spin. These biomolecular systems do not generally possess the high spatial symmetries associated with idealized molecules or crystals. Their classification as electrostatic- and dispersion-dominated systems describes molecular binding mechanisms rather than thermodynamic phases.

## Target Property

The primary target is the electronic binding-energy difference between the protein-ligand complex and its separated components. This quantity is obtained from three molecular ground-state calculations and is sensitive to the consistency of the physical approximations used for each system.

### Ground-State and Binding Energies

For a specified molecular Hamiltonian, the ground-state energy is determined by the variational principle,

$$
E_0
=
\min_{\lvert\Psi\rangle\neq0}
\frac{
\langle\Psi\rvert\hat{H}\lvert\Psi\rangle
}{
\langle\Psi\vert\Psi\rangle
}.
$$

The minimization is performed for fixed nuclear coordinates, electron number, orbital basis, and relevant symmetry constraints. The resulting total energy includes the nuclear repulsion contribution.

The protein-ligand electronic binding energy is defined as

$$
E_{\mathrm{binding}}
=
E_{\mathrm{bound}}
-
E_{\mathrm{unbound}}
-
E_{\mathrm{ligand}},
$$

where $$E_{\mathrm{bound}}$$ is the total energy of the bound protein-ligand complex, $$E_{\mathrm{unbound}}$$ is the energy of the corresponding unbound protein environment, and $$E_{\mathrm{ligand}}$$ is the energy of the isolated ligand. With this sign convention, a negative binding energy indicates that the bound configuration is energetically favored relative to the specified separated components.

The binding-energy calculation involves subtracting large molecular total energies to obtain a comparatively small difference. As a result, errors in electronic correlation, the molecular environment, or the reconstruction of total energies may produce substantial errors in the final binding energy. Accuracy in individual molecular fragments is therefore necessary for many computational approaches but is not sufficient to establish accuracy in the complete binding-energy difference.

These electronic binding energies must also be distinguished from experimental binding free energies. The latter generally depend on additional contributions from conformational sampling, entropy, solvent reorganization, structural relaxation, and thermodynamic conditions. The benchmark addresses the specified electronic-energy problem rather than a complete prediction of equilibrium binding free energies.

### Binding-Energy Accuracy and Supplementary Observables

For an estimated binding energy and a reference obtained under matched physical conditions, define the absolute error as

$$
\Delta E_{\mathrm{binding}}
=
\left\lvert
E_{\mathrm{binding}}^{\mathrm{method}}
-
E_{\mathrm{binding}}^{\mathrm{ref}}
\right\rvert.
$$

A commonly desired target for molecular energy differences is approximately 1 kcal/mol, equivalent to about 1.59 mHa, using the conversion $$1\ \mathrm{Ha}\approx627.5095\ \mathrm{kcal/mol}$$. This chemical-accuracy threshold provides a useful benchmark objective but is not automatically achieved by accurate fragment calculations or agreement between approximate methods.

Supplementary observables include the separate ground-state energies of the bound and unbound systems, fragment correlation energies, one- and two-particle reduced density matrices, and convergence of the electronic energy with respect to orbital basis and fragment size. For embedding-based methods, the sensitivity to bath truncation, orbital localization, and the treatment of long-range interactions is particularly informative. These quantities help distinguish errors in the local electronic-structure solver from those introduced when reconstructing the full molecular energy.

## Problem Parameters and Conditions

The benchmark includes two protein-ligand complexes with different dominant binding mechanisms and electronic environments. The molecular structures, solvent configurations, electronic basis sets, and charge states define the physical calculations and must be recorded for reproducible comparisons.

| Parameter | Trypsin-Benzamidine | T4-Lysozyme-n-Butylbenzene |
| --- | --- | --- |
| Atoms | 12,635 | 11,608 |
| Electrons | 43,858 | 39,880 |
| Dominant binding interaction | Electrostatic | Dispersion and hydrophobic |
| PDB structure | 3PTB | 4W57 |
| Retained water molecules | 3,135 | 2,986 |
| Solvent cutoff | 10 Å | 10 Å |
| Baseline basis | STO-3G | STO-3G |
| Baseline spatial orbitals | 31,795 | 28,844 |
| Refined basis | — | Mixed STO-3G / 3-21G |
| Refined spatial orbitals | — | 29,455 |

The baseline calculations use the STO-3G minimal basis. For the refined T4-lysozyme calculation, 3-21G is applied to the ligand and protein residues containing at least one atom within 3 Å of the ligand, while STO-3G is retained elsewhere. This mixed-basis treatment increases the orbital resolution near the binding site without imposing the more expensive basis throughout the full protein complex.

The choice of basis is particularly important because the benchmark involves a balance of electrostatic and dispersion interactions. Minimal basis sets can introduce substantial errors in molecular polarization and correlation, and improvements in the local basis may change the predicted binding-energy difference. Results obtained with different orbital bases must therefore be identified as separate benchmark conditions.

The charge and protonation states of the protein, ligand, and surrounding environment require equally careful specification. In the trypsin-benzamidine system, the charged ligand contributes substantially to the electrostatic interactions, making the calculated binding energy sensitive to long-range charge distributions and the treatment of the separated components. Water positions and molecular geometries must remain consistent with the intended physical comparison, since changes in the molecular environment can alter the interaction energy independently of the electronic-structure method.

The principal accuracy target is the reconstructed binding-energy difference, although convergence of the underlying total energies and local electronic-structure calculations is also essential. Every computational result should identify the bound, unbound, and ligand energies, the resulting binding-energy difference, the basis set, relevant molecular charge states, and the treatment of long-range interactions. Numerical convergence and uncertainties should be reported at the level necessary to distinguish meaningful physical differences from computational errors.

## Computational Challenges

The dominant challenge is the enormous electronic configuration space associated with biomolecular systems containing tens of thousands of electrons and orbitals. Conventional high-accuracy wavefunction methods become prohibitively expensive when applied directly to the complete molecular Hamiltonian. The problem is therefore to retain the electronic correlations relevant to molecular binding without explicitly representing the full many-electron wavefunction.

Global electronic-structure operations introduce additional computational bottlenecks. In conventional embedded wavefunction implementations, construction of correlated fragment environments and transformation of electron-repulsion integrals can involve costs scaling approximately as $$\mathcal{O}(M^3)$$ with the total molecular orbital count $$M$$, depending on the implementation. At protein-scale orbital counts, such operations can dominate runtime and memory requirements before the correlated fragment eigenvalue problems are solved.

The spatial locality of many electronic correlations provides an opportunity to reduce these costs. Embedding approaches approximate a large molecular system through smaller subsystems coupled to an effective electronic environment. However, their accuracy depends on the retained bath orbitals, the treatment of correlations between fragments, and the reconstruction of the full molecular energy. Aggressive localization may reduce computational work while omitting contributions important to the target binding energy.

Long-range electrostatic interactions create a particularly difficult case for localized approaches. In the trypsin-benzamidine complex, charged molecular groups can interact over distances substantially larger than those required to describe local electronic correlation. Converged fragment energies therefore do not guarantee that the long-range interaction energy is accurately reconstructed. A meaningful calculation must distinguish the convergence of local correlation contributions from the treatment of the electrostatic environment.

Dispersion-dominated binding introduces a different sensitivity. In the T4-lysozyme-n-butylbenzene complex, noncovalent stabilization depends on a sufficiently accurate description of electronic correlation, polarization, and orbital basis effects. Minimal basis sets may fail to capture relevant components of these interactions, while an improved basis increases the computational cost of the underlying correlated electronic-structure calculations. The benchmark consequently tests both the accuracy of the correlated treatment and its sensitivity to the finite-basis representation.

Large-scale parallel execution is another important challenge. Localized calculations can generate many fragment problems with differing sizes and computational requirements, creating demands for efficient scheduling, memory management, distributed eigensolvers, and load balancing. Quantum-assisted approaches introduce further overhead from state preparation, sampling, noise mitigation, configuration selection, and classical diagonalization. These costs must be included when evaluating the computational efficiency of the complete molecular calculation.

## Accuracy and Validation Criteria

A successful solution should reproduce reliable electronic ground-state energies and binding-energy differences under the specified molecular conditions. The primary validation criterion is agreement with a clearly identified reference for the complete binding-energy difference, with consistent geometries, basis sets, electron counts, charge states, solvent environments, and electrostatic corrections.

For methods based on localized electronic fragments, accuracy should also be evaluated at the fragment level. If $$E_c^{\mathrm{method}}$$ is the calculated energy of embedded fragment $$c$$ and $$E_c^{\mathrm{ref}}$$ is an appropriate reference for the same fragment Hamiltonian, define

$$
\Delta E_c
=
\left\lvert
E_c^{\mathrm{method}}
-
E_c^{\mathrm{ref}}
\right\rvert.
$$

Classical FCI, selected configuration interaction, or converged DMRG calculations can provide fragment-level references where computationally feasible. These comparisons isolate the accuracy of the embedded eigensolver from the approximation introduced by embedding and molecular energy reconstruction.

The distinction is essential because a small fragment error does not establish a comparably small error in the final binding energy. The reconstructed energy also depends on the completeness of the fragment environments, the partitioning of electronic correlation, and the treatment of interactions between distant molecular regions. A computational method may reproduce fragment energies to sub-milli-Hartree accuracy while retaining much larger errors in global molecular energy differences.

Validation should therefore include convergence with respect to electronic basis size, fragment and bath definitions, localized orbital cutoffs, and the numerical tolerances of the correlated solvers. For quantum-assisted methods, configuration-sampling uncertainty, selected-subspace truncation, and hardware errors should be reported separately from the approximations inherent to the molecular embedding.

Physical consistency requires the correct electron number, charge distribution, and applicable spin constraints. Comparisons to experimental binding measurements must distinguish electronic interaction energies from thermodynamic binding free energies. Where no sufficiently accurate full-system reference exists, the result should be presented as an approximate prediction with clearly identified assumptions and uncertainties rather than as an exact benchmark validation.

## Comparative Solutions and Performance

The benchmark supports comparisons between classical electronic-structure methods and heterogeneous quantum-classical approaches. The primary study investigates embedded wavefunction calculations using both conventional correlated fragment solvers and quantum-sampled configuration-space diagonalization. These approaches address the same molecular energy problem but differ in their treatment of the correlated fragment wavefunctions and their computational resource requirements.

### Representative Solution Methods

| Solution | Computational Paradigm | Primary Approach | Principal Limitation |
| --- | --- | --- | --- |
| Density Functional Theory | Classical computational | Approximate electronic density functional | Functional-dependent errors |
| Coupled-Cluster Singles and Doubles | Classical computational | Truncated coupled-cluster wavefunction | Correlation approximation and computational scaling |
| Selected Configuration Interaction | Classical computational | Selected determinant expansion | Subspace completeness and computational cost |
| Density Matrix Renormalization Group | Classical computational | Tensor-network wavefunction optimization | Bond-dimension growth |
| EWF-CCSD | Classical computational | Embedded wavefunction calculations with CCSD fragment solvers | Embedding and fragment correlation errors |
| EWF-TrimSQD | Hybrid quantum-classical | Quantum-sampled fragment configurations and classical diagonalization | Sampling, selected-space accuracy, and heterogeneous resource overhead |

Classical methods provide important reference calculations and establish the accuracy attainable with conventional electronic-structure approximations. EWF-CCSD constructs localized electronic environments and solves the associated fragment problems using coupled-cluster singles and doubles. Selected configuration interaction and DMRG provide additional approaches to approximating correlated fragment wavefunctions, with their computational costs determined by the selected determinant space or tensor-network representation.

The hybrid EWF-TrimSQD approach uses quantum processors to generate electronic configurations for selected embedded fragments. The sampled configurations are processed using classical recovery and selection procedures, after which the fragment Hamiltonians are diagonalized using high-performance classical computing resources. The resulting local correlation information is combined within the embedded wavefunction framework to reconstruct the molecular total energies.

The published workflow addresses several distinct computational bottlenecks. Localized orbital and integral construction reduce the dependence of individual fragment calculations on the full molecular size, while TrimSQD improves configuration selection through additional trimming and diagonalization stages. GPU-accelerated Selected-Basis Diagonalization (SBD-G) increases the computational capacity available for large selected spaces, and automated workflow orchestration coordinates the quantum and classical resources.

Under fixed spatial cutoffs and approximately bounded local orbital density, the reported per-fragment construction cost can become approximately $$\mathcal{O}(1)$$ with respect to the total molecular orbital count. This locality result applies to individual fragment construction and does not imply constant scaling for the complete molecular workflow. The total number of fragments increases with system size, and global mean-field preprocessing, fragment eigensolvers, and energy reconstruction retain their own computational costs.

### Published Computational Resources

The September 2026 revision of the primary study reports a heterogeneous execution environment involving IBM quantum processors and multiple supercomputers.

| Resource | Reported Usage |
| --- | --- |
| Quantum processors | IBM `ibm_cleveland` and `ibm_kobe` |
| QPU architecture | Two 156-qubit Heron r2 processors |
| Maximum qubits used in one computation | 94 |
| Quantum circuits | 21,006 |
| Aggregate QPU execution time | More than 239 hours |
| Measurement outcomes | Approximately 3.0 billion |
| Supercomputers | Fugaku, Miyabi-G, and ROQUO |
| TrimSQD parallel efficiency | Approximately 72.5% at 64 nodes |

The quantum circuit count, aggregate processor time, and measurement totals summarize multiple calculations in the study. They should not be interpreted as the resources required for one fragment or one complete binding-energy evaluation. The reported parallel efficiency likewise applies to a particular GPU-accelerated configuration rather than representing a universal scaling property.

### Fragment-Level Accuracy

The publication compares representative quantum-assisted fragment calculations against classical DMRG reference energies. For the largest reported fragments, the results are:

| Molecular System | Largest Fragment Active Space | Energy Error Relative to DMRG |
| --- | --- | ---: |
| Trypsin-benzamidine, STO-3G | (66e, 45o) | 0.10 mHa |
| T4-lysozyme-n-butylbenzene, STO-3G | (36e, 35o) | 0.16 mHa |
| T4-lysozyme-n-butylbenzene, mixed basis | (34e, 42o) | 2.23 mHa |

These results demonstrate that selected-subspace diagonalization can approximate demanding embedded fragment eigenstates with high numerical accuracy. The errors are measured against DMRG references for the specified fragments, not against exact full-system energies. They also do not quantify the final protein-ligand binding-energy errors.

The study compares its largest trypsin fragment with an earlier 303-atom Trp-cage calculation, reporting a reduction in the fragment energy deviation from approximately 21 mHa to 0.10 mHa. The resulting factor of approximately 210 describes an improvement in this specific fragment-level accuracy metric across two studies. It should not be interpreted as an equivalent improvement in molecular binding-energy accuracy.

### Published Binding-Energy Results

The reported EWF-CCSD and EWF-TrimSQD calculations produce the following electronic binding-energy estimates under the specified molecular and basis-set conditions:

| Molecular System | Basis / Treatment | EWF-CCSD (kcal/mol) | EWF-TrimSQD (kcal/mol) |
| --- | --- | ---: | ---: |
| Trypsin-benzamidine | STO-3G | +28.46 | +35.89 |
| T4-lysozyme-n-butylbenzene | STO-3G | +10.45 | +9.30 |
| T4-lysozyme-n-butylbenzene | Mixed STO-3G / 3-21G | -17.31 | -21.07 |

Both minimal-basis calculations yield positive binding-energy estimates under the stated sign convention, indicating that the calculated bound structures are not energetically favored relative to the corresponding separated components. These results illustrate the sensitivity of global binding-energy differences to the underlying electronic-structure approximations, despite the high accuracy obtained for individual embedded fragments.

For T4-lysozyme, the refined mixed-basis calculation improves the treatment of the binding region and employs tighter embedding parameters. The resulting negative binding-energy estimates indicate stabilization of the complex within that approximate electronic-structure model. The improvement requires additional computational resources and does not, by itself, establish agreement with experimental binding free energies.

The trypsin-benzamidine calculation is particularly sensitive to long-range electrostatic interactions associated with the charged ligand. The study investigates an additional electrostatic correction that changes the sign of the predicted binding energy. This demonstrates that accurate local electronic correlation is insufficient if the larger-scale electrostatic environment is not treated consistently.

Taken together, the results show that large-scale quantum-assisted fragment calculations are feasible, but that the accuracy of a complete protein-ligand binding-energy calculation depends on more than the accuracy of the fragment eigensolvers. Electronic basis effects, long-range interactions, and energy reconstruction remain central components of the physical problem.

### Performance Metrics and Crossing-Point Analysis

A meaningful computational comparison must account for both the physical accuracy and total resource requirements of each method. Relevant parameters include molecular size, orbital count, number and size of embedded fragments, bath truncation thresholds, selected electronic configuration-space dimensions, quantum circuit resources, classical memory, and distributed eigensolver performance.

For a molecular system characterized by size $$N$$ and target binding-energy accuracy $$\varepsilon$$, the end-to-end computational cost can be represented as

$$
T_{\mathrm{solve}}
=
T_{\mathrm{solve}}(N,\varepsilon).
$$

This quantity should include molecular preprocessing, construction of the electronic environment, correlated fragment calculations, energy reconstruction, and any quantum sampling or classical postprocessing required by the method. Hardware resource-hours and actual elapsed wall-clock time should be reported separately when operations execute concurrently.

The published study reports a TrimSQD parallel efficiency of approximately 72.5% for a representative 64-node configuration. It also reports that the automated mixed-basis calculation of the **bound T4-lysozyme complex** completed fragment generation through molecular energy reconstruction in approximately 62.4 hours. This elapsed time is not the complete runtime for the binding-energy calculation, which additionally requires calculations for the unbound protein environment and isolated ligand.

A computational crossing point between classical and hybrid approaches should be evaluated at matched physical accuracy, using the complete end-to-end workload rather than only the cost of an individual quantum circuit or fragment eigensolver. In particular, comparisons should examine whether quantum-generated configuration spaces provide sufficient advantages in fragment accuracy or computational resources to compensate for the additional hardware execution and classical processing they require.

The published results demonstrate substantial progress in integrating quantum processors with large-scale electronic-structure calculations. They do not establish a general quantum computational advantage over optimized classical methods, nor do they establish chemical accuracy for the complete binding-energy predictions. Those questions remain important objectives for future benchmark comparisons.

## Primary References

Kenneth M. Merz, Jr., Akhil Shajan, Danil Kaliakin, Fangchun Liang, et al., “Crossing the 12,000-atom barrier with heterogeneous quantum-classical supercomputing: quantum chemistry of protein-ligand complexes,” arXiv:2605.01138v2 (September 2026). [arXiv preprint](https://arxiv.org/abs/2605.01138v2). [Full-text HTML](https://arxiv.org/html/2605.01138v2).

### Supporting Resources

Protein Data Bank structure **3PTB**, trypsin-benzamidine complex. [RCSB Protein Data Bank](https://www.rcsb.org/structure/3PTB).

Protein Data Bank structure **4W57**, T4-lysozyme-n-butylbenzene complex. [RCSB Protein Data Bank](https://www.rcsb.org/structure/4W57).
