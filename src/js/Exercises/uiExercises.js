import exercisesApi from "./apiExercises.js";

// Variável global para armazenar a foto temporariamente durante a criação/edição
let convertedPhotoExercise = "";

const uiExercises = {
  // =================================================================
  // UPLOAD E CONVERSÃO DE IMAGEM
  // =================================================================

  // Converte uma foto enviada para base64 e diminui seu tamanho
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
        // Desmarca os ícones normais para a foto ter prioridade
        document
          .querySelectorAll('input[name="exercise-icon"]')
          .forEach((r) => (r.checked = false));

        // Atualiza a cor do ícone no HTML para indicar sucesso
        const uploadIcon = document.querySelector(
          "#exercise-modal .upload-option .icon-box i",
        );
        if (uploadIcon) uploadIcon.style.color = "#4CAF50";
      };
    };
    reader.readAsDataURL(file);
  },

  // =================================================================
  // MANIPULAÇÃO DE FORMULÁRIOS
  // =================================================================

  // Captura as informações do formulário e monta um objeto pra mandar pra API
  getFormDataExercise() {
    const id = document.querySelector("#exercise-id").value;

    // Seleciona o ícone marcado
    const iconInput = document.querySelector(
      'input[name="exercise-icon"]:checked',
    );
    let icon;

    // Ordem de prioridade: foto > ícone selecionado > padrão
    if (iconInput) {
      icon = iconInput.value; // Prioridade 1: Ícone marcado agora
    } else if (convertedPhotoExercise !== "") {
      icon = convertedPhotoExercise; // Prioridade 2: Foto em memória
    } else {
      icon = "dumbbell"; // Fallback: Padrão
    }

    const name = document.querySelector("#exercise-name").value;
    const muscle = document.querySelector("#exercise-muscle").value;
    const equipment = document.querySelector("#exercise-equipment").value;
    const series = document.querySelector("#exercise-series").value;
    const repetitions = document.querySelector("#exercise-repetitions").value;
    const load = document.querySelector("#exercise-load").value;
    const description = document.querySelector("#exercise-description").value;

    // Pega qual usuário tá logado
    const userString = localStorage.getItem("currentUser");
    const userEmail = userString ? JSON.parse(userString).email : null;

    const data = {
      name,
      icon,
      muscle,
      equipment,
      series,
      repetitions,
      load,
      description,
      userEmail,
    };

    // Só adiciona o ID se for edição (já existe no banco)
    if (id) {
      data.id = id;
    }

    return data;
  },

  // Limpa tudo: formulário, variáveis, ícone... tudo volta ao zero
  clearFormExercise() {
    document.querySelector("#exercise-form").reset();
    document.querySelector("#exercise-id").value = "";
    convertedPhotoExercise = ""; // Limpa a foto da memória

    // Reseta a cor do ícone de upload
    const uploadIcon = document.querySelector(
      "#exercise-modal .upload-option .icon-box i",
    );
    if (uploadIcon) uploadIcon.style.color = "";

    console.log("Formulário de exercício limpo!");
  },

  // Preenche o formulário com os dados de um exercício que já existe (para edição)
  async fillFormExercise(exerciseId) {
    document.querySelector("#exercise-modal-title").textContent =
      "Editar Exercício";

    try {
      // Busca o exercício do servidor
      const exercise = await exercisesApi.getExercisesById(exerciseId);

      // Preenche todos os campos com os dados dele
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

      // Lógica de pré-seleção da Foto/Ícone
      const iconToSelect = document.querySelector(
        `input[name="exercise-icon"][value="${exercise.icon}"]`,
      );
      if (iconToSelect) {
        iconToSelect.checked = true;
      } else if (exercise.icon && exercise.icon.startsWith("data:image")) {
        // Se tem foto salva, marca o upload como ativo
        const uploadIcon = document.querySelector(".upload-option .icon-box i");
        if (uploadIcon) uploadIcon.style.color = "#4CAF50";
        // Guarda a foto em memória
        convertedPhotoExercise = exercise.icon;
        // Desmarca os botões de ícone
        document
          .querySelectorAll('input[name="exercise-icon"]')
          .forEach((r) => (r.checked = false));
      }
    } catch (error) {
      console.error("Erro ao preencher formulário:", error);
    }
  },

  // Mostra um aviso/toast que some sozinho
  showToastExercise(message) {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.classList.add("toast-notification");
    document.body.appendChild(toast);

    // Depois de 3 segundos, anima a saída e remove
    setTimeout(() => {
      toast.classList.add("fade-out");
      toast.addEventListener("transitionend", () => toast.remove());
    }, 3000);
  },

  // =================================================================
  // RENDERIZAÇÃO NA TELA
  // =================================================================

  // Renderiza a grade de exercícios na biblioteca com filtro de busca
  async renderExercises(searchTerm = "") {
    const listContainer = document.querySelector("#exercises-list");
    if (!listContainer) return;

    try {
      // Busca todos os exercícios do usuário
      const allExercises = await exercisesApi.getExercises();

      // Ajusta o estilo do título dependendo de qual aba tá aberta
      const presentationSection = document.querySelector(".presentation-text");
      const titleElement = document.querySelector("#exercises-section-title");
      if (titleElement && presentationSection) {
        if (presentationSection.classList.contains("hidden")) {
          titleElement.classList.add("exercise-view");
        } else {
          titleElement.classList.remove("exercise-view");
        }
      }

      // Limpa a grade
      listContainer.innerHTML = "";

      // Se não tem nenhum exercício criado
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

      // Filtra baseado no termo de busca
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

      // Mensagem se a busca não achou nada
      if (filteredExercises.length === 0) {
        listContainer.innerHTML += `
          <div style="grid-column: 1fr; text-align: left; padding: 20px 0; color: #666; width: 100%;">
            <p>Nenhum exercício <strong>"${searchTerm}"</strong> encontrado.</p>
           </div>
        `;
        return;
      }

      // Renderiza cada exercício como um card
      filteredExercises.forEach((exercise) => this.addExerciseToList(exercise));
    } catch (error) {
      console.error("Render error:", error);
      alert("Erro ao renderizar exercícios");
    }
  },

  // Renderiza a lista vertical (Modal de Seleção para adicionar ao Treino)
  renderExercisesForSelection(exercisesList, input, selectedIds = []) {
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

      // Foto ou Ícone
      let visualMedia;
      if (
        exercise.icon &&
        (exercise.icon.startsWith("data:image") ||
          exercise.icon.startsWith("http"))
      ) {
        visualMedia = `<img src="${exercise.icon}" alt="${exercise.name}" class="mini-selection-img">`;
      } else {
        // Todos os ícones suportados
        const iconMap = {
          dumbbell: "dumbbell",
          running: "person-running",
          "weight-hanging": "weight-hanging",
          bolt: "bolt",
          "heart-pulse": "heart-pulse",
          fire: "fire",
          child: "child",
          "shoe-prints": "shoe-prints",
          bed: "bed",
        };
        const iconName = iconMap[exercise.icon] || "dumbbell";
        visualMedia = `<div class="mini-selection-icon"><i class="fa-solid fa-${iconName}"></i></div>`;
      }

      // Lógica de seleção (se já está no treino ou não)
      const isSelected = selectedIds.includes(exercise.id);
      const btnIcon = isSelected
        ? '<i class="fa-solid fa-minus"></i>'
        : '<i class="fa-solid fa-plus"></i>';
      const btnStyle = isSelected
        ? 'style="color: #e74c3c; border-color: #e74c3c;"'
        : "";
      const addedBadge = isSelected
        ? '<span class="added-label">Adicionado</span>'
        : "";

      // Montagem do HTML
      item.innerHTML = `
        <div class="idExerciseList hidden">${exercise.id}</div>
        <div class="selectable-content-left">
            ${visualMedia}
            <div class="selectable-exercise-info">
              <div style="display: flex; align-items: center; gap: 8px;">
                <h4>${exercise.name}</h4>
                ${addedBadge}
              </div>
              <p>${exercise.muscle}</p>
            </div>
        </div>
        <button type="button" class="selectable-exercise-add-btn" data-id="${exercise.id}" ${btnStyle}>
            ${btnIcon}
        </button>
    `;
      listContainer.appendChild(item);
    });
  },

  // =================================================================
  // LÓGICA DE DETALHES E CARDS INDIVIDUAIS
  // =================================================================

  // Abre a página de detalhes de um exercício específico
  openExercise(exercise) {
    const exercisePage = document.querySelector(".active-exercise-details-section");
    const exercisesSection = document.querySelector(".exercises-library-section");
    const workoutsSection = document.querySelector(".workouts-section");
    const presentationText = document.querySelector(".presentation-text");
    const websitePresentation = document.querySelector(".website-presentation");
    const resultsSection = document.querySelector("#results-section");

    // Esconde as outras seções
    [
      exercisesSection,
      workoutsSection,
      presentationText,
      websitePresentation,
      resultsSection
    ].forEach((section) => {
      if (section) section.classList.add("hidden");
    });

    // Preenche os textos de detalhes
    document.querySelector("#detail-exercise-name").textContent = exercise.name;
    document.querySelector("#detail-exercise-muscle").innerHTML =
      `<i class="fa-solid fa-dna"></i> Músculo: ${exercise.muscle}`;
    document.querySelector("#detail-exercise-series").textContent =
      exercise.series || "-";
    document.querySelector("#detail-exercise-reps").textContent =
      exercise.repetitions || "-";
    document.querySelector("#detail-exercise-load").textContent = exercise.load
      ? `${exercise.load} kg`
      : "-";
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
      const img = document.createElement("img");
      img.src = exercise.icon;
      img.alt = `Foto de ${exercise.name}`;
      heroContainer.appendChild(img);
    } else {
      const iconContainer = document.createElement("div");
      iconContainer.classList.add("hero-icon-wrapper");
      // Todos os ícones suportados
      const iconMap = {
        dumbbell: "dumbbell",
        running: "person-running",
        "weight-hanging": "weight-hanging",
        bolt: "bolt",
        "heart-pulse": "heart-pulse",
        fire: "fire",
        child: "child",
        "shoe-prints": "shoe-prints",
        bed: "bed",
      };
      const iconName = iconMap[exercise.icon] || "dumbbell";
      iconContainer.innerHTML = `<i class="fa-solid fa-${iconName}"></i>`;
      heroContainer.appendChild(iconContainer);
    }

    // Configura o Botão de Editar (com cloneNode para resetar o evento anterior)
    const btnEdit = document.querySelector(".edit-exercise-btn");
    const btnEditClone = btnEdit.cloneNode(true);
    btnEdit.parentNode.replaceChild(btnEditClone, btnEdit);

    btnEditClone.onclick = async () => {
      await this.fillFormExercise(exercise.id);
      const modal = document.querySelector("#exercise-modal");
      modal.classList.add("active");
      modal.classList.remove("hidden");
    };

    // Configura o Botão de Excluir
    const btnDelete = document.querySelector(".delete-exercise-library-btn");
    const btnDeleteClone = btnDelete.cloneNode(true);
    btnDelete.parentNode.replaceChild(btnDeleteClone, btnDelete);

    btnDeleteClone.onclick = () => {
      this.confirmDeletionExercise(exercise);
    };

    // Exibe a página finalmente
    exercisePage.classList.remove("hidden");
    window.scrollTo({ top: 150, behavior: "smooth" });
  },

  // Monta o Card Miniatura na Biblioteca Principal
  addExerciseToList(exercise) {
    const exercisesGrid = document.querySelector("#exercises-list");

    const exerciseCard = document.createElement("div");
    exerciseCard.setAttribute("data-id", exercise.id);
    exerciseCard.classList.add("exercise-mini-card");

    // Div Superior (Imagem/Ícone)
    const imageMuscle = document.createElement("div");
    imageMuscle.classList.add("mini-card-image");

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
      // Todos os ícones suportados
      const iconMap = {
        dumbbell: "dumbbell",
        running: "person-running",
        "weight-hanging": "weight-hanging",
        bolt: "bolt",
        "heart-pulse": "heart-pulse",
        fire: "fire",
        child: "child",
        "shoe-prints": "shoe-prints",
        bed: "bed",
      };
      const iconName = iconMap[exercise.icon] || "dumbbell";
      i.className = `fa-solid fa-${iconName}`;
      visualElement = i;
    }

    const categoryBadge = document.createElement("span");
    categoryBadge.classList.add("category-badge");
    categoryBadge.textContent = exercise.muscle;

    imageMuscle.appendChild(visualElement);
    imageMuscle.appendChild(categoryBadge);
    exerciseCard.appendChild(imageMuscle);

    // Div Inferior (Informações)
    const miniCardInfo = document.createElement("div");
    miniCardInfo.classList.add("mini-card-info");

    const title = document.createElement("h4");
    title.textContent = exercise.name;

    const statsContainer = document.createElement("div");
    statsContainer.classList.add("exercise-stats");

    const createStat = (iconClass, text) => {
      const span = document.createElement("span");
      span.innerHTML = `<i class="fa-solid ${iconClass}"></i> ${text}`;
      return span;
    };

    statsContainer.appendChild(
      createStat("fa-layer-group", `${exercise.series} Séries`),
    );
    statsContainer.appendChild(
      createStat("fa-rotate-right", `${exercise.repetitions} Reps`),
    );
    statsContainer.appendChild(
      createStat("fa-weight-hanging", `${exercise.load}kg`),
    );

    miniCardInfo.appendChild(title);
    miniCardInfo.appendChild(statsContainer);

    // Botão Opções (Editar Card)
    const optionsBtn = document.createElement("button");
    optionsBtn.classList.add("mini-card-options");
    optionsBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
    optionsBtn.onclick = async (event) => {
      event.stopPropagation(); // Impede de abrir a tela de detalhes
      await this.fillFormExercise(exercise.id);
      const modal = document.querySelector("#exercise-modal");
      modal.classList.add("active");
      modal.classList.remove("hidden");
    };

    const idExercise = document.createElement("div");
    idExercise.innerHTML = `${exercise.id}`;
    idExercise.classList.add("idExerciseGeral", "hidden");

    // Montagem Final do Card
    exerciseCard.appendChild(miniCardInfo);
    exerciseCard.appendChild(optionsBtn);
    exerciseCard.appendChild(idExercise);

    // Configura clique do card para abrir detalhes
    exerciseCard.onclick = () => this.openExercise(exercise);

    exercisesGrid.appendChild(exerciseCard);
  },

  // Modal de Confirmação de Exclusão
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

      // Fecha a tela de detalhes e volta para a biblioteca de exercícios
      document
        .querySelector(".active-exercise-details-section")
        .classList.add("hidden");
      document
        .querySelector(".exercises-library-section")
        .classList.remove("hidden");
      document.querySelector(".workouts-section").classList.remove("hidden"); // Garante que a tab principal volte

      this.renderExercises();
    };
  },
};

export default uiExercises;
