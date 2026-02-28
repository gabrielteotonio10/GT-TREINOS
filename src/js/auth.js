// Função de cadastro - valida se o email não existe e salva no localStorage
export function register(name, email, password) {
  // Pega a lista de usuários salva
  const users = JSON.parse(localStorage.getItem("users") || "[]");

  // Verifica se já existe um usuário com esse email
  if (users.find((u) => u.email === email))
    return { success: false, message: "E-mail já cadastrado!" };

  // Se não existe, adiciona na lista
  users.push({ name, email, password });
  localStorage.setItem("users", JSON.stringify(users));
  return { success: true };
}

// Função de login - valida email e senha
export function login(email, password) {
  // Pega a lista de usuários
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  // Procura um usuário com email e senha corretos
  const user = users.find((u) => u.email === email && u.password === password);

  // Se encontrou, salva como usuário atual e ativa
  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
    return true;
  }
  return false;
}

// Verifica se tem um usuário logado e mostra/esconde as seções da página
export function checkAuth() {
  const user = localStorage.getItem("currentUser");
  const loginSection = document.getElementById("login-section");
  const registerSection = document.getElementById("register-section");
  const header = document.querySelector("header");
  const footer = document.querySelector("footer");

  // Pega todas as seções principais (exceto login e register)
  const mainSections = document.querySelectorAll(
    "main > section:not(#login-section):not(#register-section)",
  );

  if (!user) {
    // Usuário NÃO logado: esconde o app e mostra tela de login
    if (header) header.classList.add("hidden");
    if (footer) footer.classList.add("hidden");

    mainSections.forEach((sec) => sec.classList.add("hidden"));

    loginSection.classList.remove("hidden");
    if (registerSection) registerSection.classList.add("hidden");
  } else {
    // Usuário LOGADO: esconde as telas de auth e mostra o app
    if (header) header.classList.remove("hidden");
    if (footer) footer.classList.remove("hidden");

    loginSection.classList.add("hidden");
    if (registerSection) registerSection.classList.add("hidden");
  }
}
