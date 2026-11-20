---
layout: default
title: Solutions Catalog
permalink: /solutions/
---

# Solutions Catalog

Browse computational methods and algorithms paired with benchmark problems in the zoo.

<div class="problem-grid">
{% for solution in site.solutions %}
  {% if solution.published != false %}

    {% assign classes = solution.solution_classes %}

    <a href="{{ solution.url | relative_url }}" class="problem-card">

      <div class="card-number">
        SOLUTION-0{{ forloop.index }}
      </div>

      <h2 class="card-title">
        {{ solution.title }}
      </h2>

      <!-- Paradigm derived from classification YAML -->
      <div class="card-subtitle">
        <strong>Paradigm:</strong>
        {{ classes.computational_paradigm | default: "Unclassified" | escape }}
      </div>

      <p class="card-summary">
        {{ solution.summary | default: "No description provided." | escape }}
      </p>

      <!-- Method classifications -->
      <div class="card-tags">

        {% for method in classes.method_family %}
          <span class="tag tag-primary">
            {{ method | escape }}
          </span>
        {% endfor %}

      </div>

      <!-- Applied problem titles -->
      {% if solution.problems_applied.size > 0 %}
        <div class="card-tags">

          {% for problem_tag in solution.problems_applied %}
            <span class="tag">
              Problem: {{ problem_tag | escape }}
            </span>
          {% endfor %}

        </div>
      {% endif %}

    </a>

  {% endif %}
{% endfor %}
</div>
