const BASE_URL = "http://localhost:3000";

const exercisesApi = {
  // Procura os exercícios registrados
  async getExercises() {
    try {
      const response = await fetch(`${BASE_URL}/exercises`);
      if (!response.ok) throw new Error("Erro ao buscar os exercícios");
      return await response.json();
    } catch (error) {
      alert("Erro ao buscar os exercícios");
      throw error;
    }
  },

  // Procura um exercício pelo Id
  async getExercisesById(id) {
    try {
      const response = await fetch(`${BASE_URL}/exercises/${id}`);
      return await response.json();
    } catch (error) {
      alert("Erro ao buscar exercício por ID");
      throw error;
    }
  },

  // Salva um exercício 
  async createExercises(exercises) {
    const response = await fetch(`${BASE_URL}/exercises`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(exercises),
    });
    if (!response.ok) {
      throw new Error(`Erro no servidor: ${response.status}`);
    }
    return await response.json();
  },

  // Edita um exercício 
  async updateExercises(exercises) {
    try {
      const response = await fetch(`${BASE_URL}/exercises/${exercises.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(exercises),
      });
      return await response.json();
    } catch (error) {
      alert("Erro ao editar exercício");
      throw error;
    }
  },

  // Deleta um exercício
  async deleteExercises(id) {
    try {
      const response = await fetch(`${BASE_URL}/exercises/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`Erro no servidor: ${response.status}`);
      }
      return true;
    } catch (error) {
      alert("Erro ao excluir um exercício");
      throw error;
    }
  },
};

export default exercisesApi;
