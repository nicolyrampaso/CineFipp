package unoeste.fipp.filmeswebback.restcontrollers;

import jakarta.servlet.http.HttpServletRequest;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import unoeste.fipp.filmeswebback.entities.Erro;
import unoeste.fipp.filmeswebback.entities.Filme;
import unoeste.fipp.filmeswebback.entities.Genero;
import unoeste.fipp.filmeswebback.repositories.FilmesRepositorio;
import unoeste.fipp.filmeswebback.repositories.GenerosRepositorio;

import java.io.File;
import java.time.Year;
import java.util.List;

@CrossOrigin
@RestController
@RequestMapping(value = "apis")
public class FilmesRestController {

    @Autowired
    private FilmesRepositorio filmesRepositorio;

    @Autowired
    private GenerosRepositorio generosRepositorio;

    // usado para montar a URL absoluta do poster (host e porta de quem chamou)
    @Autowired
    private HttpServletRequest request;

    @GetMapping(value = "test")
    public ResponseEntity<Object> test(){
        return ResponseEntity.ok().body("status ok (200)");
    }

    @GetMapping(value = "random-movie")
    public ResponseEntity<Object> randMovie(){
        return ResponseEntity.ok(filmesRepositorio.getFilmeAleatorio());
    }

    @GetMapping(value="list-movies")
    public ResponseEntity<Object> allMovies(){
        return ResponseEntity.ok(filmesRepositorio.getFilmeList());
    }

    @GetMapping(value="get-movie")
    public ResponseEntity<Object> getMovie(@RequestParam(value = "titulo") String  titulo){
        Filme filme=filmesRepositorio.getFilmeTitulo(titulo);
        if(filme!=null)
            return ResponseEntity.ok(filme);
        return ResponseEntity.badRequest().body(new Erro("filme não encontrado"));
    }

    @GetMapping(value="get-movie/{titulo}")
    public ResponseEntity<Object> getMoviePath(@PathVariable String  titulo){
        return getMovie(titulo);
    }

    @GetMapping(value="list-genre/{genero}")
    public ResponseEntity<Object> getMovieGenre(@PathVariable String  genero){
        Genero generoFilme=generosRepositorio.getGeneroNome(genero);
        if(generoFilme==null)
            return ResponseEntity.badRequest().body(new Erro("gênero não encontrado"));
        List <Filme> filmes=filmesRepositorio.getFilmeGenero(generoFilme);
        if(filmes.isEmpty())
            return ResponseEntity.badRequest().body(new Erro("nenhum filme neste gênero"));
        return ResponseEntity.ok(filmes);
    }

    @GetMapping(value="list-year/{dt-inicio}/{dt-fim}")
    public ResponseEntity<Object> getMovieYear(@PathVariable(value = "dt-inicio") int  dtInicio,
                                               @PathVariable(value = "dt-fim") int  dtFim){
        if(dtInicio>dtFim)
            return ResponseEntity.badRequest().body(new Erro("intervalo de anos inválido"));
        List <Filme> filmes=filmesRepositorio.getFilmeAno(dtInicio, dtFim);
        if(filmes.isEmpty())
            return ResponseEntity.badRequest().body(new Erro("nenhum filme neste intervalo"));
        return ResponseEntity.ok(filmes);
    }

    @GetMapping(value="list-keyword")
    public ResponseEntity<Object> getMovieKeyword(@RequestParam(value = "palavra") String palavra){
        List <Filme> filmes=filmesRepositorio.getFilmePalavraChave(palavra);
        if(filmes.isEmpty())
            return ResponseEntity.badRequest().body(new Erro("nenhum filme com esta palavra"));
        return ResponseEntity.ok(filmes);
    }

    @GetMapping(value="list-keyword/{palavra}")
    public ResponseEntity<Object> getMovieKeywordPath(@PathVariable String palavra){
        return getMovieKeyword(palavra);
    }

    @PostMapping(value = "add-movie")
    public ResponseEntity<Object> addFilme(@RequestBody Filme novoFilme){
        Erro erro=validarFilme(novoFilme);
        if(erro!=null)
            return ResponseEntity.badRequest().body(erro);
        filmesRepositorio.addFilme(novoFilme);
        return ResponseEntity.ok(novoFilme);
    }

    @PostMapping(value = "add-movie-poster")
    public ResponseEntity<Object> addFilmePoster(@RequestParam("titulo")  String titulo,
                                                 @RequestParam("ano") String ano,
                                                 @RequestParam("genero") String genero,
                                                 @RequestParam("poster") MultipartFile poster)
    {
        Erro erroPoster=validarPoster(poster);
        if(erroPoster!=null)
            return ResponseEntity.badRequest().body(erroPoster);

        // serve de pasta em disco e de trecho da URL (./uploads é publicado em /uploads/**)
        final String POSTER_FOLDER="uploads/posters";
        final String THUMB_FOLDER="uploads/posters/thumbs";
        File uploadFolder=new File(POSTER_FOLDER);
        if(!uploadFolder.exists())
            uploadFolder.mkdirs();
        File thumbFolder=new File(THUMB_FOLDER);
        if(!thumbFolder.exists())
            thumbFolder.mkdirs();

        // o form manda só o nome do gênero
        Filme novoFilme=new Filme(titulo, ano, generosRepositorio.getGeneroNome(genero), "");
        Erro erro=validarFilme(novoFilme);
        if(erro!=null)
            return ResponseEntity.badRequest().body(erro);
        try {
            // acento, espaço e pontuação viram "-" para o nome funcionar na URL
            String fileName=novoFilme.getTitulo().replaceAll("[^A-Za-z0-9]+", "-")+".jpeg";
            String server = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+request.getContextPath();

            // poster em tamanho original, convertido para jpeg
            Thumbnails.of(poster.getInputStream())
                    .scale(1)
                    .outputFormat("jpeg")
                    .toFile(new File(uploadFolder, fileName));

            // thumbnail para os cards da listagem
            Thumbnails.of(poster.getInputStream())
                    .size(200, 300)
                    .outputFormat("jpeg")
                    .toFile(new File(thumbFolder, fileName));

            novoFilme.setFileName(server+"/"+POSTER_FOLDER+"/"+fileName);
            novoFilme.setThumbnail(server+"/"+THUMB_FOLDER+"/"+fileName);
            filmesRepositorio.addFilme(novoFilme);
            return ResponseEntity.ok(novoFilme);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new Erro("Problemas ao adicionar o filme"));
        }
    }

    // só estas extensões são aceitas; o arquivo é convertido para jpeg depois
    private Erro validarPoster(MultipartFile poster){
        if(poster==null || poster.isEmpty())
            return new Erro("o poster é obrigatório");
        String nome=poster.getOriginalFilename();
        if(nome==null || !nome.toLowerCase().matches(".+\\.(jpg|jpeg|png)$"))
            return new Erro("formato de poster inválido; use jpg, jpeg ou png");
        return null;
    }

    // Devolve null quando está tudo certo; senão, o Erro que vai no HTTP 400.
    // Também normaliza o filme: apara espaços e troca o gênero pelo objeto oficial
    private Erro validarFilme(Filme filme){
        if(filme==null)
            return new Erro("Problemas ao adicionar o filme");
        if(filme.getTitulo()==null || filme.getTitulo().isBlank())
            return new Erro("o título é obrigatório");
        if(filmesRepositorio.getFilmeTitulo(filme.getTitulo().trim())!=null)
            return new Erro("filme já cadastrado");
        if(filme.getAno()==null || !filme.getAno().trim().matches("\\d{4}"))
            return new Erro("ano inválido");
        int ano=Integer.parseInt(filme.getAno().trim());
        if(ano<1888 || ano>Year.now().getValue()+5)
            return new Erro("ano inválido");
        Genero genero=getGenero(filme.getGenero());
        if(genero==null)
            return new Erro("gênero inválido");
        filme.setTitulo(filme.getTitulo().trim());
        filme.setAno(filme.getAno().trim());
        filme.setGenero(genero);
        if(filme.getFileName()==null)
            filme.setFileName("");
        if(filme.getThumbnail()==null)
            filme.setThumbnail("");
        return null;
    }

    // resolve o gênero contra a lista fixa, por id ou por nome
    private Genero getGenero(Genero genero){
        if(genero==null)
            return null;
        if(genero.getId()>0)
            return generosRepositorio.getGeneroId(genero.getId());
        return generosRepositorio.getGeneroNome(genero.getGenero());
    }
}
