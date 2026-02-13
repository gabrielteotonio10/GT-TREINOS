import uiTraining from "./ui.js";

// Botões de página
const mainLogo = document.querySelector(".main-logo");
const addTraining = document.querySelector(".primary-btn");
const pageTraining = document.querySelector(".training-btn");

// Seções
const presentationTextSection = document.querySelector(".presentation-text");
const websitePresentationSection = document.querySelector(
  ".website-presentation",
);
const workoutsSection = document.querySelector(".workouts-section");

// Evento: Clicar na Logo
mainLogo.addEventListener("click", () => {
  presentationTextSection.classList.remove("hidden");
  websitePresentationSection.classList.remove("hidden");
  workoutsSection.classList.remove("hidden");
  uiTraining.renderTrainings();
});

// Evento: Clicar em "Treinos"
function changeForTraining() {
  presentationTextSection.classList.add("hidden");
  websitePresentationSection.classList.add("hidden");
  workoutsSection.classList.remove("hidden");
  uiTraining.renderTrainings();
}

// Evento: Mudar para "Treinos"
addTraining.addEventListener("click", changeForTraining);
pageTraining.addEventListener("click", changeForTraining);
