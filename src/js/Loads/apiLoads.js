import { supabase } from "../supabase.js";

const loadsApi = {
  // Procura as cargas registrados
  async getLoads() {
    try {
      // Vê quem está logado
      const userString = localStorage.getItem("currentUser");
      const loggedEmail = userString ? JSON.parse(userString).email : null;
      if (!loggedEmail) return [];

      // Só devolve as cargas que pertencem a quem está logado (Busca direto no Supabase)
      const { data, error } = await supabase
        .from("loads")
        .select("*")
        .eq("userEmail", loggedEmail);

      if (error) throw error;

      return data || [];
    } catch (error) {
      alert("Erro ao buscar os cargas");
      throw error;
    }
  },

  // Procura uma carga pelo Id
  async getLoadById(id) {
    try {
      const { data, error } = await supabase
        .from("loads")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw new Error("Carga não encontrada no servidor");
      return data;
    } catch (error) {
      alert("Erro ao buscar carga por ID");
      throw error;
    }
  },

  // Salva uma carga
  async createLoads(loads) {
    const { data, error } = await supabase
      .from("loads")
      .insert([loads])
      .select();

    if (error) {
      throw new Error(`Erro no servidor: ${error.message}`);
    }
    return data[0];
  },

  // Edita uma carga
  async updateloads(loads) {
    try {
      const { data, error } = await supabase
        .from("loads")
        .update(loads)
        .eq("id", loads.id)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      alert("Erro ao editar carga");
      throw error;
    }
  },

  // Deleta uma carga
  async deleteloads(id) {
    try {
      const { error } = await supabase.from("loads").delete().eq("id", id);

      if (error) {
        throw new Error(`Erro no servidor: ${error.message}`);
      }
      return true;
    } catch (error) {
      alert("Erro ao excluir uma carga");
      throw error;
    }
  },
};

export default loadsApi;
