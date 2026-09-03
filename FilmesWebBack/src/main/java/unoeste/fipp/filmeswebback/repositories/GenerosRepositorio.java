package unoeste.fipp.filmeswebback.repositories;

import org.springframework.stereotype.Repository;
import unoeste.fipp.filmeswebback.entities.Genero;

import java.util.ArrayList;
import java.util.List;

// lista fixa de gêneros: não vem de banco, é carregada na subida da aplicação
@Repository
public class GenerosRepositorio {
    private List<Genero> generoList = new ArrayList<>();

    public GenerosRepositorio() {
        carregarGeneros();
    }

    private void carregarGeneros() {
        generoList.add(new Genero(1, "Ação"));
        generoList.add(new Genero(2, "Aventura"));
        generoList.add(new Genero(3, "Comédia"));
        generoList.add(new Genero(4, "Drama"));
        generoList.add(new Genero(5, "Terror"));
        generoList.add(new Genero(6, "Ficção Científica"));
        generoList.add(new Genero(7, "Fantasia"));
        generoList.add(new Genero(8, "Romance"));
        generoList.add(new Genero(9, "Documentário"));
        generoList.add(new Genero(10, "Animação"));
    }

    public List<Genero> getGeneroList() {
        return generoList;
    }

    public Genero getGeneroId(int id) {
        Genero genero = null;
        for (Genero g : generoList) {
            if (g.getId() == id)
                genero = g;
        }
        return genero;
    }

    // busca sem diferenciar maiúsculas nem espaços nas pontas
    public Genero getGeneroNome(String nome) {
        Genero genero = null;
        if (nome != null) {
            for (Genero g : generoList) {
                if (nome.trim().equalsIgnoreCase(g.getGenero()))
                    genero = g;
            }
        }
        return genero;
    }
}
