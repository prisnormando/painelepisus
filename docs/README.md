# Painel EpiSUS Intermediário

Painel de análise do perfil e distribuição geográfica dos egressos do curso EpiSUS Intermediário (Fiocruz).

## Estrutura de Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `index.html` | Página principal com layout, estilos CSS e estrutura HTML |
| `app.js` | Lógica da aplicação (filtros, gráficos, mapa, KPIs) |
| `dados.js` | Base de dados dos egressos em formato JavaScript |
| `estados.js` | GeoJSON dos estados brasileiros para o mapa |
| `logo_branco.svg` | Logo EpiSUS (versão branca para header escuro) |
| `logo_cor.svg` | Logo EpiSUS (versão colorida) |
| `logo_preto.svg` | Logo EpiSUS (versão preta) |

## Funcionalidades

- **KPIs**: Total de Egressos, Municípios Alcançados, Taxa de Sucesso, Turmas, UFs
- **Mapa Interativo**: Distribuição geográfica com clusters, zoom, tooltips e expansão fullscreen
- **Filtros Globais**: Turma, Município, Porte, Sexo, Raça/Cor, Faixa Etária, Tema do TCC
- **Gráficos**: 12 visualizações interativas (barras, donut, horizontal)
- **Responsivo**: Adaptável a desktop, tablet e mobile
- **Acessibilidade**: Contraste WCAG AA, fonte legível

## Deploy no GitHub Pages

1. Crie um repositório no GitHub
2. Faça upload de todos os arquivos para a branch `main`
3. Vá em Settings > Pages > Source: Deploy from branch `main` / `/ (root)`
4. O painel estará disponível em `https://seu-usuario.github.io/nome-repo/`

## Deploy no CPanel

1. Acesse o Gerenciador de Arquivos do CPanel
2. Navegue até `public_html/` (ou subdiretório desejado)
3. Faça upload de todos os arquivos do projeto
4. O painel estará disponível no domínio configurado

## Dependências Externas (CDN)

- [Leaflet 1.9.4](https://leafletjs.com/) - Mapa interativo
- [Leaflet MarkerCluster 1.5.3](https://github.com/Leaflet/Leaflet.markercluster) - Agrupamento de marcadores
- [Chart.js 4.4.0](https://www.chartjs.org/) - Gráficos
- [Google Fonts (Inter)](https://fonts.google.com/specimen/Inter) - Tipografia
- [CARTO Basemaps](https://carto.com/basemaps/) - Tiles do mapa

## Design System

| Token | Valor | Uso |
|-------|-------|-----|
| Primary | `#1A1A2E` | Header, textos principais |
| Secondary | `#E67E22` | Destaques, botões, gráficos |
| Tertiary | `#D35400` | Hover, ênfase |
| Neutral | `#F4F7F6` | Background |
| Font | Inter | Toda a interface |

## Regras de Negócio Aplicadas

- **Taxa de Sucesso**: Calculada apenas para turmas finalizadas
- **Abrangência TCC**: DSEI e Regional foram aglutinados em "Estadual"
- **Raça/Cor**: Dados ausentes exibidos como "Não informado"
- **Temas TCC**: Normalização semântica (case-insensitive) aplicada
- **Variáveis excluídas**: tipo_de_vaga, atuacao_saude_publica, investigou_surto, egresso_ensino_fundamental
