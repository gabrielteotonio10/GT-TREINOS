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
  // Redimensiona e converte imagem enviada para formato base64 comprimido
  convertPhoto(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Limita a largura pra não ficar monstruoso
        const MAX_WIDTH = 400;
        const scaleSize = MAX_WIDTH / img.width;
        const canvasWidth = MAX_WIDTH;
        const canvasHeight = img.height * scaleSize;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        // Converte pra base64 com compressão de 70% pra não ocupar muito espaço
        convertedPhoto = canvas.toDataURL("image/jpeg", 0.7);
        console.log("Foto redimensionada e pronta!");

        // Desmarca ícones
        document
          .querySelectorAll('input[name="training-icon"]')
          .forEach((r) => (r.checked = false));

        const uploadIcon = document.querySelector(".upload-option .icon-box i");
        if (uploadIcon) uploadIcon.style.color = "#4CAF50";
      };
    };
    reader.readAsDataURL(file);
  },

  // ==========================================================================
  // MANIPULAÇÃO DE DADOS E FORMULÁRIOS DE TREINO
  // ==========================================================================

  // Pega todos os dados do formulário e monta um objeto pronto pra enviar pra API
  getFormDataTraining() {
    const id = document.querySelector("#training-id").value;

    const iconInput = document.querySelector(
      'input[name="training-icon"]:checked',
    );
    let icon;

    // Ordem de prioridade: foto enviada > ícone selecionado > padrão (dumbbell)
    if (iconInput) {
      icon = iconInput.value;
    } else if (convertedPhoto !== "") {
      icon = convertedPhoto;
    } else {
      icon = "dumbbell";
    }

    // Se tem foto, usa ela no lugar de qualquer coisa
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

  // Preenche o formulário com os dados do treino que tá sendo editado
  async fillFormTraining(trainingId) {
    document.querySelector("#training-modal-title").textContent =
      "Editar Treino";

    try {
      // Busca o treino no servidor (Supabase via API)
      const training = await trainingApi.getTrainingById(trainingId);

      // Coloca todos os dados nos inputs correspondentes
      document.querySelector("#training-id").value = training.id;
      document.querySelector("#training-name").value = training.name;
      document.querySelector("#training-subtitle").value =
        training.subtitle || "";
      // Faz uma cópia da lista de exercícios pra não mexer na original
      selectedExercisesIds = training.exercises ? [...training.exercises] : [];

      const uploadIcon = document.querySelector(".upload-option .icon-box i");
      if (uploadIcon) uploadIcon.style.color = "";

      document
        .querySelectorAll('input[name="training-icon"]')
        .forEach((input) => (input.checked = false));

      // Se tem foto salva, marca ela como ativa. Se não, tira a marcação dos ícones
      if (training.icon && training.icon.startsWith("data:image")) {
        if (uploadIcon) uploadIcon.style.color = "#4CAF50";
        // Guarda a foto em memória
        convertedPhoto = training.icon;
      } else {
        // Se não tem foto, marca o ícone correspondente
        const iconToSelect = document.querySelector(
          `input[name="training-icon"][value="${training.icon}"]`,
        );
        if (iconToSelect) iconToSelect.checked = true;
      }
    } catch (error) {
      console.error("Erro ao preencher formulário:", error);
    }
  },

  // Limpa tudo: formulário, estados, badges... volta tudo pro zero
  clearFormTraining() {
    document.querySelector("#training-form").reset();
    document.querySelector("#training-id").value = "";
    convertedPhoto = ""; // Limpa a foto da memória
    document.querySelector("#training-subtitle").value = "";
    selectedExercisesIds = []; // Vazia a lista de exercícios selecionados

    const uploadIcon = document.querySelector(".upload-option .icon-box i");
    if (uploadIcon) uploadIcon.style.color = "";

    // Remove todos os badges "Adicionado" que aparecem nos exercícios
    document
      .querySelectorAll(".added-label")
      .forEach((badge) => badge.remove());

    // Reseta os botões de adicionar/remover exercício pro estado inicial
    document.querySelectorAll(".selectable-exercise-add-btn").forEach((btn) => {
      btn.innerHTML = `<i class="fa-solid fa-plus"></i>`;
      btn.style.color = "";
      btn.style.borderColor = "";
    });

    console.log("Estado de criação de treino limpo!");
  },

  // Exibe uma notificação toast (aquele aviso que some sozinho)
  showToastTraining(message, type = "success") {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.classList.add("toast-notification");

    // Define a cor baseado no tipo: erro (vermelho) ou aviso (amarelo)
    if (type === "error") {
      toast.classList.add("error");
    } else if (type === "warning") {
      toast.classList.add("warning");
    }

    document.body.appendChild(toast);

    // Depois de 3 segundos, anima a saída e remove
    setTimeout(() => {
      toast.classList.add("fade-out");
      toast.addEventListener("transitionend", () => toast.remove());
    }, 3000);
  },

  // ==========================================================================
  // Abre o modal de edição do treino com tudo carregado
  // ==========================================================================
  async openEditModal(trainingId) {
    try {
      // Preenche os dados básicos do formulário
      await uiTraining.fillFormTraining(trainingId);

      // Mostra o modal
      const modal = document.querySelector("#training-modal");
      if (modal) {
        modal.classList.add("active");
        modal.classList.remove("hidden");
      }

      // Busca o treino e todos os exercícios disponíveis
      const training = await trainingApi.getTrainingById(trainingId);
      const allExercises = await apiExercises.getExercises();
      const selectedIds = training.exercises || [];

      // Ordena pra deixar os exercícios já selecionados no topo
      allExercises.sort((a, b) => {
        const aSel = selectedIds.includes(a.id);
        const bSel = selectedIds.includes(b.id);
        return aSel === bSel ? 0 : aSel ? -1 : 1;
      });

      // Renderiza a lista de exercícios no modal
      uiExercises.renderExercisesForSelection(
        allExercises,
        "#selected-exercises-list-form",
        selectedIds,
      );
    } catch (error) {
      console.error("Erro ao abrir modal de edição:", error);
    }
  },

  // ==========================================================================
  // GERENCIAMENTO DE EXERCÍCIOS DENTRO DO TREINO
  // ==========================================================================
  // Adiciona ou remove um exercício da lista enquanto tá criando o treino
  addExerciseToSelection(exerciseId, btnElement) {
    const exerciseItem = btnElement.closest(".selectable-exercise-item");
    const infoContainer = exerciseItem.querySelector(
      ".selectable-exercise-info div",
    );

    // Se o exercício NÃO tá na lista, adiciona
    if (!selectedExercisesIds.includes(exerciseId)) {
      selectedExercisesIds.push(exerciseId);
      this.showToastTraining("Exercício adicionado à ficha!");

      // Muda o ícone do botão pra minus (já tá selecionado)
      if (btnElement) {
        btnElement.innerHTML = `<i class="fa-solid fa-minus"></i>`;
        btnElement.style.color = "#e74c3c";
        btnElement.style.borderColor = "#e74c3c";
      }

      // Adiciona um badge "Adicionado" pra indicar que tá no treino
      if (infoContainer && !infoContainer.querySelector(".added-label")) {
        const badge = document.createElement("span");
        badge.className = "added-label";
        badge.textContent = "Adicionado";
        infoContainer.appendChild(badge);
      }

      // Move o exercício pro topo da lista
      if (exerciseItem) {
        const listContainer = exerciseItem.parentElement;
        listContainer.prepend(exerciseItem);
      }
    } else {
      // Se JÁ tá na lista, remove
      selectedExercisesIds = selectedExercisesIds.filter(
        (id) => id !== exerciseId,
      );
      this.showToastTraining("Exercício removido!", "error");

      // Tira o badge e volta o botão pro estado original
      if (btnElement) {
        btnElement.innerHTML = `<i class="fa-solid fa-plus"></i>`;
        btnElement.style.color = "";
        btnElement.style.borderColor = "";
      }

      const badge = infoContainer.querySelector(".added-label");
      if (badge) badge.remove();

      // Move pra baixo da lista
      if (exerciseItem) {
        const listContainer = exerciseItem.parentElement;
        listContainer.appendChild(exerciseItem);
      }
    }
  },

  // Adiciona um exercício a um treino que já tá sendo exibido (sem fecha modal)
  async addExerciseToExistingTraining(exerciseId, btnElement) {
    // Se não tem treino ativo aberto, não faz nada
    if (!currentActiveTraining) return;
    if (!currentActiveTraining.exercises) {
      currentActiveTraining.exercises = [];
    }

    const exerciseItem = btnElement
      ? btnElement.closest(".selectable-exercise-item")
      : null;
    const infoContainer = exerciseItem
      ? exerciseItem.querySelector(".selectable-exercise-info div")
      : null;

    // Se o exercício não tá no treino, adiciona
    if (!currentActiveTraining.exercises.includes(exerciseId)) {
      currentActiveTraining.exercises.push(exerciseId);
      try {
        // Salva a mudança no servidor (Supabase via API)
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
      // Se já tá no treino, remove
      currentActiveTraining.exercises = currentActiveTraining.exercises.filter(
        (id) => id !== exerciseId,
      );
      try {
        // Atualiza no servidor (Supabase via API)
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
  // Renderiza a grade de treinos com filtro de busca opcional
  async renderTrainings(searchTerm = "") {
    const listContainer = document.querySelector("#workouts-grid");
    if (!listContainer) return;

    try {
      // Busca todos os treinos do usuário (Supabase via API)
      const allTrainings = await trainingApi.getTrainings();

      // Ajusta o estilo do título dependendo de qual aba tá aberta
      const presentationSection = document.querySelector(".presentation-text");
      const titleElement = document.querySelector("#trainings-section-title");
      if (titleElement && presentationSection) {
        if (presentationSection.classList.contains("hidden")) {
          titleElement.classList.add("training-view");
        } else {
          titleElement.classList.remove("training-view");
        }
      }

      // Limpa a grade pra colocar tudo novamente
      listContainer.innerHTML = "";

      // Se não tem treinos, mostra mensagem de "nenhum treino"
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

      // Sempre mostra o botão de "novo treino" no topo
      listContainer.innerHTML = `
        <div class="workout-card add-new-workout">
          <div class="icon-container"><i class="fa-solid fa-plus"></i></div>
          <h3>Novo Treino</h3>
        </div>
      `;

      // Filtra baseado no termo de busca
      const term = searchTerm.toLowerCase();
      const filteredTrainings = allTrainings.filter((training) =>
        training.name.toLowerCase().includes(term),
      );

      // Se não acha nada na busca
      if (filteredTrainings.length === 0) {
        listContainer.innerHTML += `
          <div style="grid-column: 1 / -1; text-align: left; padding: 20px 0; color: #666; width: 100%;">
            <p>Nenhum treino <strong>"${searchTerm}"</strong> encontrado.</p>
          </div>
        `;
        return;
      }

      // Renderiza cada treino como um card
      filteredTrainings.forEach((training) => this.addTrainingToList(training));
    } catch (error) {
      console.error("Render error:", error);
      alert("Erro ao renderizar treinos");
    }
  },

  // Cria e adiciona um card de treino à grade de interface
  addTrainingToList(training) {
    const trainingsGrid = document.getElementById("workouts-grid");

    const workoutCard = document.createElement("div");
    workoutCard.setAttribute("data-id", training.id);
    workoutCard.classList.add("workout-card");

    // Se esse treino tá em execução agora, destaca ele
    if (window.runningWorkoutId === training.id) {
      workoutCard.classList.add("running-border");
    }

    // Botão de editar (quando clica, não abre o treino, abre o modal)
    const editBtn = document.createElement("button");
    editBtn.classList.add("edit-icon");
    editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
    editBtn.onclick = (event) => {
      // Evita que o clique propague pro card (que abriria o treino)
      event.stopPropagation();
      uiTraining.openEditModal(training.id);
    };

    const iconContainer = document.createElement("div");
    iconContainer.classList.add("icon-container");

    // Se tem foto (base64 ou URL), mostra ela. Se não, mostra um ícone
    if (
      training.icon &&
      (training.icon.startsWith("data:image") ||
        training.icon.startsWith("http"))
    ) {
      const img = document.createElement("img");
      img.src = training.icon;
      img.alt = `Foto de ${training.name}`;
      img.classList.add("workout-image");
      iconContainer.appendChild(img);
    } else {
      // Usa um mapa de ícones pra cada tipo de treino
      const i = document.createElement("i");
      const iconMap = {
        "arm-muscle": "hand-fist",
        back: "child",
        legs: "shoe-prints",
        heart: "heart-pulse",
        running: "person-running",
        medal: "medal",
        fire: "fire",
        dumbbell: "dumbbell",
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
  // Abre a tela de detalhes de um treino com todos os seus exercícios
  // ==========================================================================
  async openTraining(training) {
    // Guarda em memória qual treino está sendo exibido agora
    currentActiveTraining = training;

    // Pega as referências de todas as seções da página
    const trainingPage = document.querySelector(".active-workout-section");
    const workoutsSection = document.querySelector(".workouts-section");
    const trainingSection = document.querySelector(
      ".trainings-library-section",
    );
    const presentationText = document.querySelector(".presentation-text");
    const websitePresentation = document.querySelector(".website-presentation");
    const exercisesSection = document.querySelector(
      ".exercises-library-section",
    );
    const resultsSection = document.querySelector("#results-section");

    // Esconde tudo que não é a tela do treino
    [
      workoutsSection,
      trainingSection,
      presentationText,
      websitePresentation,
      exercisesSection,
      resultsSection,
    ].forEach((section) => {
      if (section) section.classList.add("hidden");
    });

    // Preenche o título e subtítulo do treino
    trainingPage.querySelector(".active-title").textContent = training.name;
    trainingPage.querySelector(".active-subtitle").textContent =
      training.subtitle;

    // Configura o botão de editar do treino (com cloneNode pra resetar qualquer evento anterior)
    const btnEdit = document.querySelector(".edit-workout-btn");
    const btnEditClone = btnEdit.cloneNode(true);
    btnEdit.parentNode.replaceChild(btnEditClone, btnEdit);

    // Quando clica em editar, abre o modal de edição
    btnEditClone.onclick = () => {
      uiTraining.openEditModal(training.id);
    };

    // Configura o botão de deletar (mesmo processo com cloneNode)
    const btnDelete = document.querySelector(".delete-workout-btn");
    const btnDeleteClone = btnDelete.cloneNode(true);
    btnDelete.parentNode.replaceChild(btnDeleteClone, btnDelete);

    // Quando clica em deletar, pede confirmação
    btnDeleteClone.onclick = () => {
      this.confirmExclusionTraining(training);
    };

    trainingPage.classList.remove("hidden");
    window.scrollTo({ top: 150, behavior: "smooth" });

    try {
      const allExercises = await apiExercises.getExercises();
      const trainingExIds = Array.isArray(training.exercises)
        ? training.exercises
        : [];

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
          const iconMap = {
            dumbbell: "dumbbell",
            running: "person-running",
            "weight-hanging": "weight-hanging",
            bolt: "bolt",
            fire: "fire",
            "heart-pulse": "heart-pulse",
            child: "child",
            "shoe-prints": "shoe-prints",
            bed: "bed",
          };
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
          const exerciseData = fullExercises.find(
            (ex) => String(ex.id) === String(exerciseId),
          );

          if (exerciseData) {
            document
              .querySelector(".active-workout-section")
              .classList.add("hidden");
            const backArrow = document.querySelector(
              ".back-arrow-exercise-btn",
            );
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

  // Exibe modal pedindo confirmação pra deletar um treino
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

    // Botão de cancelar só tira o modal
    modalOverlay.querySelector("#cancel-delete").onclick = () =>
      modalOverlay.remove();

    // Botão de confirmar deleta e volta pra lista
    modalOverlay.querySelector("#confirm-delete").onclick = async () => {
      // Deleta a partir da API (Supabase via API)
      await trainingApi.deleteTraining(training.id);
      modalOverlay.remove();

      // Volta pra lista de treinos
      document.querySelector(".active-workout-section").classList.add("hidden");
      document.querySelector(".workouts-section").classList.remove("hidden");
      document
        .querySelector(".exercises-library-section")
        .classList.remove("hidden");

      // Rerenderiza a lista sem o treino que foi deletado
      this.renderTrainings();
      this.showToastTraining("Treino excluído com sucesso!", "warning");
    };
  },

  // ==========================================================================
  // HELPERS (UTILITÁRIOS)
  // ==========================================================================
  // Retorna os IDs dos exercícios selecionados (modal ou treino ativo)
  getCurrentSelectedIds() {
    const modal = document.querySelector("#training-modal");
    // Se o modal de criação/edição estiver aberto, foca na edição atual.
    if (modal && modal.classList.contains("active")) {
      return selectedExercisesIds || [];
    }
    // Caso contrário (se o usuário estiver só navegando no treino), puxa do treino aberto
    if (currentActiveTraining) {
      return currentActiveTraining.exercises || [];
    }
    return selectedExercisesIds || [];
  },

  // Retorna os dados do treino que está sendo exibido no momento
  getCurrentActiveTrainingData() {
    return currentActiveTraining;
  },
};

export default uiTraining;
