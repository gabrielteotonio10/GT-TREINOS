# 🏋️‍♂️ GT Treinos

> **Sua ficha de academia digital, inteligente e na nuvem.** Uma aplicação de alta performance para quem busca foco total nos treinos e acompanhamento real de evolução.

🔗 **[Acesse a aplicação ao vivo aqui](https://gttreinos.netlify.app)**

---

## 💻 Sobre o Projeto

O **GT Treinos** nasceu com o desafio de provar que é possível construir sistemas robustos e escaláveis utilizando **100% Vanilla JavaScript**. Inicialmente desenvolvido para substituir fichas de papel, o projeto evoluiu para uma plataforma **Full Stack** completa.

Hoje, a aplicação oferece uma experiência fluida de **Single Page Application (SPA)**, integrada a um banco de dados relacional na nuvem, garantindo segurança de dados, cálculos inteligentes de saúde e ferramentas de exportação profissional.

---

## ⚙️ Funcionalidades Principais

### 🔒 Autenticação e Perfil

* **Sistema de Contas:** Registro e Login integrados ao banco de dados Supabase.
* **Perfil Biométrico:** Cálculo automático de **IMC** (Índice de Massa Corporal) e **TMB** (Taxa Metabólica Basal).
* **Customização:** Upload de foto de perfil e escolha entre **Modo Claro** e **Modo Escuro**.

### 📋 Gestão de Treinamento (CRUD Completo)

* **Fichas Personalizadas:** Crie, edite e organize treinos por grupos musculares.
* **Biblioteca de Exercícios:** Catálogo individual com upload de fotos, controle de séries, repetições e histórico de cargas.
* **Associação Dinâmica:** Arraste e adicione exercícios às fichas de forma instantânea.
* **Busca Inteligente:** Filtros em tempo real para encontrar treinos ou exercícios em milissegundos.

### ⚡ Modo Execução (Interface Ativa)

* **Checklist de Treino:** Marque exercícios concluídos durante a sessão.
* **Cronômetro Duplo:** Timer principal de duração do treino + Cronômetro de descanso entre séries.
* **Relógio Flutuante:** Continue acompanhando seu tempo mesmo navegando por outras telas do app.

### 📊 Inteligência e Resultados

* **Dashboard Semanal:** Visualização compacta dos dias treinados na última semana.
* **Favoritos:** Identificação automática da ficha e do exercício mais realizados.
* **Exportação PDF:** Gere relatórios profissionais das suas fichas ou do seu desempenho geral para compartilhar com seu treinador.

---

## 🏗️ Arquitetura Técnica

O projeto evita a "caixa preta" dos frameworks e utiliza uma arquitetura modular baseada em **Separação de Preocupações (SoC)**:

* **Camada de Dados (`api/`):** Abstração das chamadas ao Supabase utilizando funções assíncronas (`async/await`).
* **Camada de Interface (`ui/`):** Componentização lógica que gerencia a manipulação reativa do DOM.
* **Roteamento SPA:** Sistema de navegação customizado que altera o estado da página sem recarregamento (Zero Refresh).
* **Persistência Híbrida:** Uso estratégico de **LocalStorage** para sessões rápidas e **PostgreSQL** para persistência de longo prazo.

---

## 🛠 Tecnologias Utilizadas

* **Core:** HTML5, CSS3, JavaScript (ES6+).
* **Backend-as-a-Service:** [Supabase](https://supabase.com/) (Auth, Database & Storage).
* **Build Tool:** [Vite](https://vitejs.dev/) para empacotamento e performance.
* **Bibliotecas:** - FontAwesome (Ícones)
* Html2Pdf.js (Geração de relatórios)


* **Design:** CSS Grid, Flexbox e Variáveis Globais para alta responsividade (Mobile First).

---

## 🚀 Como Executar o Projeto Localmente

1. **Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/gt-treinos.git

```


2. **Instale as dependências:**
```bash
npm install

```


3. **Configure as variáveis de ambiente:**
Crie um arquivo `.env` ou configure no seu `supabase.js` a sua `SUPABASE_URL` e `SUPABASE_ANON_KEY`.
4. **Inicie o servidor de desenvolvimento:**
```bash
npm run dev

```



---

## 👨‍💻 Desenvolvedor

**Gabriel Teotônio** *Desenvolvedor Front-End focado em performance e código limpo.*

---

> "Transformando suor em dados, e código em resultados." 💪

---



