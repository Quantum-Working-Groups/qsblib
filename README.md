# Quantum Simulation Benchmarking Library (QSB-Lib)

Welcome to the Quantum Simulation Benchmarking Library. Our objective is to classify targeted physical systems into a finite number of model-property pairs (benchmark instances, or the "Problems") and pit different methods (e.g., from the classical or quantum paradigms) against each other ("the Solutions") to solve these pairs.

Visit the official [website](https://quantum-working-groups.github.io/qsblib/) to view the current results.

## Table of Contents
- [Quantum Simulation Benchmarking Library (QSB-Lib)](#quantum-simulation-benchmarking-library)
 - [Table of Contents](#table-of-contents)
 - [Problem Classification Framework](#problem-classification-framework)
 - [Solution Classification Framework](#solution-classification-framework)
 - [Getting Started](#getting-started)
 - [Contributors and Acknowledgement](#contributors-and-acknowledgement)
 - [Contact](#contact)

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

## Getting Started

To contribute, see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed submission guidelines.

## Contributors and Acknowledgement

This repository was created as part of the Materials Science Quantum Working Group effort, and in partnership with the Hamiltonian Simulation Quantum Working Group, High Energy Physics Quantum Working Group, and Sustainability Quantum Working Group. We thank the Quantum Optimization Benchmark Library authors and the Optimization Quantum Working Group for inspiring some of the elements of this benchmark effort.

### Maintainers

**Eric D. Switzer** (eric.switzer@nist.gov), **Rodrigo Neumann** (rneumann@br.ibm.com)

### Core Contributors

**Eric D. Switzer** (eric.switzer@nist.gov), David de Miguel Armisén, Abel Carreras, Edison Salazar, Yan Li

## Contact

For questions, issues, or contributions, please open an issue on this repository or contact the maintainers listed in the contributors section.
