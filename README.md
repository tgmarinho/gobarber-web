## Aula 08 - Utilizando Root import

Ao invés de ficarmos fazendo import passando `../../../MinhaPasta/MeuArquivo.js` podemos fazer algo melhor utilizando uma lib para resolver os caminhos pra gente, mas antes disso precisamos customizar o Create React App para configurar o babel.

Para isso vamos instalar:

```
yarn add customize-cra react-app-rewired -D
```
E também vamos instalar:

```
yarn add babel-plugin-root-import -D
```

E criar um arquivo `config-overrides.js` na raiz do projeto:

```
const { addBabelPlugin, override } = require('customize-cra');

module.exports = override(
  addBabelPlugin([
    'babel-plugin-root-import',
    {
      rootPathSuffix: 'src',
    },
  ])
);
```

Estamos importando a função addBabelPlugin e override, vamos exportar essa configuração, sobrescrevendo com o override passando o plugin do babel que quremos em um array, o primeiro parâmetro é o nome do plugin e depois um objeto com a configuração, nesse caso passamos o rootPathSuffix `src` que é onde estão os nosso códigos javascript do projeto onde iremos fazer import e export.

Com isso agora podemos fazer os imports assim:

```
import AuthLayout from '~/pages/_layouts/auth';
import DefaultLayout from '~/pages/_layouts/default';
```
Esse sinal de `~` representa qualquer nível `../../../` até o `src` como sendo o primeiro nível.

E para testar e funcionar vamos trocar os scripts do package.json:

```
"scripts": {
    "start": "react-app-rewired start",
    "build": "react-app-rewired build",
    "test": "react-app-rewired test",
    "eject": "react-scripts eject",
    "lint": "eslint --fix src --ext .js"
  },
```

e agora só executar `yarn start` e ver se tudo funcionou! =)

Mas o eslint está chiando alguns erros aqui...

Vamos instalar essa lib com o nome gigante para que o eslint ententa o `~` que estamos usando para fazer o import.

```
yarn add eslint-import-resolver-babel-plugin-root-import
```

e no arquivo `.eslintrc.js`:

colocamos um configuração:

```
settings: {
    'import/resolver': {
      'babel-plugin-root-import': {
        rootPathSuffix: 'src',
      },
    },
  },
```

Agora o eslint não reclama mais, só rodar `yarn lint` no terminal.

Mas agora se pressionar o teclado ctrl ou cmd e clicar no caminho do arquivo, ele não está acessando mais o arquivo.

```
import AuthLayout from  '~/pages/_layouts/auth';
```
Para resolver isso criaremos um arquivo `jsconfig.json` com o seguinte conteúdo:

```
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": { "~/*": ["*"] }
  }
}
```

Agora ele vai entender as importações e conseguiremos navegar nos as arquivos.


Código: [https://github.com/tgmarinho/gobarber-api/tree/aula-08-utilizando-root-import](https://github.com/tgmarinho/gobarber-api/tree/aula-08-utilizando-root-import)
