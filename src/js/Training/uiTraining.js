import trainingApi from "./apiTraining.js";

let convertedPhoto = "";
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
    return { id, name, subtitle, icon };
  },

  // Limpa o formulário totalmente
  clearFormTraining() {
    document.querySelector("#training-form").reset();
    document.querySelector("#training-id").value = "";
    convertedPhoto = "";
    document.querySelector("#training-subtitle").value = "";
    // Reseta a cor do ícone
    const uploadIcon = document.querySelector(".upload-option .icon-box i");
    if (uploadIcon) uploadIcon.style.color = "";
  },

  // Preenche o formulário (Para edição)
  async fillFormTraining(trainingId) {
    try {
      const training = await trainingApi.getTrainingById(trainingId);
      document.querySelector("#training-id").value = training.id;
      document.querySelector("#training-name").value = training.name;
      document.querySelector("#training-subtitle").value =
        training.subtitle || "";
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
  showToastTraining(message) {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.classList.add("toast-notification");
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("fade-out");
      toast.addEventListener("transitionend", () => toast.remove());
    }, 3000);
  },

  // Renderiza a lista de treinos na tela
  async renderTrainings() {
    const sectionTrainings = document.querySelector(".workouts-section");
    try {
      const trainings = await trainingApi.getTrainings();
      const presentationSection = document.querySelector(".presentation-text");
      const isTrainingPage = presentationSection.classList.contains("hidden");
      // Se não tem treinos cadastrados
      if (trainings.length === 0) {
        sectionTrainings.innerHTML = `
                <h2 class="section-title ${isTrainingPage ? "training-view" : ""}">Meus Treinos</h2>
                <div class="workouts-grid" id="workouts-grid">
                    <div class="empty-state-container">
                        <div class="empty-icon"><i class="fa-regular fa-clipboard"></i></div>
                        <h3>Você ainda não tem treinos</h3>
                        <p>Que tal começar com uma de nossas recomendações ou criar um novo agora mesmo?</p>
                        <div class="empty-actions">
                            <button class="add-new-workout-btn secondary-empty-btn">Criar novo</button>
                        </div>
                    </div>
                </div>
            `;
        return; // Encerra
      }
      // Se houver treinos
      sectionTrainings.innerHTML = `
            <h2 class="section-title ${isTrainingPage ? "training-view" : ""}">Meus Treinos</h2>
            <div class="workouts-grid" id="workouts-grid">
                <div class="workout-card add-new-workout add-new-workout-btn">
                    <div class="icon-container"><i class="fa-solid fa-plus"></i></div>
                    <h3>Novo Treino</h3>
                </div>
            </div>
        `;
      // Adiciona os cards dos treinos existentes
      trainings.forEach((training) => uiTraining.addTrainingToList(training));
    } catch (error) {
      console.error("Render error:", error);
      alert("Erro ao renderizar treinos");
    }
  },

  // Abre o treino
  openTraining(training) {
    // Arruma a vizualização
    const trainingPage = document.querySelector(".active-workout-section");
    const workoutsSection = document.querySelector(".workouts-section");
    const exerciseSection = document.querySelector(
      ".exercises-library-section",
    );
    const presentationText = document.querySelector(".presentation-text");
    const websitePresentation = document.querySelector(".website-presentation");
    [
      workoutsSection,
      exerciseSection,
      presentationText,
      websitePresentation,
    ].forEach((section) => {
      if (section) section.classList.add("hidden");
    });

    // Preenche os textos da página de detalhes
    trainingPage.querySelector(".active-title").textContent = training.name;
    trainingPage.querySelector(".active-subtitle").textContent = training.subtitle;

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
