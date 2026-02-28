// ==========================================================================
// IMPORTAÇÕES (Dependências do App)
// ==========================================================================
import apiTraining from "./Training/apiTraining.js";
import uiTraining from "./Training/uiTraining.js";
import apiExercises from "./Exercises/apiExercises.js";
import uiExercises from "./Exercises/uiExercises.js";
import { register, login, checkAuth } from "./auth.js";
import trainingApi from "./Training/apiTraining.js";

// ==========================================================================
// FUNÇÕES UTILITÁRIAS GLOBAIS
// ==========================================================================

// Fecha todos os modais abertos na tela
const closeAllModals = () => {
  const modals = document.querySelectorAll(".modal-container");
  modals.forEach((modal) => modal.classList.remove("active"));
};

// ==========================================================================
// INICIALIZAÇÃO DO APLICATIVO (DOMContentLoaded)
// ==========================================================================
document.addEventListener("DOMContentLoaded", async () => {
  // Verificações de Autenticação e Perfil
  checkProfileCompletion();
  checkAuth();

  // Renderização Inicial
  await uiTraining.renderTrainings();
  await uiExercises.renderExercises();
  renderDashboard();

  // ==========================================================================
  // EVENTOS DE FORMULÁRIO: TREINOS
  // ==========================================================================
  const trainingForm = document.querySelector("#training-form");
  if (trainingForm) {
    trainingForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      // Pega os dados do formulário
      const trainingData = uiTraining.getFormDataTraining();
      try {
        if (trainingData.id) {
          // Busca os dados originais do treino no banco
          const oldTrainingData = await apiTraining.getTrainingById(
            trainingData.id,
          );
          // Mescla os dados
          const mergedTrainingData = { ...oldTrainingData, ...trainingData };
          await apiTraining.updateTraining(mergedTrainingData); // Edita

          const currentActive = uiTraining.getCurrentActiveTrainingData();
          if (currentActive && currentActive.id === trainingData.id) {
            const freshTraining = await apiTraining.getTrainingById(
              trainingData.id,
            );
            uiTraining.openTraining(freshTraining);
          }
        } else {
          // Se não tem ID, é um treino novo
          await apiTraining.createTraining(trainingData);
        }

        // Limpa o formulário e fecha os modais
        uiTraining.clearFormTraining();
        closeAllModals();

        const successMessage = trainingData.id
          ? "Treino atualizado com sucesso!"
          : "Treino criado com sucesso!";
        uiTraining.showToastTraining(successMessage);
        uiTraining.renderTrainings();
      } catch (error) {
        console.error("Erro detalhado:", error);
        alert("Não foi possível salvar: " + error.message);
      }
    });
  }

  const trainingPhotoInput = document.querySelector("#training-photo-input");
  if (trainingPhotoInput) {
    trainingPhotoInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        uiTraining.convertPhoto(file);
      }
    });
  }

  // ========================================================================
  // EVENTOS DE FORMULÁRIO: EXERCÍCIOS
  // ========================================================================
  const exerciseForm = document.querySelector("#exercise-form");
  if (exerciseForm) {
    exerciseForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const exerciseData = uiExercises.getFormDataExercise();
      try {
        if (exerciseData.id) {
          // Busca os dados originais no banco primeiro
          const oldData = await apiExercises.getExercisesById(exerciseData.id);
          // Mescla os antigos (para não perder o times_completed)
          const mergedData = { ...oldData, ...exerciseData };
          // Salva o pacote completo e mesclado
          await apiExercises.updateExercises(mergedData);
          // Se a tela de detalhes do exercício estiver aberta, recarrega ela
          const detailSection = document.querySelector(
            ".active-exercise-details-section",
          );
          if (!detailSection.classList.contains("hidden")) {
            const freshExercise = await apiExercises.getExercisesById(
              exerciseData.id,
            );
            uiExercises.openExercise(freshExercise);
          }
        } else {
          await apiExercises.createExercises(exerciseData);
        }

        uiExercises.clearFormExercise();
        closeAllModals();

        const successMessage = exerciseData.id
          ? "Exercício atualizado com sucesso!"
          : "Exercício criado com sucesso!";
        uiTraining.showToastTraining(successMessage);
        uiExercises.renderExercises();
      } catch (error) {
        console.error("Erro detalhado:", error);
        alert("Não foi possível salvar: " + error.message);
      }
    });
  }

  const exercisePhotoInput = document.querySelector("#exercise-photo-input");
  if (exercisePhotoInput) {
    exercisePhotoInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) uiExercises.convertPhotoExercises(file);
    });
  }

  // ========================================================================
  // EVENTOS DE PESQUISA (BARRAS DE BUSCA)
  // ========================================================================

  // Pesquisa na Biblioteca de Treinos
  const trainingsSearchInput = document.querySelector(
    "#trainings-search-input",
  );
  if (trainingsSearchInput) {
    trainingsSearchInput.addEventListener("input", (event) => {
      uiTraining.renderTrainings(event.target.value);
    });
  }

  // Pesquisa na Biblioteca de Exercícios
  const exercisesSearchInput = document.querySelector(
    "#exercises-search-input",
  );
  if (exercisesSearchInput) {
    exercisesSearchInput.addEventListener("input", (event) => {
      uiExercises.renderExercises(event.target.value);
    });
  }

  // Mostra todos os exercícios nas listas de seleção ao clicar em botões específicos
  const seeAllInSearch = (selector, targetContainer) => {
    document.addEventListener("click", async (event) => {
      if (event.target.closest(selector)) {
        try {
          const allExercises = await apiExercises.getExercises();
          const selectedIds = uiTraining.getCurrentSelectedIds();

          // Ordena para manter selecionados no topo
          allExercises.sort((a, b) => {
            const aSelecionado = selectedIds.includes(a.id);
            const bSelecionado = selectedIds.includes(b.id);
            if (aSelecionado && !bSelecionado) return -1;
            if (!aSelecionado && bSelecionado) return 1;
            return 0;
          });

          uiExercises.renderExercisesForSelection(
            allExercises,
            targetContainer,
            selectedIds,
          );
        } catch (error) {
          console.error("Erro ao carregar lista de exercícios:", error);
        }
      }
    });
  };

  // Filtra exercícios em tempo real durante a digitação nos modais de seleção
  const setupSearchExercise = (inputElement, targetListId) => {
    if (!inputElement) return;

    inputElement.addEventListener("input", async (event) => {
      const term = event.target.value.toLowerCase();
      try {
        const allExercises = await apiExercises.getExercises();
        const selectedIds = uiTraining.getCurrentSelectedIds();

        const filteredExercises = allExercises.filter((exercise) =>
          exercise.name.toLowerCase().includes(term),
        );

        // Ordena para manter selecionados no topo
        filteredExercises.sort((a, b) => {
          const aSelecionado = selectedIds.includes(a.id);
          const bSelecionado = selectedIds.includes(b.id);
          if (aSelecionado && !bSelecionado) return -1;
          if (!aSelecionado && bSelecionado) return 1;
          return 0;
        });

        uiExercises.renderExercisesForSelection(
          filteredExercises,
          targetListId,
          selectedIds,
        );
      } catch (error) {
        console.error("Erro ao filtrar exercícios:", error);
      }
    });
  };

  // Inicializa as pesquisas internas
  const searchInput = document.querySelector("#search-exercise-input");
  const searchInputForm = document.querySelector("#exercise-search");
  const listId = "#available-exercises-list";
  const listIdForm = "#selected-exercises-list-form";

  setupSearchExercise(searchInput, listId);
  setupSearchExercise(searchInputForm, listIdForm);

  seeAllInSearch(".add-exercise-to-workout-btn", listId);
  seeAllInSearch(
    ".add-new-workout-btn, .add-new-workout, .edit-icon, .edit-workout-btn, #exercise-search",
    listIdForm,
  );

  // ========================================================================
  // AUTENTICAÇÃO (LOGIN E CADASTRO)
  // ========================================================================

  // Login
  const loginForm = document.querySelector("#login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = document.querySelector("#login-email").value;
      const password = document.querySelector("#login-password").value;

      if (login(email, password)) {
        checkAuth();
        console.log("Login realizado com sucesso!");
        // Força renderização da página inicial
        const logo = document.querySelector(".main-logo");
        if (logo) logo.click();
      } else {
        alert("E-mail ou senha incorretos. Tente novamente! ");
      }
    });
  }

  // Cadastro
  const registerForm = document.querySelector("#register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = document.querySelector("#register-name").value;
      const email = document.querySelector("#register-email").value;
      const password = document.querySelector("#register-password").value;

      const response = register(name, email, password);
      if (response.success) {
        uiTraining.showToastTraining(
          "Conta criada com sucesso! Faça seu login. 🎉",
        );
        registerForm.reset();
        document.querySelector("#register-section").classList.add("hidden");
        document.querySelector("#login-section").classList.remove("hidden");
      } else {
        alert(response.message);
      }
    });
  }

  // ========================================================================
  // PERFIL DO USUÁRIO E CONFIGURAÇÕES
  // ========================================================================

  // Salvando dados do Perfil
  const profileForm = document.querySelector("#profile-form");
  if (profileForm) {
    profileForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = document.querySelector("#profile-name").value;
      const weight = document.querySelector("#profile-weight").value;
      const height = document.querySelector("#profile-height").value;
      const goal = document.querySelector("#profile-goal").value;
      const age = document.querySelector("#profile-age").value;
      const gender = document.querySelector("#profile-gender").value;
      const newPassword = document.querySelector("#profile-password").value;
      const newPasswordConfirm = document.querySelector(
        "#profile-password-confirm",
      ).value;

      const users = JSON.parse(localStorage.getItem("users") || "[]");
      let currentUser = JSON.parse(localStorage.getItem("currentUser"));

      const userIndex = users.findIndex((u) => u.email === currentUser.email);
      if (userIndex !== -1) {
        users[userIndex].name = name;
        users[userIndex].weight = weight;
        users[userIndex].height = height;
        users[userIndex].goal = goal;
        users[userIndex].age = age;
        users[userIndex].gender = gender;

        // Alteração de Senha
        if (newPassword.trim() !== "") {
          if (newPassword === newPasswordConfirm) {
            users[userIndex].password = newPassword;
            document.querySelector("#profile-password").value = "";
            document.querySelector("#profile-password-confirm").value = "";
          } else {
            uiTraining.showToastTraining("Erro! Senhas diferentes!", "error");
            document.querySelector("#profile-password").value = "";
            document.querySelector("#profile-password-confirm").value = "";
            return;
          }
        }

        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("currentUser", JSON.stringify(users[userIndex]));

        uiTraining.showToastTraining("Perfil atualizado com sucesso! ✅");
        document.getElementById("hero-display-name").textContent = name;

        // Remove alerta se tudo estiver preenchido
        checkProfileCompletion();
      }
    });
  }

  // Upload de Foto de Perfil
  const profilePhotoInput = document.querySelector("#profile-photo-input");
  if (profilePhotoInput) {
    profilePhotoInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64Image = e.target.result;
          const avatarPreview = document.querySelector(
            "#profile-avatar-preview",
          );
          avatarPreview.innerHTML = `<img src="${base64Image}" alt="Foto" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;

          const users = JSON.parse(localStorage.getItem("users") || "[]");
          let currentUser = JSON.parse(localStorage.getItem("currentUser"));
          const userIndex = users.findIndex(
            (u) => u.email === currentUser.email,
          );

          if (userIndex !== -1) {
            users[userIndex].photo = base64Image;
            currentUser.photo = base64Image;
            localStorage.setItem("users", JSON.stringify(users));
            localStorage.setItem("currentUser", JSON.stringify(currentUser));
            uiTraining.showToastTraining("Foto atualizada com sucesso! 📸");
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // ========================================================================
  // RECUPERAÇÃO DE SENHA
  // ========================================================================
  const forgotPasswordForm = document.querySelector("#forgot-password-form");
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const email = document.querySelector("#recovery-email").value;
      const newPassword = document.querySelector(
        "#recovery-new-password",
      ).value;
      const confirmPassword = document.querySelector(
        "#recovery-confirm-password",
      ).value;

      if (newPassword !== confirmPassword) {
        alert("Erro! As senhas não coincidem.");
        return;
      }

      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const userIndex = users.findIndex((u) => u.email === email);

      if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem("users", JSON.stringify(users));

        uiTraining.showToastTraining(
          "Senha redefinida com sucesso! Faça seu login. ✅",
        );

        forgotPasswordForm.reset();
        document
          .querySelector("#forgot-password-modal")
          .classList.remove("active");
      } else {
        alert("E-mail não encontrado! Verifique se digitou corretamente.");
      }
    });
  }
});

// ==========================================================================
// DELEGAÇÃO DE CLIQUES GLOBAIS (SELEÇÃO DE EXERCÍCIOS)
// ==========================================================================

// Captura cliques nos botões de adicionar (+) nas listas de seleção
document.addEventListener("click", async (event) => {
  const target = event.target.closest(".selectable-exercise-add-btn");
  if (target) {
    event.preventDefault();
    const exerciseId = target.dataset.id;
    const isFromSelectModal = target.closest("#select-exercise-modal");

    if (isFromSelectModal) {
      await uiTraining.addExerciseToExistingTraining(exerciseId, target);
      // Recarrega o treino no fundo para o exercício aparecer na hora na tela
      const currentActive = uiTraining.getCurrentActiveTrainingData();
      if (currentActive) {
        uiTraining.openTraining(currentActive);
      }
    } else {
      uiTraining.addExerciseToSelection(exerciseId, target);
    }

    // Re-ordena e re-renderiza a lista para manter atualizada
    const allExercises = await apiExercises.getExercises();
    const selectedIds = uiTraining.getCurrentSelectedIds();

    allExercises.sort((a, b) => {
      const aSel = selectedIds.includes(a.id);
      const bSel = selectedIds.includes(b.id);
      return aSel === bSel ? 0 : aSel ? -1 : 1;
    });

    uiExercises.renderExercisesForSelection(
      allExercises,
      "#select-exercise-list",
      selectedIds,
    );
  }
});

// ==========================================================================
// SISTEMA DE CRONÔMETROS E EXECUÇÃO DE TREINO
// ==========================================================================

window.runningWorkoutId = null;
let runningWorkoutData = null;

let mainTimerInterval = null;
let mainSeconds = 0;

let restTimerInterval = null;
let restSeconds = 0;
let isRestRunning = false;

// Elementos da UI (Cronômetros)
const btnStartWorkout = document.querySelector("#start-workout-action-btn");
const dualTimersWrapper = document.querySelector("#dual-timers-wrapper");
const mainTimeDisplay = document.querySelector("#main-workout-time");
const restTimeDisplay = document.querySelector("#rest-timer-display");
const btnRestToggle = document.querySelector("#rest-timer-toggle");
const btnRestStop = document.querySelector("#rest-timer-stop");

// Formata segundos para o formato MM:SS
function formatTime(totalSeconds) {
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

// Inicia o cronômetro principal do treino
function startMainTimer() {
  btnStartWorkout.classList.add("hidden");
  dualTimersWrapper.classList.remove("hidden");

  runningWorkoutData = uiTraining.getCurrentActiveTrainingData();
  if (runningWorkoutData) {
    window.runningWorkoutId = runningWorkoutData.id;
  }

  uiTraining.renderTrainings();

  mainTimerInterval = setInterval(() => {
    mainSeconds++;
    mainTimeDisplay.textContent = formatTime(mainSeconds);
  }, 1000);
}

// Alterna entre iniciar e pausar o cronômetro de descanso
function toggleRestTimer() {
  if (isRestRunning) {
    clearInterval(restTimerInterval);
    isRestRunning = false;
    btnRestToggle.innerHTML = '<i class="fa-solid fa-play"></i>';
  } else {
    isRestRunning = true;
    btnRestToggle.innerHTML = '<i class="fa-solid fa-pause"></i>';
    btnRestStop.classList.remove("hidden");

    restTimerInterval = setInterval(() => {
      restSeconds++;
      restTimeDisplay.textContent = formatTime(restSeconds);
    }, 1000);
  }
}

// Para e reseta o cronômetro de descanso
function stopRestTimer() {
  clearInterval(restTimerInterval);
  isRestRunning = false;
  restSeconds = 0;
  restTimeDisplay.textContent = "00:00";
  btnRestToggle.innerHTML = '<i class="fa-solid fa-play"></i>';
  btnRestStop.classList.add("hidden");
}

// ==========================================================================
// MODAIS DE CONFIRMAÇÃO DO TREINO (COMEÇAR E TERMINAR)
// ==========================================================================

// Exibe modal de confirmação antes de iniciar o treino
function confirmStartWorkout() {
  const modalOverlay = document.createElement("div");
  modalOverlay.className = "confirm-modal-overlay";
  modalOverlay.innerHTML = `
    <div class="confirm-modal-card">
      <div class="confirm-icon" style="color: var(--primary-color);"><i class="fa-solid fa-play"></i></div>
      <h3 style="color: var(--primary-color);">Começar o Treino?</h3>
      <p>Prepare sua garrafa d'água e dê o seu melhor!</p>
      <div class="confirm-actions">
        <button id="cancel-start" style="background-color: #f1f1f1; color: #333; border: 1px solid #ddd;">Agora não</button>
        <button id="confirm-start" class="primary-btn" style="border: none;">Bora!</button>
      </div>
    </div>
  `;
  document.body.appendChild(modalOverlay);

  modalOverlay.querySelector("#cancel-start").onclick = () =>
    modalOverlay.remove();
  modalOverlay.querySelector("#confirm-start").onclick = () => {
    modalOverlay.remove();
    startMainTimer(); // Só começa se clicar em Bora
  };
}

// Exibe modal de confirmação para finalizar o treino
function confirmFinishWorkout() {
  if (mainSeconds === 0) {
    uiTraining.showToastTraining(
      "Você precisa iniciar o treino primeiro!",
      "warning",
    );
    return;
  }

  const modalOverlay = document.createElement("div");
  modalOverlay.className = "confirm-modal-overlay";
  modalOverlay.innerHTML = `
    <div class="confirm-modal-card">
      <div class="confirm-icon" style="color: #27ae60;"><i class="fa-solid fa-flag-checkered"></i></div>
      <h3 style="color: var(--primary-color);">Finalizar Treino?</h3>
      <p>Tem certeza que deseja encerrar e salvar este treino no histórico?</p>
      <div class="confirm-actions">
        <button id="cancel-finish" style="background-color: #f1f1f1; color: #333; border: 1px solid #ddd;">Continuar treinando</button>
        <button id="confirm-finish" style="background-color: #27ae60; color: white; border: none; font-weight: bold; border-radius: 10px; padding: 12px; cursor: pointer; transition: 0.3s; flex: 1;">Sim, finalizar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modalOverlay);

  modalOverlay.querySelector("#cancel-finish").onclick = () =>
    modalOverlay.remove();
  modalOverlay.querySelector("#confirm-finish").onclick = () => {
    modalOverlay.remove();
    finishAndSaveWorkout(); // Só salva e finaliza se clicar em Sim
  };
}

// Listeners Cronômetros (Atualizado com as confirmações)
if (btnStartWorkout)
  btnStartWorkout.addEventListener("click", confirmStartWorkout);
if (btnRestToggle) btnRestToggle.addEventListener("click", toggleRestTimer);
if (btnRestStop) btnRestStop.addEventListener("click", stopRestTimer);

// ==========================================================================
// FINALIZAR TREINO (AÇÃO PRINCIPAL)
// ==========================================================================
// Encerra o treino, salva no histórico e atualiza contadores de exercícios
async function finishAndSaveWorkout() {
  clearInterval(mainTimerInterval);
  clearInterval(restTimerInterval);

  const totalMinutes = Math.floor(mainSeconds / 60);
  const timeFormatted = formatTime(mainSeconds);

  const user = JSON.parse(localStorage.getItem("currentUser"));
  const activeTraining = uiTraining.getCurrentActiveTrainingData();

  // Salva no Histórico
  if (activeTraining) {
    const historyLog = {
      id: "log_" + new Date().getTime(),
      date: new Date().toISOString(),
      training_id: activeTraining.id,
      training_name: activeTraining.name,
      duration_minutes: totalMinutes,
      userEmail: user.email,
    };
    await apiTraining.saveHistory(historyLog);

    try {
      const trainingDataDb = await apiTraining.getTrainingById(
        activeTraining.id,
      );
      if (trainingDataDb) {
        let currentTrainingMade = parseInt(trainingDataDb.times_completed || 0);
        trainingDataDb.times_completed = currentTrainingMade + 1;
        await apiTraining.updateTraining(trainingDataDb);
      }
    } catch (error) {
      console.error("Erro ao atualizar a contagem do treino:", error);
    }
  }

  // Atualiza contagem de exercícios concluídos
  const completedBtns = document.querySelectorAll(
    ".check-exercise-btn.completed",
  );
  const updatePromises = [];

  completedBtns.forEach((btn) => {
    const exerciseCard = btn.closest(".exercise-item");
    if (!exerciseCard) return;

    const exerciseId = exerciseCard.dataset.id;

    const updateTask = async () => {
      try {
        const exData = await apiExercises.getExercisesById(exerciseId);
        if (exData) {
          let currentMade = parseInt(exData.times_completed || 0);
          exData.times_completed = currentMade + 1;
          await apiExercises.updateExercises(exData);
        }
      } catch (error) {
        console.error("Erro ao atualizar a contagem:", error);
      }
    };
    updatePromises.push(updateTask());
  });

  await Promise.all(updatePromises);

  // Reseta UI
  mainSeconds = 0;
  restSeconds = 0;
  isRestRunning = false;
  mainTimeDisplay.textContent = "00:00";
  restTimeDisplay.textContent = "00:00";
  btnStartWorkout.classList.remove("hidden");
  dualTimersWrapper.classList.add("hidden");
  dualTimersWrapper.classList.remove("floating-mode");

  document
    .querySelectorAll(".check-exercise-btn")
    .forEach((btn) => btn.classList.remove("completed"));

  window.runningWorkoutId = null;
  runningWorkoutData = null;

  uiTraining.renderTrainings();
  uiTraining.showToastTraining(
    `Treino finalizado! Duração: ${timeFormatted} ⏱️`,
  );

  document.querySelector(".active-workout-section").classList.add("hidden");
  document.querySelector(".workouts-section").classList.remove("hidden");
  document
    .querySelector(".exercises-library-section")
    .classList.remove("hidden");
}

// Sensor Global: Comportamentos da Tela do Treino (Botão Finalizar e Relógio Flutuante)
document.addEventListener("click", (event) => {
  const target = event.target;

  // Finalizar
  if (target.closest(".finish-workout-btn")) {
    confirmFinishWorkout();
  }

  // Transforma relógio em flutuante ao sair da tela
  if (
    target.closest(".back-arrow-btn") ||
    target.closest(".nav-btn") ||
    target.closest(".main-logo")
  ) {
    if (mainSeconds > 0 && dualTimersWrapper) {
      dualTimersWrapper.classList.add("floating-mode");
      document.body.appendChild(dualTimersWrapper);
    }
  }

  // Restaura relógio ao clicar nele
  if (target.closest("#dual-timers-wrapper.floating-mode")) {
    if (target.closest(".timer-btn")) return;

    if (runningWorkoutData) {
      dualTimersWrapper.classList.remove("floating-mode");
      uiTraining.openTraining(runningWorkoutData);
    }
  }
});

// ==========================================================================
// ALERTA DE PERFIL INCOMPLETO
// ==========================================================================
// Verifica se o perfil do usuário está completo e mostra alerta se houver campos faltando
export function checkProfileCompletion() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) return;

  const alertContainer = document.querySelector("#profile-alert-container");
  if (!alertContainer) return;

  const isComplete =
    currentUser.age &&
    currentUser.gender &&
    currentUser.weight &&
    currentUser.height &&
    currentUser.goal;

  if (!isComplete) {
    alertContainer.classList.remove("hidden");
  } else {
    alertContainer.classList.add("hidden");
  }

  document.querySelector("#profile-name").value = currentUser.name || "";
  document.querySelector("#profile-email").value = currentUser.email || "";
  document.querySelector("#profile-weight").value = currentUser.weight || "";
  document.querySelector("#profile-height").value = currentUser.height || "";
  document.querySelector("#profile-goal").value = currentUser.goal || "";
  document.querySelector("#profile-age").value = currentUser.age || "";
  document.querySelector("#profile-gender").value = currentUser.gender || "";
}

// Botão do alerta leva para Perfil
const goToProfileBtn = document.querySelector("#go-to-profile-alert-btn");
if (goToProfileBtn) {
  goToProfileBtn.addEventListener("click", () => {
    const navBtns = document.querySelectorAll(".nav-btn");
    navBtns.forEach((btn) => {
      if (btn.textContent.trim() === "Perfil") {
        btn.click();
      }
    });
  });
}

// ==========================================================================

// Capturando data e hora do último treino realizado
const historyTraining = await trainingApi.getHistory();
if (historyTraining && historyTraining.length > 0) {
  const lastTraining = historyTraining[historyTraining.length - 1];
  // Data
  const date = new Date(lastTraining.date);
  const formattedDate = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  console.log("Dia do último treino", formattedDate);
  // Hora
  const formattedTime = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  console.log("Hora do último treino", formattedTime);

  // Treino sugerido
  let sugestedTraining = lastTraining;
  if (historyTraining.length > 1) {
    let randomIndex = Math.floor(Math.random() * (historyTraining.length - 1));
    if (historyTraining[randomIndex] === lastTraining) {
      if (randomIndex === 0) {
        randomIndex++;
      } else {
        randomIndex--;
      }
    }
    sugestedTraining = historyTraining[randomIndex];
  }
  console.log("Treino sugerido para hoje:", sugestedTraining.training_name);
}

// Capturando os últimos 7 dias
const lastDays = [];
for (let i = 0; i < 7; i++) {
  let dataObj = new Date();
  dataObj.setDate(dataObj.getDate() - i);
  const dataFormatada = dataObj.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  lastDays.push(dataFormatada);
}
// Inverte a lista para ficar do dia mais antigo para o de hoje
lastDays.reverse();
// Extraindo e formatando as datas do histórico
const trainingDates = historyTraining.map((treino) => {
  const dataDoTreino = new Date(treino.date); // Transforma a string do JSON em Data
  return dataDoTreino.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
});
// O usuário treinou nesses últimos 7 dias?
const resumoSemana = lastDays.map((dia) => {
  // Verifica se o dia atual do laço existe dentro das datas treinadas
  const treinouNesseDia = trainingDates.includes(dia);
  return {
    data: dia,
    treinou: treinouNesseDia,
  };
});

for (let i = 0; i < resumoSemana.length; i++) {
  const dataString = resumoSemana[i].data; // Ex: "28/02/2026"
  // Dividimos a string pela barra
  const [dia, mes, ano] = dataString.split("/");
  const dataObjeto = new Date(ano, mes - 1, dia);
  let diaSemana = dataObjeto.toLocaleDateString("pt-BR", { weekday: "long" });

  diaSemana = diaSemana.split("-")[0];
  diaSemana = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);

  const icone = resumoSemana[i].treinou ? "✅" : "❌";
  console.log(`${diaSemana}: ${icone}`);
}

// Capturando quantos treinos já foram realizados
const totalTrainingsDone = historyTraining ? historyTraining.length : 0;
console.log("Total de treinos realizados:", totalTrainingsDone);

// Capturando o treino mais completado
const trainings = await apiTraining.getTrainings();
if (trainings && trainings.length > 0) {
  let mostCompleted = trainings[0];
  for (let i = 1; i < trainings.length; i++) {
    if (trainings[i].times_completed > mostCompleted.times_completed) {
      mostCompleted = trainings[i];
    }
  }
  console.log(
    "Treino mais completado:",
    mostCompleted.name,
    "com",
    mostCompleted.times_completed,
  );
}

// ==========================================================================

// Capturando o exercício mais completado
const exercises = await apiExercises.getExercises();
if (exercises && exercises.length > 0) {
  let mostCompleted = exercises[0];
  for (let i = 1; i < exercises.length; i++) {
    if (exercises[i].times_completed > mostCompleted.times_completed) {
      mostCompleted = exercises[i];
    }
  }
  console.log(
    "Exercício mais completado:",
    mostCompleted.name,
    "com",
    mostCompleted.times_completed,
  );
}

// ==========================================================================

// Calculando a Taxa Metabólica Basal a o Índice de Massa Corporal
const userText = localStorage.getItem("currentUser");
if (userText) {
  const user = JSON.parse(userText);
  // Calculando a Taxa Metabólica Basal
  if (user.weight && user.height && user.age && user.gender) {
    let tmb = 0;
    if (user.gender === "masculino" || user.gender === "outro") {
      const tmbM = 10 * user.weight + 6.25 * user.height - 5 * user.age + 5;
      user.gender === "masculino" ? (tmb = tmbM) : (tmb = tmbM * 0.9); // Reduz 10% para outros gêneros
    } else if (user.gender === "feminino") {
      tmb = 10 * user.weight + 6.25 * user.height - 5 * user.age - 161;
    }
    console.log(
      "Taxa Metabólica Basal (TMB) estimada:",
      Math.round(tmb),
      "kcal/dia",
    );
  } else {
    console.log(
      "Dados insuficientes para calcular a TMB. Preencha peso, altura, idade e gênero no perfil.",
    );
  }

  // Calculando o Índice de Massa Corporal
  if (user.weight && user.height) {
    const IMC = user.weight / (user.height / 100) ** 2;
    console.log("Índice de Massa Corporal (IMC) estimado:", IMC.toFixed(2));
    switch (true) {
      case IMC < 18.5:
        console.log("Você está abaixo do peso");
        break;
      case IMC >= 18.5 && IMC < 25:
        console.log("Você está com peso normal");
        break;
      case IMC >= 25 && IMC < 30:
        console.log("Você está com sobrepeso");
        break;
      case IMC >= 30:
        console.log("Você está com obesidade");
        break;
      default:
        console.log("Não foi possível calcular o IMC");
    }
  } else {
    console.log(
      "Dados insuficientes para calcular a TMB. Preencha peso, altura, idade e gênero no perfil.",
    );
  }
}

// Função para desenhar a Home e a aba de Resultados
export async function renderDashboard() {
  const historyTraining = await apiTraining.getHistory();
  const totalTrainingsDone = historyTraining ? historyTraining.length : 0;

  const homeDashboard = document.getElementById("home-dashboard");
  const resultsContent = document.getElementById("results-content-area");

  // ==========================================================================
  // VALIDAÇÃO: SE NÃO TIVER TREINOS
  // ==========================================================================
  if (totalTrainingsDone === 0) {
    const semTreinoHTML = `
      <div class="empty-state-banner">
        <h4>Nenhum treino realizado ainda 😴</h4>
        <p>Comece sua jornada agora mesmo e acompanhe seus resultados aqui.</p>
        <button class="action-btn" id="go-to-trainings-btn">Ir para Treinos</button>
      </div>
    `;
    homeDashboard.innerHTML = semTreinoHTML;
    if (resultsContent) resultsContent.innerHTML = semTreinoHTML;
    document.querySelectorAll("#go-to-trainings-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelector(".training-btn").click();
      });
    });
    return;
  }

  // ==========================================================================
  // LÓGICA DE DADOS 
  // ==========================================================================
  const lastTrainingLog = historyTraining[historyTraining.length - 1];
  const date = new Date(lastTrainingLog.date);
  const formattedDate = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  let sugestedTrainingLog = lastTrainingLog;
  if (historyTraining.length > 1) {
    let randomIndex = Math.floor(Math.random() * (historyTraining.length - 1));
    if (historyTraining[randomIndex] === lastTrainingLog)
      randomIndex === 0 ? randomIndex++ : randomIndex--;
    sugestedTrainingLog = historyTraining[randomIndex];
  }

  const lastTrainingData = await apiTraining.getTrainingById(lastTrainingLog.training_id);
  const sugestedTrainingData = await apiTraining.getTrainingById(sugestedTrainingLog.training_id);

  const lastDays = [];
  for (let i = 0; i < 7; i++) {
    let dataObj = new Date();
    dataObj.setDate(dataObj.getDate() - i);
    const dataFormatada = dataObj.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    lastDays.push({ obj: dataObj, formatada: dataFormatada });
  }
  lastDays.reverse();

  const trainingDates = historyTraining.map((t) =>
    new Date(t.date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
  );

  let weekHTML = '<ul class="compact-week-list">';
  lastDays.forEach((diaInfo) => {
    const treinouNesseDia = trainingDates.includes(diaInfo.formatada);
    let diaSemana = diaInfo.obj.toLocaleDateString("pt-BR", {
      weekday: "long",
    });
    diaSemana =
      diaSemana.charAt(0).toUpperCase() + diaSemana.split("-")[0].slice(1);

    let nomeTreinoFeito = "";
    if (treinouNesseDia) {
      const treinoDoDia = historyTraining.find(
        (t) =>
          new Date(t.date).toLocaleDateString("pt-BR") === diaInfo.formatada,
      );
      if (treinoDoDia)
        nomeTreinoFeito = `<span class="day-training-name">${treinoDoDia.training_name}</span>`;
    }

    const iconClass = treinouNesseDia ? "done" : "missed";
    const iconSymbol = treinouNesseDia
      ? '<i class="fa-solid fa-circle-check"></i>'
      : '<i class="fa-regular fa-circle"></i>';

    weekHTML += `
      <li class="compact-day-item ${iconClass}">
        <div class="day-left">${iconSymbol} <span>${diaSemana}</span></div>
        ${nomeTreinoFeito}
      </li>
    `;
  });
  weekHTML += "</ul>";

  let mostCompletedTraining = null;
  const trainings = await apiTraining.getTrainings();
  if (trainings && trainings.length > 0) {
    mostCompletedTraining = trainings[0];
    for (let i = 1; i < trainings.length; i++) {
      if (
        (trainings[i].times_completed || 0) >
        (mostCompletedTraining.times_completed || 0)
      )
        mostCompletedTraining = trainings[i];
    }
  }

  let mostCompletedExercise = null;
  const exercises = await apiExercises.getExercises();
  if (exercises && exercises.length > 0) {
    mostCompletedExercise = exercises[0];
    for (let i = 1; i < exercises.length; i++) {
      if (
        (exercises[i].times_completed || 0) >
        (mostCompletedExercise.times_completed || 0)
      )
        mostCompletedExercise = exercises[i];
    }
  }

  const userText = localStorage.getItem("currentUser");
  let healthHTML = "";
  if (userText) {
    const user = JSON.parse(userText);
    if (user.weight && user.height && user.age && user.gender) {
      let tmb = 0;
      if (user.gender === "masculino" || user.gender === "outro") {
        const tmbM = 10 * user.weight + 6.25 * user.height - 5 * user.age + 5;
        tmb = user.gender === "masculino" ? tmbM : tmbM * 0.9;
      } else if (user.gender === "feminino") {
        tmb = 10 * user.weight + 6.25 * user.height - 5 * user.age - 161;
      }

      const IMC = user.weight / (user.height / 100) ** 2;
      let imcText = "";
      let imcColor = "";
      switch (true) {
        case IMC < 18.5:
          imcText = "Abaixo do peso";
          imcColor = "#ffc107";
          break;
        case IMC >= 18.5 && IMC < 25:
          imcText = "Peso normal";
          imcColor = "#28a745";
          break;
        case IMC >= 25 && IMC < 30:
          imcText = "Sobrepeso";
          imcColor = "#fd7e14";
          break;
        case IMC >= 30:
          imcText = "Obesidade";
          imcColor = "#dc3545";
          break;
      }

      healthHTML = `
        <div class="health-card" style="border-left: 5px solid #007bff;">
          <span class="stat-title">TMB Estimada</span>
          <span class="stat-value" style="color: #007bff;">${Math.round(tmb)} <span style="font-size: 0.9rem; color: #888;">kcal/dia</span></span>
        </div>
        <div class="health-card" style="border-left: 5px solid ${imcColor};">
          <span class="stat-title">IMC (${IMC.toFixed(1)})</span>
          <span class="stat-value" style="color: ${imcColor};">${imcText}</span>
        </div>
      `;
    } else {
      healthHTML = `
        <div class="empty-state-banner error">
          <h4>Dados Incompletos ⚠️</h4>
          <p>Preencha peso, altura, idade e gênero no perfil.</p>
          <button class="action-btn" id="go-to-profile-btn" style="background: #dc3545;">Completar Perfil</button>
        </div>
      `;
    }
  }

  // ==========================================================================
  // INJETANDO NA HOME
  // ==========================================================================
  document.getElementById("home-weekly-tracker").innerHTML = weekHTML;

  // ==========================================================================
  // INJETANDO NA ABA DE RESULTADOS (LAYOUT BALANCEADO)
  // ==========================================================================
  if (resultsContent) {
    resultsContent.innerHTML = `
      <div class="results-layout-column">
        <h3 class="results-topic-title">Frequência da Semana</h3>
        <div class="dashboard-card shadow-card">
          ${weekHTML}
        </div>

        <h3 class="results-topic-title">Último Treino</h3>
        <p class="highlight-times-text" style="margin-bottom: 5px;">Concluído em ${formattedDate} às ${formattedTime}</p>
        <div id="results-last-training-container" class="card-injection-area"></div>
      </div>

      <div class="results-layout-column">
        <h3 class="results-topic-title" style="margin-top: 0;">Visão Geral</h3>
        <div class="highlight-box">
          <p class="highlight-label">Total de Treinos</p>
          <h4>${totalTrainingsDone}</h4>
        </div>

        <h3 class="results-topic-title">Meus Favoritos</h3>
        <p id="results-favorite-training-times" class="highlight-times-text"></p>
        <div id="results-favorite-training-container" class="card-injection-area"></div>
        
        <p id="results-favorite-exercise-times" class="highlight-times-text" style="margin-top: 10px;"></p>
        <div id="results-favorite-exercise-container" class="card-injection-area exercise-injection"></div>

        <h3 class="results-topic-title">Minha Saúde</h3>
        <div class="health-stats-container shadow-card">
          ${healthHTML}
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // INJEÇÃO DOS CARDS NATIVOS
  // ==========================================================================
  const injectCard = (containerId, data, renderFunction, originalGridId) => {
    const container = document.getElementById(containerId);
    if (!container || !data) return;

    // Acha a grade original (seja Treino ou Exercício) e troca o ID dela temporariamente
    const realGrid = document.getElementById(originalGridId);
    if (realGrid) realGrid.id = originalGridId + "-temp-hidden";

    // Transforma o nosso contêiner vazio na "grade falsa"
    container.innerHTML = `<div id="${originalGridId}" style="width: 100%; display: flex; flex-direction: column; gap: 10px;"></div>`;

    // Chama a SUA função original (ela vai achar a grade falsa que acabamos de criar)
    renderFunction(data);

    // Renomeia nossa grade falsa para não dar conflito no resto do site
    const fakeGrid = container.querySelector(`#${originalGridId}`);
    if (fakeGrid) fakeGrid.id = `injected-${containerId}`;

    // Devolve o ID original para a biblioteca real voltar a funcionar
    if (realGrid) realGrid.id = originalGridId;
  };

  // Injetando na Home
  injectCard(
    "home-last-training-container",
    lastTrainingData,
    uiTraining.addTrainingToList.bind(uiTraining),
    "workouts-grid",
  );
  injectCard(
    "home-suggested-training-container",
    sugestedTrainingData,
    uiTraining.addTrainingToList.bind(uiTraining),
    "workouts-grid",
  );

  // Injetando na aba Resultados
  if (lastTrainingData) {
    injectCard(
      "results-last-training-container",
      lastTrainingData,
      uiTraining.addTrainingToList.bind(uiTraining),
      "workouts-grid",
    );
  }

  if (mostCompletedTraining && mostCompletedTraining.times_completed > 0) {
    const timeText = document.getElementById("results-favorite-training-times");
    if (timeText)
      timeText.textContent = `Ficha realizada ${mostCompletedTraining.times_completed} vezes`;
    injectCard(
      "results-favorite-training-container",
      mostCompletedTraining,
      uiTraining.addTrainingToList.bind(uiTraining),
      "workouts-grid",
    );
  }

  if (mostCompletedExercise && mostCompletedExercise.times_completed > 0) {
    const timeTextEx = document.getElementById(
      "results-favorite-exercise-times",
    );
    if (timeTextEx)
      timeTextEx.textContent = `Exercício feito ${mostCompletedExercise.times_completed} vezes`;
    injectCard(
      "results-favorite-exercise-container",
      mostCompletedExercise,
      uiExercises.addExerciseToList.bind(uiExercises),
      "exercises-list",
    );
  }

  // Evento do botão de perfil caso faltem dados
  const btnProfile = document.getElementById("go-to-profile-btn");
  if (btnProfile) {
    btnProfile.addEventListener("click", () => {
      document.querySelectorAll(".nav-btn").forEach((btn) => {
        if (btn.textContent.includes("Perfil")) btn.click();
      });
    });
  }
}