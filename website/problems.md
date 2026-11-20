---
layout: default
title: Problems
permalink: /problems/
---

# Problem Zoo Directory

Select a model-property pair from the catalog below to view the latest benchmarks.

<div class="problem-grid">
{% for problem in site.problems %}
  {% if problem.published != false %}

    {% assign model = problem.physical_model_classes %}
    {% assign properties = problem.property_classes %}

    <a href="{{ problem.url | relative_url }}" class="problem-card">

      <div class="card-number">
        PROBLEM-0{{ forloop.index }}
      </div>

      <h2 class="card-title">
        {{ problem.title }}
      </h2>

      <!-- Model classification derived from YAML -->
      <div class="card-subtitle">
        {% if model.physical_system_model_type.size > 0 %}
          {{ model.physical_system_model_type | join: ", " | escape }}
        {% else %}
          Unclassified Model
        {% endif %}

        {% if model.dimensionality_geometry.size > 0 %}
          &bull; {{ model.dimensionality_geometry | join: ", " | escape }}
        {% endif %}
      </div>

      <p class="card-summary">
        {{ problem.summary | default: "No summary provided. Click to view details." | escape }}
      </p>

      <!-- Property classifications derived from YAML -->
      <div class="card-tags">

        {% for observable in properties.physical_observable %}
          <span class="tag tag-primary">
            {{ observable | escape }}
          </span>
        {% endfor %}

        {% for temporal in properties.time_dependence %}
          <span class="tag">
            {{ temporal | escape }}
          </span>
        {% endfor %}

      </div>

    </a>

  {% endif %}
{% endfor %}
</div>
