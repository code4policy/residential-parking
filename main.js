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

// Load lifestyle data and populate accordion
const lifestyleData = [
  {
    title: "Student",
    icon: "images/student.png",
    html: `
      <p class="supporting-text">Typical pattern: MBTA pass + occasional rideshare.</p>
      <ul>
        <li>Monthly pass: $___</li>
        <li>Rideshare: $___</li>
        <li>Total: $___</li>
      </ul>`
  },
  {
    title: "Family",
    icon: "images/family.png",
    html: `
      <p class="supporting-text">Typical pattern: car ownership + parking + school trips.</p>
      <ul>
        <li>Insurance: $___</li>
        <li>Parking: $___</li>
        <li>Gas/maintenance: $___</li>
        <li>Total: $___</li>
      </ul>`
  },
  {
    title: "Professional",
    icon: "images/professional.png",
    html: `
      <p class="supporting-text">Typical pattern: car ownership + parking + commuting.</p>
      <ul>
        <li>Insurance: $___</li>
        <li>Parking: $___</li>
        <li>Gas/maintenance: $___</li>
        <li>Total: $___</li>
      </ul>`
  },
  {
    title: "XX",
    icon: "images/XX.png",
    html: `
      <p class="supporting-text">Typical pattern: reduced commuting + leisure activities.</p>
      <ul>
        <li>Insurance: $___</li>
        <li>Parking: $___</li>
        <li>Gas/maintenance: $___</li>
        <li>Total: $___</li>
      </ul>`
  },
  {
    title: "XX",
    icon: "images/XX.png",
    html: `
      <p class="supporting-text">Typical pattern: reduced commuting + leisure activities.</p>
      <ul>
        <li>Insurance: $___</li>
        <li>Parking: $___</li>
        <li>Gas/maintenance: $___</li>
        <li>Total: $___</li>
      </ul>`
  },
  {
    title: "XX",
    icon: "images/XX.png",
    html: `
      <p class="supporting-text">Typical pattern: reduced commuting + leisure activities.</p>
      <ul>
        <li>Insurance: $___</li>
        <li>Parking: $___</li>
        <li>Gas/maintenance: $___</li>
        <li>Total: $___</li>
      </ul>`
  },
  {
    title: "XX",
    icon: "images/XX.png",
    html: `
      <p class="supporting-text">Typical pattern: reduced commuting + leisure activities.</p>
      <ul>
        <li>Insurance: $___</li>
        <li>Parking: $___</li>
        <li>Gas/maintenance: $___</li>
        <li>Total: $___</li>
      </ul>`
  }];

const container = document.getElementById("lifestyles");
const template = document.getElementById("accordion-template");

lifestyleData.forEach((item) => {
  const node = template.content.cloneNode(true);

  const btn = node.querySelector(".b-collapsible__header");
  const content = node.querySelector(".b-collapsible__content");
  const body = node.querySelector(".acc-body");

  node.querySelector(".acc-title").textContent = item.title;
  const img = node.querySelector(".acc-icon");
  img.src = item.icon;
  img.alt = item.title;

  body.innerHTML = item.html;

  // Toggle behavior
  btn.addEventListener("click", () => {
    const isOpen = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!isOpen));
    content.hidden = isOpen;
  });

  container.appendChild(node);
});