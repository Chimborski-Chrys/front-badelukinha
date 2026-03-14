# Badelukinha - Catálogo de Moda Infantil

Bem-vindo ao repositório oficial do projeto **Badelukinha**, uma marca especializada em moda infantil que une conforto, estilo e diversão para os pequenos.

## Visão Geral do Projeto

O Badelukinha é uma vitrine virtual projetada para apresentar as coleções da marca de forma elegante e intuitiva. O objetivo principal é facilitar a visualização dos produtos e permitir que os clientes entrem em contato diretamente para solicitações de orçamentos e compras personalizadas.

Diferente de um e-commerce tradicional, esta plataforma foca na experiência de catálogo, utilizando o **WhatsApp** como o canal direto de fechamento de pedidos, garantindo um atendimento humano e personalizado.

## Principais Funcionalidades

### Para os Clientes (Vitrine)
- **Vitrine Virtual**: Exibição detalhada de produtos com imagens de alta qualidade e zoom interativo.
- **Categorização Inteligente**: Filtros rápidos para navegar entre categorias como:
    - Conjuntos Fleece
    - Fantasias
    - Vestidos
    - Conjuntos Casuais
- **Busca em Tempo Real**: Localização rápida de peças específicas por nome ou descrição.
- **Solicitação via WhatsApp**: Integração direta que envia os detalhes do produto escolhido para o atendimento da marca com um único clique.

### Administrativo
- **Gestão de Catálogo**: Painel para cadastro, edição e organização de produtos.
- **Dashboard de Insights**: Monitoramento de visualizações e cliques nos produtos para entender as preferências dos clientes.

## Estrutura Técnica

O ecossistema Badelukinha é construído com tecnologias modernas para garantir performance e escalabilidade.

### Frontend (`front-badelukinha`)
Uma Single Page Application (SPA) moderna e responsiva.
- **Tecnologia**: Vue.js 3
- **Ferramenta de Build**: Vite
- **Gerenciamento de Estado**: Pinia
- **Estilização**: Tailwind CSS (com foco em uma paleta suave: laranja, rosa e amarelo).
- **Interface**: Baseada no template Admin One, customizada para uma estética lúdica e infantil.

### Backend (`api-badelukinha`)
API RESTful robusta que gerencia o catálogo e a lógica de negócio.
- **Tecnologia**: .NET 8 / C#
- **Banco de Dados**: PostgreSQL com Entity Framework Core.
- **Autenticação**: JWT (JSON Web Tokens) para a área administrativa.
- **Armazenamento**: Integração para upload e gestão de imagens de produtos.

## Design e Identidade Visual

A interface do Badelukinha foi pensada para transmitir a alegria da marca:
- **Cores**: Gradientes suaves (`from-orange-50` a `to-yellow-50`) com destaques vibrantes em vermelho e laranja.
- **Componentes**: Cards de produtos com bordas tracejadas e sombras suaves, evocando um visual artesanal e cuidadoso.

---

Este projeto representa a transição da marca para o ambiente digital, oferecendo uma experiência de compra moderna e próxima do cliente.
