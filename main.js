// === Your cost table (USD / roundtrip) ===
const COSTS = {
  groceries:  { publicTransport: 4.8, carVar: 2 },
  historical: { publicTransport: 20,  carVar: 20 },
  coastal:    { publicTransport: 200, carVar: 200 },
  family:     { publicTransport: 40,  carVar: 40 },
};

// === Your fixed values ===
const UBER_FIXED = 150;
const CAR_FIXED = 2293;

// === User type defaults (based on your table) ===
const USER_DEFAULTS = {
  student: {
    groceries: 24,
    historical: 1,
    coastal: 2,
    family: 0,
  },
  couple: {
    groceries: 28,
    historical: 2,
    coastal: 2,
    family: 0,
  },
  family: {
    groceries: 36,
    historical: 2,
    coastal: 2,
    family: 6,
  },
  frequent: {
    groceries: 30,
    historical: 4,
    coastal: 3,
    family: 0,
  },
};

// === DOM ===
const inputs = {
  groceries: document.getElementById("groceries"),
  historical: document.getElementById("historical"),
  coastal: document.getElementById("coastal"),
  family: document.getElementById("family"),
};

const carTotalEl = document.getElementById("carTotal");
const noCarTotalEl = document.getElementById("noCarTotal");
const compareValueEl = document.getElementById("compareValue");
const compareNoteEl = document.getElementById("compareNote");
const errorEl = document.getElementById("error");

// Category buttons
const categoryButtons = document.querySelectorAll(".categoryBtn");

document.getElementById("uberFixed").textContent = money(UBER_FIXED);
document.getElementById("carFixed").textContent = money(CAR_FIXED);

// Add click listeners to category buttons
categoryButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const category = e.currentTarget.dataset.category;
    setUserCategory(category);
  });
});

document.getElementById("resetBtn").addEventListener("click", resetAll);

// Auto-calc whenever user types (this is the “user-based” interface you want)
Object.values(inputs).forEach((inp) => {
  inp.addEventListener("input", calculateAll);
});

calculateAll(); // initial

function money(n) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
}

function readTrips() {
  const trips = {};
  for (const key in inputs) {
    const v = Number(inputs[key].value);

    if (!Number.isFinite(v) || v < 0) throw new Error("Trips must be 0 or a positive number.");
    if (!Number.isInteger(v)) throw new Error("Trips must be whole numbers (no decimals).");

    trips[key] = v;
  }
  return trips;
}

// Total No car cost = (Public Transport x Trips made + Uber Cost)
function totalNoCar(trips) {
  let publicTransportTotal = 0;
  for (const key in trips) {
    publicTransportTotal += COSTS[key].publicTransport * trips[key];
  }
  return publicTransportTotal + UBER_FIXED;
}

// Total Car cost = (Var Cost x Trips Made + Fixed Cost)
function totalCar(trips) {
  let varTotal = 0;
  for (const key in trips) {
    varTotal += COSTS[key].carVar * trips[key];
  }
  return varTotal + CAR_FIXED;
}

function calculateAll() {
  errorEl.textContent = "";

  try {
    const trips = readTrips();

    const noCar = totalNoCar(trips);
    const car = totalCar(trips);

    noCarTotalEl.textContent = money(noCar);
    carTotalEl.textContent = money(car);

    const diff = car - noCar;
    const abs = Math.abs(diff);

    if (diff > 0) {
      compareValueEl.textContent = `Car is ${money(abs)} more`;
      compareNoteEl.textContent = "No Car is cheaper for your inputs.";
    } else if (diff < 0) {
      compareValueEl.textContent = `Car is ${money(abs)} less`;
      compareNoteEl.textContent = "Car is cheaper for your inputs.";
    } else {
      compareValueEl.textContent = "Same cost";
      compareNoteEl.textContent = "Both options cost the same.";
    }
  } catch (err) {
    // If input invalid, don’t leave stale numbers.
    noCarTotalEl.textContent = money(0);
    carTotalEl.textContent = money(0);
    compareValueEl.textContent = "—";
    compareNoteEl.textContent = "Fix the input to calculate.";

    errorEl.textContent = err?.message || "Something went wrong.";
  }
}

function resetAll() {
  for (const key in inputs) inputs[key].value = 0;
  calculateAll();
}

// Set user category and load defaults
function setUserCategory(category) {
  const defaults = USER_DEFAULTS[category];
  
  if (defaults) {
    for (const key in inputs) {
      inputs[key].value = defaults[key] || 0;
    }
    
    // Update button styles to show which one is selected
    categoryButtons.forEach((btn) => {
      btn.classList.remove("active");
    });
    document.getElementById(`category${category.charAt(0).toUpperCase() + category.slice(1)}`).classList.add("active");
    
    calculateAll();
  }
}
