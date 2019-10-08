## Aula 07 - Estilos globais

Vamos usar o `createGlobalStyle` do styled-component para gerar o estilo global da aplicação:

```
import { createGlobalStyle } from 'styled-components';

export default createGlobalStyle`

@import url('https://fonts.googleapis.com/css?family=Roboto:400,700&display=swap');

* {
  margin: 0;
  padding: 0;
  outline: 0;
  box-sizing: border-box;
}

*:focus {
  outline: 0;
}

html, body, #root {
  height: 100%;

  body {
    -webkit-font-smoothing: antialiased;
  }

  body, input, button {
    font: 14px 'Roboto', sans-serif;
  }

  a {
    text-decoration: none;
  }

  ul {
    list-style: none;
  }

  button {
    cursor: pointer;
  }
}

`;
```

E aplicar no App.js

```
import './config/ReactotronConfig';
import React from 'react';
import { Router } from 'react-router-dom';
import Routes from './routes';
import history from './services/history';
import GlobalStyle from './styles/global';

function App() {
  return (
    <Router history={history}>
      <Routes />
      <GlobalStyle />
    </Router>
  );
}

export default App;
```


Código: [https://github.com/tgmarinho/gobarber-api/tree/aula-07-estilos-globais](https://github.com/tgmarinho/gobarber-api/tree/aula-07-estilos-globais)
