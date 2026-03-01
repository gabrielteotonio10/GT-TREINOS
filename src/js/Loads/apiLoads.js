const BASE_URL = "http://localhost:3000";

const loadsApi = {
  // Procura as cargas registrados
  async getLoads() {
    try {
      const response = await fetch(`${BASE_URL}/loads`);
      if (!response.ok) throw new Error("Erro ao buscar as cargas");
      const allLoads = await response.json();

      // Vê quem está logado
      const userString = localStorage.getItem("currentUser");
      const loggedEmail = userString ? JSON.parse(userString).email : null;
      if (!loggedEmail) return [];
      // Só devolve as cargas que pertencem a quem está logado
      const myLoads = allLoads.filter(
        (loads) => loads.userEmail === loggedEmail,
      );

      return myLoads;
    } catch (error) {
      alert("Erro ao buscar os cargas");
      throw error;
    }
  },

  // Procura uma carga pelo Id
  async getLoadById(id) {
    try {
      const response = await fetch(`${BASE_URL}/loads/${id}`);
      if (!response.ok) throw new Error("Carga não encontrada no servidor");
      return await response.json();
    } catch (error) {
      alert("Erro ao buscar carga por ID");
      throw error;
    }
  },

  // Salva uma carga
  async createLoads(loads) {
    const response = await fetch(`${BASE_URL}/loads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loads),
    });
    if (!response.ok) {
      throw new Error(`Erro no servidor: ${response.status}`);
    }
    return await response.json();
  },

  // Edita uma carga
  async updateloads(loads) {
    try {
      const response = await fetch(`${BASE_URL}/loads/${loads.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loads),
      });
      return await response.json();
    } catch (error) {
      alert("Erro ao editar carga");
      throw error;
    }
  },

  // Deleta uma carga
  async deleteloads(id) {
    try {
      const response = await fetch(`${BASE_URL}/loads/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`Erro no servidor: ${response.status}`);
      }
      return true;
    } catch (error) {
      alert("Erro ao excluir uma carga");
      throw error;
    }
  },
};

export default loadsApi;
