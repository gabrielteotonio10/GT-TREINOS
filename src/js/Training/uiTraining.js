import trainingApi from "./apiTraining.js";
import apiExercises from "../Exercises/apiExercises.js";
import uiExercises from "../Exercises/uiExercises.js";

// ==========================================================================
// VARIÁVEIS GLOBAIS DE ESTADO DO TREINO
// ==========================================================================
let convertedPhoto = "";                
let selectedExercisesIds = [];          
let currentActiveTraining = null;       

const uiTraining = {

  // ==========================================================================
  // UPLOAD E CONVERSÃO DE IMAGEM
  // ==========================================================================
  convertPhoto(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const MAX_WIDTH = 400;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        convertedPhoto = canvas.toDataURL("image/jpeg", 0.7);
        console.log("Foto redimensionada e pronta!");
        
        // Desmarca ícones
        document.querySelectorAll('input[name="training-icon"]').forEach(r => r.checked = false);
        
        const uploadIcon = document.querySelector(".upload-option .icon-box i");
        if (uploadIcon) uploadIcon.style.color = "#4CAF50";
      };
    };
    reader.readAsDataURL(file);
  },

  // ==========================================================================
  // MANIPULAÇÃO DE DADOS E FORMULÁRIOS DE TREINO
  // ==========================================================================
  getFormDataTraining() {
    const id = document.querySelector("#training-id").value;
    
    const iconInput = document.querySelector('input[name="training-icon"]:checked');
    let icon;

    if (iconInput) {
      icon = iconInput.value;
    } else if (convertedPhoto !== "") {
      icon = convertedPhoto;
    } else {
      icon = "dumbbell";
    }
    
    if (convertedPhoto !== "") icon = convertedPhoto;
    
    const name = document.querySelector("#training-name").value;
    const subtitle = document.querySelector("#training-subtitle").value;
    const exercises = selectedExercisesIds;

    const userString = localStorage.getItem("currentUser");
    const userEmail = userString ? JSON.parse(userString).email : null;

    const data = { name, subtitle, icon, exercises, userEmail };
    
    if (id) {
      data.id = id;
    }
    
    return data;
  },

  async fillFormTraining(trainingId) {
    document.querySelector("#training-modal-title").textContent = "Editar Treino";

    try {
      const training = await trainingApi.getTrainingById(trainingId);

      document.querySelector("#training-id").value = training.id;
      document.querySelector("#training-name").value = training.name;
      document.querySelector("#training-subtitle").value = training.subtitle || "";
      selectedExercisesIds = training.exercises ? [...training.exercises] : [];

      const uploadIcon = document.querySelector(".upload-option .icon-box i");
      if (uploadIcon) uploadIcon.style.color = "";

      document.querySelectorAll('input[name="training-icon"]').forEach((input) => (input.checked = false));

      if (training.icon && training.icon.startsWith("data:image")) {
        if (uploadIcon) uploadIcon.style.color = "#4CAF50";
        convertedPhoto = training.icon;
      } else {
        const iconToSelect = document.querySelector(`input[name="training-icon"][value="${training.icon}"]`);
        if (iconToSelect) iconToSelect.checked = true;
      }
    } catch (error) {
      console.error("Erro ao preencher formulário:", error);
    }
  },

  clearFormTraining() {
    document.querySelector("#training-form").reset();
    document.querySelector("#training-id").value = "";
    convertedPhoto = "";
    document.querySelector("#training-subtitle").value = "";
    selectedExercisesIds = [];
    
    const uploadIcon = document.querySelector(".upload-option .icon-box i");
    if (uploadIcon) uploadIcon.style.color = "";
    
    document.querySelectorAll(".added-label").forEach((badge) => badge.remove());
    document.querySelectorAll(".selectable-exercise-add-btn").forEach((btn) => {
      btn.innerHTML = `<i class="fa-solid fa-plus"></i>`;
      btn.style.color = "";
      btn.style.borderColor = "";
    });
    
    console.log("Estado de criação de treino limpo!");
  },

  showToastTraining(message, type = "success") {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.classList.add("toast-notification");

    if (type === "error") {
      toast.classList.add("error");
    } else if (type === "warning") {
      toast.classList.add("warning");
    }

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("fade-out");
      toast.addEventListener("transitionend", () => toast.remove());
    }, 3000);
  },

  // ==========================================================================
  // FUNÇÃO MESTRA: ABRIR O MODAL DE EDIÇÃO SEM BUGS
  // ==========================================================================
  async openEditModal(trainingId) {
    try {
      // Preenche os dados básicos do formulário
      await uiTraining.fillFormTraining(trainingId);
      
      // Abre o modal na tela
      const modal = document.querySelector("#training-modal");
      if (modal) {
        modal.classList.add("active");
        modal.classList.remove("hidden");
      }

      // Busca e renderiza a lista de exercícios com a seleção correta
      const training = await trainingApi.getTrainingById(trainingId);
      const allExercises = await apiExercises.getExercises();
      const selectedIds = training.exercises || [];
      
      allExercises.sort((a, b) => {
        const aSel = selectedIds.includes(a.id);
        const bSel = selectedIds.includes(b.id);
        return aSel === bSel ? 0 : aSel ? -1 : 1;
      });
      
      uiExercises.renderExercisesForSelection(
        allExercises,
        "#selected-exercises-list-form",
        selectedIds
      );
    } catch (error) {
      console.error("Erro ao abrir modal de edição:", error);
    }
  },

  // ==========================================================================
  // GERENCIAMENTO DE EXERCÍCIOS DENTRO DO TREINO
  // ==========================================================================
  addExerciseToSelection(exerciseId, btnElement) {
    const exerciseItem = btnElement.closest(".selectable-exercise-item");
    const infoContainer = exerciseItem.querySelector(".selectable-exercise-info div");
    
    if (!selectedExercisesIds.includes(exerciseId)) {
      selectedExercisesIds.push(exerciseId);
      this.showToastTraining("Exercício adicionado à ficha!");
      
      if (btnElement) {
        btnElement.innerHTML = `<i class="fa-solid fa-minus"></i>`;
        btnElement.style.color = "#e74c3c";
        btnElement.style.borderColor = "#e74c3c";
      }
      
      if (infoContainer && !infoContainer.querySelector(".added-label")) {
        const badge = document.createElement("span");
        badge.className = "added-label";
        badge.textContent = "Adicionado";
        infoContainer.appendChild(badge);
      }
      
      if (exerciseItem) {
        const listContainer = exerciseItem.parentElement;
        listContainer.prepend(exerciseItem);
      }
    } else {
      selectedExercisesIds = selectedExercisesIds.filter((id) => id !== exerciseId);
      this.showToastTraining("Exercício removido!", "error");
      
      if (btnElement) {
        btnElement.innerHTML = `<i class="fa-solid fa-plus"></i>`;
        btnElement.style.color = "";
        btnElement.style.borderColor = "";
      }
      
      const badge = infoContainer.querySelector(".added-label");
      if (badge) badge.remove();
      
      if (exerciseItem) {
        const listContainer = exerciseItem.parentElement;
        listContainer.appendChild(exerciseItem);
      }
    }
  },

  async addExerciseToExistingTraining(exerciseId, btnElement) {
    if (!currentActiveTraining) return;
    if (!currentActiveTraining.exercises) {
      currentActiveTraining.exercises = [];
    }

    const exerciseItem = btnElement ? btnElement.closest(".selectable-exercise-item") : null;
    const infoContainer = exerciseItem ? exerciseItem.querySelector(".selectable-exercise-info div") : null;

    if (!currentActiveTraining.exercises.includes(exerciseId)) {
      currentActiveTraining.exercises.push(exerciseId);
      try {
        await trainingApi.updateTraining(currentActiveTraining);
        this.showToastTraining("Exercício adicionado à ficha!");
        
        if (btnElement) {
          btnElement.innerHTML = `<i class="fa-solid fa-minus"></i>`;
          btnElement.style.color = "#e74c3c";
          btnElement.style.borderColor = "#e74c3c";
        }
        
        if (infoContainer && !infoContainer.querySelector(".added-label")) {
          const badge = document.createElement("span");
          badge.className = "added-label";
          badge.textContent = "Adicionado";
          infoContainer.appendChild(badge);
        }
        
        if (exerciseItem) {
          const listContainer = exerciseItem.parentElement;
          listContainer.prepend(exerciseItem);
        }
      } catch (error) {
        console.error("Erro ao atualizar treino:", error);
      }
    } else {
      currentActiveTraining.exercises = currentActiveTraining.exercises.filter((id) => id !== exerciseId);
      try {
        await trainingApi.updateTraining(currentActiveTraining);
        this.showToastTraining("Exercício removido do treino!", "error");

        if (btnElement) {
          btnElement.innerHTML = `<i class="fa-solid fa-plus"></i>`;
          btnElement.style.color = "";
          btnElement.style.borderColor = "";
        }
        
        if (infoContainer) {
          const badge = infoContainer.querySelector(".added-label");
          if (badge) badge.remove();
        }
        
        if (exerciseItem) {
          const listContainer = exerciseItem.parentElement;
          listContainer.appendChild(exerciseItem);
        }
      } catch (error) {
        console.error("Erro ao remover exercício do treino:", error);
      }
    }
  },

  // ==========================================================================
  // RENDERIZAÇÃO DE INTERFACE (TREINOS)
  // ==========================================================================
  async renderTrainings(searchTerm = "") {
    const listContainer = document.querySelector("#workouts-grid");
    if (!listContainer) return;

    try {
      const allTrainings = await trainingApi.getTrainings();

      const presentationSection = document.querySelector(".presentation-text");
      const titleElement = document.querySelector("#trainings-section-title");
      if (titleElement && presentationSection) {
        if (presentationSection.classList.contains("hidden")) {
          titleElement.classList.add("training-view");
        } else {
          titleElement.classList.remove("training-view");
        }
      }

      listContainer.innerHTML = "";

      if (allTrainings.length === 0) {
        listContainer.innerHTML = `
          <div class="empty-state-container" style="grid-column: 1 / -1;">
            <div class="empty-icon"><i class="fa-regular fa-clipboard"></i></div>
            <h3>Você ainda não tem treinos</h3>
            <p>Que tal começar com uma de nossas recomendações ou criar um novo agora mesmo?</p>
            <div class="empty-actions">
              <button class="add-new-workout-btn secondary-empty-btn">Criar novo</button>
            </div>
          </div>
        `;
        return;
      }

      listContainer.innerHTML = `
        <div class="workout-card add-new-workout">
          <div class="icon-container"><i class="fa-solid fa-plus"></i></div>
          <h3>Novo Treino</h3>
        </div>
      `;

      const term = searchTerm.toLowerCase();
      const filteredTrainings = allTrainings.filter((training) =>
        training.name.toLowerCase().includes(term)
      );

      if (filteredTrainings.length === 0) {
        listContainer.innerHTML += `
          <div style="grid-column: 1 / -1; text-align: left; padding: 20px 0; color: #666; width: 100%;">
            <p>Nenhum treino <strong>"${searchTerm}"</strong> encontrado.</p>
          </div>
        `;
        return;
      }

      filteredTrainings.forEach((training) => this.addTrainingToList(training));
    } catch (error) {
      console.error("Render error:", error);
      alert("Erro ao renderizar treinos");
    }
  },

  addTrainingToList(training) {
    const trainingsGrid = document.getElementById("workouts-grid");

    const workoutCard = document.createElement("div");
    workoutCard.setAttribute("data-id", training.id);
    workoutCard.classList.add("workout-card");
    
    if (window.runningWorkoutId === training.id) {
      workoutCard.classList.add("running-border");
    }

    const editBtn = document.createElement("button");
    editBtn.classList.add("edit-icon");
    editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
    editBtn.onclick = (event) => {
      // Impede que a página do treino abra ao clicar na engrenagem
      event.stopPropagation(); 
      // Chama nossa nova função mestra!
      uiTraining.openEditModal(training.id);
    };

    const iconContainer = document.createElement("div");
    iconContainer.classList.add("icon-container");
    
    if (training.icon && (training.icon.startsWith("data:image") || training.icon.startsWith("http"))) {
      const img = document.createElement("img");
      img.src = training.icon;
      img.alt = `Foto de ${training.name}`;
      img.classList.add("workout-image");
      iconContainer.appendChild(img);
    } else {
      const i = document.createElement("i");
      const iconMap = {
        "arm-muscle": "hand-fist", back: "child", legs: "shoe-prints", heart: "heart-pulse", 
        running: "person-running", medal: "medal", fire: "fire", dumbbell: "dumbbell"
      };
      i.className = `fa-solid fa-${iconMap[training.icon] || training.icon || "dumbbell"}`;
      iconContainer.appendChild(i);
    }

    const title = document.createElement("h3");
    title.textContent = training.name;

    const subtitle = document.createElement("p");
    subtitle.textContent = training.subtitle;

    workoutCard.appendChild(editBtn);
    workoutCard.appendChild(iconContainer);
    workoutCard.appendChild(title);
    workoutCard.appendChild(subtitle);
    
    trainingsGrid.appendChild(workoutCard);

    workoutCard.onclick = () => this.openTraining(training);
  },

  // ==========================================================================
  // TELA DE DETALHES DO TREINO ATIVO
  // ==========================================================================
  async openTraining(training) {
    currentActiveTraining = training;

    const trainingPage = document.querySelector(".active-workout-section");
    const workoutsSection = document.querySelector(".workouts-section");
    const trainingSection = document.querySelector(".trainings-library-section");
    const presentationText = document.querySelector(".presentation-text");
    const websitePresentation = document.querySelector(".website-presentation");
    const exercisesSection = document.querySelector(".exercises-library-section");

    [workoutsSection, trainingSection, presentationText, websitePresentation, exercisesSection].forEach((section) => {
      if (section) section.classList.add("hidden");
    });

    trainingPage.querySelector(".active-title").textContent = training.name;
    trainingPage.querySelector(".active-subtitle").textContent = training.subtitle;

    // Configura o Botão de Editar na tela de detalhes
    const btnEdit = document.querySelector(".edit-workout-btn");
    const btnEditClone = btnEdit.cloneNode(true);
    btnEdit.parentNode.replaceChild(btnEditClone, btnEdit);

    btnEditClone.onclick = () => {
      // Chama nossa nova função mestra!
      uiTraining.openEditModal(training.id);
    };

    const btnDelete = document.querySelector(".delete-workout-btn");
    const btnDeleteClone = btnDelete.cloneNode(true);
    btnDelete.parentNode.replaceChild(btnDeleteClone, btnDelete);

    btnDeleteClone.onclick = () => {
      this.confirmExclusionTraining(training);
    };

    trainingPage.classList.remove("hidden");
    window.scrollTo({ top: 150, behavior: "smooth" });

    try {
      const allExercises = await apiExercises.getExercises();
      const trainingExIds = Array.isArray(training.exercises) ? training.exercises : [];

      const fullExercises = allExercises.filter((exercise) => {
        return trainingExIds.some((id) => String(id) === String(exercise.id));
      });

      const trainingPart = document.querySelector(".active-exercises-list");
      trainingPart.innerHTML = "";
      let htmlContent = "";

      fullExercises.forEach((exercise) => {
        let iconHtml;
        if (exercise.icon && exercise.icon.startsWith("data:image")) {
          iconHtml = `<img src="${exercise.icon}" alt="${exercise.name}" class="exercise-img">`;
        } else {
          const iconMap = { dumbbell: "dumbbell", running: "person-running", "weight-hanging": "weight-hanging", bolt: "bolt", fire: "fire", "heart-pulse": "heart-pulse", child: "child", "shoe-prints": "shoe-prints", bed: "bed" };
          const iconName = iconMap[exercise.icon] || "dumbbell";
          iconHtml = `<div class="exercise-img" style="display:flex; justify-content:center; align-items:center; background:#eee; font-size:20px; color:#555;"><i class="fa-solid fa-${iconName}"></i></div>`;
        }

        htmlContent += `
        <div class="exercise-item" data-id="${exercise.id}"> 
          ${iconHtml}
          <div class="exercise-info">
            <h4>${exercise.name}</h4>
            <p style="margin-bottom: 5px;" >${exercise.muscle}</p>
            <p>${exercise.series} Séries x ${exercise.repetitions} Repetições</p>
          </div>
          <button class="check-exercise-btn" aria-label="Marcar como feito">
            <i class="fa-solid fa-check"></i>
          </button>
        </div>
      `;
      });
      
      trainingPart.innerHTML = htmlContent;

      trainingPart.querySelectorAll(".exercise-item").forEach((card) => {
        const checkBtn = card.querySelector(".check-exercise-btn");
        if (checkBtn) {
          checkBtn.addEventListener("click", (event) => {
            event.stopPropagation(); 
            event.preventDefault();
            checkBtn.classList.toggle("completed");
          });
        }

        card.addEventListener("click", () => {
          const exerciseId = card.dataset.id;
          const exerciseData = fullExercises.find((ex) => String(ex.id) === String(exerciseId));

          if (exerciseData) {
            document.querySelector(".active-workout-section").classList.add("hidden");
            const backArrow = document.querySelector(".back-arrow-exercise-btn");
            if (backArrow) backArrow.setAttribute("data-from", "training");
            uiExercises.openExercise(exerciseData);
          }
        });
      });

      const btnStart = document.querySelector("#start-workout-action-btn");
      const timersWrapper = document.querySelector("#dual-timers-wrapper");

      if (window.runningWorkoutId === training.id) {
        btnStart.classList.add("hidden");
        timersWrapper.classList.remove("hidden");
        timersWrapper.classList.remove("floating-mode");

        const titleArea = document.querySelector(".active-title-area");
        titleArea.insertAdjacentElement("afterend", timersWrapper);
      } else {
        btnStart.classList.remove("hidden");
        if (!timersWrapper.classList.contains("floating-mode")) {
          timersWrapper.classList.add("hidden");
        }
      }
    } catch (error) {
      console.error("Erro ao carregar exercícios:", error);
    }
  },

  confirmExclusionTraining(training) {
    const modalOverlay = document.createElement("div");
    modalOverlay.className = "confirm-modal-overlay";
    modalOverlay.innerHTML = `
      <div class="confirm-modal-card">
        <h3>Excluir ${training.name}?</h3>
        <p>Esta ação não pode ser desfeita.</p>
        <div class="confirm-actions">
          <button id="cancel-delete">Cancelar</button>
          <button id="confirm-delete" class="confirm-delete-btn">Excluir</button>
        </div>
      </div>
    `;
    document.body.appendChild(modalOverlay);

    modalOverlay.querySelector("#cancel-delete").onclick = () => modalOverlay.remove();

    modalOverlay.querySelector("#confirm-delete").onclick = async () => {
      await trainingApi.deleteTraining(training.id);
      modalOverlay.remove();

      document.querySelector(".active-workout-section").classList.add("hidden");
      document.querySelector(".workouts-section").classList.remove("hidden");
      document.querySelector(".exercises-library-section").classList.remove("hidden");

      this.renderTrainings();
      this.showToastTraining("Treino excluído com sucesso!", "warning");
    };
  },

  // ==========================================================================
  // HELPERS (UTILITÁRIOS)
  // ==========================================================================
  getCurrentSelectedIds() {
    const modal = document.querySelector("#training-modal");
    // CORREÇÃO: Se o modal de criação/edição estiver aberto, foca na edição atual.
    if (modal && modal.classList.contains("active")) {
      return selectedExercisesIds || [];
    }
    // Caso contrário (se o usuário estiver só navegando no treino), puxa do treino aberto
    if (currentActiveTraining) {
      return currentActiveTraining.exercises || [];
    }
    return selectedExercisesIds || [];
  },

  getCurrentActiveTrainingData() {
    return currentActiveTraining;
  },
};

export default uiTraining;