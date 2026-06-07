import { ErrorBoundary } from '@/shared/ui/ErrorBoundary/ErrorBoundary';
import { AppRouter } from './router';

export function App() {
  return (
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  );
}
