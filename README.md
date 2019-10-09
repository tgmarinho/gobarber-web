## Aula 18 - Cadastro na aplicação

Agora criar um cadastro novo do GoBarberWeb

* Criei uma action nova `signUpRequest` que recebe nome, email e senha do usuário
* No saga criei uma nova função signUp que ouve as chamadas da action de SIGN_UP_REQUEST:
```
export function* signUp({ payload }) {
  try {
    const { name, email, password } = payload;

    yield call(api.post, 'users', {
      name,
      email,
      password,
      provider: true,
    });

    history.push('/');
  } catch (err) {
    toast.error('Falha no cadastro verifique seus dados!');
    yield put(signFailure());
  }
}

export default all([
  takeLatest('@auth/SIGN_IN_REQUEST', signIn),
  takeLatest('@auth/SIGN_UP_REQUEST', signUp),
]);
```

* E no index.js do componente SignUp disparei a action com os dados do usuário.

código: [https://github.com/tgmarinho/gobarber-api/tree/aula-18-cadastro-na-aplicacao](https://github.com/tgmarinho/gobarber-api/tree/aula-18-cadastro-na-aplicacao)
