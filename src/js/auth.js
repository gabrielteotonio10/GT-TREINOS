import { supabase } from "./supabase.js";

// Função de cadastro - valida se o email não existe e salva no localStorage (agora no Supabase)
export async function register(name, email, password) {
  // Pega a lista de usuários salva e verifica se já existe um usuário com esse email
  const { data: existingUser } = await supabase
    .from("users")
    .select("email")
    .eq("email", email)
    .maybeSingle();

  // Verifica se já existe um usuário com esse email
  if (existingUser) return { success: false, message: "E-mail já cadastrado!" };

  // Se não existe, adiciona na lista (salva no banco de dados)
  const { error } = await supabase
    .from("users")
    .insert([{ name, email, password }]);

  if (error)
    return { success: false, message: "Erro ao salvar no banco de dados." };

  return { success: true };
}

// Função de login - valida email e senha
export async function login(email, password) {
  // Pega a lista de usuários e procura um usuário com email e senha corretos no banco
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .eq("password", password)
    .maybeSingle();

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

  const appContent = document.querySelector("#app-content");
  const loginSection = document.querySelector("#login-section");
  const registerSection = document.querySelector("#register-section");

  // Trava de segurança para não bugar o site
  if (!appContent || !loginSection) return !!user;

  if (!user) {
    // Esconde o app e mostra o login
    appContent.classList.add("hidden");
    loginSection.classList.remove("hidden");
    if (registerSection) registerSection.classList.add("hidden");
    return false;
  }

  // Esconde o login e mostra o app
  appContent.classList.remove("hidden");
  loginSection.classList.add("hidden");
  if (registerSection) registerSection.classList.add("hidden");
  return true;
}
