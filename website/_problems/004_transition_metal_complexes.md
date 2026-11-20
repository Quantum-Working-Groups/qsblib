---
layout: problem
title: "Transition Metal Complexes"
summary: "Benchmarking ground-state electronic energies and spin-state gaps in strongly correlated iron-based transition-metal complexes, including bimetallic, trimetallic, and iron-porphyrin systems, where multireference electronic structure challenges classical and quantum computational methods."
published: true
submitted_by: "Eric D. Switzer"
si_use: "Yes"

physical_model_classes:
  physical_system_model_type: ["Molecular", "Atomistic"]
  dimensionality_geometry: ["3D", "Finite cluster"]
  degrees_of_freedom: ["Fermionic"]
  interactions: ["Long-range", "Many-body", "Strongly correlated"]
  symmetry_constraints: ["Discrete", "Continuous", "Conservation laws"]
  phases_physical_regimes: ["Electronic", "Magnetic"]
  composition_constituents: ["Inorganic", "Metal-organic"]

property_classes:
  physical_observable: ["Energy/spectrum"]
  time_dependence: ["Static"]
  spatial_dependence: ["Global"]
  physical_state: ["Ground", "Excited"]
  property_representation: ["Scalar"]
  scale_limiting_behavior: ["Finite-system"]

problem_specification:
  hamiltonian_or_action: "Nonrelativistic molecular electronic Hamiltonian under the Born-Oppenheimer approximation"
  system_size: "Strongly correlated iron-based complexes with localized active spaces ranging from small metal-centered fragments to a 32-electron, 29-orbital iron-porphyrin active space"
  model_parameters:
    molecular_systems:
      - name: "Bimetallic iron-bipyrimidine complex"
        formula: "[Fe(H2O)4]2bpym(4+)"
        basis_set: "6-31G"
        active_spaces:
          - "Two fragments: (6e,5o) and (6e,5o)"
          - "Two fragments: (6e,10o) and (6e,10o)"
        target_state: "Intermediate-spin electronic state"
      - name: "Trimetallic iron-oxo-formate complex"
        formula: "[FeIII FeIII FeII (mu3-O)(HCOO)6]"
        basis_set: "cc-pVDZ on Fe; 6-31G on remaining atoms"
        active_spaces:
          - "Three fragments: (6e,10o), (5e,10o), and (5e,10o)"
        target_state: "Specified intermediate-spin electronic state"
      - name: "Iron(II)-porphyrin"
        formula: "FeP"
        basis_set: "6-31G"
        active_spaces:
          - "Iron fragment: (6e,5o)"
          - "Porphyrin fragment: (26e,24o)"
        total_active_space: "(32e,29o)"
        target_states: ["Singlet (S=0)", "Quintet (S=2)"]
    correlation_regime: "Strongly correlated and multireference"
    orbital_optimization: "Required for self-consistent active-space calculations"
    spin_coupling: "Multiple interacting transition-metal spin centers"
  boundary_conditions: "Finite isolated molecular complexes"
  initial_conditions: "Not applicable; stationary electronic eigenstate problem"
  target_observable: "Ground-state electronic energies in specified spin sectors and spin-state energy differences"
  target_accuracy: "Report absolute energy deviations relative to matched active-space references; ~1 kcal/mol is a useful target for energy differences"
  units: "Hartree (Ha), milli-Hartree (mHa), and kcal/mol"
---

## Scientific Question

The electronic structure of transition-metal complexes is often governed by several competing configurations arising from partially filled $$d$$ orbitals, metal–ligand hybridization, and exchange interactions. When the relevant configurations are nearly degenerate, a single Slater determinant cannot adequately describe the low-energy states. Accurate treatment of this multireference character is essential for predicting spin-state energetics and, more broadly, the electronic properties underlying coordination chemistry, molecular magnetism, catalysis, and biological electron transfer.

This benchmark asks how accurately and efficiently classical and quantum computational methods can determine **ground-state electronic energies within specified spin sectors and energy differences between competing spin states**. It considers three iron-based systems of increasing active-space complexity: a bimetallic iron–bipyrimidine complex, a trimetallic iron–oxo–formate complex, and iron(II)–porphyrin. Together they probe correlations localized on metal centers, coupling among multiple spin centers, and correlations extending into a conjugated ligand framework.

The central computational difficulty is to represent these multiconfigurational states without retaining the full, combinatorially large configuration space. The same molecular Hamiltonians and active-space definitions can be used to compare complete and selected configuration interaction, multireference self-consistent-field methods, tensor-network approaches, and quantum-assisted subspace solvers. The benchmark distinguishes accuracy within a specified active-space approximation from accuracy for the more complete molecular electronic problem.

## Physical Model Definition

### Electronic Hamiltonian and active space

The complexes are treated as finite, isolated molecules within the Born–Oppenheimer approximation. In atomic units, the nonrelativistic electronic Hamiltonian, including the nuclear repulsion energy, is

$$
\hat{H}=-\frac{1}{2}\sum_{i=1}^{N_e}\nabla_i^2
-\sum_{i=1}^{N_e}\sum_{A=1}^{N_n}\frac{Z_A}{\lvert\mathbf{r}_i-\mathbf{R}_A\rvert}
+\sum_{i<j}^{N_e}\frac{1}{\lvert\mathbf{r}_i-\mathbf{r}_j\rvert}
+E_{\mathrm{nuc}},
$$

where $$N_e$$ and $$N_n$$ are the numbers of electrons and nuclei, $$\mathbf{r}_i$$ and $$\mathbf{R}_A$$ are their positions, and $$Z_A$$ is the charge of nucleus $$A$$. The nuclear repulsion contribution is

$$
E_{\mathrm{nuc}}=\sum_{A<B}\frac{Z_AZ_B}{\lvert\mathbf{R}_A-\mathbf{R}_B\rvert}.
$$

In a finite spin-orbital basis, the same Hamiltonian takes the second-quantized form

$$
\hat{H}=\sum_{pq}h_{pq}a_p^\dagger a_q
+\frac{1}{2}\sum_{pqrs}g_{pqrs}a_p^\dagger a_q^\dagger a_s a_r
+E_{\mathrm{nuc}},
$$

with $$h_{pq}$$ and $$g_{pqrs}$$ denoting one- and two-electron integrals under the chosen index convention. The electronic eigenvalue equation is

$$
\hat{H}\lvert\Psi_n\rangle=E_n\lvert\Psi_n\rangle.
$$

These definitions specify the physical problem independently of how the eigenvalue equation is solved.

The active space retains orbitals important for near-degenerate correlation, including iron $$3d$$ orbitals, additional $$4d$$ correlating orbitals, and—in the porphyrin case—ligand-centered $$\pi$$ orbitals. For $$N_{\mathrm{act}}$$ electrons in $$M_{\mathrm{act}}$$ spatial orbitals, the fixed-electron-number determinant dimension is

$$
D_{\mathrm{FCI}}=\binom{2M_{\mathrm{act}}}{N_{\mathrm{act}}},
\qquad
D_{\mathrm{FCI}}(N_\alpha,N_\beta)=
\binom{M_{\mathrm{act}}}{N_\alpha}\binom{M_{\mathrm{act}}}{N_\beta}.
$$

The second expression applies when the spin-up and spin-down electron counts are fixed separately. This combinatorial growth motivates localized fragmentation and approximate eigensolvers, but the active-space definition must be held fixed in any direct method comparison.

### Molecular systems

| Molecular system | Basis set | Localized active spaces | Target |
| --- | --- | --- | --- |
| Bimetallic iron–bipyrimidine | 6-31G | Two (6e, 5o) fragments, or two (6e, 10o) fragments | Specified intermediate-spin energy |
| Trimetallic iron–oxo–formate | cc-pVDZ on Fe; 6-31G otherwise | (6e, 10o), (5e, 10o), and (5e, 10o) | Specified intermediate-spin energy |
| Iron(II)–porphyrin | 6-31G | Fe: (6e, 5o); porphyrin: (26e, 24o); total (32e, 29o) | Singlet–quintet energy gap |

In the bimetallic complex, $$[\mathrm{Fe}(\mathrm{H}_2\mathrm{O})_4]_2\mathrm{bpym}^{4+}$$, bipyrimidine bridges two correlated iron centers. The smaller active spaces primarily describe iron $$3d$$ orbitals, while the extended (6e, 10o) fragments include additional correlating orbitals. The trimetallic complex, $$[\mathrm{Fe}^{\mathrm{III}}\mathrm{Fe}^{\mathrm{III}}\mathrm{Fe}^{\mathrm{II}}(\mu_3\text{-}\mathrm{O})(\mathrm{HCOO})_6]$$, contains three coupled iron centers with different local electron counts. Iron(II)–porphyrin presents a distinct challenge: the correlated iron center interacts with a conjugated ligand, and the (26e, 24o) porphyrin fragment is too large for practical conventional fragment FCI in the reported study.

### Correlation, symmetry, and physical regime

The relevant interactions include the long-range Coulomb force, strong intra-atomic correlation among iron $$d$$ electrons, exchange coupling between metal centers, and metal–ligand correlation. Static correlation reflects the presence of nearly degenerate configurations, whereas dynamic correlation includes additional excitations that may lie outside the chosen active space. These effects influence both absolute energies and the relative ordering of spin states.

The nonrelativistic Hamiltonian conserves electron number. In the absence of spin–orbit coupling and external magnetic fields, it also commutes with total spin and spin projection,

$$
[\hat{H},\hat{\mathbf S}^{2}]=0,
\qquad [\hat{H},\hat S_z]=0.
$$

The benchmark accordingly distinguishes energies computed in prescribed spin sectors. The terms *electronic*, *magnetic*, and *strongly correlated* describe finite-molecule physical regimes here, rather than thermodynamic phases of an extended system.

## Target Property

### Spin-resolved energies and gaps

The principal observables are the lowest electronic energies in specified spin sectors. For total spin $$S$$, the variational definition is

$$
E_0(S)=\min_{\substack{|\Psi\rangle\ne0\\
\hat{\mathbf S}^{2}|\Psi\rangle=S(S+1)|\Psi\rangle}}
\frac{\langle\Psi|\hat H|\Psi\rangle}{\langle\Psi|\Psi\rangle}.
$$

The global ground-state energy is the minimum over physically allowed spin sectors. The bimetallic and trimetallic cases focus on the energies of specified intermediate-spin configurations; these should not be mislabeled as unrestricted global ground states unless other relevant spin sectors have also been compared.

For two spin sectors, define $$\Delta E_{S_1,S_2}=E_0(S_1)-E_0(S_2)$$. In iron–porphyrin, the specified observable is the **singlet-minus-quintet gap**,

$$
\Delta E_{\mathrm{S-Q}}=E_0(S=0)-E_0(S=2).
$$

A positive value means the quintet is lower in energy than the singlet; a negative value means the reverse. This two-state comparison does not establish the global spin ground state because it excludes the triplet sector, which may also be energetically competitive.

### Accuracy and supplementary observables

For an energy estimate $$E_{\mathrm{method}}$$ and a reference calculated for the **same Hamiltonian and active space**, define the absolute error as $$\Delta E=\lvert E_{\mathrm{method}}-E_{\mathrm{ref}}\rvert$$. Energies are reported in Hartree (Ha), milli-Hartree (mHa), or kcal/mol, with $$1\ \mathrm{Ha}\approx627.5095\ \mathrm{kcal/mol}$$ and $$1\ \mathrm{kcal/mol}\approx1.59\ \mathrm{mHa}$$. An accuracy of roughly 1 kcal/mol is a useful target for energy differences, although the appropriate tolerance depends on the intended physical prediction.

Beyond total energies and spin gaps, informative diagnostics include one- and two-particle reduced density matrices, spin-resolved and natural-orbital occupations, local spin moments, spin–spin correlations, energy variances, and convergence with selected configuration-space size. These quantities can reveal deficiencies in the correlated state even when the total energy appears converged.

## Problem Parameters and Conditions

The molecule, geometry, electronic basis, charge, spin sector, orbital definitions, and active-space partition together specify each benchmark instance. The numerical examples follow the molecular systems and basis choices reported in the primary publication; reproducing them requires the exact molecular coordinates and orbital conventions from that work and its supporting material. The complexes are finite and isolated, so periodic boundary conditions are not used, and no dynamical initial state is required for these stationary eigenvalue calculations.

Method comparisons must use matching geometries, orbital bases, active electron counts, fragment definitions where relevant, and spin assignments. Changes in any of these quantities define a modified problem rather than a strictly like-for-like algorithmic comparison. In particular, energies from the two bimetallic active-space choices should not be interpreted as competing approximations to one *fixed* active-space Hamiltonian without accounting for the model change.

## Computational Challenges

### Configuration-space growth and multireference correlation

The dominant obstacle is the combinatorial growth of the determinant space with the number of active electrons and orbitals. Near-degenerate iron-centered configurations require multiconfigurational descriptions, making single-reference approximations unreliable in some regimes. The iron–porphyrin (26e, 24o) fragment exemplifies the difficulty: the full fragment configuration space is impractically large for the conventional FCI solver used in the cited work. Selected CI, tensor networks, and quantum-assisted methods attempt to reduce the computational representation without losing the configurations essential to the target state.

### Fragment coupling and orbital optimization

Localizing the active space into metal-centered or ligand-centered fragments can greatly reduce the cost of solving individual subsystems, but a product of fragment wavefunctions neglects explicit interfragment entanglement. This becomes important when magnetic exchange, charge transfer, or metal–ligand correlations extend across the fragment boundaries. Self-consistent orbital optimization introduces a further sensitivity: changes in the approximate fragment wavefunctions can alter the orbitals and effective Hamiltonians, so noisy or inconsistent eigensolver outputs may destabilize convergence.

### Spin ordering and missing correlation

Spin-state gaps are differences between large electronic energies and can be particularly sensitive to approximation error. In iron–porphyrin, singlet, triplet, and quintet states can compete, although the specified benchmark directly compares only singlet and quintet energies. Moreover, an internally converged active-space calculation may still omit dynamic correlation, basis-set effects, and interfragment correlation that influence physical spin ordering. These model errors must not be confused with eigensolver error.

### Quantum sampling and classical postprocessing

Quantum-assisted subspace solvers face additional difficulties in sampling important determinants, correcting configurations that violate particle-number or spin constraints, and controlling stochastic changes between successive orbital-optimization iterations. The selected-subspace diagonalization itself can require substantial classical time and memory. There is no general guarantee that the number of shots or retained configurations needed for a fixed accuracy grows polynomially with the active-space size; measured sampling and postprocessing costs are therefore essential benchmark quantities.

## Accuracy and Validation Criteria

### Reference energies and convergence

The cited study reports classical LASSCF energies for the bimetallic active spaces, which provide reference points for comparing approximate fragment solvers. For the two (6e, 5o) fragments, LASSQD reproduces the LASSCF result to approximately $$5.3\times10^{-7}\ \mathrm{Ha}$$ before rounding:

| Bimetallic active space | Method | Total energy (Ha) |
| --- | --- | ---: |
| Two (6e, 5o) fragments | LASSCF | -3655.496377 |
| Two (6e, 5o) fragments | LASSQD | -3655.496377 |
| Two (6e, 10o) fragments | LASSCF | -3655.610977 |

These are reference energies for the specified localized-active-space treatment, **not exact FCI energies for the entire molecule**. Comparisons to them should preserve the orbital-optimization conditions and quantify both energy deviations and convergence with subspace dimension. In addition to energy, validation should examine electron number, spin constraints, eigensolver residuals, orbital gradients, and the consistency of reduced density matrices. For stochastic methods, results should include repeated-run statistics and uncertainty estimates.

For spin-state gaps, let $$\Delta E_{\mathrm{S-Q}}^{\mathrm{ref}}$$ be an identified reference. The gap error is

$$
\Delta_{\mathrm{gap}}=
\left|\Delta E_{\mathrm{S-Q}}^{\mathrm{method}}-
\Delta E_{\mathrm{S-Q}}^{\mathrm{ref}}\right|.
$$

If the singlet and quintet energy estimates have uncertainties $$\sigma_{\mathrm S}$$ and $$\sigma_{\mathrm Q}$$, the gap variance includes their covariance,

$$
\sigma_{\mathrm{gap}}^2=\sigma_{\mathrm S}^2+\sigma_{\mathrm Q}^2
-2\operatorname{Cov}(E_{\mathrm S},E_{\mathrm Q}).
$$

When no sufficiently accurate spin-gap reference is available, the predicted gap should be accompanied by statistical and extrapolation uncertainties, rather than a claim of established chemical accuracy. Validation against a localized-active-space reference must also be distinguished from validation against a larger active space or a more complete electronic-structure treatment.

## Comparative Solutions and Performance

### Methods under comparison

The benchmark separates the physical model from the algorithm used to solve it. Relevant classical and hybrid methods include:

| Solution | Computational paradigm | Principal approximation or cost |
| --- | --- | --- |
| Full configuration interaction (FCI) | Classical | Complete determinant space; combinatorial cost |
| CASSCF | Classical | Full active-space CI with orbital optimization; active-space-size bottleneck |
| LASSCF | Classical | Fragment FCI with self-consistent orbitals; missing explicit interfragment entanglement |
| LASSCI | Classical | Selected determinant spaces for localized fragments; selection error |
| DMRG-SCF | Classical | Tensor-network active-space solver; bond-dimension and optimization costs |
| LASSQD | Hybrid quantum–classical | Quantum-sampled fragment configurations; sampling and classical diagonalization |
| LASSQD-PDFT | Hybrid quantum–classical | LASSQD-derived densities with pair-density functional treatment; functional dependence |

CASSCF retains all configurations in the chosen complete active space while optimizing the molecular orbitals. LASSCF replaces this single large correlated problem with a product of smaller fragment wavefunctions, each of which may be solved by FCI; its reduced cost comes at the price of restricted interfragment correlations. LASSCI uses selected configuration spaces instead of complete fragment FCI. DMRG-SCF uses a tensor-network representation, with accuracy controlled by bond dimension and orbital optimization. These approaches supply the classical comparisons needed to interpret the performance of a quantum-assisted fragment solver.

### LASSQD and configuration carryover

LASSQD combines localized active-space self-consistent-field calculations with sample-based quantum diagonalization. Quantum circuits, including local-unitary cluster Jastrow (LUCJ) preparations, generate occupation bitstrings. After configuration recovery and selection, classical diagonalization yields fragment energies and reduced density matrices, which enter the next orbital-optimization step. Because independently sampled determinant sets can change substantially between iterations, the method carries over important configurations from earlier wavefunctions, reducing stochastic energy fluctuations and improving self-consistent-field stability. LASSQD-PDFT adds a pair-density functional treatment intended to recover correlation beyond the primary localized active-space wavefunctions.

For the smaller bimetallic active space, agreement between LASSQD and LASSCF is nearly exact at the precision reported above. With two (6e, 10o) fragments, the study reports agreement within approximately 1 kcal/mol while retaining reduced determinant spaces: selected hardware calculations use less than roughly 70% of the fragment FCI space, and selected comparisons reach the 1 kcal/mol range using about 50%. LASSQD and classical LASSCI show comparable trends in energy accuracy versus retained subspace dimension. For the trimetallic complex, configuration carryover suppresses the fluctuations seen in conventional SQD and allows sub-1 kcal/mol deviations from LASSCF in the reported simulations. These findings demonstrate accurate reduced-space approximations for the studied fragments, but do not establish a universal advantage over classical determinant selection.

### Iron–porphyrin spin gap

For the (32e, 29o) iron–porphyrin active space, the porphyrin fragment prevents a conventional full-fragment FCI reference. The cited study instead compares LASSCI and LASSQD singlet–quintet gaps using energy-variance extrapolation:

| Method | Singlet–quintet gap (kcal/mol) | Estimated uncertainty (kcal/mol) |
| --- | ---: | ---: |
| LASSCI | 96.05 | ±10.70 |
| LASSQD | 84.96 | ±40.67 |

Both estimates place the quintet below the singlet for the specified active-space treatment and agree within the quoted uncertainties. The uncertainties—particularly that of LASSQD—remain substantial, so these results support feasibility rather than a precise determination of the spin gap. They also do not resolve whether the quintet is the global spin ground state, since the triplet is not included in this comparison.

### Resource accounting and crossing-point analysis

A credible comparison must report **complete classical and quantum resource requirements at matched accuracy**. For classical methods, this includes total runtime, peak memory, fragment FCI dimensions, selected-CI determinant counts, tensor-network bond dimensions where relevant, and orbital-optimization iterations. Hybrid calculations additionally require physical qubit count, compiled circuit depth and gate counts, measurement shots, configuration-recovery cost, selected-subspace dimensions, classical diagonalization time, and end-to-end wall-clock time. Results obtained on hardware must be distinguished from noiseless circuit simulations; the associated preprint describes experiments on IBM systems including `ibm_sherbrooke`, `ibm_torino`, and `ibm_fez`.

Although some LUCJ circuit components admit linear-depth constructions under suitable connectivity assumptions, this does not imply a universal $$\mathcal{O}(N_q)$$ depth for the compiled circuit or an equivalent scaling for the complete algorithm. Connectivity, routing, state preparation, sampling, and classical processing all contribute to the measured cost.

Crossing-point studies should vary fragment size, selected configuration count, sampling budget, and accuracy requirements, while keeping the physical Hamiltonian and comparison criteria fixed. The relevant question is whether quantum-assisted selection and diagonalization reduce the **end-to-end time or resources needed to reach a specified energy or spin-gap accuracy** compared with optimized classical alternatives. A crossing point should be reported only when supported by measured resource data or clearly labeled extrapolation. The published results demonstrate the feasibility of hybrid multireference calculations, but not a general quantum computational advantage.

## Primary References

Qiaohong Wang, Kevin J. Sung, Ruhee D'Cunha, Matthew R. Hermes, Tanvi Gujarati, Yukio Kawashima, Yu-Ya Ohnishi, Gavin O. Jones, Mario Motta, and Laura Gagliardi, “Localized sample-based quantum diagonalization for strongly correlated chemistry,” *Proceedings of the National Academy of Sciences* **123** (28), e2603914123 (2026). [DOI: 10.1073/pnas.2603914123](https://doi.org/10.1073/pnas.2603914123). [Full text](https://pmc.ncbi.nlm.nih.gov/articles/PMC13367814/).

Qiaohong Wang et al., “Sample-based quantum diagonalization as parallel fragment solver for the localized active space self-consistent field method,” arXiv:2512.14936 (2025). [Preprint](https://arxiv.org/abs/2512.14936); [HTML version](https://arxiv.org/html/2512.14936).
