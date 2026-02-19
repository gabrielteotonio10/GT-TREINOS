import uiTraining from "./Training/uiTraining.js";
import uiExercises from "./Exercises/uiExercises.js";

// ---------- SELEÇÃO DE SEÇÕES GERAIS ----------
const presentationTextSection = document.querySelector(".presentation-text");
const websitePresentationSection = document.querySelector(
  ".website-presentation",
);
const workoutsSection = document.querySelector(".workouts-section");
const exerciseSection = document.querySelector(".exercises-library-section");
const pageTraining = document.querySelector(".active-workout-section");
const pageExerciseDetails = document.querySelector(
  ".active-exercise-details-section",
);

// ---------- FUNÇÕES DE NAVEGAÇÃO ----------

function showHome() {
  presentationTextSection.classList.remove("hidden");
  websitePresentationSection.classList.remove("hidden");
  workoutsSection.classList.remove("hidden"); // Deixe visível para aparecer na home
  exerciseSection.classList.add("hidden");
  pageTraining.classList.add("hidden");
  pageExerciseDetails.classList.add("hidden");
  uiTraining.renderTrainings();
}

function changeForTraining() {
  presentationTextSection.classList.add("hidden");
  websitePresentationSection.classList.add("hidden");
  workoutsSection.classList.remove("hidden");
  exerciseSection.classList.remove("hidden");
  pageTraining.classList.add("hidden");
  pageExerciseDetails.classList.add("hidden");

  uiTraining.renderTrainings();
  uiExercises.renderExercises();
}

// ---------- DELEGAÇÃO DE EVENTOS (O SEGREDO) ----------

document.addEventListener("click", (event) => {
  const target = event.target;

  // Clicar na Logo
  if (target.closest(".main-logo")) {
    showHome();
  }

  // Abrir Modal de Treino
  if (target.closest(".add-new-workout-btn")) {
    const modal = document.querySelector("#training-modal");
    modal.classList.add("active");
    modal.classList.remove("hidden");
    uiTraining.clearFormTraining();
  }

  // Abrir Modal de Exercício
  if (target.closest(".add-new-exercise-btn")) {
    const modal = document.querySelector("#exercise-modal");
    modal.classList.add("active");
    modal.classList.remove("hidden");
    uiExercises.clearFormExercise();
  }

  // Abrir Modal de Exercício dentro do treino
  if (target.closest(".create-exercise-btn")) {
    const modal = document.querySelector("#exercise-modal");

    modal.classList.add("active");
    modal.classList.remove("hidden");

    const modalTitle = document.querySelector("#exercise-modal-title");
    if (modalTitle) modalTitle.textContent = "Novo Exercício";

    uiExercises.clearFormExercise();
  }

  // Fechar Modais (Botão X ou Cancelar)
  if (target.closest("#close-x-btn, #cancel-btn")) {
    document.querySelector("#training-modal").classList.remove("active");
  }
  if (target.closest("#close-exercise-modal-btn, #cancel-exercise-btn")) {
    document.querySelector("#exercise-modal").classList.remove("active");
  }

  // Voltar dos Detalhes (Setinhas)
  if (target.closest(".back-arrow-btn, .back-arrow-exercise-btn")) {
    changeForTraining();
  }
});

// ---------- EVENTOS FIXOS (BOTÕES QUE NÃO SOMEM) ----------

const btnTreinosNav = document.querySelector(".training-btn");
const btnComecarHome = document.querySelector(".primary-btn");

if (btnTreinosNav) btnTreinosNav.addEventListener("click", changeForTraining);
if (btnComecarHome) btnComecarHome.addEventListener("click", changeForTraining);

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  uiTraining.renderTrainings();
});
