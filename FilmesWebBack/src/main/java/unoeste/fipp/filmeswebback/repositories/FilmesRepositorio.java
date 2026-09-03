package unoeste.fipp.filmeswebback.repositories;

import org.springframework.stereotype.Repository;
import unoeste.fipp.filmeswebback.entities.Filme;
import unoeste.fipp.filmeswebback.entities.Genero;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

// acervo em memória: o que for cadastrado se perde ao reiniciar a aplicação
@Repository
public class FilmesRepositorio {
    private List<Filme> filmeList = new ArrayList<>();
    private GenerosRepositorio generosRepositorio;

    public FilmesRepositorio(GenerosRepositorio generosRepositorio) {
        this.generosRepositorio = generosRepositorio;
        carregarFilmes();
    }

    // atalho para pegar o objeto Genero na carga inicial
    private Genero genero(String nome) {
        return generosRepositorio.getGeneroNome(nome);
    }

    // monta o filme já apontando para a capa e a thumb; o nome do arquivo segue a
    // mesma regra do add-movie-poster e o caminho é relativo porque, na carga
    // inicial, não existe request para descobrir host e porta
    private Filme filme(String titulo, String ano, String genero) {
        String arquivo = titulo.replaceAll("[^A-Za-z0-9]+", "-") + ".jpeg";
        return new Filme(titulo, ano, genero(genero),
                "uploads/posters/" + arquivo,
                "uploads/posters/thumbs/" + arquivo);
    }

    private void carregarFilmes() {
        filmeList.add(filme("Cidadão Kane", "1941", "Drama"));
        filmeList.add(filme("Casablanca", "1942", "Romance"));
        filmeList.add(filme("O Poderoso Chefão", "1972", "Drama"));
        filmeList.add(filme("Os Sete Samurais", "1954", "Ação"));
        filmeList.add(filme("A Noviça Rebelde", "1965", "Drama"));
        filmeList.add(filme("Psicose", "1960", "Terror"));
        filmeList.add(filme("2001: Uma Odisseia no Espaço", "1968", "Ficção Científica"));
        filmeList.add(filme("A Felicidade Não Se Compra", "1946", "Drama"));
        filmeList.add(filme("O Mágico de Oz", "1939", "Fantasia"));
        filmeList.add(filme("Laranja Mecânica", "1971", "Ficção Científica"));
        filmeList.add(filme("Taxi Driver", "1976", "Drama"));
        filmeList.add(filme("O Exorcista", "1973", "Terror"));
        filmeList.add(filme("A Lista de Schindler", "1993", "Drama"));
        filmeList.add(filme("O Silêncio dos Inocentes", "1991", "Terror"));
        filmeList.add(filme("Doutor Jivago", "1965", "Drama"));
        filmeList.add(filme("Sangue Negro", "2007", "Drama"));
        filmeList.add(filme("O Grande Lebowski", "1998", "Comédia"));
        filmeList.add(filme("Forrest Gump", "1994", "Drama"));
        filmeList.add(filme("Caminhos Perigosos", "1953", "Drama"));
        filmeList.add(filme("Encontros e Desencontros", "2003", "Romance"));
        filmeList.add(filme("O Iluminado", "1980", "Terror"));
        filmeList.add(filme("Blade Runner", "1982", "Ficção Científica"));
        filmeList.add(filme("De Volta para o Futuro", "1985", "Ficção Científica"));
        filmeList.add(filme("Os Caça-Fantasmas", "1984", "Comédia"));
        filmeList.add(filme("Indiana Jones e os Caçadores da Arca Perdida", "1981", "Aventura"));
        filmeList.add(filme("O Rei Leão", "1994", "Animação"));
    }

    public Filme getFilmeAleatorio(){
        Random random=new Random();
        return filmeList.get(random.nextInt(filmeList.size()));
    }

    public List<Filme> getFilmeList(){
        return filmeList;
    }

    // busca sem diferenciar maiúsculas; null quando não existe
    public Filme getFilmeTitulo(String titulo){
        Filme filme=null;
        for(Filme f : filmeList){
            if(titulo.equalsIgnoreCase(f.getTitulo()))
                filme=f;
        }
        return filme;
    }

    public List <Filme> getFilmeGenero(Genero genero) {
        List <Filme> filmes=new ArrayList<>();
        for(Filme f : filmeList){
            if(f.getGenero()!=null && f.getGenero().getId()==genero.getId())
                filmes.add(f);
        }
        return filmes;
    }

    public List<Filme> getFilmeAno(int dtInicio, int dtFim) {
        List <Filme> filmes=new ArrayList<>();
        for(Filme f : filmeList){
            if(Integer.parseInt(f.getAno())>=dtInicio && Integer.parseInt(f.getAno())<=dtFim)
                filmes.add(f);
        }
        return filmes;
    }

    public List<Filme> getFilmePalavraChave(String palavra) {
        List <Filme> filmes=new ArrayList<>();
        for(Filme f : filmeList){
            if(f.getTitulo().toLowerCase().contains(palavra.toLowerCase()))
                filmes.add(f);
        }
        return filmes;
    }

    public boolean addFilme(Filme filme){
        return filmeList.add(filme);
    }
}
