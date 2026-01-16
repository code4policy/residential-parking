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

// Lifestyle presets for quick input
const LIFESTYLE_PRESETS = {
  student: {
    commuteDays: 5,
    nonCommuteTrips: 3,
    dayTripsHighway: 2,
    multiDayTrips: 1,
  },
  couple: {
    commuteDays: 10,
    nonCommuteTrips: 4,
    dayTripsHighway: 3,
    multiDayTrips: 2,
  },
  family: {
    commuteDays: 10,
    nonCommuteTrips: 5,
    dayTripsHighway: 4,
    multiDayTrips: 3,
  },
  frequent: {
    commuteDays: 5,
    nonCommuteTrips: 3,
    dayTripsHighway: 5,
    multiDayTrips: 4,
  },
};

// Add click listeners to lifestyle buttons
document.querySelectorAll('.lifestyle-btn').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    const lifestyle = e.currentTarget.dataset.lifestyle;
    applyLifestylePreset(lifestyle);
  });
});

function applyLifestylePreset(lifestyle) {
  const preset = LIFESTYLE_PRESETS[lifestyle];
  if (!preset) return;

  const commuteDaysEl = document.getElementById('commuteDays');
  const nonCommuteTipsEl = document.getElementById('nonCommuteTrips');
  const dayTripsHighwayEl = document.getElementById('dayTripsHighway');
  const multiDayTripsEl = document.getElementById('multiDayTrips');

  if (commuteDaysEl) commuteDaysEl.value = preset.commuteDays;
  if (nonCommuteTipsEl) nonCommuteTipsEl.value = preset.nonCommuteTrips;
  if (dayTripsHighwayEl) dayTripsHighwayEl.value = preset.dayTripsHighway;
  if (multiDayTripsEl) multiDayTripsEl.value = preset.multiDayTrips;

  // Highlight the clicked button
  document.querySelectorAll('.lifestyle-btn').forEach((b) => {
    b.style.outline = b.dataset.lifestyle === lifestyle ? '3px solid #091f2f' : 'none';
    b.style.outlineOffset = b.dataset.lifestyle === lifestyle ? '2px' : 'none';
  });
}

// Helper function to format currency
function money(n) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
}

// ------- Calculator behavior (navigation, car/no-car logic, computations) -------
// --- Calculate and display daily mileage for AFDC helper ---
function calculateAfdcDailyMileage() {
  const commuteDays = Number(document.getElementById('commuteDays')?.value) || 0;
  const nonCommuteTrips = Number(document.getElementById('nonCommuteTrips')?.value) || 0;
  const dayTripsHighway = Number(document.getElementById('dayTripsHighway')?.value) || 0;
  const multiDayTrips = Number(document.getElementById('multiDayTrips')?.value) || 0;

  // Fixed distances
  const commuteDist = 8.1;
  const nonCommuteDist = 7;
  const dayTripDist = 120;
  const multiDayDist = 295;

  // Calculate total annual mileage
  const annualMileage = (commuteDays * 52 * commuteDist) + (nonCommuteTrips * 52 * nonCommuteDist) + (dayTripsHighway * dayTripDist) + (multiDayTrips * multiDayDist);
  return Math.round(annualMileage * 10) / 10; // round to 1 decimal
}

function updateAfdcMileageHelper() {
  const helper = document.getElementById('afdcMileageHelper');
  if (!helper) return;
  const xx = calculateAfdcDailyMileage();
  helper.innerHTML = `It will ask for your annual mileage, which should be around <strong>${xx} miles</strong> based on your travel patterns. This includes your normal daily use, so input 0 miles for daily driving distance.`;
}

['commuteDays','nonCommuteTrips','dayTripsHighway','multiDayTrips'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', updateAfdcMileageHelper);
});

// Initialize on page load
updateAfdcMileageHelper();

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
  showScreen('screen-car'); // screen 2
});

const toNoCarBtn = document.getElementById('toComparisonFromCar');
toNoCarBtn?.addEventListener('click', () => {
  // Derive defaults from Screen 1 inputs when entering Screen 3
  setNoCarDefaultsFromBasics();
  showScreen('screen-nocar'); // screen 3
});

const toResultsBtn = document.getElementById('toComparisonFromNoCar');
toResultsBtn?.addEventListener('click', () => {
  showResults();
});

// Back buttons
document.getElementById('backFromCar')?.addEventListener('click', () => showScreen('screen-basics'));
document.getElementById('backFromNoCar')?.addEventListener('click', () => showScreen('screen-car'));
document.getElementById('backFromResults')?.addEventListener('click', () => showScreen('screen-nocar'));

// Car screen interactions
const afdcAnnual = document.getElementById('afdcAnnual');
const fuelMonthly = document.getElementById('fuelMonthly');
const carOwnershipYes = document.getElementById('ownCarYes');
const carOwnershipNo = document.getElementById('ownCarNo');
const fuelCostSection = document.getElementById('fuelCostSection');
const afdcSection = document.getElementById('afdcSection');
const carOwnershipForm = document.getElementById('carOwnershipForm');

function updateCarOwnershipUI() {
  if (!carOwnershipYes || !carOwnershipNo || !fuelCostSection || !afdcSection) return;
  if (carOwnershipYes.checked) {
    fuelCostSection.style.display = '';
    afdcSection.style.display = 'none';
    // Set afdcAnnual to 0 and disable
    if (afdcAnnual) { afdcAnnual.value = ''; afdcAnnual.disabled = true; }
    if (fuelMonthly) fuelMonthly.disabled = false;
  } else if (carOwnershipNo.checked) {
    fuelCostSection.style.display = 'none';
    afdcSection.style.display = '';
    // Set fuelMonthly to 0 and disable
    if (fuelMonthly) { fuelMonthly.value = ''; fuelMonthly.disabled = true; }
    if (afdcAnnual) afdcAnnual.disabled = false;
  } else {
    fuelCostSection.style.display = 'none';
    afdcSection.style.display = 'none';
    if (afdcAnnual) afdcAnnual.disabled = true;
    if (fuelMonthly) fuelMonthly.disabled = true;
  }
}

if (carOwnershipYes) carOwnershipYes.addEventListener('change', updateCarOwnershipUI);
if (carOwnershipNo) carOwnershipNo.addEventListener('change', updateCarOwnershipUI);
updateCarOwnershipUI();

const parkingMonthly = document.getElementById('parkingMonthly');
const residentPermitAnnual = document.getElementById('residentPermitAnnual');
const parkingOffstreetRow = document.getElementById('parkingOffstreetRow');
const residentPermitRow = document.getElementById('residentPermitRow');
const insuranceAnnual = document.getElementById('insuranceAnnual');
const exciseTax = document.getElementById('exciseTax');
const regInspect = document.getElementById('regInspect');
const loanMonthly = document.getElementById('loanMonthly');
const loanMonthsPerYear = document.getElementById('loanMonthsPerYear');

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
  }
  updateCarSummary();
}));

// Listen for changes and update summary live
[afdcAnnual, parkingMonthly, residentPermitAnnual, insuranceAnnual, exciseTax, regInspect, loanMonthly, loanMonthsPerYear].forEach((el) => {
  el?.addEventListener('input', updateCarSummary);
});

function parseNumber(el, fallback = 0) {
  if (!el) return fallback;
  const v = Number(el.value);
  return Number.isFinite(v) ? v : fallback;
}

function updateCarSummary() {
  // Determine which cost to use based on ownership
  let varAnnual = 0;
  if (carOwnershipYes && carOwnershipYes.checked && fuelMonthly) {
    varAnnual = Number(fuelMonthly.value) * 12 || 0;
  } else if (carOwnershipNo && carOwnershipNo.checked && afdcAnnual) {
    varAnnual = parseNumber(afdcAnnual, 0);
  }
  const parkingChoice = document.querySelector('input[name="parkingChoice"]:checked')?.value;
  const parkingAnnual = parkingChoice === 'permit' ? parseNumber(residentPermitAnnual, 0) : parseNumber(parkingMonthly, 0) * 12;
  const insurance = parseNumber(insuranceAnnual, 0);
  const excise = parseNumber(exciseTax, 0);
  const reg = parseNumber(regInspect, 0);

  let ownershipAnnual = 0;
  if (document.querySelector('input[name="ownership"]:checked')?.value === 'loan') {
    ownershipAnnual = parseNumber(loanMonthly, 0) * parseNumber(loanMonthsPerYear, 12);
  }

  const fixed = parkingAnnual + insurance + excise + reg + ownershipAnnual;
  const total = varAnnual + fixed;

  document.getElementById('carVar').textContent = money(varAnnual);
  document.getElementById('carFixedCalc').textContent = money(fixed);
  document.getElementById('carAnnualTotal').textContent = money(total);
  document.getElementById('carMonthlyTotal').textContent = money(total / 12);
}

// No-car interactions
const mbtaMonthlyDirect = document.getElementById('mbtaMonthlyDirect');
const regionalBusMonthlyDirect = document.getElementById('regionalBusMonthlyDirect');
const rideshareMonthlyDirect = document.getElementById('rideshareMonthlyDirect');
const rentalCarAnnualDirect = document.getElementById('rentalCarAnnualDirect');

const rentalChoiceRadios = document.querySelectorAll('input[name="rentalChoice"]');

// Rental choice
rentalChoiceRadios.forEach((r) => r.addEventListener('change', () => {
  const val = document.querySelector('input[name="rentalChoice"]:checked')?.value;
  document.getElementById('rentalDaysRow').hidden = val !== 'days';
  document.getElementById('rentalWeekendsRow').hidden = val !== 'weekends';
  updateNoCarSummary();
}));

// Live updates
// Listen for changes on no-car inputs
[mbtaMonthlyDirect, regionalBusMonthlyDirect, rideshareMonthlyDirect, rentalCarAnnualDirect].forEach((el) => {
  el?.addEventListener('input', updateNoCarSummary);
  el?.addEventListener('change', updateNoCarSummary);
});

function updateNoCarSummary() {
  // Use direct monthly cost inputs (annualized) and direct annual rental input
  const mbtaAnnual = parseNumber(mbtaMonthlyDirect, 0) * 12;
  const regionalAnnual = parseNumber(regionalBusMonthlyDirect, 0) * 12;
  const rideshareAnnual = parseNumber(rideshareMonthlyDirect, 0) * 12;
  const rentalAnnual = parseNumber(rentalCarAnnualDirect, 0);

  document.getElementById('mbtaAnnual').textContent = money(mbtaAnnual);
  document.getElementById('regionalAnnual').textContent = money(regionalAnnual);
  document.getElementById('rideshareAnnual').textContent = money(rideshareAnnual);
  document.getElementById('rentalAnnual').textContent = money(rentalAnnual);

  const total = mbtaAnnual + regionalAnnual + rideshareAnnual + rentalAnnual;
  document.getElementById('noCarAnnual').textContent = money(total);
}

// Derive sensible defaults for Screen 3 from Screen 1 inputs
function setNoCarDefaultsFromBasics() {
  const commuteDays = Number(document.getElementById('commuteDays')?.value) || 0;
  const nonCommuteTrips = Number(document.getElementById('nonCommuteTrips')?.value) || 0;
  const dayTripsHighway = Number(document.getElementById('dayTripsHighway')?.value) || 0;
  const multiDayTrips = Number(document.getElementById('multiDayTrips')?.value) || 0;

  const weeks = 4; // approximate weeks per month
  const mbtaTripsMonth = (commuteDays * 2 * weeks) + (nonCommuteTrips * 2 * weeks * 0.75);
  const payPerRideMonthly = mbtaTripsMonth * 2.4; // typical fare for subway/bus
  const passMonthly = 90; // typical LinkPass price
  const mbtaMonthlyDefault = Math.min(passMonthly, payPerRideMonthly);

  const rideshareMonthlyDefault = Math.max(0, Math.round(nonCommuteTrips * weeks * 0.25) * 15); // ~25% of non-commute trips via rideshare @ $15
  const REGIONAL_BUS_AVG_PER_DAY = 20; // average day-trip spend on regional bus
  const regionalMonthlyDefault = (dayTripsHighway * REGIONAL_BUS_AVG_PER_DAY) / 12; // convert annual day trips to monthly cost
  const rentalAnnualDefault = Math.max(0, Math.round(40 * (dayTripsHighway + (multiDayTrips * 2)))); // $40/day, assume 2 days for multi-day trips

  if (mbtaMonthlyDirect) mbtaMonthlyDirect.value = Math.round(mbtaMonthlyDefault);
  if (regionalBusMonthlyDirect) regionalBusMonthlyDirect.value = Math.round(regionalMonthlyDefault);
  if (rideshareMonthlyDirect) rideshareMonthlyDirect.value = Math.round(rideshareMonthlyDefault);
  if (rentalCarAnnualDirect) rentalCarAnnualDirect.value = rentalAnnualDefault;

  updateNoCarSummary();
}

function showResults() {
  // Read totals
  const parkingChoice = document.querySelector('input[name="parkingChoice"]:checked')?.value;
  const carTotal = parseNumber(afdcAnnual, 0) + (parkingChoice === 'permit' ? parseNumber(residentPermitAnnual, 0) : parseNumber(parkingMonthly, 0) * 12) + parseNumber(insuranceAnnual, 0) + parseNumber(exciseTax, 0) + parseNumber(regInspect, 0) + (document.querySelector('input[name="ownership"]:checked')?.value === 'loan' ? parseNumber(loanMonthly, 0) * parseNumber(loanMonthsPerYear, 12) : 0);

  // No car total
  const mbtaVal = Number(document.getElementById('mbtaAnnual')?.textContent.replace(/[$,]/g, '')) || 0;
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
  if (document.querySelector('input[name="ownership"]:checked')?.value === 'loan') {
    breakdown.push({ label: 'Loan payments (annual)', value: parseNumber(loanMonthly, 0) * parseNumber(loanMonthsPerYear, 12) });
  }
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
  // Reset fields to defaults
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

  // No-car direct monthly cost fields
  if (mbtaMonthlyDirect) mbtaMonthlyDirect.value = 0;
  if (regionalBusMonthlyDirect) regionalBusMonthlyDirect.value = 0;
  if (rideshareMonthlyDirect) rideshareMonthlyDirect.value = 0;
  if (rentalCarAnnualDirect) rentalCarAnnualDirect.value = 0;

  updateCarSummary();
  // Optionally derive fresh defaults for Screen 3 based on reset basics
  setNoCarDefaultsFromBasics();
  showScreen('screen-basics');
});

// Initialize summaries
updateCarSummary();
updateNoCarSummary();
