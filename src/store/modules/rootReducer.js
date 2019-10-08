import { combineReducers } from 'redux';

import auth from './auth/reducer';

const reducers = combineReducers({
  auth,
});

export default reducers;
