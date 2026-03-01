import uiTraining from "./Training/uiTraining.js";
import { supabase } from "./supabase.js"; // Importação para conectar ao banco

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

  // Preenche os campos do formulário com os dados atuais
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
    profileForm.addEventListener("submit", async (event) => {
      // Adicionado async
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

      let currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser) return;

      // Monta o objeto de atualização
      const updates = {
        name,
        weight,
        height,
        goal,
        age,
        gender,
      };

      // Alteração de Senha
      if (newPassword.trim() !== "") {
        if (newPassword === newPasswordConfirm) {
          updates.password = newPassword; // Adiciona a nova senha ao pacote
          document.querySelector("#profile-password").value = "";
          document.querySelector("#profile-password-confirm").value = "";
        } else {
          uiTraining.showToastTraining("Erro! Senhas diferentes!", "error");
          document.querySelector("#profile-password").value = "";
          document.querySelector("#profile-password-confirm").value = "";
          return;
        }
      }

      try {
        // --- SALVA NO SUPABASE ---
        const { error } = await supabase
          .from("users")
          .update(updates)
          .eq("email", currentUser.email);

        if (error) throw error;

        // Atualiza o LocalStorage para refletir as mudanças no site sem deslogar
        const newUserState = { ...currentUser, ...updates };
        localStorage.setItem("currentUser", JSON.stringify(newUserState));

        uiTraining.showToastTraining("Perfil atualizado com sucesso! ✅");

        const heroName = document.getElementById("hero-display-name");
        if (heroName) heroName.textContent = name;

        // Remove alerta se tudo estiver preenchido
        checkProfileCompletion();
      } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        alert("Erro ao salvar os dados no banco de dados.");
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
        reader.onload = async (e) => {
          // Adicionado async
          const base64Image = e.target.result;
          const avatarPreview = document.querySelector(
            "#profile-avatar-preview",
          );
          if (avatarPreview) {
            avatarPreview.innerHTML = `<img src="${base64Image}" alt="Foto" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
          }

          let currentUser = JSON.parse(localStorage.getItem("currentUser"));

          try {
            // --- SALVA A FOTO NO SUPABASE ---
            const { error } = await supabase
              .from("users")
              .update({ photo: base64Image })
              .eq("email", currentUser.email);

            if (error) throw error;

            // Atualiza memória local
            currentUser.photo = base64Image;
            localStorage.setItem("currentUser", JSON.stringify(currentUser));

            uiTraining.showToastTraining("Foto atualizada com sucesso! 📸");
          } catch (error) {
            console.error("Erro ao salvar foto:", error);
            alert("Não foi possível salvar a foto no banco de dados.");
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }
}
