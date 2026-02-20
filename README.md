# 🏋️‍♂️ GT Treinos

> Sua ficha de academia digital, minimalista, responsiva e focada em resultados.

![Status do Projeto](https://img.shields.io/badge/Status-Em%20Desenvolvimento-success)
![Linguagem](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript&logoColor=black)

## 💻 Sobre o Projeto

O **GT Treinos** é uma aplicação web (Single Page Application - SPA) desenvolvida para substituir as fichas de papel e os blocos de notas confusos na hora do treino, evoluindo gradativamente para um assistente completo de musculação.

O grande diferencial deste projeto é a sua construção: **100% Vanilla JavaScript**. O objetivo principal é consolidar fundamentos avançados de Engenharia de Software no Front-End, aplicando conceitos de componentização, delegação de eventos, manipulação reativa do DOM e arquitetura de código sem a dependência de frameworks externos (como React ou Angular). O resultado é uma aplicação extremamente leve e de alta performance.

## ⚙️ Funcionalidades

### 🚀 Implementadas
- **Gestão de Treinos:** Criação, edição e exclusão de fichas de treino personalizadas (ex: Treino A, Costas e Bíceps).
- **Biblioteca de Exercícios:** Cadastro completo de exercícios contendo nome, foto/ícone, músculo alvo, séries, repetições e carga.
- **Associação Dinâmica:** Adicione ou remova exercícios de um treino específico de forma fluida e instantânea.
- **Sistema de Buscas:** Filtros em tempo real na biblioteca de exercícios e de treinos.
- **Persistência de Dados (Local):** Os dados são armazenados e gerenciados localmente garantindo que suas fichas não desapareçam ao fechar o navegador.

### 🗺️ Roadmap (Próximos Passos)
- [ ] **Modo de Execução:** Interface dedicada para o momento do treino, permitindo marcar ("check") os exercícios concluídos.
- [ ] **Timer de Descanso:** Cronômetro dinâmico integrado para pausas precisas entre as séries.
- [ ] **Sistema de Autenticação:** Login de usuários com perfis individuais.
- [ ] **Cloud Storage e APIs:** Migração dos dados locais para um banco de dados em nuvem.
- [ ] **Dashboard de Evolução:** Painel analítico com histórico de treinos, último treino realizado, estatísticas de volume de carga e sugestões inteligentes.

## 🏗️ Arquitetura e Código

O projeto utiliza uma separação lógica de responsabilidades semelhante ao padrão MVC (Model-View-Controller) adaptado para Vanilla JS:
- **`apiTraining.js` / `apiExercises.js`:** Camada de dados responsável pela comunicação, armazenamento e requisições (Data Layer).
- **`uiTraining.js` / `uiExercises.js`:** Camada de interface responsável por toda a manipulação do DOM, renderização de templates HTML e atualizações visuais (View/UI Layer).
- **`main.js`:** Ponto de entrada da aplicação, gerenciando o estado global, o roteamento entre as telas (SPA) e a delegação de eventos principais (Controller).

## 🛠 Tecnologias Utilizadas

- **HTML5:** Semântica avançada e estruturação de Single Page Application.
- **CSS3:** Flexbox, CSS Grid, Media Queries para responsividade mobile-first e Variáveis Globais (Custom Properties).
- **JavaScript (ES6+):** - Manipulação avançada do DOM (Reatividade manual).
  - Delegação de Eventos (Event Delegation).
  - Assincronismo (`async/await`, `Promises`).