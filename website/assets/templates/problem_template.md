
---
layout: problem
title: "REPLACE: Physical Model — Target Property"
# Brief description displayed on the Problems directory card.
summary: "A concise 1–2 sentence description of the physical system, target observable, and scientific question."
published: false
submitted_by: "Primary contact person for the submission"
contributions_by: "Contributions from any other individuals for the submission"
si_use: "Indicate whether super intellegence (SI) was used to assist building the submission (not the underlying work). You may indicate the degree in which SI was used."

# Select all applicable classifications.
# Use [] when a category is not applicable.
# Model Class and Property Class are derived from these fields.

physical_model_classes:

  # Molecular, atomistic, condensed matter, spin,
  # fermion/boson lattice, nuclear, quantum field,
  # gauge, synthetic.
  physical_system_model_type: []

  # 0D, 1D, 2D, 3D, graph, continuum, lattice,
  # finite cluster, etc.
  dimensionality_geometry: []

  # Fermionic, bosonic, spin, gauge, mixed, classical.
  degrees_of_freedom: []

  # Noninteracting, local, long-range, many-body,
  # strongly correlated, frustrated.
  interactions: []

  # Discrete, continuous, global, local gauge,
  # topological, conservation laws.
  symmetry_constraints: []

  # Electronic, magnetic, superconducting, topological,
  # critical, confined/deconfined, driven/open.
  phases_physical_regimes: []

  # Organic, inorganic, metal-organic, heavy-element,
  # particle/field content, synthetic.
  composition_constituents: []

property_classes:

  # Energy/spectrum, structure/order, correlations,
  # transport/response, thermodynamics, dynamics,
  # scattering, entanglement, gauge/topology.
  physical_observable: []

  # Static, stationary dynamical, transient,
  # steady-state, periodic, scattering.
  time_dependence: []

  # Local, multipoint, extended/nonlocal,
  # global, momentum-resolved.
  spatial_dependence: []

  # Ground, excited, thermal, nonequilibrium,
  # steady state, scattering.
  physical_state: []

  # Scalar, tensor, correlation function, spectrum,
  # distribution, amplitude, phase diagram.
  property_representation: []

  # Finite-system, finite-time, thermodynamic,
  # continuum, critical scaling.
  scale_limiting_behavior: []

# Define the specific problem represented by this page.
# Use the Markdown sections below for detailed explanations.
problem_specification:
  hamiltonian_or_action: ""
  system_size: ""
  model_parameters: {}
  boundary_conditions: ""
  initial_conditions: ""
  target_observable: ""
  target_accuracy: ""
  units: ""
---

## Scientific Question

Describe the physical model–property pair being benchmarked.

* **Physical Problem:** What system or physical phenomenon is being investigated?
* **Scientific Objective:** What physical question is the benchmark intended to answer?
* **Physical Significance:** Why is this quantity important?
* **Target Regime:** What parameters, states, or physical conditions are of interest?

Each Problem represents a specific physical model–property pair, independently of the computational method used to solve it.

## Physical Model Definition

Describe the model mathematically and physically.

* **Hamiltonian / Action / Governing Equations:** Provide the mathematical formulation using LaTeX where appropriate.
* **Degrees of Freedom:** Specify particles, spins, fields, local Hilbert spaces, and relevant truncations.
* **Dimensionality / Geometry:** Describe spatial dimension, lattice or continuum geometry, connectivity, and boundary conditions.
* **Interactions:** Define the coupling terms, interaction ranges, and relevant correlation regimes.
* **Symmetries / Constraints:** Identify global/local symmetries, conservation laws, gauge groups, and relevant physical constraints.
* **Physical Regimes:** Specify known, assumed, or investigated phases.
* **Composition / Constituents:** Describe the relevant atomic, molecular, nuclear, particle, or field content.

## Target Property

Define the physical quantity being calculated.

* **Physical Observable:** Specify the operator, energy, spectrum, correlation function, response function, scattering amplitude, or other target quantity.
* **Time Dependence:** Describe static, stationary dynamical, transient, steady-state, periodic, or scattering behavior.
* **Spatial Dependence:** Specify local, multipoint, extended/nonlocal, global, or momentum-resolved behavior.
* **Physical State:** Identify the ground, excited, thermal, nonequilibrium, steady, or scattering state.
* **Property Representation:** Define whether the result is a scalar, tensor, spectrum, correlation function, distribution, amplitude, or phase diagram.
* **Scale / Limiting Behavior:** Describe finite-size, finite-time, thermodynamic, continuum, or critical scaling.

Provide mathematical definitions, normalizations, and units where applicable.

## Problem Parameters and Conditions

Specify the physical parameters and conditions defining this benchmark.

* **System Size:** Number of sites, orbitals, particles, fields, modes, or other degrees of freedom.
* **Model Parameters:** Interaction strengths, coupling constants, masses, chemical potentials, temperatures, etc.
* **Boundary Conditions:** Open, periodic, fixed, or other relevant conditions.
* **Initial Conditions:** Specify initial states or configurations for dynamical problems.
* **Parameter Ranges:** Identify any system-size, coupling, temperature, or time ranges considered.
* **Target Accuracy:** Specify the required precision or uncertainty for the calculated property.

The problem title identifies this benchmark. A separate benchmark case identifier is not required.

If multiple system sizes or parameter values are considered for scaling analysis, document them here as part of the same problem.

## Computational Challenges

Describe the known physical and computational difficulties associated with solving this problem.

Examples include:

* Strong correlations and competing orders.
* Exponential growth of Hilbert-space dimension.
* Frustration and near-degenerate states.
* Fermion sign or complex-phase problems.
* Entanglement growth during real-time evolution.
* Long-range interactions or nonlocal observables.
* Open-system dynamics and dissipation.
* Gauge constraints and continuum extrapolation.
* Finite-size scaling and critical behavior.

Explain why these challenges matter for the target property, without favoring any particular computational approach.

## Accuracy and Validation Criteria

Describe how a proposed solution should be evaluated.

* **Target Accuracy:** Acceptable absolute or relative errors.
* **Reference Results:** Known analytical solutions, exact small-system calculations, established numerical benchmarks, or experimental measurements.
* **Uncertainty:** Statistical and systematic uncertainty requirements.
* **Convergence:** Relevant finite-size, basis-size, time-step, or continuum extrapolations.
* **Physical Consistency:** Conservation laws, symmetries, sum rules, or other validation checks.

If no accepted reference result exists, state this explicitly.

## Comparative Solutions and Performance

Summarize available solutions addressing this problem.

| Solution | Computational Paradigm | Method | Accuracy | Runtime | Resources |
| --- | --- | --- | --- | --- | --- |
| [Solution] | [Paradigm] | [Method] | [Error] | [Time] | [Resources] |

Compare solutions under equivalent physical conditions and accuracy targets.

Include scaling plots where available:

* Runtime versus system size.
* Accuracy versus computational cost.
* Memory or quantum resource requirements.
* Crossing points between competing methods.

Clearly distinguish measured comparisons from extrapolated predictions.

## Primary References

* **[Publication Title].** Author List, *Journal Name* Volume, Page (Year). DOI / arXiv URL.
