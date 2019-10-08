## Aula 14 - Armazendo perfil

Vamos armazenar os dados do usuário em um outro reducer chamado user.

Dois reducers podem ouvir as mesmas actions, tanto o `user` quanto `auth` irão ouvir a action: `@auth/SIGN_IN_SUCCESS` e vão fazer alguma coisa com esse dado, ambas vão armazenar no seu estado, os respectivos valores que lhe fazem sentido. Embora o user venha na autenticação eu amarzeno ele na user pois quando altrerarmos o  perfil não estaremos lidando om autenticação.

código: [https://github.com/tgmarinho/gobarber-api/tree/aula-14-armazenando-perfil](https://github.com/tgmarinho/gobarber-api/tree/aula-14-armazenando-perfil)
