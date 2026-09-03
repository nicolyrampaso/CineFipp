/* CINEFIPP - componentes de tela reutilizados por todas as paginas
   (window.CineUI). Recebe dados prontos e devolve objetos jQuery. */
(function (global, $) {
    "use strict";

    /* Icones ------------------------------------------------------------ */
    // SVG inline: herda a cor do texto e acompanha o tema
    function svg(caminho) {
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" ' +
            'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + caminho + '</svg>';
    }

    var Icones = {
        home: svg('<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.8V21h14V9.8"/>'),
        busca: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>'),
        mais: svg('<path d="M12 5v14M5 12h14"/>'),
        generos: svg('<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>'),
        info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'),
        seta: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
        esquerda: svg('<path d="M15 5l-7 7 7 7"/>'),
        direita: svg('<path d="M9 5l7 7-7 7"/>'),
        fechar: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
        lupaMais: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2M11 8.5v5M8.5 11h5"/>'),
        filme: svg('<rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="M7 4.5v15M17 4.5v15M2.5 9.5h4.5M2.5 14.5h4.5M17 9.5h4.5M17 14.5h4.5"/>'),
        upload: svg('<path d="M12 16V4M8 8l4-4 4 4"/><path d="M4 15v3.5A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5V15"/>'),
        alerta: svg('<path d="M12 3.8 21 19H3z"/><path d="M12 10v4M12 17h.01"/>'),
        check: svg('<circle cx="12" cy="12" r="9"/><path d="m8 12.4 2.7 2.6L16 9.8"/>'),
        vazio: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2M8.6 11h4.8"/>'),
        sol: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"/>'),
        lua: svg('<path d="M20.5 14.4A8.5 8.5 0 0 1 9.6 3.5a8.5 8.5 0 1 0 10.9 10.9z"/>'),
        menu: svg('<path d="M4 7h16M4 12h16M4 17h16"/>')
    };

    // sempre usar antes de jogar texto da API dentro de HTML montado a mao
    function escapar(texto) {
        return String(texto == null ? "" : texto)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }

    /* Tema -------------------------------------------------------------- */
    // data-bs-theme no <html> e a fonte unica: Bootstrap e CSS proprio leem ele
    var CHAVE_TEMA = "cinefipp:tema";

    var Tema = {
        atual: function () {
            return $("html").attr("data-bs-theme") === "light" ? "light" : "dark";
        },
        aplicar: function (tema) {
            var valido = tema === "light" ? "light" : "dark";
            $("html").attr("data-bs-theme", valido);
            try { localStorage.setItem(CHAVE_TEMA, valido); } catch (e) { /* modo privado */ }
            $(".theme-toggle")
                .attr("aria-label", valido === "dark" ? "Ativar tema claro" : "Ativar tema escuro")
                .attr("title", valido === "dark" ? "Tema claro" : "Tema escuro");
            return valido;
        },
        alternar: function () {
            return Tema.aplicar(Tema.atual() === "dark" ? "light" : "dark");
        }
    };

    /* Navbar / footer ---------------------------------------------------- */
    // fonte unica dos links do menu e do rodape
    var PAGINAS = [
        { id: "home", rotulo: "Início", href: "index.html", icone: Icones.home },
        { id: "pesquisa", rotulo: "Pesquisar", href: "pesquisa.html", icone: Icones.busca },
        { id: "cadastro", rotulo: "Cadastrar Filme", href: "cadastro.html", icone: Icones.mais },
        { id: "generos", rotulo: "Gêneros", href: "generos.html", icone: Icones.generos }
    ];

    function montarHeader(paginaAtiva) {
        var links = $.map(PAGINAS, function (p) {
            var ativo = p.id === paginaAtiva;
            return '<li class="nav-item">' +
                '<a class="nav-link' + (ativo ? " active" : "") + '" href="' + p.href + '"' +
                (ativo ? ' aria-current="page"' : "") + ">" + p.rotulo + "</a></li>";
        }).join("");

        return '' +
            '<nav class="navbar navbar-expand-lg sticky-top site-header">' +
            '  <div class="container flex-wrap">' +
            '    <a class="navbar-brand brand order-0" href="index.html" aria-label="CINEFIPP - página inicial">' +
            '      <img class="brand__mark" src="assets/cinefipp-mark.png" alt="" />' +
            '      <span class="brand__word"><i>CINE</i>FIPP<span class="brand__tag">FILMES</span></span>' +
            '    </a>' +
            '    <div class="d-flex align-items-center gap-2 ms-auto order-1 order-lg-2">' +
            '      <a class="icon-btn" href="pesquisa.html" aria-label="Pesquisar filmes" title="Pesquisar">' + Icones.busca + '</a>' +
            '      <button class="icon-btn theme-toggle" type="button" aria-label="Alternar tema">' +
            '        <span class="theme-toggle__moon">' + Icones.lua + '</span>' +
            '        <span class="theme-toggle__sun">' + Icones.sol + '</span>' +
            '      </button>' +
            '      <button class="icon-btn navbar-toggler d-lg-none" type="button" data-bs-toggle="collapse" ' +
            '              data-bs-target="#navPrincipal" aria-controls="navPrincipal" aria-expanded="false" aria-label="Abrir menu">' +
            Icones.menu +
            '      </button>' +
            '    </div>' +
            '    <div class="collapse navbar-collapse order-2 order-lg-1" id="navPrincipal">' +
            '      <ul class="navbar-nav ms-lg-3">' + links + '</ul>' +
            '    </div>' +
            '  </div>' +
            '</nav>';
    }

    function montarFooter() {
        var ano = new Date().getFullYear();
        return '' +
            '<footer class="site-footer">' +
            '  <div class="container">' +
            '    <div class="row g-4">' +
            '      <div class="col-lg-5 footer-brand">' +
            '        <img src="assets/cinefipp-logo.png" alt="CINEFIPP" />' +
            '        <p>Plataforma acadêmica de catálogo de filmes desenvolvida na disciplina de Ferramentas Computacionais III.</p>' +
            '      </div>' +
            '      <div class="col-6 col-lg-3 offset-lg-1 footer-col">' +
            '        <h4>Navegar</h4>' +
            $.map(PAGINAS, function (p) { return '<a href="' + p.href + '">' + p.rotulo + "</a>"; }).join("") +
            '      </div>' +
            '      <div class="col-6 col-lg-3 footer-col">' +
            '        <h4>Catálogo</h4>' +
            '        <a href="pesquisa.html?modo=palavra">Busca por palavra-chave</a>' +
            '        <a href="pesquisa.html?modo=genero">Busca por gênero</a>' +
            '        <a href="pesquisa.html?modo=ano">Busca por faixa de anos</a>' +
            '      </div>' +
            '    </div>' +
            '    <div class="footer-bottom d-flex flex-wrap justify-content-between gap-2">' +
            '      <span>© ' + ano + ' CINEFIPP · Projeto acadêmico · UNOESTE/FIPP</span>' +
            '      <span class="d-inline-flex align-items-center gap-2">' +
            '        <span class="api-status__dot" id="apiStatusDot"></span>' +
            '        <span id="apiStatusText">Verificando API…</span></span>' +
            '    </div>' +
            '  </div>' +
            '</footer>';
    }

    function ligarHeader() {
        var $header = $(".site-header");
        if (!$header.length) return;

        $header.on("click", ".theme-toggle", function () { Tema.alternar(); });

        var $toggler = $header.find(".navbar-toggler");
        $("#navPrincipal")
            .on("show.bs.collapse", function () { $toggler.html(Icones.fechar); })
            .on("hide.bs.collapse", function () { $toggler.html(Icones.menu); });

        $(window).on("scroll", function () {
            $header.toggleClass("is-stuck", $(window).scrollTop() > 8);
        }).trigger("scroll");
    }

    // acende o indicador de status no rodape (GET /apis/test)
    function checarApi() {
        var $ponto = $("#apiStatusDot");
        if (!$ponto.length || !global.CineAPI) return;
        global.CineAPI.test()
            .then(function () {
                $ponto.addClass("is-on");
                $("#apiStatusText").text("API conectada");
            })
            .catch(function () {
                $ponto.addClass("is-off");
                $("#apiStatusText").text("API offline (localhost:8080)");
            });
    }

    // cada pagina chama isto uma vez: troca [data-header]/[data-footer]
    function montarLayout(paginaAtiva) {
        $("[data-header]").replaceWith(montarHeader(paginaAtiva));
        $("[data-footer]").replaceWith(montarFooter());
        Tema.aplicar(Tema.atual());
        ligarHeader();
        checarApi();
    }

    /* MovieCard ---------------------------------------------------------- */
    function placeholderPoster(rotulo) {
        return '<div class="poster-placeholder">' + Icones.filme +
            "<span>" + escapar(rotulo || "Sem poster") + "</span></div>";
    }

    function rotuloMeta(filme) {
        return [filme.ano, filme.genero].filter(Boolean).join(" · ");
    }

    function botaoZoom(filme) {
        if (!filme.temPoster) return "";
        return '<button class="movie-card__zoom" type="button" data-poster="' + escapar(filme.posterUrl || filme.thumbUrl) + '" ' +
            'data-titulo="' + escapar(filme.titulo) + '" data-legenda="' + escapar(rotuloMeta(filme)) + '" ' +
            'aria-label="Ver poster de ' + escapar(filme.titulo) + '">' + Icones.lupaMais + "</button>";
    }

    function imagemPoster(filme) {
        if (!filme.temPoster) return placeholderPoster();
        return '<img src="' + escapar(filme.thumbUrl) + '" alt="Poster de ' + escapar(filme.titulo) + '" ' +
            'loading="lazy" onerror="CineUI.falhaImagem(this)" />';
    }

    function movieCard(filme, indice) {
        var atraso = typeof indice === "number" ? ' style="animation-delay:' + Math.min(indice * 45, 480) + 'ms"' : "";

        return $('' +
            '<article class="movie-card"' + atraso + '>' +
            '  <div class="movie-card__poster">' + imagemPoster(filme) + botaoZoom(filme) +
            (filme.ano ? '<span class="movie-card__year">' + escapar(filme.ano) + "</span>" : "") +
            '  </div>' +
            '  <div class="movie-card__body">' +
            '    <h3 class="movie-card__title" title="' + escapar(filme.titulo) + '">' + escapar(filme.titulo) + "</h3>" +
            '    <div class="d-flex align-items-center flex-wrap gap-2">' +
            (filme.genero ? '<span class="movie-card__genre">' + escapar(filme.genero) + "</span>" : "") +
            (filme.genero && filme.ano ? '<span class="movie-card__dot"></span>' : "") +
            (filme.ano ? '<span class="movie-card__yeartxt">' + escapar(filme.ano) + "</span>" : "") +
            '    </div>' +
            '  </div>' +
            "</article>");
    }

    // chamado pelo onerror das <img>: troca a imagem quebrada pelo placeholder
    function falhaImagem(img) {
        var $caixa = $(img).parent();
        $(img).remove();
        if (!$caixa.find(".poster-placeholder").length) {
            $caixa.prepend(placeholderPoster("Poster indisponível"));
            $caixa.find(".movie-card__zoom").remove();
        }
    }

    /* MovieGrid ---------------------------------------------------------- */
    function movieGrid(filmes) {
        var $grid = $('<div class="movie-grid"></div>');
        $.each(filmes, function (i, filme) { $grid.append(movieCard(filme, i)); });
        return $grid;
    }

    /* Trilho horizontal (proprio, nao e o .carousel do Bootstrap) -------- */
    // opcoes: { nav: seletor dos botoes, render: monta cada item, classeTrilho }
    function trilho(filmes, opcoes) {
        opcoes = opcoes || {};
        var $caixa = $('<div class="cine-rail"><div class="cine-rail__track"></div></div>');
        var $track = $caixa.find(".cine-rail__track");
        if (opcoes.classeTrilho) $track.addClass(opcoes.classeTrilho);

        $.each(filmes, function (i, filme) {
            $track.append(opcoes.render ? opcoes.render(filme, i) : movieCard(filme, i));
        });

        if (opcoes.nav) ligarNavegacao($track, $(opcoes.nav));
        return $caixa;
    }

    function ligarNavegacao($track, $nav) {
        var $anterior = $nav.find('[data-dir="prev"]');
        var $proximo = $nav.find('[data-dir="next"]');
        if (!$anterior.length || !$proximo.length) return;

        var track = $track[0];

        function passo() {
            var $primeiro = $track.children().first();
            var largura = $primeiro.length ? $primeiro.outerWidth() + 18 : 220;
            return Math.max(1, Math.floor(track.clientWidth / largura)) * largura;
        }

        // folga de 8px por causa do padding da trilha
        function atualizar() {
            var fim = track.scrollWidth - track.clientWidth - 8;
            $anterior.prop("disabled", track.scrollLeft <= 8);
            $proximo.prop("disabled", track.scrollLeft >= fim);
        }

        // rola suave; se o navegador nao animar, aplica o salto direto
        function rolar(distancia) {
            var origem = track.scrollLeft;
            var alvo = Math.max(0, Math.min(origem + distancia, track.scrollWidth - track.clientWidth));
            track.scrollTo({ left: alvo, behavior: "smooth" });
            setTimeout(function () {
                if (Math.abs(track.scrollLeft - origem) < 2 && Math.abs(alvo - origem) > 2) {
                    $track.css("scroll-behavior", "auto");
                    track.scrollLeft = alvo;
                    $track.css("scroll-behavior", "");
                }
                atualizar();
            }, 320);
        }

        $anterior.on("click", function () { rolar(-passo()); });
        $proximo.on("click", function () { rolar(passo()); });
        $track.on("scroll", atualizar);
        $(window).on("resize", atualizar);
        setTimeout(atualizar, 60);
    }

    /* MovieRanking (top 10) ---------------------------------------------- */
    function rankCard(filme, posicao) {
        return $('' +
            '<article class="rank-card" style="animation-delay:' + Math.min((posicao - 1) * 55, 500) + 'ms">' +
            '  <span class="rank-card__num" aria-hidden="true">' + String(posicao).padStart(2, "0") + "</span>" +
            '  <div class="rank-card__movie">' +
            '    <div class="rank-card__poster">' + imagemPoster(filme) + botaoZoom(filme) + "</div>" +
            '    <div class="rank-card__info">' +
            '      <h3>' + escapar(filme.titulo) + "</h3>" +
            '      <p>' + escapar(rotuloMeta(filme) || "—") + "</p>" +
            "    </div>" +
            "  </div>" +
            "</article>");
    }

    function movieRanking(filmes, nav) {
        return trilho(filmes, {
            classeTrilho: "ranking__track",
            nav: nav,
            render: function (filme, i) { return rankCard(filme, i + 1); }
        });
    }

    /* MovieHero ---------------------------------------------------------- */
    function movieHero(filme) {
        var fundo = filme && filme.temPoster
            ? '<div class="hero__bg" style="background-image:url(\'' + escapar(filme.posterUrl || filme.thumbUrl) + '\')"></div>'
            : '<div class="hero__bg hero__bg--empty"></div>';

        var poster = filme && filme.temPoster
            ? '<div class="col-auto d-none d-lg-block">' +
              '<button class="hero__poster" type="button" data-poster="' + escapar(filme.posterUrl || filme.thumbUrl) + '" ' +
              'data-titulo="' + escapar(filme.titulo) + '" data-legenda="' + escapar(rotuloMeta(filme)) + '" ' +
              'aria-label="Ampliar poster">' +
              '<img src="' + escapar(filme.thumbUrl) + '" alt="Poster de ' + escapar(filme.titulo) + '" ' +
              'onerror="CineUI.falhaImagem(this)" /></button></div>'
            : "";

        return $('' +
            '<section class="hero">' + fundo + '<div class="hero__scrim"></div>' +
            '  <div class="container hero__inner">' +
            '    <div class="row align-items-end g-4">' +
            '      <div class="col">' +
            '        <div class="hero__content">' +
            '          <span class="eyebrow">Sugestão do dia</span>' +
            '          <h1 class="hero__title">' + escapar(filme ? filme.titulo : "Catálogo CINEFIPP") + "</h1>" +
            '          <div class="d-flex flex-wrap gap-2 mt-3">' +
            (filme && filme.ano ? '<span class="badge badge-cine-gold">' + escapar(filme.ano) + "</span>" : "") +
            (filme && filme.genero ? '<span class="badge badge-cine-teal">' + escapar(filme.genero) + "</span>" : "") +
            '          </div>' +
            '          <div class="d-flex flex-wrap gap-3 mt-4">' +
            '            <button class="btn btn-cine-red" type="button" data-hero-detalhes>' + Icones.info + "Ver detalhes</button>" +
            '            <a class="btn btn-cine-ghost" href="pesquisa.html">' + Icones.busca + "Pesquisar filmes</a>" +
            '          </div>' +
            '        </div>' +
            '      </div>' + poster +
            "    </div>" +
            "  </div>" +
            "</section>");
    }

    /* Estados de tela (carregando / vazio / erro) ------------------------ */
    var ESTADOS = {
        carregando: { icone: null, titulo: "Carregando…", texto: "Buscando as informações no servidor." },
        vazio: { icone: Icones.vazio, titulo: "Nenhum resultado", texto: "Não encontramos filmes com esses critérios." },
        inicial: { icone: Icones.busca, titulo: "Faça uma pesquisa", texto: "Escolha um dos filtros acima para começar a explorar o catálogo." },
        erro: { icone: Icones.alerta, titulo: "Algo deu errado", texto: "Não foi possível concluir a operação." }
    };

    function estado(tipo, opcoes) {
        opcoes = opcoes || {};
        var base = ESTADOS[tipo] || ESTADOS.vazio;
        var icone = base.icone
            ? '<div class="state__icon">' + base.icone + "</div>"
            : '<div class="spinner-border cine-spinner" role="status"><span class="visually-hidden">Carregando</span></div>';

        return $('' +
            '<div class="state' + (tipo === "erro" ? " state--error" : "") + '" role="status">' +
            icone +
            '  <h3>' + escapar(opcoes.titulo || base.titulo) + "</h3>" +
            '  <p>' + escapar(opcoes.texto || base.texto) + "</p>" +
            "</div>");
    }

    // ApiError -> estado visual; 400 online = "nada encontrado", nao erro
    function estadoDeErro(erro, textoVazio) {
        if (erro && erro.status === 400 && !erro.offline) {
            return estado("vazio", {
                titulo: erro.mens || "Nenhum resultado",
                texto: erro.descricao || textoVazio || ESTADOS.vazio.texto
            });
        }
        return estado("erro", {
            titulo: (erro && erro.mens) || ESTADOS.erro.titulo,
            texto: [(erro && erro.descricao) || "", (erro && erro.correcao) || ""].filter(Boolean).join(" ") || ESTADOS.erro.texto
        });
    }

    function skeletonGrid(quantidade) {
        var $caixa = $('<div class="skeleton-grid"></div>');
        for (var i = 0; i < (quantidade || 6); i++) $caixa.append('<div class="skeleton skeleton--card"></div>');
        return $caixa;
    }

    function alerta(tipo, titulo, texto) {
        var sucesso = tipo === "success";
        return $('' +
            '<div class="alert alert-cine-' + (sucesso ? "success" : "error") + '" role="alert">' +
            (sucesso ? Icones.check : Icones.alerta) +
            '  <div><strong>' + escapar(titulo) + "</strong>" +
            (texto ? "<p>" + escapar(texto) + "</p>" : "") + "</div>" +
            "</div>");
    }

    // substitui o conteudo de um slot da pagina pelo componente recebido
    function trocarConteudo(alvo, conteudo) {
        var $alvo = $(alvo);
        if (!$alvo.length) return;
        $alvo.empty();
        if (conteudo) $alvo.append(conteudo);
    }

    /* Modal do poster ----------------------------------------------------- */
    var modalPoster = null;   // criado sob demanda e reaproveitado

    function garantirModalPoster() {
        if (modalPoster) return modalPoster;

        var $markup = $('' +
            '<div class="modal fade" id="posterModal" tabindex="-1" aria-label="Poster do filme" aria-hidden="true">' +
            '  <div class="modal-dialog modal-dialog-centered modal-lg">' +
            '    <div class="modal-content">' +
            '      <button class="modal__close" type="button" data-bs-dismiss="modal" aria-label="Fechar">' + Icones.fechar + "</button>" +
            '      <img class="modal__img" alt="" />' +
            '      <div class="modal__caption"><div><h3></h3><p></p></div>' +
            '        <span class="badge">Poster original</span></div>' +
            "    </div>" +
            "  </div>" +
            "</div>");

        $("body").append($markup);
        modalPoster = { $el: $markup, instancia: new bootstrap.Modal($markup[0]) };

        // limpa o src ao fechar para nao segurar a imagem em memoria
        $markup.on("hidden.bs.modal", function () { $markup.find(".modal__img").attr("src", ""); });
        return modalPoster;
    }

    function abrirModal(dados) {
        if (!dados || !dados.poster) return;
        var m = garantirModalPoster();
        m.$el.find(".modal__img").attr("src", dados.poster).attr("alt", "Poster de " + (dados.titulo || ""));
        m.$el.find(".modal__caption h3").text(dados.titulo || "");
        m.$el.find(".modal__caption p").text(dados.legenda || "");
        m.instancia.show();
    }

    function fecharModal() {
        if (modalPoster) modalPoster.instancia.hide();
    }

    // listener delegado: qualquer elemento com data-poster abre o modal
    $(document).on("click", "[data-poster]", function (evento) {
        evento.preventDefault();
        abrirModal({
            poster: $(this).data("poster"),
            titulo: $(this).data("titulo"),
            legenda: $(this).data("legenda")
        });
    });

    /* Modal de detalhes: titulo, ano, genero e poster --------------------- */
    var modalDetalhes = null;

    function garantirModalDetalhes() {
        if (modalDetalhes) return modalDetalhes;

        var $markup = $('' +
            '<div class="modal fade" id="detalhesModal" tabindex="-1" aria-label="Detalhes do filme" aria-hidden="true">' +
            '  <div class="modal-dialog modal-dialog-centered">' +
            '    <div class="modal-content">' +
            '      <button class="modal__close" type="button" data-bs-dismiss="modal" aria-label="Fechar">' + Icones.fechar + "</button>" +
            '      <div class="detalhes"></div>' +
            "    </div>" +
            "  </div>" +
            "</div>");

        $("body").append($markup);
        modalDetalhes = { $el: $markup, instancia: new bootstrap.Modal($markup[0]) };
        return modalDetalhes;
    }

    function abrirDetalhes(filme) {
        if (!filme) return;
        var m = garantirModalDetalhes();

        var arte = filme.temPoster
            ? '<img class="modal__img" style="max-height:52vh;object-fit:cover" src="' + escapar(filme.posterUrl || filme.thumbUrl) +
              '" alt="Poster de ' + escapar(filme.titulo) + '" onerror="CineUI.falhaImagem(this)" />'
            : '<div class="position-relative" style="aspect-ratio:16/9">' + placeholderPoster("Sem poster cadastrado") + "</div>";

        m.$el.find(".detalhes").html(arte +
            '<div class="p-4">' +
            '  <span class="eyebrow">Sugestão do dia</span>' +
            '  <h3 class="fs-4 mt-2 mb-3">' + escapar(filme.titulo) + "</h3>" +
            '  <div class="d-flex flex-wrap gap-2">' +
            (filme.ano ? '<span class="badge badge-cine-gold">Ano: ' + escapar(filme.ano) + "</span>" : "") +
            (filme.genero ? '<span class="badge badge-cine-teal">' + escapar(filme.genero) + "</span>" : "") +
            '  </div>' +
            '  <div class="d-flex flex-wrap gap-2 mt-4">' +
            (filme.genero ? '<a class="btn btn-cine-teal btn-sm" href="pesquisa.html?modo=genero&genero=' +
                encodeURIComponent(filme.genero) + '">Ver ' + escapar(filme.genero) + "</a>" : "") +
            '    <a class="btn btn-cine-ghost btn-sm" href="pesquisa.html?modo=palavra&q=' +
                encodeURIComponent(filme.titulo) + '">Pesquisar título</a>' +
            '  </div>' +
            "</div>");

        m.instancia.show();
    }

    /* GenreSelect --------------------------------------------------------- */
    // preenche um <select> com GET /apis/get-generos; devolve promise
    function carregarGeneros(select, opcoes) {
        opcoes = opcoes || {};
        var $select = $(select);
        if (!$select.length || !global.CineAPI) return Promise.resolve([]);

        $select.prop("disabled", true).html('<option value="">Carregando gêneros…</option>');

        return global.CineAPI.listarGeneros()
            .then(function (generos) {
                // data-id = id oficial do genero, exigido no POST /apis/add-movie
                $select.html('<option value="">' + escapar(opcoes.rotuloVazio || "Selecione um gênero") + "</option>" +
                    $.map(generos, function (g) {
                        return '<option value="' + escapar(g.nome) + '" data-id="' + escapar(g.id || 0) + '">' +
                            escapar(g.nome) + "</option>";
                    }).join(""));
                $select.prop("disabled", false);
                if (opcoes.selecionado) $select.val(opcoes.selecionado);
                return generos;
            })
            .catch(function (erro) {
                $select.html('<option value="">Não foi possível carregar os gêneros</option>').prop("disabled", true);
                if (opcoes.aoFalhar) opcoes.aoFalhar(erro);
                return [];
            });
    }

    global.CineUI = {
        Icones: Icones,
        Tema: Tema,
        escapar: escapar,
        montarLayout: montarLayout,
        movieCard: movieCard,
        movieGrid: movieGrid,
        trilho: trilho,
        movieRanking: movieRanking,
        movieHero: movieHero,
        estado: estado,
        estadoDeErro: estadoDeErro,
        skeletonGrid: skeletonGrid,
        alerta: alerta,
        trocarConteudo: trocarConteudo,
        abrirModal: abrirModal,
        fecharModal: fecharModal,
        carregarGeneros: carregarGeneros,
        abrirDetalhes: abrirDetalhes,
        falhaImagem: falhaImagem,
        placeholderPoster: placeholderPoster
    };
})(window, jQuery);
