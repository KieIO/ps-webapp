import { useEffect } from 'react';
import { Button, Result } from 'antd';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { isChunkLoadError, reloadOnChunkLoadError } from '@/shared/utils/chunkLoadError';
import styles from './RouteErrorFallback.module.scss';

export function RouteErrorFallback() {
  const error = useRouteError();

  useEffect(() => {
    reloadOnChunkLoadError(error);
  }, [error]);

  if (isChunkLoadError(error)) {
    return (
      <div className={styles.container}>
        <Result status="info" title="Updating…" subTitle="Loading the latest version of the app." />
      </div>
    );
  }

  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'Something went wrong';
  const subTitle = isRouteErrorResponse(error)
    ? error.data?.message || 'An unexpected error occurred.'
    : error instanceof Error
      ? error.message
      : 'An unexpected error occurred. Please reload the page.';

  return (
    <div className={styles.container}>
      <Result
        status="error"
        title={title}
        subTitle={subTitle}
        extra={
          <Button type="primary" onClick={() => window.location.reload()}>
            Reload page
          </Button>
        }
      />
    </div>
  );
}
