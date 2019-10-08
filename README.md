
## Aula 05 - Rotas privadas

Do jeito que está a aplicação, podemos acessar todas as rotas mesmo não estando logado, agora o que iremos fazer é controlar as rotas, verificando se o usuário está logado ou não.

Vamos criar um arquivo chamado `Route.js` que vai ser um wrapper do Route do react-router-dom:

Vamos criar uma função RouteWrapper que recebe as props do componente que irá utilizar esse componente RouteWrapper, ele recebe a prop Component, isPrivate e o restante que tiver será passada no ...rest.

Se o usuário não estiver auteticado e a rota for privada ele é redirecionado para o /.

Se ele estiver logado e a rota não é privada, ele vai para o dashboard, para as demais condições ele vai para Route com o seu respectivo componente.

```
import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';

export default function RouteWrapper({
  component: Component,
  isPrivate = false,
  ...rest
}) {
  const signed = true;

  if (!signed && isPrivate) {
    return <Redirect to="/" />;
  }

  if (signed && !isPrivate) {
    return <Redirect to="/dashboard" />;
  }

  return <Route {...rest} component={Component} />;
}

RouteWrapper.propTypes = {
  isPrivate: PropTypes.bool,
  component: PropTypes.oneOfType([PropTypes.element, PropTypes.func])
    .isRequired,
};

RouteWrapper.defaultProps = {
  isPrivate: false,
};
```

E no arquivo index.js da pasta routes eu salvo uso esse componente em vez de usar o Route do react-router-dom:

```
import React from 'react';
import { Switch } from 'react-router-dom';
import SignIn from '../pages/SignIn';
import SignUp from '../pages/SignUp';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';

import Route from './Route';

export default function Routes() {
  return (
    <Switch>
      <Route path="/" exact component={SignIn} />
      <Route path="/register" component={SignUp} />
      <Route path="/dashboard" component={Dashboard} isPrivate />
      <Route path="/profile" component={Profile} isPrivate />
    </Switch>
  );
}

```

Pronto, só testar!


Código: [https://github.com/tgmarinho/gobarber-api/tree/aula-05-rotas-privadas](https://github.com/tgmarinho/gobarber-api/tree/aula-05-rotas-privadas)


