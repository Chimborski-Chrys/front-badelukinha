# Badelukinha - Catálogo Exclusivo de Moda Infantil

Bem-vindo ao repositório do frontend do **Ateliê Badelukinha**, uma marca especializada em moda infantil. O sistema foi transformado em uma vitrine exclusiva para apresentar as coleções da marca.

## Visão Geral do Projeto

O Badelukinha é um catálogo virtual projetado para exibir produtos de forma elegante. O objetivo é facilitar a visualização das criações e permitir o contato direto via WhatsApp para orçamentos e compras.

## Principais Funcionalidades

### Catálogo (Público)
- **Home Exclusiva**: Página inicial com o catálogo completo do ateliê.
- **Visualização Detalhada**: Detalhes do produto com galeria de imagens e especificações.
- **Categorização**: Filtros por categorias (Fleece, Fantasias, Vestidos, Casuais).
- **Integração WhatsApp**: Botão direto para solicitar orçamentos via WhatsApp.

### Gestão (Administrativo)
- **Dashboard de Performance**: Monitoramento de cliques e visualizações de produtos.
- **Gestão de Produtos**: Cadastro, edição e exclusão de itens do catálogo.
- **Perfil do Ateliê**: Edição de informações de contato, sobre e localização.

## Estrutura Técnica

- **Tecnologia**: Vue.js 3 (Composition API)
- **Build**: Vite
- **Estado**: Pinia
- **Estilo**: Tailwind CSS
- **Layout**: Responsivo, otimizado para mobile e desktop.

## Configuração

1. **Instale as dependências:**
   ```bash
   npm install
   ```
2. **Configure o `.env`:**
   ```env
   VITE_API_BASE_URL="http://localhost:5000/api"
   VITE_GOOGLE_CLIENT_ID="..."
   ```
3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

---
Catálogo desenvolvido para o **Ateliê Badelukinha**.
