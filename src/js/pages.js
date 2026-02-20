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

function startPage() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

function showHome() {
  presentationTextSection.classList.remove("hidden");
  websitePresentationSection.classList.remove("hidden");
  workoutsSection.classList.remove("hidden"); // Deixe visível para aparecer na home
  exerciseSection.classList.add("hidden");
  pageTraining.classList.add("hidden");
  pageExerciseDetails.classList.add("hidden");
  uiTraining.renderTrainings();
  startPage();
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
  startPage();
}

// ---------- DELEGAÇÃO DE EVENTOS ----------

document.addEventListener("click", (event) => {
  const target = event.target;
  // ----
  // Clicar na Logo
  if (target.closest(".main-logo")) {
    showHome();
    startPage();
  }
  // ----
  // Abrir Modal de Treino
  if (target.closest(".add-new-workout-btn")) {
    const modal = document.querySelector("#training-modal");
    modal.classList.add("active");
    modal.classList.remove("hidden");
    uiTraining.clearFormTraining();
    startPage();
  }
  // ----
  // Abrir Modal de Exercício
  if (target.closest(".add-new-exercise-btn")) {
    const modal = document.querySelector("#exercise-modal");
    modal.classList.add("active");
    modal.classList.remove("hidden");
    uiExercises.clearFormExercise();
    startPage();
  }
  // ---- create-new-exercise-from-modal-btn
  // Abrir Modal de Exercício dentro do treino
  if (target.closest(".create-exercise-btn")) {
    const modal = document.querySelector("#exercise-modal");

    modal.classList.add("active");
    modal.classList.remove("hidden");

    const modalTitle = document.querySelector("#exercise-modal-title");
    if (modalTitle) modalTitle.textContent = "Novo Exercício";

    startPage();
    uiExercises.clearFormExercise();
  }
  // ----
  // Fechar Modais (Botão X ou Cancelar)
  if (target.closest("#close-x-btn, #cancel-btn")) {
    document.querySelector("#training-modal").classList.remove("active");
    startPage();
  }
  if (target.closest("#close-exercise-modal-btn, #cancel-exercise-btn")) {
    document.querySelector("#exercise-modal").classList.remove("active");
    startPage();
  }
  // ----
  // Voltar dos Detalhes (Setinhas)
  if (target.closest(".back-arrow-btn, .back-arrow-exercise-btn")) {
    changeForTraining();
    startPage();
  }
  // ----
  // Adicionar um exercício dentro do treino
  if (target.closest(".add-exercise-to-workout-btn")) {
    const modalSelect = document.querySelector("#select-exercise-modal");
    startPage();
    if (modalSelect) {
      modalSelect.classList.add("active");

      // DICA: Aqui no futuro você vai chamar a função que renderiza
      // a lista dos seus exercícios do banco de dados para dentro do modal.
      // Ex: uiExercises.renderExercisesForSelection();
    }
  }
  // Fechar o modal de Seleção
  if (target.closest("#close-select-exercise-btn")) {
    const modalSelect = document.querySelector("#select-exercise-modal");
    if (modalSelect) modalSelect.classList.remove("active");
    startPage();
  }
  // Clicar em criar exercício
  if (target.closest(".create-new-exercise-from-modal-btn")) {
    const modal = document.querySelector("#exercise-modal");

    modal.classList.add("active");
    modal.classList.remove("hidden");

    const modalTitle = document.querySelector("#exercise-modal-title");
    if (modalTitle) modalTitle.textContent = "Novo Exercício";

    startPage();
    uiExercises.clearFormExercise();
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
  startPage();
});
