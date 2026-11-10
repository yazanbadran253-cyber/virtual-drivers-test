"""Reproducible toy braking-risk benchmark. Python 3.10+, no packages needed."""

import json
import math
import random
from pathlib import Path


ROOT = Path(__file__).parent
SEED = 42
G = 9.81


def scenario(rng, stress=False):
    speed = rng.uniform(10, 90)  # km/h
    distance = rng.uniform(3, 120)  # meters to obstacle
    friction = rng.uniform(0.2, 0.4) if stress else rng.uniform(0.3, 0.9)
    reaction = rng.uniform(1.5, 2.2) if stress else rng.uniform(0.5, 1.8)
    return dict(speed=speed, distance=distance, friction=friction, reaction=reaction)


def stopping_distance(row):
    speed = row["speed"] / 3.6
    return speed * row["reaction"] + speed**2 / (2 * row["friction"] * G) + 2


def label(row):
    return int(stopping_distance(row) >= row["distance"])


def features(row):
    speed = row["speed"] / 3.6
    return [speed, speed**2 / row["friction"], speed * row["reaction"], row["distance"]]


def sigmoid(value):
    if value >= 0:
        return 1 / (1 + math.exp(-value))
    exp_value = math.exp(value)
    return exp_value / (1 + exp_value)


def fit(rows):
    xs = [features(row) for row in rows]
    means = [sum(column) / len(column) for column in zip(*xs)]
    scales = [math.sqrt(sum((x[j] - means[j]) ** 2 for x in xs) / len(xs)) for j in range(4)]
    scaled = [[(x[j] - means[j]) / scales[j] for j in range(4)] for x in xs]
    ys = [label(row) for row in rows]
    weights = [0.0] * 5
    for _ in range(600):
        gradients = [0.0] * 5
        for x, y in zip(scaled, ys):
            error = sigmoid(weights[0] + sum(a * b for a, b in zip(weights[1:], x))) - y
            gradients[0] += error
            for j in range(4):
                gradients[j + 1] += error * x[j]
        for j in range(5):
            penalty = 0 if j == 0 else 0.01 * weights[j]
            weights[j] -= 0.3 * (gradients[j] / len(rows) + penalty)
    return dict(weights=weights, means=means, scales=scales)


def predict(model, row):
    x = features(row)
    z = model["weights"][0] + sum(
        model["weights"][j + 1] * (x[j] - model["means"][j]) / model["scales"][j]
        for j in range(4)
    )
    return sigmoid(z)


def baseline(row):
    assumed = dict(row, friction=0.7, reaction=1.0)
    return int(stopping_distance(assumed) >= row["distance"])


def metrics(rows, scores, threshold=0.5):
    outcomes = [label(row) for row in rows]
    guesses = [int(score >= threshold) for score in scores]
    tp = sum(y == 1 and p == 1 for y, p in zip(outcomes, guesses))
    tn = sum(y == 0 and p == 0 for y, p in zip(outcomes, guesses))
    fp = sum(y == 0 and p == 1 for y, p in zip(outcomes, guesses))
    fn = sum(y == 1 and p == 0 for y, p in zip(outcomes, guesses))
    return dict(
        count=len(rows),
        accuracy=round((tp + tn) / len(rows), 4),
        recall=round(tp / (tp + fn), 4) if tp + fn else None,
        false_negatives=fn,
        false_negative_rate=round(fn / (tp + fn), 4) if tp + fn else None,
        brier=round(sum((score - y) ** 2 for score, y in zip(scores, outcomes)) / len(rows), 4),
        confusion=dict(tp=tp, tn=tn, fp=fp, fn=fn),
    )


def evaluate(model, rows):
    scores = [predict(model, row) for row in rows]
    return dict(
        model=metrics(rows, scores),
        conservative_model=metrics(rows, scores, threshold=0.25),
        baseline=metrics(rows, [baseline(row) for row in rows]),
    )


def main():
    rng = random.Random(SEED)
    train = [scenario(rng) for _ in range(3000)]
    test = [scenario(rng) for _ in range(1200)]
    stress = [scenario(rng, stress=True) for _ in range(1200)]
    model = fit(train)
    results = dict(
        seed=SEED,
        train_count=len(train),
        test=evaluate(model, test),
        stress=evaluate(model, stress),
        note="Synthetic one-dimensional braking scenarios; not a real driving safety assessment.",
    )
    dist = ROOT / "dist"
    dist.mkdir(exist_ok=True)
    (dist / "model.json").write_text(json.dumps(model, indent=2) + "\n", encoding="utf-8")
    (dist / "results.json").write_text(json.dumps(results, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
