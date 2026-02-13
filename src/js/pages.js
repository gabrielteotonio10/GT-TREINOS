import uiTraining from "./ui.js";
// Botões de mudança de página
const mainLogo = document.querySelector(".main-logo");
const addTraining = document.querySelector(".primary-btn");
const pageTrainingAll = document.querySelector(".training-btn");
const pageTraining = document.querySelector(".active-workout-section");
// Seções
const presentationTextSection = document.querySelector(".presentation-text");
const websitePresentationSection = document.querySelector(".website-presentation",);
const workoutsSection = document.querySelector(".workouts-section");

// Evento: Clicar na Logo
mainLogo.addEventListener("click", () => {
  presentationTextSection.classList.remove("hidden");
  websitePresentationSection.classList.remove("hidden");
  workoutsSection.classList.remove("hidden");
  pageTraining.classList.add("hidden");
  uiTraining.renderTrainings();
});

// Evento: Clicar em "Treinos"
function changeForTraining() {
  presentationTextSection.classList.add("hidden");
  websitePresentationSection.classList.add("hidden");
  workoutsSection.classList.remove("hidden");
  pageTraining.classList.add("hidden");
  uiTraining.renderTrainings();
}

// Evento: Clicar em um treino
document.addEventListener("click", (event) => {
  const card = event.target.closest(".workout-card:not(.add-new-workout)");

  if (card) {
    const trainingPage = document.querySelector(".active-workout-section");
    const workoutsSection = document.querySelector(".workouts-section");

    workoutsSection.classList.add("hidden");
    document.querySelector(".presentation-text")?.classList.add("hidden");
    document.querySelector(".website-presentation")?.classList.add("hidden");
    trainingPage.classList.remove("hidden");
  }
});
// Voltar do treino
const backArrow = document.querySelector(".back-arrow-btn");
backArrow.addEventListener("click", changeForTraining);

// Evento: Abrir o formulário de criar treinos
const modalContainer = document.querySelector(".modal-container");
const addNewWorkoutCard = document.querySelector(".add-new-workout");
const closeXBtn = document.querySelector("#close-x-btn");
const cancelBtn = document.querySelector("#cancel-btn");
// Abrir o modal
addNewWorkoutCard.addEventListener("click", () => {
  modalContainer.classList.add("active");
});
// Abrir o modal se não existir treino
document.addEventListener("click", (event) => {
  const btn = event.target.closest(".add-new-workout-btn");
  if (btn) {
    const modalContainer = document.querySelector(".modal-container");
    if (modalContainer) {
      modalContainer.classList.add("active");
    }
  }
});
// Fechar o modal
const closeModal = () => {
  modalContainer.classList.remove("active");
};
closeXBtn.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);


// Evento: Mudar para "Treinos"
addTraining.addEventListener("click", changeForTraining);
pageTrainingAll.addEventListener("click", changeForTraining);
