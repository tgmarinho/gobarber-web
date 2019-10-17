Vamos construir o GoBarber WEB que vai consumir a API Rest Gobarber Backend em NodeJS, vamos controlar rotas privadas, fazer a autenticação JWT e receber um token de autenticação. A autenticação do usuário vai ficar guardada no Redux para sempre que precisarmos do usuário logado, ter acesso ao Nome e Avatar.

## Aula 01 - Estrutura do projeto
Para começar vamos criar um projeto com `create-react-app`:
```npx create-react-app gobarber-web```
Instalo e configuro o `eslint`:
```yarn add eslint -D  ```
Executo o eslint init com os seguintes parâmetros de configuração:
```gobarber-web on  master [!] took 8s ❯ yarn eslint --inityarn run v1.12.0$ /Users/tgmarinho/Developer/bootcamp_rocketseat_studies/gobarber-web/node_modules/.bin/eslint --init? How would you like to use ESLint? To check syntax, find problems, and enforce code style? What type of modules does your project use? JavaScript modules (import/export)? Which framework does your project use? React? Does your project use TypeScript? No? Where does your code run? (Press <space> to select, <a> to toggle all, <i> to invert selection)Browser? How would you like to define a style for your project? Use a popular style guide? Which style guide do you want to follow? Airbnb (https://github.com/airbnb/javascript)? What format do you want your config file to be in? JavaScript? Would you like to install them now with npm? Yes```
Deixo baixando tudo!
Removo o `package-look.json` e rodo `yarn` para atualizar o `yarn-lock.json` uma vez que estou usando apenase o Yarn.
Instalo as dependências do prettier e babel:
```❯ yarn add babel-eslint prettier eslint-plugin-prettier eslint-config-prettier -D```
E configuro o `.eslintrc.js`:
```module.exports = {  env: {    es6: true,    jest: true,    browser: true  },  extends: ["airbnb", "prettier", "prettier/react"],  globals: {    Atomics: "readonly",    SharedArrayBuffer: "readonly",    __DEV__: true  },  parserOptions: {    ecmaFeatures: {      jsx: true    },    ecmaVersion: 2018,    sourceType: "module"  },  plugins: ["react", "jsx-a11y", "import", "react-hooks", "prettier"],  rules: {    "prettier/prettier": "error",    "react/jsx-filename-extension": ["error", { extensions: [".js", ".jsx"] }],    "import/prefer-default-export": "off",    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],    "react/jsx-one-expression-per-line": "off",    "global-require": "off",    "react-native/no-raw-text": "off",    "no-param-reassign": "off",    "no-underscore-dangle": "off",    camelcase: "off",    "no-console": ["error", { allow: ["tron"] }],    "react-hooks/rules-of-hooks": "error",    "react-hooks/exhaustive-deps": "warn"  },  settings: {    "import/resolver": {      "babel-plugin-root-import": {        rootPathSuffix: "src"      },    },  },};```
Removi alguns arquivos desnecessários, veja no github, e deixei o App.js com uma div apenas.
Rode o comando `yarn start` para conferir está funcionando, uma tela branca deve aparecer.
Código: [https://github.com/tgmarinho/gobarber-web/tree/aula-01-estrutura-projeto](https://github.com/tgmarinho/gobarber-web/tree/aula-01-estrutura-projeto)

## Aula 02 - Ajustes na API
Vamos precisar ajustar a API, no backend gobarber.
Vamos instalar o `cors` da aplicação para que o frontend possa acessar a nossa api.
```yarn add cors```
E vamos usá-lo no arquivo `app.js`:

```  middlewares() {    this.server.use(Sentry.Handlers.requestHandler());    this.server.use(cors());    this.server.use(express.json());    this.server.use(      '/files',      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))    );  }  ```
Como estamos em desenvolvimento não vamos passar parâmetro, mas quando estivermos em produção podemos colocar o ip ou endereço:
```this.server.use(cors({'www.meuapp.com.br'}));```
Pronto, agora no login do usuário temos que pegar o avatar dele, 
então vamos mudar a `SessionController.js` para poder pegar o avatar do usuário:
```import * as Yup from 'yup';import jwt from 'jsonwebtoken';import authConf from '../../config/auth';import User from '../models/User';import File from '../models/File';
class SessionController {  async store(req, res) {    const schema = Yup.object().shape({      email: Yup.string()        .email()        .required(),      password: Yup.string().required(),    });
    if (!(await schema.isValid(req.body))) {      return res.status(400).json({ error: 'Validation fails' });    }
    const { email, password } = req.body;
    const user = await User.findOne({      where: { email },      include: [        {          model: File,          as: 'avatar',          attributes: ['id', 'path', 'url'],        },      ],    });    if (!user) {      return res.status(401).json({ error: 'User not found' });    }
    if (!(await user.checkPassword(password))) {      return res.status(401).json({ error: 'Password does not match!' });    }
    const { id, name, avatar } = user;
    return res.json({      user: {        id,        name,        email,        avatar,      },      token: jwt.sign({ id }, authConf.secret, {        expiresIn: authConf.expireIn,      }),    });  }}
export default new SessionController();```
Para testar tem que estar o banco de dados executando na aplicação, e no Insomnia e testar a aplicação.
E precisamos do avatar no UserController.js quando o usuário editar o perfil, o avatar pode ser alterado também:
```import * as Yup from 'yup';import User from '../models/User';import File from '../models/File';
class UserController {  async store(req, res) {    const schema = Yup.object().shape({      name: Yup.string().required(),      email: Yup.string()        .email()        .required(),      password: Yup.string()        .required()        .min(6),    });
    if (!(await schema.isValid(req.body))) {      return res.status(400).json({ error: 'Validation fails' });    }
    const userExists = await User.findOne({ where: { email: req.body.email } });    if (userExists) {      return res.status(400).json({ error: 'User already exists.' });    }    const { id, name, email, provider } = await User.create(req.body);    return res.json({ id, name, email, provider });  }
  async update(req, res) {    const schema = Yup.object().shape({      name: Yup.string(),      email: Yup.string().email(),      oldPassword: Yup.string().min(6),      password: Yup.string()        .min(6)        .when('oldPassword', (oldPassword, field) =>          oldPassword ? field.required() : field        ),      confirmPassword: Yup.string().when('password', (password, field) =>        password ? field.required().oneOf([Yup.ref('password')]) : field      ),    });
    if (!(await schema.isValid(req.body))) {      return res.status(400).json({ error: 'Validation fails' });    }
    const { email, oldPassword } = req.body;    const user = await User.findByPk(req.userId);    if (user.email !== email) {      const userExists = await User.findOne({        where: { email },      });      if (userExists) {        return res.status(400).json({ error: 'User already exists.' });      }    }    // só faço isso se ele informou a senha antiga, isto é, quer alterar a senha    if (oldPassword && !(await user.checkPassword(oldPassword))) {      return res.status(401).json({ error: 'Password does not match.' });    }
    await user.update(req.body);
    const { id, name, avatar, provider } = await User.findByPk(req.userId, {      include: [        {          model: File,          as: 'avatar',          attributes: ['id', 'path', 'url'],        },      ],    });
    return res.json({ id, name, email, avatar, provider });  }}
export default new UserController();```

Última alteração vai ser no ScheduleController.js onde listaremos também o nome do usuário.
```...    const appointments = await Appointment.findAll({      where: {        provider_id: req.userId,        canceled_at: null,        date: {          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],        },      },      include: [        {          model: User,          as: 'user',          attributes: ['name'],        },      ],      order: ['date'],    });...```
Agora para continuar  o desenvolvimento do frontend, temos que estar com o backend executando para podermos consumir a API.
No meu caso eu inicio o meu docker com o container do redis e mongo e postgres: 
```docker  start 3532f285cba4 b2c4654e6eda df1c4429c0a3```
E na aplicação:
```yarn dev```
Código: [https://github.com/tgmarinho/gobarber-api/tree/aula-40-ajustes-na-api](https://github.com/tgmarinho/gobarber-api/tree/aula-40-ajustes-na-api)

## Aula 03 - Configurando rotas
Quando falamos em rotas com React, já pensamos em React Router Dom, e sim vamos comecar instalando ele:
```yarn add react-router-dom```
E na pasta `src` vamos criar as pastas `pages`, `services` e `routes`  e um arquivo `index.js` dentro da pasta route e da pasta `services` um arquivo `history.js`. Na pasta `pages` vamos criar os arquivos `Dashboard`, `Profile`, `SignIn`, `SignUp`, cada pasta com seu respectivo arquivo `index.js`  e usando o snippets da Rocketseat vamos criar um conteúdo: `rfc` enter e pronto, só salvar o componente que foi criado.
Veja no código a configuração das rotas e do history.
Código: [https://github.com/tgmarinho/gobarber-web/tree/aula-02-configurando-rotas](https://github.com/tgmarinho/gobarber-web/tree/aula-02-configurando-rotas)
## Aula 04 - Configurando o Reactotron
A configuração do Reactotron pode ser vista no código, já postei vários artigos de como fazer.
Código: [https://github.com/tgmarinho/gobarber-web/tree/aula-04-configurando-reactotron](https://github.com/tgmarinho/gobarber-web/tree/aula-04-configurando-reactotron)

## Aula 05 - Rotas privadas
Do jeito que está a aplicação, podemos acessar todas as rotas mesmo não estando logado, agora o que iremos fazer é controlar as rotas, verificando se o usuário está logado ou não.
Vamos criar um arquivo chamado `Route.js` que vai ser um wrapper do Route do react-router-dom:
Vamos criar uma função RouteWrapper que recebe as props do componente que irá utilizar esse componente RouteWrapper, ele recebe a prop Component, isPrivate e o restante que tiver será passada no ...rest.
Se o usuário não estiver auteticado e a rota for privada ele é redirecionado para o /.
Se ele estiver logado e a rota não é privada, ele vai para o dashboard, para as demais condições ele vai para Route com o seu respectivo componente.
```import React from 'react';import PropTypes from 'prop-types';import { Route, Redirect } from 'react-router-dom';
export default function RouteWrapper({  component: Component,  isPrivate = false,  ...rest}) {  const signed = true;
  if (!signed && isPrivate) {    return <Redirect to="/" />;  }
  if (signed && !isPrivate) {    return <Redirect to="/dashboard" />;  }
  return <Route {...rest} component={Component} />;}
RouteWrapper.propTypes = {  isPrivate: PropTypes.bool,  component: PropTypes.oneOfType([PropTypes.element, PropTypes.func])    .isRequired,};
RouteWrapper.defaultProps = {  isPrivate: false,};```
E no arquivo index.js da pasta routes eu salvo uso esse componente em vez de usar o Route do react-router-dom:
```import React from 'react';import { Switch } from 'react-router-dom';import SignIn from '../pages/SignIn';import SignUp from '../pages/SignUp';import Dashboard from '../pages/Dashboard';import Profile from '../pages/Profile';
import Route from './Route';
export default function Routes() {  return (    <Switch>      <Route path="/" exact component={SignIn} />      <Route path="/register" component={SignUp} />      <Route path="/dashboard" component={Dashboard} isPrivate />      <Route path="/profile" component={Profile} isPrivate />    </Switch>  );}
```
Pronto, só testar!

Código: [https://github.com/tgmarinho/gobarber-web/tree/aula-05-rotas-privadas](https://github.com/tgmarinho/gobarber-web/tree/aula-05-rotas-privadas)

## Aula 06 - Layouts por página
Vamos organizar os layouts da aplicação que são genéricos nas telas de Login e SignUp, vamos usar o styled-components para estilizar as telas.
```yarn add styled-components```
E o restante é estilização.
Só no arquivo Route.js que fiz uma lógica para mostrar o DefaultLayout ou AuthLayout, baseado na condição se o usuário está logado ou não.
```import React from 'react';import PropTypes from 'prop-types';import { Route, Redirect } from 'react-router-dom';
import AuthLayout from '../pages/_layouts/auth';import DefaultLayout from '../pages/_layouts/default';
export default function RouteWrapper({  component: Component,  isPrivate = false,  ...rest}) {  const signed = false;
  if (!signed && isPrivate) {    return <Redirect to="/" />;  }
  if (signed && !isPrivate) {    return <Redirect to="/dashboard" />;  }
  const Layout = signed ? DefaultLayout : AuthLayout;
  return (    <Route      {...rest}      render={props => (        <Layout>          <Component {...props} />        </Layout>      )}    />  );}
RouteWrapper.propTypes = {  isPrivate: PropTypes.bool,  component: PropTypes.oneOfType([PropTypes.element, PropTypes.func])    .isRequired,};
RouteWrapper.defaultProps = {  isPrivate: false,};```
O restante do código pode ser visto no branch do github.

Código: [https://github.com/tgmarinho/gobarber-web/tree/aula-06-layouts-por-pagina](https://github.com/tgmarinho/gobarber-web/tree/aula-06-layouts-por-pagina)
## Aula 07 - Estilos globais
Vamos usar o `createGlobalStyle` do styled-component para gerar o estilo global da aplicação:
```import { createGlobalStyle } from 'styled-components';
export default createGlobalStyle`
@import url('https://fonts.googleapis.com/css?family=Roboto:400,700&display=swap');
* {  margin: 0;  padding: 0;  outline: 0;  box-sizing: border-box;}
*:focus {  outline: 0;}
html, body, #root {  height: 100%;
  body {    -webkit-font-smoothing: antialiased;  }
  body, input, button {    font: 14px 'Roboto', sans-serif;  }
  a {    text-decoration: none;  }
  ul {    list-style: none;  }
  button {    cursor: pointer;  }}
`;```
E aplicar no App.js
```import './config/ReactotronConfig';import React from 'react';import { Router } from 'react-router-dom';import Routes from './routes';import history from './services/history';import GlobalStyle from './styles/global';
function App() {  return (    <Router history={history}>      <Routes />      <GlobalStyle />    </Router>  );}
export default App;```

Código: [https://github.com/tgmarinho/gobarber-web/tree/aula-07-estilos-globais](https://github.com/tgmarinho/gobarber-web/tree/aula-07-estilos-globais)


## Aula 08 - Utilizando Root import
Ao invés de ficarmos fazendo import passando `../../../MinhaPasta/MeuArquivo.js` podemos fazer algo melhor utilizando uma lib para resolver os caminhos pra gente, mas antes disso precisamos customizar o Create React App para configurar o babel.
Para isso vamos instalar:
```yarn add customize-cra react-app-rewired -D```E também vamos instalar:
```yarn add babel-plugin-root-import -D```
E criar um arquivo `config-overrides.js` na raiz do projeto:
```const { addBabelPlugin, override } = require('customize-cra');
module.exports = override(  addBabelPlugin([    'babel-plugin-root-import',    {      rootPathSuffix: 'src',    },  ]));```
Estamos importando a função addBabelPlugin e override, vamos exportar essa configuração, sobrescrevendo com o override passando o plugin do babel que quremos em um array, o primeiro parâmetro é o nome do plugin e depois um objeto com a configuração, nesse caso passamos o rootPathSuffix `src` que é onde estão os nosso códigos javascript do projeto onde iremos fazer import e export.
Com isso agora podemos fazer os imports assim:
```import AuthLayout from '~/pages/_layouts/auth';import DefaultLayout from '~/pages/_layouts/default';```Esse sinal de `~` representa qualquer nível `../../../` até o `src` como sendo o primeiro nível.
E para testar e funcionar vamos trocar os scripts do package.json:
```"scripts": {    "start": "react-app-rewired start",    "build": "react-app-rewired build",    "test": "react-app-rewired test",    "eject": "react-scripts eject",    "lint": "eslint --fix src --ext .js"  },```
e agora só executar `yarn start` e ver se tudo funcionou! =)
Mas o eslint está chiando alguns erros aqui...
Vamos instalar essa lib com o nome gigante para que o eslint ententa o `~` que estamos usando para fazer o import.
``` yarn add eslint-import-resolver-babel-plugin-root-import ```
e no arquivo `.eslintrc.js`:
colocamos um configuração:
```settings: {    'import/resolver': {      'babel-plugin-root-import': {        rootPathSuffix: 'src',      },    },  },```
Agora o eslint não reclama mais, só rodar `yarn lint` no terminal.
Mas agora se pressionar o teclado ctrl ou cmd e clicar no caminho do arquivo, ele não está acessando mais o arquivo.
```import AuthLayout from  '~/pages/_layouts/auth';```Para resolver isso criaremos um arquivo `jsconfig.json` com o seguinte conteúdo:
```{  "compilerOptions": {    "baseUrl": "src",    "paths": { "~/*": ["*"] }  }}```
Agora ele vai entender as importações e conseguiremos navegar nos as arquivos.

Código: [https://github.com/tgmarinho/gobarber-web/tree/aula-08-utilizando-root-import](https://github.com/tgmarinho/gobarber-web/tree/aula-08-utilizando-root-import)

## Aula 09 - Estilização da página de autenticação
Vamos estilizar a página de Login e cadastro da aplicação.
Veja o código: [https://github.com/tgmarinho/gobarber-web/tree/aula-09-estilizacao-da-page-autenticacao](https://github.com/tgmarinho/gobarber-web/tree/aula-09-estilizacao-da-page-autenticacao)

## Aula 10 - Utilizando Unform
Para fazer a manipulação de estados precisaríamos converter a função em classe ou usar os Hooks e criar uma estado para cada input do formulário. A Rocketseat criou uma lib performática para lidar com formulários, [https://github.com/Rocketseat/unform](https://github.com/Rocketseat/unform), que iremos usar nesse projeto, vamos instalar então:
```yarn add @rocketseat/unform ```
E agora só utilizar:
```import React from 'react';import { Link } from 'react-router-dom';import { Form, Input } from '@rocketseat/unform';import logo from '~/assets/logo.svg';
export default function SignIn() {  function handleSubmit(data) {    console.tron.log(data);  }
  return (    <>      <img src={logo} alt="GoBarberWeb" />      <Form onSubmit={handleSubmit}>        <Input name="email" type="email" placeholder="Seu e-mail" />        <Input          name="password"          type="password"          placeholder="Sua senha secreta"        />
        <button type="submit">Acessar</button>        <Link to="/register">Criar conta gratuíta</Link>      </Form>    </>  );}```
Muito interessante que basta passar o atributo `name` nos inputs e colocar um `onSubmit` com uma função e todos os dados preenchidos no formulário serão passados para a função na variável `data` podemos ter acesso a todos valores preenchidos.
Veja como ficou limpo, não precisei de um:
```const [name, setName] = useState('');const [email, setEmail] = useState('');const [password, setPassword] = useState('');```
e nem precisei fazer `setPassword(e.target.value)`, etc.
O que já era bom ficou ainda melhor!
Outras alternativas no mercado para lidar com formulário é:
* [https://jaredpalmer.com/formik/docs/overview](https://jaredpalmer.com/formik/docs/overview)* [https://redux-form.com/](https://redux-form.com/)* [https://react-hook-form.com](https://react-hook-form.com/)
React Hook Form me parece uma boa, além do Unform da Rocketseat.
Veja no código as outras alterações.
código: [https://github.com/tgmarinho/gobarber-web/tree/aula-10-utilizando-unform](https://github.com/tgmarinho/gobarber-web/tree/aula-10-utilizando-unform)
## Aula 11 - Validações
Vamos instalar e utilizar a biblioteca [yup](https://github.com/jquense/yup) que ajuda muito a validar tanto o frontend quanto o backend.
```yarn add yup```
O yup usa o padrão de schema validation, ela foi criada inspirada pelo [joi](https://github.com/hapijs/joi). Que é uma lib muito legal também para validação.
Vamos validar o SignUp:
```import * as Yup from  'yup';
const schema = Yup.object().shape({  name: Yup.string().required('O nome é obrigatório'),  email: Yup.string()    .email('Insira um email válido')    .required('O Email é obrigatório'),  password: Yup.string()    .min(6, 'A senha precisa de ter 6 caracteres no mínimo')    .required('A Senha é obrigatória'),});
<Form  schema={schema}  onSubmit={handleSubmit}>...</Form>```
Pronto, que legal, estamos com validação em cada campo usando schema validation.
Quando dá algum erro é lançado uma mensagem de erro na tela do usuário conforme escrevemos no código, e podemos estilizar esse span, e é o que fizemos aqui:
`src/pages/_layout/auth/styles.js`:```  span {      color: #fb6f91;      align-self: flex-start;      margin: 0 0 10px;      font-weight: bold;    }```
Agora a mensagem aparece na tela bem mais bonita!
Veja o restante do código, abaixo!
código: [https://github.com/tgmarinho/gobarber-web/tree/aula-11-validacoes](https://github.com/tgmarinho/gobarber-web/tree/aula-11-validacoes)

## Aula 12 - Configurando Store do Redux
A autenticação do usuário vamos fazer pelo Redux e armazenar o token e os dados do usuário logado, e acessar esses dados em vários locais.
Vamos instalar todas as libs necessárias:```yarn add redux redux-saga react-redux reactotron-redux reactotron-redux-saga immer ```
Todo o código de configuração do Redux e Redux Saga a integração com React-Redux está no código, e foram explicadas em posts anteriores, [https://www.tgmarinho.com/arquitetura_flux/](https://www.tgmarinho.com/arquitetura_flux/)
código: [https://github.com/tgmarinho/gobarber-web/tree/aula-12-configurando-store](https://github.com/tgmarinho/gobarber-web/tree/aula-12-configurando-store)

## Aula 13 -Autenticação
Implementação do login, porém ainda não estou salvando os dados do usuário e nem o token permanentemente em uma local, quando eu faço um refresh na página perco o store e o dados.
código: [https://github.com/tgmarinho/gobarber-web/tree/aula-13-autenticacao](https://github.com/tgmarinho/gobarber-web/tree/aula-13-autenticacao)

## Aula 14 - Armazenando o perfil
Vamos armazenar os dados do usuário em um outro reducer chamado user.
Dois reducers podem ouvir as mesmas actions, tanto o `user` quanto `auth` irão ouvir a action: `@auth/SIGN_IN_SUCCESS` e vão fazer alguma coisa com esse dado, ambas vão armazenar no seu estado, os respectivos valores que lhe fazem sentido. Embora o user venha na autenticação eu armazeno ele na user pois quando alterarmos o  perfil não estaremos lidando om autenticação.
código: [https://github.com/tgmarinho/gobarber-web/tree/aula-14-armazenando-perfil](https://github.com/tgmarinho/gobarber-web/tree/aula-14-armazenando-perfil)

## Aula 15 - Persistindo autenticação
Vamos armazenar os dados de autenticação no storage do navegador para que não se perca quando fizer refresh no navegador.
Vamos utilizar uma lib para auxiliar com isso:```yarn add redux-persist                                                            ```
O [redux-persist](https://github.com/rt2zz/redux-persist) pode ser integrado ao localStorage do navegador, AsyncStorage do App Mobile com React Native e também com alguns bancos locais.
Então vamos integrar com a nossa aplicação:
Criamos um arquivo `persistReducers.js` dentro de `src/store`:
```import storage from 'redux-persist/lib/storage';import { persistReducer } from 'redux-persist';
export default reducers => {  const persistedReducer = persistReducer(    {      key: 'gobarber',      storage,      whitelist: ['auth', 'user'],    },    reducers  );
  return persistedReducer;};```
Importamos o storage do redux-persist e também o persistReducer do redux-persist.
e criamos uma função que recebe os reducers como parâmetro, criamos uma const persistedReducers que será o retorno da função. com o método persistReducer passamos um objeto de configuração contendo a chave que será o nome da chave do localStorage, passamos a implementação do storage que importamos do redux-persist e também passamos uma whitelist que são os nomes dos reducers que iremos armazenar (persistir) no localStorage. E por fim retornamos a função. Tudo isso está na documentação da biblioteca.
Agora vamos usar essa função no arquivo `index.js` do `src/store`:
```import { persistStore } from 'redux-persist';import createSagaMiddleware from 'redux-saga';import createStore from './createStore';import persistReducers from './persistReducers';import rootReducer from './modules/rootReducer';import rootSaga from './modules/rootSaga';
const middlewares = [];
const sagaMonitor =  process.env.NODE_ENV === 'development'    ? console.tron.createSagaMonitor()    : null;
const sagaMiddleware = createSagaMiddleware({ sagaMonitor });
middlewares.push(sagaMiddleware);
const store = createStore(persistReducers(rootReducer), middlewares);const persistor = persistStore(store);
sagaMiddleware.run(rootSaga);
export { store, persistor };```
Eu importei `persistStore` da lib `redux-persist` e o `persistReducers` do arquivo `persistReducers` que criamos.
Invocamos a função perstiReducers passando o rootReducer com todos os reducers, na criação do store:
```const store = createStore(persistReducers(rootReducer), middlewares);```
Criamos uma constante persistor que recebe um objeto que é retornado do persistStore(store), que é responsável pela reidratação de pegar os dados do localStorage e disponibilizar no reducers.
```const persistor = persistStore(store);```
E por fim exportamos duas variáveis, a store e persistor:
```export { store, persistor };```
E com isso a aplicação vai quebrar devido a esse export não ser mais default, temos que importar individualmente o store e o persistor.
Então no no Route.js e no App.js corrigimos isso:
`Route.js`:```...import { store } from  '~/store';...```
`App.js`:```import './config/ReactotronConfig';import React from 'react';import { PersistGate } from 'redux-persist/integration/react';import { Router } from 'react-router-dom';import { Provider } from 'react-redux';import Routes from './routes';import history from './services/history';import GlobalStyle from './styles/global';import { store, persistor } from './store';
function App() {  return (    <Provider store={store}>      <PersistGate persistor={persistor}>        <Router history={history}>          <Routes />          <GlobalStyle />        </Router>      </PersistGate>    </Provider>  );}
export default App;```
Aqui mudamos um pouco, importamos o store e persistor e também o component PersistGate do redux-persist.
Envolvemos a aplicação sobre o PersistGate passando a propriedade persistor com o nosso persistor.
``` <PersistGate persistor={persistor}>   <Router history={history}>      <Routes />      <GlobalStyle />   </Router></PersistGate>```
Agora a aplicação volta a funcionar, quando o usuário logar na aplicação todo o fluxo de persistir no localStorage os reducers da whiteList vai funcionar, e quando sair da aplicação  ele continuará logado, pois ele perde os dados e busca do localStorage.
LocalStorage:```{,…}auth: "{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImlhdCI6MTU3MDYyOTY0NywiZXhwIjoxNTcxMjM0NDQ3fQ.8_7pqc7Ds2yudoPNr0r3NO_DnH2t9fgMOwxvIRuqwRs","signed":true,"loading":false}"user: "{"profile":{"id":10,"name":"Avatolino Cliente","email":"avatar@gmail.com","provider":true,"avatar":null}}"_persist: "{"version":-1,"rehydrated":true}"```![](https://github.com/tgmarinho/Images/blob/master/bootcamp-rocketseat/gobarber-web-localstorage-redux-persist.png?raw=true)
Reactotron:
![](https://github.com/tgmarinho/Images/blob/master/bootcamp-rocketseat/gobarber-web-reactotron-redux-persist.png?raw=true)
Pronto, agora o fluxo de login ficou bem automatizado.
código: [https://github.com/tgmarinho/gobarber-web/tree/aula-15-persistindo-autenticacao](https://github.com/tgmarinho/gobarber-web/tree/aula-15-persistindo-autenticacao)
## Aula 16 - Loading da Autenticação
* Refatorei o reducers para não ter que ficar escrevendo toda vez:```return  produce(state, draft  => { ... }```
* Criei mais dois cases no reducerde auth para REQUEST, SUCESSO e FAILURE.* No SignIn peguei usando o useSelector, o estado do loading e fiz uma condição ternária para mostrar 'Carregando...' se o loading estiver `true` e 'Acessar' quando estiver `false`.* No sagas eu coloquei um try/catch para capturar algum erro da API e disparar uma action de falha no signIn.
Para mais detalhes veja o código.
código: [https://github.com/tgmarinho/gobarber-web/tree/aula-16-loading-da-autenticacao](https://github.com/tgmarinho/gobarber-web/tree/aula-16-loading-da-autenticacao)

## Aula 17 - Exibindo toasts
* Instalei a lib: `yarn add react-toastify` para enviar mensagens para o usuarío* Adicionei o componente ToastContainer no `App.js` com auto fechamento de 3 segundos* importei o estilos do react-toastify: `import  'react-toastify/dist/ReactToastify.css';` no arquivo `global.js`* No saga de auth removi os `console.log` e adicionei: `toast.error('usuario nao é prestador de servico');`
código: [https://github.com/tgmarinho/gobarber-web/tree/aula-17-exibindo-toasts](https://github.com/tgmarinho/gobarber-web/tree/aula-17-exibindo-toasts)
## Aula 18 - Cadastro na aplicação
Agora criar um cadastro novo do GoBarberWeb
* Criei uma action nova `signUpRequest` que recebe nome, email e senha do usuário* No saga criei uma nova função signUp que ouve as chamadas da action de SIGN_UP_REQUEST:```export function* signUp({ payload }) {  try {    const { name, email, password } = payload;
    yield call(api.post, 'users', {      name,      email,      password,      provider: true,    });
    history.push('/');  } catch (err) {    toast.error('Falha no cadastro verifique seus dados!');    yield put(signFailure());  }}
export default all([  takeLatest('@auth/SIGN_IN_REQUEST', signIn),  takeLatest('@auth/SIGN_UP_REQUEST', signUp),]);```
* E no index.js do componente SignUp disparei a action com os dados do usuário.
código: [https://github.com/tgmarinho/gobarber-web/tree/aula-18-cadastro-na-aplicacao](https://github.com/tgmarinho/gobarber-web/tree/aula-18-cadastro-na-aplicacao)

## Aula 19 - Requisições autenticadas
Algumas rotas que formos acessar da nossa API temos que estar autenticado e enviando um token de autenticação.
E para fazer isso precisamos disponibilizar o token no header de Authorization da nossa chamada post da api do axios.
Portanto, assim que fizermos o login iremos inserir o `Baerer token` no `api.defaults.headers.Authorization`
``` api.defaults.headers.Authorization = `Baerer ${token}`;```
Porém se o usuário fazer o refresh ele vai perder esse header.
Para deixar isso fixo podemos fazer com que o saga ouça a action `persist/REHYDRATE` que possui o payload de users e auth que contém o token. 
```takeLatest('persist/REHYDRATE', setToken),```
Essa action executa o `setToken` para que ele faça a mesma coisa que fizemos acima, adicionando o baerer no header.
Essa action busca os dados do localStorage e o token está lá e é disponibilizado:```export function setToken({ payload }) {  if (!payload) return;  const { token } = payload.auth;  if (token) {    api.defaults.headers.Authorization = `Baerer ${token}`;  }}```
Código completo do saga:```import { takeLatest, call, put, all } from 'redux-saga/effects';import { toast } from 'react-toastify';import api from '~/services/api';import history from '~/services/history';import { signInSuccess, signFailure } from './actions';
export function* signIn({ payload }) {  try {    const { email, password } = payload;    const response = yield call(api.post, 'sessions', {      email,      password,    });
    const { token, user } = response.data;
    if (!user.provider) {      toast.error('usuario nao é prestador de servico');      return;    }
    api.defaults.headers.Authorization = `Baerer ${token}`;
    yield put(signInSuccess(token, user));
    history.push('/dashboard');  } catch (err) {    toast.error('Falha na autenticação, verifique seu email/senha');    yield put(signFailure());  }}
export function* signUp({ payload }) {  try {    const { name, email, password } = payload;
    yield call(api.post, 'users', {      name,      email,      password,      provider: true,    });
    history.push('/');  } catch (err) {    toast.error('Falha no cadastro verifique seus dados!');    yield put(signFailure());  }}
export function setToken({ payload }) {  if (!payload) return;  const { token } = payload.auth;  if (token) {    api.defaults.headers.Authorization = `Baerer ${token}`;  }}
export default all([  takeLatest('persist/REHYDRATE', setToken),  takeLatest('@auth/SIGN_IN_REQUEST', signIn),  takeLatest('@auth/SIGN_UP_REQUEST', signUp),]);
```
Para testar isso ai fizemos uma chamada simples no dashboard:
```import React from 'react';import api from '~/services/api';// import { Container } from './styles';
export default function Dashboard() {  api.get('appointments');
  return <h1>Dashboard</h1>;}```
E na aba network do chrome eu consegui ver um status 204 da rota `appointments`, ou seja, deu certo! 

código: [https://github.com/tgmarinho/gobarber-web/tree/aula-19-requisicoes-autenticadas](https://github.com/tgmarinho/gobarber-web/tree/aula-19-requisicoes-autenticadas) 
## Aula 20 - Configurando o Header 
* Criamos o Header e estilizamos* Adicionamos uma nova logo roxa para o header
código: [https://github.com/tgmarinho/gobarber-awebi/tree/aula-20-configurando-header](https://github.com/tgmarinho/gobarber-web/tree/aula-20-configurando-header) 
## Aula 21 - Estilizando notificações
* Instalamos react-icons e react-perfet-scrollbar (para fazer um scroll de notificações)* Fizemos a estilização criando um componente Notifications que é usado no Header* Tem vários detalhes de CSS com styled-component
código: [https://github.com/tgmarinho/gobarber-web/tree/aula-21-estilizando-notificacoes ](https://github.com/tgmarinho/gobarber-web/tree/aula-21-estilizando-notificacoes ) 
## Aula 22 - Notificações
* Instalei a lib date-fns para lidar com datas no frontend* Criei toda a lógica para exibir o bagde e as notificações conforme os dados do mongodb consultando a api na rota notifications.
código: [https://github.com/tgmarinho/gobarber-web/tree/aula-22-notificacoes](https://github.com/tgmarinho/gobarber-web/tree/aula-22-notificacoes) ## Aula 23 - Página de perfil
* Criei o componente Profile * Estilizei o componente Profile com CSS e StyledComponent
código: [https://github.com/tgmarinho/gobarber-web/tree/aula-23-pagina-de-perfil](https://github.com/tgmarinho/gobarber-web/tree/aula-23-pagina-de-perfil) 
## Aula 24 - Atualizando Perfil
* Utilizei o useDispatch para enviar os dados do formulário para o saga ouvir e atualizar no banco de dados via api* Criei as actions de request, success e failure para o update do profile* Atualizei o reducer do usuário* Pronto agora o que o usuário informar no formulário será persistido no banco de dados e o profile será atualizado também.
código: [https://github.com/tgmarinho/gobarber-web/tree/aula-24-atualizando-perfil](https://github.com/tgmarinho/gobarber-web/tree/aula-24-atualizando-perfil)
## Aula 25 - Foto de Perfil
Vamos criar um componente na pasta Profile, dentro dessa pasta vamos criar outra chamada AvatarInput com os arquivos index.js e styles.js.
No index.js vamos criar um  componente funcional usando os snippets da Rocketseat: `rfc` + enter.
o `index.js`:
```import React, { useState, useEffect, useRef } from 'react';import { useField } from '@rocketseat/unform';import api from '~/services/api';import { Container } from './styles';
export default function AvatarInput() {  const ref = useRef();
  const { defaultValue, registerField } = useField('avatar');
  const [file, setFile] = useState(defaultValue && defaultValue.id);  const [preview, setPreview] = useState(defaultValue && defaultValue.url);
  useEffect(() => {    if (ref.current) {      registerField({        name: 'avatar_id',        ref: ref.current,        path: 'dataset.file',      });    }  }, [ref.current]); // eslint-disable-line
  async function handleChange(e) {    const data = new FormData();
    data.append('file', e.target.files[0]);    const response = await api.post('files', data);    const { id, url } = response.data;
    setFile(id);    setPreview(url);  }
  return (    <Container>      <label htmlFor="avatar">        <img          src={            preview || 'https://api.adorable.io/avatars/285/abott@adorable.png'          }          alt=""        />        <input          type="file"          id="avatar"          accept="image/*"          data-file={file}          onChange={handleChange}          ref={ref}        />      </label>    </Container>  );}```
Aqui é um pouco mais complexo.
```const ref =  useRef();```crio um ref para pegar a tag do html, no caso vai ser o input de envio de arquivo.
```const { defaultValue, registerField } =  useField('avatar');```
Nós usamos esse componente AvatarInput no Profile:  
```  <Container>      <Form initialData={profile} onSubmit={handleSubmit}>        <AvatarInput name="avatar_id" />        <Input name="name" placeholder="Nome completo" />        ....        ...        ...        </Container>```e no `initialData={profile}` tem vários campos (fields) e um deles é o avatar do usuário que pode estar `null` ou com um objeto cheio de valores `{ id, path, url }`.
Entao o `useField('avatar');` vai passar para o `defaultValue` os valores e vai retornar também uma função de registro do campo que vai ser usada no useEffect toda vez que o ref.current (ou seja o input de envio de arquivo) mudar.
O ref.current é isso: 
```<img src="[http://localhost:3333/files/517d708aba8e96b40ee54c8ba0e56815.jpg](http://localhost:3333/files/517d708aba8e96b40ee54c8ba0e56815.jpg "http://localhost:3333/files/517d708aba8e96b40ee54c8ba0e56815.jpg")" alt="">```É o input =)
Confesso que eu sei o q está acontencendo mas não sei como! Oo #buguei![https://www.youtube.com/watch?v=p1h3gaCIICA](https://www.youtube.com/watch?v=p1h3gaCIICA)
React é isso, não sei o que aconteceu, só sei que aconteceu! 
Pronto parei de trolar o post!
```const [file, setFile] =  useState(defaultValue && defaultValue.id);const [preview, setPreview] =  useState(defaultValue && defaultValue.url);```
Eu crio dois estados, `file` recebe o id do avatar e o `preview` recebe a url do avatar que aponta para API onde está hospedada. 
Depois crio esse useEffect abaixo que se tiver algum ref.current então registro esse field passando o atributo name com o 'avatar_id' que e o nome do field que vem da api, ref, que é a ref atual q estou lidando com input,  e o path 'dataset.file' que é o data-file que passo no input, corresponde ao ID do avatar.
```useEffect(() => {    if (ref.current) {      registerField({        name: 'avatar_id',        ref: ref.current,        path: 'dataset.file',      });    }  }, [ref.current]); // eslint-disable-line```
Crio essa função assíncrona que é executada sempre que o input de envio de arquivo é alterado, crio uma instancia de FormData que sabe lidar com arquivo multipart, faço um append criando uma propriedade 'file' que é a mesma que minha api conhece lá nas rotas, e passo o primeiro arquivo que está no  array: e.target.files.Chamo a api fazendo um post, ou seja enviando o arquivo na rota `files` que minha api ouve passando o data com o arquivo. Por fim pego o ID e url da resposta da api e passo para o estado file e preview (que agora está populado com a url e portanto já exibe o preview da imagem). Quando essa função é executada, o arquivo já é enviado para o servidor na pasta tmp (poderia estar no Amazon S3, e os dados do arquivo já estão salvo na tabela files do banco de dados, mas ainda não é feito o relacionamento com o usuário), isso só acontece quando o usuário clica no enviar do formulário para atualizar o perfil.
``` async function handleChange(e) {    const data = new FormData();
    data.append('file', e.target.files[0]);    const response = await api.post('files', data);    const { id, url } = response.data;
    setFile(id);    setPreview(url);  }```Por fim, o código React que possue a imagem de perfil e o input com o arquivo, se o preview tiver a url do avatar do usuário, então mostra ela senão mostra uma imagem genérica da api adorable.O input upload de imagem é do tipo file, com id avatar para htmlFor="avatar" fazer o papel do label, ela aceita só imagens, e tem um [data-set](https://developer.mozilla.org/pt-BR/docs/Web/API/HTMLElement/dataset) que recebe o file que é o id do arquivo, e o onChange executa a função handleChange que envia o avatar para api, por fim o ref que é a referência para o input para o React controlar.
```return (    <Container>      <label htmlFor="avatar">        <img          src={            preview || 'https://api.adorable.io/avatars/285/abott@adorable.png'          }          alt=""        />        <input          type="file"          id="avatar"          accept="image/*"          data-file={file}          onChange={handleChange}          ref={ref}        />      </label>    </Container>  );``` Com certeza essa foi a mais díficil de entender, devido alguns conceitos novos do useRef e a lib Unform usando useField, além de entender também os Custom Hooks.
código: [https://github.com/tgmarinho/gobarber-web/tree/aula-25-foto-perfil](https://github.com/tgmarinho/gobarber-web/tree/aula-25-foto-perfil)

## Aula 26 - Dados do Header
* Apenas peguei os dados do estado do user profile e populei no Header* Corrigi a imagem do header para largura a altura fixa
código: [https://github.com/tgmarinho/gobarber-web/tree/aula-26-dados-header](https://github.com/tgmarinho/gobarber-web/tree/aula-26-dados-header)

## Aula 27 - Logout da Aplicação
Concluímos a parte de autenticação da aplicação fazendo o logout da aplicação, quando o usuário clica no botão logout o saga houve e muda a rota do usuário para home ('/'), limpa os dados do profile e também remove o token e o signed fassa a ser false, e o usuário é direcionado para a página de login.
código: [https://github.com/tgmarinho/gobarber-web/tree/aula-27-logout-da-aplicacao](https://github.com/tgmarinho/gobarber-web/tree/aula-27-logout-da-aplicacao)

## Aula 28 - Estilização do Dashboard
* Criamos a estilização e utilizamos os componentes no Dashboard
código: [https://github.com/tgmarinho/gobarber-web/tree/aula-28-estilizacao-do-dashboard](https://github.com/tgmarinho/gobarber-web/tree/aula-28-estilizacao-do-dashboard)

## Aula 29 - Navegação entre dias
* Usamos o date-fns para fazer um cálculo para adicionar e diminuir os dias do state date que fica entre as setas.
código: [https://github.com/tgmarinho/gobarber-web/tree/aula-29-navegacao-entre-dias](https://github.com/tgmarinho/gobarber-web/tree/aula-29-navegacao-entre-dias)

## Aula 30 - Listando agendamentos
* Buscamos da API os schedules baseado no dia que o usuário está vendo no dashboard, e fizemos o controle do timezone, e montamos um array de objetos com o time, past e o appointment para exibir na tela.
código: [https://github.com/tgmarinho/gobarber-web/tree/aula-30-listando-agendamentos](https://github.com/tgmarinho/gobarber-web/tree/aula-30-listando-agendamentos)

Resultado Final:* Cadastro![](https://raw.githubusercontent.com/tgmarinho/Images/master/bootcamp-rocketseat/gobarber-web-signup.png)
* Profile![](https://raw.githubusercontent.com/tgmarinho/Images/master/bootcamp-rocketseat/gobarber-web-profile.png)
* Dashboard![](https://raw.githubusercontent.com/tgmarinho/Images/master/bootcamp-rocketseat/gobarber-web-dash2.png)
* Dashboard 2![](https://raw.githubusercontent.com/tgmarinho/Images/master/bootcamp-rocketseat/gobarber-web-dash.png.png)


Fim!
Photo by [Peter Thomas](https://unsplash.com/photos/YY0vaZV7oIA) on Unsplash
