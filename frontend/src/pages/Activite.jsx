import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Grid,
  Spin,
  Alert,
  DatePicker,
  Input,
  Button,
  Tag,
  Segmented,
  Space,
  Divider,
  List,
  Tooltip as AntTooltip,
} from 'antd';
import {
  ReloadOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';
dayjs.locale('fr');

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const cleanBase = (s) => (s || '').replace(/\/+$/, '');
const API_BASE = cleanBase(process.env.REACT_APP_API_BASE) || 'http://localhost:8000';

export default function Activite({ mode = 'light' }) {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isDark = mode === 'dark';

  // ✅ Palette inline (comme ton 1er code)
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

  // ✅ filtres
  const [periode, setPeriode] = useState(() => dayjs().startOf('month'));
  const [isGlobal, setIsGlobal] = useState(false);
  const [partenaire, setPartenaire] = useState('');
  const [docType, setDocType] = useState('ALL'); // ALL | VTE | PRE

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const abortRef = useRef(null);

  const token = useMemo(() => localStorage.getItem('token'), []);
  const headers = useMemo(() => {
    const h = { Accept: 'application/json' };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const formatMGA = useCallback((v) => {
    const n = Number(v || 0);
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);
  }, []);

  const formatAxis = useCallback((v) => {
    const n = Number(v || 0);
    return new Intl.NumberFormat('fr-FR', {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1,
    }).format(n);
  }, []);

  const buildUrl = useCallback(() => {
    const sp = new URLSearchParams();

    if (isGlobal) {
      sp.set('mode', 'global');
    } else {
      sp.set('year', String(periode.year()));
      sp.set('month', String(periode.month() + 1));
    }

    if (partenaire.trim()) sp.set('partenaire', partenaire.trim());
    if (docType && docType !== 'ALL') sp.set('docType', docType);

    return `${API_BASE}/api/activite?${sp.toString()}`;
  }, [periode, partenaire, docType, isGlobal]);

  const fetchActivite = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      setError('');

      const url = buildUrl();
      const res = await fetch(url, { signal: controller.signal, headers });

      if (!res.ok) throw new Error(`Erreur ${res.status}: ${res.statusText}`);
      const json = await res.json();

      setData(json);
    } catch (e) {
      if (e?.name !== 'AbortError') setError(e?.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [buildUrl, headers]);

  // load + debounce filtres
  useEffect(() => {
    const t = setTimeout(() => fetchActivite(), 250);
    return () => clearTimeout(t);
  }, [periode, partenaire, docType, isGlobal, fetchActivite]);

  const derived = useMemo(() => {
    if (!data) return null;

    const caMois = Number(data.caTotalMois || 0);
    const nbFactures = Number(data.nbFactures || 0);
    const ticketMoyen = Number(data.ticketMoyen || 0);

    const caParMois = Array.isArray(data.caParMois) ? data.caParMois : [];
    const caParService = Array.isArray(data.caParService) ? data.caParService : [];
    const notifications = Array.isArray(data.notifications) ? data.notifications : [];

    // trend via caParMois
    let trend = null;
    if (caParMois.length >= 2) {
      const prev = Number(caParMois[caParMois.length - 2]?.montant || 0);
      const cur = Number(caParMois[caParMois.length - 1]?.montant || 0);
      if (prev > 0) {
        const pct = ((cur - prev) / prev) * 100;
        trend = { pct, direction: pct >= 0 ? 'up' : 'down' };
      }
    }

    return {
      caMois,
      nbFactures,
      ticketMoyen,
      caParMois,
      caParService,
      notifications,
      trend,
      mode: data?.periode?.mode || (isGlobal ? 'global' : 'month'),
    };
  }, [data, isGlobal]);

  const tickFill = ui.textSecondary;
  const gridStroke = ui.split;

  const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        style={{
          background: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.85)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.18)'}`,
          borderRadius: 12,
          padding: 10,
        }}
      >
        <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>{label}</div>
        <div style={{ color: '#fff', fontWeight: 800, marginTop: 6 }}>
          {formatMGA(payload[0].value)}
        </div>
      </div>
    );
  };

  if (loading && !data) {
    return (
      <div
        style={{
          minHeight: 260,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
        }}
      >
        <Spin tip="Chargement de l’activité…" />
        <Text style={{ color: ui.textSecondary }}>Récupération des données</Text>
      </div>
    );
  }

  if (error || !data || !derived) {
    return (
      <Alert
        type="error"
        showIcon
        message="Impossible de charger l’activité"
        description={error}
        action={
          <Button size="small" icon={<ReloadOutlined />} onClick={fetchActivite}>
            Réessayer
          </Button>
        }
        style={{ borderRadius: 14 }}
      />
    );
  }

  const periodeLabel = isGlobal ? 'GLOBAL (toutes les données)' : periode.format('MMMM YYYY');

  // ✅ Cards “soft” (comme 1er code)
  const cardSoft = {
    borderRadius: 20,
    boxShadow: ui.shadow,
    background: ui.cardBg,
    border: isDark ? '1px solid rgba(255,255,255,0.10)' : 'none',
  };

  const infoIconColor = ui.textTertiary;

  return (
    <div style={{ padding: isMobile ? 8 : 24 }}>
      {/* Header + filtres */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 14,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0, color: ui.textPrimary }}>
            Activité
          </Title>

          <Space size={8} wrap style={{ marginTop: 6 }}>
            <Tag color={isGlobal ? 'green' : 'blue'} style={{ borderRadius: 999, margin: 0 }}>
              {isGlobal ? 'GLOBAL' : periodeLabel}
            </Tag>
            <Tag color="green" style={{ borderRadius: 999, margin: 0 }}>
              VTE = Vente de produits
            </Tag>
            <Tag color="purple" style={{ borderRadius: 999, margin: 0 }}>
              PRE = Prestation de services
            </Tag>
          </Space>
        </div>

        <Space
          direction={isMobile ? 'vertical' : 'horizontal'}
          style={{
            width: isMobile ? '100%' : 'auto',
            alignItems: isMobile ? 'stretch' : 'center',
          }}
          wrap
        >
          <DatePicker
            picker="month"
            value={isGlobal ? null : periode}
            allowClear
            placeholder="Global (toutes les données)"
            suffixIcon={<CalendarOutlined />}
            onChange={(v) => {
              if (!v) {
                setIsGlobal(true);
                return;
              }
              setIsGlobal(false);
              setPeriode(v.startOf('month'));
            }}
            style={{ width: isMobile ? '100%' : 190 }}
          />

          <Segmented
            value={docType}
            onChange={setDocType}
            options={[
              { label: 'Tous', value: 'ALL' },
              { label: 'VTE', value: 'VTE' },
              { label: 'PRE', value: 'PRE' },
            ]}
            style={{ width: isMobile ? '100%' : 'auto' }}
          />

          <Input
            placeholder="Filtrer par partenaire…"
            allowClear
            value={partenaire}
            onChange={(e) => setPartenaire(e.target.value)}
            style={{ width: isMobile ? '100%' : 260 }}
          />

          <Button icon={<ReloadOutlined />} onClick={fetchActivite} loading={loading}>
            Actualiser
          </Button>
        </Space>
      </div>

      {/* Notifications */}
      <Card bordered={false} style={{ ...cardSoft, marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <Text style={{ fontSize: 12, color: ui.textSecondary }}>Alertes activité</Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Text strong style={{ fontSize: 14, color: ui.textPrimary }}>
                {derived.notifications.length}
              </Text>
              <Text style={{ fontSize: 12, color: ui.textSecondary }}>signal(s)</Text>
            </div>
          </div>

          <AntTooltip title="Ces alertes viennent du backend (baisse CA, inactivité, variabilité)">
            <InfoCircleOutlined style={{ color: infoIconColor }} />
          </AntTooltip>
        </div>

        <Divider style={{ margin: '12px 0', borderColor: ui.split }} />

        {derived.notifications.length === 0 ? (
          <Space>
            <WarningOutlined style={{ color: '#52c41a' }} />
            <Text style={{ color: ui.textSecondary }}>Aucune alerte sur cette période.</Text>
          </Space>
        ) : (
          <List
            size="small"
            dataSource={derived.notifications}
            renderItem={(n, idx) => (
              <List.Item
                key={idx}
                style={{
                  paddingLeft: 0,
                  paddingRight: 0,
                  borderBlockEnd: `1px solid ${ui.rowSplit}`,
                }}
              >
                <div style={{ width: '100%' }}>
                  <Space align="center" wrap>
                    <Tag color="orange" style={{ borderRadius: 999, margin: 0 }}>
                      {n.type || 'warning'}
                    </Tag>
                    <Text strong style={{ fontSize: 12, color: ui.textPrimary }}>
                      {n.title}
                    </Text>
                    <Text style={{ fontSize: 11, color: ui.textSecondary }}>
                      {n.subtitle}
                    </Text>
                  </Space>
                  <div style={{ marginTop: 4 }}>
                    <Text style={{ fontSize: 12, color: ui.textSecondary }}>{n.message}</Text>
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* KPI */}
      <Row gutter={[isMobile ? 12 : 16, isMobile ? 12 : 16]}>
        <Col xs={24} lg={8}>
          <Card
            bordered={false}
            style={{
              ...cardSoft,
              background:
                'radial-gradient(circle at 0% 0%, #074a73ff 0, #8bcdd7ff 55%, #1fa6c1ff 100%)',
              color: '#fff',
              border: 'none',
            }}
          >
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>
              {isGlobal ? 'CA global' : 'CA du mois'}
            </Text>
            <div style={{ fontSize: 28, fontWeight: 900, marginTop: 8 }}>{formatMGA(derived.caMois)}</div>

            {derived.trend && (
              <Tag
                color={derived.trend.direction === 'up' ? 'green' : 'red'}
                style={{ borderRadius: 999, border: 'none', marginTop: 12 }}
              >
                {derived.trend.direction === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}{' '}
                {Math.abs(derived.trend.pct).toFixed(1)}% vs mois précédent
              </Tag>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card bordered={false} style={cardSoft}>
            <Text style={{ fontSize: 12, color: ui.textSecondary }}>Nombre de factures</Text>
            <div style={{ fontSize: 26, fontWeight: 900, marginTop: 8, color: ui.textPrimary }}>
              {Number(derived.nbFactures).toLocaleString('fr-FR')}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            bordered={false}
            style={{
              ...cardSoft,
              background:
                'radial-gradient(circle at 0% 0%, #074a73ff 0, #8bcdd7ff 55%, #1fa6c1ff 100%)',
              color: '#fff',
              border: 'none',
            }}
          >
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>Ticket moyen</Text>
            <div style={{ fontSize: 26, fontWeight: 900, marginTop: 8 }}>{formatMGA(derived.ticketMoyen)}</div>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>
              Ticket = CA / nb factures {isGlobal ? '(global)' : '(mois)'}
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[isMobile ? 12 : 16, isMobile ? 12 : 16]} style={{ marginTop: 14 }}>
        <Col xs={24} lg={12}>
          <Card bordered={false} style={cardSoft}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Title level={5} style={{ marginBottom: 4, color: ui.textPrimary }}>
                  Évolution du CA
                </Title>
                <Text style={{ fontSize: 12, color: ui.textSecondary }}>6 derniers mois</Text>
              </div>
              <AntTooltip title="Survol = montant exact">
                <InfoCircleOutlined style={{ color: infoIconColor }} />
              </AntTooltip>
            </div>

            <div style={{ height: 260, marginTop: 12 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={derived.caParMois} margin={{ top: 10, right: 10, left: 16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="caArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#13c2c2" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#13c2c2" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    interval={isMobile ? 'preserveStartEnd' : 0}
                    tick={{ fill: tickFill, fontSize: 11 }}
                  />
                  <YAxis
                    tickFormatter={formatAxis}
                    tickLine={false}
                    axisLine={false}
                    width={80}
                    tick={{ fill: tickFill, fontSize: 11 }}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="montant" stroke="#13c2c2" strokeWidth={2} fill="url(#caArea)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card bordered={false} style={cardSoft}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Title level={5} style={{ marginBottom: 4, color: ui.textPrimary }}>
                  Top services (communication) {isGlobal ? '(global)' : '(mois)'}
                </Title>
                <Text style={{ fontSize: 12, color: ui.textSecondary }}>
                  Somme crédits + nb factures distinctes
                </Text>
              </div>
              <AntTooltip title="Ticket moyen par service = total / nb factures">
                <InfoCircleOutlined style={{ color: infoIconColor }} />
              </AntTooltip>
            </div>

            <div style={{ height: 260, marginTop: 12 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={derived.caParService} margin={{ top: 10, right: 10, left: 16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    tick={{ fill: tickFill, fontSize: 11 }}
                  />
                  <YAxis
                    tickFormatter={formatAxis}
                    tickLine={false}
                    axisLine={false}
                    width={80}
                    tick={{ fill: tickFill, fontSize: 11 }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const row = payload[0].payload || {};
                      return (
                        <div
                          style={{
                            background: 'rgba(0,0,0,0.85)',
                            border: '1px solid rgba(255,255,255,0.18)',
                            borderRadius: 12,
                            padding: 10,
                          }}
                        >
                          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>{label}</div>
                          <div style={{ color: '#fff', fontWeight: 800, marginTop: 6 }}>
                            Total: {formatMGA(row.montant)}
                          </div>
                          <div style={{ color: 'rgba(255,255,255,0.85)', marginTop: 4, fontSize: 12 }}>
                            Factures: {Number(row.nbFactures || 0).toLocaleString('fr-FR')}
                          </div>
                          <div style={{ color: 'rgba(255,255,255,0.85)', marginTop: 4, fontSize: 12 }}>
                            Ticket: {formatMGA(row.ticketMoyen)}
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="montant" fill="#00ABC9" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
