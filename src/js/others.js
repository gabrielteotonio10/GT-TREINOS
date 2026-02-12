// Menu Mobile
const btnMenu = document.querySelector(".menu-mobile-btn");
const nav = document.querySelector(".menu-header");

function toggleMenu(event) {
  if (event.type === "touchstart") event.preventDefault();
  nav.classList.toggle("active");

  const active = nav.classList.contains("active");
  event.currentTarget.setAttribute("aria-expanded", active);
}
btnMenu.addEventListener("click", toggleMenu);
btnMenu.addEventListener("touchstart", toggleMenu);

// Fecha o menu ao clicar em um link (importante para SPAs)
const linksModificados = document.querySelectorAll(".nav-link");
linksModificados.forEach((link) => {
  link.addEventListener("click", () => nav.classList.remove("active"));
});






