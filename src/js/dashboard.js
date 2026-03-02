// src/js/dashboard.js
import apiTraining from "./Training/apiTraining.js";
import uiTraining from "./Training/uiTraining.js";
import apiExercises from "./Exercises/apiExercises.js";
import uiExercises from "./Exercises/uiExercises.js";

// ==========================================================================
// Função para desenhar a Home e a Aba de Resultados
// ==========================================================================
export async function renderDashboard() {
  const historyTraining = await apiTraining.getHistory();
  const totalTrainingsDone = historyTraining ? historyTraining.length : 0;

  const resultsContent = document.getElementById("results-content-area");

  // ==========================================================================
  // VARIÁVEIS DE CONTROLE (Prevenidas contra erro de ID vazio)
  // ==========================================================================
  let lastTrainingData = null;
  let sugestedTrainingData = null;
  let formattedDate = "--/--/----";
  let formattedTime = "--:--";

  // Só tenta buscar dados de histórico se o usuário já tiver feito pelo menos 1 treino
  if (totalTrainingsDone > 0) {
    const lastTrainingLog = historyTraining[historyTraining.length - 1];
    const date = new Date(lastTrainingLog.date);
    formattedDate = date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    formattedTime = date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Lógica de Sugestão
    let sugestedTrainingLog = lastTrainingLog;
    if (historyTraining.length > 1) {
      let randomIndex = Math.floor(Math.random() * historyTraining.length);
      if (
        historyTraining[randomIndex].training_id === lastTrainingLog.training_id
      ) {
        randomIndex = randomIndex === 0 ? 1 : randomIndex - 1;
      }
      sugestedTrainingLog = historyTraining[randomIndex];
    }

    // Busca os detalhes apenas se tiver certeza de que os IDs existem
    lastTrainingData = await apiTraining.getTrainingById(
      lastTrainingLog.training_id,
    );
    sugestedTrainingData = await apiTraining.getTrainingById(
      sugestedTrainingLog.training_id,
    );
  }

  // ==========================================================================
  // LÓGICA DE DADOS (Semana, Saúde e Favoritos) - Roda mesmo zerado!
  // ==========================================================================
  const lastDays = [];
  for (let i = 0; i < 7; i++) {
    let dataObj = new Date();
    dataObj.setDate(dataObj.getDate() - i);
    const dataFormatada = dataObj.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    lastDays.push({ obj: dataObj, formatada: dataFormatada });
  }
  lastDays.reverse();

  // Se não tem histórico, trainingDates fica vazio e a semana toda fica com "bolinha vazia"
  const trainingDates = historyTraining
    ? historyTraining.map((t) =>
        new Date(t.date).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
      )
    : [];

  let weekHTML = '<ul class="compact-week-list">';
  lastDays.forEach((diaInfo) => {
    const treinouNesseDia = trainingDates.includes(diaInfo.formatada);
    let diaSemana = diaInfo.obj.toLocaleDateString("pt-BR", {
      weekday: "long",
    });
    diaSemana =
      diaSemana.charAt(0).toUpperCase() + diaSemana.split("-")[0].slice(1);

    let nomeTreinoFeito = "";
    if (treinouNesseDia) {
      const treinoDoDia = historyTraining.find(
        (t) =>
          new Date(t.date).toLocaleDateString("pt-BR") === diaInfo.formatada,
      );
      if (treinoDoDia)
        nomeTreinoFeito = `<span class="day-training-name">${treinoDoDia.training_name}</span>`;
    }

    const iconClass = treinouNesseDia ? "done" : "missed";
    const iconSymbol = treinouNesseDia
      ? '<i class="fa-solid fa-circle-check"></i>'
      : '<i class="fa-regular fa-circle"></i>';

    weekHTML += `
      <li class="compact-day-item ${iconClass}">
        <div class="day-left">${iconSymbol} <span>${diaSemana}</span></div>
        ${nomeTreinoFeito}
      </li>
    `;
  });
  weekHTML += "</ul>";

  // Favoritos (Treino e Exercício)
  let mostCompletedTraining = null;
  const trainings = await apiTraining.getTrainings();
  if (trainings && trainings.length > 0) {
    mostCompletedTraining = trainings[0];
    for (let i = 1; i < trainings.length; i++) {
      if (
        (trainings[i].times_completed || 0) >
        (mostCompletedTraining.times_completed || 0)
      )
        mostCompletedTraining = trainings[i];
    }
  }

  let mostCompletedExercise = null;
  const exercises = await apiExercises.getExercises();
  if (exercises && exercises.length > 0) {
    mostCompletedExercise = exercises[0];
    for (let i = 1; i < exercises.length; i++) {
      if (
        (exercises[i].times_completed || 0) >
        (mostCompletedExercise.times_completed || 0)
      )
        mostCompletedExercise = exercises[i];
    }
  }

  // Saúde (TMB e IMC)
  const userText = localStorage.getItem("currentUser");
  let healthHTML = "";
  if (userText) {
    const user = JSON.parse(userText);
    if (user.weight && user.height && user.age && user.gender) {
      let tmb = 0;
      if (user.gender === "masculino" || user.gender === "outro") {
        const tmbM = 10 * user.weight + 6.25 * user.height - 5 * user.age + 5;
        tmb = user.gender === "masculino" ? tmbM : tmbM * 0.9;
      } else if (user.gender === "feminino") {
        tmb = 10 * user.weight + 6.25 * user.height - 5 * user.age - 161;
      }
      const IMC = user.weight / (user.height / 100) ** 2;
      let imcText = "",
        imcColor = "";
      switch (true) {
        case IMC < 18.5:
          imcText = "Abaixo do peso";
          imcColor = "#ffc107";
          break;
        case IMC >= 18.5 && IMC < 25:
          imcText = "Peso normal";
          imcColor = "#28a745";
          break;
        case IMC >= 25 && IMC < 30:
          imcText = "Sobrepeso";
          imcColor = "#fd7e14";
          break;
        case IMC >= 30:
          imcText = "Obesidade";
          imcColor = "#dc3545";
          break;
      }
      healthHTML = `
        <div class="health-card" style="border-left: 5px solid #007bff;">
          <span class="stat-title">TMB Estimada</span>
          <span class="stat-value" style="color: #007bff;">${Math.round(tmb)} <span style="font-size: 0.9rem; color: #888;">kcal/dia</span></span>
        </div>
        <div class="health-card" style="border-left: 5px solid ${imcColor};">
          <span class="stat-title">IMC (${IMC.toFixed(1)})</span>
          <span class="stat-value" style="color: ${imcColor};">${imcText}</span>
        </div>
      `;
    } else {
      healthHTML = `
        <div class="empty-state-banner error" style="padding: 15px; margin-bottom: 15px; border-left: 5px solid #dc3545; background: #fff3f3; border-radius: 8px;">
          <h4 style="margin: 0 0 5px 0; color: #dc3545;">Dados Incompletos ⚠️</h4>
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #555;">Preencha peso, altura, idade e gênero no perfil para ver suas métricas.</p>
          <button class="action-btn" id="go-to-profile-btn" style="background: #dc3545; border: none; padding: 8px 15px; color: white; border-radius: 5px; cursor: pointer; font-weight: bold;">Completar Perfil</button>
        </div>
      `;
    }
  }

  const weeklyTracker = document.getElementById("home-weekly-tracker");
  if (weeklyTracker) weeklyTracker.innerHTML = weekHTML;

  // ==========================================================================
  // TEXTOS DINÂMICOS (SE TEM TREINO MOSTRA A DATA, SE NÃO, MOSTRA MENSAGEM)
  // ==========================================================================
  const ultimoTreinoTexto =
    totalTrainingsDone > 0
      ? `Concluído em ${formattedDate} às ${formattedTime}`
      : `Você ainda não concluiu nenhum treino. Vá em "Treinos" para começar!`;

  // ==========================================================================
  // INJETANDO NA ABA DE RESULTADOS
  // ==========================================================================
  if (resultsContent) {
    resultsContent.innerHTML = `
      <div style="grid-column: 1 / -1;">
        <h3 class="results-topic-title" style="margin-top: 0;">Minha Saúde</h3>
        <div class="health-stats-container">${healthHTML}</div>
      </div>

      <div class="results-layout-column">
        <h3 class="results-topic-title">Frequência da Semana</h3>
        <div class="dashboard-card shadow-card">
          ${weekHTML}
        </div>

        <h3 class="results-topic-title">Último Treino</h3>
        <p class="highlight-times-text" style="margin-bottom: 5px;">${ultimoTreinoTexto}</p>
        <div id="results-last-training-container" class="card-injection-area"></div>
      </div>

      <div class="results-layout-column">
        <h3 class="results-topic-title">Visão Geral</h3>
        <div class="highlight-box">
          <div class="highlight-info">
            <p class="highlight-label">Treinos Concluídos</p>
            <h4>${totalTrainingsDone}</h4>
          </div>
          <div class="highlight-icon"><i class="fa-solid fa-trophy"></i></div>
        </div>

        <h3 class="results-topic-title">Meus Favoritos</h3>
        <p id="results-favorite-training-times" class="highlight-times-text"></p>
        <div id="results-favorite-training-container" class="card-injection-area"></div>
        
        <p id="results-favorite-exercise-times" class="highlight-times-text" style="margin-top: 10px;"></p>
        <div id="results-favorite-exercise-container" class="card-injection-area exercise-injection"></div>
      </div>
    `;
  }

  // ==========================================================================
  // INJEÇÃO DOS CARDS NATIVOS (Com Fallback para lista vazia)
  // ==========================================================================
  const injectCard = (
    containerId,
    data,
    renderFunction,
    originalGridId,
    emptyMessage,
  ) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!data) {
      // Se não tem dados (ex: usuário novo), mostra a mensagem amigável no lugar do card!
      container.innerHTML = `<p style="color: #666; font-size: 14px; background: #f9f9f9; padding: 15px; border-radius: 8px; text-align: center; border: 1px dashed #ccc;">${emptyMessage}</p>`;
      return;
    }

    const realGrid = document.getElementById(originalGridId);
    if (realGrid) realGrid.id = originalGridId + "-temp-hidden";

    container.innerHTML = `<div id="${originalGridId}" style="width: 100%; display: flex; flex-direction: column; gap: 10px; justify-content: center; align-items: center;"></div>`;
    renderFunction(data);

    const fakeGrid = container.querySelector(`#${originalGridId}`);
    if (fakeGrid) fakeGrid.id = `injected-${containerId}`;

    if (realGrid) realGrid.id = originalGridId;
  };

  // Injetando na Home e Resultados (Com as mensagens personalizadas)
  injectCard(
    "home-last-training-container",
    lastTrainingData,
    uiTraining.addTrainingToList.bind(uiTraining),
    "workouts-grid",
    "Nenhum treino no histórico. Crie seu primeiro treino!",
  );

  injectCard(
    "home-suggested-training-container",
    sugestedTrainingData,
    uiTraining.addTrainingToList.bind(uiTraining),
    "workouts-grid",
    "Faça alguns treinos para receber sugestões inteligentes.",
  );

  injectCard(
    "results-last-training-container",
    lastTrainingData,
    uiTraining.addTrainingToList.bind(uiTraining),
    "workouts-grid",
    "Você ainda não possui treinos recentes.",
  );

  if (mostCompletedTraining && mostCompletedTraining.times_completed > 0) {
    const timeText = document.getElementById("results-favorite-training-times");
    if (timeText)
      timeText.textContent = `Ficha realizada ${mostCompletedTraining.times_completed} vezes`;
    injectCard(
      "results-favorite-training-container",
      mostCompletedTraining,
      uiTraining.addTrainingToList.bind(uiTraining),
      "workouts-grid",
      "",
    );
  } else {
    document.getElementById("results-favorite-training-container").innerHTML =
      "<p style='color: #666; font-size: 14px;'>Termine mais treinos para ver seus favoritos.</p>";
  }

  if (mostCompletedExercise && mostCompletedExercise.times_completed > 0) {
    const timeTextEx = document.getElementById(
      "results-favorite-exercise-times",
    );
    if (timeTextEx)
      timeTextEx.textContent = `Exercício feito ${mostCompletedExercise.times_completed} vezes`;
    injectCard(
      "results-favorite-exercise-container",
      mostCompletedExercise,
      uiExercises.addExerciseToList.bind(uiExercises),
      "exercises-list",
      "",
    );
  } else {
    document.getElementById("results-favorite-exercise-container").innerHTML =
      "<p style='color: #666; font-size: 14px;'>Cadastre cargas para descobrir seus exercícios mais fortes.</p>";
  }

  // ==========================================================================
  // EVENTO DO BOTÃO DE PERFIL (Para quando faltam dados)
  // ==========================================================================
  const btnProfile = document.getElementById("go-to-profile-btn");
  if (btnProfile) {
    btnProfile.addEventListener("click", () => {
      // Simula o clique no botão de "Perfil" da barra de navegação
      document.querySelectorAll(".nav-btn").forEach((btn) => {
        if (btn.textContent.includes("Perfil")) btn.click();
      });
      // Sobe a tela suavemente para o usuário ver o formulário
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}
