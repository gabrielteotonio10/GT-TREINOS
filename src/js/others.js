import { supabase } from "./supabase.js"; // Importação necessária para salvar o tema

// ==========================================================================
//  MENU MOBILE (BOTÃO HAMBÚRGUER)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.querySelector(".mobile-menu-btn");
  const navMenu = document.querySelector(".header-menu");
  const navButtons = document.querySelectorAll(".nav-btn");

  // Alterna entre abrir e fechar o menu mobile
  function toggleMenu(event) {
    event.stopPropagation();
    // Evita o disparo duplo em telas touch (mobile)
    if (event.type === "touchstart") event.preventDefault();

    if (navMenu) {
      navMenu.classList.toggle("active");
      const isOpen = navMenu.classList.contains("active");
      event.currentTarget.setAttribute("aria-expanded", isOpen);
    }
  }

  // Ouve os cliques no ícone do menu
  if (menuBtn) {
    menuBtn.addEventListener("click", toggleMenu);
    menuBtn.addEventListener("touchstart", toggleMenu);
  }

  // Fecha o menu mobile automaticamente quando o usuário clica em qualquer link
  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (navMenu) navMenu.classList.remove("active");
    });
  });
});

// ==========================================================================
// SAUDAÇÃO PERSONALIZADA (HERO TEXT)
// ==========================================================================

// Puxa o nome do usuário logado e exibe no "Bom dia, [Nome]!" da tela inicial
const presentationText = document.querySelector(".presentation-text-name");
const usuario = localStorage.getItem("currentUser");

if (usuario) {
  const nome = JSON.parse(usuario).name;
  const primeiroNome = nome.split(" ")[0]; // Corta a string e pega apenas o primeiro nome

  if (presentationText) {
    presentationText.innerHTML = `Bem-vindo, ${primeiroNome}!`;
  }
}

// ==========================================================================
// TEMA: MODO ESCURO (DARK MODE)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  const darkModeToggle = document.getElementById("dark-mode-toggle");

  // --- CHECAGEM DE MEMÓRIA AO CARREGAR A PÁGINA ---
  // Se o usuário tinha ativado antes, liga o modo escuro automaticamente
  if (localStorage.getItem("dark-mode") === "enabled") {
    document.body.classList.add("dark-mode");
    if (darkModeToggle) darkModeToggle.checked = true; // Deixa a chavinha "ligada" visualmente
  }

  // --- OUVE O CLIQUE NO BOTÃO DE TROCA DE TEMA ---
  if (darkModeToggle) {
    darkModeToggle.addEventListener("change", async () => {
      // Adicionado async para o banco
      const userString = localStorage.getItem("currentUser");
      const user = userString ? JSON.parse(userString) : null;

      if (darkModeToggle.checked) {
        // Ativa a classe no HTML e salva a preferência no banco
        document.body.classList.add("dark-mode");
        localStorage.setItem("dark-mode", "enabled");

        // Salva a preferência no Supabase se o usuário estiver logado
        if (user) {
          await supabase
            .from("users")
            .update({ theme: "dark" })
            .eq("email", user.email);
        }
      } else {
        // Desativa a classe e salva a preferência no banco
        document.body.classList.remove("dark-mode");
        localStorage.setItem("dark-mode", "disabled");

        // Salva a preferência no Supabase se o usuário estiver logado
        if (user) {
          await supabase
            .from("users")
            .update({ theme: "light" })
            .eq("email", user.email);
        }
      }
    });
  }
});

const scrollTopBtn = document.querySelector(".scrollTop");
if (scrollTopBtn) {
  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Lógica do SCROLL (Serve apenas para esconder/mostrar o botão)
  window.addEventListener("scroll", () => {
    const posicaoAtual = window.scrollY;

    // Se descer mais de 200px
    if (posicaoAtual > 200) {
      scrollTopBtn.classList.remove("hidden");
    } else {
      scrollTopBtn.classList.add("hidden");
    }
  });
}
