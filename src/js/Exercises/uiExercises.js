import exercisesApi from "./apiExercises.js";

let convertedPhotoExercise = "";
const uiExercises = {
  // Converte uma foto enviada, caso tenha, para ser armazenada, diminuindo seu tamanho
  convertPhotoExercises(file) {
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
        convertedPhotoExercise = canvas.toDataURL("image/jpeg", 0.7);

        console.log("Foto redimensionada e pronta!");

        // Atualiza a cor do ícone no HTML refatorado
        const uploadIcon = document.querySelector(
          "#exercise-modal .upload-option .icon-box i",
        );
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
    if (convertedPhotoExercise !== "") icon = convertedPhotoExercise;
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
    convertedPhotoExercise = "";
    // Reseta a cor do ícone
    const uploadIcon = document.querySelector(
      "#exercise-modal .upload-option .icon-box i",
    );
    if (uploadIcon) uploadIcon.style.color = "";
    console.log("Formulário de exercício limpo!");
  },

  // Preenche o formulário (Para edição)
  async fillFormExercise(exerciseId) {
    try {
      const exercise = await exercisesApi.getExercisesById(exerciseId);
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

  // Renderiza os exercícios
  async renderExercises(searchTerm = "") {
    const listContainer = document.querySelector("#exercises-list");
    if (!listContainer) return;

    try {
      const allExercises = await exercisesApi.getExercises();

      // Lógica para alterar a classe do título (se precisar)
      const presentationSection = document.querySelector(".presentation-text");
      const titleElement = document.querySelector("#library-section-title");
      if (titleElement && presentationSection) {
        if (presentationSection.classList.contains("hidden")) {
          titleElement.classList.add("exercise-view");
        } else {
          titleElement.classList.remove("exercise-view");
        }
      }

      // Limpa a grade atual
      listContainer.innerHTML = "";

      // Caso o banco de dados esteja totalmente vazio
      if (allExercises.length === 0) {
        listContainer.innerHTML = `
          <div class="empty-state-container" style="grid-column: 1 / -1;">
            <div class="empty-icon"><i class="fa-regular fa-clipboard"></i></div>
            <h3>Você ainda não tem exercícios</h3>
            <p>Que tal começar com uma de nossas recomendações ou criar um novo agora mesmo?</p>
            <div class="empty-actions">
              <button class="add-new-exercise-btn secondary-empty-btn">Criar novo</button>
            </div>
          </div>
        `;
        return;
      }

      // Filtra os exercícios com base no que foi digitado
      const term = searchTerm.toLowerCase();
      const filteredExercises = allExercises.filter((exercise) =>
        exercise.name.toLowerCase().includes(term),
      );

      // Sempre desenha o botão de "Criar Exercício" primeiro
      listContainer.innerHTML = `
        <div class="exercise-mini-card add-new-exercise-btn">
          <i class="fa-solid fa-plus"></i>
          <p>Criar Exercício</p>
        </div>
      `;

      // Se o usuário pesquisou algo que não existe
      if (filteredExercises.length === 0) {
        listContainer.innerHTML += `
          <div style="grid-column: 1 / -1; text-align: center; padding: 30px; color: #666;">
            <p>Nenhum exercício "${searchTerm}" encontrado.</p>
          </div>
        `;
        return;
      }

      // Se passou no filtro, desenha os cards
      filteredExercises.forEach((exercise) => this.addExerciseToList(exercise));
    } catch (error) {
      console.error("Render error:", error);
      alert("Erro ao renderizar exercícios");
    }
  },

  // Renderiza a lista de exercícios da barra de pesquisa
  renderExercisesForSelection(exercisesList, input) {
    const listContainer = document.querySelector(`${input}`);
    listContainer.innerHTML = "";

    if (exercisesList.length === 0) {
      listContainer.innerHTML =
        '<p class="empty-state">Nenhum exercício encontrado.</p>';
      return;
    }

    exercisesList.forEach((exercise) => {
      const item = document.createElement("div");
      item.className = "selectable-exercise-item";

      // Foto/Ícone
      let visualMedia;
      if (
        exercise.icon &&
        (exercise.icon.startsWith("data:image") ||
          exercise.icon.startsWith("http"))
      ) {
        visualMedia = `<img src="${exercise.icon}" alt="${exercise.name}" class="mini-selection-img">`;
      } else {
        const iconMap = {
          dumbbell: "dumbbell",
          running: "person-running",
          "weight-hanging": "weight-hanging",
          bolt: "bolt",
        };
        const iconName = iconMap[exercise.icon] || "dumbbell";
        visualMedia = `<div class="mini-selection-icon"><i class="fa-solid fa-${iconName}"></i></div>`;
      }
      // Mostrando
      item.innerHTML = `
        <div class="selectable-content-left">
            ${visualMedia}
            <div class="selectable-exercise-info">
                <h4>${exercise.name}</h4>
                <p>${exercise.muscle}</p>
            </div>
        </div>
        <button class="selectable-exercise-add-btn" data-id="${exercise.id}">
            <i class="fa-solid fa-plus"></i>
        </button>
    `;
      listContainer.appendChild(item);
    });
  },

  // Open exercise
  openExercise(exercise) {
    const exercisePage = document.querySelector(
      ".active-exercise-details-section",
    );
    const exercisesSection = document.querySelector(
      ".exercises-library-section",
    );
    const workoutsSection = document.querySelector(".workouts-section");
    const presentationText = document.querySelector(".presentation-text");
    const websitePresentation = document.querySelector(".website-presentation");
    [
      exercisesSection,
      workoutsSection,
      presentationText,
      websitePresentation,
    ].forEach((section) => {
      if (section) section.classList.add("hidden");
    });

    // Preenche os textos usando os IDs do HTML
    document.querySelector("#detail-exercise-name").textContent = exercise.name;

    document.querySelector("#detail-exercise-muscle").innerHTML =
      `<i class="fa-solid fa-dna"></i> Músculo: ${exercise.muscle}`;
    // Estatísticas
    document.querySelector("#detail-exercise-series").textContent =
      exercise.series || "-";
    document.querySelector("#detail-exercise-reps").textContent =
      exercise.repetitions || "-";
    document.querySelector("#detail-exercise-load").textContent = exercise.load
      ? `${exercise.load} kg`
      : "-";
    // Descrições
    document.querySelector("#detail-exercise-equipment").textContent =
      exercise.equipment || "Nenhum";
    document.querySelector("#detail-exercise-description").textContent =
      exercise.description || "Sem descrição.";

    // Atualiza a foto principal do exercício
    const heroContainer = document.querySelector(".exercise-hero-image");
    heroContainer.innerHTML = "";
    if (
      exercise.icon &&
      (exercise.icon.startsWith("data:image") ||
        exercise.icon.startsWith("http"))
    ) {
      // O usuário subiu uma FOTO
      const img = document.createElement("img");
      img.src = exercise.icon;
      img.alt = `Foto de ${exercise.name}`;
      heroContainer.appendChild(img);
    } else {
      // O usuário escolheu um ÍCONE
      const iconContainer = document.createElement("div");
      iconContainer.classList.add("hero-icon-wrapper");
      // Mapeamento para garantir que pegamos o ícone certo
      const iconMap = {
        dumbbell: "dumbbell",
        running: "person-running",
        "weight-hanging": "weight-hanging",
        bolt: "bolt",
      };
      const iconName = iconMap[exercise.icon] || "dumbbell";
      iconContainer.innerHTML = `<i class="fa-solid fa-${iconName}"></i>`;
      heroContainer.appendChild(iconContainer);
    }

    // Botão excluir
    document.querySelector(".delete-exercise-library-btn").onclick = () => {
      this.confirmDeletionExercise(exercise);
    };

    exercisePage.classList.remove("hidden");

    // Início da tela
    window.scrollTo({
      top: 150,
      behavior: "smooth",
    });
  },

  // Adiciona um exercício a lista de vizualisação
  addExerciseToList(exercise) {
    const exercisesGrid = document.querySelector("#exercises-list");

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
      imageMuscle.classList.add("is-icon");
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
    // Botão de editar
    const optionsBtn = document.createElement("button");
    optionsBtn.classList.add("mini-card-options");
    optionsBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
    // Botão editar ação
    const optionsBtn2 = document.querySelector(".edit-exercise-btn");
    const handleEditClick = (event) => {
      event.stopPropagation();
      this.fillFormExercise(exercise.id);
      const modal = document.querySelector("#exercise-modal");
      modal.classList.add("active");
      modal.classList.remove("hidden");
      document.querySelector("#exercise-modal-title").textContent =
        "Editar Exercício";
    };
    optionsBtn.onclick = handleEditClick;
    optionsBtn2.onclick = handleEditClick;
    // ---
    // Montagem Final
    exerciseCard.appendChild(miniCardInfo);
    exerciseCard.appendChild(optionsBtn);
    exercisesGrid.appendChild(exerciseCard);
    // ---
    // Configura a tela de detalhes para o exercício clicado, possibilitando editar e excluir
    exerciseCard.onclick = () => this.openExercise(exercise);
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
      document
        .querySelector(".active-exercise-details-section")
        .classList.add("hidden");
      document
        .querySelector(".exercises-library-section")
        .classList.remove("hidden");
      document.querySelector(".workouts-section").classList.remove("hidden");
      uiExercises.renderExercises();
    };
  },
};

export default uiExercises;
