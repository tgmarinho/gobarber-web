## Aula 16 - Loading da Autenticação

* Refatorei o reducers para não ter que ficar escrevendo toda vez:
```
return  produce(state, draft  => { ... }
```

* Criei mais dois cases no reducerde auth para REQUEST, SUCESSO e FAILURE.
* No SignIn peguei usando o useSelector, o estado do loading e fiz uma condição ternária para mostrar 'Carregando...' se o loading estiver `true` e 'Acessar' quando estiver `false`.
* No sagas eu coloquei um try/catch para capturar algum erro da API e disparar uma action de falha no signIn.

Para mais detalhes veja o código.

código: [https://github.com/tgmarinho/gobarber-api/tree/aula-16-loading-da-autenticacao](https://github.com/tgmarinho/gobarber-api/tree/aula-16-loading-da-autenticacao)
