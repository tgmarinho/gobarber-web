## Aula 19 - Requisições autenticadas

Algumas rotas que formos acessar da nossa API temos que estar autenticado e enviando um token de autenticação.

E para fazer isso precisamos disponibilizar o token no header de Authorization da nossa chamada post da api do axios.

Portanto, assim que fizermos o login iremos inserir o `Baerer token` no `api.defaults.headers.Authorization`

```
 api.defaults.headers.Authorization = `Baerer ${token}`;
```

Porém se o usuário fazer o refresh ele vai perder esse header.

Para deixar isso fixo podemos fazer com que o saga ouça a action `persist/REHYDRATE` que possue o payload de users e auth que contém o token.

```
takeLatest('persist/REHYDRATE', setToken),
```

Essa action executa o `setToken` para que ele faça a mesma coisa que fizemos acima, adicionando o baerer no header.

Essa action busca os dados do localStorage e o token está lá e é disponibilizado:
```
export function setToken({ payload }) {
  if (!payload) return;
  const { token } = payload.auth;
  if (token) {
    api.defaults.headers.Authorization = `Baerer ${token}`;
  }
}
```

Código completo do saga:
```
import { takeLatest, call, put, all } from 'redux-saga/effects';
import { toast } from 'react-toastify';
import api from '~/services/api';
import history from '~/services/history';
import { signInSuccess, signFailure } from './actions';

export function* signIn({ payload }) {
  try {
    const { email, password } = payload;
    const response = yield call(api.post, 'sessions', {
      email,
      password,
    });

    const { token, user } = response.data;

    if (!user.provider) {
      toast.error('usuario nao é prestador de servico');
      return;
    }

    api.defaults.headers.Authorization = `Baerer ${token}`;

    yield put(signInSuccess(token, user));

    history.push('/dashboard');
  } catch (err) {
    toast.error('Falha na autenticação, verifique seu email/senha');
    yield put(signFailure());
  }
}

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

export function setToken({ payload }) {
  if (!payload) return;
  const { token } = payload.auth;
  if (token) {
    api.defaults.headers.Authorization = `Baerer ${token}`;
  }
}

export default all([
  takeLatest('persist/REHYDRATE', setToken),
  takeLatest('@auth/SIGN_IN_REQUEST', signIn),
  takeLatest('@auth/SIGN_UP_REQUEST', signUp),
]);

```

Para testar isso ai fizemos uma chamada simples no dashboard:

```
import React from 'react';
import api from '~/services/api';
// import { Container } from './styles';

export default function Dashboard() {
  api.get('appointments');

  return <h1>Dashboard</h1>;
}
```

E na aba network do chrome eu consegui ver um status 204 da rota `appointments`, ou seja, deu certo!


código: [https://github.com/tgmarinho/gobarber-api/tree/aula-19-requisicoes-autenticadas](https://github.com/tgmarinho/gobarber-api/tree/aula-19-requisicoes-autenticadas)

