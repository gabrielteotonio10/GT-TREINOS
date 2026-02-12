const URL_BASE = "http://localhost:3000"; 

const apiTraining = {
  async searchTraining() {
    try {
      const response = await fetch(`${URL_BASE}/training`); 
      if (!response.ok) throw new Error("Erro ao buscar training");
      return await response.json();
    } catch (error) {
      alert("Erro ao buscar os treinos");
      throw error;
    }
  },

  async saveTraining(training) {
    try {
      const response = await fetch(`${URL_BASE}/training`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(training),
      });
      return await response.json();
    } catch (error) {
      alert("Erro ao salvar o treino"); 
      throw error;
    }
  },

  async searchTrainingById(id) {
    try {
      const response = await fetch(`${URL_BASE}/training/${id}`);
      return await response.json();
    } catch (error) {
      alert("Erro ao buscar treino por ID");
      throw error;
    }
  },

  async editTraining(training) {
    try {
      const response = await fetch(`${URL_BASE}/training/${training.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(training),
      });
      return await response.json();
    } catch (error) {
      alert("Erro ao editar treino");
      throw error;
    }
  },

  async deleteTraining(id) {
    try {
      const response = await fetch(`${URL_BASE}/training/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`Erro no servidor: ${response.status}`);
      }
      return true;
    } catch (error) {
      alert("Erro ao excluir um treino");
      throw error;
    }
  },
};

export default apiTraining;
