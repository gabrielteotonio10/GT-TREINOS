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
    const { id, name, subtitle, icon, exercises } = uiTraining.getFormDataTraining();
    try {
      // Se tem ID edita (Update), senão salva (Create)
      if (id) {
        await apiTraining.updateTraining({id, name, subtitle, icon, exercises});
      } else {
        await apiTraining.createTraining({ name, subtitle, icon, exercises });
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

  // --------------------------- PESQUISA NA BIBLIOTECA DE TREINOS ---------------------------
  const trainingsSearchInput = document.querySelector(
    "#trainings-search-input",
  );
  if (trainingsSearchInput) {
    trainingsSearchInput.addEventListener("input", (event) => {
      uiTraining.renderTrainings(event.target.value);
    });
  }

  // --------------------------- PESQUISA EXERCÍCIOS ---------------------------

  // --- BARRA DE PESQUISA DA BIBLIOTECA DE EXERCÍCIOS ---
  const exercisesSearchInput = document.querySelector(
    "#exercises-search-input",
  );
  if (exercisesSearchInput) {
    exercisesSearchInput.addEventListener("input", (event) => {
      uiExercises.renderExercises(event.target.value);
    });
  }
  // --- BARRA DE PESQUISA DA CRIAÇÃO E EDIÇÃO ---
  // Mostra todos os exercícios na pesquisa
  const seeAllInSearch = (selector, targetContainer) => {
    document.addEventListener("click", async (event) => {
      if (event.target.closest(selector)) {
        try {
          const allExercises = await apiExercises.getExercises();
          const selectedIds = uiTraining.getCurrentSelectedIds(); // Pega os IDs
          // Selecionados sobem para o topo
          allExercises.sort((a, b) => {
            const aSelecionado = selectedIds.includes(a.id);
            const bSelecionado = selectedIds.includes(b.id);
            if (aSelecionado && !bSelecionado) return -1;
            if (!aSelecionado && bSelecionado) return 1;
            return 0;
          });
          // Passa os 3 parâmetros agora
          uiExercises.renderExercisesForSelection(allExercises, targetContainer, selectedIds);
        } catch (error) {
          console.error("Erro ao carregar lista de exercícios:", error);
        }
      }
    });
  };

  // Mostra as pesquisas
  const setupSearchExercise = (inputElement, inputElement2) => {
    if (!inputElement) return;
    
    inputElement.addEventListener("input", async (event) => {
      const term = event.target.value.toLowerCase();
      try {
        const allExercises = await apiExercises.getExercises();
        const selectedIds = uiTraining.getCurrentSelectedIds(); // Pega os IDs

        const filteredExercises = allExercises.filter((exercise) =>
          exercise.name.toLowerCase().includes(term),
        );

        // Ordena e sobe todos ao topo
        filteredExercises.sort((a, b) => {
          const aSelecionado = selectedIds.includes(a.id);
          const bSelecionado = selectedIds.includes(b.id);
          if (aSelecionado && !bSelecionado) return -1;
          if (!aSelecionado && bSelecionado) return 1;
          return 0;
        });

        // Passa os 3 parâmetros agora
        uiExercises.renderExercisesForSelection(filteredExercises, inputElement2, selectedIds);
      } catch (error) {
        console.error("Erro ao filtrar exercícios:", error);
      }
    });
  };
  // Variáveis para mostrar available-exercises-list
  // Para setupSearchExercise
  const searchInput = document.querySelector("#search-exercise-input");
  const searchInputForm = document.querySelector("#exercise-search");

  const listId = "#available-exercises-list";
  const listIdForm = "#selected-exercises-list-form";

  setupSearchExercise(searchInput, listId);
  setupSearchExercise(searchInputForm, listIdForm);

  // Para seeAllInSearch 
  seeAllInSearch(".add-exercise-to-workout-btn", listId);
  seeAllInSearch(".add-new-workout-btn, .add-new-workout, .edit-icon, .edit-workout-btn, #exercise-search", listIdForm);
});

  // --------------------------- CAPTURANDO EXERCÍCIOS ---------------------------

document.addEventListener("click", async (event) => {
  const target = event.target.closest(".selectable-exercise-add-btn");
  if (target) {
    event.preventDefault();
    const exerciseId = target.dataset.id;
    const isFromSelectModal = target.closest("#select-exercise-modal");

    if (isFromSelectModal) {
      uiTraining.addExerciseToExistingTraining(exerciseId, target);
    } else {
      uiTraining.addExerciseToSelection(exerciseId, target);
    }

    const allExercises = await apiExercises.getExercises(); 
    const selectedIds = uiTraining.getCurrentSelectedIds();
    // Re-ordena para manter os selecionados no topo
    allExercises.sort((a, b) => {
      const aSel = selectedIds.includes(a.id);
      const bSel = selectedIds.includes(b.id);
      return (aSel === bSel) ? 0 : aSel ? -1 : 1;
    });
    // Chama o render novamente, fazendo a palavra "Adicionado sumir"
    uiExercises.renderExercisesForSelection(allExercises, "#select-exercise-list", selectedIds);
  }
});
