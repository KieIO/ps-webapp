import type { ReactNode } from 'react';
import { ConfigProvider } from 'antd';
import type { ThemeConfig } from 'antd';

export const pokeslideTheme: ThemeConfig = {
  token: {
    colorPrimary: '#2563EB',
    colorSuccess: '#16A34A',
    colorWarning: '#D97706',
    colorError: '#DC2626',
    colorInfo: '#0284C7',

    colorBgBase: '#FFFFFF',
    colorTextBase: '#0F172A',
    colorBorder: '#E2E8F0',

    borderRadius: 6,
    fontSize: 14,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.06), 0 4px 16px rgba(0, 0, 0, 0.06)',
  },
  components: {
    Menu: {
      // Match $sidebar-width-collapsed (64px); Ant Design default is 80px (controlHeightLG * 2)
      collapsedWidth: 64,
    },
  },
};

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return <ConfigProvider theme={pokeslideTheme}>{children}</ConfigProvider>;
}
