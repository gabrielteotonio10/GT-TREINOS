document.addEventListener("DOMContentLoaded", () => {
  // Seletores ajustados para o seu HTML
  const menuBtn = document.querySelector(".mobile-menu-btn");
  const navMenu = document.querySelector(".header-menu");
  const navButtons = document.querySelectorAll(".nav-btn");

  // Função de alternância (Toggle)
  function toggleMenu(event) {
    if (event.type === "touchstart") event.preventDefault();
    if (navMenu) {
      navMenu.classList.toggle("active");
      const isOpen = navMenu.classList.contains("active");
      event.currentTarget.setAttribute("aria-expanded", isOpen);
    }
  }

  if (menuBtn) {
    menuBtn.addEventListener("click", toggleMenu);
    menuBtn.addEventListener("touchstart", toggleMenu);
  }

  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (navMenu) navMenu.classList.remove("active");
    });
  });
});
