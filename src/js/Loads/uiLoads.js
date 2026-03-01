import loadsApi from "./apiLoads.js";
import uiExercises from "../Exercises/uiExercises.js";
import apiExercises from "../Exercises/apiExercises.js";

const uiLoads = {
  // Desenha as cargas e atualiza a carga oficial do exercício
  async renderLoadsForExercise(exerciseId) {
    const listContainer = document.querySelector("#load-history-list");
    if (!listContainer) return;

    listContainer.innerHTML =
      '<p style="text-align: center; color: #888;">Carregando histórico...</p>';

    try {
      const allMyLoads = await loadsApi.getLoads();
      const exerciseLoads = allMyLoads.filter(
        (load) => load.exerciseId === exerciseId,
      );

      // Ordena da mais recente para a mais antiga
      exerciseLoads.sort((a, b) => new Date(b.date) - new Date(a.date));

      // ==========================================================
      // LÓGICA DE SINCRONIZAÇÃO: A Carga mais recente vira a Oficial
      // ==========================================================
      const currentExercise = uiExercises.getCurrentActiveExerciseData();
      const loadDisplay = document.querySelector("#detail-exercise-load");

      let latestLoadValue = "";
      if (exerciseLoads.length > 0) {
        latestLoadValue = exerciseLoads[0].load; // Pega a mais recente
      }

      // Atualiza o texto na tela de detalhes
      if (loadDisplay) {
        loadDisplay.textContent =
          latestLoadValue !== "" ? `${latestLoadValue} kg` : "-";
      }

      // Atualiza o Banco de Dados APENAS se o peso for diferente do que já está lá
      if (
        currentExercise &&
        String(currentExercise.load) !== String(latestLoadValue)
      ) {
        currentExercise.load = latestLoadValue; // Atualiza o objeto
        await apiExercises.updateExercises(currentExercise); // Salva no BD silenciosamente
      }
      // ==========================================================

      if (exerciseLoads.length === 0) {
        listContainer.innerHTML =
          '<p style="text-align: center; color: #888; font-size: 0.9rem;">Nenhuma carga registrada ainda. Comece agora!</p>';
        return;
      }

      listContainer.innerHTML = "";
      exerciseLoads.forEach((load) => {
        const dateObj = new Date(load.date);
        const dataFormatada = dateObj.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });

        const li = document.createElement("li");
        li.style.cssText =
          "display: flex; justify-content: space-between; align-items: center; background: #f9f9f9; padding: 10px 15px; border-radius: 8px; border-left: 4px solid var(--primary-color, #007bff);";

        li.innerHTML = `
          <div>
            <span style="font-weight: bold; font-size: 1.1rem; color: #333;">${load.load} kg</span>
            <span style="color: #666; font-size: 0.9rem; margin-left: 5px;">(${load.reps} reps)</span>
          </div>
          <div style="display: flex; align-items: center; gap: 15px;">
            <span style="color: #888; font-size: 0.8rem;">${dataFormatada}</span>
            <button class="delete-load-btn" data-id="${load.id}" style="background: none; border: none; color: #dc3545; cursor: pointer;" aria-label="Apagar Carga"><i class="fa-solid fa-trash"></i></button>
          </div>
        `;
        listContainer.appendChild(li);
      });
    } catch (error) {
      listContainer.innerHTML =
        '<p style="color: red;">Erro ao carregar o histórico.</p>';
      console.error("Erro ao renderizar cargas:", error);
    }
  },
};

export default uiLoads;
