const BASE_URL = "http://localhost:3000";

const trainingApi = {
  // Procura os treinos registrados
  async getTrainings() {
    try {
      const response = await fetch(`${BASE_URL}/training`);
      if (!response.ok) throw new Error("Erro ao buscar training");

      const allTrainings = await response.json();

      // Vemos quem está logado
      const userString = localStorage.getItem("currentUser");
      const loggedEmail = userString ? JSON.parse(userString).email : null;
      // Se não tiver ninguém logado, não retorna nada 
      if (!loggedEmail) return [];
      // Filtra
      const myTrainings = allTrainings.filter(
        (training) => training.userEmail === loggedEmail,
      );
      return myTrainings;
    } catch (error) {
      alert("Erro ao buscar os treinos");
      throw error;
    }
  },

  // Procura um treino pelo Id
  async getTrainingById(id) {
    try {
      const response = await fetch(`${BASE_URL}/training/${id}`);
      return await response.json();
    } catch (error) {
      alert("Erro ao buscar treino por ID");
      throw error;
    }
  },

  // Salva um treino
  async createTraining(training) {
    const response = await fetch(`${BASE_URL}/training`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(training),
    });
    if (!response.ok) {
      throw new Error(`Erro no servidor: ${response.status}`);
    }
    return await response.json();
  },

  // Edita um treino
  async updateTraining(training) {
    try {
      const response = await fetch(`${BASE_URL}/training/${training.id}`, {
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

  // Deleta um treino
  async deleteTraining(id) {
    try {
      const response = await fetch(`${BASE_URL}/training/${id}`, {
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

export default trainingApi;
