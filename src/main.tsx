import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { App } from './app/App';
import { AppProviders } from './app/providers';
import { queryClient } from './shared/api/queryClient';
import { store } from './store/store';
import './styles/index.scss';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppProviders>
          <App />
        </AppProviders>
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
);
