/* ==========================================================================
   PAULOLOPES.ORG / SCRIPTORIUM DIGITAL — Motor SPA Blindado com Pesquisa (app.js)
   Soberania Digital, Humanidades & Arquitetura Estática
   Autor: Paulo Furtado Lopes (mail@paulolopes.org)
   ========================================================================== */

function parseMarkdown(text) {
    const cleanText = text.replace(/^\uFEFF/, '');
    let meta = {};
    let content = cleanText;

    const regex = /^\s*---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n([\s\S]*)$/;
    const match = cleanText.match(regex);

    if (match) {
        const rawYaml = match[1];
        content = match[2].trim();

        const lines = rawYaml.split(/\r?\n/);
        for (const line of lines) {
            const colonIndex = line.indexOf(':');
            if (colonIndex !== -1) {
                const key = line.substring(0, colonIndex).trim().toLowerCase();
                let val = line.substring(colonIndex + 1).trim();
                val = val.replace(/^["'](.*)["']$/, '$1');
                meta[key] = val;
            }
        }
    }

    if (content.startsWith('---')) {
        const parts = content.split('---');
        if (parts.length >= 3) {
            content = parts.slice(2).join('---').trim();
        }
    }

    return { meta, content };
}

function resolverUrl(path) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const clean = path.startsWith('/') ? path.substring(1) : path;
    const pathname = window.location.pathname;
    const baseDir = pathname.substring(0, pathname.lastIndexOf('/') + 1);
    return baseDir + clean;
}

// Função auxiliar para mapear o nome da imagem indicado no frontmatter para o caminho absoluto
function resolverImagemUrl(imagemMeta) {
    if (!imagemMeta) return '';
    if (imagemMeta.startsWith('http') || imagemMeta.startsWith('/')) {
        return resolverUrl(imagemMeta);
    }
    return resolverUrl(`assets/img/${imagemMeta}`);
}

async function carregarTodosArtigos() {
    let artigos = [];

    try {
        const manifestUrl = resolverUrl('manifest.json');
        const manifestRes = await fetch(manifestUrl);
        if (!manifestRes.ok) throw new Error(`HTTP ${manifestRes.status} ao carregar manifest.json`);
        
        const manifestData = await manifestRes.json();
        const entradas = manifestData.artigos || [];

        for (const item of entradas) {
            try {
                const articleUrl = resolverUrl(item.path);
                const res = await fetch(articleUrl);
                
                if (res.ok) {
                    const rawText = await res.text();
                    const parsed = parseMarkdown(rawText);

                    const tituloRaw = parsed.meta.title || parsed.meta.Title || item.slug.replace(/^[0-9]+_/, '').replace(/[-_]/g, ' ');
                    const tituloFormatado = String(tituloRaw).charAt(0).toUpperCase() + String(tituloRaw).slice(1);
                    
                    const dataRaw = parsed.meta.date || parsed.meta.published || parsed.meta.created || '';
                    const sumarioRaw = parsed.meta.summary || parsed.meta.description || parsed.content.replace(/^#+\s+.*/gm, '').trim().substring(0, 140) + '...';
                    
                    // Tratamento da imagem a partir dos metadados (image, cover ou thumbnail)
                    const imagemRaw = parsed.meta.image || parsed.meta.cover || parsed.meta.thumbnail || '';
                    const imagemFormatada = resolverImagemUrl(imagemRaw);

                    artigos.push({
                        path: item.path,
                        slug: item.slug,
                        section: item.section.toLowerCase(),
                        meta: {
                            ...parsed.meta,
                            title: tituloFormatado,
                            date: dataRaw,
                            summary: sumarioRaw,
                            image: imagemFormatada
                        },
                        content: parsed.content
                    });
                }
            } catch (errItem) {
                console.warn(`[Scriptorium] Erro a carregar ${item.path}:`, errItem);
            }
        }
    } catch (e) {
        console.error("[Scriptorium] Erro crítico ao carregar manifesto:", e);
    }

    artigos.sort((a, b) => {
        const d1 = a.meta.date ? new Date(a.meta.date) : new Date(0);
        const d2 = b.meta.date ? new Date(b.meta.date) : new Date(0);
        return d2 - d1;
    });
    
    return artigos;
}

async function renderizarCapa(artigos) {
    const container = document.getElementById('entradas-recentes');
    if (!container) return;

    if (artigos.length === 0) {
        container.innerHTML = `<p class="font-mono" style="font-size: 0.85rem; color: var(--accent-color);">Nenhum registo encontrado no Scriptorium.</p>`;
        return;
    }

    const sementes = artigos.filter(a => (a.meta.type || '').toLowerCase() === 'semente' || (a.meta.category || '').toLowerCase() === 'semente' || (a.meta.categories || '').toLowerCase().includes('semente'));
    const colheitas = artigos.filter(a => a.section === 'corpus' && !sementes.includes(a) && (a.meta.type || '').toLowerCase() !== 'tintura' && (a.meta.category || '').toLowerCase() !== 'tintura');
    const tinturas = artigos.filter(a => (a.meta.type || '').toLowerCase() === 'tintura' || (a.meta.category || '').toLowerCase() === 'tintura');
    const escola = artigos.filter(a => a.section === 'escola');
    const oficina = artigos.filter(a => a.section === 'oficina');
    const sobre = artigos.filter(a => a.section === 'sobre');

    const escolhidos = [];
    const slugsUsados = new Set();

    const adicionarMaisRecente = (lista) => {
        for (const art of lista) {
            if (art && !slugsUsados.has(art.slug)) {
                escolhidos.push(art);
                slugsUsados.add(art.slug);
                break;
            }
        }
    };

    adicionarMaisRecente(sementes);
    adicionarMaisRecente(colheitas);
    adicionarMaisRecente(tinturas);
    adicionarMaisRecente(escola);
    adicionarMaisRecente(oficina);
    adicionarMaisRecente(sobre);

    let htmlOutput = '';

    escolhidos.forEach(artigo => {
        const linkUrl = `index.html?artigo=${artigo.slug}`;
        const catLabel = (artigo.meta.category || artigo.section).toUpperCase();
        const dataArtigo = artigo.meta.date || '';
        
        // Renderização opcional da miniatura no cartão se existir imagem definida
        const thumbnailHtml = artigo.meta.image ? `
            <div style="margin-bottom: 12px; overflow: hidden; border-radius: 2px;">
                <img src="${artigo.meta.image}" alt="${artigo.meta.title}" style="width: 100%; height: 160px; object-fit: cover; display: block;">
            </div>` : '';
        
        htmlOutput += `
            <a href="${linkUrl}" class="entry-card-link">
                <div class="entry-card">
                    ${thumbnailHtml}
                    <span class="entry-meta">${catLabel} • ${dataArtigo}</span>
                    <h3>${artigo.meta.title}</h3>
                    <p>${artigo.meta.summary || ''}</p>
                </div>
            </a>
        `;
    });

    container.innerHTML = htmlOutput;
}

async function executarPesquisa(termo) {
    const viewHome = document.getElementById('view-home');
    const viewContent = document.getElementById('view-content');
    
    viewHome.style.display = 'none';
    viewContent.style.display = 'block';

    viewContent.innerHTML = `
        <div class="breadcrumb" style="margin-bottom: 20px;">
            <a href="index.html">Início</a> / <span>Pesquisa</span>
        </div>
        <h2 class="font-sans" style="font-size: 1.25rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: var(--text-color); margin-top: 0; margin-bottom: 25px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
            Resultados para: "${termo}"
        </h2>
        <div id="resultados-pesquisa">
            <p class="font-mono" style="font-size: 0.85rem; color: var(--muted-color);">A consultar o índice do Chez Scheme...</p>
        </div>
    `;

    try {
        const res = await fetch(resolverUrl('search-index.json'));
        if (!res.ok) throw new Error("Não foi possível carregar o índice de pesquisa.");
        
        const indexData = await res.json();
        const termoLower = termo.toLowerCase();

        // Expansão da pesquisa para abranger título, conteúdo, summary e tags
        const filtrados = indexData.filter(item => {
            const titulo = (item.title || "").toLowerCase();
            const conteudo = (item.content || "").toLowerCase();
            const summary = (item.summary || "").toLowerCase();
            const tags = (item.tags || "").toLowerCase();
            
            return titulo.includes(termoLower) || 
                   conteudo.includes(termoLower) || 
                   summary.includes(termoLower) || 
                   tags.includes(termoLower);
        });

        const containerResultados = document.getElementById('resultados-pesquisa');
        if (!containerResultados) return;

        if (filtrados.length === 0) {
            containerResultados.innerHTML = `
                <p class="font-mono" style="font-size: 0.85rem; color: var(--accent-color);">Nenhum ensaio ou registo encontrado com o termo "<strong>${termo}</strong>".</p>
                <div style="margin-top: 30px;">
                    <a href="index.html" class="font-mono" style="font-size: 0.82rem; color: var(--accent-color); text-decoration: none; font-weight: 600;">&larr; Voltar ao Início</a>
                </div>
            `;
            return;
        }

        let htmlOutput = '';
        filtrados.forEach(item => {
            const linkUrl = `index.html?artigo=${item.url.split('/').pop().replace('.html', '')}`;
            const catLabel = (item.category || '').toUpperCase();
            
            const tituloLimpo = item.title.replace(/^[0-9]+_/, '').replace(/\.md$/, '').replace(/[-_]/g, ' ');
            const tituloFormatado = String(tituloLimpo).charAt(0).toUpperCase() + String(tituloLimpo).slice(1);
            const sumarioTexto = item.summary || item.content.substring(0, 140) + '...';
            
            // Renderização unificada idêntica aos cartões da página inicial (.entry-card)
            htmlOutput += `
                <a href="${linkUrl}" class="entry-card-link">
                    <div class="entry-card">
                        <span class="entry-meta">${catLabel}</span>
                        <h3>${tituloFormatado}</h3>
                        <p>${sumarioTexto}</p>
                    </div>
                </a>
            `;
        });

        htmlOutput += `
            <div style="margin-top: 45px; border-top: 1px solid var(--border-color); padding-top: 15px;">
                <a href="index.html" class="font-mono" style="font-size: 0.82rem; color: var(--accent-color); text-decoration: none; font-weight: 600;">&larr; Voltar ao Início</a>
            </div>
        `;

        containerResultados.innerHTML = htmlOutput;

    } catch (e) {
        console.error("[Scriptorium] Erro na pesquisa:", e);
        document.getElementById('resultados-pesquisa').innerHTML = `
            <p class="font-mono" style="font-size: 0.85rem; color: var(--accent-color);">Erro ao processar o índice de pesquisa.</p>
        `;
    }
}

async function router() {
    const urlParams = new URLSearchParams(window.location.search);
    const seccaoParam = urlParams.get('seccao');
    const artigoParam = urlParams.get('artigo');
    const qParam = urlParams.get('q');

    const viewHome = document.getElementById('view-home');
    const viewContent = document.getElementById('view-content');

    if (!viewHome || !viewContent) return;

    if (qParam) {
        await executarPesquisa(qParam.trim());
        return;
    }

    const artigos = await carregarTodosArtigos();

    if (artigoParam) {
        viewHome.style.display = 'none';
        viewContent.style.display = 'block';

        const artigo = artigos.find(a => a.slug === artigoParam);
        if (artigo) {
            const dataArtigo = artigo.meta.date || '';
            
            // Renderização opcional da imagem de destaque no topo do artigo
            const imagemDestaqueHtml = artigo.meta.image ? `
                <div style="margin: 25px 0; border-radius: 4px; overflow: hidden;">
                    <img src="${artigo.meta.image}" alt="${artigo.meta.title}" style="width: 100%; max-height: 450px; object-fit: cover; display: block;">
                </div>` : '';
            
            viewContent.innerHTML = `
                <article>
                    <div class="breadcrumb" style="margin-bottom: 20px;">
                        <a href="index.html">Início</a> / <span>${artigo.section}</span>
                    </div>
                    <span class="entry-meta font-mono">${(artigo.meta.category || artigo.section).toUpperCase()} • ${dataArtigo}</span>
                    <h2 class="font-sans" style="font-size: 1.8rem; font-weight: 600; color: var(--text-color); margin-top: 0; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                        ${artigo.meta.title}
                    </h2>
                    ${imagemDestaqueHtml}
                    <div class="markdown-body" style="margin-top: 25px; font-size: 1.05rem;">
                        ${marked.parse(artigo.content)}
                    </div>
                    <div style="margin-top: 45px; border-top: 1px solid var(--border-color); padding-top: 15px;">
                        <a href="index.html" class="font-mono" style="font-size: 0.82rem; color: var(--accent-color); text-decoration: none; font-weight: 600;">&larr; Voltar ao Início</a>
                    </div>
                </article>
            `;
        } else {
            viewContent.innerHTML = `
                <div style="padding: 30px 0;">
                    <p class="font-mono" style="font-size: 0.85rem; color: var(--accent-color);">O artigo <code>${artigoParam}</code> não foi encontrado.</p>
                    <a href="index.html" class="font-mono" style="font-size: 0.82rem; color: var(--text-color); text-decoration: underline;">&larr; Voltar ao Início</a>
                </div>
            `;
        }
        return;
    }

    if (seccaoParam) {
        viewHome.style.display = 'none';
        viewContent.style.display = 'block';

        const filtrados = artigos.filter(a => a.section.toLowerCase() === seccaoParam.toLowerCase());
        
        let htmlOutput = `
            <div class="breadcrumb" style="margin-bottom: 20px;">
                <a href="index.html">Início</a> / <span>${seccaoParam}</span>
            </div>
            <h2 class="font-sans" style="font-size: 1.25rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: var(--text-color); margin-top: 0; margin-bottom: 25px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                Secção: ${seccaoParam.toUpperCase()}
            </h2>`;

        if (filtrados.length > 0) {
            filtrados.forEach(artigo => {
                const linkUrl = `index.html?artigo=${artigo.slug}`;
                const catLabel = (artigo.meta.category || artigo.section).toUpperCase();
                const dataArtigo = artigo.meta.date || '';
                
                const thumbnailHtml = artigo.meta.image ? `
                    <div style="margin-bottom: 12px; overflow: hidden; border-radius: 2px;">
                        <img src="${artigo.meta.image}" alt="${artigo.meta.title}" style="width: 100%; height: 160px; object-fit: cover; display: block;">
                    </div>` : '';

                htmlOutput += `
                    <a href="${linkUrl}" class="entry-card-link">
                        <div class="entry-card">
                            ${thumbnailHtml}
                            <span class="entry-meta">${catLabel} • ${dataArtigo}</span>
                            <h3>${artigo.meta.title}</h3>
                            <p>${artigo.meta.summary || ''}</p>
                        </div>
                    </a>
                `;
            });
        } else {
            htmlOutput += `<p class="font-mono" style="font-size: 0.85rem; color: var(--muted-color);">Nenhum registo encontrado nesta secção.</p>`;
        }

        htmlOutput += `
            <div style="margin-top: 45px; border-top: 1px solid var(--border-color); padding-top: 15px;">
                <a href="index.html" class="font-mono" style="font-size: 0.82rem; color: var(--accent-color); text-decoration: none; font-weight: 600;">&larr; Voltar ao Início</a>
            </div>
        `;

        viewContent.innerHTML = htmlOutput;
        return;
    }

    viewHome.style.display = 'block';
    viewContent.style.display = 'none';
    await renderizarCapa(artigos);
}

document.addEventListener('DOMContentLoaded', () => {
    router();
});
