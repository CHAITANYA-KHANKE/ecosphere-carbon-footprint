export const EMISSION_FACTORS = {
  car: 0.21,
  bus: 0.08,
  train: 0.05,
  flight: 0.25,
  electricity: 0.85,
  waste: 0.45
};

const FOOD_EMISSIONS = { vegan: 1.5, vegetarian: 2.5, nonVegetarian: 5.5 };
const VALID_FOOD_TYPES = new Set(Object.keys(FOOD_EMISSIONS));
const KG_CO2_ABSORBED_PER_TREE_YEAR = 21;

function nonNegativeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function calculateFootprint(input) {
  const transport =
    nonNegativeNumber(input.car) * EMISSION_FACTORS.car +
    nonNegativeNumber(input.bus) * EMISSION_FACTORS.bus +
    nonNegativeNumber(input.train) * EMISSION_FACTORS.train +
    nonNegativeNumber(input.flight) * EMISSION_FACTORS.flight;
  const electricity = nonNegativeNumber(input.electricity) * EMISSION_FACTORS.electricity;
  const foodType = VALID_FOOD_TYPES.has(input.food) ? input.food : "vegetarian";
  const food = FOOD_EMISSIONS[foodType];
  const waste = nonNegativeNumber(input.waste) * EMISSION_FACTORS.waste;
  const total = transport + electricity + food + waste;
  const score = Math.max(0, Math.min(100, Math.round(100 - total * 1.35)));
  const category = total < 15 ? "Low" : total < 35 ? "Medium" : "High";

  return {
    total: Number(total.toFixed(2)),
    transport: Number(transport.toFixed(2)),
    electricity: Number(electricity.toFixed(2)),
    food: Number(food.toFixed(2)),
    waste: Number(waste.toFixed(2)),
    score,
    trees: total === 0 ? 0 : Math.ceil((total * 365) / KG_CO2_ABSORBED_PER_TREE_YEAR),
    category
  };
}

export function aggregateLogs(logs, range = "Daily") {
  const formatters = {
    Daily: (date) => date.toISOString().slice(0, 10),
    Weekly: (date) => {
      const start = new Date(date);
      const day = (start.getUTCDay() + 6) % 7;
      start.setUTCDate(start.getUTCDate() - day);
      return start.toISOString().slice(0, 10);
    },
    Monthly: (date) => date.toISOString().slice(0, 7)
  };
  const keyFor = formatters[range] || formatters.Daily;
  const groups = new Map();

  logs.forEach((log) => {
    const date = new Date(log.createdAt);
    if (Number.isNaN(date.getTime())) return;
    const key = keyFor(date);
    const current = groups.get(key) || { key, count: 0, total: 0, Transport: 0, Energy: 0, Food: 0, Waste: 0 };
    current.count += 1;
    current.total += nonNegativeNumber(log.total);
    current.Transport += nonNegativeNumber(log.breakdown?.transport);
    current.Energy += nonNegativeNumber(log.breakdown?.electricity);
    current.Food += nonNegativeNumber(log.breakdown?.food);
    current.Waste += nonNegativeNumber(log.breakdown?.waste);
    groups.set(key, current);
  });

  return [...groups.values()].sort((a, b) => a.key.localeCompare(b.key)).map((group) => {
    const divisor = range === "Daily" ? group.count : 1;
    const labelDate = new Date(`${group.key}${range === "Monthly" ? "-01" : ""}T00:00:00Z`);
    const dateOptions = range === "Monthly"
      ? { month: "short", year: "2-digit", timeZone: "UTC" }
      : { month: "short", day: "numeric", timeZone: "UTC" };
    return {
      date: labelDate.toLocaleDateString("en", dateOptions),
      total: Number((group.total / divisor).toFixed(2)),
      Transport: Number((group.Transport / divisor).toFixed(2)),
      Energy: Number((group.Energy / divisor).toFixed(2)),
      Food: Number((group.Food / divisor).toFixed(2)),
      Waste: Number((group.Waste / divisor).toFixed(2))
    };
  });
}

export function getProgress(logs) {
  if (logs.length < 2) return null;
  const newest = nonNegativeNumber(logs[0].total);
  const previous = nonNegativeNumber(logs[1].total);
  return previous ? Math.round(((previous - newest) / previous) * 100) : null;
}

export function getAverageFootprint(logs) {
  if (!logs.length) return 0;
  const total = logs.reduce((sum, log) => sum + nonNegativeNumber(log.total), 0);
  return Number((total / logs.length).toFixed(1));
}

export function sortLogsNewestFirst(logs) {
  return [...logs].sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
  });
}

export function getEcoTips(input, result) {
  const tips = [];
  if (Number(input.car) > 10) tips.push({ title: "Swap one car trip", text: "Public transport or carpooling could cut today's travel emissions by up to 60%.", type: "transport" });
  if (Number(input.electricity) > 8) tips.push({ title: "Trim standby power", text: "Switch off idle devices and use LED bulbs to lower electricity consumption.", type: "energy" });
  if (input.food === "nonVegetarian") tips.push({ title: "Try a plant-forward meal", text: "Replacing one meat-based meal can make a meaningful daily difference.", type: "food" });
  if (Number(input.waste) > 2) tips.push({ title: "Sort before you toss", text: "Compost food scraps and separate recyclables to reduce landfill impact.", type: "waste" });
  if (result?.category === "Low") tips.push({ title: "Keep the streak alive", text: "Your footprint is already low. Repeat this routine tomorrow to build momentum.", type: "habit" });
  return tips.length ? tips.slice(0, 4) : [
    { title: "Choose public transport", text: "Bus and train travel emits less carbon per passenger than driving alone.", type: "transport" },
    { title: "Save electricity", text: "Set cooling efficiently and turn appliances off at the plug.", type: "energy" },
    { title: "Plan low-waste meals", text: "Buy what you need and make leftovers part of the plan.", type: "waste" }
  ];
}

export function getAchievements(logs) {
  const best = logs.length ? Math.min(...logs.map((log) => log.total)) : Infinity;
  return [
    { name: "Green Beginner", icon: "Sprout", description: "Record your first footprint", unlocked: logs.length >= 1, progress: Math.min(logs.length, 1), target: 1 },
    { name: "Eco Warrior", icon: "Earth", description: "Complete 5 carbon check-ins", unlocked: logs.length >= 5, progress: Math.min(logs.length, 5), target: 5 },
    { name: "Carbon Hero", icon: "Trophy", description: "Achieve a footprint below 15 kg", unlocked: best < 15, progress: best === Infinity ? 0 : Math.max(0, Math.min(15, 30 - best)), target: 15 }
  ];
}
