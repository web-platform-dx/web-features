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
  const select = document.getElementById("feature-select");
  const container = document.getElementById("status-container");

  // On page load, if a query string is provided, update the widget.
  updateFromQueryString();

  // When the back/forward buttons are used, update the widget.
  window.addEventListener("popstate", (e) => {
    updateFromQueryString();
  });

  // When an item is selected, update the widget.
  select.addEventListener("change", (e) => {
    const newKey = e.target.value;
    if (newKey) {
      addStatusElement(newKey, true);
    }
  });

  // Read the query string and update the widget.
  function updateFromQueryString() {
    const urlParams = new URLSearchParams(window.location.search);
    const qsKey = urlParams.get("key");
    if (qsKey) {
      addStatusElement(qsKey);
      select.value = qsKey;
    }
  }

  // Add the status element to the page, and optionally update the query string.
  function addStatusElement(featureId, updateQueryString) {
    removeStatusElement();
    const elem = document.createElement("baseline-status");
    elem.setAttribute("featureId", featureId);
    container.appendChild(elem);
    if (updateQueryString) {
      const url = new URL(location);
      url.searchParams.set("key", featureId);
      history.pushState({}, "", url);
    }
  }

  // Remove all status elements from the page.
  function removeStatusElement() {
    const elems = container.getElementsByTagName("baseline-status");
    for (const elem of elems) {
      elem.remove();
    }
  }
</script>
