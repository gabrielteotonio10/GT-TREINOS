import uiTraining from "./ui.js";
import trainingApi from "./api.js";

// ---------- FUNÇÕES GERAIS (GENERAL FUNCTIONS) ----------

// Abrir e fechar modal de adicionar treino
const modalContainer = document.querySelector(".modal-container");
const addNewWorkoutCard = document.querySelector(".add-new-workout"); 
const closeXBtn = document.querySelector("#close-x-btn"); 
const cancelBtn = document.querySelector("#cancel-btn"); 

// Evento para abrir o modal
addNewWorkoutCard.addEventListener("click", () => {
  modalContainer.classList.add("active");
});

// Evento para abrir o modal se não existir treino
document.addEventListener("click", (event) => {
  const btn = event.target.closest(".add-new-workout-btn");

  if (btn) {
    const modalContainer = document.querySelector(".modal-container");
    if (modalContainer) {
      modalContainer.classList.add("active");
    }
  }
});

// Função para fechar o modal
const closeModal = () => {
  modalContainer.classList.remove("active");
};

// Eventos de fechar
closeXBtn.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);

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
