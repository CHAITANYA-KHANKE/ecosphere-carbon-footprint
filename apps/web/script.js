// Local fallback calculation factors
const LOCAL_FACTORS = {
  transport: { petrol_car_medium: 0.170, diesel_car_medium: 0.165, electric_car: 0.045, bus: 0.096, rail: 0.035 },
  utility: { electricity_us_avg: 0.370, electricity_eu_avg: 0.230, electricity_green: 0.015, natural_gas: 0.185 },
  diet: { meat_heavy: 7.20, meat_medium: 5.40, vegetarian: 3.80, vegan: 2.90 }
};

let apiOnline = false;
const DOM = {};

// Cache DOM lookups for high-performance slider drag response
function cacheDOM() {
  const ids = [
    "distance", "vehicleType", "energy", "fuelType", "dietDays", "dietType",
    "distVal", "energyVal", "dietVal", "statusDot", "statusText",
    "totalScore", "transScore", "utilScore", "dietScore", "accessibleSummary",
    "gaugeCircle", "barTransport", "barUtility", "barDiet",
    "annualProjection", "treesNeeded", "userTonnes", "barUserTonnes", "nudgeText"
  ];
  ids.forEach(id => {
    DOM[id] = document.getElementById(id);
  });
}

// Dashboard initialization
function initDashboard() {
  cacheDOM();
  restoreState();
  checkEngineStatus();
}

// Local Storage Data Persistence
function saveState() {
  const state = {
    distance: DOM.distance.value,
    vehicleType: DOM.vehicleType.value,
    energy: DOM.energy.value,
    fuelType: DOM.fuelType.value,
    dietDays: DOM.dietDays.value,
    dietType: DOM.dietType.value
  };
  localStorage.setItem("ecosphere_state", JSON.stringify(state));
}

function restoreState() {
  const stateStr = localStorage.getItem("ecosphere_state");
  if (stateStr) {
    try {
      const state = JSON.parse(stateStr);
      
      DOM.distance.value = state.distance;
      DOM.distance.setAttribute("aria-valuenow", state.distance);
      DOM.distVal.innerText = `${state.distance} km`;
      
      DOM.vehicleType.value = state.vehicleType;
      
      DOM.energy.value = state.energy;
      DOM.energy.setAttribute("aria-valuenow", state.energy);
      DOM.energyVal.innerText = `${state.energy} kWh`;
      
      DOM.fuelType.value = state.fuelType;
      
      DOM.dietDays.value = state.dietDays;
      DOM.dietDays.setAttribute("aria-valuenow", state.dietDays);
      DOM.dietVal.innerText = `${state.dietDays} Days`;
      
      DOM.dietType.value = state.dietType;
    } catch(e) {
      console.error("Failed parsing restored state storage", e);
    }
  }
}

// Verify Backend Status
async function checkEngineStatus() {
  try {
    const res = await fetch("/");
    if (res.ok) {
      apiOnline = true;
      DOM.statusDot.className = "status-dot active";
      DOM.statusText.innerText = "Calculation Engine Online (API Mode)";
    } else {
      throw new Error();
    }
  } catch (e) {
    apiOnline = false;
    DOM.statusDot.className = "status-dot fallback";
    DOM.statusText.innerText = "Offline (Local Calculation Mode)";
  }
  calculateEmissions();
}

// Performance Optimization: 100ms Throttle function
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

const throttledCalculate = throttle(() => {
  calculateEmissions();
  saveState();
}, 100);
window.throttledCalculate = throttledCalculate;

// Responsive Slider Visual Feedback handler
function handleSliderChange(sliderId, displayValId, unitSuffix) {
  const value = DOM[sliderId].value;
  DOM[displayValId].innerText = `${value}${unitSuffix}`;
  DOM[sliderId].setAttribute("aria-valuenow", value);

  // Trigger throttled calculation
  throttledCalculate();
}

// Emission calculations engine
async function calculateEmissions() {
  const distance = parseFloat(DOM.distance.value);
  const vehicleType = DOM.vehicleType.value;
  const energy = parseFloat(DOM.energy.value);
  const fuelType = DOM.fuelType.value;
  const days = parseInt(DOM.dietDays.value);
  const dietType = DOM.dietType.value;

  let transportEmissions = 0;
  let utilityEmissions = 0;
  let dietEmissions = 0;
  let totalEmissions = 0;

  if (apiOnline) {
    try {
      const res = await fetch("/calculate/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transport: { distance_km: distance, vehicle_type: vehicleType },
          utility: { energy_kwh: energy, fuel_type: fuelType },
          diet: { days: days, diet_type: dietType }
        })
      });
      if (res.ok) {
        const data = await res.json();
        transportEmissions = data.breakdown.transport_kg_co2e;
        utilityEmissions = data.breakdown.utility_kg_co2e;
        dietEmissions = data.breakdown.diet_kg_co2e;
        totalEmissions = data.total_emissions_kg_co2e;
      } else {
        throw new Error();
      }
    } catch (e) {
      console.warn("FastAPI fetch failed, falling back to local client-side logic.");
      apiOnline = false;
      DOM.statusDot.className = "status-dot fallback";
      DOM.statusText.innerText = "Offline (Local Calculation Mode)";
    }
  }

  // Local fallback calculation if API is offline
  if (!apiOnline) {
    transportEmissions = Math.round(distance * LOCAL_FACTORS.transport[vehicleType] * 1000) / 1000;
    utilityEmissions = Math.round(energy * LOCAL_FACTORS.utility[fuelType] * 1000) / 1000;
    dietEmissions = Math.round(days * LOCAL_FACTORS.diet[dietType] * 1000) / 1000;
    totalEmissions = Math.round((transportEmissions + utilityEmissions + dietEmissions) * 1000) / 1000;
  }

  updateUI(transportEmissions, utilityEmissions, dietEmissions, totalEmissions);
}

// Refresh UI elements
function updateUI(tVal, uVal, dVal, total) {
  DOM.totalScore.innerText = total.toFixed(1);
  DOM.transScore.innerText = `${tVal.toFixed(1)} kg`;
  DOM.utilScore.innerText = `${uVal.toFixed(1)} kg`;
  DOM.dietScore.innerText = `${dVal.toFixed(1)} kg`;

  // Update Screen Reader summary text for A11y
  DOM.accessibleSummary.innerText = 
    `Total carbon footprint emissions is ${total.toFixed(1)} kilograms. Transport emissions: ${tVal.toFixed(1)} kilograms. Utility emissions: ${uVal.toFixed(1)} kilograms. Diet emissions: ${dVal.toFixed(1)} kilograms.`;

  // Update circular SVG gauge
  const maxTarget = 800; 
  const percentage = Math.min((total / maxTarget), 1);
  const dashoffset = 628 - (628 * percentage);
  DOM.gaugeCircle.style.strokeDashoffset = dashoffset;

  if (total > 500) {
    DOM.gaugeCircle.style.stroke = "var(--accent)";
  } else if (total > 200) {
    DOM.gaugeCircle.style.stroke = "var(--secondary)";
  } else {
    DOM.gaugeCircle.style.stroke = "var(--primary)";
  }

  // Update Horizontal Progress Bars
  const maxSub = Math.max(tVal, uVal, dVal, 1);
  
  const transPct = Math.round((tVal / maxSub) * 100);
  DOM.barTransport.style.width = `${transPct}%`;
  DOM.barTransport.setAttribute("aria-valuenow", transPct);

  const utilPct = Math.round((uVal / maxSub) * 100);
  DOM.barUtility.style.width = `${utilPct}%`;
  DOM.barUtility.setAttribute("aria-valuenow", utilPct);

  const dietPct = Math.round((dVal / maxSub) * 100);
  DOM.barDiet.style.width = `${dietPct}%`;
  DOM.barDiet.setAttribute("aria-valuenow", dietPct);

  // --- Eco-Offsets & Targets calculations ---
  const annualKg = total * 12;
  const annualTonnes = annualKg / 1000;
  const trees = Math.round(annualKg / 22);

  DOM.annualProjection.innerText = `${annualTonnes.toFixed(2)} tonnes/year`;
  DOM.treesNeeded.innerText = trees;
  DOM.userTonnes.innerText = `${annualTonnes.toFixed(2)} t`;

  // Update comparison bars (Max scale reference: 16 tonnes)
  const maxRef = 16;
  const userPct = Math.min((annualTonnes / maxRef) * 100, 100);
  DOM.barUserTonnes.style.width = `${userPct}%`;

  // Generate dynamic recommendations
  let nudge = "";
  if (tVal > uVal && tVal > dVal) {
    nudge = "⚡ Aapka commuting output sabse zyada hai! Carbon footprint kam karne ke liye public transit ka use badhayein ya EV standard adopt karein.";
  } else if (uVal > tVal && uVal > dVal) {
    nudge = "💡 Grid electricity ka use emissions badha raha hai. Light switch optimization karein ya Green Electricity Plan switch karein.";
  } else if (dVal > tVal && dVal > uVal) {
    nudge = "🥗 Diet footprint high hai. Vegetarian ya Plant-based food inputs badha kar aap instantly emissions check kar sakte hain.";
  } else {
    nudge = "🌳 Excellent status! Aapke patterns balanced hain. Carbon emission budgets optimize rakhne ke liye yahi behavior regular monitor karein.";
  }
  DOM.nudgeText.innerText = nudge;
}

// Run on startup
window.onload = initDashboard;
