import trainingApi from "./apiTraining.js";

//Foto
let convertedPhoto = "";
// Exercícios adicionados
let selectedExercisesIds = [];
// Treino aberto
let currentActiveTraining = null;

const uiTraining = {
  // Converte uma foto enviada, caso tenha, para ser armazenada, diminuiTrainingndo seu tamanho
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
        // Atualiza a cor do ícone no HTML refatorado
        const uploadIcon = document.querySelector(".upload-option .icon-box i");
        if (uploadIcon) uploadIcon.style.color = "#4CAF50";
      };
    };
    reader.readAsDataURL(file);
  },

  // Captura exercicios para adicionar ao treino
  addExerciseToSelection(exerciseId) {
    if (!selectedExercisesIds.includes(exerciseId)) {
      this.showToastTraining("Exercício adicionado à ficha!");
      selectedExercisesIds.push(exerciseId);
      console.log("Lista atual de IDs:", selectedExercisesIds);
      // DICA: Aqui você pode chamar uma função para mostrar o exercício no form
    } else {
      this.showToastTraining("Este exercício já está no treino!", "warning");
    }
  },

  // Captura as informações de um formulário
  getFormDataTraining() {
    const id = document.querySelector("#training-id").value;
    // Seleciona o ícone marcado
    const iconInput = document.querySelector(
      'input[name="training-icon"]:checked',
    );
    let icon = iconInput ? iconInput.value : "dumbbell";
    if (convertedPhoto !== "") icon = convertedPhoto;
    const name = document.querySelector("#training-name").value;
    const subtitle = document.querySelector("#training-subtitle").value;

    const exercises = selectedExercisesIds;

    return { id, name, subtitle, icon, exercises };
  },

  // Salva um Exercício dentro do treino
  async addExerciseToExistingTraining(exerciseId) {
    if (!currentActiveTraining) return; // Se não tem treino aberto, não faz nada
    // Garante que o array de exercícios existe no treino
    if (!currentActiveTraining.exercises) {
      currentActiveTraining.exercises = [];
    }
    // Se o exercício não está lá, adiciona e manda para o banco de dados
    if (!currentActiveTraining.exercises.includes(exerciseId)) {
      currentActiveTraining.exercises.push(exerciseId);
      try {
        await trainingApi.updateTraining(currentActiveTraining);
        console.log(
          "Atualizado direto no banco:",
          currentActiveTraining.exercises,
        );
        // Dá o aviso na tela
        this.showToastTraining("Exercício adicionado à ficha!");
      } catch (error) {
        console.error("Erro ao atualizar treino:", error);
      }
    } else {
      this.showToastTraining("Este exercício já está no treino!", "warning");
    }
  },

  // Limpa o formulário totalmente
  clearFormTraining() {
    document.querySelector("#training-form").reset();
    document.querySelector("#training-id").value = "";
    convertedPhoto = "";
    document.querySelector("#training-subtitle").value = "";
    selectedExercisesIds = [];
    // Reseta a cor do ícone
    const uploadIcon = document.querySelector(".upload-option .icon-box i");
    if (uploadIcon) uploadIcon.style.color = "";
  },

  // Preenche o formulário (Para edição)
  async fillFormTraining(trainingId) {
    document.querySelector("#training-modal-title").textContent = "Editar Treino";
    try {
      const training = await trainingApi.getTrainingById(trainingId);
      document.querySelector("#training-id").value = training.id;
      document.querySelector("#training-name").value = training.name;
      document.querySelector("#training-subtitle").value =
        training.subtitle || "";
      selectedExercisesIds = training.exercises ? [...training.exercises] : [];
      const iconToSelect = document.querySelector(
        `input[name="training-icon"][value="${training.icon}"]`,
      );
      if (iconToSelect) {
        iconToSelect.checked = true;
      } else if (training.icon && training.icon.startsWith("data:image")) {
        const uploadIcon = document.querySelector(".upload-option .icon-box i");
        if (uploadIcon) uploadIcon.style.color = "#4CAF50";
      }
    } catch (error) {
      console.error("Erro ao preencher formulário:", error);
    }
  },

  // Mostra um aviso quando treino é criado ou editado
  showToastTraining(message, type = "success") {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.classList.add("toast-notification");

    // Se o tipo for 'error', adiciona a classe .error
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

  // Renderiza a lista de treinos na tela
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

      // Limpa a grade atual
      listContainer.innerHTML = "";

      // Caso o banco de dados esteja totalmente vazio
      if (allTrainings.length === 0) {
        // Injeta APENAS o estado vazio, sem tentar recriar o <h2> ou o container inteiro
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

      // Se passou da verificação de vazio, SEMPRE desenha o botão de Criar Novo
      listContainer.innerHTML = `
        <div class="workout-card add-new-workout">
          <div class="icon-container"><i class="fa-solid fa-plus"></i></div>
          <h3>Novo Treino</h3>
        </div>
      `;

      // Filtra os treinos com base no que foi digitado
      const term = searchTerm.toLowerCase();
      const filteredTrainings = allTrainings.filter((training) =>
        training.name.toLowerCase().includes(term),
      );

      // Se o usuário pesquisou algo que não existe
      if (filteredTrainings.length === 0) {
        listContainer.innerHTML += `
          <div style="grid-column: 1 / -1; text-align: left; padding: 20px 0; color: #666; width: 100%;">
            <p>Nenhum treino <strong>"${searchTerm}"</strong> encontrado.</p>
          </div>
        `;
        return;
      }

      // Se passou no filtro, desenha os cards dos treinos
      filteredTrainings.forEach((training) => this.addTrainingToList(training));
    } catch (error) {
      console.error("Render error:", error);
      alert("Erro ao renderizar treinos");
    }
  },

  // Abre o treino
  openTraining(training) {
    // Guarda o treino na memória
    currentActiveTraining = training;
    // Arruma a vizualização
    const trainingPage = document.querySelector(".active-workout-section");
    const workoutsSection = document.querySelector(".workouts-section");
    const trainingSection = document.querySelector(
      ".trainings-library-section",
    );
    const presentationText = document.querySelector(".presentation-text");
    const websitePresentation = document.querySelector(".website-presentation");
    [
      workoutsSection,
      trainingSection,
      presentationText,
      websitePresentation,
    ].forEach((section) => {
      if (section) section.classList.add("hidden");
    });

    // Preenche os textos da página de detalhes
    trainingPage.querySelector(".active-title").textContent = training.name;
    trainingPage.querySelector(".active-subtitle").textContent =
      training.subtitle;

    // Configura o botão de editar da tela de detalhes
    document.querySelector(".edit-workout-btn").onclick = () => {
      uiTraining.fillFormTraining(training.id);
      document.querySelector("#training-modal").classList.add("active");
    };

    // Configura o botão de excluir da tela de detalhes
    document.querySelector(".delete-workout-btn").onclick = () => {
      uiTraining.confirmExclusionTraining(training);
    };

    // Troca as telas
    workoutsSection.classList.add("hidden");
    trainingPage.classList.remove("hidden");

    // Dentro da sua função que abre o treino:
    const exercisesSection = document.querySelector(
      ".exercises-library-section",
    );
    if (exercisesSection) {
      exercisesSection.classList.add("hidden");
    }

    // Início da tela
    window.scrollTo({
      top: 150,
      behavior: "smooth",
    });
  },

  // Adiciona um treino a lista de vizualisação
  addTrainingToList(training) {
    const trainingsGrid = document.getElementById("workouts-grid");

    // Criando a Div principal do Card
    const workoutCard = document.createElement("div");
    workoutCard.setAttribute("data-id", training.id);
    workoutCard.classList.add("workout-card");
    // Botão Editar
    const editBtn = document.createElement("button");
    editBtn.classList.add("edit-icon");
    editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
    editBtn.onclick = (event) => {
      event.stopPropagation();
      uiTraining.fillFormTraining(training.id);
      document.querySelector("#training-modal").classList.add("active");
    };
    // Container da Imagem/Ícone
    const iconContainer = document.createElement("div");
    iconContainer.classList.add("icon-container");
    // Verifica se é uma imagem Base64 ou URL
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
      const i = document.createElement("i");
      const rawValue = training.icon || "dumbbell";
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
      const iconName = iconMap[rawValue] || rawValue || "dumbbell";
      i.className = `fa-solid fa-${iconName}`;
      iconContainer.appendChild(i);
    }
    // Nome
    const title = document.createElement("h3");
    title.textContent = training.name;
    // Subtítulo
    const subtitle = document.createElement("p");
    subtitle.textContent = training.subtitle;
    // Colocando na div
    workoutCard.appendChild(editBtn);
    workoutCard.appendChild(iconContainer);
    workoutCard.appendChild(title);
    workoutCard.appendChild(subtitle);
    // Adicionando o card pronto a Grid
    trainingsGrid.appendChild(workoutCard);

    // Configura a tela de detalhes para o treino clicado, possibilitando editar e excluir
    workoutCard.onclick = () => uiTraining.openTraining(training);
  },

  // Função de exclusão
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

    modalOverlay.querySelector("#cancel-delete").onclick = () =>
      modalOverlay.remove();

    modalOverlay.querySelector("#confirm-delete").onclick = async () => {
      await trainingApi.deleteTraining(training.id);
      modalOverlay.remove();
      document.querySelector(".active-workout-section").classList.add("hidden");
      document.querySelector(".workouts-section").classList.remove("hidden");
      uiTraining.renderTrainings();
    };
  },
};

export default uiTraining;
