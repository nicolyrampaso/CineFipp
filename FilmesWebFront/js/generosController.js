/* CINEFIPP - Gêneros (GET /apis/get-generos).
   Cada card abre a pesquisa já filtrada: pesquisa.html?genero=... */
(function ($) {
    "use strict";

    // ícone + gradiente por gênero; nome não listado usa PADRAO
    var ESTILOS = {
        "Ação": {
            grad: "linear-gradient(135deg,#C0261C,#BA460D)",
            icone: '<path d="M13 2 4.5 13.5H11L9.5 22 20 10h-6.5z"/>'
        },
        "Aventura": {
            grad: "linear-gradient(135deg,#BA460D,#C59538)",
            icone: '<path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>'
        },
        "Comédia": {
            grad: "linear-gradient(135deg,#C59538,#BA460D)",
            icone: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01"/>'
        },
        "Drama": {
            grad: "linear-gradient(135deg,#185B63,#404040)",
            icone: '<path d="M4 5.5h16v7a8 8 0 0 1-16 0z"/><path d="M8.5 9.5h.01M15.5 9.5h.01M9.5 15a3.5 3.5 0 0 0 5 0"/>'
        },
        "Terror": {
            grad: "linear-gradient(135deg,#404040,#C0261C)",
            icone: '<path d="M12 2a8 8 0 0 0-8 8c0 3 1.5 4.5 2.5 5.5V20h11v-4.5C18.5 14.5 20 13 20 10a8 8 0 0 0-8-8z"/><path d="M9.5 10h.01M14.5 10h.01M12 13.5v2.5"/>'
        },
        "Ficção Científica": {
            grad: "linear-gradient(135deg,#185B63,#2A8F99)",
            icone: '<ellipse cx="12" cy="13.5" rx="8" ry="3.5"/><path d="M8 12a4 4 0 0 1 8 0"/><path d="M6 17.5 4.5 20M18 17.5 19.5 20"/>'
        },
        "Fantasia": {
            grad: "linear-gradient(135deg,#2A8F99,#C59538)",
            icone: '<path d="m12 3 1.9 4.4 4.6.5-3.5 3.2 1 4.6L12 13.4 8 15.7l1-4.6L5.5 7.9l4.6-.5z"/><path d="M18 17.5 19.5 19M5.5 18l1.2-1.2"/>'
        },
        "Romance": {
            grad: "linear-gradient(135deg,#C0261C,#C59538)",
            icone: '<path d="M12 20s-7-4.4-7-9.2A4 4 0 0 1 12 8a4 4 0 0 1 7 2.8C19 15.6 12 20 12 20z"/>'
        },
        "Documentário": {
            grad: "linear-gradient(135deg,#404040,#185B63)",
            icone: '<rect x="3" y="6" width="12" height="12" rx="2"/><path d="m15 11 6-3.5v9L15 13z"/>'
        },
        "Animação": {
            grad: "linear-gradient(135deg,#C59538,#2A8F99)",
            icone: '<circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="1.3"/><circle cx="15" cy="10" r="1.3"/><path d="M8.5 15c1 1.2 5 1.2 7-1"/>'
        }
    };

    var PADRAO = {
        grad: "linear-gradient(135deg,#185B63,#2A8F99)",
        icone: '<rect x="3.5" y="5" width="17" height="14" rx="2.5"/><path d="M8 5v14M16 5v14"/>'
    };

    $(function () {
        CineUI.montarLayout("generos");
        carregar();
    });

    function carregar() {
        var $slot = $("#generosSlot");
        CineUI.trocarConteudo($slot, CineUI.estado("carregando", { texto: "Buscando os gêneros na API." }));

        CineAPI.listarGeneros()
            .then(function (generos) {
                if (!generos.length) {
                    CineUI.trocarConteudo($slot, CineUI.estado("vazio", {
                        titulo: "Nenhum gênero cadastrado",
                        texto: "A API não retornou gêneros."
                    }));
                    return;
                }
                var $grid = $('<div class="genre-grid"></div>');
                $.each(generos, function (i, genero) { $grid.append(cardGenero(genero, i)); });
                CineUI.trocarConteudo($slot, $grid);
            })
            .catch(function (erro) {
                CineUI.trocarConteudo($slot, CineUI.estadoDeErro(erro, "Nenhum gênero disponível."));
            });
    }

    function cardGenero(genero, indice) {
        var estilo = ESTILOS[genero.nome] || PADRAO;
        var icone = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
            'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + estilo.icone + "</svg>";

        return $('' +
            '<a class="genre-card" href="pesquisa.html?modo=genero&genero=' + encodeURIComponent(genero.nome) + '" ' +
            'style="--genre-grad:' + estilo.grad + ';animation-delay:' + Math.min(indice * 50, 500) + 'ms">' +
            '  <span class="genre-card__icon">' + icone + "</span>" +
            '  <span>' +
            '    <span class="genre-card__name">' + CineUI.escapar(genero.nome) + "</span>" +
            '    <span class="genre-card__go">Ver filmes ' + CineUI.Icones.seta + "</span>" +
            "  </span>" +
            "</a>");
    }
})(jQuery);
