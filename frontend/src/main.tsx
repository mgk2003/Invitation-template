import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as JotaiProvider } from 'jotai';
import { store } from './store';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ReduxProvider store={store}>
      <JotaiProvider>
        <App />
      </JotaiProvider>
    </ReduxProvider>
  </React.StrictMode>,
);
