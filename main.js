const data = [
  {
    title: "Student",
    icon: "images/student.png",
    content: "<p>MBTA pass + occasional rideshare</p>"
  },
  {
    title: "Family",
    icon: "images/family.png",
    content: "<p>Car ownership + school drop-offs</p>"
  },
  {
    title: "Professional",
    icon: "images/professional.png",
    content: "<p>Car ownership + public transportation</p>"
  },
  {
    title: "XX",
    icon: "images/lifestyle_icon_2_128.png",
    content: "<p>Car ownership + XX</p>"
  },
  {
    title: "XX",
    icon: "images/lifestyle_icon_2_128.png",
    content: "<p>Car ownership + XX</p>"
  },
  {
    title: "XX",
    icon: "images/lifestyle_icon_2_128.png",
    content: "<p>Car ownership + XX</p>"
  },
  {
    title: "XX",
    icon: "images/lifestyle_icon_2_128.png",
    content: "<p>Car ownership + XX</p>"
  }
];

const container = document.getElementById("lifestyles");
const template = document.getElementById("accordion-template");

data.forEach(item => {
  const clone = template.content.cloneNode(true);
  clone.querySelector(".title").textContent = item.title;
  clone.querySelector(".icon").src = item.icon;
  clone.querySelector(".content").innerHTML = item.content;
  container.appendChild(clone);
});
