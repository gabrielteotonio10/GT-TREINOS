import uiTraining from "./ui.js";
import trainingApi from "./api.js";

// ---------- FUNÇÕES GERAIS (GENERAL FUNCTIONS) ----------
const modalContainer = document.querySelector(".modal-container");
// Fechar o modal
const closeModal = () => {
  modalContainer.classList.remove("active");
};

// ---------- TREINOS (WORKOUTS) ----------

// Inicialização do DOM
document.addEventListener("DOMContentLoaded", () => {
  uiTraining.renderTrainings();
  const trainingForm = document.querySelector("#training-form");

  // Quando formulário for enviado
  trainingForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    // Obtém dados do UI
    const { id, name, subtitle, icon } = uiTraining.getFormData();
    try {
      // Se tem ID edita (Update), senão salva (Create)
      if (id) {
        await trainingApi.updateTraining({ id, name, subtitle, icon });
      } else {
        await trainingApi.createTraining({ name, subtitle, icon });
      }
      // Limpeza e Feedback
      uiTraining.clearForm();
      closeModal();
      // Mensagem sucesso
      const successMessage = id
        ? "Treino atualizado com sucesso!"
        : "Treino criado com sucesso!";
      uiTraining.showToast(successMessage);
      // Renderizar treinos
      uiTraining.renderTrainings();
      event.preventDefault();
    } catch (error) {
      console.error("Erro detalhado:", error);
      alert("Não foi possível salvar: " + error.message);
    }
  });
});

// Captura a imagem selecionada
const trainingPhotoInput = document.querySelector("#training-photo-input");
trainingPhotoInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    uiTraining.convertPhoto(file);
  }
});
