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
const websitePresentationSection = document.querySelector(
  ".website-presentation",
);
const workoutsSection = document.querySelector(".workouts-section");
const exerciseSection = document.querySelector(".exercises-library-section");
const pageTraining = document.querySelector(".active-workout-section");
const pageExerciseDetails = document.querySelector(
  ".active-exercise-details-section",
);
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

function updateUIWithUserData() {
  const userString = localStorage.getItem("currentUser");
  if (!userString) return;

  const user = JSON.parse(userString);
  const displayName = document.getElementById("hero-display-name");
  const greetingElement = document.getElementById("greeting-text"); // Veja se tem esse ID no HTML

  // Define a saudação baseada na hora
  const hour = new Date().getHours();
  let greeting = "Bom dia";
  if (hour >= 12 && hour < 18) greeting = "Boa tarde";
  if (hour >= 18 || hour < 5) greeting = "Boa noite";

  if (displayName) {
    displayName.textContent = user.name || user.email.split("@")[0];
  }

  if (greetingElement) {
    greetingElement.textContent = greeting;
  }
}

// Mostra a tela inicial (com boas-vindas, dashboard e biblioteca de treinos)
async function showHome() {
  // Tira tudo da tela primeiro
  hideAllSections();
  // Mostra o que precisa na home
  if (presentationTextSection)
    presentationTextSection.classList.remove("hidden");
  if (websitePresentationSection)
    websitePresentationSection.classList.remove("hidden");
  if (workoutsSection) workoutsSection.classList.remove("hidden");

  updateUIWithUserData();

  // Agora esperamos o Supabase responder antes de finalizar a transição
  await uiTraining.renderTrainings();
  await renderDashboard();

  try {
    // Garante que o dashboard e os treinos carreguem em paralelo para ser mais rápido
    await Promise.all([uiTraining.renderTrainings(), renderDashboard()]);
  } catch (error) {
    console.error("Erro ao carregar dados da Home:", error);
  }

  startPage();
}

// Mostra a biblioteca com treinos e exercícios disponíveis
async function changeForTraining() {
  // Esconde tudo primeiro
  hideAllSections();
  // Mostra só as bibliotecas
  if (workoutsSection) workoutsSection.classList.remove("hidden");
  if (exerciseSection) exerciseSection.classList.remove("hidden");

  // Renderiza ambas as listas vindo do banco de dados
  await uiTraining.renderTrainings();
  await uiExercises.renderExercises();
  startPage();
}

// Mostra a tela de Resultados
async function showResults() {
  hideAllSections();
  if (resultsSection) resultsSection.classList.remove("hidden");

  // Chama a função que criamos para desenhar os gráficos e dados (agora com await)
  await renderDashboard();

  startPage();
}

// Abre a tela de edição do perfil com todos os dados preenchidos
function showProfile() {
  // Esconde tudo
  hideAllSections();
  // Mostra só o perfil
  if (profileSection) profileSection.classList.remove("hidden");
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
    const emailInput = document.getElementById("profile-email");
    const displayEmail = document.getElementById("hero-display-email");
    if (emailInput) emailInput.value = user.email || "";
    if (displayEmail) displayEmail.textContent = user.email || "";

    const nomeExibicao = user.name
      ? user.name
      : user.email
        ? user.email.split("@")[0]
        : "Usuário";
    const nameInput = document.getElementById("profile-name");
    const displayName = document.getElementById("hero-display-name");
    if (nameInput) nameInput.value = nomeExibicao;
    if (displayName) displayName.textContent = nomeExibicao;

    // Preenche medidas e objetivo
    const weightInput = document.getElementById("profile-weight");
    const heightInput = document.getElementById("profile-height");
    const goalInput = document.getElementById("profile-goal");

    if (weightInput && user.weight) weightInput.value = user.weight;
    if (heightInput && user.height) heightInput.value = user.height;
    if (goalInput && user.goal) goalInput.value = user.goal;

    // Foto de Perfil
    const avatarPreview = document.getElementById("profile-avatar-preview");
    if (avatarPreview) {
      if (user.photo) {
        avatarPreview.innerHTML = `<img src="${user.photo}" alt="Foto de Perfil" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
      } else {
        avatarPreview.innerHTML = `<i class="fa-solid fa-user"></i>`;
      }
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
    await showHome();
  }

  if (target.closest(".nav-btn") && target.textContent.includes("Perfil")) {
    showProfile();
  }

  // --- NAVEGAÇÃO INTERNA (SETAS DE VOLTAR) ---
  if (target.closest(".back-arrow-btn")) {
    await changeForTraining(); // Volta do Treino Ativo para as Bibliotecas
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
      await changeForTraining();
    }
  }

  // --- ABERTURA DE MODAIS DE CRIAÇÃO/EDIÇÃO ---
  // Modal Treino
  if (
    target.closest(".add-new-workout-btn") ||
    target.closest(".add-new-workout")
  ) {
    const modalTitleTreino = document.querySelector("#training-modal-title");
    if (modalTitleTreino) modalTitleTreino.textContent = "Novo Treino";

    const modal = document.querySelector("#training-modal");
    if (modal) {
      modal.classList.add("active");
      modal.classList.remove("hidden");
    }
    uiTraining.clearFormTraining();
  }

  // Modal Exercício a partir da Biblioteca
  if (target.closest(".add-new-exercise-btn")) {
    const modalTitle = document.querySelector("#exercise-modal-title");
    if (modalTitle) modalTitle.textContent = "Novo Exercício";

    const modal = document.querySelector("#exercise-modal");
    if (modal) {
      modal.classList.add("active");
      modal.classList.remove("hidden");
    }
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
    if (modal) {
      modal.classList.add("active");
      modal.classList.remove("hidden");
    }
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
    const modal = document.querySelector("#training-modal");
    if (modal) modal.classList.remove("active");
  }

  if (target.closest("#close-exercise-modal-btn, #cancel-exercise-btn")) {
    const modal = document.querySelector("#exercise-modal");
    if (modal) modal.classList.remove("active");
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
    window.location.reload(); // Recarrega para limpar o estado da aplicação
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
    await showResults();
  }
});

// ==========================================================================
// EVENTOS FIXOS DIRETOS (BOTÕES QUE NÃO SOMEM)
// ==========================================================================

document.addEventListener("click", async (event) => {
  const target = event.target;

  // Se clicou no botão "Treinos" na barra de navegação
  if (
    target.closest(".training-btn") ||
    (target.closest(".nav-btn") && target.textContent.includes("Treinos"))
  ) {
    await changeForTraining();
  }

  // Se clicou no botão "Ir para Treinos" do banner de Aviso (Empty State)
  if (target.closest("#go-to-trainings-btn")) {
    await changeForTraining();
  }
});

// ==========================================================================
// INICIALIZAÇÃO
// ==========================================================================
document.addEventListener("DOMContentLoaded", async () => {
  // Garante que os treinos apareçam na primeira carga
  await uiTraining.renderTrainings();
  startPage();
  await showHome();
});

const btnHambúrguer = document.querySelector(".menu-mobile-btn");
if (btnHambúrguer) {
  btnHambúrguer.addEventListener("click", (event) => {
    event.stopPropagation(); 
    document.querySelector(".nav-menu").classList.toggle("active");
  });
}