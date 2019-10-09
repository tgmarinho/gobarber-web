## Aula 15 - Persistindo autenticação

Vamos armazenas os dados de autenticação no storage do navegador para que não se perca quando fizer refresh no navegador.

Vamos utilizar uma lib para auxiliar com isso:
```
yarn add redux-persist
```

O [redux-persist](https://github.com/rt2zz/redux-persist) pode ser integrado ao localStorage do navegador, AsyncStorage do App Mobile com React Native e também com alguns bancos locais.

Então vamos integrar com a nossa aplicação:

Criamos um arquivo `persistReducers.js` dentro de `src/store`:

```
import storage from 'redux-persist/lib/storage';
import { persistReducer } from 'redux-persist';

export default reducers => {
  const persistedReducer = persistReducer(
    {
      key: 'gobarber',
      storage,
      whitelist: ['auth', 'user'],
    },
    reducers
  );

  return persistedReducer;
};
```

Importamos o storage do redux-persist e também o persistReducer do redux-persist.

e criamos uma função que recebe os reducers como parâmetro, criamos uma const persistedReducers que será o retorno da função. com o método persistReducer passamos um objeto de configuração contendo a chave que será o nome da chave do localStorage, passamos a implementação do storage que importamos do redux-persist e também passamos uma whitelist que são os nomes dos reducers que iremos amarzenar (persistir) no localStorage. E por fim retornamos a função. Tudo isso está na documentação da biblioteca.

Agora vamos usar essa função no arquivo `index.js` do `src/store`:

```
import { persistStore } from 'redux-persist';
import createSagaMiddleware from 'redux-saga';
import createStore from './createStore';
import persistReducers from './persistReducers';
import rootReducer from './modules/rootReducer';
import rootSaga from './modules/rootSaga';

const middlewares = [];

const sagaMonitor =
  process.env.NODE_ENV === 'development'
    ? console.tron.createSagaMonitor()
    : null;

const sagaMiddleware = createSagaMiddleware({ sagaMonitor });

middlewares.push(sagaMiddleware);

const store = createStore(persistReducers(rootReducer), middlewares);
const persistor = persistStore(store);

sagaMiddleware.run(rootSaga);

export { store, persistor };
```

Eu importei `persistStore` da lib `redux-persist` e o `persistReducers` do arquivo `persistReducers` que criamos.

Invocamos a função perstiReducers passando o rootReducer com todos os reducers, na criação do store:

```
const store = createStore(persistReducers(rootReducer), middlewares);
```

Criamos uma constante persistor que recebe um objeto que é retornado do persistStore(store), que é responsável pela reidratação de pegar os dados do localStorage e disponibilizar no reducers.

```
const persistor = persistStore(store);
```

E por fim exportamos duas variáveis, a store e persistor:

```
export { store, persistor };
```

E com isso a aplicação vai quebrar devido a esse export não ser mais default, temos que importar individualmente o store e o persistor.

Então no no Route.js e no App.js corrigimos isso:

`Route.js`:
```
...
import { store } from  '~/store';
...
```

`App.js`:
```
import './config/ReactotronConfig';
import React from 'react';
import { PersistGate } from 'redux-persist/integration/react';
import { Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import Routes from './routes';
import history from './services/history';
import GlobalStyle from './styles/global';
import { store, persistor } from './store';

function App() {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <Router history={history}>
          <Routes />
          <GlobalStyle />
        </Router>
      </PersistGate>
    </Provider>
  );
}

export default App;
```

Aqui mudamos um pouco, importamos o store e persistor e também o component PersistGate do redux-persist.

Envolvemos a aplicação sobre o PersistGate passando a propriedade persistor com o nosso persistor.

```
 <PersistGate persistor={persistor}>
   <Router history={history}>
      <Routes />
      <GlobalStyle />
   </Router>
</PersistGate>
```

Agora a aplicação volta a funcionar, quando o usário logar na aplicação todo o fluxo de persistir no localStorage os reducers da whiteList vai funcionar, e quando sair da aplicação  ele continuará logado, pois ele perde os dados e busca do localStorage.

LocalStorage:
```
{,…}
auth: "{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImlhdCI6MTU3MDYyOTY0NywiZXhwIjoxNTcxMjM0NDQ3fQ.8_7pqc7Ds2yudoPNr0r3NO_DnH2t9fgMOwxvIRuqwRs","signed":true,"loading":false}"
user: "{"profile":{"id":10,"name":"Avatolino Cliente","email":"avatar@gmail.com","provider":true,"avatar":null}}"
_persist: "{"version":-1,"rehydrated":true}"
```
![](https://github.com/tgmarinho/Images/blob/master/bootcamp-rocketseat/gobarber-web-localstorage-redux-persist.png?raw=true)

Reactotron:

![](https://github.com/tgmarinho/Images/blob/master/bootcamp-rocketseat/gobarber-web-reactotron-redux-persist.png?raw=true)

Pronto, agora o fluxo de login ficou bem automatizado.

código: [https://github.com/tgmarinho/gobarber-api/tree/aula-15-persistindo-autenticacao](https://github.com/tgmarinho/gobarber-api/treeaula-15-persistindo-autenticacao)
