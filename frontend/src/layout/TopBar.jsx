// src/layout/TopBar.jsx
import React, { useMemo } from 'react';
import { Space, Switch, Avatar, Typography, Tooltip, Grid } from 'antd';
import {
  BulbOutlined,
  MoonOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Text } = Typography;
const { useBreakpoint } = Grid;

export default function TopBar({ mode, setMode }) {

  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const isDark = mode === 'dark';

  const ui = useMemo(() => {
    const textPrimary = isDark ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.88)';
    const textSecondary = isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.45)';
    return { textPrimary, textSecondary };
  }, [isDark]);

  /* ✅ récupérer user */
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }, []);

  /* ✅ nom affiché */
  const displayName =
    user?.name ||
    user?.nom ||
    user?.username ||
    user?.email ||
    "Utilisateur";

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: isMobile ? 'flex-start' : 'space-between',
        gap: isMobile ? 8 : 16,
      }}
    >

      {/* Switch + avatar */}
      <Space
        size={isMobile ? 'middle' : 'large'}
        align="center"
        style={{
          width: isMobile ? '100%' : 'auto',
          justifyContent: isMobile ? 'space-between' : 'flex-end',
          display: 'flex',
          flexWrap: 'wrap',
        }}
      >

        <Tooltip title={mode === 'dark' ? 'Mode sombre' : 'Mode clair'}>
          <Switch
            size={isMobile ? 'small' : 'default'}
            checked={mode === 'dark'}
            onChange={(checked) => setMode(checked ? 'dark' : 'light')}
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<BulbOutlined />}
          />
        </Tooltip>

        {/* Avatar + Nom */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? 4 : 8,
          }}
        >
          <Avatar
            size={isMobile ? 'small' : 'default'}
            icon={<UserOutlined />}
            style={{
              background:
                'linear-gradient(135deg, #13c2c2 0%, #722ed1 50%, #eb2f96 100%)',
            }}
          />

          <Text
            style={{
              fontSize: isMobile ? 12 : 13,
              whiteSpace: 'nowrap',
              color: ui.textSecondary,
            }}
          >
            {displayName}
          </Text>

        </div>

      </Space>
    </div>
  );
}