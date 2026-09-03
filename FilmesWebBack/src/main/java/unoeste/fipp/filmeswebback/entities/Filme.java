package unoeste.fipp.filmeswebback.entities;

public class Filme {
    private String titulo;
    private String ano;
    private Genero genero;
    private String fileName;
    private String thumbnail;

    // exigido pelo Jackson para desserializar o JSON do add-movie
    public Filme() {
    }

    public Filme(String titulo, String ano, Genero genero, String fileName) {this(titulo, ano, genero, fileName, "");}

    public Filme(String titulo, String ano, Genero genero, String fileName, String thumbnail) {
        this.titulo = titulo;
        this.ano = ano;
        this.genero = genero;
        this.fileName = fileName;
        this.thumbnail = thumbnail;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getAno() {
        return ano;
    }

    public void setAno(String ano) {
        this.ano = ano;
    }

    public Genero getGenero() {
        return genero;
    }

    public void setGenero(Genero genero) {
        this.genero = genero;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getThumbnail() {
        return thumbnail;
    }

    public void setThumbnail(String thumbnail) {
        this.thumbnail = thumbnail;
    }
}
