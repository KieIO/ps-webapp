import { Redirect } from '@docusaurus/router';
import type { ReactNode } from 'react';

/** Docs home → kế hoạch go-live. */
export default function Home(): ReactNode {
  return <Redirect to="/go-live" />;
}
