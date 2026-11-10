const $ = id => document.getElementById(id);
let model;

function scenario() {
  return {
    speed: Number($("speed").value),
    distance: Number($("distance").value),
    friction: Number($("friction").value) / 100,
    reaction: Number($("reaction").value) / 10
  };
}

function stoppingDistance(row) {
  const speed = row.speed / 3.6;
  return speed * row.reaction + speed * speed / (2 * row.friction * 9.81) + 2;
}

function risk(row) {
  const speed = row.speed / 3.6;
  const x = [speed, speed * speed / row.friction, speed * row.reaction, row.distance];
  let z = model.weights[0];
  for (let j = 0; j < 4; j++) z += model.weights[j + 1] * (x[j] - model.means[j]) / model.scales[j];
  return 1 / (1 + Math.exp(-z));
}

function update() {
  const row = scenario();
  $("speed-out").textContent = `${row.speed} km/h`;
  $("distance-out").textContent = `${row.distance} m`;
  $("friction-out").textContent = row.friction.toFixed(2);
  $("reaction-out").textContent = `${row.reaction.toFixed(1)} s`;
  const score = risk(row);
  $("score").textContent = `${Math.round(score * 100)}%`;
  $("model-call").textContent = score >= 0.5 ? "Hazard" : "Safe";
  $("baseline").textContent = stoppingDistance({...row, friction: 0.7, reaction: 1}) >= row.distance ? "Hazard" : "Safe";
  $("truth").textContent = stoppingDistance(row) >= row.distance ? "Hazard" : "Safe";
  $("stopping").textContent = `${stoppingDistance(row).toFixed(1)} m`;
}

function resultRow(name, data) {
  const percent = value => `${(value * 100).toFixed(1)}%`;
  return `<tr><th scope="row">${name}</th><td>${percent(data.model.accuracy)}</td><td>${percent(data.baseline.accuracy)}</td><td>${data.model.false_negatives} / ${data.baseline.false_negatives}</td></tr>`;
}

function start() {
  if (!window.BENCHMARK_DATA) {
    $("model-call").textContent = "Could not load data.js";
    return;
  }
  model = window.BENCHMARK_DATA.model;
  const results = window.BENCHMARK_DATA.results;
  $("result-rows").innerHTML = resultRow("Typical (1,200 cases)", results.test) + resultRow("Slippery road + slower reaction (1,200 cases)", results.stress);
  $("result-note").textContent = `At the 50% cutoff, the model missed ${results.test.model.false_negatives} hazards in typical cases and ${results.stress.model.false_negatives} in stress cases. A 25% cutoff missed ${results.test.conservative_model.false_negatives} and ${results.stress.conservative_model.false_negatives} in these samples, but made more false alarms.`;
  ["speed", "distance", "friction", "reaction"].forEach(id => $(id).addEventListener("input", update));
  update();
}

start();
