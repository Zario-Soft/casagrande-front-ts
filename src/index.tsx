import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './providers/auth.provider';
import { LoadingProvider } from './providers/loading.provider';
import { store } from './redux-ts';
import { router } from './routes';
import { ThemeProvider } from '@mui/material';
import { generalTheme } from './theme';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <ThemeProvider theme={generalTheme}>
          <LoadingProvider>
            <RouterProvider router={router} />
            <ToastContainer
              pauseOnFocusLoss={false}
              hideProgressBar
              theme="colored"
            />
          </LoadingProvider>
        </ThemeProvider>
      </AuthProvider>
    </Provider>

  </React.StrictMode >
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
