---
layout: solution
title: "Two-Dimensional Tensor-Network Simulation with Belief-Propagation Gauging"
published: true
submitted_by: "Eric D. Switzer"
si_use: "Yes"

solution_classes:
  computational_paradigm: "Classical computational"
  method_family:
    - "Tensor network"
    - "Time evolution"
  algorithmic_approach:
    - "Iterative"
    - "Simulation/emulation"
  approximation_error_control:
    - "Heuristic/uncontrolled"
  si_ml_involvement:
    - "None"

problems_applied:
  - "Discrete Time Crystals in 2D"

summary: "Classical simulation of two-dimensional quantum many-body dynamics using tensor networks and belief-propagation gauging. The method preserves the physical lattice connectivity and approximates local and multipoint observables through efficient environment contractions, with accuracy assessed against matrix product state calculations where feasible."

solution_status:
  role: "Reference"
  validation: "Partially validated"

code_repository: ""
data_repository: ""
---

## Algorithm Overview

Two-dimensional tensor-network simulation with belief-propagation gauging is a classical computational approach for approximating the nonequilibrium dynamics of interacting quantum many-body systems. The method represents the evolving wavefunction as a network of local tensors whose connectivity follows the physical lattice. By retaining the two-dimensional structure, it avoids the artificial long-range connections introduced when the system is mapped onto a one-dimensional tensor chain, as is commonly required by matrix product state (MPS) methods.

The principal computational difficulty is that exact contraction and optimal truncation of general two-dimensional tensor networks are substantially more demanding than their one-dimensional counterparts. In networks containing loops, the environment associated with a local tensor generally depends on correlations distributed throughout the network, preventing the direct construction of an exact canonical form using only local operations. Belief propagation (BP) provides an approximate treatment of these environments through iterative message passing between neighboring tensors. The resulting information can be used to gauge the network toward a Vidal canonical form and support computationally manageable updates and observable evaluations.

The approach is particularly relevant to time-dependent problems in which the evolving state remains sufficiently compressible within a moderate tensor-network bond dimension. Localized or slowly entangling regimes can be favorable, whereas strongly entangling dynamics may require rapidly increasing bond dimensions and introduce substantial contraction errors. The computational effectiveness of the method therefore depends on the physical dynamics as well as the numerical quality of the belief-propagation approximation.

The primary application considered here is the periodically driven, disordered XXZ Heisenberg model used to investigate discrete time crystals in two dimensions. The objective is to calculate local spin polarization, spin-memory autocorrelations, spatial correlations, and dynamical order parameters over successive Floquet cycles. These classical calculations provide references for interpreting quantum-hardware measurements and for identifying parameter regimes in which the simulated dynamics remain numerically reliable.

The method is entirely classical and does not require quantum hardware or machine learning. Its approximation errors arise from the finite tensor-network representation, local tensor updates and truncations, and the treatment of network environments. These errors must be distinguished from the hardware noise affecting experimental quantum simulations of the same physical model.

## Methodology and Execution

### Tensor-Network Representation and Time Evolution

A general many-body wavefunction can be expanded in a product basis as

$$
\lvert\Psi\rangle
=
\sum_{\{s_i\}}
\mathcal{C}_{s_1,\ldots,s_N}
\lvert s_1,\ldots,s_N\rangle,
$$

where $$s_i$$ denotes the local physical degree of freedom and $$\mathcal{C}$$ is the many-body coefficient tensor. A tensor-network representation factorizes this coefficient tensor into smaller tensors connected by virtual indices. For a spin-$$1/2$$ lattice, the local physical dimension is $$d=2$$, while the virtual indices have dimensions bounded by a chosen bond dimension $$D$$.

In the two-dimensional representation, each local tensor is connected to tensors associated with neighboring physical sites. The network topology can therefore reproduce the decorated heavy-hexagonal connectivity of the target lattice. This contrasts with an MPS representation, in which all sites are arranged in a one-dimensional chain. Such a mapping can make originally local two-dimensional interactions nonlocal along the chain and may require substantially larger bond dimensions to capture correlations extending across the lattice.

The time-dependent calculation begins with a tensor-network representation of the specified initial state, typically a computational-basis product state for the discrete-time-crystal benchmark. For a periodically driven system, the state after $$t$$ Floquet cycles is

$$
\lvert\Psi_t\rangle
=
U_F^t\lvert\Psi_0\rangle,
$$

where $$U_F$$ is the single-cycle Floquet operator. In the target XXZ model, each cycle consists of a transverse spin rotation followed by layers of nearest-neighbor interactions. The circuit structure is compatible with local tensor-network updates because the interaction gates act on neighboring sites of the physical graph.

During time evolution, the application of local gates changes the tensors and may increase the dimensions needed to represent correlations between neighboring regions. Compression or truncation is therefore necessary when the computational representation is restricted to a maximum bond dimension. The quality of the resulting approximation depends on whether the retained virtual spaces continue to capture the physically relevant correlations.

The numerical workflow alternates, as required by the implementation, between local time-evolution updates, tensor decompositions, bond truncations, and approximate regauging. Belief propagation is used to estimate the environments needed for this process. The detailed scheduling of these operations, including the frequency of regauging and the choice of truncation procedure, must be specified when reproducing a particular implementation.

### Belief-Propagation Gauging

Belief propagation approximates the influence of the surrounding tensor network on a local tensor or bond through iterative message passing. Each directed connection between neighboring tensors is associated with a message that summarizes information obtained from a local contraction involving the neighboring tensor and the messages arriving from its other connections. Repeated updates propagate approximate environmental information throughout the network.

For a tree-structured tensor network, message passing can recover the relevant environment information without the complications associated with closed loops. In a two-dimensional network containing cycles, the messages generally provide an approximation because correlations circulating around loops are not represented exactly by independent local messages. Nevertheless, the resulting environments can be useful when the physical state and network geometry permit accurate local approximations.

The converged messages are used to construct gauge transformations that bring the network toward an approximate Vidal canonical form. Such a representation makes information about local normalization and bond correlations more accessible and supports efficient tensor updates and observable calculations. Unlike the exact canonical forms available for suitable one-dimensional tensor networks, the BP-gauged representation of a general loopy two-dimensional network is not guaranteed to be globally canonical.

The procedure therefore has two distinct convergence questions. The first concerns whether the iterative message-passing equations reach a stable fixed point. The second concerns whether the resulting approximate environments accurately describe the original tensor network. Convergence of the messages is evidence of numerical stability of the BP procedure, but it does not establish that the approximate contraction reproduces the exact many-body state or its observables.

The method is most effective when the neglected environmental correlations are sufficiently weak or otherwise compatible with the approximation. As entanglement and spatial correlations become more complex, the accuracy of local environment estimates can deteriorate even if the message-passing iterations converge. Independent numerical comparisons are consequently essential for establishing the regime in which the approach provides reliable physical predictions.

### Observable Evaluation

Once an approximate representation of the evolved state is available, physical observables are evaluated using local contractions and estimated network environments. For a normalized tensor-network state and a local operator $$O_i$$, the expectation value is

$$
\langle O_i(t)\rangle
=
\langle\Psi_t\rvert
O_i
\lvert\Psi_t\rangle.
$$

The implementation described in the primary reference evaluates single-site observables using a rank-one approximation to the effective environment of the corresponding tensor. This reduces the computational cost associated with contracting the complete two-dimensional network, but introduces an additional approximation whose accuracy depends on the correlations omitted from the local environment.

Higher-weight observables can be evaluated through transformations that reduce the corresponding measurement problem to an effective local observable. In particular, an appropriate Clifford transformation can map a Pauli-string observable to a single-site Pauli operator in a transformed state. The resulting expectation value can then be obtained using the same local-observable machinery applied to the transformed tensor network.

This strategy can avoid direct contraction of a larger observable environment, but the transformation may alter the entanglement structure of the represented state. Additional tensor-network updates or truncations can therefore introduce further computational cost and approximation error. The accuracy of transformed-observable calculations must be validated separately when they are used to evaluate multipoint correlations or dynamical order parameters.

The relevant physical observables include time-dependent local spin polarization, spin autocorrelation, nearest-neighbor spin correlations, and quantities constructed from their spatial or temporal averages. Their accuracy depends jointly on the representation of the evolved state and the approximation used to evaluate the corresponding expectation values.

### Computational Platform and SI/ML Involvement

The method is implemented entirely on classical computing resources. Its principal operations include tensor contraction, tensor decomposition, iterative message passing, gauge transformations, and local time-evolution updates. Memory requirements are determined by the number of local tensors, their virtual bond dimensions, and the intermediate objects needed for updating or contracting the network.

The primary publication uses `ITensorNetworks.jl` for the two-dimensional tensor-network calculations, supported by the `ITensors.jl` library. Independent MPS calculations are performed using `TeNPy` to provide numerical comparisons in regimes where one-dimensional tensor-network simulations remain computationally feasible. These implementations use different network representations and approximation procedures, making their agreement particularly useful for validation.

No quantum processing unit is required to execute this Solution. Likewise, no superintelligence or machine-learning model is involved in the reported algorithm. Although belief propagation is also employed in probabilistic inference and machine-learning contexts, its role here is the numerical approximation of tensor-network environments and the associated gauging procedure.

## Approximation and Error Control

The principal sources of approximation error are the finite bond dimension of the tensor-network state, the approximate treatment of environments in networks containing loops, and the numerical errors associated with truncation and iterative evolution. These effects are not independent: a truncated tensor network may alter the correlations that determine the quality of subsequent belief-propagation estimates, while inaccurate environments can affect the local updates used to propagate and compress the state.

The bond dimension $$D$$ controls the expressive capacity of the tensor-network representation. Increasing it permits a larger virtual space and may improve the representation of entanglement, but also increases memory consumption and the cost of tensor operations. Convergence should therefore be investigated by comparing observables obtained at different bond dimensions. For a target observable $$O(t)$$, a useful diagnostic is

$$
\delta_O(D,D';t)
=
\left\lvert
\langle O(t)\rangle_D
-
\langle O(t)\rangle_{D'}
\right\rvert,
$$

where $$D'$$ is a larger comparison bond dimension. A decreasing difference provides evidence of numerical convergence, although agreement between two finite-bond-dimension calculations does not guarantee agreement with the exact state.

Belief-propagation convergence introduces a separate numerical requirement. Relevant diagnostics include the number of message-passing iterations, the change in messages between successive iterations, sensitivity to message initialization, and stability of the calculated local environments. The tolerances used to terminate the iterations should be reported together with the resulting observables. Because belief propagation can converge to an approximate fixed point on a loopy graph, these diagnostics establish the stability of the numerical procedure rather than a rigorous bound on its physical error.

Independent MPS calculations provide an important validation reference when the corresponding simulation can be converged. For an observable evaluated using both methods, define

$$
\Delta_O(t)
=
\left\lvert
\langle O(t)\rangle_{\mathrm{2dTNS}}
-
\langle O(t)\rangle_{\mathrm{MPS}}
\right\rvert.
$$

Agreement across the relevant evolution window provides evidence that the two-dimensional tensor-network approximation is reliable in the tested physical regime, provided that the MPS calculation is itself sufficiently converged. The comparison is especially informative because the two approaches have different network topologies and different limitations arising from entanglement and contraction complexity.

Validation must also account for the observable being evaluated. A method may reproduce local spin polarization accurately while retaining larger errors in spatial correlations or other higher-weight operators. Accordingly, convergence of the wavefunction representation should be assessed through the actual target observables rather than inferred solely from the stability of local tensor updates.

The method does not generally provide a rigorous global error bound for the evolved many-body state. In strongly entangling regimes, finite bond dimensions and approximate environments may produce apparently stable numerical results that differ from the exact dynamics. Reliable calculations should therefore combine bond-dimension studies, belief-propagation diagnostics, and independent numerical comparisons wherever feasible.

## Applied Problems

### Discrete Time Crystals in 2D

The method is applied to the nonequilibrium dynamics of a periodically driven, disordered XXZ Heisenberg spin system on a decorated heavy-hexagonal lattice. The physical problem involves repeated Floquet cycles containing transverse rotations and nearest-neighbor anisotropic interactions. The purpose of the classical tensor-network calculation is to approximate the ideal unitary dynamics and evaluate the local and spatial correlations used to characterize discrete time-crystalline behavior.

For a computational-basis initial state with local spin polarizations $$s_i\in\{-1,1\}$$, the spin-memory autocorrelation is

$$
\Delta(t)
=
\frac{1}{N}
\sum_{i=1}^{N}
s_i
\langle\Psi_t\rvert
Z_i
\lvert\Psi_t\rangle.
$$

This quantity measures the persistence of the initial spin configuration and provides a direct diagnostic of period-doubled dynamics. In the time-crystalline regime, the autocorrelation exhibits a pronounced subharmonic response, while relaxation or loss of coherence can reduce the oscillation amplitude over successive Floquet cycles.

Spatial ordering is characterized through the squared nearest-neighbor correlations,

$$
\chi(t)
=
\frac{1}{M}
\sum_{\langle i,j\rangle}
\left[
\langle\Psi_t\rvert
Z_iZ_j
\lvert\Psi_t\rangle
\right]^2,
$$

where $$M$$ denotes the number of nearest-neighbor bonds included in the sum. This observable complements the spin autocorrelation by probing spatial correlations during the driven evolution. The combination of temporal and spatial diagnostics helps distinguish the time-crystalline regime from localized spin-memory behavior and ergodic relaxation.

The primary publication considers decorated heavy-hexagonal lattice configurations containing 35, 68, and 144 spins in the broader experimental investigation. A representative time-crystalline operating point is

$$
\phi=0.45\pi,
\qquad
\epsilon=0.05,
$$

where $$\phi$$ is the transverse kick angle and $$\epsilon$$ determines the relative strength of the XXZ spin-flip interactions. In this regime, the system exhibits period-doubled dynamics, and the published study uses tensor-network calculations to provide classical comparisons for observables accessible to the approximation.

The two-dimensional tensor-network method is particularly relevant because the physical connectivity can be retained directly, avoiding the additional representational overhead associated with mapping the lattice to an MPS chain. Its accuracy nevertheless depends on the entanglement generated during evolution and the ability of belief propagation to approximate the relevant environments. The published calculations are therefore most appropriately interpreted as numerical references in the regimes where convergence studies and comparisons with other classical methods establish their reliability.

The classical simulation of ideal unitary dynamics and the experimental processing of noisy quantum-hardware measurements are separate components of the study. Agreement between classical results and noise-recovered quantum observables can support the physical interpretation of the experiment, but the assumptions and uncertainties of the noise-recovery procedure are not part of this classical tensor-network algorithm.

## Performance Metrics and Scaling

The computational cost of the method is controlled by the number of lattice sites, the tensor-network bond dimensions, the complexity of local updates and approximate contractions, and the number of evolution steps. Unlike direct state-vector simulation, the algorithm does not explicitly store all $$2^N$$ complex amplitudes of an $$N$$-spin wavefunction. Instead, it represents the state through local tensors whose dimensions depend on the physical and virtual indices.

For a network containing one tensor per site, physical dimension $$d$$, and a maximum local coordination number $$z_{\max}$$, a rough storage estimate for the local tensors at uniform bond dimension $$D$$ is

$$
\mathcal{M}_{\mathrm{tensor}}
=
\mathcal{O}
\left(
N d D^{z_{\max}}
\right).
$$

This estimate describes storage for the tensor representation under fixed local connectivity and does not include all intermediate contraction objects, message data, or implementation-specific overhead. It also does not provide the runtime scaling of the full algorithm. At fixed bond dimension and bounded coordination, tensor storage can increase approximately linearly with system size; however, maintaining a fixed physical accuracy may require increasing $$D$$ as the system grows or evolves.

The dependence on evolution time is particularly important because entanglement generated by repeated Floquet cycles can increase the required bond dimension. A useful conceptual representation is

$$
D=D(N,t,\varepsilon_O),
$$

where $$N$$ is the number of spins, $$t$$ is the number of Floquet cycles, and $$\varepsilon_O$$ denotes the desired accuracy of a specified observable. This dependence is determined by the physical regime and the approximation procedure, and no universal scaling law should be inferred without numerical evidence.

The principal performance and accuracy metrics are summarized below.

| Metric | Description |
| --- | --- |
| System size | Number of spins and physical lattice connectivity |
| Evolution time | Number of Floquet cycles |
| Bond dimension | Maximum and typical virtual bond dimensions |
| Runtime | Initialization, tensor updates, gauging, and observable evaluation |
| Memory | Peak allocation and intermediate tensor storage |
| BP convergence | Message-passing iterations and convergence tolerances |
| Observable accuracy | Deviation from converged or independently validated references |
| Approximation stability | Sensitivity to bond dimension, gauging, and contraction settings |
| Maximum reliable evolution time | Longest simulated time satisfying a stated accuracy criterion |

The method's practical breaking point occurs when increasing bond dimensions, contraction costs, or approximation errors prevent the target observables from being obtained within the specified accuracy and resource limits. In strongly entangling regimes, this point may be reached at comparatively short evolution times, whereas localized or slowly entangling states can remain accessible for substantially longer periods.

A reproducible breaking-point study should hold the physical problem fixed while varying the bond dimension and numerical approximation settings. It should report the largest evolution time for which the target accuracy is demonstrated, together with the computing resources and validation procedure used. The breaking point is therefore not an intrinsic number determined only by the spin count; it depends on the physical parameters, initial state, observable, accuracy threshold, and implementation.

The primary publication demonstrates that two-dimensional tensor-network simulations can provide useful classical comparisons for selected regimes of the discrete-time-crystal experiment. However, this Solution entry does not contain a complete standardized dataset of runtime, memory consumption, bond-dimension convergence, and accuracy thresholds. Such values should be obtained from reproducible calculations rather than inferred from qualitative agreement with experimental observables.

Digital quantum metrics such as physical qubit count, circuit depth, two-qubit gate count, and measurement shots do not apply to execution of this classical method. They become relevant only when the tensor-network results are compared with an independently specified quantum computational Solution.

## Comparative Evaluation and Crossing-Point Analysis

The principal classical comparison is between belief-propagation-gauged two-dimensional tensor networks, matrix product states, and exact state-vector evolution where feasible. These methods represent the same many-body state in different computational forms and consequently face different resource limitations.

| Method | Representation | Principal Advantage | Principal Limitation |
| --- | --- | --- | --- |
| Exact State-Vector Simulation | Complete finite-system Hilbert space | Exact evolution up to numerical precision | Exponential memory and computational cost |
| Matrix Product States | One-dimensional tensor network | Efficient contraction and well-developed truncation methods | Large bond dimensions for strongly entangled two-dimensional systems |
| BP-Gauged 2dTNS | Two-dimensional tensor network | Preserves physical lattice connectivity | Approximate environments, contractions, and truncation errors |

Exact state-vector calculations provide direct validation for sufficiently small systems but become prohibitive at larger spin counts. MPS calculations can extend the accessible system sizes through state compression, although their efficiency depends strongly on the entanglement generated across cuts of the one-dimensional ordering. Two-dimensional tensor networks retain the original connectivity and may represent certain states more efficiently, but the resulting contraction and gauging approximations introduce additional sources of error.

The appropriate comparison is therefore based on the resources needed to reproduce the same physical observables to equivalent accuracy. A lower tensor-network bond dimension is not by itself evidence of greater computational efficiency, since different network geometries have different contraction costs. Likewise, a faster calculation is not a meaningful advantage if it produces substantially larger errors in the target correlation functions.

For a system containing $$N$$ spins evolved through $$t$$ Floquet cycles, define the classical time-to-solution at observable accuracy $$\varepsilon_O$$ as

$$
T_{\mathrm{classical}}
=
T_{\mathrm{classical}}
(N,t,\varepsilon_O).
$$

This quantity should include initialization, time evolution, tensor truncation, belief-propagation gauging, observable evaluation, and any convergence studies required to support the claimed accuracy. The corresponding quantum computational cost must include state preparation, circuit execution, measurement, calibration, noise treatment, and classical postprocessing where applicable.

Potential quantum-classical crossing points can be investigated by comparing the total computational resources required to reproduce the same time-dependent observables across lattice sizes, interaction parameters, and evolution times. The most informative analyses relate classical runtime and memory to bond dimension and Floquet cycle count, while assessing how the observable error changes as numerical approximation parameters are varied.

The comparison should also account for changes in physical regime. Dynamics that preserve a relatively compressible tensor-network state may remain efficiently accessible to classical methods even at large system sizes, whereas strongly entangling dynamics may increase the computational burden substantially. The location of any crossing point therefore depends not only on the number of spins but also on the character of the evolving quantum state and the accuracy required.

The existence of a regime that is difficult for a particular classical tensor-network method does not establish a quantum computational advantage. Such a conclusion requires comparisons with competitive classical algorithms under matched physical conditions and target accuracies, together with complete resource accounting. No quantitative universal crossing point is assigned in this Solution entry.

## Applied Problem Links

{% assign dtc_problem = site.problems | where: "title", "Discrete Time Crystals in 2D" | first %}
{% if dtc_problem %}
[Discrete Time Crystals in 2D]({{ dtc_problem.url | relative_url }}) — Classical simulation of periodically driven XXZ spin dynamics on decorated heavy-hexagonal lattices using two-dimensional tensor networks and belief-propagation gauging.
{% else %}
**Discrete Time Crystals in 2D** — Classical simulation of periodically driven XXZ spin dynamics on decorated heavy-hexagonal lattices using two-dimensional tensor networks and belief-propagation gauging.
{% endif %}

## Reproducibility

A reproducible calculation must specify the physical Floquet model, tensor-network representation, approximation settings, and computational environment. The physical inputs include lattice geometry and connectivity, number of spins, initial state, interaction strengths, disorder realizations, transverse kick angle, XXZ anisotropy, Floquet gate ordering, and the total evolution time. The definitions and normalization conventions of the measured observables must also be recorded.

The tensor-network specification should identify the network topology, initial and maximum bond dimensions, tensor-update and compression procedures, and truncation settings. Because the method relies on approximate belief-propagation environments, the message initialization, update procedure, convergence tolerances, maximum iteration count, and frequency of regauging are required for reproducing the numerical approximation. Observable evaluation procedures should be documented separately for local operators and higher-weight operators requiring additional transformations.

The computational environment should include processor architecture, available memory, numerical precision, parallelization settings, Julia and package versions, and the method used to measure runtime and memory consumption. These details are necessary because the efficiency of tensor operations and message passing can depend substantially on implementation choices.

The primary study identifies `ITensorNetworks.jl` and `ITensors.jl` for the two-dimensional tensor-network calculations and `TeNPy` for the independent MPS comparisons. These packages provide relevant software infrastructure, but the precise package versions, numerical settings, and scripts used for a particular result must be supplied before a calculation can be considered fully reproducible.

Numerical submissions should include the calculated time-dependent observables, convergence studies with respect to bond dimension and belief-propagation settings, and comparisons with independent reference calculations where feasible. Runtime and memory data should be associated with the physical model and approximation parameters used to obtain them. Source-code and numerical-data repositories should be added to the corresponding YAML metadata when reliable links are available.

## Primary References

Eric D. Switzer, Niall F. Robertson, Nathan Keenan, et al., “Realization of two-dimensional discrete time crystals with anisotropic Heisenberg coupling,” *Nature Communications* **17**, 605 (2026). [DOI: 10.1038/s41467-025-67787-1](https://doi.org/10.1038/s41467-025-67787-1).

Joseph Tindall and Matthew T. Fishman, “Gauging tensor networks with belief propagation,” *SciPost Physics* **15**, 222 (2023). [DOI: 10.21468/SciPostPhys.15.6.222](https://doi.org/10.21468/SciPostPhys.15.6.222).

Joseph Tindall, Matthew T. Fishman, E. Miles Stoudenmire, and Dries Sels, “Efficient tensor network simulation of IBM's Eagle kicked Ising experiment,” *PRX Quantum* **5**, 010308 (2024). [DOI: 10.1103/PRXQuantum.5.010308](https://doi.org/10.1103/PRXQuantum.5.010308).
