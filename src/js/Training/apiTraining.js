import { supabase } from "../supabase.js";

const trainingApi = {
  // Procura os treinos registrados
  async getTrainings() {
    try {
      // Vemos quem está logado
      const userString = localStorage.getItem("currentUser");
      const loggedEmail = userString ? JSON.parse(userString).email : null;
      // Se não tiver ninguém logado, não retorna nada
      if (!loggedEmail) return [];

      // Filtra direto no Supabase
      const { data, error } = await supabase
        .from("trainings")
        .select("*")
        .eq("userEmail", loggedEmail);

      if (error) throw error;

      return data || [];
    } catch (error) {
      alert("Erro ao buscar os treinos");
      throw error;
    }
  },

  // Procura um treino pelo Id
  async getTrainingById(id) {
    try {
      const { data, error } = await supabase
        .from("trainings")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      alert("Erro ao buscar treino por ID");
      throw error;
    }
  },

  // Salva um treino
  async createTraining(training) {
    const { data, error } = await supabase
      .from("trainings")
      .insert([training])
      .select();

    if (error) {
      throw new Error(`Erro no servidor: ${error.message}`);
    }
    return data[0];
  },

  // Edita um treino
  async updateTraining(training) {
    try {
      const { data, error } = await supabase
        .from("trainings")
        .update(training)
        .eq("id", training.id)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      alert("Erro ao editar treino");
      throw error;
    }
  },

  // Deleta um treino
  async deleteTraining(id) {
    try {
      const { error } = await supabase.from("trainings").delete().eq("id", id);

      if (error) {
        throw new Error(`Erro no servidor: ${error.message}`);
      }
      return true;
    } catch (error) {
      alert("Erro ao excluir um treino");
      throw error;
    }
  },

  // Salva o histórico do treino
  async saveHistory(historyData) {
    try {
      const { data, error } = await supabase
        .from("history")
        .insert([historyData])
        .select();

      if (error) throw new Error("Erro ao salvar histórico");
      return data[0];
    } catch (error) {
      console.error(error);
    }
  },

  // Pega o histórico do treino
  async getHistory() {
    try {
      // Vemos quem está logado para pegar apenas o histórico dele
      const userString = localStorage.getItem("currentUser");
      const loggedEmail = userString ? JSON.parse(userString).email : null;
      if (!loggedEmail) return [];

      const { data, error } = await supabase
        .from("history")
        .select("*")
        .eq("userEmail", loggedEmail);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(error);
    }
  },
};

export default trainingApi;
