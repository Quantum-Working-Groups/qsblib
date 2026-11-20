# Quantum Simulation Benchmarking Library

Welcome to the Quantum Simulation Benchmarking Library. Our objective is to classify targeted physical systems into a finite number of model-property pairs (benchmark instances, or the "Problems") and pit different methods (e.g., from the classical or quantum paradigms) against each other ("the Solutions") to solve these pairs.

<figure class="slide-figure">
    <img src="{{ '/assets/images/scope.png' | relative_url }}" alt="Materials Science Problem Zoo Classification Framework" width="100%" style="max-width: 800px; border-radius: 8px; border: 1px solid #e1e4e8;">
    <figcaption class="slide-caption">Classification framework.</figcaption>
</figure>

## Problem Classification Framework

We classify the problems (the physical models and properties) using a taxonomy that is physics-centric, method-independent, and extensible. The classes are:

### Physical Model Classes
* **Physical system / model type:** Molecular, atomistic, condensed matter, spin, fermion/boson lattice, nuclear, quantum field, gauge, synthetic.
* **Dimensionality / geometry:** Dimensionality is defined by the ``statistics of connectivity''. 0D, 1D, 2D, 3D, graph, continuum, lattice, finite cluster, etc.
* **Degrees of freedom:** Fermionic, bosonic, spin, gauge, mixed, classical.
* **Interactions:** Noninteracting, local, long-range, many-body, strongly correlated, frustrated.
* **Symmetry / constraints:** Discrete, continuous, global, local gauge, topological, conservation laws.
* **Phases / physical regimes:** Electronic, magnetic, superconducting, topological, critical, confined/deconfined, driven/open.
* **Composition / constituents:** Organic, inorganic, metal-organic, heavy-element, particle/field content, synthetic.

### Properties Classes
* **Physical observable:** Energy/spectrum, structure/order, correlations, transport/response, thermodynamics, dynamics, scattering, entanglement, gauge/topology.
* **Time dependence:** Static, stationary dynamical, transient, steady-state, periodic, scattering.
* **Spatial dependence:** Local, multipoint, extended/nonlocal, global, momentum-resolved.
* **Physical state:** Ground, excited, thermal, nonequilibrium, steady state, scattering
* **Property representation:** Scalar, tensor, correlation function, spectrum, distribution, amplitude, phase diagram
* **Scale / limiting behavior:** Finite-system, finite-time, thermodynamic, continuum, critical scaling

## Solution Classification Framework

The taxonomy of solutions defines the computational approach used to solve a model-property pair, and is flexible enough to account for hybrid platform solutions.

### Solution Classes
* **Computational paradigm:** Analytical/semi-analytical, classical computational, quantum computational, hybrid quantum–classical, specialized physical/analog computational.
* **Method family:** Exact diagonalization/subspace, mean-field/density functional, perturbative/diagrammatic, tensor network, Monte Carlo/sampling, variational/optimization, time evolution, quantum circuit, analog quantum simulation, machine learning/neural network, effective theory.
* **Algorithmic approach:** Deterministic, stochastic, variational, perturbative, iterative, projection/subspace, learning-based, simulation/emulation.
* **Approximation / error control:** Exact within specified model, systematically convergent, variationally bounded, perturbatively controlled, heuristic/uncontrolled, statistically estimated, noise-limited.
* **SI / ML involvement:** None, neural-state ansatz, learned surrogate, ML-assisted optimization, learned correction, error mitigation, data-driven postprocessing.
