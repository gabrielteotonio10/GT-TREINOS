import apiTraining from "./api.js";

const uiTraining = {
  async fillForm(trainingId) {
    const training = await apiTraining.searchTrainingById(trainingId);
    document.getElementById("nome-treino").value = training.id;
    document.getElementById("pensamento-conteudo").value = pensamento.conteudo;
    document.getElementById("pensamento-autoria").value = pensamento.autoria;
  },

  async renderizarPensamentos() {
    const listaPensamentos = document.getElementById("lista-pensamentos");

    try {
      const pensamentos = await apiTraining.buscarPensamentos();
      if (pensamentos.length === 0) {
        listaPensamentos.innerHTML =
          "<li class='nenhum-pensamento'>Nada por aqui, que tal compartilhar alguma ideia?</li>";
        return;
      }
      pensamentos.forEach(ui.adicionarPensamentoNaLista);
    } catch {
      alert("Erro ao renderizar pensamentos");
    }
  },

  limparFormulario() {
    document.getElementById("pensamento-form").reset();
  },

  adicionarPensamentoNaLista(pensamento) {
    // Selecionando a lista onde os pensamentos serão adicionados
    const listaPensamentos = document.getElementById("lista-pensamentos");

    // Criando os elementos HTML necessários para exibir o pensamento
    const li = document.createElement("li"); // Criando um elemento <li>
    li.setAttribute("data-id", pensamento.id); // Adicionando o atributo data-id
    li.classList.add("li-pensamento"); // Adicionando a classe CSS

    // Criando imagem aspas
    const iconeAspas = document.createElement("img");
    iconeAspas.src = "assets/imagens/aspas-azuis.png";
    iconeAspas.alt = "Aspas azuis";
    iconeAspas.classList.add("icone-aspas");

    // Criando o pensamento conteúdo
    const pensamentoConteudo = document.createElement("div");
    pensamentoConteudo.textContent = pensamento.conteudo;
    pensamentoConteudo.classList.add("pensamento-conteudo");

    // Criando o pensamento autoria
    const pensamentoAutoria = document.createElement("div");
    pensamentoAutoria.textContent = pensamento.autoria;
    pensamentoAutoria.classList.add("pensamento-autoria");

    // Criando o botão editar
    const botaoEditar = document.createElement("button");
    botaoEditar.classList.add("botao-editar");
    botaoEditar.onclick = () => ui.preencherFormulario(pensamento.id);
    // Icone do botão editar
    const iconeEditar = document.createElement("img");
    iconeEditar.src = "assets/imagens/icone-editar.png";
    iconeEditar.alt = "Editar";
    botaoEditar.appendChild(iconeEditar);

    // Criando o botão excluir
    const botaoExcluir = document.createElement("button");
    botaoExcluir.classList.add("botao-excluir");
    botaoExcluir.onclick = async () => {
      try {
        await apiTraining.excluirPensamento(pensamento.id);
        ui.renderizarPensamentos();
      } catch (error) {
        alert("Erro ao excluir pensamento");
        throw error;
      }
    };
    // Icone do botão excluir
    const iconeExcluir = document.createElement("img");
    iconeExcluir.src = "assets/imagens/icone-excluir.png";
    iconeExcluir.alt = "Excluir";
    botaoExcluir.appendChild(iconeExcluir);

    const icones = document.createElement("div");
    icones.classList.add("icones");
    icones.appendChild(botaoEditar);
    icones.appendChild(botaoExcluir);

    // Adicionando os elementos filhos ao <li>
    li.appendChild(iconeAspas);
    li.appendChild(pensamentoConteudo);
    li.appendChild(pensamentoAutoria);
    li.appendChild(icones);
    listaPensamentos.appendChild(li); // Adicionando o <li> à lista
  },
};

export default uiTraining;
