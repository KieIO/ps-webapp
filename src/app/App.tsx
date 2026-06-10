import { ErrorBoundary } from '@/shared/ui/ErrorBoundary/ErrorBoundary';
import { PermissionConfigBootstrap } from './PermissionConfigBootstrap';
import { AppRouter } from './router';

export function App() {
  return (
    <ErrorBoundary>
      <PermissionConfigBootstrap>
        <AppRouter />
      </PermissionConfigBootstrap>
    </ErrorBoundary>
  );
}
