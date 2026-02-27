// ==========================================================================
// IMPORTAÇÕES (Dependências do App)
// ==========================================================================
import apiTraining from "./Training/apiTraining.js";
import uiTraining from "./Training/uiTraining.js";
import apiExercises from "./Exercises/apiExercises.js";
import uiExercises from "./Exercises/uiExercises.js";
import { register, login, checkAuth } from "./auth.js";

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

  // ========================================================================
  // EVENTOS DE FORMULÁRIO: TREINOS
  // ========================================================================
  const trainingForm = document.querySelector("#training-form");
  if (trainingForm) {
    trainingForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      
      const trainingData = uiTraining.getFormDataTraining();
      try {
        if (trainingData.id) {
          await apiTraining.updateTraining(trainingData); // Edita
        } else {
          await apiTraining.createTraining(trainingData); // Cria
        }
        
        uiTraining.clearFormTraining();
        closeAllModals();
        
        const successMessage = trainingData.id ? "Treino atualizado com sucesso!" : "Treino criado com sucesso!";
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
          await apiExercises.updateExercises(exerciseData);
        } else {
          await apiExercises.createExercises(exerciseData);
        }
        
        uiExercises.clearFormExercise();
        closeAllModals();
        
        const successMessage = exerciseData.id ? "Exercício atualizado com sucesso!" : "Exercício criado com sucesso!";
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
  const trainingsSearchInput = document.querySelector("#trainings-search-input");
  if (trainingsSearchInput) {
    trainingsSearchInput.addEventListener("input", (event) => {
      uiTraining.renderTrainings(event.target.value);
    });
  }

  // Pesquisa na Biblioteca de Exercícios
  const exercisesSearchInput = document.querySelector("#exercises-search-input");
  if (exercisesSearchInput) {
    exercisesSearchInput.addEventListener("input", (event) => {
      uiExercises.renderExercises(event.target.value);
    });
  }

  // Lógica Reutilizável: Mostra todos os exercícios nas listas de seleção
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
          
          uiExercises.renderExercisesForSelection(allExercises, targetContainer, selectedIds);
        } catch (error) {
          console.error("Erro ao carregar lista de exercícios:", error);
        }
      }
    });
  };

  // Lógica Reutilizável: Filtra exercícios durante a digitação nos Modais
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

        uiExercises.renderExercisesForSelection(filteredExercises, targetListId, selectedIds);
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
  seeAllInSearch(".add-new-workout-btn, .add-new-workout, .edit-icon, .edit-workout-btn, #exercise-search", listIdForm);

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
        uiTraining.showToastTraining("Conta criada com sucesso! Faça seu login. 🎉");
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
      const newPasswordConfirm = document.querySelector("#profile-password-confirm").value;

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
          const avatarPreview = document.querySelector("#profile-avatar-preview");
          avatarPreview.innerHTML = `<img src="${base64Image}" alt="Foto" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
          
          const users = JSON.parse(localStorage.getItem("users") || "[]");
          let currentUser = JSON.parse(localStorage.getItem("currentUser"));
          const userIndex = users.findIndex((u) => u.email === currentUser.email);

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
      const newPassword = document.querySelector("#recovery-new-password").value;
      const confirmPassword = document.querySelector("#recovery-confirm-password").value;

      if (newPassword !== confirmPassword) {
        alert("Erro! As senhas não coincidem.");
        return;
      }

      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const userIndex = users.findIndex((u) => u.email === email);

      if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem("users", JSON.stringify(users));

        uiTraining.showToastTraining("Senha redefinida com sucesso! Faça seu login. ✅");

        forgotPasswordForm.reset();
        document.querySelector("#forgot-password-modal").classList.remove("active");
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
      uiTraining.addExerciseToExistingTraining(exerciseId, target);
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
    
    uiExercises.renderExercisesForSelection(allExercises, "#select-exercise-list", selectedIds);
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
const btnStartWorkout = document.querySelector('#start-workout-action-btn');
const dualTimersWrapper = document.querySelector('#dual-timers-wrapper');
const mainTimeDisplay = document.querySelector('#main-workout-time');
const restTimeDisplay = document.querySelector('#rest-timer-display');
const btnRestToggle = document.querySelector('#rest-timer-toggle');
const btnRestStop = document.querySelector('#rest-timer-stop');

// Utilitário de formatação de tempo (MM:SS)
function formatTime(totalSeconds) {
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

// Inicia Treino
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

// Play/Pause Descanso
function toggleRestTimer() {
  if (isRestRunning) {
    clearInterval(restTimerInterval);
    isRestRunning = false;
    btnRestToggle.innerHTML = '<i class="fa-solid fa-play"></i>';
  } else {
    isRestRunning = true;
    btnRestToggle.innerHTML = '<i class="fa-solid fa-pause"></i>';
    btnRestStop.classList.remove('hidden');
    
    restTimerInterval = setInterval(() => {
      restSeconds++;
      restTimeDisplay.textContent = formatTime(restSeconds);
    }, 1000);
  }
}

// Parar Descanso
function stopRestTimer() {
  clearInterval(restTimerInterval);
  isRestRunning = false;
  restSeconds = 0;
  restTimeDisplay.textContent = "00:00";
  btnRestToggle.innerHTML = '<i class="fa-solid fa-play"></i>';
  btnRestStop.classList.add('hidden');
}

// ==========================================================================
// MODAIS DE CONFIRMAÇÃO DO TREINO (COMEÇAR E TERMINAR)
// ==========================================================================

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

  modalOverlay.querySelector("#cancel-start").onclick = () => modalOverlay.remove();
  modalOverlay.querySelector("#confirm-start").onclick = () => {
    modalOverlay.remove();
    startMainTimer(); // Só começa se clicar em Bora
  };
}

function confirmFinishWorkout() {
  if (mainSeconds === 0) {
    uiTraining.showToastTraining("Você precisa iniciar o treino primeiro!", "warning");
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

  modalOverlay.querySelector("#cancel-finish").onclick = () => modalOverlay.remove();
  modalOverlay.querySelector("#confirm-finish").onclick = () => {
    modalOverlay.remove();
    finishAndSaveWorkout(); // Só salva e finaliza se clicar em Sim
  };
}

// Listeners Cronômetros (Atualizado com as confirmações)
if(btnStartWorkout) btnStartWorkout.addEventListener('click', confirmStartWorkout);
if(btnRestToggle) btnRestToggle.addEventListener('click', toggleRestTimer);
if(btnRestStop) btnRestStop.addEventListener('click', stopRestTimer);


// ==========================================================================
// FINALIZAR TREINO (AÇÃO PRINCIPAL)
// ==========================================================================
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
      userEmail: user.email
    };
    await apiTraining.saveHistory(historyLog);
  }

  // Atualiza contagem de exercícios concluídos
  const completedBtns = document.querySelectorAll('.check-exercise-btn.completed');
  const updatePromises = [];

  completedBtns.forEach(btn => {
    const exerciseCard = btn.closest('.exercise-item');
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
  btnStartWorkout.classList.remove('hidden');
  dualTimersWrapper.classList.add('hidden');
  dualTimersWrapper.classList.remove('floating-mode');
  
  document.querySelectorAll('.check-exercise-btn').forEach(btn => btn.classList.remove('completed'));

  window.runningWorkoutId = null; 
  runningWorkoutData = null; 
  
  uiTraining.renderTrainings();
  uiTraining.showToastTraining(`Treino finalizado! Duração: ${timeFormatted} ⏱️`);
  
  document.querySelector(".active-workout-section").classList.add("hidden");
  document.querySelector(".workouts-section").classList.remove("hidden");
  document.querySelector(".exercises-library-section").classList.remove("hidden");
}

// Sensor Global: Comportamentos da Tela do Treino (Botão Finalizar e Relógio Flutuante)
document.addEventListener('click', (event) => {
  const target = event.target;
  
  // Finalizar
  if (target.closest('.finish-workout-btn')) {
    confirmFinishWorkout();
  }
  
  // Transforma relógio em flutuante ao sair da tela
  if (target.closest('.back-arrow-btn') || target.closest('.nav-btn') || target.closest('.main-logo')) {
      if (mainSeconds > 0 && dualTimersWrapper) {
        dualTimersWrapper.classList.add('floating-mode');
        document.body.appendChild(dualTimersWrapper);
      }
  }

  // Restaura relógio ao clicar nele
  if (target.closest('#dual-timers-wrapper.floating-mode')) {
      if(target.closest('.timer-btn')) return; 
      
      if (runningWorkoutData) {
         dualTimersWrapper.classList.remove('floating-mode');
         uiTraining.openTraining(runningWorkoutData);
      }
  }
});


// ==========================================================================
// ALERTA DE PERFIL INCOMPLETO
// ==========================================================================
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
    navBtns.forEach(btn => {
      if(btn.textContent.trim() === "Perfil") {
        btn.click();
      }
    });
  });
}