import trainingApi from "./apiTraining.js";
import apiExercises from "../Exercises/apiExercises.js";
import uiExercises from "../Exercises/uiExercises.js";

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
  addExerciseToSelection(exerciseId, btnElement) {
    const exerciseItem = btnElement.closest(".selectable-exercise-item");
    const infoContainer = exerciseItem.querySelector(
      ".selectable-exercise-info div",
    );
    if (!selectedExercisesIds.includes(exerciseId)) {
      // adiciona
      selectedExercisesIds.push(exerciseId);
      console.log("Lista atual de IDs:", selectedExercisesIds);
      this.showToastTraining("Exercício adicionado à ficha!");
      // Muda o botão para Menos (Vermelho)
      if (btnElement) {
        btnElement.innerHTML = `<i class="fa-solid fa-minus"></i>`;
        btnElement.style.color = "#e74c3c";
        btnElement.style.borderColor = "#e74c3c";
      }
      // Faz o exercício adicionado aparecer uma mensagem
      if (infoContainer && !infoContainer.querySelector(".added-label")) {
        const badge = document.createElement("span");
        badge.className = "added-label";
        badge.textContent = "Adicionado";
        infoContainer.appendChild(badge);
      }
      // Faz o exercício adicionado ir ao topo da lista
      if (exerciseItem) {
        const listContainer = exerciseItem.parentElement;
        listContainer.prepend(exerciseItem);
      }
    } else {
      // remove
      selectedExercisesIds = selectedExercisesIds.filter(
        (id) => id !== exerciseId,
      );
      this.showToastTraining("Exercício removido!", "error");
      // Modifica o botão ao remover
      if (btnElement) {
        btnElement.innerHTML = `<i class="fa-solid fa-plus"></i>`;
        btnElement.style.color = "";
        btnElement.style.borderColor = "";
      }
      // Faz o exercício removido sumir com a mensagem
      const badge = infoContainer.querySelector(".added-label");
      if (badge) {
        badge.remove();
      }
      // Faz o exercício removido sair do topo da lista
      if (exerciseItem) {
        const listContainer = exerciseItem.parentElement;
        listContainer.appendChild(exerciseItem);
      }
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

    // Lógica do usuário
    const userString = localStorage.getItem("currentUser");
    const userEmail = userString ? JSON.parse(userString).email : null;

   const data = { name, subtitle, icon, exercises, userEmail };
   // Só adiciona o ID no pacote se ele realmente existir
   if (id) {
     data.id = id;
   }
   return data;
  },

  // Salva um Exercício dentro do treino
  async addExerciseToExistingTraining(exerciseId, btnElement) {
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

    if (!currentActiveTraining.exercises.includes(exerciseId)) {
      // Adiciona ao banco
      currentActiveTraining.exercises.push(exerciseId);
      try {
        await trainingApi.updateTraining(currentActiveTraining);
        console.log(
          "Atualizado direto no banco:",
          currentActiveTraining.exercises,
        );
        this.showToastTraining("Exercício adicionado à ficha!");
        // Muda o botão para Menos (Vermelho)
        if (btnElement) {
          btnElement.innerHTML = `<i class="fa-solid fa-minus"></i>`;
          btnElement.style.color = "#e74c3c";
          btnElement.style.borderColor = "#e74c3c";
        }
        // Adiciona o texto na hora
        if (infoContainer && !infoContainer.querySelector(".added-label")) {
          const badge = document.createElement("span");
          badge.className = "added-label";
          badge.textContent = "Adicionado";
          infoContainer.appendChild(badge);
        }
        // Faz o exercício adicionado ir ao topo da lista
        if (exerciseItem) {
          const listContainer = exerciseItem.parentElement;
          listContainer.prepend(exerciseItem);
        }
      } catch (error) {
        console.error("Erro ao atualizar treino:", error);
      }
    } else {
      // remove do banco
      currentActiveTraining.exercises = currentActiveTraining.exercises.filter(
        (id) => id !== exerciseId,
      );
      try {
        await trainingApi.updateTraining(currentActiveTraining);
        this.showToastTraining("Exercício removido do treino!", "error");

        // Volta o botão para Mais (Padrão)
        if (btnElement) {
          btnElement.innerHTML = `<i class="fa-solid fa-plus"></i>`;
          btnElement.style.color = "";
          btnElement.style.borderColor = "";
        }
        // Remove o texto na hora
        if (infoContainer) {
          const badge = infoContainer.querySelector(".added-label");
          if (badge) badge.remove();
        }
        // Faz o exercício removido sair do topo da lista
        if (exerciseItem) {
          const listContainer = exerciseItem.parentElement;
          listContainer.appendChild(exerciseItem);
        }
      } catch (error) {
        console.error("Erro ao remover exercício do treino:", error);
      }
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
    // Remove os badges e reseta botões de qualquer lista aberta
    document
      .querySelectorAll(".added-label")
      .forEach((badge) => badge.remove());
    document.querySelectorAll(".selectable-exercise-add-btn").forEach((btn) => {
      btn.innerHTML = `<i class="fa-solid fa-plus"></i>`;
      btn.style.color = "";
      btn.style.borderColor = "";
    });
    console.log("Estado de criação de treino limpo!");
  },

  // Preenche o formulário (Para edição)
  async fillFormTraining(trainingId) {
    document.querySelector("#training-modal-title").textContent =
      "Editar Treino";

    try {
      const training = await trainingApi.getTrainingById(trainingId);

      // Preenchimento básico
      document.querySelector("#training-id").value = training.id;
      document.querySelector("#training-name").value = training.name;
      document.querySelector("#training-subtitle").value =
        training.subtitle || "";
      selectedExercisesIds = training.exercises ? [...training.exercises] : [];

      // --- LÓGICA DO ÍCONE ---
      const uploadIcon = document.querySelector(".upload-option .icon-box i");
      if (uploadIcon) uploadIcon.style.color = "";

      // Desmarca todos os rádios primeiro para garantir um estado limpo
      document
        .querySelectorAll('input[name="training-icon"]')
        .forEach((input) => (input.checked = false));

      // Verifica se o ícone é uma imagem ou um nome de ícone
      if (training.icon && training.icon.startsWith("data:image")) {
        // É uma foto: destaca o ícone da câmera
        if (uploadIcon) uploadIcon.style.color = "#4CAF50";
      } else {
        // É um ícone: tenta marcar o rádio correspondente
        const iconToSelect = document.querySelector(
          `input[name="training-icon"][value="${training.icon}"]`,
        );
        if (iconToSelect) iconToSelect.checked = true;
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
  async openTraining(training) {
    // Guarda o treino na memória
    currentActiveTraining = training;

    // Arruma a vizualização (Seleciona as telas que vão sumir)
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

    // Preenche os textos da página de detalhes com o nome do Treino
    trainingPage.querySelector(".active-title").textContent = training.name;
    trainingPage.querySelector(".active-subtitle").textContent =
      training.subtitle;

    // Configura o botão de editar da tela de detalhes
    // Usamos cloneNode para resetar o botão e não editar o treino errado
    const btnEdit = document.querySelector(".edit-workout-btn");
    const btnEditClone = btnEdit.cloneNode(true);
    btnEdit.parentNode.replaceChild(btnEditClone, btnEdit);

    btnEditClone.onclick = async () => {
      // Espera (await) preencher do banco antes de abrir
      await uiTraining.fillFormTraining(training.id);
      document.querySelector("#training-modal").classList.add("active");
    };

    // Configura o botão de excluir da tela de detalhes
    const btnDelete = document.querySelector(".delete-workout-btn");
    const btnDeleteClone = btnDelete.cloneNode(true);
    btnDelete.parentNode.replaceChild(btnDeleteClone, btnDelete);

    btnDeleteClone.onclick = () => {
      uiTraining.confirmExclusionTraining(training);
    };

    // Troca as telas
    workoutsSection.classList.add("hidden");
    trainingPage.classList.remove("hidden");

    // Esconde a biblioteca de exercícios, se estiver aberta
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

    // Pegando exercícios para mostrar na tela DENTRO DO TREINO
    try {
      // Pega o array com TODOS os exercícios do usuário
      const allExercises = await apiExercises.getExercises();

      // Validação extra: Garante que training.exercises é um array (evita quebrar se vier null)
      const trainingExIds = Array.isArray(training.exercises)
        ? training.exercises
        : [];

      // Filtra para pegar apenas os que estão nesta ficha
      const fullExercises = allExercises.filter((exercise) => {
        // ATENÇÃO: Convertendo para String() para evitar que o PC ache que 1 é diferente de "1"
        return trainingExIds.some((id) => String(id) === String(exercise.id));
      });

      // Seção HTML onde a lista vai aparecer
      const trainingPart = document.querySelector(".active-exercises-list");
      trainingPart.innerHTML = "";
      let htmlContent = "";

      // Criando o código visual de cada exercício
      fullExercises.forEach((exercise) => {
        // Tratamento especial para o ícone na lista do treino (se for string ou foto)
        let iconHtml;
        if (exercise.icon && exercise.icon.startsWith("data:image")) {
          iconHtml = `<img src="${exercise.icon}" alt="${exercise.name}" class="exercise-img">`;
        } else {
          const iconMap = {
            dumbbell: "dumbbell",
            running: "person-running",
            "weight-hanging": "weight-hanging",
            bolt: "bolt",
          };
          const iconName = iconMap[exercise.icon] || "dumbbell";
          // Cria uma "caixinha" redonda com o ícone, imitando a foto
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
      // Injeta na tela
      trainingPart.innerHTML = htmlContent;

      // Evento de clique para abrir cada um dos exercícios dentro da ficha de treino
      trainingPart.querySelectorAll(".exercise-item").forEach((card) => {
        card.onclick = () => {
          const exerciseId = card.dataset.id;

          // Procura o objeto exato no Array (Forçando String novamente)
          const exerciseData = fullExercises.find(
            (ex) => String(ex.id) === String(exerciseId),
          );

          if (exerciseData) {
            // Esconde a página do treino para não ficar uma embaixo da outra
            document
              .querySelector(".active-workout-section")
              .classList.add("hidden");

            // Coloca memória na setinha para ela saber de onde veio (do treino)
            const backArrow = document.querySelector(
              ".back-arrow-exercise-btn",
            );
            if (backArrow) {
              backArrow.setAttribute("data-from", "training");
            }
            // Abre a tela focada
            uiExercises.openExercise(exerciseData);
          }
        };
      });
    } catch (error) {
      console.error("Erro ao carregar exercícios:", error);
    }
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
    editBtn.onclick = async (event) => {
      // Transformamos em async
      event.stopPropagation();
      // Preenche os dados básicos
      await uiTraining.fillFormTraining(training.id);
      // Abre o Modal
      document.querySelector("#training-modal").classList.add("active");
      // Busca os exercícios
      try {
        const allExercises = await apiExercises.getExercises();
        const selectedIds = training.exercises || [];
        // Ordena para os selecionados ficarem no topo
        allExercises.sort((a, b) => {
          const aSel = selectedIds.includes(a.id);
          const bSel = selectedIds.includes(b.id);
          return aSel === bSel ? 0 : aSel ? -1 : 1;
        });
        // Renderiza direto no container do formulário
        uiExercises.renderExercisesForSelection(
          allExercises,
          "#selected-exercises-list-form",
          selectedIds,
        );
      } catch (error) {
        console.error("Erro ao carregar exercícios no editar:", error);
      }
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

  // Pega os ids dos exercícios de cada treino
  getCurrentSelectedIds() {
    // Se tiver um treino aberto na tela, retorna os exercícios dele
    if (currentActiveTraining) {
      return currentActiveTraining.exercises || [];
    }
    // Senão, retorna os exercícios do formulário de criação/edição
    return selectedExercisesIds || [];
  },
};

export default uiTraining;
