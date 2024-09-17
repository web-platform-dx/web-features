---
layout: "default.html"
title: "Check feature status"
---


<input type="text" id="feature-name" list="feature-list" />
<button type="button" id="butSub">Check</button>

<datalist id="feature-list"></datalist>


<div id="status-container"></div>

<script src="https://cdn.jsdelivr.net/npm/baseline-status@1.0.4/baseline-status.min.js" type="module"></script>

<script>
  const inp = document.getElementById('feature-name');
  const but = document.getElementById('butSub');
  const container = document.getElementById('status-container');
  const featureList = document.getElementById('feature-list');

  but.addEventListener('click', () => {
    addStatus(inp.value);
  });

  function removeStatus() {
    const elems = container.getElementsByTagName('baseline-status');
    for (const elem of elems) {
      elem.remove();
    }
  }

  function addStatus(featureId) {
    removeStatus();
    const elem = document.createElement('baseline-status');
    elem.setAttribute('featureId', featureId);
    container.appendChild(elem);
  }

  async function populateFeatureList() {
    const resp = await fetch('../assets/data/data.json');
    const data = await resp.json();
    const keys = Object.keys(data.features);
    keys.forEach((key) => {
      const elem = document.createElement('option');
      elem.setAttribute('value', key);
      featureList.appendChild(elem);
    });
  }

  populateFeatureList();
</script>
