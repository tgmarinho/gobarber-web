## Aula 25 - Foto de Perfil

Vamos criar um componente na pasta Profile, dentro dessa pasta vamos criar outra chamada AvatarInput com os arquivos index.js e styles.js.

No index.js vamos criar um  componente funcional usando os snnipets da Rocketseat: `rfc` + enter.

o `index.js`:

```
import React, { useState, useEffect, useRef } from 'react';
import { useField } from '@rocketseat/unform';
import api from '~/services/api';
import { Container } from './styles';

export default function AvatarInput() {
  const ref = useRef();

  const { defaultValue, registerField } = useField('avatar');

  const [file, setFile] = useState(defaultValue && defaultValue.id);
  const [preview, setPreview] = useState(defaultValue && defaultValue.url);

  useEffect(() => {
    if (ref.current) {
      registerField({
        name: 'avatar_id',
        ref: ref.current,
        path: 'dataset.file',
      });
    }
  }, [ref.current]); // eslint-disable-line

  async function handleChange(e) {
    const data = new FormData();

    data.append('file', e.target.files[0]);
    const response = await api.post('files', data);
    const { id, url } = response.data;

    setFile(id);
    setPreview(url);
  }

  return (
    <Container>
      <label htmlFor="avatar">
        <img
          src={
            preview || 'https://api.adorable.io/avatars/285/abott@adorable.png'
          }
          alt=""
        />
        <input
          type="file"
          id="avatar"
          accept="image/*"
          data-file={file}
          onChange={handleChange}
          ref={ref}
        />
      </label>
    </Container>
  );
}
```

Aqui é um pouco mais complexo.

```
const ref =  useRef();
```
crio um ref para pegar a tag do html, no caso vai ser o input de envio de arquivo.

```
const { defaultValue, registerField } =  useField('avatar');
```

Nós usamos esse componente AvatarInput no Profile:

```
  <Container>
      <Form initialData={profile} onSubmit={handleSubmit}>
        <AvatarInput name="avatar_id" />
        <Input name="name" placeholder="Nome completo" />
        ....
        ...
        ...
        </Container>
```
e no `initialData={profile}` tem vários campos (fields) e um deles é o avatar do usuário que pode estar `null` ou com um objeto cheio de valores `{ id, path, url }`.

Entao o `useField('avatar');` vai passar para o `defaultValue` os valores e vai retornar também uma função de registro do campo que vai ser usada no useEffect toda vez que o ref.current (ou seja o input de envio de arquivo) mudar.

O ref.current é isso:

```
<img src="[http://localhost:3333/files/517d708aba8e96b40ee54c8ba0e56815.jpg](http://localhost:3333/files/517d708aba8e96b40ee54c8ba0e56815.jpg "http://localhost:3333/files/517d708aba8e96b40ee54c8ba0e56815.jpg")" alt="">
```
É o input =)

Confesso que eu sei o q está acontencendo mas não sei como! Oo #buguei
![https://www.youtube.com/watch?v=p1h3gaCIICA](https://www.youtube.com/watch?v=p1h3gaCIICA)

React é isso, não sei o que aconteceu, só sei que aconteceu!

Pronto parei de trolar o post!

```
const [file, setFile] =  useState(defaultValue && defaultValue.id);
const [preview, setPreview] =  useState(defaultValue && defaultValue.url);
```

Eu crio dois estados, `file` recebe o id do avatar e o `preview` recebe a url do avatar que aponta para API onde está hospedada.

Depois crio esse useEffect abaixo que se tiver algum ref.current então registro esse field passando o atributo name com o 'avatar_id' que e o nome do field que vem da api, ref, que é a ref atual q estou lidando com input,  e o path 'dataset.file' que é o data-file que passo no input, corresponde ao ID do avatar.

```
useEffect(() => {
    if (ref.current) {
      registerField({
        name: 'avatar_id',
        ref: ref.current,
        path: 'dataset.file',
      });
    }
  }, [ref.current]); // eslint-disable-line
```

Crio essa função assíncrona que é executada sempre que o input de envio de arquivo é alterado, crio uma instancia de FormData que sabe lidar com arquivo multipart, faço um append criando uma propriedade 'file' que é a mesma que minha api conhece lá nas rotas, e passo o primeiro arquivo que está no  array: e.target.files.
Chamo a api fazendo um post, ou seja enviando o arquivo na rota `files` que minha api ouve passando o data com o arquivo. Por fim pego o ID e url da resposta da api e passo para o estado file e preview (que agoar está populado com a url e portanto já exibe o preview da imagem). Quando essa função é executada, o arquivo já é enviado para o servidor na pasta tmp (poderia estar no Amazon S3, e os dados do arquivo já estão salvo na tabela files do banco de dados, mas ainda não é feito o relacionamento com o usuário), isso só acontece quando o usuário clica no enviar do formulário para atualizar o perfil.

```
 async function handleChange(e) {
    const data = new FormData();

    data.append('file', e.target.files[0]);
    const response = await api.post('files', data);
    const { id, url } = response.data;

    setFile(id);
    setPreview(url);
  }
```
Por fim, o código React que possue a imagem de perfil e o input com o arquivo, se o preview tiver a url do avatar do usuário, então mostra ela senão mostra uma imagem genérica da api adorable.
O input upload de imagem é do tipo file, com id avatar para htmlFor="avatar" fazer o papel do label, ela aceita só imagens, e tem um [data-set](https://developer.mozilla.org/pt-BR/docs/Web/API/HTMLElement/dataset) que recebe o file que é o id do arquivo, e o onChange executa a função handleChange que envia o avatar para api, por fim o ref que é a referência para o input para o React controlar.

```
return (
    <Container>
      <label htmlFor="avatar">
        <img
          src={
            preview || 'https://api.adorable.io/avatars/285/abott@adorable.png'
          }
          alt=""
        />
        <input
          type="file"
          id="avatar"
          accept="image/*"
          data-file={file}
          onChange={handleChange}
          ref={ref}
        />
      </label>
    </Container>
  );
```

Com certeza essa foi a mais díficil de entender, devido alguns conceitos novos do useRef e a lib Unform usando useField, além de entender também os Custom Hooks.

código: [https://github.com/tgmarinho/gobarber-api/tree/aula-25-foto-perfil](https://github.com/tgmarinho/gobarber-api/tree/aula-25-foto-perfil)
