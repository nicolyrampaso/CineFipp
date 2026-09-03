/* CINEFIPP - unica porta de entrada do back-end (window.CineAPI).
   Usa $.ajax e devolve promises; nenhuma tela chama a API diretamente. */
(function (global, $) {
    "use strict";

    // trocar o back-end sem editar o codigo:
    // localStorage.setItem("cinefipp:api", "http://IP:8080/apis")
    var BASE_URL = global.CINEFIPP_API_URL
        || (global.localStorage && localStorage.getItem("cinefipp:api"))
        || "http://localhost:8080/apis";

    var SERVER_ORIGIN = BASE_URL.replace(/\/apis\/?$/, "");

    // Erro padrao do back-end { mens, descricao, correcao }. Guarda o status
    // porque HTTP 400 tanto pode ser falha quanto "nenhum resultado".
    function ApiError(mens, descricao, correcao, status) {
        this.name = "ApiError";
        this.message = mens || "Não foi possível falar com o servidor";
        this.mens = this.message;
        this.descricao = descricao || "";
        this.correcao = correcao || "";
        this.status = status || 0;
        this.offline = !status; // status 0 = nao chegou no servidor
    }
    ApiError.prototype = Object.create(Error.prototype);
    ApiError.prototype.constructor = ApiError;

    // Toda chamada passa por aqui: monta a URL e traduz falhas em ApiError.
    function request(path, opcoes) {
        var deferred = $.Deferred();

        $.ajax($.extend({
            url: BASE_URL + path,
            method: "GET"
        }, opcoes))
            .done(function (dados) {
                deferred.resolve(dados);
            })
            .fail(function (jqXHR) {
                if (!jqXHR.status) {
                    deferred.reject(new ApiError(
                        "Servidor indisponível",
                        "Não foi possível conectar em " + SERVER_ORIGIN + ".",
                        "Verifique se o back-end (FilmesWebBack) está rodando na porta 8080."
                    ));
                    return;
                }

                var corpo = jqXHR.responseJSON;
                if (corpo && corpo.mens) {
                    deferred.reject(new ApiError(corpo.mens, corpo.descricao, corpo.correcao, jqXHR.status));
                    return;
                }

                deferred.reject(new ApiError(
                    "Erro " + jqXHR.status,
                    jqXHR.responseText || "A requisição não pôde ser concluída.",
                    "Tente novamente em instantes.",
                    jqXHR.status
                ));
            });

        return deferred.promise();
    }

    // fileName/thumbnail podem vir com "\" do Windows ou como caminho
    // relativo; aqui viram URL absoluta pronta para o <img>.
    function resolverUrlImagem(valor) {
        if (!valor) return "";
        var url = String(valor).trim().replace(/\\/g, "/");
        if (!url) return "";
        if (/^https?:\/\//i.test(url)) return url.replace(/([^:])\/{2,}/g, "$1/");
        return SERVER_ORIGIN + "/" + url.replace(/^\/+/, "");
    }

    // o back-end manda { id, genero }; texto puro tambem e aceito
    function nomeDoGenero(genero) {
        if (!genero) return "";
        if (typeof genero === "string") return genero;
        return genero.genero || "";
    }

    function idDoGenero(genero) {
        if (!genero || typeof genero !== "object") return 0;
        return genero.id || 0;
    }

    // formato unico consumido pelas telas (posterUrl/thumbUrl ja resolvidos)
    function normalizarFilme(filme) {
        if (!filme || typeof filme !== "object") return null;
        var poster = resolverUrlImagem(filme.fileName);
        var thumb = resolverUrlImagem(filme.thumbnail) || poster;
        return {
            id: filme.id,
            titulo: filme.titulo || "Sem título",
            ano: filme.ano || "",
            genero: nomeDoGenero(filme.genero),
            generoId: idDoGenero(filme.genero),
            posterUrl: poster || thumb,
            thumbUrl: thumb || poster,
            temPoster: Boolean(poster || thumb)
        };
    }

    function normalizarLista(lista) {
        if (!Array.isArray(lista)) return [];
        return $.map(lista, normalizarFilme);
    }

    var api = {
        BASE_URL: BASE_URL,
        SERVER_ORIGIN: SERVER_ORIGIN,
        ApiError: ApiError,
        normalizarFilme: normalizarFilme,

        // GET /apis/test
        test: function () {
            return request("/test");
        },

        // GET /apis/random-movie
        filmeAleatorio: function () {
            return request("/random-movie").then(normalizarFilme);
        },

        // GET /apis/list-movies
        listarFilmes: function () {
            return request("/list-movies").then(normalizarLista);
        },

        // GET /apis/get-movie?titulo=...
        buscarPorTitulo: function (titulo) {
            return request("/get-movie?titulo=" + encodeURIComponent(titulo)).then(normalizarFilme);
        },

        // GET /apis/list-genre/{genero}
        listarPorGenero: function (genero) {
            return request("/list-genre/" + encodeURIComponent(genero)).then(normalizarLista);
        },

        // GET /apis/list-year/{dt-inicio}/{dt-fim}
        listarPorAno: function (anoInicio, anoFim) {
            return request("/list-year/" + encodeURIComponent(anoInicio) + "/" + encodeURIComponent(anoFim))
                .then(normalizarLista);
        },

        // GET /apis/list-keyword/{palavra}
        listarPorPalavra: function (palavra) {
            return request("/list-keyword/" + encodeURIComponent(palavra)).then(normalizarLista);
        },

        // GET /apis/get-generos  ->  [{ id, genero }]
        listarGeneros: function () {
            return request("/get-generos").then(function (lista) {
                if (!Array.isArray(lista)) return [];
                return $.map(lista, function (g) {
                    return typeof g === "string" ? { id: 0, nome: g } : { id: g.id, nome: g.genero };
                });
            });
        },

        // POST /apis/add-movie (sem poster)
        cadastrarFilme: function (filme) {
            // genero vai como objeto: texto puro e recusado com HTTP 400.
            // id 0 = back-end resolve pelo nome
            var genero = { id: filme.generoId || 0, genero: filme.genero };
            return request("/add-movie", {
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({ titulo: filme.titulo, ano: filme.ano, genero: genero })
            }).then(normalizarFilme);
        },

        // POST /apis/add-movie-poster (com upload do poster)
        cadastrarFilmeComPoster: function (filme, arquivo) {
            var dados = new FormData();
            dados.append("titulo", filme.titulo);
            dados.append("ano", filme.ano);
            dados.append("genero", filme.genero);   // texto: multipart nao leva objeto
            dados.append("poster", arquivo);

            return request("/add-movie-poster", {
                method: "POST",
                data: dados,
                processData: false,  // o FormData ja esta pronto para ir no corpo
                contentType: false   // deixa o navegador definir o boundary do multipart
            }).then(normalizarFilme);
        }
    };

    /* Fontes derivadas: o back-end nao tem endpoint de ranking/sugestoes,
       entao as listas saem de /apis/list-movies. Ficam isoladas em api.fontes
       para trocar por um endpoint real sem mexer nas telas. */
    var SEMENTE_DIARIA = (function () {
        var hoje = new Date();
        return hoje.getFullYear() * 10000 + (hoje.getMonth() + 1) * 100 + hoje.getDate();
    })();

    // embaralhamento deterministico: mesma ordem o dia inteiro
    function embaralharPorSemente(lista, semente) {
        var copia = lista.slice();
        var estado = semente || 1;
        function proximo() {
            estado = (estado * 1103515245 + 12345) % 2147483648;
            return estado / 2147483648;
        }
        for (var i = copia.length - 1; i > 0; i--) {
            var j = Math.floor(proximo() * (i + 1));
            var tmp = copia[i];
            copia[i] = copia[j];
            copia[j] = tmp;
        }
        return copia;
    }

    api.fontes = {
        // TODO: trocar por GET /apis/... quando existir um endpoint de sugestoes
        sugestoesDoDia: function (quantidade) {
            return api.listarFilmes().then(function (filmes) {
                return embaralharPorSemente(filmes, SEMENTE_DIARIA).slice(0, quantidade || 12);
            });
        },

        // TODO: trocar por GET /apis/... quando existir um endpoint de ranking
        topDaSemana: function (quantidade) {
            var limite = quantidade || 10;
            return api.listarFilmes().then(function (filmes) {
                var semanaAtual = Math.floor(SEMENTE_DIARIA / 7);
                // filmes com poster primeiro (ranking fica mais apresentavel)
                var ordenados = embaralharPorSemente(filmes, semanaAtual).sort(function (a, b) {
                    return (b.temPoster ? 1 : 0) - (a.temPoster ? 1 : 0);
                });
                return ordenados.slice(0, limite);
            });
        },

        // ultimos da lista = cadastrados mais recentes
        ultimosCadastrados: function (quantidade) {
            return api.listarFilmes().then(function (filmes) {
                return filmes.slice().reverse().slice(0, quantidade || 12);
            });
        }
    };

    global.CineAPI = api;
})(window, jQuery);
