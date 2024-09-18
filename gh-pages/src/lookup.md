---
layout: "default.html"
title: "Lookup Baseline status"
description: Lookup Baseline status for a web feature.
---

Look up the Baseline status of a web feature using the [`<baseline-status>` web component](https://github.com/web-platform-dx/baseline-status).

<div>
  <label for="feature-select">Web feature</label>
  <select name="feature" id="feature-select">
    <option value=""></option>
{% for feature in featuresList %}<option value="{{ feature.key }}">{{ feature.name }} ({{ feature.key }})</option>
{% endfor %}
  </select>
</div>

<div id="status-container">
</div>

<script src="https://cdn.jsdelivr.net/npm/baseline-status@1.0.4/baseline-status.min.js" type="module"></script>

<script>
  const select = document.getElementById('feature-select');
  const container = document.getElementById('status-container');

  select.addEventListener('change', (e) => {
    removeStatusElement();
    const newKey = e.target.value;
    if (newKey) {
      addStatusElement(newKey);
    }
  });

  function removeStatusElement() {
    const elems = container.getElementsByTagName('baseline-status');
    for (const elem of elems) {
      elem.remove();
    }
  }

  function addStatusElement(featureId) {
    const elem = document.createElement('baseline-status');
    elem.setAttribute('featureId', featureId);
    container.appendChild(elem);
  }
</script>
