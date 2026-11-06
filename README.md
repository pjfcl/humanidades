# Scriptorium Digital — paulolopes.org

Investigação de Humanidades: linguagem e teoria crítica, culinária auto-etnográfica e soberania digital. 

> *"Cozinhar é uma forma de pensar a matéria. Escrever é uma forma de cozinhar a ideia."*

---

## 1. O Projeto & Visão Geral

O **Scriptorium Digital** (`paulolopes.org`) constitui um arquivo de Humanidades, um laboratório de pensamento crítico, um blog auto-etnográfico e uma oficina de resistência hospedada de forma independente. Longe do fluxo acelerado, utilitário e efêmero das redes sociais, este espaço cultiva a reflexão aprofundada, a estética, a técnica e a soberania digital. 

O ecossistema digital global articula-se em três eixos fundamentais:
1. **Matéria & Fogo:** Culinária auto-etnográfica (food blog), permacultura e artesanato da matéria.
2. **Palavra & Código:** Investigação cultural, ensaísmo académico e programação minimalista (`C`, *Chez Scheme*, `Assembly`).
3. **Eixo Holístico:** Yoga clássico, filosofia e arquivo de artefactos visuais (desenhos, registos fotográficos e design).

---

## 2. Arquitetura Técnica & Soberania Digital

Este repositório alberga a vertente estática e programática do Scriptorium (hospedada em GitHub Pages com domínio autónomo na Hostinger). A engenharia do portal assenta em pilares de simplicidade, leveza e independência de frameworks pesadas:

* **Arquitetura SPA Minimalista (`app.js`):** Um motor de interface de página única leve e sem dependências complexas, que interpreta diretamente ficheiros Markdown no cliente.
* **Automação em Chez Scheme (`.ss`):** Scripts nativos em Scheme que varrem recursivamente a árvore de ficheiros Markdown para gerar autonomamente o manifesto de navegação leve, o arquivo global e o índice de pesquisa textual (`search-index.json`).
* **CI/CD com GitHub Actions:** Um pipeline soberano que executa os scripts de compilação em Scheme e atualiza o repositório em cada novo *push* de ensaios, assegurando zero esforço manual na publicação.
* **Estilização Atemporal (`style.css` / W3.CSS):** Design focado na legibilidade tipográfica e no rigor formal das edições académicas e literárias.

---

## 3. O Motor SPA: Caraterização e Funcionamento da `app.js`

O ficheiro **`app.js`** atua como o **núcleo de processamento e renderização** da Single Page Application (SPA) do Scriptorium. Desenhado sob critérios de máxima eficiência e soberania digital, este script gere toda a experiência de navegação do utilizador no lado do cliente (*client-side*).

### Funcionalidades e Rotinas Principais:
1. **Parser de Markdown & Frontmatter (`parseMarkdown`):** 
   Lê os ficheiros de texto bruto (.md), separa e interpreta o bloco YAML (*Frontmatter*) inicial (extraindo metadados cruciais como título, data, categoria, tags, sumário e imagem) e isola o corpo do texto para conversão em HTML em tempo de execução.
2. **Resolução Dinâmica de URLs (`resolverUrl` / `resolverImagemUrl`):** 
   Garante a portabilidade absoluta do código, calculando caminhos relativos e absolutos para recursos gráficos e ligações internas.
3. **Carregamento Otimizado com Manifesto Duplo (`carregarArtigos`):** 
   Implementa uma estratégia de carregamento em duas vias:
   * Na **página inicial (Home)**, consome o `manifest.json` (manifesto leve restrito ao artigo mais recente de cada categoria/subpasta) para garantir uma abertura instantânea da página (*Initial Load Performance*).
   * Nas **secções temáticas, filtros avançados ou pesquisa**, recorre assincronamente ao `manifest-all.json` (arquivo global) para mapear todo o espólio histórico sob demanda.
4. **Sistema de Roteamento SPA e Parâmetros (`router`):** 
   Interceta os parâmetros da barra de endereços alternando dinamicamente a vista sem recarregar o browser.

---

## 4. O Sistema de Pesquisa e Parâmetros de URL

O motor de navegação e busca do Scriptorium suporta diretamente múltiplos parâmetros na barra de endereços (`index.html?...`), permitindo uma arquitetura de rotas limpa e estática:

* **`?artigo=[slug]`**
  * *O que faz:* Abre, hidrata e renderiza o conteúdo integral de um ensaio ou registo específico para leitura profunda.
* **`?seccao=[nome]`**
  * *O que faz:* Filtra e lista todos os registos pertencentes a uma secção principal do arquivo (ex: `corpus`, `escola`, `oficina`, `sobre`).
* **`?categoria=[nome]`**
  * *O que faz:* Filtra dinamicamente o acervo por categorias específicas (ex: `semente`, `colheita`, `tintura`) ou subpastas de origem.
* **`?tag=[termo]`**
  * *O que faz:* Realiza um cruzamento transversal por etiquetas temáticas presentes nos metadados dos artigos (ex: `?tag=antropologia`).
* **`?ano=[YYYY]`**
  * *O que faz:* Agrupa e apresenta toda a produção intelectual e auto-etnográfica publicada num determinado ano civil (ex: `?ano=2026`).
* **`?q=[termo]`**
  * *O que faz:* Ativa o **motor de pesquisa textual integral (`executarPesquisa`)**. Consulta em tempo real o índice estático pré-compilado (`search-index.json`) cruzando títulos, sumários, tags e o corpo integral do texto (`content`), hidratando os resultados com os metadados do manifesto completo.

---

## 5. Estrutura do Arquivo Markdown (`md/`)

O acervo textual do Scriptorium organiza-se de forma estrita em diretórios temáticos e respetivas subpastas recursivas:

* **`/corpus`** — O núcleo de ensaios, leituras críticas e narrativas experimentais. Organiza-se em subpastas:
  * *Sementes:* Fragmentos, notas rápidas e citações.
  * *Colheitas:* Ensaios desenvolvidos e reflexões aprofundadas.
  * *Tinturas:* Ficção, prosa e registos literários.
* **`/escola`** — Cadernos académicos de investigação, estudos culturais e auto-etnografia no âmbito da Universidade Aberta.
* **`/oficina`** — Humanidades Digitais, *Critical Code Studies*, arquiteturas em *Chez Scheme* e engenharia de software livre.
* **`/sobre`** — Manifesto, Protocolo P.A.R.T.E. e nota bio-bibliográfica do artífice.

---

## 6. Engenharia de Automatização & Scripts em Chez Scheme

Os scripts nativos escritos em **Chez Scheme** (`.ss`) executam de forma autónoma no pipeline de CI/CD do GitHub Actions em cada novo *push*, processando a árvore de ficheiros Markdown (`md/`) e gerando os seguintes artefactos estáticos:

1. **`manifest.json` (O Manifesto Leve de Entrada):** Contém estritamente o artigo mais recente de cada categoria/subpasta, assegurando o carregamento rápido da página inicial.
2. **`manifest-all.json` (O Arquivo Global):** O mapeamento exaustivo de todo o espólio histórico para navegação profunda e filtros.
3. **`search-index.json` (O Índice de Pesquisa Textual):** Índice unificado com metadados estruturados e excertos do corpo textual para consulta instantânea via parâmetro `?q=`.
