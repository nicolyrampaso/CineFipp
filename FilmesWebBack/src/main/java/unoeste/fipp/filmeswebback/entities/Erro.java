package unoeste.fipp.filmeswebback.entities;

// corpo devolvido nas respostas HTTP 400; o front lê "mens" para avisar o usuário
public class Erro {
    private String mens;
    private String descricao;
    private String correcao;

    public Erro(String mens, String descricao, String correcao) {
        this.mens = mens;
        this.descricao = descricao;
        this.correcao = correcao;
    }

    public Erro(String mens) {
        this(mens,"","");
    }

    public String getMens() {
        return mens;
    }

    public void setMens(String mens) {
        this.mens = mens;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getCorrecao() {
        return correcao;
    }

    public void setCorrecao(String correcao) {
        this.correcao = correcao;
    }
}
