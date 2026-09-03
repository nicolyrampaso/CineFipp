package unoeste.fipp.filmeswebback.entities;

public class Genero {
    private int id;
    private String genero;

    // exigido pelo Jackson para desserializar {"id":4,"genero":"Drama"}
    public Genero() {
    }

    public Genero(int id, String genero) {
        this.id = id;
        this.genero = genero;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getGenero() {
        return genero;
    }

    public void setGenero(String genero) {
        this.genero = genero;
    }
}
