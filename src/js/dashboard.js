// src/js/dashboard.js
import apiTraining from "./Training/apiTraining.js";
import uiTraining from "./Training/uiTraining.js";
import apiExercises from "./Exercises/apiExercises.js";
import uiExercises from "./Exercises/uiExercises.js";

// Função para desenhar a Home e a aba de Resultados
export async function renderDashboard() {
  const historyTraining = await apiTraining.getHistory();
  const totalTrainingsDone = historyTraining ? historyTraining.length : 0;

  const homeDashboard = document.getElementById("home-dashboard");
  const resultsContent = document.getElementById("results-content-area");

  // ==========================================================================
  // VALIDAÇÃO: SE NÃO TIVER TREINOS
  // ==========================================================================
  if (totalTrainingsDone === 0) {
    const semTreinoHTML = `
      <div class="empty-state-banner">
        <h4>Nenhum treino realizado ainda 😴</h4>
        <p>Comece sua jornada agora mesmo e acompanhe seus resultados aqui.</p>
        <button class="action-btn" id="go-to-trainings-btn">Ir para Treinos</button>
      </div>
    `;
    if (homeDashboard) homeDashboard.innerHTML = semTreinoHTML;
    if (resultsContent) resultsContent.innerHTML = semTreinoHTML;
    document.querySelectorAll("#go-to-trainings-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const trainingBtn = document.querySelector(".training-btn");
        if (trainingBtn) trainingBtn.click();
      });
    });
    return;
  }

  // ==========================================================================
  // LÓGICA DE DADOS
  // ==========================================================================
  // Capturando data e hora do último treino
  const lastTrainingLog = historyTraining[historyTraining.length - 1];
  const date = new Date(lastTrainingLog.date);
  const formattedDate = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Sugerindo um treino difernte do último realizado
  let sugestedTrainingLog = lastTrainingLog;
  if (historyTraining.length > 1) {
    let randomIndex = Math.floor(Math.random() * (historyTraining.length - 1));
    if (historyTraining[randomIndex] === lastTrainingLog)
      randomIndex === 0 ? randomIndex++ : randomIndex--;
    sugestedTrainingLog = historyTraining[randomIndex];
  }

  // Busca os dados completos no Supabase usando os IDs do histórico
  const lastTrainingData = await apiTraining.getTrainingById(
    lastTrainingLog.training_id,
  );
  const sugestedTrainingData = await apiTraining.getTrainingById(
    sugestedTrainingLog.training_id,
  );

  // Confere se o usuário treinou nos últimos dias da semana
  // Captura os últimos dias
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
  // Formata as datas
  const trainingDates = historyTraining.map((t) =>
    new Date(t.date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
  );

  // Confere se treinou no dia, pega qual treino e monta o html
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

  // Pega o treino mais feito
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

  // Pega o exercício mais feito
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

  // Pega as informações do LocalStorage e calcula TMB e IMC
  const userText = localStorage.getItem("currentUser");
  let healthHTML = "";
  if (userText) {
    const user = JSON.parse(userText);
    // Calculo da Taxa metabolica basal
    if (user.weight && user.height && user.age && user.gender) {
      let tmb = 0;
      if (user.gender === "masculino" || user.gender === "outro") {
        const tmbM = 10 * user.weight + 6.25 * user.height - 5 * user.age + 5;
        tmb = user.gender === "masculino" ? tmbM : tmbM * 0.9;
      } else if (user.gender === "feminino") {
        tmb = 10 * user.weight + 6.25 * user.height - 5 * user.age - 161;
      }

      // Calculo do Índice de Massa Corporal
      const IMC = user.weight / (user.height / 100) ** 2;
      let imcText = "";
      let imcColor = "";
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

      // Adiciona as informações
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
        <div class="empty-state-banner error">
          <h4>Dados Incompletos ⚠️</h4>
          <p>Preencha peso, altura, idade e gênero no perfil.</p>
          <button class="action-btn" id="go-to-profile-btn" style="background: #dc3545;">Completar Perfil</button>
        </div>
      `;
    }
  }
  const weeklyTracker = document.getElementById("home-weekly-tracker");
  if (weeklyTracker) weeklyTracker.innerHTML = weekHTML;

  // ==========================================================================
  // INJETANDO NA ABA DE RESULTADOS
  // ==========================================================================
  // Mosta o html com todas as informações capturadas
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
        <p class="highlight-times-text" style="margin-bottom: 5px;">Concluído em ${formattedDate} às ${formattedTime}</p>
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
  // INJEÇÃO DOS CARDS NATIVOS
  // ==========================================================================
  // Função para injetar os cards dos treinos e exercícios usando as funções originais de renderização
  const injectCard = (containerId, data, renderFunction, originalGridId) => {
    const container = document.getElementById(containerId);
    if (!container || !data) return;

    // Acha a grade original (seja Treino ou Exercício) e troca o ID dela temporariamente
    const realGrid = document.getElementById(originalGridId);
    if (realGrid) realGrid.id = originalGridId + "-temp-hidden";

    // Transforma o contêiner vazio na "grade falsa"
    container.innerHTML = `<div id="${originalGridId}" style="width: 100%; display: flex; flex-direction: column; gap: 10px; justify-content: center; align-items: center;"></div>`;
    // Chama a função original (ela vai achar a grade falsa)
    renderFunction(data);

    // Renomeia a grade falsa para não dar conflito no resto do site
    const fakeGrid = container.querySelector(`#${originalGridId}`);
    if (fakeGrid) fakeGrid.id = `injected-${containerId}`;

    // Devolve o ID original para a biblioteca real voltar a funcionar
    if (realGrid) realGrid.id = originalGridId;
  };

  // Injetando na Home
  injectCard(
    "home-last-training-container",
    lastTrainingData,
    uiTraining.addTrainingToList.bind(uiTraining),
    "workouts-grid",
  );
  injectCard(
    "home-suggested-training-container",
    sugestedTrainingData,
    uiTraining.addTrainingToList.bind(uiTraining),
    "workouts-grid",
  );

  // Injetando na aba Resultados
  if (lastTrainingData) {
    injectCard(
      "results-last-training-container",
      lastTrainingData,
      uiTraining.addTrainingToList.bind(uiTraining),
      "workouts-grid",
    );
  }

  if (mostCompletedTraining && mostCompletedTraining.times_completed > 0) {
    const timeText = document.getElementById("results-favorite-training-times");
    if (timeText)
      timeText.textContent = `Ficha realizada ${mostCompletedTraining.times_completed} vezes`;
    injectCard(
      "results-favorite-training-container",
      mostCompletedTraining,
      uiTraining.addTrainingToList.bind(uiTraining),
      "workouts-grid",
    );
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
    );
  }

  // Evento do botão de perfil caso faltem dados
  const btnProfile = document.getElementById("go-to-profile-btn");
  if (btnProfile) {
    btnProfile.addEventListener("click", () => {
      document.querySelectorAll(".nav-btn").forEach((btn) => {
        if (btn.textContent.includes("Perfil")) btn.click();
      });
    });
  }
}
