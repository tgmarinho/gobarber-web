import { createStore, compose, applyMiddleware } from 'redux';

export default (reducers, middlewares) => {
  const enhancer =
    process.env.NODE_ENV === 'development'
      ? compose(
          applyMiddleware(...middlewares),
          console.tron.createEnhancer()
        )
      : compose(applyMiddleware(...middlewares));

  return createStore(reducers, enhancer);
};
