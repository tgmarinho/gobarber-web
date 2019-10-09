## Aula 17 - Exibindo toasts

* Instalei a lib: `yarn add react-toastify` para enviar mensagens para o usuarío
* Adicionei o componente ToastContainer no `App.js` com auto fechamento de 3 segundos
* importei o estilos do react-toastify: `import  'react-toastify/dist/ReactToastify.css';` no arquivo `global.js`
* No saga de auth removi os `console.log` e adicionei: `toast.error('usuario nao é prestador de servico');`

código: [https://github.com/tgmarinho/gobarber-api/tree/aula-17-exibindo-toasts](https://github.com/tgmarinho/gobarber-api/tree/aula-17-exibindo-toasts)
