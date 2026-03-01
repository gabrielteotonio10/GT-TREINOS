import { supabase } from "../supabase.js";

const exercisesApi = {
  // Procura os exercícios registrados
  async getExercises() {
    try {
      // Vê quem está logado
      const userString = localStorage.getItem("currentUser");
      const loggedEmail = userString ? JSON.parse(userString).email : null;
      if (!loggedEmail) return [];

      // Só devolve os exercícios que pertencem a quem está logado (Busca direto no Supabase)
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .eq("userEmail", loggedEmail);

      if (error) throw error;

      return data || [];
    } catch (error) {
      alert("Erro ao buscar os exercícios");
      throw error;
    }
  },

  // Procura um exercício pelo Id
  async getExercisesById(id) {
    try {
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw new Error("Exercício não encontrado no servidor");
      return data;
    } catch (error) {
      alert("Erro ao buscar exercício por ID");
      throw error;
    }
  },

  // Salva um exercício
  async createExercises(exercises) {
    const { data, error } = await supabase
      .from("exercises")
      .insert([exercises])
      .select();

    if (error) {
      throw new Error(`Erro no servidor: ${error.message}`);
    }
    return data[0];
  },

  // Edita um exercício
  async updateExercises(exercises) {
    try {
      const { data, error } = await supabase
        .from("exercises")
        .update(exercises)
        .eq("id", exercises.id)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      alert("Erro ao editar exercício");
      throw error;
    }
  },

  // Deleta um exercício
  async deleteExercises(id) {
    try {
      const { error } = await supabase.from("exercises").delete().eq("id", id);

      if (error) {
        throw new Error(`Erro no servidor: ${error.message}`);
      }
      return true;
    } catch (error) {
      alert("Erro ao excluir um exercício");
      throw error;
    }
  },
};

export default exercisesApi;
