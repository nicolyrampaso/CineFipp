/* CINEFIPP - Home: hero (GET /apis/random-movie) + seções montadas
   a partir de GET /apis/list-movies. */
(function ($) {
    "use strict";

    $(function () {
        CineUI.montarLayout("home");
        preencherSetas();
        carregarHero();
        carregarUltimos();
        carregarSugestoes();
        carregarRanking();
    });

    // setas dos trilhos (o HTML só traz os botões vazios)
    function preencherSetas() {
        $('.cine-rail__btn[data-dir="prev"]').html(CineUI.Icones.esquerda);
        $('.cine-rail__btn[data-dir="next"]').html(CineUI.Icones.direita);
    }

    // HERO: sugestão do dia
    function carregarHero() {
        var $slot = $("#heroSlot");
        CineAPI.filmeAleatorio()
            .then(function (filme) {
                CineUI.trocarConteudo($slot, CineUI.movieHero(filme));
                $slot.find("[data-hero-detalhes]").on("click", function () {
                    verDetalhes(filme, $(this));
                });
            })
            .catch(function (erro) {
                var $caixa = $('<div class="container section"></div>').append(
                    CineUI.estadoDeErro(erro, "Nenhum filme cadastrado ainda.")
                );
                CineUI.trocarConteudo($slot, $caixa);
            });
    }

    // rebusca por título para abrir os detalhes com o dado atual do servidor
    function verDetalhes(filme, $botao) {
        $botao.prop("disabled", true);
        CineAPI.buscarPorTitulo(filme.titulo)
            .then(function (atual) { CineUI.abrirDetalhes(atual || filme); })
            .catch(function () { CineUI.abrirDetalhes(filme); })
            .then(function () { $botao.prop("disabled", false); });
    }

    // ÚLTIMOS CADASTRADOS (grade)
    function carregarUltimos() {
        var $slot = $("#ultimosSlot");
        CineUI.trocarConteudo($slot, CineUI.skeletonGrid(7));

        CineAPI.fontes.ultimosCadastrados(14)
            .then(function (filmes) {
                if (!filmes.length) {
                    CineUI.trocarConteudo($slot, CineUI.estado("vazio", {
                        titulo: "Catálogo vazio",
                        texto: "Cadastre o primeiro filme para vê-lo aqui."
                    }));
                    return;
                }
                CineUI.trocarConteudo($slot, CineUI.movieGrid(filmes));
            })
            .catch(function (erro) {
                CineUI.trocarConteudo($slot, CineUI.estadoDeErro(erro));
            });
    }

    // SUGESTÕES DO DIA (trilho horizontal)
    function carregarSugestoes() {
        var $slot = $("#sugestoesSlot");
        var $nav = $("#sugestoesNav");
        CineUI.trocarConteudo($slot, CineUI.skeletonGrid(7));

        CineAPI.fontes.sugestoesDoDia(14)
            .then(function (filmes) {
                if (!filmes.length) {
                    CineUI.trocarConteudo($slot, CineUI.estado("vazio", { texto: "Sem filmes para sugerir por enquanto." }));
                    $nav.hide();
                    return;
                }
                CineUI.trocarConteudo($slot, CineUI.trilho(filmes, { nav: $nav }));
            })
            .catch(function (erro) {
                $nav.hide();
                CineUI.trocarConteudo($slot, CineUI.estadoDeErro(erro));
            });
    }

    // TOP 10 DA SEMANA
    function carregarRanking() {
        var $slot = $("#rankingSlot");
        var $nav = $("#rankingNav");
        CineUI.trocarConteudo($slot, CineUI.skeletonGrid(5));

        CineAPI.fontes.topDaSemana(10)
            .then(function (filmes) {
                if (!filmes.length) {
                    CineUI.trocarConteudo($slot, CineUI.estado("vazio", { texto: "O ranking aparece assim que houver filmes cadastrados." }));
                    $nav.hide();
                    return;
                }
                CineUI.trocarConteudo($slot, CineUI.movieRanking(filmes, $nav));
            })
            .catch(function (erro) {
                $nav.hide();
                CineUI.trocarConteudo($slot, CineUI.estadoDeErro(erro));
            });
    }
})(jQuery);
