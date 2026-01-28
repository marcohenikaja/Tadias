import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Row, Col, Card, Typography, Grid, Spin, Alert, Button, Tag, DatePicker, Space, Divider
} from 'antd';
import { ReloadOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import {
  ResponsiveContainer,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell,
} from 'recharts';
import { Statistic } from 'antd';

dayjs.locale('fr');

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const cleanBase = (s) => (s || '').replace(/\/+$/, '');
const API_BASE = cleanBase(process.env.REACT_APP_API_BASE) ;

export default function Tresorerie({ mode = "light" }) {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isDark = mode === "dark";

  // ✅ Palette inline (sans CSS)
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

  // ✅ filtre mois + mode global
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [isGlobal, setIsGlobal] = useState(false);

  const monthStr = useMemo(() => {
    return selectedMonth ? selectedMonth.format('YYYY-MM') : dayjs().format('YYYY-MM');
  }, [selectedMonth]);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const formatAr = useCallback((v) => {
    const n = Number(v || 0);
    return `${n.toLocaleString('fr-FR')} Ar`;
  }, []);

  const formatArAxis = useCallback((v) => {
    const n = Number(v || 0);
    return new Intl.NumberFormat('fr-FR', {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1,
    }).format(n);
  }, []);

  // ✅ fetch avec mode=global ou month=YYYY-MM + cache
  const fetchTresorerie = useCallback(async (mStr, retryCount = 0) => {
    const controller = new AbortController();
    let timeoutId;

    const cacheKey = isGlobal ? `tresorerie_cache_global` : `tresorerie_cache_${mStr}`;

    try {
      setLoading(true);
      setError('');
      timeoutId = setTimeout(() => controller.abort(), 10000);

      const params = new URLSearchParams();
      if (isGlobal) {
        params.set('mode', 'global');
      } else {
        params.set('month', mStr);
      }

      const url = `${API_BASE}/api/tresorerie?${params.toString()}`;
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error('Erreur lors du chargement des données de Cash estimé');

      const json = await res.json();
      setData(json);

      localStorage.setItem(cacheKey, JSON.stringify({ data: json, timestamp: Date.now() }));
    } catch (e) {
      // fallback cache (1h)
      try {
        const cache = localStorage.getItem(cacheKey);
        if (cache) {
          const { data: cachedData, timestamp } = JSON.parse(cache);
          if (Date.now() - timestamp < 3600000) {
            setData(cachedData);
            setError('');
            return;
          }
        }
      } catch (_) {}

      if (retryCount < 2 && e?.name !== 'AbortError') {
        setTimeout(() => fetchTresorerie(mStr, retryCount + 1), 1500 * (retryCount + 1));
      } else {
        setError(e?.name === 'AbortError' ? 'Timeout du serveur' : (e?.message || 'Erreur inconnue'));
      }
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      setLoading(false);
    }
  }, [isGlobal]);

  useEffect(() => {
    fetchTresorerie(monthStr);
  }, [fetchTresorerie, monthStr, isGlobal]);

  const derived = useMemo(() => {
    if (!data) return null;

    const historique = (data.historique || []).map((p) => ({
      label: p.label,
      solde: Number(p.solde || 0),
    }));

    const prevision30j = (data.prevision30j || []).map((p) => ({
      label: p.label,
      solde: Number(p.solde || 0),
    }));

    return {
      historique,
      prevision30j,
      topDecaissements: Array.isArray(data.topDecaissements) ? data.topDecaissements : [],
      notifications: Array.isArray(data.notifications) ? data.notifications : [],
      soldeOuverture: Number(data.soldeOuverture || 0),
      soldeActuel: Number(data.soldeActuel || 0),
      encaissements: Number(data.encaissements || 0),
      decaissements: Number(data.decaissements || 0),
      netMois: Number(data.netMois || 0),
      mode: data?.periode?.mode || (isGlobal ? 'global' : 'month'),
      periodeLabel: data?.periode?.month || (isGlobal ? 'GLOBAL' : monthStr),
    };
  }, [data, isGlobal, monthStr]);

  const TooltipCash = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const v = payload[0]?.value ?? 0;
    return (
      <div
        style={{
          background: 'rgba(0,0,0,0.85)',
          border: '1px solid rgba(255,255,255,0.15)',
          padding: 10,
          borderRadius: 10,
        }}
      >
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{label}</div>
        <div style={{ color: '#fff', fontWeight: 800, marginTop: 4 }}>{formatAr(v)}</div>
      </div>
    );
  };

  if (loading && !data) {
    return (
      <div style={{ minHeight: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <Spin tip="Chargement de la Cash estimé..." />
        <Text style={{ color: ui.textSecondary }}>Récupération des dernières données</Text>
      </div>
    );
  }

  if (error || !data || !derived) {
    return (
      <Alert
        type="error"
        message="Impossible de charger la Cash estimé"
        description={error}
        showIcon
        action={
          <Button size="small" icon={<ReloadOutlined />} onClick={() => fetchTresorerie(monthStr, 0)}>
            Réessayer
          </Button>
        }
      />
    );
  }

  const soldeNegatif = derived.soldeActuel < 0;
  const netNegatif = derived.netMois < 0;

  const headerLabel = isGlobal ? 'Global (toutes les données)' : `Mois sélectionné : ${selectedMonth.format('MMMM YYYY')}`;

  // ✅ Cards “soft” : fond + border + shadow (sinon blanc en dark)
  const cardSoft = {
    borderRadius: 20,
    boxShadow: ui.shadow,
    background: ui.cardBg,
    border: isDark ? '1px solid rgba(255,255,255,0.10)' : 'none',
  };

  const tickFill = ui.textSecondary;
  const gridStroke = ui.split;

  return (
    <div style={{ padding: isMobile ? 8 : 24 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0, color: ui.textPrimary }}>
            Cash estimé
          </Title>
          <Text style={{ color: ui.textSecondary }}>
            {headerLabel} • Solde ouverture • Cumul {isGlobal ? 'global' : 'année'} • Prévision 30 jours
          </Text>
          {isGlobal && (
            <div style={{ marginTop: 6 }}>
              <Tag color="green" style={{ borderRadius: 999, margin: 0 }}>GLOBAL</Tag>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <DatePicker
            picker="month"
            value={isGlobal ? null : selectedMonth}
            allowClear
            placeholder="Global (toutes les données)"
            suffixIcon={<CalendarOutlined />}
            onChange={(v) => {
              if (!v) {
                setIsGlobal(true);
                return;
              }
              setIsGlobal(false);
              setSelectedMonth(v);
            }}
          />

          <Button icon={<ReloadOutlined />} onClick={() => fetchTresorerie(monthStr, 0)} loading={loading}>
            Actualiser
          </Button>
        </div>
      </div>

      {/* ✅ Notifications */}
      {derived.notifications.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {derived.notifications.map((n, idx) => {
            const isCritical = n.type === 'critical';
            const burn = n?.meta?.burnParJour;
            const cover = n?.meta?.joursCouverture;
            const ecart = n?.meta?.ecart;
            const pct = n?.meta?.pctVsPrev;

            return (
              <Alert
                key={idx}
                type={isCritical ? 'error' : 'warning'}
                showIcon
                style={{ marginBottom: 12, borderRadius: 14 }}
                message={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span>{n.title}</span>
                    {n.subtitle ? (
                      <Tag color={isCritical ? 'red' : 'orange'} style={{ borderRadius: 999 }}>
                        {n.subtitle}
                      </Tag>
                    ) : null}
                  </div>
                }
                description={
                  <div>
                    <div>« {n.message} »</div>

                    {(typeof burn === 'number' ||
                      typeof cover === 'number' ||
                      typeof ecart === 'number' ||
                      typeof pct === 'number') && (
                      <div style={{ marginTop: 6, fontSize: 12, opacity: 0.9 }}>
                        {typeof burn === 'number' && (
                          <span style={{ marginRight: 12 }}>
                            Burn ≈ <b>{formatAr(Math.round(burn))}</b>/j
                          </span>
                        )}
                        {typeof cover === 'number' && (
                          <span style={{ marginRight: 12 }}>
                            Couverture ≈ <b>{Number(cover).toFixed(1)}</b> j
                          </span>
                        )}
                        {typeof ecart === 'number' && (
                          <span style={{ marginRight: 12 }}>
                            Écart ≈ <b>{formatAr(Math.round(ecart))}</b>
                          </span>
                        )}
                        {typeof pct === 'number' && (
                          <span>
                            Variation ≈ <b>{pct.toFixed(1)}%</b>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                }
              />
            );
          })}
        </div>
      )}

      {/* ✅ KPI cards */}
      <Row gutter={[isMobile ? 16 : 24, isMobile ? 16 : 24]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <Card
            bordered={false}
            style={{
              borderRadius: 20,
              boxShadow: ui.shadow,
              background: 'radial-gradient(circle at 0% 0%, #074a73ff 0, #8bcdd7ff 55%, #1fa6c1ff 100%)',
              color: '#fff',
            }}
          >
            <Text type="secondary" style={{ margin: '8px 0 0', color: '#fff' }}>
              Solde ouverture ({isGlobal ? 'début historique' : 'année'})
            </Text>

            <Title level={3} style={{ margin: '8px 0 0', color: '#fff' }}>
              Solde d’ouverture
            </Title>

            <Statistic
              value={derived.soldeOuverture}
              formatter={(v) => formatAr(v)}
              valueStyle={{ color: '#fff' }}
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card bordered={false} style={cardSoft}>
            <Text style={{ color: ui.textSecondary }}>{isGlobal ? 'Net global' : 'Net du mois'}</Text>
            <Title level={3} style={{ margin: '8px 0 0', color: netNegatif ? '#ff4d4f' : '#52c41a' }}>
              {formatAr(derived.netMois)}
            </Title>

            <Divider style={{ margin: '12px 0', borderColor: ui.split }} />

            <Space direction="vertical" size={2} style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ color: ui.textSecondary }}>Encaissements</Text>
                <Text strong style={{ color: ui.textPrimary }}>{formatAr(derived.encaissements)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ color: ui.textSecondary }}>Décaissements</Text>
                <Text strong style={{ color: '#f5222d' }}>-{formatAr(derived.decaissements)}</Text>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            bordered={false}
            style={{
              borderRadius: 20,
              boxShadow: ui.shadow,
              background: 'radial-gradient(circle at 0% 0%, #074a73ff 0, #8bcdd7ff 55%, #1fa6c1ff 100%)',
              color: '#fff',
            }}
          >
            <Text type="secondary" style={{ color: '#fff' }}>
              Solde actuel (cumul {isGlobal ? 'global' : 'année'})
            </Text>
            <div style={{ fontSize: 28, fontWeight: 900, marginTop: 8, color: soldeNegatif ? '#ff4d4f' : '#fff' }}>
              {formatAr(derived.soldeActuel)}
            </div>
            <Tag color={soldeNegatif ? 'red' : 'green'} style={{ borderRadius: 999, marginTop: 10 }}>
              {soldeNegatif ? 'Cash négatif' : 'Cash OK'}
            </Tag>
          </Card>
        </Col>
      </Row>

      <Row gutter={[isMobile ? 16 : 24, isMobile ? 16 : 24]}>
        {/* 1) Évolution 6 mois */}
        <Col xs={24} md={12}>
          <Card bordered={false} style={cardSoft}>
            <Title level={5} style={{ marginBottom: 4, color: ui.textPrimary }}>Évolution du cash (6 mois)</Title>
            <Text style={{ fontSize: 12, color: ui.textSecondary }}>
              {isGlobal ? 'Cumul depuis début historique' : 'Cumul depuis janvier (solde ouverture inclus)'}
            </Text>

            <div style={{ height: 240, marginTop: 12 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={derived.historique} margin={{ top: 10, right: 10, left: 22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cashHist" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#009EC1" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#01619B" stopOpacity={0} />
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
                    width={90}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    allowDecimals={false}
                    tickFormatter={formatArAxis}
                    tick={{ fill: tickFill, fontSize: 11 }}
                  />
                  <Tooltip content={<TooltipCash />} />
                  <Area type="monotone" dataKey="solde" stroke="#13c2c2" strokeWidth={2} fill="url(#cashHist)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* 2) Prévision 30 jours */}
        <Col xs={24} md={12}>
          <Card bordered={false} style={cardSoft}>
            <Title level={5} style={{ marginBottom: 4, color: ui.textPrimary }}>Prévision light (30 jours)</Title>
            <Text style={{ fontSize: 12, color: ui.textSecondary }}>
              {isGlobal
                ? 'Basée sur la moyenne des 30 derniers jours (estimatif)'
                : 'Basée sur le rythme moyen du mois sélectionné (estimatif)'}
            </Text>

            <div style={{ height: 240, marginTop: 12 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={derived.prevision30j} margin={{ top: 10, right: 10, left: 22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    interval={0}
                    tick={{ fill: tickFill, fontSize: 11 }}
                  />
                  <YAxis
                    width={90}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    allowDecimals={false}
                    tickFormatter={formatArAxis}
                    tick={{ fill: tickFill, fontSize: 11 }}
                  />
                  <Tooltip content={<TooltipCash />} />
                  <Bar dataKey="solde" radius={[8, 8, 0, 0]}>
                    {derived.prevision30j.map((p, idx) => (
                      <Cell key={`pv-${idx}`} fill={p.solde >= 0 ? '#00ABC9' : '#ff7875'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* 3) Top décaissements */}
        <Col span={24}>
          <Card bordered={false} style={cardSoft}>
            <Title level={5} style={{ marginBottom: 4, color: ui.textPrimary }}>Plus gros décaissements</Title>
            <Text style={{ fontSize: 12, color: ui.textSecondary }}>
              ACH (débits) • Selon échéance si dispo, sinon date
            </Text>

            <div style={{ marginTop: 12 }}>
              {derived.topDecaissements.length === 0 ? (
                <Text style={{ color: ui.textSecondary }}>Aucun décaissement trouvé.</Text>
              ) : (
                derived.topDecaissements.map((d, index) => (
                  <div
                    key={`${d.date}-${index}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 0',
                      borderBottom: index === derived.topDecaissements.length - 1 ? 'none' : `1px solid ${ui.rowSplit}`,
                      gap: 12,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: ui.textPrimary }}>
                        {d.libelle}
                      </div>
                      <div style={{ fontSize: 11, color: ui.textSecondary }}>
                        {d.date}{d.partner ? ` • ${d.partner}` : ''}
                      </div>
                    </div>

                    <div style={{ fontSize: 13, fontWeight: 900, color: '#f5222d', whiteSpace: 'nowrap' }}>
                      -{formatAr(Math.abs(Number(d.montant || 0)))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
