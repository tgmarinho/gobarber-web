## Aula 10 - Utilizando Unform

Para fazer a manipulação de estados precisaríamos converter a função em classe ou usar os Hooks e criar uma estado para cada input do formulário. A Rocketseat criou uma lib performática para lidar com formulários, [https://github.com/Rocketseat/unform](https://github.com/Rocketseat/unform), que iremos usar nesse projeto, vamos instalar então:

```
yarn add @rocketseat/unform
```

E agora só utilizar:

```
import React from 'react';
import { Link } from 'react-router-dom';
import { Form, Input } from '@rocketseat/unform';
import logo from '~/assets/logo.svg';

export default function SignIn() {
  function handleSubmit(data) {
    console.tron.log(data);
  }

  return (
    <>
      <img src={logo} alt="GoBarberWeb" />
      <Form onSubmit={handleSubmit}>
        <Input name="email" type="email" placeholder="Seu e-mail" />
        <Input
          name="password"
          type="password"
          placeholder="Sua senha secreta"
        />

        <button type="submit">Acessar</button>
        <Link to="/register">Criar conta gratuíta</Link>
      </Form>
    </>
  );
}
```

Muito interessante que basta passar o atributo `name` nos inputs e colocar um `onSubmit` com uma função e todos os dados preenchidos no formulário serão passados para a função na variável `data` podemos ter acesso a todos valores preenchidos.

Veja como ficou limpo, não precisei de um:

```
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
```

e nem precisei fazer `setPassword(e.target.value)`, etc.

O que já era bom ficou ainda melhor!

Outras alternativas no mercado para lidar com formulário é:

* [https://jaredpalmer.com/formik/docs/overview](https://jaredpalmer.com/formik/docs/overview)
* [https://redux-form.com/](https://redux-form.com/)
* [https://react-hook-form.com](https://react-hook-form.com/)

React Hook Form me parece uma boa, além do Unform da Rocketseat.

Veja no código as outras alterações.

código: [https://github.com/tgmarinho/gobarber-api/tree/aula-10-utilizando-unform](https://github.com/tgmarinho/gobarber-api/tree/aula-10-utilizando-unform)
