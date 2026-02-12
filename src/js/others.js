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



// Abrir e fechar modal de adicionar treino
const modal = document.querySelector(".modal-container");
const addTrainingCard = document.querySelector(".add-new-training");
const closeModalBtn = document.querySelector("#btn-fechar-x");
const cancelModalBtn = document.querySelector("#btn-cancelar");

addTrainingCard.addEventListener("click", () => {
  modal.classList.add("active");
});
const fecharModal = () => {
  modal.classList.remove("active");
};

closeModalBtn.addEventListener("click", fecharModal);
cancelModalBtn.addEventListener("click", fecharModal);


