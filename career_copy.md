# Resume and LinkedIn copy

Use these words only after you understand the code and can explain the model, baseline, split, and failure cases in an interview. Keep this in **Projects**, not Work Experience. Link to the GitHub repository and live demo when they are available.

## Resume: general ML / evaluation internship

**Virtual Driver's Test — Braking-Risk Benchmark** | Python, machine learning, model evaluation, simulation | GitHub · Demo

- Built a reproducible evaluation pipeline that generates 5,400 synthetic braking scenarios, trains a logistic regression model, and compares it with a fixed-rule baseline.
- Measured 97.1% accuracy and 27 missed hazards on 1,200 held-out typical scenarios; stress-tested slippery-road / long-reaction cases and analyzed the false-negative versus false-alarm tradeoff.
- Published an interactive demo that exposes model predictions, baseline decisions, and the physics-derived test label for user-selected scenarios.

**Be precise:** The 5,400 scenarios are 3,000 training + 1,200 typical test + 1,200 stress test. The 97.1% figure is on synthetic typical test data, not real driving data. If your resume has room for two bullets, keep the first two.

## Waymo-targeted variant

**Virtual Driver's Test — Braking-Risk Evaluation Pipeline** | Python, simulation, model evaluation, testing

- Implemented deterministic scenario generation and a repeatable test pipeline for a toy braking task, with baseline comparison, stress conditions, and false-negative tracking.
- Added unit tests and an interactive results viewer to inspect failure cases across road friction and reaction time.

Do **not** claim C++ proficiency based on this project. Waymo lists it as a required skill in the supplied posting. Add C++ to your resume only if you can demonstrate it elsewhere.

## LinkedIn Featured description

> I built a small virtual driver's test to practice evaluating an ML model beyond average accuracy. It generates synthetic braking scenarios, compares a trained classifier with a fixed-rule baseline, and stress-tests both under slippery-road and slower-reaction conditions. The model reached 97.1% accuracy on 1,200 held-out typical scenarios, but still missed 27 hazards. The demo lets you change a scenario and inspect the model, baseline, and physics-derived label. This is an educational simulation, not a real driving safety system. [GitHub link] [Demo link]

## Interview explanation in 30 seconds

> I wanted to test model reliability, not just train a classifier. I generated synthetic braking scenarios and labeled them using a simplified stopping-distance equation. I trained logistic regression, compared it with a baseline that assumes fixed road conditions, and evaluated both on held-out and shifted scenarios. I focused on false negatives because a model calling a hazard safe is the critical failure in this toy task. I also tested a lower decision threshold and showed how it reduced misses on these samples while increasing false alarms. The main limitation is that all data and labels are simulated.
