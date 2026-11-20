---
layout: solution
title: "Occupation-Based Quantum Electronic Structure: ON-VQE and OS-VQO"
published: true
submitted_by: "Edison Salazar"
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
    - "Stochastic"
  approximation_error_control:
    - "Heuristic/uncontrolled"
    - "Statistically estimated"
    - "Noise-limited"
  si_ml_involvement:
    - "None"

problems_applied:
  - "Ground-State Electronic Structure and AIMD on Quantum Computers"

summary: "A family of hybrid quantum-classical electronic-structure methods that evaluate natural orbital functionals using occupations obtained from quantum measurements. ON-VQE measures natural occupations from a many-electron quantum state, while OS-VQO variationally represents electron-pair occupation spaces directly. Demonstrated applications include H8 electronic structure and reported H216 dissociation calculations; extending the approach to Born-Oppenheimer molecular dynamics remains an active research objective."

solution_status:
  role: "Candidate"
  validation: "Partially validated"

# Reference implementation of ON-VQE; not a complete OS-VQO/AIMD implementation.
code_repository: "https://github.com/gatox/PennyLane_Exercises/blob/main/test_nof_vqe/NOFVQE/nofvqe.py"
data_repository: ""
---

## Algorithm Overview

Occupation-Based Quantum Electronic Structure comprises hybrid quantum-classical approaches that use natural orbital occupation numbers as the principal link between quantum measurements and molecular electronic energies. The two formulations considered here are Occupation-Number Variational Quantum Eigensolver (ON-VQE) and Occupation-Space Variational Quantum Optimization (OS-VQO). Both evaluate an approximate natural orbital functional (NOF), but the quantum states from which their occupation variables are obtained are fundamentally different.

ON-VQE prepares an approximate many-electron state and measures the occupations of its natural orbitals. OS-VQO instead represents the possible occupation outcomes within electron-pair subspaces directly, without requiring a general quantum encoding of the molecular many-electron wavefunction. In both cases, the quantum processor provides occupation information, while a classical procedure evaluates the selected NOF using these occupations, natural orbital coefficients, and molecular electronic integrals. Electronic correlation not measured explicitly on the quantum device is reconstructed through the approximation contained in the functional.

This division of work contrasts with conventional Variational Quantum Eigensolver (VQE) calculations, which estimate the expectation value of the electronic Hamiltonian from many quantum observables. Occupation measurements can be performed in a common computational basis, potentially reducing the number of distinct measurement settings. This reduction, however, does not by itself establish lower total measurement cost, greater physical accuracy, or an advantage over classical natural orbital functional theory (NOFT). The principal scientific question is whether quantum-generated occupations can be optimized and measured more efficiently than classical occupation variables when the complete molecular and computational workflow is considered.

The established applications concern molecular ground-state electronic structure, correlation-dependent occupation redistribution, and potential-energy curves along molecular dissociation coordinates. Published ON-VQE work includes small-molecule tests and an eight-hydrogen cubic cluster, while the OS-VQO manuscript reports occupation-space calculations for a 216-hydrogen cubic cluster. An intended extension to Born-Oppenheimer ab initio molecular dynamics (AIMD) would require nuclear forces derived from the NOF energies and their use in classical nuclear propagation. **Neither the ON-VQE nor the OS-VQO results cited here constitutes a completed occupation-based AIMD demonstration.**

### Electronic Hamiltonian and Natural Orbital Functional

For fixed nuclear positions $$\mathbf{R}$$, the nonrelativistic molecular Hamiltonian in a finite spin-orbital basis is

$$
\hat{H}_e(\mathbf{R})
=
\sum_{pq}h_{pq}(\mathbf{R})a_p^\dagger a_q
+
\frac{1}{2}\sum_{pqrs}g_{pqrs}(\mathbf{R})a_p^\dagger a_q^\dagger a_s a_r
+
E_{\mathrm{nuc}}(\mathbf{R}),
$$

where $$h_{pq}$$ and $$g_{pqrs}$$ are the one- and two-electron integrals in the specified convention, and $$E_{\mathrm{nuc}}$$ is the nuclear repulsion energy. The exact ground state satisfies $$\hat{H}_e\lvert\Psi_0\rangle=E_0\lvert\Psi_0\rangle$$. Conventional VQE approximates $$E_0$$ by minimizing $$\langle\Psi(\boldsymbol{\theta})\rvert\hat{H}_e\lvert\Psi(\boldsymbol{\theta})\rangle$$; the occupation-based methods considered here instead minimize an approximate NOF energy.

The spin-orbital one-particle reduced density matrix (1-RDM) of a normalized many-electron state is

$$
\gamma_{pq}
=
\langle\Psi\rvert a_p^\dagger a_q\lvert\Psi\rangle.
$$

Its eigenvectors define the natural orbitals $$\lvert\phi_p\rangle$$ and its eigenvalues are their occupation numbers $$n_p$$, so that $$\hat{\gamma}\lvert\phi_p\rangle=n_p\lvert\phi_p\rangle$$. In this basis, $$\gamma_{pq}=n_p\delta_{pq}$$. An approximate NOF, including PNOF5, PNOF7, or the Global Natural Orbital Functional (GNOF), evaluates an energy of the form

$$
E_{\mathrm{NOF}}
=
E_{\mathrm{NOF}}\!\left(\{n_p\},\{\phi_p\};\mathbf{R}\right).
$$

The functionals differ in how they reconstruct intra-pair and interpair electronic correlations. Accuracy therefore depends on both the occupations and orbitals supplied to the functional **and** the physical approximation represented by the chosen NOF. An occupation-based quantum calculation can reproduce a classical implementation of the same functional accurately while retaining a shared error relative to the exact finite-basis electronic energy.

For spin-orbital occupations the basic constraints are $$0\leq n_{p\sigma}\leq1$$ and $$\sum_{p\sigma}n_{p\sigma}=N_e$$. In a spin-paired singlet representation, one can write $$n_{p\alpha}=n_{p\beta}=n_p$$, yielding $$2\sum_p n_p=N_e$$. When the spatial orbitals are partitioned into electron-pair subspaces $$\Omega_g$$, a standard one-pair normalization is

$$
\sum_{p\in\Omega_g}n_p=1,
\qquad
\Omega=\bigcup_{g=1}^{N_e/2}\Omega_g.
$$

These restrictions organize the occupation representations and provide physical checks on the measured data. Satisfying the simple bounds and pair sums is necessary within the chosen model but does not, by itself, establish all pure-state many-electron representability conditions.

## Methodology and Execution

The two algorithms share a classical molecular-chemistry layer—integral generation, NOF evaluation, occupation constraints, and natural orbital treatment—but employ different quantum encodings. This difference determines the accessible occupation distributions, circuit complexity, and meaning of the measured data.

### ON-VQE: Many-Electron State and Direct Occupation Measurement

ON-VQE starts from a reference electronic state and applies a parameterized unitary circuit,

$$
\lvert\Psi(\boldsymbol{\theta})\rangle
=
U(\boldsymbol{\theta})\lvert\Phi_{\mathrm{ref}}\rangle.
$$

The circuit is intended to produce natural occupation numbers suitable for evaluating the NOF. Unlike a conventional VQE ansatz, its quality is not assessed solely by whether the prepared many-electron state reproduces the exact Hamiltonian expectation value. Rather, the occupations measured in the natural orbital representation are supplied to the approximate functional, which reconstructs the energy using classical electronic-structure information.

In an occupation-number or Jordan–Wigner encoding, the spin-orbital number operator satisfies

$$
\hat{n}_p=a_p^\dagger a_p=\frac{1-Z_p}{2},
\qquad
n_p=\frac{1-\langle Z_p\rangle}{2}.
$$

Because the number operators are diagonal in the same computational basis, their expectation values can be extracted from one common measurement setting. It is unnecessary to measure the off-diagonal 1-RDM elements when the circuit's orbital basis is the natural orbital basis used by the functional. The requirement is important: if that basis is not known, it must be established and updated through classical natural orbital optimization rather than assumed to be correct at initialization.

The ON-VQE implementation reported in the source employs a pair-correlated ansatz motivated by the generating wavefunction associated with PNOF5. With pair creation operators $$\hat{P}_p^\dagger=a_{p\alpha}^\dagger a_{p\beta}^\dagger$$ and pair excitations $$\hat{\tau}_g^p=\hat{P}_p^\dagger\hat{P}_g$$, a representative unitary construction is

$$
U(\boldsymbol{\theta})
=
\prod_g\exp\!\left[
\sum_{p\in\Omega_g'}\theta_g^p
\left(\hat{\tau}_g^p-\hat{\tau}_g^{p\dagger}\right)
\right].
$$

This expression is schematic; the implemented decomposition and ordering must be specified in a reproducible calculation. The reported study uses a first-order Trotter approximation. Pair-preserving excitations reduce the set of allowed processes and help construct relatively compact circuits, at the cost of restricting the variational representation.

ON-VQE requires a coupled optimization of the circuit and natural orbital basis. At fixed orbitals, the circuit parameters minimize the functional evaluated from measured occupations; the orbitals are then updated under orthonormality constraints. Schematically,

$$
\boldsymbol{\theta}^{*}
=
\operatorname*{arg\,min}_{\boldsymbol{\theta}}
E_{\mathrm{NOF}}\!\left(\{n_p(\boldsymbol{\theta})\},\{\phi_p\}\right),
$$

$$
\{\phi_p^{*}\}
=
\operatorname*{arg\,min}_{\{\phi_p\}}
E_{\mathrm{NOF}}\!\left(\{n_p\},\{\phi_p\}\right).
$$

The supplied ON-VQE work uses SLSQP for circuit-parameter optimization and ADAM for natural orbital optimization. The procedure alternates occupation measurement, functional evaluation, and updates of the quantum and classical variables until the chosen convergence criteria are satisfied. Along a dissociation path, orbital coefficients and circuit parameters from a preceding geometry can be reused as initial guesses. Such warm starts may improve convergence, but their impact on cost must be measured rather than assumed.

### OS-VQO: Direct Occupation-Space Representation

OS-VQO does not attempt to represent a general molecular many-electron state on the quantum processor. Instead, its quantum variables encode the alternative occupations available within electron-pair subspaces. For a pair space $$\Omega_g$$, a schematic occupation-state representation is

$$
\lvert\psi_g\rangle
=
\sum_{p\in\Omega_g}\alpha_{gp}\lvert p\rangle_g,
\qquad
\sum_{p\in\Omega_g}|\alpha_{gp}|^2=1,
$$

with occupations $$n_{gp}=|\alpha_{gp}|^2$$. These quantum states serve to generate the occupation probabilities required by the functional. They should **not** be identified with the full electronic many-body wavefunction, and their expressivity is tied to the selected pair-space representation and approximate NOF.

For the minimal $$m=1$$ pair space, there are two occupation alternatives and one qubit can encode the normalized distribution,

$$
\lvert\psi_g\rangle
=
\alpha_g\lvert0\rangle+\beta_g\lvert1\rangle,
\qquad
|\alpha_g|^2+|\beta_g|^2=1.
$$

One electron pair is distributed between two spatial orbital alternatives, with probabilities $$n_g=|\alpha_g|^2$$ and $$n_{g'}=|\beta_g|^2$$. Consequently, for $$N_{\mathrm{pairs}}$$ independently represented pair spaces in this minimal encoding, the algorithmic occupation-space register contains $$N_q=N_{\mathrm{pairs}}$$ qubits. More flexible occupation spaces can require different encodings and resource counts. A small occupation-space register is not equivalent to a general fermionic encoding of the same molecule.

OS-VQO optimizes circuit parameters through the NOF energy,

$$
E_{\mathrm{OS\text{-}VQO}}(\boldsymbol{\theta})
=
E_{\mathrm{NOF}}\!\left(
\{n_p(\boldsymbol{\theta})\},\{\phi_p\}
\right),
\qquad
\boldsymbol{\theta}^{*}
=
\operatorname*{arg\,min}_{\boldsymbol{\theta}}
E_{\mathrm{OS\text{-}VQO}}(\boldsymbol{\theta}).
$$

The classical portion constructs molecular integrals, evaluates intra-pair and interpair contributions of the NOF, and treats the natural orbitals either as fixed or optimized variables. The quantum processor prepares and measures occupation-space states. Interpair electronic correlations represented by PNOF7 are reconstructed by the classical functional, not measured as a complete many-electron two-particle density matrix.

A reproducible OS-VQO calculation therefore specifies the occupation-space partition, quantum encoding, circuit parameters, measurement-to-occupation mapping, NOF, constraints, and orbital procedure. In particular, **optimization with noiseless circuits followed by physical hardware evaluation is not equivalent to hardware-in-the-loop variational optimization**. The supplied H₂₁₆ results use the former protocol.

### Quantum and Classical Division of Work

| Computational component | ON-VQE | OS-VQO |
| --- | --- | --- |
| Quantum state | Restricted many-electron ansatz | Pair occupation-space ansatz |
| Measured data | Natural orbital number operators | Probabilities of pair occupation alternatives |
| Quantum measurement basis | Computational basis in natural orbitals | Computational basis of occupation-space registers |
| Quantum variational variables | Many-electron circuit parameters | Occupation-space circuit parameters |
| Pair and electron-number constraints | Ansatz and/or processing | Encoding and/or processing |
| Molecular integrals and NOF | Classical | Classical |
| Natural orbital coefficients | Classically optimized | Fixed or classically optimized |
| Interpair correlation in the NOF | Classical functional reconstruction | Classical functional reconstruction |
| Completed occupation-based AIMD | Not demonstrated here | Not demonstrated here |

Both methods use a hybrid workflow with quantum sampling and classical optimization. The total cost includes molecular preprocessing, orbital transformations, repeated objective evaluations, measurement uncertainty, error mitigation when used, and convergence analysis. The standard formulations involve no required machine-learning or superintelligence component.

## Approximation and Error Control

The central scientific limitation is the use of an approximate natural orbital functional. Even if all occupations are measured without statistical error and all variational variables are fully optimized, the resulting NOF energy need not coincide with the exact electronic ground-state energy. It is therefore necessary to distinguish **functional consistency**—agreement with a classical implementation of the same NOF—from **physical electronic-structure accuracy** relative to FCI, converged DMRG, or other reliable references.

### Functional Accuracy, Representability, and Variational Character

The methods optimize a chosen approximate functional rather than, in general, the exact expectation value of the electronic Hamiltonian in the quantum state. Thus the inequality

$$
E_{\mathrm{NOF}}\geq E_{\mathrm{exact}}
$$

is **not generally guaranteed**, even though the numerical procedures are variational with respect to their own functional and accessible variables. The familiar Rayleigh–Ritz upper-bound property of ideal Hamiltonian-expectation minimization cannot be transferred automatically to these formulations. This is why the original Solution classification specifies heuristic, statistical, and noise-limited errors rather than a general variational upper bound.

The occupied-orbital constraints, pair-space definitions, and quantum circuits further restrict which distributions can be represented. ON-VQE employs pair-preserving excitations; OS-VQO uses a reduced occupation-space model. Both can fail to represent occupations needed for a particular physical state, even if they satisfy the intended pair-normalization constraints. Errors associated with restricted circuit expressivity should be assessed separately from functional approximation and classical orbital optimization.

### Sampling Precision and Error Propagation

For an occupation probability $$n_p$$ estimated from $$S$$ independent ideal binary measurements, the sample-mean variance is

$$
\operatorname{Var}(\widehat{n}_p)
=
\frac{n_p(1-n_p)}{S},
\qquad
\sigma_{n_p}
=
\sqrt{\frac{n_p(1-n_p)}{S}}.
$$

This Bernoulli expression does not include gate errors, readout bias, correlated noise, or uncertainties introduced by constrained reconstruction. Because several occupations are calculated from the same shots and may satisfy pair-sum constraints, they can also be statistically correlated. For sufficiently small occupation errors, the change in a differentiable NOF energy is approximately

$$
\delta E_{\mathrm{NOF}}
\approx
\sum_p\frac{\partial E_{\mathrm{NOF}}}{\partial n_p}\,\delta n_p,
$$

and the corresponding first-order uncertainty is

$$
\sigma_E^2
\approx
\left(\nabla_{\mathbf n}E_{\mathrm{NOF}}\right)^T
\operatorname{Cov}(\mathbf n)
\left(\nabla_{\mathbf n}E_{\mathrm{NOF}}\right).
$$

The energy sensitivity to occupation noise depends on the molecular geometry and correlation regime. A fixed shot count, even with only one measurement setting, is not a guarantee of uniform energy accuracy along a dissociation curve. Repeated independent hardware executions and propagation of correlated occupation uncertainties are consequently important validation procedures.

### Orbital Optimization and Hardware Noise

An incomplete natural orbital optimization can change the energy, occupations, and interpretation of electron localization. Fixed-orbital and self-consistent-orbital calculations are distinct computational protocols. Convergence should be checked against orbital rotations, initial conditions, circuit expressivity, optimizer settings, and the consistency of the occupation constraints.

The reported ON-VQE hardware tests employ physics-informed occupation error mitigation and postselection, including occupation interval projection, pair normalization, polarization recovery, and statistical consistency checks. These corrections can improve agreement with noiseless calculations but introduce additional classical cost and may affect statistical bias. By contrast, the supplied OS-VQO H₂₁₆ manuscript reports **raw hardware measurements without error mitigation or postprocessing**, using circuit parameters optimized noiselessly in advance. Comparing the two methods requires preserving this distinction rather than treating their hardware energy curves as the output of equivalent protocols.

| Error source | Origin | Appropriate validation |
| --- | --- | --- |
| NOF approximation | Reconstructed electron correlation | Compare with high-accuracy electronic-structure references |
| Pair-space restriction | Incomplete occupation representation | Enlarge or alter occupation subspaces |
| Circuit expressivity | Restricted accessible occupation distributions | Change ansatz or increase expressivity |
| Finite sampling | Uncertain occupation probabilities | Increase shots and repeat measurements |
| Hardware noise and mitigation | Gate/readout bias and processing | Compare raw, mitigated, and ideal results |
| Orbital optimization | Incomplete self-consistency | Tighten orbital-gradient and energy tolerances |
| Parameter optimization | Incomplete variational minimization | Compare initial guesses and optimizer settings |
| Molecular basis | Incomplete orbital representation | Basis-set convergence |
| Nuclear forces | Approximate or noisy energy derivatives | Compare forces with converged independent references |

No universal rigorous bound on the error of the electronic ground-state energy or reconstructed molecular forces follows from the current occupation-based formulations.

## Applied Problems

### Ground-State Electronic Structure and AIMD on Quantum Computers

ON-VQE and OS-VQO address electronic energies and natural occupations for finite molecular systems, including hydrogen-cluster dissociation. The associated Problem also targets potential-energy surfaces, nuclear forces, and Born-Oppenheimer molecular dynamics, but those additional tasks have not yet been demonstrated using the ON-VQE or OS-VQO procedures reported here. The published H₂ AIMD demonstration by Fedorov and collaborators employs a different VQE-based electronic solver and is treated as a methodological reference, not as evidence that OS-VQO has completed AIMD.

### ON-VQE: Molecular Benchmarks and Measurement Reduction

The ON-VQE study reports molecular calculations for H₂, LiH, Li₂, OH⁻, FH, NeH⁺, and F₂, with NOF energies evaluated using PNOF5, PNOF7, and GNOF. A notable property of the approach is that one collection of measured occupations can be reused for different natural orbital functionals at fixed orbitals, without requiring a new quantum measurement basis for each functional. This allows the cost of occupation acquisition to be separated from the classical cost of choosing and evaluating a correlation functional.

The source compares the number of qubit-wise commuting (QWC) measurement groups required for conventional Hamiltonian-based VQE, 1-RDM-based NOF-VQE, and direct occupation-based ON-VQE. The largest reported group counts in the representative benchmark set are:

| Measurement method | Reported maximum QWC groups |
| --- | ---: |
| Conventional VQE | 1,198 |
| NOF-VQE using 1-RDM reconstruction | 50 |
| ON-VQE direct occupations | 1 |

This is a substantial reduction in **distinct measurement settings**, not a reported reduction by the same factor in total shots, circuit repetitions, runtime, or final electronic-energy error. Precision requirements and optimizer evaluations still determine how many measurements are needed overall.

### ON-VQE: Cubic H₈ Electronic Structure

The central ON-VQE hardware benchmark follows symmetric dissociation of an eight-hydrogen cubic cluster using the STO-3G basis. The electronic energy $$E_0(a)$$ and natural occupations are examined as functions of cubic lattice spacing $$a$$, allowing the calculation to probe changing electronic correlations as the hydrogen atoms become more separated.

The reported hardware experiment uses an IBM BasqueCountry quantum processor. Circuit parameters were optimized noiselessly and subsequently evaluated on quantum hardware with 10,000 measurement shots per circuit and ten independent hardware executions per geometry. The protocol reports IBM Runtime optimization level 3 and resilience level 2 together with occupation-oriented error mitigation and postselection. The mitigated hardware results closely follow the noiseless ON-VQE potential-energy curve and are compared with classical PNOF7 calculations. These observations support the feasibility of quantum occupation measurement for NOF electronic structure; they are not a demonstration of full hardware-native optimization, an AIMD trajectory, or end-to-end quantum computational advantage.

### OS-VQO: Cubic H₂₁₆ Electronic Structure

The OS-VQO manuscript reports a larger hydrogen cluster containing 216 atoms arranged on a $$6\times6\times6$$ simple-cubic lattice. The interatomic spacing is varied symmetrically, and the natural occupations are used to characterize a finite-system crossover from relatively delocalized, metallic-like behavior toward a strongly correlated, Mott-insulating-like regime. Because the cluster is finite, the behavior should not automatically be described as a thermodynamic phase transition.

The minimal $$m=1$$ encoding partitions the 216 electrons into 108 electron-pair occupation spaces, with one occupation-space qubit per pair. This gives **108 algorithmic occupation-space qubits**, not 108 qubits representing the general many-electron Hilbert space and not a count of fault-tolerant logical qubits. The energy still depends on classical PNOF7 reconstruction and the selected natural orbital treatment.

| Reported H₂₁₆ hardware attribute | Value |
| --- | --- |
| Molecular geometry | 216 hydrogen atoms, $$6\times6\times6$$ cubic cluster |
| Electron-pair subspaces | 108 |
| Minimal occupation encoding | $$m=1$$ |
| Occupation-space qubits | 108 |
| Processor | IBM BasqueCountry Heron R2 |
| Shots per circuit | 10,000 |
| Independent executions per geometry | 10 |
| Circuit parameter optimization | Noiseless, before hardware execution |
| Hardware error mitigation | None reported |
| Hardware postprocessing | None reported |

The supplied manuscript reports that the raw hardware energies track the noiseless occupation-space calculations and corresponding classical PNOF7 reference over the dissociation path. This result tests occupation-space state preparation and measurement for a comparatively large electronic-structure system. It does not establish quantum optimization of the natural orbitals, direct measurement of every interpair correlation contribution, a completed AIMD simulation, or a computational advantage over classical NOFT.

Energy agreement should be supplemented with a comparison of natural occupation distributions. For a matched orbital ordering and reference at lattice spacing $$a$$, one possible diagnostic is

$$
\Delta n_{\mathrm{RMS}}(a)
=
\sqrt{
\frac{1}{M}
\sum_{p=1}^{M}
\left[n_p^{\mathrm{quantum}}(a)-n_p^{\mathrm{ref}}(a)\right]^2
}.
$$

This metric helps determine whether the quantum result reproduces the occupation redistribution underlying the changing electronic character, rather than only an approximately matching total energy.

### Proposed Extension to Born-Oppenheimer Molecular Dynamics

The proposed AIMD extension would use the optimized NOF energy as a geometry-dependent Born-Oppenheimer potential-energy surface,

$$
E_{\mathrm{BO}}(\mathbf R)
=
E_{\mathrm{NOF}}\!\left(
\mathbf n^{*}(\mathbf R),\mathbf C^{*}(\mathbf R);\mathbf R
\right),
$$

where $$\mathbf n^{*}$$ and $$\mathbf C^{*}$$ represent the optimized occupations and natural orbital coefficients. Classical nuclear trajectories would be generated from forces

$$
\mathbf F_A(\mathbf R)
=-\nabla_{\mathbf R_A}E_{\mathrm{BO}}(\mathbf R),
\qquad
M_A\frac{d^2\mathbf R_A}{dt^2}=\mathbf F_A.
$$

Obtaining accurate forces is a distinct problem from evaluating energies at isolated geometries. The NOF depends on nuclear positions explicitly through molecular integrals and implicitly through the optimized occupations and orbitals. For one nuclear coordinate $$R_A$$, the derivative has the schematic form

$$
\frac{dE_{\mathrm{NOF}}}{dR_A}
=
\frac{\partial E_{\mathrm{NOF}}}{\partial R_A}
+
\sum_p\frac{\partial E_{\mathrm{NOF}}}{\partial n_p}\frac{dn_p}{dR_A}
+
\sum_{pq}\frac{\partial E_{\mathrm{NOF}}}{\partial C_{pq}}\frac{dC_{pq}}{dR_A}.
$$

For properly converged variational variables, stationarity conditions can simplify the response terms, but these simplifications must be consistent with occupation constraints, orbital orthonormality, geometry-dependent basis functions, Pulay corrections, and imperfect numerical optimization. Finite quantum sampling can further introduce geometry-dependent fluctuations into the energy surface and its derivatives.

A central-difference force estimator is one possible implementation,

$$
F_{A\alpha}
\approx
-\frac{E_{\mathrm{BO}}(R_{A\alpha}+\delta)-E_{\mathrm{BO}}(R_{A\alpha}-\delta)}{2\delta}.
$$

Writing the two estimated energies as $$E_+$$ and $$E_-$$ gives an approximate statistical variance

$$
\operatorname{Var}(F_{A\alpha})
\approx
\frac{
\operatorname{Var}(E_+)+\operatorname{Var}(E_-)
-2\operatorname{Cov}(E_+,E_-)
}{4\delta^2}.
$$

The force error can therefore become sensitive to both the displacement $$\delta$$ and the covariance between energy measurements. Correlated sampling or reuse of measurement information may help, but their efficacy for occupation-based NOF forces remains to be established. A completed AIMD implementation must report force convergence, trajectory stability, time-step dependence, total-energy drift, shot cost per nuclear step, and complete trajectory runtime. **No such completed AIMD-OS-VQO trajectories are reported in the supplied Solution.**

## Performance Metrics and Scaling

The computational advantage sought by occupation-based methods comes from using a reduced set of occupation observables or occupation-space variables. The electronic Hamiltonian generally contains a number of one- and two-electron terms scaling as $$\mathcal{O}(M^4)$$ in the number of orbitals $$M$$, while the full 1-RDM contains $$\mathcal{O}(M^2)$$ entries. ON-VQE measures $$\mathcal{O}(M)$$ diagonal occupations in one computational-basis setting. This distinction concerns the number of observables and measurement settings; it is not an asymptotic bound on the number of shots required for a specified energy error.

For the minimal OS-VQO pair encoding, $$N_q=N_{\mathrm{pairs}}$$. This resource statement is tied to the assumption of one qubit for two occupation alternatives per pair. Other pair-space models can have different register sizes, and the total classical cost may increase with the number of natural orbitals, molecular integrals, and orbital-optimization variables even when the quantum representation is compact.

Under ideal independent sampling, occupation standard errors decrease proportionally to $$N_{\mathrm{shots}}^{-1/2}$$, but achieving a given energy precision depends on functional derivatives, occupation covariance, and the geometry-dependent correlation regime. Hybrid optimization also invokes the measurement procedure repeatedly. If objective evaluation $$k$$ uses $$S_k$$ shots, then

$$
N_{\mathrm{shots,total}}=\sum_{k=1}^{N_{\mathrm{eval}}}S_k,
$$

so the number of optimizer evaluations and the ability to reuse occupation data are essential resource metrics. A single-setting circuit that is executed many times during optimization may still be expensive.

| Performance metric | What to report |
| --- | --- |
| Physical system | Atoms, electrons, orbital basis, and molecular geometries |
| Occupation representation | Number of pair spaces, alternatives per pair, and occupation variables |
| Quantum resources | Algorithmic/physical qubits, layout, circuit depth, gate counts |
| Sampling | Shots per execution, total shots, independent repetitions |
| Occupation accuracy | Individual and aggregate errors with uncertainties |
| Energy accuracy | NOF consistency error and, separately, error against higher-accuracy references |
| Optimization | Quantum parameter evaluations, classical orbital iterations, convergence tolerances |
| Classical cost | Integrals, transformations, functional evaluation, memory, optimization |
| Runtime | QPU time, CPU/GPU time, and end-to-end elapsed time |
| Future AIMD | Force accuracy, evaluations per nuclear step, drift, trajectory length, and total cost |

The practical breaking point can arise from insufficient circuit expressivity, available qubits, gate and readout errors, growing shot requirements, difficult natural orbital optimization, expensive functional and integral evaluations, or failures of the selected NOF in strongly correlated regimes. A compact quantum circuit does not remove these limitations. No universal system-size threshold or asymptotic advantage follows from the reported measurement-setting reduction.

## Comparative Evaluation and Crossing-Point Analysis

A comparison designed to isolate the computational effect of quantum occupation processing should begin with **classical NOFT using the same functional, orbitals, basis, spin conventions, and physical model**. Comparisons with conventional VQE, full configuration interaction, or DMRG address broader differences in both the computational algorithm and the physical approximation used to evaluate the electronic energy.

| Method | Quantum/classical representation | Energy evaluation | Main comparison issue |
| --- | --- | --- | --- |
| Classical NOFT | Classically optimized occupations and orbitals | Approximate NOF | Optimization accuracy and classical cost |
| NOF-VQE | Quantum measurements of the 1-RDM | Approximate NOF | 1-RDM measurement overhead |
| ON-VQE | Direct natural occupations from a many-electron quantum state | Approximate NOF | Sampling and orbital optimization |
| OS-VQO | Quantum occupation-space probabilities | Approximate NOF | Encoding restrictions and optimization |
| Conventional VQE | Parameterized many-electron quantum state | Hamiltonian expectation | Measurements and variational optimization |
| FCI | Complete finite-basis electronic wavefunction | Exact finite-basis Hamiltonian | Combinatorial configuration-space size |
| DMRG | Tensor-network electronic state | Variational Hamiltonian expectation | Bond dimension and convergence |

### Functional Consistency and Physical Accuracy

Two distinct energy differences should be reported. The first compares the quantum occupation result against a classical calculation using the **same** NOF,

$$
\Delta E_{\mathrm{NOF}}
=
\left|E_{\mathrm{quantum\text{-}NOF}}-E_{\mathrm{classical\text{-}NOF}}\right|.
$$

This probes whether quantum occupation preparation, measurement, and optimization reproduce the functional calculation. The second compares a method against a reliable many-electron reference for the **same finite-basis Hamiltonian**,

$$
\Delta E_{\mathrm{exact}}
=
\left|E_{\mathrm{method}}-E_{\mathrm{FCI}}\right|,
$$

or against an appropriately converged DMRG or selected-CI reference where FCI is impractical. This probes the combined electronic-structure approximation, including any NOF error. Neither comparison should be substituted for the other.

ON-VQE and OS-VQO should be compared on matched molecular systems and functionals while reporting qubit counts, variational parameters, circuit resources, occupation errors, total shots, orbital optimization, and runtime. Their accessible occupation domains need not coincide, so a difference in energy can originate from the quantum representation as well as its optimization. Comparison with conventional VQE should additionally distinguish the fact that one method minimizes an approximate NOF and the other estimates a Hamiltonian expectation value.

### End-to-End Resources and Crossing Points

A useful decomposition of computational work is

$$
W_{\mathrm{occupation}}
=
W_{\mathrm{setup}}+W_{\mathrm{quantum}}+W_{\mathrm{optimization}}
+W_{\mathrm{orbital}}+W_{\mathrm{NOF}}+W_{\mathrm{other}},
$$

where terms should be defined without double-counting quantum measurements or classical computations shared between stages. Accumulated work and elapsed wall-clock time are different quantities when tasks execute concurrently, so both should be measured.

For system size $$N$$ and target accuracy $$\varepsilon$$, a putative crossing point against classical NOFT satisfies

$$
T_{\mathrm{quantum\text{-}NOF}}(N^*,\varepsilon)
=
T_{\mathrm{classical\text{-}NOFT}}(N^*,\varepsilon),
$$

with the same NOF, molecular conditions, accuracy metric, and complete time accounting. Relevant studies include occupation error versus shot budget; electronic energy and occupations versus geometry; orbital-optimization cost versus basis size; circuit and classical costs versus electron-pair count; and total runtime versus required energy accuracy. The H₂₁₆ demonstration provides a large occupation-space test, but not the end-to-end hardware-optimization and classical-baseline timing data needed to establish such a crossing point.

For AIMD, the appropriate time-to-solution would be the complete trajectory cost rather than a single-point electronic energy evaluation. A representative decomposition is

$$
T_{\mathrm{AIMD}}
=
T_{\mathrm{setup}}
+
\sum_{k=1}^{N_{\mathrm{steps}}}
\left[T_{\mathrm{electronic}}^{(k)}+T_{\mathrm{forces}}^{(k)}+T_{\mathrm{propagation}}^{(k)}\right],
$$

with reused computations counted only once. Equal-energy-accuracy comparisons alone are inadequate if the competing approaches produce different force errors, energy drift, or trajectory reliability. Such benchmarking becomes meaningful only after the occupation-based force calculation and nuclear propagation have been implemented and validated.

The published ON-VQE work demonstrates direct occupation measurements for NOF electronic energies and a large reduction in distinct measurement bases. The OS-VQO manuscript reports a 108-qubit occupation-space representation for H₂₁₆ with raw hardware results consistent with noiseless and classical PNOF7 calculations. These are significant electronic-structure demonstrations, but **they do not establish a general quantum computational advantage or a completed occupation-based AIMD workflow**.

## Applied Problem Links

{% assign applied_problem = site.problems | where: "title", "Ground-State Electronic Structure and AIMD on Quantum Computers" | first %}
{% if applied_problem %}
[Ground-State Electronic Structure and AIMD on Quantum Computers]({{ applied_problem.url | relative_url }}) — Occupation-based electronic ground states, hydrogen-cluster dissociation, and the proposed NOF-driven Born-Oppenheimer molecular-dynamics extension.
{% else %}
**Ground-State Electronic Structure and AIMD on Quantum Computers** — Occupation-based electronic-structure calculations and a proposed molecular-dynamics extension.
{% endif %}

## Reproducibility

A reproducible ON-VQE or OS-VQO benchmark must fully specify the molecular Hamiltonian and geometry, occupation model, functional approximation, circuit representation, optimization provenance, and computational resources. The molecular data should include atomic coordinates, molecular charge, electron and spin sector, basis set, frozen-core treatment, one- and two-electron integral conventions, and reference energies and occupations where available. The natural orbital functional should be identified unambiguously as PNOF5, PNOF7, GNOF, or another specified version, together with pair-space partitioning, occupation conventions, interpair terms, constraint handling, and orbital-transformation procedures.

For ON-VQE, the essential algorithm data include the fermion-to-qubit mapping, spin-orbital ordering, reference state, pair-excitation ansatz, circuit decomposition, parameter initialization, quantum optimizer, orbital optimizer, and procedure for extracting occupations from measured bitstrings. For OS-VQO, they include the occupation-space alternatives per pair, encoding map, algorithmic and physical qubit counts, circuit parameterization, conversion of outcome probabilities into occupations, pair-normalization enforcement, and natural orbital treatment. The use of fixed orbitals must be identified separately from self-consistent orbital optimization.

For hardware work, record the processor and calibration data, qubit layout, native gate set, compiled depth and one-/two-qubit gate counts, shots and independent executions, readout processing, noise mitigation or postselection, and complete execution time. In particular, identify whether circuit parameters were optimized on a noiseless simulator, noisy simulator, or physical QPU, and whether hardware was used solely to execute fixed parameters. The raw and mitigated occupation estimates should be retained when both are available, along with uncertainty estimates and optimization traces.

For any future AIMD extension, additional inputs include initial nuclear coordinates and velocities, nuclear masses, force-estimation method, integration algorithm, time step, propagation duration, force reference calculations, electronic convergence per nuclear configuration, measurement use per force or time step, total-energy drift, and trajectory uncertainties. The method should be compared with classical NOFT-AIMD and other suitable AIMD references using compatible physical models and initial conditions.

Numerical outputs should include energy and natural occupations at each geometry, errors against both classical matched-functional and higher-accuracy references, occupation covariances or repeat-execution statistics, complete orbital coefficients, circuit and optimizer convergence information, CPU/GPU/QPU resources, and end-to-end wall-clock time. The recorded software environment should identify the classical NOF program, quantum simulator or runtime, circuit compiler, optimizer libraries, numerical precision, and relevant software versions.

The associated `code_repository` points to the ON-VQE reference implementation, **not** to a verified unified ON-VQE/OS-VQO/AIMD software package: [ON-VQE reference code](https://github.com/gatox/PennyLane_Exercises/blob/main/test_nof_vqe/NOFVQE/nofvqe.py). Relevant software ecosystems mentioned by the source include PennyLane, PennyLane Lightning, PyNOF, DoNOF, and IBM Quantum software. An OS-VQO implementation or validated benchmark dataset should be linked separately if one becomes available.

## Primary References

Edison X. Salazar, Juan Felipe Huan Lew-Yee, and Mario Piris, “Electronic Structure Calculations from Occupation Numbers on Quantum Computers,” arXiv:2607.15425 (2026). [arXiv](https://arxiv.org/abs/2607.15425); [full text](https://arxiv.org/html/2607.15425v1).

Edison X. Salazar and Mario Piris, “Occupation-Space Variational Quantum Optimization,” *ChemRxiv* (2026). [DOI: 10.26434/chemrxiv.15008226/v1](https://doi.org/10.26434/chemrxiv.15008226/v1).

Dmitry A. Fedorov, Matthew J. Otten, Stephen K. Gray, and Yuri Alexeev, “Ab initio molecular dynamics on quantum computers,” *Journal of Chemical Physics* **154**, 164103 (2021). [DOI: 10.1063/5.0046930](https://doi.org/10.1063/5.0046930).

### Supporting References

Juan Felipe Huan Lew-Yee and Mario Piris, “Efficient Energy Measurement of Chemical Systems via One-Particle Reduced Density Matrix: A NOF-VQE Approach for Optimized Sampling,” *Journal of Chemical Theory and Computation* **21**, 2402–2413 (2025).

Mario Piris, “Global Method for Electron Correlation,” *Physical Review Letters* **119**, 063002 (2017). [DOI: 10.1103/PhysRevLett.119.063002](https://doi.org/10.1103/PhysRevLett.119.063002).

Mario Piris, “Global Natural Orbital Functional: Towards the Complete Description of the Electron Correlation,” *Physical Review Letters* **127**, 233001 (2021). [DOI: 10.1103/PhysRevLett.127.233001](https://doi.org/10.1103/PhysRevLett.127.233001).

A. Rivero-Santamaría and M. Piris, “Time evolution of natural orbitals in ab initio molecular dynamics,” *Journal of Chemical Physics* **160**, 071102 (2024).

### Supporting Resources

[ON-VQE preprint](https://arxiv.org/html/2607.15425v1); [ON-VQE reference implementation](https://github.com/gatox/PennyLane_Exercises/blob/main/test_nof_vqe/NOFVQE/nofvqe.py); [OS-VQO ChemRxiv preprint](https://doi.org/10.26434/chemrxiv.15008226/v1); [Natural Orbital Functional Theory research](https://www.ehu.eus/chemistry/theory/5_kt-seminars/natural-orbital-functional-theory/); [DoNOF research and software](https://www.ehu.eus/chemistry/theory/).
