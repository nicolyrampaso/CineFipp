/* CINEFIPP - Pesquisa em 3 abas: palavra-chave, gênero e faixa de anos.
   Cada aba chama o endpoint correspondente do CineAPI. */
(function ($) {
    "use strict";

    var ANO_MINIMO = 1888;                                  // mesmo limite do back-end
    var ANO_MAXIMO = new Date().getFullYear() + 5;

    var $slotResultados, $resumo;

    $(function () {
        CineUI.montarLayout("pesquisa");

        $slotResultados = $("#resultadosSlot");
        $resumo = $("#resumoResultados");

        $("#wrapPalavra").prepend(CineUI.Icones.busca);

        ligarAbas();
        ligarFormularios();

        CineUI.trocarConteudo($slotResultados, CineUI.estado("inicial"));

        CineUI.carregarGeneros("#campoGenero", {
            aoFalhar: function (erro) { mostrarErroCampo("#erroGenero", erro.descricao || erro.mens); }
        }).then(aplicarParametrosDaUrl);
    });

    /* Abas dos filtros ----------------------------------------------------- */
    function ligarAbas() {
        $(".filters__tab").on("click", function () { abrirAba($(this).data("tab")); });
    }

    function abrirAba(nome) {
        $(".filters__tab").each(function () {
            var ativa = $(this).data("tab") === nome;
            $(this).toggleClass("active", ativa).attr("aria-selected", String(ativa));
        });
        $(".filters__panel").each(function () {
            $(this).toggleClass("d-none", $(this).data("panel") !== nome);
        });
    }

    /* Formulários ---------------------------------------------------------- */
    function ligarFormularios() {
        $('[data-panel="palavra"]').on("submit", function (e) { e.preventDefault(); pesquisarPalavra(); });
        $('[data-panel="genero"]').on("submit", function (e) { e.preventDefault(); pesquisarGenero(); });
        $('[data-panel="ano"]').on("submit", function (e) { e.preventDefault(); pesquisarAno(); });
    }

    // links de fora já chegam filtrados: ?modo=, ?genero= ou ?q=
    function aplicarParametrosDaUrl() {
        var params = new URLSearchParams(window.location.search);
        var modo = params.get("modo");
        var genero = params.get("genero");
        var palavra = params.get("q");

        if (genero) {
            abrirAba("genero");
            var $select = $("#campoGenero").val(genero);
            if ($select.val() === genero) pesquisarGenero();
            else mostrarErroCampo("#erroGenero", 'O gênero "' + genero + '" não está na lista da API.');
            return;
        }
        if (palavra) {
            abrirAba("palavra");
            $("#campoPalavra").val(palavra);
            pesquisarPalavra();
            return;
        }
        if (modo === "genero" || modo === "ano" || modo === "palavra") abrirAba(modo);
    }

    /* Pesquisas (validam o campo e delegam para executar) ------------------ */
    function pesquisarPalavra() {
        var $campo = $("#campoPalavra");
        var palavra = $campo.val().trim();
        limparErro("#erroPalavra", $campo);

        if (!palavra) {
            mostrarErroCampo("#erroPalavra", "Informe uma palavra para pesquisar.", $campo);
            return;
        }
        executar(
            CineAPI.listarPorPalavra(palavra),
            'Palavra-chave: "' + palavra + '"',
            "Nenhum título contém essa palavra."
        );
    }

    function pesquisarGenero() {
        var $campo = $("#campoGenero");
        var genero = $campo.val();
        limparErro("#erroGenero", $campo);

        if (!genero) {
            mostrarErroCampo("#erroGenero", "Selecione um gênero na lista.", $campo);
            return;
        }
        executar(
            CineAPI.listarPorGenero(genero),
            "Gênero: " + genero,
            "Nenhum filme cadastrado nesse gênero."
        );
    }

    function pesquisarAno() {
        var $inicio = $("#campoAnoInicio");
        var $fim = $("#campoAnoFim");
        var inicio = $inicio.val().trim();
        var fim = $fim.val().trim();

        limparErro("#erroAno", $inicio);
        $fim.removeClass("is-invalid");

        if (!inicio || !fim) {
            mostrarErroCampo("#erroAno", "Informe o ano inicial e o ano final.", !inicio ? $inicio : $fim);
            return;
        }
        if (!/^\d{4}$/.test(inicio) || !/^\d{4}$/.test(fim)) {
            mostrarErroCampo("#erroAno", "Use anos com 4 dígitos. Ex.: 1970 e 1990.", $inicio);
            $fim.addClass("is-invalid");
            return;
        }

        var a = parseInt(inicio, 10), b = parseInt(fim, 10);
        if (a < ANO_MINIMO || b > ANO_MAXIMO) {
            mostrarErroCampo("#erroAno", "Os anos devem estar entre " + ANO_MINIMO + " e " + ANO_MAXIMO + ".", $inicio);
            return;
        }
        if (a > b) {
            mostrarErroCampo("#erroAno", "O ano inicial precisa ser menor ou igual ao ano final.", $inicio);
            $fim.addClass("is-invalid");
            return;
        }
        executar(
            CineAPI.listarPorAno(a, b),
            "Lançamentos entre " + a + " e " + b,
            "Nenhum filme lançado nesse intervalo."
        );
    }

    // ponto único das buscas: skeleton -> resultado / vazio / erro
    function executar(promessa, descricao, textoVazio) {
        $resumo.text(descricao + " · buscando…");
        CineUI.trocarConteudo($slotResultados, CineUI.skeletonGrid(8));

        promessa
            .then(function (filmes) {
                if (!filmes.length) {
                    $resumo.text(descricao + " · 0 resultado");
                    CineUI.trocarConteudo($slotResultados, CineUI.estado("vazio", { texto: textoVazio }));
                    return;
                }
                $resumo.text(descricao + " · " + filmes.length +
                    (filmes.length === 1 ? " filme encontrado" : " filmes encontrados"));
                CineUI.trocarConteudo($slotResultados, CineUI.movieGrid(filmes));
            })
            .catch(function (erro) {
                // 400 online significa "nada encontrado", não falha
                var vazio = erro.status === 400 && !erro.offline;
                $resumo.text(descricao + (vazio ? " · 0 resultado" : " · falha na consulta"));
                CineUI.trocarConteudo($slotResultados, CineUI.estadoDeErro(erro, textoVazio));
            });
    }

    /* Erros de campo ------------------------------------------------------- */
    function mostrarErroCampo(seletor, mensagem, $campo) {
        $(seletor).text(mensagem).addClass("d-block");
        if ($campo) $campo.addClass("is-invalid").trigger("focus");
    }

    function limparErro(seletor, $campo) {
        $(seletor).text("").removeClass("d-block");
        if ($campo) $campo.removeClass("is-invalid");
    }
})(jQuery);
