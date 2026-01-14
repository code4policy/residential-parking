// Load header and footer
function loadHTML(id, file) {
  fetch(file)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Could not load ${file}`);
      }
      return response.text();
    })
    .then(data => {
      document.getElementById(id).innerHTML = data;
    })
    .catch(error => console.error(error));
}

loadHTML("header-placeholder", "header.html");
loadHTML("footer-placeholder", "footer.html");

// Load calculator
// === Your cost table (USD / roundtrip) ===
const COSTS = {
  groceries:  { publicTransport: 4.8, carVar: 2 },
  historical: { publicTransport: 20,  carVar: 20 },
  coastal:    { publicTransport: 200, carVar: 200 },
  family:     { publicTransport: 40,  carVar: 40 },
};

// === Your fixed values ===
const UBER_FIXED = 1200;
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

const uberFixedEl = document.getElementById("uberFixed");
if (uberFixedEl) uberFixedEl.textContent = money(UBER_FIXED);
const carFixedEl = document.getElementById("carFixed");
if (carFixedEl) carFixedEl.textContent = money(CAR_FIXED);

// Add click listeners to category buttons
categoryButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const category = e.currentTarget.dataset.category;
    setUserCategory(category);
  });
});

const resetBtn = document.getElementById("resetBtn");
if (resetBtn) resetBtn.addEventListener("click", resetAll);

// Auto-calc whenever user types (this is the “user-based” interface you want)
Object.values(inputs).forEach((inp) => {
  if (inp) inp.addEventListener("input", calculateAll);
});

if (inputs.groceries) calculateAll(); // initial (only when legacy inputs exist)

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

    // Remove previous highlight classes
    compareNoteEl.classList.remove("cheaper-green", "cheaper-red");

    if (diff > 0) {
      compareValueEl.textContent = `Car Cost is ${money(abs)} more`;
      compareNoteEl.textContent = "Not owning a car costs less for you.";
      compareNoteEl.classList.add("cheaper-green");
    } else if (diff < 0) {
      compareValueEl.textContent = `Car Cost is ${money(abs)} less`;
      compareNoteEl.textContent = "Owning a car costs less for you.";
      compareNoteEl.classList.add("cheaper-red");
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
    compareNoteEl.classList.remove("cheaper-green", "cheaper-red");
    errorEl.textContent = err?.message || "Something went wrong.";
  }
}

function resetAll() {
  for (const key in inputs) if (inputs[key]) inputs[key].value = 0;
  if (inputs.groceries) calculateAll();
}

// Set user category and load defaults
function setUserCategory(category) {
  const defaults = USER_DEFAULTS[category];
  if (!defaults) return;

  for (const key in defaults) {
    if (inputs[key]) inputs[key].value = defaults[key] ?? 0;
  }

  categoryButtons.forEach((btn) => btn.classList.remove("active"));
  const activeBtn = document.querySelector(`.categoryBtn[data-category="${category}"]`);
  if (activeBtn) activeBtn.classList.add("active");

  if (inputs.groceries) calculateAll();
}

// Load lifestyle data and populate accordion
// const lifestyleData = [
//   ... (omitted)
// ];

// ------- New calculator behavior (navigation, car/no-car logic, computations) -------

// Screen helpers
function showScreen(id) {
  document.querySelectorAll('.calc-screen').forEach((s) => {
    if (s.id === id) {
      s.classList.add('active');
      s.hidden = false;
    } else {
      s.classList.remove('active');
      s.hidden = true;
    }
  });
}

// Basic screen next button
const toStep2Btn = document.getElementById('toStep2');
toStep2Btn?.addEventListener('click', () => {
  const carChoice = document.querySelector('input[name="carChoice"]:checked')?.value;
  if (carChoice === 'car') showScreen('screen-car');
  else showScreen('screen-nocar');
});

// Back buttons
document.getElementById('backFromCar')?.addEventListener('click', () => showScreen('screen-basics'));
document.getElementById('backFromNoCar')?.addEventListener('click', () => showScreen('screen-basics'));

// Car screen interactions
const afdcAnnual = document.getElementById('afdcAnnual');
const parkingMonthly = document.getElementById('parkingMonthly');
const residentPermitAnnual = document.getElementById('residentPermitAnnual');
const parkingOffstreetRow = document.getElementById('parkingOffstreetRow');
const residentPermitRow = document.getElementById('residentPermitRow');
const insuranceAnnual = document.getElementById('insuranceAnnual');
const exciseTax = document.getElementById('exciseTax');
const regInspect = document.getElementById('regInspect');
const loanMonthly = document.getElementById('loanMonthly');
const loanMonthsPerYear = document.getElementById('loanMonthsPerYear');
const depreciationAnnual = document.getElementById('depreciationAnnual');

// Parking choice behavior (off-street or resident permit)
function updateParkingSelectionUI(){
  const val = document.querySelector('input[name="parkingChoice"]:checked')?.value;
  document.querySelectorAll('.parking-option').forEach((el) => {
    const v = el.getAttribute('data-value');
    if (v === val) el.classList.add('selected'); else el.classList.remove('selected');
  });
  if (val === 'offstreet') {
    if (parkingOffstreetRow) parkingOffstreetRow.hidden = false;
    if (residentPermitRow) residentPermitRow.hidden = true;
    if (parkingMonthly && (!parkingMonthly.value || Number(parkingMonthly.value) === 0)) parkingMonthly.value = 250;
    if (residentPermitAnnual) residentPermitAnnual.value = 0;
  } else {
    if (parkingOffstreetRow) parkingOffstreetRow.hidden = true;
    if (residentPermitRow) residentPermitRow.hidden = false;
    if (residentPermitAnnual) residentPermitAnnual.value = 0;
  }
  updateCarSummary();
}

// Radio change updates UI
document.querySelectorAll('input[name="parkingChoice"]').forEach((r) => r.addEventListener('change', updateParkingSelectionUI));

// Make the entire card clickable: clicking a .parking-option checks its radio
document.querySelectorAll('.parking-option').forEach((opt) => {
  opt.addEventListener('click', (e) => {
    // Avoid toggling when clicking input inside
    const radio = opt.querySelector('input[name="parkingChoice"]');
    if (radio) radio.checked = true;
    updateParkingSelectionUI();
  });
});

// Initialize selection UI on load
updateParkingSelectionUI();

// Ownership toggles
const ownershipRadios = document.querySelectorAll('input[name="ownership"]');
ownershipRadios.forEach((r) => r.addEventListener('change', () => {
  const loanFields = document.getElementById('loanFields');
  const paidFields = document.getElementById('paidFields');
  const sel = document.querySelector('input[name="ownership"]:checked')?.value;
  if (sel === 'loan') {
    loanFields.hidden = false;
    paidFields.hidden = true;
  } else {
    loanFields.hidden = true;
    paidFields.hidden = false;
    // Depreciation is fixed at $3,000 for paid-off cars
    if (depreciationAnnual) { depreciationAnnual.value = 3000; depreciationAnnual.readOnly = true; }
  }
  updateCarSummary();
}));

// Listen for changes and update summary live
[afdcAnnual, parkingMonthly, residentPermitAnnual, insuranceAnnual, exciseTax, regInspect, loanMonthly, loanMonthsPerYear, depreciationAnnual].forEach((el) => {
  el?.addEventListener('input', updateCarSummary);
});

function parseNumber(el, fallback = 0) {
  if (!el) return fallback;
  const v = Number(el.value);
  return Number.isFinite(v) ? v : fallback;
}

function updateCarSummary() {
  const varAnnual = parseNumber(afdcAnnual, 0);
  const parkingChoice = document.querySelector('input[name="parkingChoice"]:checked')?.value;
  const parkingAnnual = parkingChoice === 'permit' ? parseNumber(residentPermitAnnual, 0) : parseNumber(parkingMonthly, 0) * 12;
  const insurance = parseNumber(insuranceAnnual, 0);
  const excise = parseNumber(exciseTax, 0);
  const reg = parseNumber(regInspect, 0);

  let ownershipAnnual = 0;
  if (document.querySelector('input[name="ownership"]:checked')?.value === 'loan') {
    ownershipAnnual = parseNumber(loanMonthly, 0) * parseNumber(loanMonthsPerYear, 12);
  } else {
    ownershipAnnual = parseNumber(depreciationAnnual, 0);
  }

  const fixed = parkingAnnual + insurance + excise + reg + ownershipAnnual;
  const total = varAnnual + fixed;

  document.getElementById('carVar').textContent = money(varAnnual);
  document.getElementById('carFixedCalc').textContent = money(fixed);
  document.getElementById('carAnnualTotal').textContent = money(total);
  document.getElementById('carMonthlyTotal').textContent = money(total / 12);
}

// No-car interactions
const mbtaTripsPerMonth = document.getElementById('mbtaTripsPerMonth');
const mbtaPassPrice = document.getElementById('mbtaPassPrice');
const mbtaFare = document.getElementById('mbtaFare');
const mbtaAutoCheapest = document.getElementById('mbtaAutoCheapest');

const regionalTown = document.getElementById('regionalTown');
const regionalTripsPerYear = document.getElementById('regionalTripsPerYear');
const regionalFare = document.getElementById('regionalFare');

const rideshareTripsPerMonth = document.getElementById('rideshareTripsPerMonth');
const rideshareAvgCost = document.getElementById('rideshareAvgCost');
const rideshareMultiplier = document.getElementById('rideshareMultiplier');

const rentalChoiceRadios = document.querySelectorAll('input[name="rentalChoice"]');
const rentalDaysPerYear = document.getElementById('rentalDaysPerYear');
const rentalWeekendsPerYear = document.getElementById('rentalWeekendsPerYear');
const rentalDaysPerWeekend = document.getElementById('rentalDaysPerWeekend');
const rentalDailyCost = document.getElementById('rentalDailyCost');
const rentalFuelPerDay = document.getElementById('rentalFuelPerDay');

// MBTA strategy
document.querySelectorAll('input[name="mbtaStrategy"]').forEach((r) => r.addEventListener('change', () => {
  const strategy = document.querySelector('input[name="mbtaStrategy"]:checked')?.value;
  document.getElementById('mbtaPassRow').hidden = strategy !== 'pass';
  document.getElementById('mbtaPayRow').hidden = strategy !== 'pay';
  updateNoCarSummary();
}));

// Rental choice
rentalChoiceRadios.forEach((r) => r.addEventListener('change', () => {
  const val = document.querySelector('input[name="rentalChoice"]:checked')?.value;
  document.getElementById('rentalDaysRow').hidden = val !== 'days';
  document.getElementById('rentalWeekendsRow').hidden = val !== 'weekends';
  updateNoCarSummary();
}));

// Regional town fare prefill map
const regionalFareMap = {
  quincy: 2.25,
  newton: 2.75,
  wellesley: 3.25,
  lynn: 3.00,
  other: 2.50,
  boston: 2.40,
};

regionalTown?.addEventListener('change', () => {
  const val = regionalTown.value;
  const pre = regionalFareMap[val] ?? 2.5;
  regionalFare.value = pre;
  updateNoCarSummary();
});

// Live updates
[mbtaTripsPerMonth, mbtaPassPrice, mbtaFare, mbtaAutoCheapest, regionalTripsPerYear, regionalFare, rideshareTripsPerMonth, rideshareAvgCost, rideshareMultiplier, rentalDaysPerYear, rentalWeekendsPerYear, rentalDaysPerWeekend, rentalDailyCost, rentalFuelPerDay].forEach((el) => {
  el?.addEventListener('input', updateNoCarSummary);
  el?.addEventListener('change', updateNoCarSummary);
});

function updateNoCarSummary() {
  // MBTA
  const tripsMonth = parseNumber(mbtaTripsPerMonth, 0);
  const passPrice = parseNumber(mbtaPassPrice, 0);
  const fare = parseNumber(mbtaFare, 0);
  let mbtaAnnual = 0;
  const strategy = document.querySelector('input[name="mbtaStrategy"]:checked')?.value;
  if (strategy === 'pass') {
    mbtaAnnual = passPrice * 12;
  } else {
    mbtaAnnual = tripsMonth * fare * 12;
  }
  if (mbtaAutoCheapest?.checked) {
    const pass12 = passPrice * 12;
    const pay12 = tripsMonth * fare * 12;
    mbtaAnnual = Math.min(pass12, pay12);
  }

  const regionalAnnual = parseNumber(regionalTripsPerYear, 0) * parseNumber(regionalFare, 0);
  const rideshareAnnual = parseNumber(rideshareTripsPerMonth, 0) * parseNumber(rideshareAvgCost, 0) * parseNumber(rideshareMultiplier, 1) * 12;

  let rentalAnnual = 0;
  const rChoice = document.querySelector('input[name="rentalChoice"]:checked')?.value;
  if (rChoice === 'days') {
    rentalAnnual = parseNumber(rentalDaysPerYear, 0) * (parseNumber(rentalDailyCost, 0) + parseNumber(rentalFuelPerDay, 0));
  } else {
    rentalAnnual = parseNumber(rentalWeekendsPerYear, 0) * parseNumber(rentalDaysPerWeekend, 1) * (parseNumber(rentalDailyCost, 0) + parseNumber(rentalFuelPerDay, 0));
  }

  document.getElementById('mbtaAnnual').textContent = money(mbtaAnnual);
  document.getElementById('regionalAnnual').textContent = money(regionalAnnual);
  document.getElementById('rideshareAnnual').textContent = money(rideshareAnnual);
  document.getElementById('rentalAnnual').textContent = money(rentalAnnual);

  const total = mbtaAnnual + regionalAnnual + rideshareAnnual + rentalAnnual;
  document.getElementById('noCarAnnual').textContent = money(total);
}

// Comparison navigation
const toComparisonFromCar = document.getElementById('toComparisonFromCar');
const toComparisonFromNoCar = document.getElementById('toComparisonFromNoCar');

toComparisonFromCar?.addEventListener('click', () => {
  updateCarSummary();
  updateNoCarSummary();
  showResults();
});

toComparisonFromNoCar?.addEventListener('click', () => {
  updateCarSummary();
  updateNoCarSummary();
  showResults();
});

function showResults() {
  // Read totals
  const parkingChoice = document.querySelector('input[name="parkingChoice"]:checked')?.value;
  const carTotal = parseNumber(afdcAnnual, 0) + (parkingChoice === 'permit' ? parseNumber(residentPermitAnnual, 0) : parseNumber(parkingMonthly, 0) * 12) + parseNumber(insuranceAnnual, 0) + parseNumber(exciseTax, 0) + parseNumber(regInspect, 0) + (document.querySelector('input[name="ownership"]:checked')?.value === 'loan' ? parseNumber(loanMonthly, 0) * parseNumber(loanMonthsPerYear, 12) : parseNumber(depreciationAnnual, 0));

  // No car total
  const mbtaVal = parseNumber(document.getElementById('mbtaAnnual'), 0) ? Number(document.getElementById('mbtaAnnual').textContent.replace(/[$,]/g, '')) : 0;
  const regionalVal = Number(document.getElementById('regionalAnnual').textContent.replace(/[$,]/g, '')) || 0;
  const rideshareVal = Number(document.getElementById('rideshareAnnual').textContent.replace(/[$,]/g, '')) || 0;
  const rentalVal = Number(document.getElementById('rentalAnnual').textContent.replace(/[$,]/g, '')) || 0;
  const noCarTotal = mbtaVal + regionalVal + rideshareVal + rentalVal;

  document.getElementById('outCarAnnual').textContent = money(carTotal);
  document.getElementById('outNoCarAnnual').textContent = money(noCarTotal);
  document.getElementById('outCarMonthly').textContent = money(carTotal / 12);
  document.getElementById('outNoCarMonthly').textContent = money(noCarTotal / 12);

  const diff = carTotal - noCarTotal;
  document.getElementById('outDifference').textContent = money(diff);

  // Biggest drivers: pick top 2 by absolute annual amount across both sides
  const breakdown = [];
  breakdown.push({ label: 'AFDC / Variable', value: parseNumber(afdcAnnual, 0) });
  const parkingChoice2 = document.querySelector('input[name="parkingChoice"]:checked')?.value;
  breakdown.push({ label: 'Parking (annual)', value: parkingChoice2 === 'permit' ? parseNumber(residentPermitAnnual, 0) : parseNumber(parkingMonthly, 0) * 12 });
  breakdown.push({ label: 'Insurance', value: parseNumber(insuranceAnnual, 0) });
  breakdown.push({ label: 'Excise tax', value: parseNumber(exciseTax, 0) });
  breakdown.push({ label: 'Registration & inspection', value: parseNumber(regInspect, 0) });
  breakdown.push({ label: document.querySelector('input[name="ownership"]:checked')?.value === 'loan' ? 'Loan payments (annual)' : 'Depreciation (annual)', value: document.querySelector('input[name="ownership"]:checked')?.value === 'loan' ? parseNumber(loanMonthly, 0) * parseNumber(loanMonthsPerYear, 12) : parseNumber(depreciationAnnual, 0) });
  breakdown.push({ label: 'MBTA annual', value: Number(document.getElementById('mbtaAnnual').textContent.replace(/[$,]/g, '')) || 0 });
  breakdown.push({ label: 'Regional bus', value: regionalVal });
  breakdown.push({ label: 'Rideshare', value: rideshareVal });
  breakdown.push({ label: 'Rental car', value: rentalVal });

  const top = breakdown.sort((a, b) => Math.abs(b.value) - Math.abs(a.value)).slice(0, 2);
  const list = document.getElementById('biggestDrivers');
  list.innerHTML = '';
  top.forEach((t) => {
    const li = document.createElement('li');
    li.textContent = `${t.label}: ${money(t.value)}`;
    list.appendChild(li);
  });

  showScreen('screen-results');
}

// Start over
document.getElementById('startOver')?.addEventListener('click', () => {
  // Reset fields to defaults (keep city?)
  document.getElementById('commuteDays').value = 5;
  document.getElementById('nonCommuteTrips').value = 3;
  document.getElementById('dayTripsHighway').value = 2;
  document.getElementById('multiDayTrips').value = 1;

  // Car defaults
  afdcAnnual.value = 0;
  if (parkingMonthly) parkingMonthly.value = 250;
  // default to off-street parking
  if (document.querySelector('input[name="parkingChoice"][value="offstreet"]')) document.querySelector('input[name="parkingChoice"][value="offstreet"]').checked = true;
  if (parkingOffstreetRow) parkingOffstreetRow.hidden = false;
  if (residentPermitRow) residentPermitRow.hidden = true;
  if (residentPermitAnnual) residentPermitAnnual.value = 0;
  insuranceAnnual.value = 1200;
  exciseTax.value = 0;
  regInspect.value = 100;
  document.querySelector('input[name="ownership"][value="loan"]').checked = true;
  document.getElementById('loanFields').hidden = false;
  document.getElementById('paidFields').hidden = true;
  loanMonthly.value = 300;
  loanMonthsPerYear.value = 12;
  depreciationAnnual.value = 3000;

  // No-car defaults
  document.querySelector('input[name="mbtaStrategy"][value="pass"]').checked = true;
  mbtaTripsPerMonth.value = 40;
  mbtaPassPrice.value = 90;
  mbtaFare.value = 2.4;
  mbtaAutoCheapest.checked = false;

  regionalTown.value = 'boston';
  regionalTripsPerYear.value = 0;
  regionalFare.value = regionalFareMap['boston'];

  rideshareTripsPerMonth.value = 2;
  rideshareAvgCost.value = 15;
  rideshareMultiplier.value = 1.0;

  document.querySelector('input[name="rentalChoice"][value="days"]').checked = true;
  document.getElementById('rentalDaysRow').hidden = false;
  document.getElementById('rentalWeekendsRow').hidden = true;
  rentalDaysPerYear.value = 0;
  rentalWeekendsPerYear.value = 0;
  rentalDaysPerWeekend.value = 2;
  rentalDailyCost.value = 40;
  rentalFuelPerDay.value = 0;

  updateCarSummary();
  updateNoCarSummary();
  showScreen('screen-basics');
});

// Initialize summaries
updateCarSummary();
updateNoCarSummary();

// End new calculator behavior
