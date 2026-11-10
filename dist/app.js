const $ = id => document.getElementById(id);
const inputs = ["speed", "distance", "friction", "reaction"];
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
  if (!model) return;
  const row = scenario();
  $("speed-out").textContent = `${row.speed} km/h`;
  $("distance-out").textContent = `${row.distance} m`;
  $("friction-out").textContent = row.friction.toFixed(2);
  $("reaction-out").textContent = `${row.reaction.toFixed(1)} s`;
  const score = risk(row);
  const hazard = stoppingDistance(row) >= row.distance;
  const baseline = stoppingDistance({...row, friction: 0.7, reaction: 1}) >= row.distance;
  $("score").textContent = `${Math.round(score * 100)}%`;
  $("meter-fill").style.width = `${Math.round(score * 100)}%`;
  $("meter-fill").style.background = score >= 0.5 ? "#efb77d" : "#6ce7bb";
  $("model-call").textContent = score >= 0.5 ? "Model calls this a hazard" : "Model calls this safe";
  $("truth").textContent = hazard ? "Hazard" : "Safe";
  $("baseline").textContent = baseline ? "Hazard" : "Safe";
  $("stopping").textContent = `${stoppingDistance(row).toFixed(1)} m`;
}

function card(title, tag, data) {
  return `<article class="card"><div class="tag">${tag}</div><h3>${title}</h3><div class="stat-grid"><div class="stat"><strong class="model-color">${Math.round(data.model.accuracy * 1000) / 10}%</strong><span>model accuracy</span></div><div class="stat"><strong class="base-color">${Math.round(data.baseline.accuracy * 1000) / 10}%</strong><span>baseline accuracy</span></div><div class="stat"><strong>${data.model.false_negatives} / ${data.baseline.false_negatives}</strong><span>missed hazards: model / baseline</span></div></div></article>`;
}

async function start() {
  try {
    const [modelResponse, resultsResponse] = await Promise.all([fetch("model.json"), fetch("results.json")]);
    if (!modelResponse.ok || !resultsResponse.ok) throw new Error("Could not load benchmark files");
    model = await modelResponse.json();
    const results = await resultsResponse.json();
    $("result-cards").innerHTML = card("Typical conditions", "1,200 HELD-OUT SCENARIOS", results.test) + card("Stress conditions", "1,200 HELD-OUT SCENARIOS", results.stress);
    $("result-note").textContent = `At the default 50% threshold, the model misses ${results.test.model.false_negatives} hazards on the typical set and ${results.stress.model.false_negatives} on the stress set. Lowering the threshold to 25% cuts those counts to ${results.test.conservative_model.false_negatives} and ${results.stress.conservative_model.false_negatives}, with more false alarms. See results.json for the full confusion matrices.`;
    inputs.forEach(id => $(id).addEventListener("input", update));
    update();
  } catch (error) {
    $("model-call").textContent = "Could not load the model. Run the local web server described in README.md.";
    $("result-cards").textContent = error.message;
  }
}
start();
