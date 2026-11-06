

# Scriptorium Digital — paulolopes.org

Investigação de Humanidades: linguagem e teoria crítica. 

> *"Cozinhar é uma forma de pensar a matéria. Escrever é uma forma de cozinhar a ideia."*

---

## 1. O Projeto & Visão Geral

O **Scriptorium Digital** (`paulolopes.org`) constitui um arquivo de Humanidades, um laboratório de pensamento crítico e uma oficina de resistência hospedada de forma independente. Longe do fluxo acelerado, utilitário e efêmero das redes sociais, este espaço cultiva a reflexão aprofundada, a estética, a técnica e a soberania digital. 

O ecossistema digital global articula-se em três eixos fundamentais:
1. **Matéria & Fogo:** Culinária auto-etnográfica e permacultura.
2. **Palavra & Código:** Investigação cultural, ensaísmo e programação minimalista (`C`, *Chez Scheme*, `Assembly`).
3. **Eixo Holístico:** Yoga clássico, filosofia e arquivo de artefactos visuais (desenhos, registos fotográficos e design).

---

## 2. Arquitetura Técnica & Soberania Digital

Este repositório alberga a vertente estática e programática do Scriptorium (hospedada em GitHub Pages com domínio autónomo na Hostinger). A engenharia do portal assenta em pilares de simplicidade, leveza e independência de frameworks pesadas:

* **Arquitetura SPA Minimalista (`app.js`):** Um motor de interface de página única leve e sem dependências complexas, que interpreta diretamente ficheiros Markdown no cliente.
* **Automação em Chez Scheme (`.ss`):** Scripts nativos em Scheme que varrem a árvore de ficheiros Markdown para gerar autonomamente o manifesto de navegação leve, o arquivo global e o índice de pesquisa textual (`search-index.json`).
* **CI/CD com GitHub Actions:** Um pipeline soberano que executa os scripts de compilação em Scheme e atualiza o repositório em cada novo *push* de ensaios, assegurando zero esforço manual na publicação.
* **Estilização Atemporal (`style.css` / W3.CSS):** Design focado na legibilidade tipográfica e no rigor formal das edições académicas e literárias.

---

## 3. O Motor SPA: Caraterização e Funcionamento da `app.js`

O ficheiro **`app.js`** atua como o **núcleo de processamento e renderização** da Single Page Application (SPA) do Scriptorium[span_1](start_span)[span_1](end_span). Desenhado sob critérios de máxima eficiência e soberania digital, este script gere toda a experiência de navegação do utilizador no lado do cliente (*client-side*), dispensando bases de dados relacionais ou servidores de aplicação complexos.

### Funcionalidades e Rotinas Principais:
1. **Parser de Markdown & Frontmatter (`parseMarkdown`):** 
   Lê os ficheiros de texto bruto (.md), separa e interpreta o bloco YAML (*Frontmatter*) inicial (extraindo metadados cruciais como título, data, categoria, sumário e imagem) e isola o corpo do texto para conversão em HTML em tempo de execução.
2. **Resolução Dinâmica de URLs (`resolverUrl` / `resolverImagemUrl`):** 
   Garante a portabilidade absoluta do código, calculando caminhos relativos e absolutos para recursos gráficos e ligações internas independentemente do subdiretório onde a SPA esteja a ser executada.
3. **Carregamento Otimizado com Manifesto Duplo (`carregarArtigos`):** 
   Implementa uma estratégia de carregamento em duas vias:
   * Na **página inicial (Home)**, consome o `manifest.json` (manifesto leve restrito aos artigos recentes por secção) para garantir uma abertura instantânea da página (*Initial Load Performance*).
   * Nas **secções temáticas, leitura de artigos ou pesquisa**, recorre assincronamente ao `manifest-all.json` (arquivo global) para mapear todo o espólio histórico sob demanda.
4. **Sistema de Roteamento SPA (`router`):** 
   Interceta os parâmetros da barra de endereços (`?artigo=...`, `?seccao=...`, `?q=...`) alternando dinamicamente a visibilidade entre a vista principal (`view-home`) e a vista de conteúdos/pesquisa (`view-content`) sem recarregar a página do browser.
5. **Motor de Pesquisa Textual Integrado (`executarPesquisa`):** 
   Cruzamento inteligente entre o índice estático pré-compilado (`search-index.json`) e os metadados ricos do manifesto, permitindo filtragem por termos, títulos e tags de forma fluida e imediata.

---

## 4. Estrutura do Arquivo Markdown (`md/`)

O acervo textual do Scriptorium organiza-se de forma estrita em diretórios temáticos:

* **`/corpus`** — O núcleo de ensaios, leituras críticas e narrativas experimentais. Divide-se conceptualmente em:
  * *Sementes:* Fragmentos, notas rápidas e citações.
  * *Colheitas:* Ensaios desenvolvidos e reflexões aprofundadas.
  * *Tinturas:* Ficção, prosa e registos literários.
* **`/escola`** — Cadernos académicos de investigação, estudos culturais e auto-etnografia no âmbito da Universidade Aberta.
* **`/oficina`** — Humanidades Digitais, *Critical Code Studies*, reflexões sobre arquiteturas em *Chez Scheme* e engenharia de software livre.
* **`/sobre`** — Manifesto, Protocolo P.A.R.T.E. e nota bio-bibliográfica do artífice.

---

## 5. Engenharia de Automatização & Scripts em Chez Scheme

Para assegurar a soberania digital e a total independência de dependências externas pesadas ou bases de dados em servidores comerciais, o ecossistema do *Scriptorium Digital* utiliza scripts nativos escritos em **Chez Scheme** (`.ss`). Estes scripts executam de forma autónoma no pipeline de CI/CD do GitHub Actions em cada novo *push*, processando a árvore de ficheiros Markdown (`md/`) e gerando os artefactos estáticos de navegação e busca.

### A. O Mecanismo dos Scripts (`.ss`)

1. **Varredura e Parsing Recursivo:** 
   Os scripts percorrem de forma programática o diretório `/md` e respetivas subpastas temáticas. Para cada ficheiro `.md` encontrado, o motor em Scheme lê o conteúdo, extrai o título estruturado e interpreta o bloco de metadados *Frontmatter* (YAML).
2. **Sanitização e Normalização:** 
   O conteúdo textual é limpo de quebras de linha irregulares e caracteres especiais para garantir compatibilidade estrita com os formatos de saída em JSON.

---

### B. Os Três Ficheiros de Índice e Manifesto (`.json`)

A arquitetura de dados do portal assenta em três ficheiros JSON gerados dinamicamente pelos scripts em Scheme:

* **1. `manifest.json` (O Manifesto Leve de Entrada):**
  * **O que é:** Um manifesto otimizado e de tamanho reduzido gerado pelo script `generate_manifest.ss`. Contém apenas um limite restrito de artigos recentes por cada secção temática (os 3 mais recentes por categoria).
  * **Como funciona:** É o único manifesto descarregado pelo motor SPA (`app.js`) no carregamento inicial da página principal (`index.html`), eliminando o peso de payloads desnecessários e garantindo renderização instantânea.

* **2. `manifest-all.json` (O Arquivo Global):**
  * **O que é:** O mapeamento exaustivo e total de todo o espólio histórico de ensaios e registos presentes no repositório.
  * **Como funciona:** Mantém-se estático no servidor e é requisitado pelo cliente de forma assíncrona apenas sob demanda — quando o utilizador navega para uma secção temática completa, abre um ensaio individual ou executa operações avançadas.

* **3. `search-index.json` (O Índice de Pesquisa Textual):**
  * **O que é:** Um índice unificado gerado pelo script `generate_index.ss`, contendo os metadados estruturados (`title`, `category`, `summary`, `tags`, `url`) e um excerto limpo do corpo (`content`) de cada publicação.
  * **Como funciona:** É consultado em tempo real pelo motor de busca integrado da SPA sempre que o utilizador submete um termo de pesquisa, permitindo filtragem textual instantânea.

---

## 6. O Protocolo de Publicação e Controlo

O fluxo de publicação foi concebido para o trabalho em qualquer lugar, exigindo apenas a escrita de novos blocos em Markdown com o respetivo cabeçalho *Frontmatter* (título, data, categoria). O ecossistema encarrega-se de indexar, processar e servir o conhecimento com absoluta independência e rigor estético.
