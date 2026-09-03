# CINEFIPP — Catálogo de Filmes

Projeto acadêmico da disciplina **Ferramentas Computacionais III** (UNOESTE/FIPP).

Uma API REST em Spring Boot que gerencia uma coleção de filmes, e um front-end web que a
consome. Cada filme tem **título, ano de lançamento e gênero** — e, opcionalmente, um
**poster** com thumbnail gerado no servidor.

Não há banco de dados: o acervo vive em memória enquanto a aplicação está no ar.

## Equipe

Trabalho desenvolvido **em grupo** pelos alunos:

| Aluno |
|---|
| Christiano Galindo |
| Nicoly Rampaso |
| Vitor Micael |

---

## Sumário

- [Requisitos do trabalho](#requisitos-do-trabalho)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Tecnologias](#tecnologias)
- [Como executar](#como-executar)
- [A API](#a-api)
- [Modelo de dados](#modelo-de-dados)
- [Regras de validação](#regras-de-validação)
- [Poster e thumbnail](#poster-e-thumbnail)
- [O front-end](#o-front-end)
- [Decisões de projeto](#decisões-de-projeto)

---

## Requisitos do trabalho

O enunciado foi entregue em quatro etapas. Abaixo, cada item pedido e onde ele está
implementado neste repositório.

### Etapa 1 — Os endpoints da API REST

| Item | O que foi pedido | Onde está | |
|---|---|---|---|
| a | `apis/test` devolvendo `status ok (200)` | `FilmesRestController.test()` | ✔ |
| b | `apis/random-movie` — um filme aleatório da lista | `randMovie()`, sorteio sobre o acervo do `FilmesRepositorio` | ✔ |
| c | `apis/list-movies` — todos os filmes | `allMovies()` | ✔ |
| d | `apis/get-movie` por **query**, com erro em JSON se não achar | `getMovie(@RequestParam titulo)` → HTTP 400 + `Erro` | ✔ |
| e | O mesmo, por **path** | `getMoviePath(@PathVariable titulo)` | ✔ |
| f | `apis/list-genre` por gênero (path), com erro em JSON | `getMovieGenre(@PathVariable genero)` | ✔ |
| g | `apis/list-year` — filmes entre dois anos, **inclusive** | `getMovieYear(dt-inicio, dt-fim)` | ✔ |
| h | `apis/add-movie` — cadastro validado, sucesso ou erro em JSON | `addFilme(@RequestBody Filme)` + [regras de validação](#regras-de-validação) | ✔ |
| i | `apis/get-generos` — os 10 gêneros em JSON | `GenerosRestController.allGeneros()` | ✔ |

A lista de gêneros é exatamente a do enunciado, com os mesmos `id` de 1 a 10 — veja a
[tabela em Modelo de dados](#genero). Todo erro sai como **HTTP 400** com um objeto
[`Erro`](#erro) em JSON, nunca como texto solto.

> **Extras além do pedido:** `get-genero/{id}` e `get-genero?genero=` para buscar um gênero
> isolado, e `list-keyword/{palavra}` na versão path.

### Etapa 2 — Persistência em memória e busca por palavra-chave

| O que foi pedido | Como foi feito | |
|---|---|---|
| Promover a persistência na memória | O acervo é um `ArrayList` no `FilmesRepositorio`, criado uma vez na subida da aplicação. Um filme cadastrado pelo `add-movie` **continua lá nas requisições seguintes** — some apenas quando a aplicação reinicia | ✔ |
| `apis/list-keyword` — filmes cujo título contém a palavra | `getMovieKeyword(@RequestParam palavra)`, sem diferenciar maiúsculas de minúsculas | ✔ |

### Etapa 3 — O front-end

| Item | O que foi pedido | Onde está | |
|---|---|---|---|
| a | Home que já carrega uma sugestão aleatória | `index.html` + `indexController.js`, consumindo `/apis/random-movie` em destaque, com trilhos de últimos cadastrados, sugestões do dia e Top 10 | ✔ |
| b | Página de pesquisa por palavra-chave, gênero **e** faixa de datas | `pesquisa.html` + `pesquisaController.js`, uma aba para cada uma das três buscas | ✔ |
| c | Cadastro com o gênero **selecionado, não digitado** | `cadastro.html` + `cadastroController.js`: o `<select>` é preenchido em tempo de execução a partir de `/apis/get-generos` (`ui.js`, `preencherSelectGeneros`) | ✔ |
| — | "Melhorar a interface, CSS…" | Layout próprio em `css/cinefipp.css` sobre Bootstrap 5, identidade visual da marca CINEFIPP, tema claro/escuro com a preferência guardada, e ainda uma vitrine de gêneros (`generos.html`) | ✔ |

### Etapa 4 — Poster e thumbnail

| Item | O que foi pedido | Onde está | |
|---|---|---|---|
| a | Poster no cadastro de novos filmes | `POST /apis/add-movie-poster` (multipart) — no front, área de arrastar-e-soltar com pré-visualização antes do envio | ✔ |
| b | Gerar o thumbnail ao receber o poster | Thumbnailator converte para JPEG e gera a miniatura de 200x300 em `uploads/posters/thumbs/` — veja [Poster e thumbnail](#poster-e-thumbnail) | ✔ |
| c | Mostrar o thumbnail na pesquisa | Os cards de resultado exibem a miniatura de quem tem poster (`ui.js`) | ✔ |
| d | Clicar no thumbnail abre o poster original em popover | Botão `movie-card__zoom` no card abre o arquivo original em uma janela sobreposta | ✔ |

---

## Estrutura do projeto

```
FilmesWeb/
├── FilmesWebBack/                    API REST (Spring Boot / Maven)
│   ├── src/main/java/unoeste/fipp/filmeswebback/
│   │   ├── FilmesWebBackApplication.java
│   │   ├── entities/                 Filme, Genero, Erro
│   │   ├── repositories/             FilmesRepositorio, GenerosRepositorio
│   │   └── restcontrollers/          FilmesRestController, GenerosRestController
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── uploads/posters/              posters enviados e do acervo inicial
│   │   └── thumbs/                   miniaturas geradas
│   └── pom.xml
│
└── FilmesWebFront/                   Front-end estático
    ├── index.html                    home com sugestão aleatória
    ├── pesquisa.html                 busca por palavra, gênero e faixa de anos
    ├── cadastro.html                 formulário de cadastro
    ├── generos.html                  vitrine de gêneros
    ├── consulta.html                 redirect da tela antiga → pesquisa.html
    ├── css/cinefipp.css
    ├── assets/                       logo, marca e favicon
    └── js/
        ├── api.js                    única camada que fala com a API
        ├── ui.js                     componentes reutilizados (cards, modal, estados)
        ├── indexController.js
        ├── pesquisaController.js
        ├── cadastroController.js
        └── generosController.js
```

O front separa três responsabilidades: `api.js` conhece a API e mais nada; `ui.js` monta
componentes a partir de dados já prontos e não conhece endpoints; cada `*Controller.js`
liga uma página específica aos dois.

---

## Tecnologias

**Backend**

| | |
|---|---|
| Java | 25 |
| Spring Boot | 4.1.0 (`spring-boot-starter-webmvc`) |
| Thumbnailator | 0.4.20 — conversão de imagem e geração de miniaturas |
| Maven | build e execução |

**Frontend**

HTML, CSS e JavaScript, com **jQuery 3.7.1** e **Bootstrap 5.3.3** carregados por CDN.
Sem build, sem `npm install` — são arquivos estáticos.

---

## Como executar

### 1. Backend

Pelo IntelliJ, rode a classe `FilmesWebBackApplication`. Pelo terminal, com o Maven
instalado:

```bash
cd FilmesWebBack
mvn spring-boot:run
```

> O script `./mvnw` acompanha o projeto, mas a pasta `.mvn/wrapper/` não existe, então ele
> falha com *"cannot read distributionUrl property"*. Para usá-lo, gere o wrapper de novo
> com `mvn wrapper:wrapper`.

A API sobe em **http://localhost:8080**. Para conferir:

```bash
curl http://localhost:8080/apis/test
# status ok (200)
```

### 2. Frontend

Os arquivos são estáticos. Abra o `index.html` direto no navegador, ou sirva a pasta —
com a extensão *Live Server* do VS Code, por exemplo:

```bash
cd FilmesWebFront
python3 -m http.server 5500     # http://localhost:5500
```

O front aponta para `http://localhost:8080/apis` por padrão. Para usar outro endereço
(acessar de outro computador da rede, por exemplo), não é preciso editar código:

```js
localStorage.setItem("cinefipp:api", "http://192.168.0.10:8080/apis");
```

> O backend usa `@CrossOrigin`, então o front funciona tanto servido por HTTP quanto
> aberto diretamente pelo sistema de arquivos (`file://`).

---

## A API

Todos os endpoints ficam sob o prefixo `/apis`. Em caso de falha a resposta é **HTTP 400**
com um objeto `Erro` em JSON.

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/apis/test` | Devolve `status ok (200)` — teste de disponibilidade |
| GET | `/apis/random-movie` | Um filme aleatório do acervo |
| GET | `/apis/list-movies` | Todos os filmes |
| GET | `/apis/get-movie?titulo=` | Busca por título (query) |
| GET | `/apis/get-movie/{titulo}` | Busca por título (path) |
| GET | `/apis/list-genre/{genero}` | Filmes de um gênero |
| GET | `/apis/list-year/{inicio}/{fim}` | Filmes lançados no intervalo, **inclusive** |
| GET | `/apis/list-keyword?palavra=` | Filmes cujo título contém a palavra |
| GET | `/apis/list-keyword/{palavra}` | Idem, por path |
| GET | `/apis/get-generos` | Os 10 gêneros disponíveis |
| GET | `/apis/get-genero/{id}` | Um gênero por id |
| GET | `/apis/get-genero?genero=` | Um gênero por nome |
| POST | `/apis/add-movie` | Cadastra um filme (JSON) |
| POST | `/apis/add-movie-poster` | Cadastra um filme com poster (multipart) |

A busca por título, gênero e palavra-chave **ignora maiúsculas e minúsculas**.

### Exemplos

```bash
# filmes de terror
curl http://localhost:8080/apis/list-genre/Terror

# lançamentos entre 1978 e 1990
curl http://localhost:8080/apis/list-year/1978/1990

# cadastro simples
curl -X POST http://localhost:8080/apis/add-movie \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Duna","ano":"2021","genero":{"id":6,"genero":"Ficção Científica"}}'

# cadastro com poster
curl -X POST http://localhost:8080/apis/add-movie-poster \
  -F "titulo=Duna" -F "ano=2021" -F "genero=Ficção Científica" \
  -F "poster=@/caminho/para/cartaz.jpg"
```

---

## Modelo de dados

### Filme

```json
{
  "titulo": "Blade Runner",
  "ano": "1982",
  "genero": { "id": 6, "genero": "Ficção Científica" },
  "fileName": "uploads/posters/Blade-Runner.jpeg",
  "thumbnail": "uploads/posters/thumbs/Blade-Runner.jpeg"
}
```

`fileName` e `thumbnail` vêm vazios quando o filme não tem poster.

### Genero

O gênero é **sempre um objeto**, nunca texto solto — tanto na resposta quanto no corpo do
`add-movie`:

```json
{ "id": 4, "genero": "Drama" }
```

Se você mandar `"id": 0`, o backend resolve o gênero pelo nome. A lista é fixa e carregada
na subida da aplicação:

| id | gênero | id | gênero |
|---|---|---|---|
| 1 | Ação | 6 | Ficção Científica |
| 2 | Aventura | 7 | Fantasia |
| 3 | Comédia | 8 | Romance |
| 4 | Drama | 9 | Documentário |
| 5 | Terror | 10 | Animação |

> No `add-movie-poster` o gênero vai como **texto** no campo do formulário, porque
> multipart não carrega objeto aninhado.

### Erro

```json
{ "mens": "filme já cadastrado", "descricao": "", "correcao": "" }
```

O front lê o campo `mens` para montar o aviso na tela.

---

## Regras de validação

O `add-movie` e o `add-movie-poster` compartilham as mesmas regras:

| Regra | Mensagem |
|---|---|
| Título obrigatório | `o título é obrigatório` |
| Título ainda não cadastrado | `filme já cadastrado` |
| Ano com 4 dígitos, entre 1888 e o ano atual + 5 | `ano inválido` |
| Gênero presente na lista fixa | `gênero inválido` |
| Poster com extensão `.jpg`, `.jpeg` ou `.png` | `formato de poster inválido; use jpg, jpeg ou png` |

Quando passa na validação, o filme ainda é normalizado: espaços das pontas são aparados e
o gênero informado é trocado pelo objeto oficial da lista.

As mesmas regras estão espelhadas no front (`cadastroController.js`), para o usuário
receber o retorno sem precisar de uma ida ao servidor. O backend valida de novo de
qualquer forma — validação de front é conveniência, não segurança.

---

## Poster e thumbnail

Ao receber um poster, o `add-movie-poster`:

1. **valida a extensão** (`.jpg`, `.jpeg` ou `.png`) antes de gravar qualquer coisa;
2. converte a imagem para **JPEG** e salva em `uploads/posters/`;
3. gera uma **miniatura** que cabe em 200x300, preservando a proporção, em
   `uploads/posters/thumbs/`;
4. devolve no JSON as URLs absolutas dos dois arquivos.

O nome do arquivo vem do título, com acentos, espaços e pontuação trocados por `-`, para
funcionar em URL: *"O Poderoso Chefão"* vira `O-Poderoso-Chef-o.jpeg`.

O `application.properties` publica a pasta `./uploads` na rota `/uploads/**`, então
qualquer subpasta é servida automaticamente. O limite de upload é de **5 MB por arquivo**.

---

## O front-end

### `index.html` — Home
Carrega uma **sugestão aleatória** em destaque (`/apis/random-movie`), além de trilhos com
os últimos cadastrados, sugestões do dia e um Top 10. As duas últimas listas são derivadas
de `/apis/list-movies` no próprio front, com embaralhamento determinístico — a ordem muda
a cada dia, mas se mantém estável ao longo dele.

### `pesquisa.html` — Pesquisa
Três abas, uma para cada tipo de busca: **palavra-chave**, **gênero** (select carregado de
`/apis/get-generos`) e **faixa de anos**. Resultados aparecem em cards com o thumbnail de
quem tem poster; **clicar no thumbnail abre o poster original em um popover**.

Aceita parâmetros na URL — `pesquisa.html?q=futuro` ou `pesquisa.html?genero=Terror` —
usados pela home e pela página de gêneros para levar o usuário já com a busca feita.

### `cadastro.html` — Cadastro
Formulário com título, ano e **gênero selecionado em uma lista** (nunca digitado). O poster
é opcional, com área de arrastar-e-soltar e pré-visualização imediata no navegador, antes
mesmo de enviar.

### `generos.html` — Gêneros
Vitrine com os 10 gêneros; cada card leva para a pesquisa já filtrada.

Todas as páginas compartilham cabeçalho, rodapé e alternância entre **tema claro e
escuro**, com a preferência guardada no `localStorage`.

---

## Decisões de projeto

**Persistência em memória.** O acervo é um `ArrayList` no `FilmesRepositorio`. Filmes
cadastrados sobrevivem a novas requisições, mas **se perdem quando a aplicação reinicia**,
voltando aos 26 títulos iniciais. Isso é intencional: o objetivo do trabalho é a construção
da API REST, não a persistência.

**Caminhos relativos no acervo inicial.** Os 26 filmes de carga apontam para
`uploads/posters/...` sem host nem porta, porque na inicialização não existe requisição
HTTP de onde tirar essa informação. Os filmes cadastrados em tempo de execução recebem URL
absoluta, montada a partir da requisição. O front trata os dois formatos.

**HTTP 400 também para "nenhum resultado".** Buscas sem resultado devolvem 400 com um
`Erro`, e não uma lista vazia. O front guarda o status para distinguir "não achei nada" de
"a consulta falhou" e mostrar a tela certa em cada caso.

**Validação de poster nas duas pontas.** Front e back aceitam exatamente as mesmas
extensões. O backend valida antes de criar pastas ou gravar arquivos, para não deixar lixo
em disco quando a requisição é recusada.

---

## Observações

- A pasta `uploads/` está no `.gitignore`. Isso vale para os posters enviados pelo usuário,
  mas também para as **capas do acervo inicial** — quem clonar o repositório verá os 26
  filmes sem imagem até enviá-las. Se as capas devem acompanhar o projeto, adicione uma
  exceção ao `.gitignore` para `uploads/posters/`.
- As capas do acervo inicial foram obtidas na Wikipédia. São imagens protegidas por direito
  autoral, usadas aqui em contexto estritamente acadêmico.

---

Projeto acadêmico · UNOESTE/FIPP · Ferramentas Computacionais III
Christiano Galindo · Nicoly Rampaso · Vitor Micael
# My Project Updates
