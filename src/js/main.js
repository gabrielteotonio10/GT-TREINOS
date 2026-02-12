import uiTraining from "./ui.js";
import apiTraining from "./api.js";

// ---------- FUNÇÕES GERAIS ----------

// Abrir e fechar modal de adicionar treino
const modal = document.querySelector(".modal-container");
const addTrainingCard = document.querySelector(".add-new-training");
const closeModalBtn = document.querySelector("#btn-fechar-x");
const cancelModalBtn = document.querySelector("#btn-cancelar");

addTrainingCard.addEventListener("click", () => {
  modal.classList.add("active");
});
const fecharModal = () => {
  modal.classList.remove("active");
};
closeModalBtn.addEventListener("click", fecharModal);
cancelModalBtn.addEventListener("click", fecharModal);

// ---------- TREINOS ----------

// Captura as informações do formulário salvar
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#form-novo-treino");
  //Quando formulário for enviado
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const { id, name, image } = uiTraining.getFormData();
    try {
      // Se tem id edita, senão salva
      if (id) {
        await apiTraining.editTraining({ id, name, image });
        console.log("id");
      } else {
        await apiTraining.saveTraining({ name, image });
      }
      uiTraining.clearForm();
      fecharModal();
      // Mensagem sucesso
      const mensagemSucesso = id
        ? "Treino atualizado com sucesso!"
        : "Treino criado com sucesso!";
      uiTraining.showSuccess(mensagemSucesso);
    } catch (error) {
      console.error("Erro detalhado:", error);
      alert("Não foi possível salvar: " + error.message);
    }
  });
});

// Captura a imagem seleciona
const inputPhoto = document.querySelector("#input-foto-treino");
inputPhoto.addEventListener("change", (event) => {
  const arquivo = event.target.files[0];
  if (arquivo) {
    uiTraining.convertPhoto(arquivo);
  }
});





document.addEventListener("DOMContentLoaded", () => {
  ui.renderizarPensamentos();

  const formularioPensamento = document.getElementById("pensamento-form");
  formularioPensamento.addEventListener("submit", manipularSubmissaoFormulario);
});

async function manipularSubmissaoFormulario(event) {
  event.preventDefault(); // Evita o comportamento padrão de recarregar a página
  const id = document.getElementById("pensamento-id").value;
  const conteudo = document.getElementById("pensamento-conteudo").value;
  const autoria = document.getElementById("pensamento-autoria").value;

  try {
    if (id) {
      await api.editarPensamento({ id, conteudo, autoria });
    } else {
      await api.salvarPensamento({ conteudo, autoria });
    }
    ui.renderizarPensamentos();
  } catch {
    alert("Erro ao salvar pensamento");
  }
}

const buttonCancel = document.getElementById("botao-cancelar");
buttonCancel.addEventListener("click", () => {
  ui.limparFormulario();
});
