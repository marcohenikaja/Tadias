// src/layout/TopBar.jsx
import React from 'react';
import { useMemo } from 'react';
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
  const isMobile = !screens.md; // < md : mobile / petite tablette

    const isDark = mode === 'dark';
  
    const ui = useMemo(() => {
      const textPrimary = isDark ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.88)';
      const textSecondary = isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.45)';
      const textTertiary = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.35)';
      const cardBg = isDark ? 'rgba(255,255,255,0.04)' : '#fff';
      const split = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)';
      const rowSplit = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
      const shadow = isDark
        ? '0 18px 45px rgba(0,0,0,0.55), 0 0 1px rgba(0,0,0,0.40)'
        : '0 18px 45px rgba(15,23,42,0.12), 0 0 1px rgba(15,23,42,0.08)';
      return { textPrimary, textSecondary, textTertiary, cardBg, split, rowSplit, shadow };
    }, [isDark]);

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
      {/* Titre + sous-titre */}
    

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
              whiteSpace: 'nowrap',color: ui.textSecondary
            }}
          >
            {isMobile ? 'Admin' : 'Administrateur global'}
          </Text>
        </div>
      </Space>
    </div>
  );
}
