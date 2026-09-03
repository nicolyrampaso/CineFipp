/* CINEFIPP - Cadastro de filme: valida no navegador e envia para
   POST /apis/add-movie ou /apis/add-movie-poster (quando há imagem). */
(function ($) {
    "use strict";

    var ANO_MINIMO = 1888;                                   // mesmo limite do back-end
    var ANO_MAXIMO = new Date().getFullYear() + 5;
    // limites espelham os do back-end; mudou lá, mude aqui
    var FORMATOS = ["jpg", "jpeg", "png"];
    var TAMANHO_MAXIMO = 5 * 1024 * 1024;                    // spring.servlet.multipart.max-file-size=5MB

    var ERROS = ["#erroTitulo", "#erroAno", "#erroGenero", "#erroPoster"];

    var arquivoPoster = null;
    var urlPreview = null;

    $(function () {
        CineUI.montarLayout("cadastro");
        $("#dropzoneIcone").html(CineUI.Icones.upload);

        CineUI.carregarGeneros("#campoGenero", {
            aoFalhar: function (erro) { mostrarErro("#erroGenero", erro.descricao || erro.mens); }
        });

        ligarUpload();

        $("#formFilme").on("submit", enviar);
        $("#btnLimpar").on("click", function () {
            removerPoster();
            limparTodosErros();
            CineUI.trocarConteudo("#mensagemSlot", null);
        });
    });

    /* Upload / preview ---------------------------------------------------- */
    // o <input type="file"> fica fora do #uploadSlot, por isso dropzone e
    // preview podem ser trocados sem destruir o campo (eventos delegados)
    function ligarUpload() {
        var $slot = $("#uploadSlot");

        $slot.on("click", ".dropzone", function () { $("#campoPoster").trigger("click"); });
        $slot.on("keydown", ".dropzone", function (e) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                $("#campoPoster").trigger("click");
            }
        });

        $slot.on("dragenter dragover", ".dropzone", function (e) {
            e.preventDefault();
            $(this).addClass("is-over");
        });
        $slot.on("dragleave drop", ".dropzone", function (e) {
            e.preventDefault();
            $(this).removeClass("is-over");
        });
        $slot.on("drop", ".dropzone", function (e) {
            var arquivos = e.originalEvent.dataTransfer && e.originalEvent.dataTransfer.files;
            if (arquivos && arquivos[0]) selecionarArquivo(arquivos[0]);
        });

        $slot.on("click", '[data-acao="trocar"]', function () {
            $("#campoPoster").val("").trigger("click");   // val("") permite reescolher o mesmo arquivo
        });
        $slot.on("click", '[data-acao="remover"]', removerPoster);

        $("#campoPoster").on("change", function () {
            if (this.files && this.files[0]) selecionarArquivo(this.files[0]);
        });
    }

    function extensao(nome) {
        var partes = String(nome || "").toLowerCase().split(".");
        return partes.length > 1 ? partes.pop() : "";
    }

    function formatarTamanho(bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / 1024 / 1024).toFixed(2) + " MB";
    }

    function selecionarArquivo(arquivo) {
        limparErro("#erroPoster");

        if ($.inArray(extensao(arquivo.name), FORMATOS) < 0) {
            removerPoster();
            mostrarErro("#erroPoster", "Formato inválido. Use JPG, JPEG ou PNG.");
            return;
        }
        if (arquivo.size > TAMANHO_MAXIMO) {
            removerPoster();
            mostrarErro("#erroPoster", "Arquivo muito grande (" + formatarTamanho(arquivo.size) +
                "). O servidor aceita posters de até 5 MB.");
            return;
        }

        arquivoPoster = arquivo;
        mostrarPreview(arquivo);
    }

    // preview local via createObjectURL: não sobe nada ainda
    function mostrarPreview(arquivo) {
        if (urlPreview) URL.revokeObjectURL(urlPreview);
        urlPreview = URL.createObjectURL(arquivo);

        CineUI.trocarConteudo("#uploadSlot", $('' +
            '<div class="poster-preview">' +
            '  <div class="poster-preview__thumb"><img src="' + urlPreview + '" alt="Pré-visualização do poster"></div>' +
            '  <div class="d-flex flex-column justify-content-center gap-1 overflow-hidden">' +
            '    <span class="poster-preview__name">' + CineUI.escapar(arquivo.name) + "</span>" +
            '    <span class="poster-preview__size">' + formatarTamanho(arquivo.size) + " · " +
                    CineUI.escapar(extensao(arquivo.name).toUpperCase()) + "</span>" +
            '    <div class="d-flex flex-wrap gap-2 mt-2">' +
            '      <button class="btn btn-cine-ghost btn-sm" type="button" data-acao="trocar">Trocar imagem</button>' +
            '      <button class="btn btn-cine-danger btn-sm" type="button" data-acao="remover">Remover</button>' +
            "    </div>" +
            "  </div>" +
            "</div>"));
    }

    function removerPoster() {
        arquivoPoster = null;
        if (urlPreview) {
            URL.revokeObjectURL(urlPreview);
            urlPreview = null;
        }
        $("#campoPoster").val("");

        CineUI.trocarConteudo("#uploadSlot", $('' +
            '<div class="dropzone" tabindex="0" role="button" aria-label="Selecionar arquivo do poster">' +
            '  <div class="dropzone__icon">' + CineUI.Icones.upload + "</div>" +
            '  <strong>Arraste seu poster aqui ou clique para selecionar</strong>' +
            '  <small>JPG, JPEG ou PNG · até 5 MB</small>' +
            "</div>"));
    }

    /* Validação: devolve true quando o formulário pode ser enviado -------- */
    function validar() {
        limparTodosErros();
        var ok = true;

        var $titulo = $("#campoTitulo");
        var $ano = $("#campoAno");
        var $genero = $("#campoGenero");

        if (!$titulo.val().trim()) {
            mostrarErro("#erroTitulo", "O título é obrigatório.", $titulo);
            ok = false;
        }

        var anoTexto = $ano.val().trim();
        if (!anoTexto) {
            mostrarErro("#erroAno", "O ano de lançamento é obrigatório.", ok ? $ano : null);
            ok = false;
        } else if (!/^\d{4}$/.test(anoTexto)) {
            mostrarErro("#erroAno", "O ano deve ter 4 dígitos. Ex.: 1985.", ok ? $ano : null);
            ok = false;
        } else {
            var valor = parseInt(anoTexto, 10);
            if (valor < ANO_MINIMO || valor > ANO_MAXIMO) {
                mostrarErro("#erroAno", "O ano deve estar entre " + ANO_MINIMO + " e " + ANO_MAXIMO + ".", ok ? $ano : null);
                ok = false;
            }
        }

        if (!$genero.val()) {
            mostrarErro("#erroGenero", "Selecione um gênero da lista.", ok ? $genero : null);
            ok = false;
        }

        // poster é opcional: só valida quando existe um arquivo escolhido
        if (arquivoPoster && $.inArray(extensao(arquivoPoster.name), FORMATOS) < 0) {
            mostrarErro("#erroPoster", "Formato inválido. Use JPG, JPEG ou PNG.");
            ok = false;
        }

        return ok;
    }

    /* Envio ---------------------------------------------------------------- */
    function enviar(evento) {
        evento.preventDefault();
        CineUI.trocarConteudo("#mensagemSlot", null);

        if (!validar()) return;

        var $genero = $("#campoGenero");
        var filme = {
            titulo: $("#campoTitulo").val().trim(),
            ano: $("#campoAno").val().trim(),
            genero: $genero.val(),
            generoId: parseInt($genero.find("option:selected").data("id") || 0, 10)
        };

        var $botao = $("#btnSalvar").prop("disabled", true).text("Enviando…");
        var comPoster = Boolean(arquivoPoster);

        var envio = comPoster
            ? CineAPI.cadastrarFilmeComPoster(filme, arquivoPoster)   // POST /apis/add-movie-poster
            : CineAPI.cadastrarFilme(filme);                          // POST /apis/add-movie

        envio
            .then(function (salvo) {
                CineUI.trocarConteudo("#mensagemSlot", sucesso(salvo || CineAPI.normalizarFilme(filme)));
                $("#formFilme")[0].reset();
                removerPoster();
            })
            .catch(function (erro) {
                var texto = [erro.descricao, erro.correcao].filter(Boolean).join(" ");
                if (erro.status >= 500 && comPoster)
                    texto = "O servidor recusou o arquivo. Tente um poster menor (até 5 MB).";
                CineUI.trocarConteudo("#mensagemSlot",
                    CineUI.alerta("error", erro.mens || "Não foi possível cadastrar", texto));
            })
            .then(function () {
                $botao.prop("disabled", false).text("Cadastrar filme");
            });
    }

    function sucesso(filme) {
        return $("<div></div>")
            .append(CineUI.alerta("success", '"' + filme.titulo + '" foi cadastrado com sucesso!',
                "O filme já aparece nas pesquisas e na home do CINEFIPP."))
            .append('<div class="d-flex flex-wrap gap-2 mt-3">' +
                '<a class="btn btn-cine-teal btn-sm" href="pesquisa.html?q=' + encodeURIComponent(filme.titulo) + '">Ver na pesquisa</a>' +
                '<a class="btn btn-cine-ghost btn-sm" href="index.html">Ir para a home</a>' +
                "</div>");
    }

    /* Erros de campo ------------------------------------------------------- */
    function mostrarErro(seletor, mensagem, $campo) {
        $(seletor).text(mensagem).addClass("d-block");
        if ($campo) $campo.addClass("is-invalid").trigger("focus");
    }

    function limparErro(seletor) {
        $(seletor).text("").removeClass("d-block");
    }

    function limparTodosErros() {
        limparErro(ERROS.join(","));
        $("#formFilme .is-invalid").removeClass("is-invalid");
    }
})(jQuery);
