package unoeste.fipp.filmeswebback.restcontrollers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import unoeste.fipp.filmeswebback.entities.Erro;
import unoeste.fipp.filmeswebback.entities.Genero;
import unoeste.fipp.filmeswebback.repositories.GenerosRepositorio;

@CrossOrigin
@RestController
@RequestMapping(value = "apis")
public class GenerosRestController {

    @Autowired
    private GenerosRepositorio generosRepositorio;

    @GetMapping(value = "get-generos")
    public ResponseEntity<Object> allGeneros(){
        return ResponseEntity.ok(generosRepositorio.getGeneroList());
    }

    @GetMapping(value = "get-genero/{id}")
    public ResponseEntity<Object> getGeneroPath(@PathVariable int id){
        Genero genero=generosRepositorio.getGeneroId(id);
        if(genero!=null)
            return ResponseEntity.ok(genero);
        return ResponseEntity.badRequest().body(new Erro("gênero não encontrado"));
    }

    @GetMapping(value = "get-genero")
    public ResponseEntity<Object> getGenero(@RequestParam(value = "genero") String nome){
        Genero genero=generosRepositorio.getGeneroNome(nome);
        if(genero!=null)
            return ResponseEntity.ok(genero);
        return ResponseEntity.badRequest().body(new Erro("gênero não encontrado"));
    }
}
