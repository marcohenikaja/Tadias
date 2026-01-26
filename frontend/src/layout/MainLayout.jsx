// ... imports identiques
import React, { useMemo } from 'react';
import { Layout, Menu, Typography, Grid, Space, Divider, Button } from 'antd';
import Logo from '../assets/logo/logotadias.jpeg';
import {
  PieChartOutlined,
  BarChartOutlined,
  WalletOutlined,
  SettingOutlined,
  UserOutlined,
  UploadOutlined,
  LogoutOutlined,
  DollarOutlined,
  WhatsAppOutlined
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import TopBar from './TopBar';

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

const slogan = '';

// ✅ items “bruts”
const baseMenuItems = [
  { key: '/dashboard', icon: <PieChartOutlined />, label: 'Tableau de bord' },
  { key: '/tresorerie', icon: <WalletOutlined />, label: 'Cash estimé' },
  { key: '/activite', icon: <BarChartOutlined />, label: 'Activité' },
  { key: '/charge', icon: <DollarOutlined />, label: 'Charges' },
  { key: '/import-factures', icon: <UploadOutlined />, label: 'Import factures' },

  // ✅ ADMIN ONLY
  { key: '/imports-manager', icon: <SettingOutlined />, label: 'Paramètres', adminOnly: true },
];


const pageMeta = {
  '/dashboard': {
    title: 'Tableau de bord',
    subtitle: 'Vue globale de la performance de votre entreprise.',
    icon: <PieChartOutlined style={{ fontSize: 20, color: '#13c2c2' }} />,
  },
  '/tresorerie': {
    title: 'Cash estimé',
    subtitle: 'Suivi des encaissements, décaissements et du Cash estimé.',
    icon: <WalletOutlined style={{ fontSize: 20, color: '#13c2c2' }} />,
  },
  '/activite': {
    title: 'Activité',
    subtitle: 'Chiffre d’affaires, facturation et performance commerciale.',
    icon: <BarChartOutlined style={{ fontSize: 20, color: '#13c2c2' }} />,
  },
  '/import-factures': {
    title: 'Import factures',
    subtitle: 'Importez vos factures (PDF/Excel) pour alimenter votre suivi.',
    icon: <UploadOutlined style={{ fontSize: 20, color: '#13c2c2' }} />,
  },
  '/charge': {
    title: 'Charges',
    subtitle: 'Suivi et analyse de vos charges (classe 6).',
    icon: <DollarOutlined style={{ fontSize: 20, color: '#13c2c2' }} />,
  },

  // ✅ ADMIN ONLY (on filtrera plus bas)
  '/imports-manager': {
    title: 'Paramètres',
    subtitle: 'Configuration du cockpit et des seuils d’alertes.',
    icon: <SettingOutlined style={{ fontSize: 20, color: '#13c2c2' }} />,
    adminOnly: true,
  },
};

export default function MainLayout({ children, mode, setMode, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const siderCollapsed = isMobile;

  // ✅ user depuis localStorage
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }, []);

  const isAdmin = (user?.role || user?.profil) === 'admin';

  // ✅ menu filtré
  const menuItems = useMemo(() => {
    return baseMenuItems.filter((it) => !it.adminOnly || isAdmin);
  }, [isAdmin]);

  // ✅ meta filtré (évite afficher “Paramètres” si URL tapée)
  const meta = useMemo(() => {
    const m = pageMeta[location.pathname] || { title: '', subtitle: '', icon: null };
    if (m.adminOnly && !isAdmin) return { title: '', subtitle: '', icon: null };
    return m;
  }, [location.pathname, isAdmin]);

  const displayName =
    user?.name || user?.nom || user?.username || user?.email || 'Utilisateur';

  const displayRole = user?.role || user?.profil || 'Cockpit';

  const handleLogout = () => {
    if (onLogout) onLogout();
    else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
    }
  };

  const isDark = mode === 'dark';

  // ✅ si l’item courant n’existe plus (ex: user non-admin sur /imports-manager), on force vers dashboard
  useMemo(() => {
    const allowedKeys = new Set(menuItems.map((m) => m.key));
    if (!allowedKeys.has(location.pathname)) {
      // Optionnel : si tu veux rediriger immédiatement
      // navigate('/dashboard', { replace: true });
    }
  }, [menuItems, location.pathname]);

  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: isDark
          ? 'radial-gradient(circle at 0 0,#141414 0,#000 45%,#050816 100%)'
          : 'radial-gradient(circle at 0 0,#e6fffb 0,#f5f7fb 40%,#ffffff 100%)',
      }}
    >
      <Sider
        collapsed={siderCollapsed}
        collapsedWidth={64}
        width={220}
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          background: 'linear-gradient(180deg, #0b1220 0%, #070b13 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >

        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Brand */}
          <div style={{ padding: '18px 14px 12px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'grid', gap: 10, justifyItems: 'center', textAlign: 'center' }}>
              <div
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: 18,
                  padding: 7,
                  background:
                    'linear-gradient(135deg, rgba(19,194,194,0.30), rgba(114,46,209,0.18), rgba(235,47,150,0.12))',
                  border: '1px solid rgba(255,255,255,0.18)',
                  boxShadow: '0 18px 40px rgba(0,0,0,0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                }}
              >
                <img
                  src={Logo}
                  alt="Logo TADIAS"
                  style={{ width: 46, height: 46, borderRadius: 14, objectFit: 'cover' }}
                />
              </div>

              {!siderCollapsed && (
                <div style={{ maxWidth: 220 }}>
                  <Text
                    style={{
                      display: 'block',
                      fontSize: 18,
                      fontWeight: 900,
                      color: '#fff',
                    }}
                  >
                    TADIAS
                  </Text>
                  <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.68)' }}>
                    {slogan}
                  </Text>
                </div>
              )}
            </div>
          </div>

          <Divider style={{ margin: '10px 0', borderColor: 'rgba(255,255,255,0.08)' }} />

          {/* ✅ Menu filtré */}
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            onClick={({ key }) => navigate(key)}
            items={menuItems}
            style={{ border: 'none', background: 'transparent', padding: '0 6px' }}
          />

          {/* Bottom user card + logout */}
          <div style={{ marginTop: 'auto', padding: 14 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: 12,
                borderRadius: 14,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg,#13c2c2,#722ed1)',
                }}
              >
                <UserOutlined
                  style={{
                    fontSize: 18,
                    lineHeight: 1,
                    display: 'block',
                  }}
                />

              </div>

              <div style={{ overflow: 'hidden', minWidth: 0 }}>
                <Text
                  style={{
                    display: 'block',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {displayName}
                </Text>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>{displayRole}</Text>
              </div>
            </div>

            {isMobile ? (
              <Button
                danger
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                style={{
                  marginTop: 10,
                  width: 40,
                  height: 40,
                  padding: 0,
                  borderRadius: 999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255,77,79,0.10)',
                  borderColor: 'rgba(255,77,79,0.35)',
                }}
              />
            ) : (
              <Button
                danger
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                style={{
                  marginTop: 10,
                  width: '100%',
                  borderRadius: 12,
                  background: 'rgba(255,77,79,0.10)',
                  borderColor: 'rgba(255,77,79,0.35)',
                  color: '#ff4d4f',
                }}
              >
                Déconnexion
              </Button>
            )}

          </div>
        </div>
      </Sider>

      <Layout style={{ background: 'transparent' }}>
        <Header
          style={{
            padding: isMobile ? '0 12px' : '0 24px',
            height: isMobile ? 64 : 72,
            display: 'flex',
            alignItems: 'center',
            background: 'transparent',
          }}
        >
          <TopBar mode={mode} setMode={setMode} />
        </Header>

        <Content style={{ padding: isMobile ? '0 12px 12px' : '0 24px 24px' }}>
          <div style={{ width: '100%', maxWidth: 1280, margin: '0 auto' }}>
            {meta.title && (
              <div
                style={{
                  marginBottom: isMobile ? 12 : 16,
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <Space align="start" size="middle">
                  {meta.icon}
                  <div>
                    <Title level={isMobile ? 4 : 3} style={{ margin: 0, fontWeight: 800 }}>
                      {meta.title}
                    </Title>
                    {meta.subtitle && (
                      <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 2 }}>
                        {meta.subtitle}
                      </Text>
                    )}
                  </div>
                </Space>
              </div>
            )}

            {children}
          </div>
        </Content>
      </Layout>
      <a
        href="https://wa.me/261382308971?text=Bonjour%20j%27ai%20besoin%20d%27aide%20sur%20TADIAS"
        target="_blank"
        rel="noreferrer"
        style={{
          position: "fixed",
          right: 18,
          bottom: 18,
          zIndex: 9999,
          textDecoration: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.92)",
            boxShadow: "0 14px 40px rgba(0,0,0,0.22)",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              background: "#25D366",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <WhatsAppOutlined style={{ color: "#fff", fontSize: 22 }} />
          </div>
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontWeight: 800, color: "#0b1220" }}>Support WhatsApp</div>
            <div style={{ fontSize: 12, color: "rgba(0,0,0,0.55)" }}>Réponse rapide</div>
          </div>
        </div>
      </a>

    </Layout>
  );
}
