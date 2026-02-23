// Cadastro de usuário
export function register(name, email, password) {
  // Pega os usuários do LocalStorage
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  // Verifica se o e-mail já existe
  if (users.find((u) => u.email === email))
    return { success: false, message: "E-mail já cadastrado!" };
  // Coloca no LocalStorage
  users.push({ name,email, password });
  localStorage.setItem("users", JSON.stringify(users));
  return { success: true };
}

// Login do usuário
export function login(email, password) {
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find((u) => u.email === email && u.password === password);
  // Se existe
  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
    return true;
  }
  return false;
}

// Caso não tenha currentUser (usuário atual), mostra a tela de login
export function checkAuth() {
  const user = localStorage.getItem("currentUser");
  const loginSection = document.getElementById("login-section");
  const registerSection = document.getElementById("register-section");
  const header = document.querySelector("header");
  const footer = document.querySelector("footer");
  
  // Seleciona todas as seções de dentro do main, exceto login e register
  const mainSections = document.querySelectorAll("main > section:not(#login-section):not(#register-section)");

  if (!user) {
    // Deslogado: Esconde o site, mostra o login
    if (header) header.classList.add("hidden");
    if (footer) footer.classList.add("hidden");
    
    mainSections.forEach(sec => sec.classList.add("hidden"));
    
    loginSection.classList.remove("hidden");
    if (registerSection) registerSection.classList.add("hidden");
  } else {
    // Logado: Esconde telas de auth, mostra o site
    if (header) header.classList.remove("hidden");
    if (footer) footer.classList.remove("hidden");
    
    loginSection.classList.add("hidden");
    if (registerSection) registerSection.classList.add("hidden");
  }
}