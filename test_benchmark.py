import unittest

from benchmark import baseline, features, label, metrics, stopping_distance


class BenchmarkTests(unittest.TestCase):
    def test_hazard_increases_when_distance_shrinks(self):
        row = dict(speed=60, distance=100, friction=0.5, reaction=1.0)
        self.assertEqual(label(row), 0)
        self.assertEqual(label(dict(row, distance=10)), 1)

    def test_baseline_uses_fixed_conditions(self):
        row = dict(speed=50, distance=30, friction=0.2, reaction=2.0)
        self.assertEqual(baseline(row), 0)
        self.assertEqual(label(row), 1)

    def test_feature_and_metric_shape(self):
        row = dict(speed=30, distance=20, friction=0.6, reaction=1.0)
        self.assertEqual(len(features(row)), 4)
        self.assertGreater(stopping_distance(row), 0)
        self.assertEqual(metrics([row], [float(label(row))])["accuracy"], 1)


if __name__ == "__main__":
    unittest.main()
