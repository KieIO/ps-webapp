import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button, Result } from 'antd';
import styles from './ErrorBoundary.module.scss';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled application error:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
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
