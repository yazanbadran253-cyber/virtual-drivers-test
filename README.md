# Virtual Driver's Test: braking-risk benchmark

A small, reproducible **ML evaluation project** for internship applications. It generates synthetic one-dimensional braking scenarios, trains a logistic regression classifier, compares it with a fixed-rule baseline, and stress-tests both on slippery-road / long-reaction scenarios. The interactive demo lets a reviewer change a scenario and inspect the model, baseline, and test label.

**This is educational simulation code, not autonomous-driving software or a real safety assessment.** The label comes from a known stopping-distance equation, so a real system with the required inputs should use that equation instead of a learned approximation. The project demonstrates experimental design, evaluation, failure analysis, and reproducibility.

## Run it

Requires Python 3.10+ and no third-party packages.

```bash
python benchmark.py
python -m unittest discover -v
python -m http.server 8000 -d dist
```

Open <http://localhost:8000>. On Windows, `py benchmark.py` works if `python` is not on PATH. The generated `dist/model.json` and `dist/results.json` are already committed so the demo works without retraining.

## Results

The run uses seed 42, with 3,000 training scenarios, 1,200 held-out typical scenarios, and 1,200 held-out stress scenarios. Training and test scenarios are generated separately from the same seeded stream. The stress set shifts friction downward and reaction time upward.

| Set | Model accuracy | Baseline accuracy | Model missed hazards | Baseline missed hazards |
| --- | ---: | ---: | ---: | ---: |
| Typical, 50% threshold | 97.08% | 91.50% | 27 / 382 | 92 / 382 |
| Stress, 50% threshold | 95.50% | 75.17% | 54 / 615 | 298 / 615 |
| Typical, 25% threshold | 91.33% | — | 0 / 382 | — |
| Stress, 25% threshold | 95.50% | — | 0 / 615 | — |

The lower threshold eliminates misses **on these particular held-out samples**, but raises false alarms from 8 to 104 on the typical set and from 0 to 54 on the stress set. It does not establish a safety guarantee. Full confusion matrices and Brier scores are in `dist/results.json`.

## How the benchmark works

Each scenario has vehicle speed (10–90 km/h), obstacle distance (3–120 m), road friction, and reaction time. The test label is a hazard when:

```text
stopping distance = speed × reaction time + speed² / (2 × friction × 9.81) + 2 meters
stopping distance >= obstacle distance
```

Speed is converted to meters per second. The last 2 meters are a fixed buffer. The baseline assumes friction `0.7` and reaction time `1.0` second for every scenario. The learned model uses four features: speed, speed squared divided by friction, speed times reaction time, and obstacle distance. These are standardized using training-set statistics only. A small logistic regression is trained with gradient descent and L2 regularization, implemented in plain Python so the math is inspectable.

The key metric is **false negatives**: hazardous scenarios called safe. Accuracy alone can hide that failure. The stress set measures how the model behaves when the scenario distribution shifts. The demo uses the 50% threshold; `results.json` also records a 25% threshold to show the miss / false-alarm tradeoff.

## Repository map

- `benchmark.py` — scenario generator, physical label, baseline, model training, metrics, JSON export
- `test_benchmark.py` — checks for label behavior, baseline assumptions, and metric shape
- `dist/index.html`, `dist/style.css`, `dist/app.js` — static interactive demo
- `dist/model.json`, `dist/results.json` — generated model and reproducible measurements
- `career_copy.md` — resume and LinkedIn wording tied to the measured work

## What this demonstrates for the target internships

The [Waymo Multiverse internship](https://careers.withwaymo.com/jobs/2027-summer-intern-bs-ms-software-engineer-multiverse-san-francisco-california-united-states) describes infrastructure for a virtual driver's test, scalable simulation data pipelines, evaluation, and code health. This small project demonstrates the corresponding **ideas at toy scale**: deterministic scenario generation, an evaluation pipeline, metrics, a stress test, and tested code. The posting lists C/C++ proficiency as required; **this Python project does not demonstrate that requirement**.

The supplied [CTGT posting](https://jobs.ashbyhq.com/ctgt/36ec2e84-8b55-4c8a-b7ee-5dadecd4c01e) appears to concern AI evaluation research. Its accessible public copy was incomplete when this project was scoped, so this project should not be presented as a direct match to its full requirements. It does demonstrate reliability-oriented evaluation, explicit failure metrics, and evidence-based model comparison. It does **not** implement LLM interpretability or runtime intervention.

## Limitations and next steps

The simulator has one obstacle and no steering, perception, sensor noise, other actors, or real-world data. The physics label is simplified. Results on generated data do not transfer to real vehicles. For a stronger Waymo application, add a genuinely tested C++ scenario generator and broader simulation cases. For a stronger CTGT research application, build a separate LLM evaluation or interpretability project rather than relabeling this one.
