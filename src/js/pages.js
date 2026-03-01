// ==========================================================================
// IMPORTAÇÕES
// ==========================================================================
import uiTraining from "./Training/uiTraining.js";
import uiExercises from "./Exercises/uiExercises.js";
import apiExercises from "./Exercises/apiExercises.js";
import { checkAuth } from "./auth.js";
import { renderDashboard } from "./dashboard.js";

// ==========================================================================
// SELEÇÃO DE SEÇÕES GERAIS (PÁGINAS)
// ==========================================================================
const presentationTextSection = document.querySelector(".presentation-text");
const websitePresentationSection = document.querySelector(".website-presentation");
const workoutsSection = document.querySelector(".workouts-section");
const exerciseSection = document.querySelector(".exercises-library-section");
const pageTraining = document.querySelector(".active-workout-section");
const pageExerciseDetails = document.querySelector(".active-exercise-details-section");
const profileSection = document.querySelector("#profile-section");
const resultsSection = document.querySelector("#results-section");

// ==========================================================================
// FUNÇÕES DE CONTROLE DE NAVEGAÇÃO
// ==========================================================================

// Sobe a página suavemente pro topo
function startPage() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

// Esconde todas as seções da aplicação (menos a que quer mostrar)
function hideAllSections() {
  const sections = [
    presentationTextSection,
    websitePresentationSection,
    workoutsSection,
    exerciseSection,
    pageTraining,
    pageExerciseDetails,
    profileSection,
    resultsSection, 
  ];
  // Marca todas com "hidden" pra sumirem
  sections.forEach((section) => {
    if (section) section.classList.add("hidden");
  });
}

// Mostra a tela inicial (com boas-vindas, dashboard e biblioteca de treinos)
async function showHome() {
  // Tira tudo da tela primeiro
  hideAllSections();
  // Mostra o que precisa na home
  presentationTextSection.classList.remove("hidden");
  websitePresentationSection.classList.remove("hidden");
  workoutsSection.classList.remove("hidden");
  await uiTraining.renderTrainings();
  await renderDashboard();

  // Renderiza os treinos do usuário
  uiTraining.renderTrainings();
  renderDashboard();
  startPage();
}

// Mostra a biblioteca com treinos e exercícios disponíveis
async function changeForTraining() {
  // Esconde tudo primeiro
  hideAllSections();
  // Mostra só as bibliotecas
  workoutsSection.classList.remove("hidden");
  exerciseSection.classList.remove("hidden");

  // Renderiza ambas as listas
  await uiTraining.renderTrainings();
  await uiExercises.renderExercises();
  startPage();
}

// Mostra a tela de Resultados
async function showResults() {
  hideAllSections();
  resultsSection.classList.remove("hidden");
  
  // Chama a função que criamos para desenhar os gráficos e dados
  await renderDashboard(); 
  
  startPage();
}

// Abre a tela de edição do perfil com todos os dados preenchidos
function showProfile() {
  // Esconde tudo
  hideAllSections();
  // Mostra só o perfil
  profileSection.classList.remove("hidden");
  // Preenche os campos com os dados do usuário
  fillProfileData();
  startPage();
}

// Busca o usuário logado e preenche todos os campos da página de perfil
function fillProfileData() {
  // Pega os dados do usuário do localStorage
  const userString = localStorage.getItem("currentUser");

  if (userString) {
    const user = JSON.parse(userString);

    // Preenche os dados básicos (email, nome)
    document.getElementById("profile-email").value = user.email || "";
    document.getElementById("hero-display-email").textContent =
      user.email || "";

    const nomeExibicao = user.name ? user.name : user.email.split("@")[0];
    document.getElementById("profile-name").value = nomeExibicao;
    document.getElementById("hero-display-name").textContent = nomeExibicao;

    // Preenche medidas e objetivo
    if (user.weight)
      document.getElementById("profile-weight").value = user.weight;
    if (user.height)
      document.getElementById("profile-height").value = user.height;
    if (user.goal) document.getElementById("profile-goal").value = user.goal;

    // Foto de Perfil
    const avatarPreview = document.getElementById("profile-avatar-preview");
    if (user.photo) {
      avatarPreview.innerHTML = `<img src="${user.photo}" alt="Foto de Perfil" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    } else {
      avatarPreview.innerHTML = `<i class="fa-solid fa-user"></i>`;
    }
  }
}

// ==========================================================================
// DELEGAÇÃO GLOBAL DE EVENTOS DE CLIQUE (ROTEADOR)
// ==========================================================================

document.addEventListener("click", async (event) => {
  const target = event.target;

  // --- NAVEGAÇÃO PRINCIPAL ---
  if (target.closest(".main-logo")) {
    showHome();
  }

  if (target.closest(".nav-btn") && target.textContent.includes("Perfil")) {
    showProfile();
  }

  // --- NAVEGAÇÃO INTERNA (SETAS DE VOLTAR) ---
  if (target.closest(".back-arrow-btn")) {
    changeForTraining(); // Volta do Treino Ativo para as Bibliotecas
  }

  const backExerciseBtn = target.closest(".back-arrow-exercise-btn");
  if (backExerciseBtn) {
    if (backExerciseBtn.getAttribute("data-from") === "training") {
      // Volta do Exercício para o Treino Ativo
      document
        .querySelector(".active-exercise-details-section")
        .classList.add("hidden");
      document
        .querySelector(".active-workout-section")
        .classList.remove("hidden");
      backExerciseBtn.removeAttribute("data-from");
      window.scrollTo({ top: 150, behavior: "smooth" });
    } else {
      // Volta do Exercício para a Biblioteca de Exercícios
      changeForTraining();
    }
  }

  // --- ABERTURA DE MODAIS DE CRIAÇÃO/EDIÇÃO ---
  // Modal Treino
  if (target.closest(".add-new-workout-btn") || target.closest(".add-new-workout")) {
    const modalTitleTreino = document.querySelector("#training-modal-title");
    if (modalTitleTreino) modalTitleTreino.textContent = "Novo Treino";

    const modal = document.querySelector("#training-modal");
    modal.classList.add("active");
    modal.classList.remove("hidden");
    uiTraining.clearFormTraining();
  }

  // Modal Exercício a partir da Biblioteca
  if (target.closest(".add-new-exercise-btn")) {
    const modalTitle = document.querySelector("#exercise-modal-title");
    if (modalTitle) modalTitle.textContent = "Novo Exercício";

    const modal = document.querySelector("#exercise-modal");
    modal.classList.add("active");
    modal.classList.remove("hidden");
    uiExercises.clearFormExercise();
  }

  // Modal Exercício a partir do Modal de Treino
  if (
    target.closest(".create-exercise-btn") ||
    target.closest(".create-new-exercise-from-modal-btn")
  ) {
    const modalTitle = document.querySelector("#exercise-modal-title");
    if (modalTitle) modalTitle.textContent = "Novo Exercício";

    const modal = document.querySelector("#exercise-modal");
    modal.classList.add("active");
    modal.classList.remove("hidden");
    uiExercises.clearFormExercise();
  }

  // Adicionar Exercício existente a um Treino Ativo
  if (target.closest(".add-exercise-to-workout-btn")) {
    const modalSelect = document.querySelector("#select-exercise-modal");
    if (modalSelect) {
      modalSelect.classList.add("active");
      modalSelect.classList.remove("hidden");

      // Busca e renderiza os exercícios imediatamente
      const allExercises = await apiExercises.getExercises();
      const selectedIds = uiTraining.getCurrentSelectedIds();

      uiExercises.renderExercisesForSelection(
        allExercises,
        "#available-exercises-list",
        selectedIds,
      );
    }
  }

  // --- FECHAMENTO DE MODAIS ---
  if (target.closest("#close-x-btn, #cancel-btn")) {
    document.querySelector("#training-modal").classList.remove("active");
  }

  if (target.closest("#close-exercise-modal-btn, #cancel-exercise-btn")) {
    document.querySelector("#exercise-modal").classList.remove("active");
  }

  if (target.closest("#close-select-exercise-btn")) {
    const modalSelect = document.querySelector("#select-exercise-modal");
    if (modalSelect) modalSelect.classList.remove("active");
  }

  // --- MODAL DE LOGOUT ---
  if (target.closest("#logout-btn")) {
    const modal = document.querySelector("#logout-modal");
    if (modal) {
      modal.classList.add("active");
      modal.classList.remove("hidden");
    }
  }

  if (target.closest("#cancel-logout-btn")) {
    const modal = document.querySelector("#logout-modal");
    if (modal) {
      modal.classList.remove("active");
      modal.classList.add("hidden");
    }
  }

  if (target.closest("#confirm-logout-btn")) {
    localStorage.removeItem("currentUser");
    checkAuth();
    const modal = document.querySelector("#logout-modal");
    if (modal) {
      modal.classList.remove("active");
      modal.classList.add("hidden");
    }
    console.log("Usuário deslogou com sucesso!");
  }

  // --- NAVEGAÇÃO DE AUTENTICAÇÃO E RECUPERAÇÃO ---
  if (target.closest("#go-to-register")) {
    event.preventDefault();
    document.querySelector("#login-section").classList.add("hidden");
    document.querySelector("#register-section").classList.remove("hidden");
  }

  if (target.closest("#go-to-login")) {
    event.preventDefault();
    document.querySelector("#register-section").classList.add("hidden");
    document.querySelector("#login-section").classList.remove("hidden");
  }

  if (target.closest("#forgot-password-link")) {
    event.preventDefault();
    const modal = document.querySelector("#forgot-password-modal");
    if (modal) {
      modal.classList.add("active");
      modal.classList.remove("hidden");
    }
  }

  if (
    target.closest("#close-forgot-password-btn") ||
    target.closest("#cancel-recovery-btn")
  ) {
    const modal = document.querySelector("#forgot-password-modal");
    if (modal) {
      modal.classList.remove("active");
      modal.classList.add("hidden");
    }
  }

  if (target.closest(".nav-btn") && target.textContent.includes("Resultados")) {
    showResults();
  }
});

// ==========================================================================
// EVENTOS FIXOS DIRETOS (BOTÕES QUE NÃO SOMEM)
// ==========================================================================

document.addEventListener("click", (event) => {
  const target = event.target;

  // Se clicou no botão "Treinos" na barra de navegação
  if (target.closest(".training-btn") || (target.closest(".nav-btn") && target.textContent.includes("Treinos"))) {
    changeForTraining();
  }

  // Se clicou no botão "Ir para Treinos" do banner de Aviso (Empty State)
  if (target.closest("#go-to-trainings-btn")) {
    changeForTraining();
  }
});

// ==========================================================================
// INICIALIZAÇÃO
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  uiTraining.renderTrainings();
  startPage();
  showHome();
});
