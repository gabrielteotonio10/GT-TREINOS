import exercisesApi from "./apiExercises.js";

let convertedPhoto = "";
const uiExercise = {
  // Converte uma foto enviada, caso tenha, para ser armazenada, diminuindo seu tamanho
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

  // Captura as informações de um formulário
  getFormDataExercise() {
    const id = document.querySelector("#exercise-id").value;
    // Seleciona o ícone marcado
    const iconInput = document.querySelector(
      'input[name="exercise-icon"]:checked',
    );
    let icon = iconInput ? iconInput.value : "dumbbell";
    if (convertedPhoto !== "") icon = convertedPhoto;
    const name = document.querySelector("#exercise-name").value;
    const muscle = document.querySelector("#exercise-muscle").value;
    const equipment = document.querySelector("#exercise-equipment").value;
    const series = document.querySelector("#exercise-series").value;
    const repetitions = document.querySelector("#exercise-repetitions").value;
    const load = document.querySelector("#exercise-load").value;
    const description = document.querySelector("#exercise-description").value;
    return {
      id,
      name,
      icon,
      muscle,
      equipment,
      series,
      repetitions,
      load,
      description,
    };
  },

  // Limpa o formulário totalmente
  clearFormExercise() {
    document.querySelector("#exercise-form").reset();
    document.querySelector("#exercise-id").value = "";
    convertedPhoto = "";
    // Reseta a cor do ícone
    const uploadIcon = document.querySelector(".upload-option .icon-box i");
    if (uploadIcon) uploadIcon.style.color = "";
    console.log("Formulário de exercício limpo!");
  },

  // Preenche o formulário (Para edição)
  async fillFormExercise(exerciseId) {
    try {
      const exercise = await exercisesApi.getExerciseById(exerciseId);
      document.querySelector("#exercise-id").value = exercise.id;
      document.querySelector("#exercise-name").value = exercise.name;
      document.querySelector("#exercise-muscle").value = exercise.muscle;
      document.querySelector("#exercise-equipment").value =
        exercise.equipment || "";
      document.querySelector("#exercise-series").value = exercise.series || "";
      document.querySelector("#exercise-repetitions").value =
        exercise.repetitions || "";
      document.querySelector("#exercise-load").value = exercise.load || "";
      document.querySelector("#exercise-description").value =
        exercise.description || "";
      // Foto
      const iconToSelect = document.querySelector(
        `input[name="exercise-icon"][value="${exercise.icon}"]`,
      );
      if (iconToSelect) {
        iconToSelect.checked = true;
      } else if (exercise.icon && exercise.icon.startsWith("data:image")) {
        const uploadIcon = document.querySelector(".upload-option .icon-box i");
        if (uploadIcon) uploadIcon.style.color = "#4CAF50";
      }
    } catch (error) {
      console.error("Erro ao preencher formulário:", error);
    }
  },

  // Mostra um aviso quando exercício é criado ou editado
  showToastExercise(message) {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.classList.add("toast-notification");
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("fade-out");
      toast.addEventListener("transitionend", () => toast.remove());
    }, 3000);
  },

  // Renderiza a lista de exercícios na tela
  async renderExercises() {
    const sectionExercises = document.querySelector(
      ".exercises-library-section",
    );
    try {
      const exercises = await exercisesApi.getExercises();
      const presentationSection = document.querySelector(".presentation-text");
      const isExercisePage = presentationSection.classList.contains("hidden");
      // OLHAR A ESTILIZAÇÃO CSS SE FOR DA PÁGINA
      sectionExercises.innerHTML = `
      <h2 class="section-title" ${isExercisePage ? "exercise-view" : ""}>Meus Exercícios</h2>
      <div class="exercises-grid" id="exercises-list">
        <div class="exercise-mini-card add-new-exercise-btn">
          <i class="fa-solid fa-plus"></i>
          <p>Criar Exercício</p>
        </div>
      </div>
      `;
      const exercisesGrid = document.getElementById("exercises-grid");
      // Se a lista estiver vazia
      // VVVVVVEEEEEEERRRRRRRRR
      if (exercises.length === 0) {
        const emptyState = document.createElement("div");
        emptyState.className = "empty-state-container";
        emptyState.innerHTML = `
          <div class="empty-icon"><i class="fa-regular fa-clipboard"></i></div>
          <h3>Você ainda não tem exercícios</h3>
          <p>Que tal começar com uma de nossas recomendações ou criar um novo agora mesmo?</p>
          <div class="empty-actions">
              <button class="suggested-btn">Ver Sugestões</button>
              <button class="add-new-workout-btn secondary-empty-btn">Criar novo</button>
          </div>
        `;
        exercisesGrid.prepend(emptyState);
        return;
      }
      exercises.forEach((exercises) => uiExercise.addExerciseToList(exercises));
    } catch (error) {
      console.error("Render error:", error);
      alert("Erro ao renderizar exercícios");
    }
  },

  // NAAAAAAAAAAAAAAAOOOOOOOOOOOOOOOOOOOOOOOOOOOO
  openExercise(exercise) {
    const exercisePage = document.querySelector(
      ".active-exercise-details-section",
    );
    const exercisesSection = document.querySelector(
      ".exercises-library-section",
    );
    // Preenche os textos da página de detalhes
    exercisePage.querySelector(".active-title").textContent = exercise.name;
    exercisePage.querySelector(".active-subtitle").textContent =
      exercise.subtitle;
    // Configura o botão de editar da tela de detalhes
    document.querySelector(".edit-workout-btn").onclick = () => {
      uiExercise.fillForm(exercise.id);
      document.querySelector("#exercise-modal").classList.add("active");
    };
    // Configura o botão de excluir da tela de detalhes
    document.querySelector(".delete-workout-btn").onclick = () => {
      uiExercise.confirmDeletionExercise(exercise);
    };
    // Troca as telas
    exercisesSection.classList.add("hidden");
    exercisePage.classList.remove("hidden");
  },

  // Adiciona um exercício a lista de vizualisação
  addExerciseToList(exercise) {
    const exercisesGrid = document.getElementById("exercises-grid");

    // Criando a Div principal do Card
    const exerciseCard = document.createElement("div");
    exerciseCard.setAttribute("data-id", exercise.id);
    exerciseCard.classList.add("exercise-mini-card");
    // ---
    // --- Div 1 interna ---
    const imageMuscle = document.createElement("div");
    imageMuscle.classList.add("mini-card-image");
    // Foto / Ícone
    let visualElement;
    if (
      exercise.icon &&
      (exercise.icon.startsWith("data:image") ||
        exercise.icon.startsWith("http"))
    ) {
      const img = document.createElement("img");
      img.src = exercise.icon;
      img.alt = `Foto de ${exercise.name}`;
      visualElement = img;
    } else {
      const i = document.createElement("i");
      const iconMap = {
        dumbbell: "dumbbell",
        running: "person-running",
        "weight-hanging": "weight-hanging",
        bolt: "bolt",
      };
      const iconName = iconMap[exercise.icon] || "dumbbell";
      i.className = `fa-solid fa-${iconName}`;
      visualElement = i;
    }
    // Span do músculo
    const categoryBadge = document.createElement("span");
    categoryBadge.classList.add("category-badge");
    categoryBadge.textContent = exercise.muscle;
    // Montagem
    imageMuscle.appendChild(visualElement);
    imageMuscle.appendChild(categoryBadge);
    exerciseCard.appendChild(imageMuscle);
    // ---
    // --- Div 2 interna ---
    const miniCardInfo = document.createElement("div");
    miniCardInfo.classList.add("mini-card-info");
    // Título 
    const title = document.createElement("h4");
    title.textContent = exercise.name;
    // Stats
    const statsContainer = document.createElement("div");
    statsContainer.classList.add("exercise-stats");
    // Séries, Reps, Carga
    const createStat = (iconClass, text) => {
      const span = document.createElement("span");
      span.innerHTML = `<i class="fa-solid ${iconClass}"></i> ${text}`;
      return span;
    };
    // Adicionando os 3 ícones 
    statsContainer.appendChild(
      createStat("fa-layer-group", `${exercise.series} Séries`),
    );
    statsContainer.appendChild(
      createStat("fa-rotate-right", `${exercise.repetitions} Reps`),
    );
    statsContainer.appendChild(
      createStat("fa-weight-hanging", `${exercise.load}kg`),
    );
    // Montagem
    miniCardInfo.appendChild(title);
    miniCardInfo.appendChild(statsContainer);
    // ----
    // Botão de Opções 
    const optionsBtn = document.createElement("button");
    optionsBtn.classList.add("mini-card-options");
    optionsBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
    // ---
    // Montagem Final 
    exerciseCard.appendChild(miniCardInfo);
    exerciseCard.appendChild(optionsBtn);
    exercisesGrid.appendChild(exerciseCard);
    // ---
    // Configura a tela de detalhes para o exercício clicado, possibilitando editar e excluir
    exerciseCard.onclick = () => uiExercise.openexercise(exercise);
  },

  // Função de exclusão
  confirmDeletionExercise(exercise) {
    const modalOverlay = document.createElement("div");
    modalOverlay.className = "confirm-modal-overlay";
    modalOverlay.innerHTML = `
      <div class="confirm-modal-card">
        <h3>Excluir ${exercise.name}?</h3>
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
      await exercisesApi.deleteExercises(exercise.id);
      modalOverlay.remove();
      document.querySelector(".active-workout-section").classList.add("hidden");
      document.querySelector(".workouts-section").classList.remove("hidden");
      uiExercise.renderexercises();
    };
  },
};

export default uiExercise;
