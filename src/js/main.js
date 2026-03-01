// ==========================================================================
// IMPORTAÇÕES (Dependências do App)
// ==========================================================================
import apiTraining from "./Training/apiTraining.js";
import uiTraining from "./Training/uiTraining.js";
import apiExercises from "./Exercises/apiExercises.js";
import uiExercises from "./Exercises/uiExercises.js";
import uiLoads from "./Loads/uiLoads.js";
import loadsApi from "./Loads/apiLoads.js";
import { register, login, checkAuth } from "./auth.js";
import { renderDashboard } from "./dashboard.js";
import { checkProfileCompletion, initProfileEvents } from "./profile.js";

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
  initProfileEvents();

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

  // ==========================================================================
  // SALVAR NOVA CARGA NO EXERCÍCIO
  // ==========================================================================
  document.addEventListener("submit", async (event) => {
    // Se o formulário enviado for o de Cargas
    if (event.target.id === "load-form") {
      event.preventDefault();

      const weight = document.querySelector("#load-weight-input").value;
      const reps = document.querySelector("#load-reps-input").value;

      // Descobre qual exercício está aberto na tela agora
      const currentExercise = uiExercises.getCurrentActiveExerciseData();
      const userString = localStorage.getItem("currentUser");
      const user = userString ? JSON.parse(userString) : null;

      if (!currentExercise || !user) {
        alert("Ops! Não conseguimos identificar o exercício ou usuário.");
        return;
      }

      // Monta o pacote para o Banco de Dados
      const newLoad = {
        id: "load_" + new Date().getTime(),
        exerciseId: currentExercise.id,
        userEmail: user.email,
        load: Number(weight),
        reps: Number(reps),
        date: new Date().toISOString(),
      };

      try {
        // Salva no db.json
        await loadsApi.createLoads(newLoad);

        // Limpa os campos digitados
        event.target.reset();

        // Manda desenhar a listinha de novo (com a carga nova)
        uiLoads.renderLoadsForExercise(currentExercise.id);

        uiTraining.showToastTraining("Carga registrada com sucesso! 💪");
      } catch (error) {
        console.error(error);
        alert("Não foi possível salvar a carga. Verifique o console.");
      }
    }
  });
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

  // ==========================================================================
  // DELETAR CARGA (COM AVISO)
  // ==========================================================================

  if (event.target.closest(".delete-load-btn")) {
    event.preventDefault();
    const btn = event.target.closest(".delete-load-btn");
    const loadId = btn.dataset.id;

    // Cria o Modal de Confirmação igual ao de deletar exercício
    const modalOverlay = document.createElement("div");
    modalOverlay.className = "confirm-modal-overlay";
    modalOverlay.innerHTML = `
      <div class="confirm-modal-card">
        <h3 style="color: #dc3545;"><i class="fa-solid fa-triangle-exclamation"></i> Excluir Carga?</h3>
        <p>Tem certeza que deseja apagar este registro do seu histórico?</p>
        <div class="confirm-actions">
          <button id="cancel-load-delete" style="background-color: #f1f1f1; color: #333; border: 1px solid #ddd;">Cancelar</button>
          <button id="confirm-load-delete" class="confirm-delete-btn" style="background-color: #dc3545; color: white;">Excluir</button>
        </div>
      </div>
    `;
    document.body.appendChild(modalOverlay);

    // Se clicar em Cancelar, só remove o aviso
    modalOverlay.querySelector("#cancel-load-delete").onclick = () =>
      modalOverlay.remove();

    // Se confirmar a exclusão
    modalOverlay.querySelector("#confirm-load-delete").onclick = async () => {
      modalOverlay.remove(); // Fecha o aviso
      try {
        await loadsApi.deleteloads(loadId); // Apaga do banco
        // Pega qual exercício tá aberto e manda desenhar a lista de novo
        const currentExercise = uiExercises.getCurrentActiveExerciseData();
        if (currentExercise) {
          uiLoads.renderLoadsForExercise(currentExercise.id);
          uiTraining.showToastTraining("Carga excluída com sucesso! 🗑️");
        }
      } catch (error) {
        alert("Erro ao excluir carga. Erro: ", error);
      }
    };
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

  // Exporta PDF
  if (event.target.closest(".export-pdf-btn")) {
    event.preventDefault();
    exportWorkoutToPDF();
  }

  // EXPORTAR RESULTADOS GERAIS PARA PDF
  if (event.target.closest(".export-results-pdf-btn")) {
    event.preventDefault();
    exportResultsToPDF(); // Chama a nova função
  }
});

// ==========================================================================
// ALERTA DE PERFIL INCOMPLETO
// ==========================================================================

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
// EXPORTAÇÃO PARA PDF TREINOS
// ==========================================================================
export async function exportWorkoutToPDF() {
  // Puxa os dados do treino que está aberto no momento
  const activeTraining = uiTraining.getCurrentActiveTrainingData();
  if (!activeTraining) {
    alert("Nenhum treino ativo para exportar.");
    return;
  }

  // Puxa o nome do Usuário logado
  const userString = localStorage.getItem("currentUser");
  const user = userString ? JSON.parse(userString) : {};
  const userName = user.name || "Usuário";

  // Puxa a lista completa de exercícios para detalhar no PDF
  const allExercises = await apiExercises.getExercises();
  const trainingExIds = activeTraining.exercises || [];
  const fullExercises = allExercises.filter(
    (ex) =>
      trainingExIds.includes(String(ex.id)) || trainingExIds.includes(ex.id),
  );

  // Cria o HTML que será transformado no PDF
  const pdfContainer = document.createElement("div");
  // Estilos inline
  pdfContainer.style.padding = "30px";
  pdfContainer.style.fontFamily = "Arial, sans-serif";
  pdfContainer.style.color = "#333";

  // Monta a lista de exercícios
  let exercisesHTML = "";
  if (fullExercises.length === 0) {
    exercisesHTML = "<p>Nenhum exercício cadastrado nesta ficha.</p>";
  } else {
    fullExercises.forEach((ex, index) => {
      exercisesHTML += `
        <div style="border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 10px;">
            <h4 style="margin: 0 0 5px 0; color: #0056b3; font-size: 16px;">${index + 1}. ${ex.name}</h4>
            <p style="margin: 0; font-size: 13px;"><strong>Alvo:</strong> ${ex.muscle} | <strong>Equipamento:</strong> ${ex.equipment || "Nenhum"}</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; background: #f9f9f9; display: inline-block; padding: 4px 8px; border-radius: 4px;">
              <strong>${ex.series}</strong> Séries x <strong>${ex.repetitions}</strong> Repetições • Carga: <strong>${ex.load}kg</strong>
            </p>
            ${ex.description ? `<p style="margin: 5px 0 0 0; font-size: 12px; color: #666;"><em>Obs: ${ex.description}</em></p>` : ""}
        </div>
      `;
    });
  }

  // Monta a Estrutura do Documento Completo
  pdfContainer.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; color: #333; font-size: 28px; text-transform: uppercase;">${activeTraining.name}</h1>
        <h3 style="margin: 5px 0 0 0; color: #666; font-weight: normal; font-size: 18px;">${activeTraining.subtitle || "Ficha de Treinamento"}</h3>
        <hr style="margin-top: 15px; border: none; border-top: 3px solid #007bff; width: 60px; margin-left: auto; margin-right: auto;">
    </div>
    
    <div style="margin-bottom: 25px; background: #f0f7ff; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff;">
        <p style="font-size: 16px; margin: 0;"><strong>Atleta:</strong> ${userName}</p>
        <p style="font-size: 12px; margin: 5px 0 0 0; color: #555;">Documento gerado automaticamente via GT Treinos.</p>
    </div>
    
    <div>
        <h3 style="background: #333; color: white; padding: 10px 15px; border-radius: 5px; margin-bottom: 15px; font-size: 16px;">
          Relação de Exercícios
        </h3>
        ${exercisesHTML}
    </div>
  `;

  // Configurações da Biblioteca html2pdf
  const opt = {
    margin: 10, // Margem do papel
    filename: `Treino_${activeTraining.name.replace(/\s+/g, "_")}.pdf`, // Nome do arquivo q vai baixar
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true }, // Escala 2 para ficar em alta resolução
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }, // Formato A4
  };

  // Mostra um aviso ao usuário que está gerando
  uiTraining.showToastTraining("Gerando PDF, aguarde... 📄", "warming");

  // Gera o PDF e faz o Download!
  window.html2pdf()
    .set(opt)
    .from(pdfContainer)
    .save()
    .then(() => {
      uiTraining.showToastTraining("PDF baixado com sucesso! ✅");
    });
}

// ==========================================================================
// EXPORTAÇÃO PARA PDF RESULTADOS
// ==========================================================================
export async function exportResultsToPDF() {
  // Puxa os dados do Usuário
  const userText = localStorage.getItem("currentUser");
  const user = userText ? JSON.parse(userText) : {};
  const userName = user.name || "Atleta";

  // Puxa o Histórico e Destaques
  const historyTraining = await apiTraining.getHistory();
  const totalTrainingsDone = historyTraining ? historyTraining.length : 0;

  // Ficha mais feita
  const trainings = await apiTraining.getTrainings();
  let mostCompletedTraining = { name: "Nenhum", times_completed: 0 };
  if (trainings && trainings.length > 0) {
    mostCompletedTraining = trainings.reduce((prev, current) =>
      prev.times_completed > current.times_completed ? prev : current,
    );
  }

  // Exercício mais feito
  const exercises = await apiExercises.getExercises();
  let mostCompletedExercise = { name: "Nenhum", times_completed: 0 };
  if (exercises && exercises.length > 0) {
    mostCompletedExercise = exercises.reduce((prev, current) =>
      prev.times_completed > current.times_completed ? prev : current,
    );
  }

  // Cálculos de Saúde para o PDF
  let tmb = 0,
    imc = 0,
    imcText = "Não calculado";
  if (user.weight && user.height && user.age && user.gender) {
    if (user.gender === "masculino" || user.gender === "outro") {
      tmb = 10 * user.weight + 6.25 * user.height - 5 * user.age + 5;
      if (user.gender === "outro") tmb *= 0.9;
    } else if (user.gender === "feminino") {
      tmb = 10 * user.weight + 6.25 * user.height - 5 * user.age - 161;
    }
    imc = user.weight / (user.height / 100) ** 2;
    switch (true) {
      case imc < 18.5:
        imcText = "Abaixo do peso";
        break;
      case imc >= 18.5 && imc < 25:
        imcText = "Peso normal";
        break;
      case imc >= 25 && imc < 30:
        imcText = "Sobrepeso";
        break;
      case imc >= 30:
        imcText = "Obesidade";
        break;
    }
  }

  // Criação do Layout do PDF (A4 Invisível)
  const pdfContainer = document.createElement("div");
  pdfContainer.style.padding = "30px";
  pdfContainer.style.fontFamily = "Arial, sans-serif";
  pdfContainer.style.color = "#333";

  pdfContainer.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; color: #007bff; font-size: 28px; text-transform: uppercase;">Relatório de Desempenho</h1>
        <h3 style="margin: 5px 0 0 0; color: #666; font-weight: normal; font-size: 16px;">GT Treinos - Acompanhamento de Evolução</h3>
        <hr style="margin-top: 15px; border: none; border-top: 3px solid #007bff; width: 60px; margin-left: auto; margin-right: auto;">
    </div>

    <div style="margin-bottom: 25px; background: #f0f7ff; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff;">
        <p style="font-size: 16px; margin: 0;"><strong>Atleta:</strong> ${userName}</p>
        <p style="font-size: 14px; margin: 5px 0 0 0; color: #555;"><strong>Data de Emissão:</strong> ${new Date().toLocaleDateString("pt-BR")}</p>
    </div>

    <div style="display: flex; gap: 20px; margin-bottom: 20px;">
        <div style="flex: 1; border: 1px solid #ddd; padding: 15px; border-radius: 8px;">
            <h4 style="color: #007bff; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase;">Métricas de Saúde</h4>
            <p style="margin: 5px 0;"><strong>Metabolismo Basal (TMB):</strong> ${Math.round(tmb)} kcal/dia</p>
            <p style="margin: 5px 0;"><strong>IMC Atual:</strong> ${imc.toFixed(1)} (${imcText})</p>
            <p style="margin: 5px 0;"><strong>Peso Registrado:</strong> ${user.weight ? user.weight + " kg" : "Não informado"}</p>
        </div>
        
        <div style="flex: 1; border: 1px solid #ddd; padding: 15px; border-radius: 8px; background: #007bff; color: white;">
            <h4 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; color: #fff;">Consistência Geral</h4>
            <h2 style="margin: 0; font-size: 38px;">${totalTrainingsDone}</h2>
            <p style="margin: 0; font-size: 14px;">Treinos Concluídos no Total</p>
        </div>
    </div>

    <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px;">
        <h4 style="color: #007bff; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase;">Preferências e Destaques</h4>
        <p style="margin: 8px 0; font-size: 15px;"><strong>Ficha Mais Realizada:</strong> ${mostCompletedTraining.name} 
           <span style="color: #666; font-size: 13px;">(${mostCompletedTraining.times_completed || 0} vezes)</span>
        </p>
        <p style="margin: 8px 0; font-size: 15px;"><strong>Exercício Mais Feito:</strong> ${mostCompletedExercise.name} 
           <span style="color: #666; font-size: 13px;">(${mostCompletedExercise.times_completed || 0} vezes)</span>
        </p>
    </div>
  `;

  // Configurações e Geração
  const opt = {
    margin: 15,
    filename: `Meu_Relatorio_GT_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };

  uiTraining.showToastTraining("Gerando PDF dos Resultados... 📊", "warming");

  window.html2pdf()
    .set(opt)
    .from(pdfContainer)
    .save()
    .then(() => {
      uiTraining.showToastTraining("Relatório baixado com sucesso! ✅");
    });
}
