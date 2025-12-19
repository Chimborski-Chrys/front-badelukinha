# AtelieVirtual

Bem-vindo ao repositório do projeto AtelieVirtual!

## Visão Geral do Projeto

AtelieVirtual é uma plataforma gratuita desenvolvida para costureiras independentes que desejam expor suas peças online sem a necessidade de investir em um sistema de e-commerce próprio. A plataforma atua como uma vitrine virtual, conectando clientes interessados diretamente com as costureiras.

Este projeto não é um e-commerce com sistema de pagamento integrado, mas sim uma ponte para facilitar a comunicação e a apresentação dos produtos.

## Estrutura do Projeto

O projeto é composto por dois serviços principais: um backend em .NET 8 e um frontend em Vue.js 3.

### Backend (`api-atelievirtual`)

Uma API RESTful que lida com toda a lógica de negócio, acesso a dados e autenticação.

-   **Tecnologia**: .NET 8 / C#
-   **Arquitetura**: Padrões MVC, Repository e Unit of Work.
-   **Principais Componentes**:
    -   `Controllers`: Gerenciam rotas e requisições/respostas.
    -   `Services`: Contêm a lógica de negócio (ex: `AuthService`, `MegaService`).
    -   `Repositories`: Abstração para acesso a dados, incluindo `UnitOfWork`.
    -   `Models`: Entidades de domínio e DTOs (RequestModels).
    -   `Data`: `AppDbContext` do Entity Framework.
-   **Banco de Dados**: PostgreSQL com Entity Framework Core.
-   **Autenticação**: JWT (JSON Web Tokens).
-   **Serviços Externos**: Integração com MEGA para upload de imagens.

### Frontend (`front-atelievirtual`)

Uma Single Page Application (SPA) que consome a API .NET.

-   **Tecnologia**: Vue.js 3
-   **Build Tool**: Vite
-   **Base**: Utiliza o template "Admin One Vue Tailwind" para a estrutura da interface, adaptado para as áreas pública e administrativa.
-   **Recursos Principais**:
    -   **Roteamento**: `vue-router`, com rotas protegidas por autenticação.
    -   **Gerenciamento de Estado**: `pinia` (com `auth.js` para autenticação).
    -   **Estilização**: Tailwind CSS.
    -   **Comunicação com API**: `axios` configurado em `src/services/api.js`.

## Padrões de Design (UI/UX)

O design da vitrine virtual (`VitrineView`) é inspirado em `exemplo/pages/catalogo.js` e segue os seguintes padrões:

-   **Paleta de Cores**: Gradiente suave de fundo (`bg-gradient-to-b from-orange-50 via-pink-50 to-yellow-50`), com destaque em tons de vermelho e laranja.
-   **Layout**: Conteúdo centralizado com título principal e subtítulo.
-   **Filtros**: Utilização de `PillTag` para categorias, com destaque para o filtro ativo.
-   **Cards de Produto**: `CardBox` com `overflow-hidden`, `shadow-lg`, `hover:shadow-2xl`, borda tracejada (`border-2 border-red-200 border-dashed`). Imagens com zoom no hover.
-   **Botões de Ação (CTA)**: Botão "Solicitar Orçamento" com gradiente (`bg-gradient-to-r from-red-500 to-orange-500`), que abre o WhatsApp com mensagem automática e informações do produto.

---

Este README.md fornece uma visão geral do projeto. Para detalhes específicos sobre a configuração e execução, consulte a documentação interna de cada módulo.