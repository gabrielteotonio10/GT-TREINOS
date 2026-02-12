import apiTraining from "./api.js";

let fotoConvertida = "";

const uiTraining = {
  // Converte uma foto enviada, caso tenha, para ser armazenada, diminuindo seu tamanho
  convertPhoto(arquivo) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const MAX_WIDTH = 400;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        fotoConvertida = canvas.toDataURL("image/jpeg", 0.7);

        console.log("Foto redimensionada e pronta!");
        document.querySelector(".upload i").style.color = "#4CAF50";
      };
    };
    reader.readAsDataURL(arquivo);
  },

  // Captura as informações de um formulário
  getFormData() {
    const id = document.querySelector("#training-id").value;
    let image = document.querySelector(
      'input[name="icon-treino"]:checked',
    ).value;
    if (fotoConvertida != "") image = fotoConvertida;
    const name = document.querySelector("#nome-treino").value;
    return { id, name, image };
  },

  // Limpa o formulário totalmente
  clearForm() {
    document.querySelector("#form-novo-treino").reset();
    document.querySelector("#training-id").value = "";
    fotoConvertida = "";
    document.querySelector(".upload i").style.color = "";
  },

  // Preenche o formulário
  async fillForm(trainingId) {
    const training = await apiTraining.searchTrainingById(trainingId);
    document.querySelector("#training-id").value = training.id;
    document.querySelector("#nome-treino").value = training.name;
  },

  // Mostra um aviso quando treino é criado ou editado
  showSuccess(mensagem) {
    const aviso = document.createElement("div");
    aviso.textContent = mensagem;
    aviso.classList.add("toast-aviso");
    document.body.appendChild(aviso);
    setTimeout(() => {
      aviso.classList.add("fade-out");
      aviso.addEventListener("transitionend", () => aviso.remove());
    }, 3000);
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
