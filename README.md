## Aula 11 - Validações

Vamos instalar e utilizar a biblioteca [yup](https://github.com/jquense/yup) que ajuda muito a validar tanto o frontend quanto o backend.

```
yarn add yup
```

O yup usa o padrão de schema validation, ela foi criada inspirada pelo [joi](https://github.com/hapijs/joi). Que é uma lib muito legal também para validação.

Vamos validar o SignUp:

```
import  *  as Yup from  'yup';

const schema = Yup.object().shape({
  name: Yup.string().required('O nome é obrigatório'),
  email: Yup.string()
    .email('Insira um email válido')
    .required('O Email é obrigatório'),
  password: Yup.string()
    .min(6, 'A senha precisa de ter 6 caracteres no mínimo')
    .required('A Senha é obrigatória'),
});

<Form  schema={schema}  onSubmit={handleSubmit}>
...
</Form>
```

Pronto, que legal, estamos com validação em cada campo usando schema validation.

Quando dá algum erro é lançado uma mensagem de erro na tela do usuário conforme escrevemos no código, e podemos estilizar esse span, e é o que fizemos aqui:

`src/pages/_layout/auth/styles.js`:
```
  span {
      color: #fb6f91;
      align-self: flex-start;
      margin: 0 0 10px;
      font-weight: bold;
    }
```

Agora a mensagem aparece na tela bem mais bonita!

Veja o restante do código, abaixo!

código: [https://github.com/tgmarinho/gobarber-api/tree/aula-11-validacoes](https://github.com/tgmarinho/gobarber-api/tree/aula-11-validacoes)
