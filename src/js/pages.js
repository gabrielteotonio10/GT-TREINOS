import uiTraining from "./Training/uiTraining";

// Botões de mudança de página
const mainLogo = document.querySelector(".main-logo");
const addTraining = document.querySelector(".primary-btn");
const pageTrainingAll = document.querySelector(".training-btn");
const pageTraining = document.querySelector(".active-workout-section");
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
    document.querySelector(".exercises-library-section")?.classList.add("hidden");
    trainingPage.classList.remove("hidden");
  }
});
// Voltar do treino
const backArrow = document.querySelector(".back-arrow-btn");
backArrow.addEventListener("click", changeForTraining);

// Evento: Abrir o formulário de criar treinos
const modalContainerTraining = document.querySelector("#training-modal");
const addNewWorkoutCardTraining = document.querySelector(".add-new-workout");
const closeXBtnTraining = document.querySelector("#close-x-btn");
const cancelBtnTraining = document.querySelector("#cancel-btn");
// Abrir o modal
addNewWorkoutCardTraining.addEventListener("click", () => {
  modalContainerTraining.classList.add("active");
});
// Abrir o modal se não existir treino
document.addEventListener("click", (event) => {
  const btn = event.target.closest(".add-new-workout-btn");
  if (btn) {
    const modalContainerTraining = document.querySelector("#training-modal");
    if (modalContainerTraining) {
      modalContainerTraining.classList.add("active");
    }
  }
});
// Fechar o modal
const closeModalTraining = () => {
  modalContainerTraining.classList.remove("active");
};
closeXBtnTraining.addEventListener("click", closeModalTraining);
cancelBtnTraining.addEventListener("click", closeModalTraining);

// Evento: Abrir o formulário de criar exercicios
const modalContainerExercise = document.querySelector("#exercise-modal");
const addNewWorkoutCardExercise = document.querySelector(".add-new-exercise-btn");
const closeXBtnExercise = document.querySelector("#close-exercise-modal-btn");
const cancelBtnExercise = document.querySelector("#cancel-exercise-btn");
// Abrir o modal
addNewWorkoutCardExercise.addEventListener("click", () => {
  modalContainerExercise.classList.add("active");
});
// Abrir o modal se não existir treino
document.addEventListener("click", (event) => {
  const btn = event.target.closest(".add-new-workout-btn");
  if (btn) {
    const modalContainerExercise = document.querySelector("#training-modal");
    if (modalContainerExercise) {
      modalContainerExercise.classList.add("active");
    }
  }
});
// Fechar o modal
const closeModalExercise = () => {
  modalContainerExercise.classList.remove("active");
};
closeXBtnExercise.addEventListener("click", closeModalExercise);
cancelBtnExercise.addEventListener("click", closeModalExercise);

// Evento: Mudar para "Treinos"
addTraining.addEventListener("click", changeForTraining);
pageTrainingAll.addEventListener("click", changeForTraining);
