import uiTraining from "./Training/uiTraining.js";

// Verifica se o perfil do usuário está completo e mostra alerta se houver campos faltando
export function checkProfileCompletion() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) return;

  const alertContainer = document.querySelector("#profile-alert-container");
  if (!alertContainer) return;

  const isComplete =
    currentUser.age &&
    currentUser.gender &&
    currentUser.weight &&
    currentUser.height &&
    currentUser.goal;

  if (!isComplete) {
    alertContainer.classList.remove("hidden");
  } else {
    alertContainer.classList.add("hidden");
  }

  document.querySelector("#profile-name").value = currentUser.name || "";
  document.querySelector("#profile-email").value = currentUser.email || "";
  document.querySelector("#profile-weight").value = currentUser.weight || "";
  document.querySelector("#profile-height").value = currentUser.height || "";
  document.querySelector("#profile-goal").value = currentUser.goal || "";
  document.querySelector("#profile-age").value = currentUser.age || "";
  document.querySelector("#profile-gender").value = currentUser.gender || "";
}

// ========================================================================
// PERFIL DO USUÁRIO E CONFIGURAÇÕES
// ========================================================================
export function initProfileEvents() {
  // Salvando dados do Perfil
  const profileForm = document.querySelector("#profile-form");
  if (profileForm) {
    profileForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = document.querySelector("#profile-name").value;
      const weight = document.querySelector("#profile-weight").value;
      const height = document.querySelector("#profile-height").value;
      const goal = document.querySelector("#profile-goal").value;
      const age = document.querySelector("#profile-age").value;
      const gender = document.querySelector("#profile-gender").value;
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
        users[userIndex].age = age;
        users[userIndex].gender = gender;

        // Alteração de Senha
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

        // Remove alerta se tudo estiver preenchido
        checkProfileCompletion();
      }
    });
  }

  // Upload de Foto de Perfil
  const profilePhotoInput = document.querySelector("#profile-photo-input");
  if (profilePhotoInput) {
    profilePhotoInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64Image = e.target.result;
          const avatarPreview = document.querySelector(
            "#profile-avatar-preview",
          );
          avatarPreview.innerHTML = `<img src="${base64Image}" alt="Foto" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;

          const users = JSON.parse(localStorage.getItem("users") || "[]");
          let currentUser = JSON.parse(localStorage.getItem("currentUser"));
          const userIndex = users.findIndex(
            (u) => u.email === currentUser.email,
          );

          if (userIndex !== -1) {
            users[userIndex].photo = base64Image;
            currentUser.photo = base64Image;
            localStorage.setItem("users", JSON.stringify(users));
            localStorage.setItem("currentUser", JSON.stringify(currentUser));
            uiTraining.showToastTraining("Foto atualizada com sucesso! 📸");
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }
}