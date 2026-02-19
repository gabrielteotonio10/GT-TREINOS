import apiTraining from "./Training/apiTraining.js";
import uiTraining from "./Training/uiTraining.js";

import apiExercises from "./Exercises/apiExercises.js";
import uiExercises from "./Exercises/uiExercises.js";

// ---------- FUNÇÕES GERAIS (GENERAL FUNCTIONS) ----------
// Fechar o modal
const closeAllModals = () => {
  const modals = document.querySelectorAll(".modal-container");
  modals.forEach((modal) => modal.classList.remove("active"));
};

// Inicialização do DOM
document.addEventListener("DOMContentLoaded", () => {
  // ------ TREINOS ------
  uiTraining.renderTrainings();
  const trainingForm = document.querySelector("#training-form");

  // Quando formulário for enviado
  trainingForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    // Obtém dados do UI
    const { id, name, subtitle, icon } = uiTraining.getFormDataTraining();
    try {
      // Se tem ID edita (Update), senão salva (Create)
      if (id) {
        await apiTraining.updateTraining({ id, name, subtitle, icon });
      } else {
        await apiTraining.createTraining({ name, subtitle, icon });
      }
      // Limpeza e Feedback
      uiTraining.clearFormTraining();
      closeAllModals();
      // Mensagem sucesso
      const successMessage = id
        ? "Treino atualizado com sucesso!"
        : "Treino criado com sucesso!";
      uiTraining.showToastTraining(successMessage);
      // Renderizar treinos
      uiTraining.renderTrainings();
      event.preventDefault();
    } catch (error) {
      console.error("Erro detalhado:", error);
      alert("Não foi possível salvar: " + error.message);
    }
  });

  // ------ EXERCÍCIOS ------
  uiExercises.renderExercises();
  const exerciseForm = document.querySelector("#exercise-form");

  // Quando formulário for enviado
  exerciseForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    // Obtém dados do UI
    const {
      id,
      name,
      icon,
      muscle,
      equipment,
      series,
      repetitions,
      load,
      description,
    } = uiExercises.getFormDataExercise();
    try {
      // Se tem ID edita, senão salva
      if (id) {
        await apiExercises.updateExercises({
          id,
          name,
          icon,
          muscle,
          equipment,
          series,
          repetitions,
          load,
          description,
        });
      } else {
        await apiExercises.createExercises({
          name,
          icon,
          muscle,
          equipment,
          series,
          repetitions,
          load,
          description,
        });
      }
      // Limpeza e Feedback
      uiExercises.clearFormExercise();
      closeAllModals();
      // Mensagem sucesso
      const successMessage = id
        ? "Exercício atualizado com sucesso!"
        : "Exercício criado com sucesso!";
      uiExercises.showToastExercise(successMessage);
      // Renderizar exercícios
      uiExercises.renderExercises();
      event.preventDefault();
    } catch (error) {
      console.error("Erro detalhado:", error);
      alert("Não foi possível salvar: " + error.message);
    }
  });

  // Captura a imagem selecionada (EXERCÍCIOS)
  const exercisePhotoInput = document.querySelector("#exercise-photo-input");
  if (exercisePhotoInput) {
    console.log("testeeee");
    exercisePhotoInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) uiExercises.convertPhotoExercises(file); 
    });
  }

  // Captura a imagem selecionada (TREINOS)
  const trainingPhotoInput = document.querySelector("#training-photo-input");
  trainingPhotoInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      uiTraining.convertPhoto(file);
    }
  });
});