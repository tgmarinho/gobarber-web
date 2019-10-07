# GoBarber Web

Vamos contruir o GoBarber WEB que vai consumir a API Rest Gobarber Backend em NodeJS, vamos controlar rotas privadas, fazer a autenticação JWT e receber um token de autenticação. A autenticação do usuário vai ficar guardada no Redux para sempre que precisarmos do usuário logado, ter acesso ao Nome e avatar.


## Aula 01 - Estrutura do projeto

Para começar vamos criar um projeto com `create-react-app`:

```
npx create-react-app gobarber-web
```

Instalo e configuro o `eslint`:

```
yarn add eslint -D
```

Executo o eslint init com os seguintes parâmetros de configuração:

```
gobarber-web on  master [!] took 8s
❯ yarn eslint --init
yarn run v1.12.0
$ /Users/tgmarinho/Developer/bootcamp_rocketseat_studies/gobarber-web/node_modules/.bin/eslint --init
? How would you like to use ESLint? To check syntax, find problems, and enforce code style
? What type of modules does your project use? JavaScript modules (import/export)
? Which framework does your project use? React
? Does your project use TypeScript? No
? Where does your code run? (Press <space> to select, <a> to toggle all, <i> to invert selection)Browser
? How would you like to define a style for your project? Use a popular style guide
? Which style guide do you want to follow? Airbnb (https://github.com/airbnb/javascript)
? What format do you want your config file to be in? JavaScript
? Would you like to install them now with npm? Yes
```

Deixo baixando tudo!

Removo o `package-look.json` e rodo `yarn` para atualizar o `yarn-lock.json` uma vez que estou usando apenase o Yarn.

Instalo as dependências do prettier e babel:

```
❯ yarn add babel-eslint prettier eslint-plugin-prettier eslint-config-prettier -D
```

E configuro o `.eslintrc.js`:

```
module.exports = {
  env: {
    es6: true,
    jest: true,
    browser: true
  },
  extends: ["airbnb", "prettier", "prettier/react"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
    __DEV__: true
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2018,
    sourceType: "module"
  },
  plugins: ["react", "jsx-a11y", "import", "react-hooks", "prettier"],
  rules: {
    "prettier/prettier": "error",
    "react/jsx-filename-extension": ["error", { extensions: [".js", ".jsx"] }],
    "import/prefer-default-export": "off",
    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "react/jsx-one-expression-per-line": "off",
    "global-require": "off",
    "react-native/no-raw-text": "off",
    "no-param-reassign": "off",
    "no-underscore-dangle": "off",
    camelcase: "off",
    "no-console": ["error", { allow: ["tron"] }],
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  },
  settings: {
    "import/resolver": {
      "babel-plugin-root-import": {
        rootPathSuffix: "src"
      },
    },
  },
};
```

Removi alguns arquivos desncessários, veja no github, e deixei o App.js com uma div apenas.

Rode o comando `yarn start` para conferir está funcionando, uma tela branca deve aparecer.

Código: [https://github.com/tgmarinho/gobarber-web/tree/aula-01-estrutura-projeto](https://github.com/tgmarinho/gobarber-web/tree/aula-01-estrutura-projeto)
