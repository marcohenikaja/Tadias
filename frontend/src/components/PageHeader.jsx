// src/components/PageHeader.jsx
import React from 'react';
import { Typography, Space, Grid } from 'antd';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;




export default function PageHeader({ icon, title, subtitle }) {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <div
      style={{
        marginBottom: isMobile ? 12 : 16,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      <Space align="start" size="middle">
        {icon && <span>{icon}</span>}
        <div>
          <Title
            level={isMobile ? 4 : 3}
            style={{ margin: 0, fontWeight: 700 }}
          >
            {title}
          </Title>
          {subtitle && (
            <Text
              type="secondary"
              style={{ fontSize: 13, display: 'block', marginTop: 2 }}
            >
              {subtitle}
            </Text>
          )}
        </div>
      </Space>
    </div>
  );
}
