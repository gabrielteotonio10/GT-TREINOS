// ==========================================================================
//  MENU MOBILE (BOTÃO HAMBÚRGUER)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.querySelector(".mobile-menu-btn");
  const navMenu = document.querySelector(".header-menu");
  const navButtons = document.querySelectorAll(".nav-btn");

  // Função de alternância (Toggle) para abrir/fechar a gaveta do menu
  function toggleMenu(event) {
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
    darkModeToggle.addEventListener("change", () => {
      if (darkModeToggle.checked) {
        // Ativa a classe no HTML e salva a preferência no banco
        document.body.classList.add("dark-mode");
        localStorage.setItem("dark-mode", "enabled");
      } else {
        // Desativa a classe e salva a preferência no banco
        document.body.classList.remove("dark-mode");
        localStorage.setItem("dark-mode", "disabled");
      }
    });
  }
});