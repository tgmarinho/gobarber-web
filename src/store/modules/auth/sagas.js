import { takeLatest, call, put, all } from 'redux-saga/effects';

import api from '~/services/api';
import history from '~/services/history';
import { signInSuccess } from './actions';

export function* signIn({ payload }) {
  const { email, password } = payload;
  const response = yield call(api.post, 'sessions', {
    email,
    password,
  });

  const { token, user } = response.data;

  if (!user.provider) {
    console.tron.log('usuario nao é prestador de servico');
    return;
  }

  yield put(signInSuccess(token, user));

  history.push('/dashboard');
}

export default all([takeLatest('@auth/SIGN_IN_REQUEST', signIn)]);
