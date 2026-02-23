// Importando objetos
import apiTraining from "./Training/apiTraining.js";
import uiTraining from "./Training/uiTraining.js";
import apiExercises from "./Exercises/apiExercises.js";
import uiExercises from "./Exercises/uiExercises.js";
// Importando funções
import { register, login, checkAuth } from "./auth.js";

// Fechar o modal
const closeAllModals = () => {
  const modals = document.querySelectorAll(".modal-container");
  modals.forEach((modal) => modal.classList.remove("active"));
};

// ---------- INICIALIZAÇÃO DO DOMContentLoaded ----------
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  // ------ TREINOS ------
  uiTraining.renderTrainings();
  const trainingForm = document.querySelector("#training-form");

  // Quando formulário for enviado
  trainingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Pegamo o objeto inteiro que vem da UI
    const trainingData = uiTraining.getFormDataTraining();
    try {
      // Se tem ID edita, senão salva 
      if (trainingData.id) {
        // Passamos o objeto completo para a API
        await apiTraining.updateTraining(trainingData);
      } else {
        // Passamos o objeto completo para a API
        await apiTraining.createTraining(trainingData);
      }
      // Limpeza e Feedback
      uiTraining.clearFormTraining();
      closeAllModals();
      const successMessage = trainingData.id
        ? "Treino atualizado com sucesso!"
        : "Treino criado com sucesso!";
      uiTraining.showToastTraining(successMessage);
      // Renderizar treinos
      uiTraining.renderTrainings();
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

    // Pega o objeto completo com tudo que o uiExercises retornou
    const exerciseData = uiExercises.getFormDataExercise();
    try {
      if (exerciseData.id) {
        // Se tem ID, edita mandando o objeto completo
        await apiExercises.updateExercises(exerciseData);
      } else {
        // Se não tem ID, cria mandando o objeto completo
        await apiExercises.createExercises(exerciseData);
      }
      uiExercises.clearFormExercise();
      closeAllModals();
      const successMessage = exerciseData.id
        ? "Exercício atualizado com sucesso!"
        : "Exercício criado com sucesso!";
      uiTraining.showToastTraining(successMessage);
      uiExercises.renderExercises();
    } catch (error) {
      console.error("Erro detalhado:", error);
      alert("Não foi possível salvar: " + error.message);
    }
  });

  // Captura a imagem selecionada (EXERCÍCIOS)
  const exercisePhotoInput = document.querySelector("#exercise-photo-input");
  if (exercisePhotoInput) {
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
          uiExercises.renderExercisesForSelection(
            allExercises,
            targetContainer,
            selectedIds,
          );
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
        uiExercises.renderExercisesForSelection(
          filteredExercises,
          inputElement2,
          selectedIds,
        );
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
  seeAllInSearch(
    ".add-new-workout-btn, .add-new-workout, .edit-icon, .edit-workout-btn, #exercise-search",
    listIdForm,
  );

  // --------------------------- FUNÇÕES DE LOGIN ---------------------------
  const loginForm = document.querySelector("#login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = document.querySelector("#login-email").value;
      const password = document.querySelector("#login-password").value;
      // Tentativa de login
      if (login(email, password)) {
        checkAuth();
        console.log("Login realizado com sucesso!");
        // Força o reenderizamento da página para as sections aparecerem
        const logo = document.querySelector(".main-logo");
        if (logo) logo.click();
      } else {
        alert("E-mail ou senha incorretos. Tente novamente! ");
      }
    });
  }

  // --------------------------- FORMULÁRIO DE CADASTRO ---------------------------
  const registerForm = document.querySelector("#register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = document.querySelector("#register-name").value;
      const email = document.querySelector("#register-email").value;
      const password = document.querySelector("#register-password").value;
      // Chama a função
      const response = register(name, email, password);
      if (response.success) {
        // Mensagem
        uiTraining.showToastTraining(
          "Conta criada com sucesso! Faça seu login. 🎉",
        );
        registerForm.reset(); // Limpa os campos
        // Esconde o cadastro e mostra o login
        document.querySelector("#register-section").classList.add("hidden");
        document.querySelector("#login-section").classList.remove("hidden");
      } else {
        // Mostra o erro ("E-mail já cadastrado!")
        alert(response.message);
      }
    });
  }

  // --------------------------- FORMULÁRIO DO PERFIL ---------------------------
  const profileForm = document.querySelector("#profile-form");
  if (profileForm) {
    profileForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = document.querySelector("#profile-name").value;
      const weight = document.querySelector("#profile-weight").value;
      const height = document.querySelector("#profile-height").value;
      const goal = document.querySelector("#profile-goal").value;
      const newPassword = document.querySelector("#profile-password").value;
      const newPasswordConfirm = document.querySelector(
        "#profile-password-confirm",
      ).value;

      const users = JSON.parse(localStorage.getItem("users") || "[]");
      let currentUser = JSON.parse(localStorage.getItem("currentUser"));

      const userIndex = users.findIndex((u) => u.email === currentUser.email);
      if (userIndex !== -1) {
        users[userIndex].name = name;
        users[userIndex].weight = weight;
        users[userIndex].height = height;
        users[userIndex].goal = goal;

        // Verifica se o usuário digitou uma nova senha
        if (newPassword.trim() !== "") {
          if (newPassword === newPasswordConfirm) {
            users[userIndex].password = newPassword;
            document.querySelector("#profile-password").value = "";
            document.querySelector("#profile-password-confirm").value = "";
          } else {
            uiTraining.showToastTraining("Erro! Senhas diferentes!", "error");
            document.querySelector("#profile-password").value = "";
            document.querySelector("#profile-password-confirm").value = "";
            return;
          }
        }

        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("currentUser", JSON.stringify(users[userIndex]));

        uiTraining.showToastTraining("Perfil atualizado com sucesso! ✅");
        document.getElementById("hero-display-name").textContent = name;
      }
    });
  }

  // --------------------------- UPLOAD DA FOTO DE PERFIL ---------------------------
  const profilePhotoInput = document.querySelector("#profile-photo-input");

  if (profilePhotoInput) {
    profilePhotoInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        // O FileReader transforma a imagem em um texto Base64 que o LocalStorage aceita
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64Image = e.target.result;
          // Mostra a foto na tela
          const avatarPreview = document.querySelector(
            "#profile-avatar-preview",
          );
          avatarPreview.innerHTML = `<img src="${base64Image}" alt="Foto" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
          // Abre o banco de dados e salva a foto no usuário logado
          const users = JSON.parse(localStorage.getItem("users") || "[]");
          let currentUser = JSON.parse(localStorage.getItem("currentUser"));
          const userIndex = users.findIndex(
            (u) => u.email === currentUser.email,
          );

          if (userIndex !== -1) {
            users[userIndex].photo = base64Image; // Adiciona a foto na lista geral
            currentUser.photo = base64Image; // Adiciona a foto no login atual
            // Salva de volta
            localStorage.setItem("users", JSON.stringify(users));
            localStorage.setItem("currentUser", JSON.stringify(currentUser));
            uiTraining.showToastTraining("Foto atualizada com sucesso! 📸");
          }
        };
        // Dispara a leitura do arquivo
        reader.readAsDataURL(file);
      }
    });
  }

  // --------------------------- RECUPERAÇÃO DE SENHA ---------------------------
  const forgotPasswordForm = document.querySelector("#forgot-password-form");

  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const email = document.querySelector("#recovery-email").value;
      const newPassword = document.querySelector(
        "#recovery-new-password",
      ).value;
      const confirmPassword = document.querySelector(
        "#recovery-confirm-password",
      ).value;

      // 1. Trava de segurança: As senhas batem?
      if (newPassword !== confirmPassword) {
        alert("Erro! As senhas não coincidem.");
        return;
      }

      // 2. Procura o e-mail no banco de dados
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const userIndex = users.findIndex((u) => u.email === email);

      if (userIndex !== -1) {
        // 3. E-mail achado! Atualiza a senha na lista de usuários
        users[userIndex].password = newPassword;
        localStorage.setItem("users", JSON.stringify(users));

        uiTraining.showToastTraining(
          "Senha redefinida com sucesso! Faça seu login. ✅",
        );

        // 4. Limpa o formulário e esconde o modal
        forgotPasswordForm.reset();
        document
          .querySelector("#forgot-password-modal")
          .classList.remove("active");
      } else {
        // E-mail não existe no sistema
        alert("E-mail não encontrado! Verifique se digitou corretamente.");
      }
    });
  }
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
      return aSel === bSel ? 0 : aSel ? -1 : 1;
    });
    // Chama o render novamente, fazendo a palavra "Adicionado sumir"
    uiExercises.renderExercisesForSelection(
      allExercises,
      "#select-exercise-list",
      selectedIds,
    );
  }
});
