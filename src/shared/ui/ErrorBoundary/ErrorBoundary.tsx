import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button, Result } from 'antd';
import { isChunkLoadError, reloadOnChunkLoadError } from '@/shared/utils/chunkLoadError';
import styles from './ErrorBoundary.module.scss';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled application error:', error, info);
    reloadOnChunkLoadError(error);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (isChunkLoadError(this.state.error)) {
        return (
          <div className={styles.container}>
            <Result
              status="info"
              title="Updating…"
              subTitle="Loading the latest version of the app."
            />
          </div>
        );
      }

      return (
        <div className={styles.container}>
          <Result
            status="error"
            title="Something went wrong"
            subTitle="An unexpected error occurred. Please reload the page."
            extra={
              <Button type="primary" onClick={this.handleReload}>
                Reload page
              </Button>
            }
          />
        </div>
      );
    }

    return this.props.children;
  }
}
