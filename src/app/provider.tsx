"use client"
import React from 'react'
import { Provider } from 'react-redux'
import { store } from './store'
import Auth from './auth';

const ProviderReduxToolkit = ({ children }: any) => {
  return (
    <Provider store={store}>
      <Auth>
        {children}
      </Auth>
    </Provider>
  );
};

export default ProviderReduxToolkit;