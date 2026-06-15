import test from "node:test";
import assert from "node:assert/strict";
import { aggregateLogs, calculateFootprint, getAchievements, getAverageFootprint, getProgress, sortLogsNewestFirst } from "../src/lib/carbon.js";

test("calculateFootprint applies documented factors", () => {
  const result = calculateFootprint({
    car: 10,
    bus: 10,
    train: 10,
    flight: 10,
    electricity: 10,
    food: "vegan",
    waste: 10
  });

  assert.equal(result.transport, 5.9);
  assert.equal(result.electricity, 8.5);
  assert.equal(result.food, 1.5);
  assert.equal(result.waste, 4.5);
  assert.equal(result.total, 20.4);
  assert.equal(result.category, "Medium");
  assert.equal(result.trees, 355);
});

test("calculateFootprint rejects negative and non-numeric activity values", () => {
  const result = calculateFootprint({
    car: -50,
    bus: "not-a-number",
    train: Infinity,
    electricity: -2,
    food: "unknown",
    waste: -1
  });

  assert.equal(result.transport, 0);
  assert.equal(result.electricity, 0);
  assert.equal(result.food, 2.5);
  assert.equal(result.waste, 0);
  assert.equal(result.total, 2.5);
});

test("aggregateLogs groups weekly totals and ignores invalid dates", () => {
  const logs = [
    { createdAt: "2026-06-15T08:00:00Z", total: 10, breakdown: { transport: 4, electricity: 3, food: 2, waste: 1 } },
    { createdAt: "2026-06-16T08:00:00Z", total: 8, breakdown: { transport: 2, electricity: 3, food: 2, waste: 1 } },
    { createdAt: "invalid", total: 100 }
  ];

  assert.deepEqual(aggregateLogs(logs, "Weekly"), [{
    date: "Jun 15",
    total: 18,
    Transport: 6,
    Energy: 6,
    Food: 4,
    Waste: 2
  }]);
});

test("getProgress reports reduction and achievements unlock correctly", () => {
  const logs = [
    { total: 10 },
    { total: 20 },
    { total: 25 },
    { total: 22 },
    { total: 21 }
  ];

  assert.equal(getProgress(logs), 50);
  assert.equal(getAchievements(logs).every((achievement) => achievement.unlocked), true);
});

test("average footprint and newest-first ordering use all valid logs", () => {
  const logs = [
    { total: 20, createdAt: "2026-06-14T00:00:00Z" },
    { total: 10, createdAt: "2026-06-16T00:00:00Z" },
    { total: 15, createdAt: "2026-06-15T00:00:00Z" }
  ];

  assert.equal(getAverageFootprint(logs), 15);
  assert.deepEqual(sortLogsNewestFirst(logs).map((log) => log.total), [10, 15, 20]);
});
