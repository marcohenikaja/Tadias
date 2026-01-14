import React, { useEffect, useState, useMemo, useCallback, useRef, useId } from 'react';

import logo3 from '../assets/logo/logoblanc.jpeg';
import logo1 from '../assets/logo/logocomplet.jpeg'; 
import logo2 from "../assets/logo/logosimple.jpeg"


import {
  Row,
  Col,
  Card,
  Typography,
  Tag,
  Grid,
  Spin,
  Alert,
  Button,
  Tooltip as AntTooltip,
  Segmented,
  Space,
  Divider,
  List,
  Badge,
  DatePicker,
  Drawer,
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  RiseOutlined,
  FallOutlined,
  WarningOutlined,
  DownloadOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  FileOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

dayjs.locale('fr');

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:8000';

const COLORS = ['#13c2c2', '#722ed1', '#52c41a', '#faad14', '#ff7875', '#1890ff'];

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

/* =========================
   Helpers échelle dynamique
   ========================= */
function niceStep(x) {
  const v = Math.abs(Number(x || 0));
  if (!isFinite(v) || v <= 0) return 1;

  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const f = v / pow;

  const nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return nf * pow;
}

function autoMaxFromValue(value, min = 0, tickCount = 10) {
  const v = Number(value || 0);
  const mi = Number(min || 0);
  const hi = Math.max(v, mi);

  const range = Math.max(1, hi - mi);
  const step = niceStep(range / tickCount);

  return mi + step * tickCount;
}

/* =========================
   Cadran dark style véhicule
   ========================= */
function formatK(n) {
  const v = Math.abs(Number(n || 0));
  if (v >= 1_000_000) return `${Math.round(v / 1_000_000)}M`;
  if (v >= 1_000) return `${Math.round(v / 1_000)}k`;
  return `${Math.round(v)}`;
}

function pctFromRange(value, min, max) {
  const v = Number(value || 0);
  const mi = Number(min || 0);
  const ma = Math.max(mi + 1, Number(max || 1));
  return clamp(((v - mi) / (ma - mi)) * 100, 0, 100);
}

function polarToCartesian(cx, cy, r, angleDeg) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function describeArc(cx, cy, r, startAngle, endAngle, largeArcFlag = 1, sweepFlag = 1) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;
}

const topArcSvg = {
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  height: 150,
  width: '100%',
  pointerEvents: 'none',
  zIndex: 3,
  opacity: 0.9,
};

/**
 * DarkDialGauge (CA / Enc / Dec)
 */
function DarkDialGauge({
  value,
  min = 0,
  max = 'auto',
  size = 290,
  bottomValue = '0 Ar',
  subtitle = '',
  blueGlow = true,
  labelMode = 'auto',
  accentColor = '#2f6fed',
  needleColor = '#ff4d4f',
  showProgress = true,
}) {
  const cx = size / 2;
  const cy = size / 2;

  const uid = useId();
  const needleGlowId = `needleGlow-${uid}`;
  const ringGlowId = `ringGlow-${uid}`;
  const glassId = `glass-${uid}`;

  const start = 225;
  const sweep = 270;
  const end = start + sweep;

  const compactAuto = size <= 205;
  const effectiveLabelMode = labelMode === 'auto' ? (compactAuto ? 'sparse' : 'full') : labelMode;
  const labelFontSize = compactAuto ? 14 : 12;
  const tickCount = compactAuto ? 8 : 10;

  const rRing = size * 0.445;
  const rTickOuter = size * 0.445;
  const rTickMajor = size * 0.39;
  const rTickMinor = size * 0.412;
  const rLabel = size * (compactAuto ? 0.33 : 0.30);
  const rNeedle = size * 0.34;

  const maxUsed = useMemo(() => {
    const n = Number(max);
    if (max !== 'auto' && isFinite(n) && n > min) return n;
    return autoMaxFromValue(value, min, tickCount);
  }, [max, value, min, tickCount]);

  const p = pctFromRange(value, min, maxUsed);
  const needleAngle = start + (p / 100) * sweep;

  const progressEnd = start + (p / 100) * sweep;
  const progressLargeArc = progressEnd - start > 180 ? 1 : 0;

  const majors = Array.from({ length: tickCount + 1 }, (_, i) => {
    const t = i / tickCount;
    const a = start + t * sweep;
    const v = min + t * (maxUsed - min);
    return { a, v, i };
  });

  const minors = [];
  for (let i = 0; i < tickCount; i++) {
    for (let j = 1; j <= 3; j++) {
      const t = (i + j / 4) / tickCount;
      const a = start + t * sweep;
      minors.push({ a, key: `${i}-${j}` });
    }
  }

  const tip = polarToCartesian(cx, cy, rNeedle, needleAngle);

  const shouldShowLabel = (i) => {
    if (effectiveLabelMode === 'none') return false;
    if (i === 0) return false;
    if (effectiveLabelMode === 'full') return true;
    if (i === tickCount) return true;
    return i % 2 === 0;
  };

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        position: 'relative',
        overflow: 'hidden',
        background:
          'radial-gradient(circle at 50% 35%, rgba(95,115,130,0.55) 0%, rgba(25,32,40,0.95) 55%, rgba(10,12,14,1) 100%)',
        boxShadow: '0 18px 45px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.06)',
      }}
    >
      {blueGlow && (
        <div
          style={{
            position: 'absolute',
            inset: -10,
            borderRadius: 999,
            background: `radial-gradient(circle at 50% 55%, ${accentColor}55 0%, ${accentColor}00 62%)`,
            filter: 'blur(16px)',
            opacity: 0.85,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}

      <svg width={size} height={size} style={{ display: 'block', position: 'relative', zIndex: 1 }}>
        <defs>
          <filter id={needleGlowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id={ringGlowId} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <radialGradient id={glassId} cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="55%" stopColor="rgba(255,255,255,0.00)" />
          </radialGradient>
        </defs>

        <circle cx={cx} cy={cy} r={size * 0.485} fill="none" stroke="rgba(0,0,0,0.78)" strokeWidth={18} />

        <path
          d={describeArc(cx, cy, rRing, start, end, 1, 1)}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={12}
          strokeLinecap="round"
          opacity={0.9}
        />

        {showProgress && p > 0 && (
          <path
            d={describeArc(cx, cy, rRing, start, progressEnd, progressLargeArc, 1)}
            fill="none"
            stroke={accentColor}
            strokeWidth={12}
            strokeLinecap="round"
            opacity={0.95}
            filter={blueGlow ? `url(#${ringGlowId})` : undefined}
          />
        )}

        {minors.map((m) => {
          const p1 = polarToCartesian(cx, cy, rTickOuter, m.a);
          const p2 = polarToCartesian(cx, cy, rTickMinor, m.a);
          return (
            <line
              key={`mi-${m.key}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="rgba(255,255,255,0.16)"
              strokeWidth="2"
            />
          );
        })}

        {majors.map((m) => {
          const p1 = polarToCartesian(cx, cy, rTickOuter, m.a);
          const p2 = polarToCartesian(cx, cy, rTickMajor, m.a);
          const pl = polarToCartesian(cx, cy, rLabel, m.a);
          const showLabel = shouldShowLabel(m.i);

          return (
            <g key={`ma-${m.i}`}>
              <line
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="rgba(255,255,255,0.35)"
                strokeWidth={compactAuto ? 3.2 : 3}
              />
              {showLabel && (
                <text
                  x={pl.x}
                  y={pl.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="rgba(255,255,255,0.92)"
                  fontSize={labelFontSize}
                  fontWeight={800}
                  style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.65))' }}
                >
                  {formatK(m.v)}
                </text>
              )}
            </g>
          );
        })}

        <g filter={`url(#${needleGlowId})`}>
          <line x1={cx} y1={cy} x2={tip.x} y2={tip.y} stroke={needleColor} strokeWidth={5} strokeLinecap="round" />
        </g>

        <circle cx={cx} cy={cy} r={22} fill="rgba(0,0,0,0.75)" stroke="rgba(255,255,255,0.18)" strokeWidth={2} />
        <circle cx={cx} cy={cy} r={7} fill="rgba(255,255,255,0.10)" />
        <circle cx={cx} cy={cy} r={size * 0.49} fill={`url(#${glassId})`} opacity={0.35} />
      </svg>

      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 14,
          transform: 'translateX(-50%)',
          padding: '10px 14px',
          borderRadius: 12,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.45) 100%)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.45)',
          textAlign: 'center',
          minWidth: 160,
          zIndex: 2,
        }}
      >
        <div style={{ color: '#fff', fontWeight: 900, fontSize: 16 }}>{bottomValue}</div>
        {subtitle ? <div style={{ color: 'rgba(255,255,255,0.70)', fontSize: 11, marginTop: 2 }}>{subtitle}</div> : null}
      </div>
    </div>
  );
}

/**
 * Jauge essence premium (verticale) + icône colorée
 */
function FuelGaugeVertical({
  pct = 0,
  height = 320,
  width = 170,
  label = 'CASH',
  valueText = '',
  stateText = '',
  fillColor = '#52c41a',
  showPump = true,
  borderColor = 'rgba(255,255,255,0.12)',
  iconColor = '#ffffff',
}) {
  const p = clamp(Number(pct || 0), 0, 100);

  const seg = 12;
  const filled = Math.round((p / 100) * seg);
  const minRatio = 0.42;

  return (
    <div
      style={{
        width,
        height,
        borderRadius: 22,
        padding: 14,
        position: 'relative',
        overflow: 'hidden',
        background:
          'radial-gradient(circle at 50% 18%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 42%, rgba(0,0,0,0.62) 100%)',
        border: `1px solid ${borderColor}`,
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.55), 0 22px 55px rgba(0,0,0,0.38)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.0) 34%)',
          opacity: 0.25,
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileOutlined style={{ color: iconColor, fontSize: 16, filter: `drop-shadow(0 0 10px ${iconColor}33)` }} />
          <span style={{ color: 'rgba(255,255,255,0.72)', fontSize: 11, fontWeight: 900 }}>{label}</span>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.72)', fontSize: 11, fontWeight: 900 }}>
          {Math.round(p)}%
        </span>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 12, height: height - 92 }}>
        <div style={{ width: 24, position: 'relative' }}>
          <div style={{ position: 'absolute', top: -2, left: 6, color: 'rgba(255,255,255,0.78)', fontSize: 12, fontWeight: 900 }}>
            F
          </div>
          <div style={{ position: 'absolute', bottom: -2, left: 6, color: 'rgba(255,255,255,0.78)', fontSize: 12, fontWeight: 900 }}>
            E
          </div>

          {showPump && (
            <div
              style={{
                position: 'absolute',
                top: 26,
                left: 2,
                width: 20,
                height: 20,
                opacity: 0.95,
                filter: `drop-shadow(0 2px 10px ${fillColor}33)`,
              }}
              aria-hidden
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                <path d="M6 3h8a2 2 0 0 1 2 2v15H6V3Z" stroke={fillColor} strokeWidth="1.6" />
                <path d="M8 6h6" stroke={`${fillColor}CC`} strokeWidth="1.6" strokeLinecap="round" />
                <path
                  d="M16 8l3 3v6a2 2 0 0 1-2 2h-1"
                  stroke={fillColor}
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 7 }}>
          {Array.from({ length: seg }).map((_, i) => {
            const idxFromBottom = seg - 1 - i;
            const isOn = idxFromBottom < filled;

            const t = i / (seg - 1);
            const wRatio = 1 - t * (1 - minRatio);

            return (
              <div
                key={i}
                style={{
                  height: 14,
                  width: `${Math.round(wRatio * 100)}%`,
                  marginLeft: `${Math.round((1 - wRatio) * 100)}%`,
                  borderRadius: 999,
                  background: isOn ? fillColor : 'rgba(255,255,255,0.10)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  boxShadow: isOn ? `0 0 16px ${fillColor}33` : 'none',
                  transition: 'background 220ms ease, box-shadow 220ms ease',
                }}
              />
            );
          })}
        </div>
      </div>

      <div
        style={{
          marginTop: 10,
          padding: '10px 12px',
          borderRadius: 14,
          textAlign: 'center',
          background: 'rgba(0,0,0,0.48)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.55)',
        }}
      >
        <div style={{ color: '#fff', fontWeight: 900, fontSize: 14, lineHeight: 1.2 }}>
          {valueText}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.70)', fontSize: 11, marginTop: 3 }}>
          {stateText}
        </div>
      </div>
    </div>
  );
}

function CashFuelGauge({ cashDisponible, cashPct, formatMontantSigned, isMobile }) {
  const cash = Number(cashDisponible || 0);
  const negatif = cash < 0;

  const tone = negatif ? 'danger' : cashPct < 20 ? 'warn' : cashPct < 40 ? 'warn' : 'ok';

  const fillColor =
    tone === 'danger' ? '#ff4d4f' :
      tone === 'warn' ? '#faad14' :
        '#52c41a';

  const borderColor =
    tone === 'danger' ? 'rgba(255,77,79,0.55)' :
      tone === 'warn' ? 'rgba(250,173,20,0.55)' :
        'rgba(82,196,26,0.50)';

  const stateText =
    negatif ? 'Cash négatif' :
      cashPct < 20 ? 'Réserve très basse' :
        cashPct < 40 ? 'Réserve basse' :
          'Cash OK';

  return (
    <FuelGaugeVertical
      pct={negatif ? 0 : cashPct}
      height={isMobile ? 330 : 360}
      width={isMobile ? 190 : 200}
      label="Cash estimé"
      valueText={formatMontantSigned(cash)}
      stateText={stateText}
      fillColor={fillColor}
      borderColor={borderColor}
      iconColor={fillColor}
      showPump
    />
  );
}

function TrafficLight({ state = 'green', vertical = false }) {
  const on = (c) => (state === c ? c : 'off');
  const dot = (c) => ({
    width: 10,
    height: 10,
    borderRadius: 999,
    background:
      on(c) === 'green'
        ? '#52c41a'
        : on(c) === 'orange'
          ? '#faad14'
          : on(c) === 'red'
            ? '#ff4d4f'
            : 'rgba(255,255,255,0.18)',
    boxShadow: on(c) === 'off' ? 'none' : '0 0 10px rgba(0,0,0,0.35)',
  });

  return (
    <div style={{ display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: 6, alignItems: 'center' }}>
      <div style={dot('green')} />
      <div style={dot('orange')} />
      <div style={dot('red')} />
    </div>
  );
}

function TrendTag({ trend, invertColors = true }) {
  if (!trend) return null;
  const up = trend.direction === 'up';
  const color = invertColors ? (up ? 'red' : 'green') : up ? 'green' : 'red';
  return (
    <Tag color={color} style={{ borderRadius: 999, margin: 0, border: 'none' }}>
      {up ? <ArrowUpOutlined /> : <ArrowDownOutlined />}{' '}
      {Math.abs(Number(trend.pct || 0)).toFixed(1)}%
    </Tag>
  );
}

export default function Dashboard() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [periode, setPeriode] = useState(() => dayjs().startOf('month'));
  const [isGlobal, setIsGlobal] = useState(false); // ✅ GLOBAL
  const [alertFilter, setAlertFilter] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(null);

  const [openClients, setOpenClients] = useState(false);
  const [openFournisseurs, setOpenFournisseurs] = useState(false);

  const abortRef = useRef(null);
  const mountedRef = useRef(true);
  const retryTimerRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, []);

  // ✅ FORMAT ARIARY (Ar) — 2 décimales (pas d’arrondi à l’entier)
  const arFormatter = useMemo(
    () =>
      new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    []
  );

  const formatMontantSigned = useCallback(
    (v) => `${arFormatter.format(Number(v || 0))} Ar`,
    [arFormatter]
  );

  const formatMontantAbs = useCallback(
    (v) => `${arFormatter.format(Math.abs(Number(v || 0)))} Ar`,
    [arFormatter]
  );

  const cacheKeyFor = useCallback((p, global) => {
    if (global) return `dashboard_cache_vehicle_global`;
    const y = p.year();
    const m = String(p.month() + 1).padStart(2, '0');
    return `dashboard_cache_vehicle_${y}-${m}`;
  }, []);

  const fetchDashboard = useCallback(
    async (p = periode, retryCount = 0) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      let timeoutId;

      const year = p.year();
      const month = p.month() + 1;
      const cacheKey = cacheKeyFor(p, isGlobal);

      try {
        if (mountedRef.current) {
          setLoading(true);
          setError('');
        }

        timeoutId = setTimeout(() => controller.abort(), 10000);

        const tokenNow = localStorage.getItem('token');

        const params = new URLSearchParams();
        if (isGlobal) {
          params.set('mode', 'global');
        } else {
          params.set('mode', 'month');
          params.set('year', String(year));
          params.set('month', String(month));
        }

        const res = await fetch(`${API_BASE}/api/dashboard?${params.toString()}`, {
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
            ...(tokenNow ? { Authorization: `Bearer ${tokenNow}` } : {}),
          },
        });

        if (!res.ok) {
          const err = new Error(`Erreur ${res.status}: ${res.statusText}`);
          err.status = res.status;
          throw err;
        }

        const json = await res.json();
        if (!mountedRef.current) return;

        setData(json);
        setLastUpdated(Date.now());
        localStorage.setItem(cacheKey, JSON.stringify({ data: json, timestamp: Date.now() }));
      } catch (e) {
        if (!mountedRef.current) return;

        try {
          const cache = localStorage.getItem(cacheKey);
          if (cache) {
            const { data: cachedData, timestamp } = JSON.parse(cache) || {};
            if (cachedData && timestamp && Date.now() - timestamp < 3600000) {
              setData(cachedData);
              setLastUpdated(timestamp);
              setLoading(false);
              return;
            }
          }
        } catch {
          localStorage.removeItem(cacheKey);
        }

        const status = e?.status;
        const shouldRetry =
          retryCount < 3 &&
          e?.name !== 'AbortError' &&
          (status == null || status >= 500 || status === 429);

        if (shouldRetry) {
          retryTimerRef.current = setTimeout(() => fetchDashboard(p, retryCount + 1), 2000 * (retryCount + 1));
        } else {
          setError(e?.name === 'AbortError' ? 'Timeout du serveur' : e?.message || 'Erreur inconnue');
        }
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
        if (mountedRef.current) setLoading(false);
      }
    },
    [periode, cacheKeyFor, isGlobal]
  );

  useEffect(() => {
    fetchDashboard(periode, 0);
  }, [periode, isGlobal, fetchDashboard]);

  const exportToCSV = () => {
    if (!data) return;

    const today = new Date().toLocaleDateString();
    const period = isGlobal ? 'GLOBAL' : periode.format('YYYY-MM');
    const e = data.echeances || {};
    const c = e.clients || {};
    const f = e.fournisseurs || {};

    const rows = [
      ['Indicateur', 'Valeur', 'Date'],
      ['Période', period, today],
      ['CA période', String(data.caMois ?? ''), today],
      ['CA période précédente', String(data.caMoisPrec ?? ''), today],
      ['Encaissements', String(data.encaissements ?? ''), today],
      ['Décaissements', String(data.decaissements ?? ''), today],
      ['Solde période', String(data.soldeMois ?? ''), today],
      ['Cash estimé', String(data.cashDisponible ?? ''), today],
      ['Total charges période', String(data.totalChargesMois ?? ''), today],
      ['Résultat brut', String(data.resultatBrut ?? ''), today],
      ['Clients (VTE/PRE) en retard', String(c.retard ?? 0), today],
      ['Fournisseurs (ACH) en retard', String(f.retard ?? 0), today],
    ];

    const csv = rows
      .map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-${isGlobal ? 'global' : periode.format('YYYY-MM')}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const derived = useMemo(() => {
    if (!data) return null;

    const caMois = Number(data.caMois || 0);
    const caMoisPrec = Number(data.caMoisPrec || 0);

    const diff = caMois - caMoisPrec;
    const pct = caMoisPrec ? (diff / Math.abs(caMoisPrec)) * 100 : diff > 0 ? 100 : 0;
    const diffPositif = diff >= 0;

    const enc = Number(data.encaissements || 0);
    const dec = Number(data.decaissements || 0);

    const soldeMois = Number(data.soldeMois ?? (enc - dec));

    let feu = 'green';
    if (soldeMois < 0 && soldeMois > -5000) feu = 'orange';
    if (soldeMois <= -5000) feu = 'red';

    const chargesPieData = (data.chargesPrincipales || []).map((c, i) => ({
      name: c.label?.length > 12 ? `${c.label.slice(0, 10)}…` : c.label,
      fullName: c.label,
      value: Number(c.montant || 0),
      color: COLORS[i % COLORS.length],
    }));

    const echeances = data.echeances || { clients: {}, fournisseurs: {} };
    const clients = echeances.clients || {};
    const fournisseurs = echeances.fournisseurs || {};

    const alerts = Array.isArray(data.alerts) ? data.alerts : [];
    const hasRed = alerts.some((a) => a.level === 'red');
    const hasOrange = alerts.some((a) => a.level === 'orange');
    const voyant = hasRed ? 'red' : hasOrange ? 'orange' : 'green';

    const voyantColor = voyant === 'red' ? '#ff4d4f' : voyant === 'orange' ? '#faad14' : '#52c41a';

    const normDetails = (x) => ({
      retard: Number(x?.retard || 0),
      a7j: Number(x?.a7j || 0),
      a30j: Number(x?.a30j || 0),

      nbRetard: Number(x?.nbRetard || 0),
      nbA7j: Number(x?.nbA7j || 0),
      nbA30j: Number(x?.nbA30j || 0),

      count: Number(x?.count || 0),
      oldestDate: x?.oldestDate || null,
      top: Array.isArray(x?.top) ? x.top : [],
      retardTrend: x?.retardTrend || null,

      details: x?.details || { retard: [], a7j: [], a30j: [] },
    });

    return {
      caMois,
      caMoisPrec,
      diffPositif,
      pct,
      enc,
      dec,
      soldeMois,
      feu,
      chargesPieData,
      cashDisponible: Number(data.cashDisponible || 0),
      totalChargesMois: Number(data.totalChargesMois || 0),
      resultatBrut: Number(data.resultatBrut || 0),
      clients: normDetails(clients),
      fournisseurs: normDetails(fournisseurs),
      alerts,
      voyantColor,
      voyantText: voyant === 'red' ? 'ALERTE' : voyant === 'orange' ? 'VIGILANCE' : 'OK',
    };
  }, [data]);

  const filteredAlerts = useMemo(() => {
    if (!derived) return [];
    if (alertFilter === 'all') return derived.alerts;
    return derived.alerts.filter((a) => a.level === alertFilter);
  }, [derived, alertFilter]);

  if (loading && !data) {
    return (
      <div style={{ minHeight: 360, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <Spin size="large" tip="Chargement du dashboard…" />
        <Text type="secondary">Récupération des dernières données</Text>
      </div>
    );
  }

  if (error || !data || !derived) {
    return (
      <Alert
        type="error"
        message="Impossible de charger le tableau de bord"
        description={error}
        showIcon
        action={
          <Button size="small" icon={<ReloadOutlined />} onClick={() => fetchDashboard(periode, 0)}>
            Réessayer
          </Button>
        }
      />
    );
  }

  // % cash (échelle auto)
  const cashNegatif = derived.cashDisponible < 0;
  const cashScaleMax = autoMaxFromValue(Math.abs(derived.cashDisponible), 0, 10);
  const cashPct = clamp((Math.abs(derived.cashDisponible) / Math.max(1, cashScaleMax)) * 100, 0, 100);

  const periodeLabel = isGlobal ? 'Global (toutes les données)' : periode.format('MMMM YYYY');
  const lastUpdatedLabel = lastUpdated ? dayjs(lastUpdated).format('HH:mm') : null;

  const cardSoft = {
    borderRadius: 22,
    boxShadow: '0 18px 45px rgba(15,23,42,0.12),0 0 1px rgba(15,23,42,0.08)',
  };

  const cardDark = {
    ...cardSoft,
    background: '#0b1220',
    color: '#fff',
  };

  const alertOptions = isMobile
    ? [
      { label: 'Toutes', value: 'all' },
      { label: 'R', value: 'red' },
      { label: 'O', value: 'orange' },
      { label: 'V', value: 'green' },
    ]
    : [
      { label: 'Toutes', value: 'all' },
      { label: 'Rouge', value: 'red' },
      { label: 'Orange', value: 'orange' },
      { label: 'Vert', value: 'green' },
    ];

  const mono = {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    letterSpacing: 0.2,
  };

  const pillBase = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    borderRadius: 999,
    fontSize: 12,
    lineHeight: 1,
    border: '1px solid rgba(255,255,255,0.10)',
    background: 'rgba(255,255,255,0.06)',
    color: 'rgba(255,255,255,0.90)',
  };

  const Pill = ({ tone = 'neutral', children }) => {
    const toneStyle =
      tone === 'success'
        ? { background: 'rgba(82,196,26,0.18)', borderColor: 'rgba(82,196,26,0.35)' }
        : tone === 'danger'
          ? { background: 'rgba(255,77,79,0.18)', borderColor: 'rgba(255,77,79,0.35)' }
          : tone === 'warn'
            ? { background: 'rgba(250,173,20,0.18)', borderColor: 'rgba(250,173,20,0.35)' }
            : {};
    return <span style={{ ...pillBase, ...toneStyle }}>{children}</span>;
  };

  /* ========= CLUSTER ========= */
  const clusterCard = {
    ...cardDark,
    borderRadius: 48,
    overflow: 'hidden',
    position: 'relative',
    border: '1px solid rgba(255,255,255,0.10)',
    background:
      'radial-gradient(900px 420px at 50% 20%, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 55%),' +
      'radial-gradient(700px 420px at 20% 35%, rgba(47,111,237,0.22) 0%, rgba(47,111,237,0) 60%),' +
      'radial-gradient(700px 420px at 80% 35%, rgba(47,111,237,0.22) 0%, rgba(47,111,237,0) 60%),' +
      'linear-gradient(180deg, #0b0f14 0%, #050607 70%, #000 100%)',
    boxShadow: '0 45px 140px rgba(0,0,0,0.70), inset 0 0 0 1px rgba(255,255,255,0.04)',
  };

  const rimTop = {
    position: 'absolute',
    left: -140,
    right: -140,
    top: -170,
    height: 320,
    borderRadius: '50%',
    background:
      'radial-gradient(closest-side at 50% 78%, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0.06) 45%, rgba(0,0,0,0) 72%)',
    boxShadow: 'inset 0 -20px 60px rgba(0,0,0,0.65)',
    opacity: 0.95,
    pointerEvents: 'none',
    zIndex: 0,
  };

  const rimBottom = {
    position: 'absolute',
    left: -140,
    right: -140,
    bottom: -200,
    height: 360,
    borderRadius: '50%',
    background:
      'radial-gradient(closest-side at 50% 26%, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.06) 45%, rgba(0,0,0,0) 74%)',
    boxShadow: 'inset 0 22px 70px rgba(0,0,0,0.65)',
    opacity: 0.95,
    pointerEvents: 'none',
    zIndex: 0,
  };

  const clusterFace = {
    position: 'relative',
    margin: isMobile ? 10 : 14,
    borderRadius: 38,
    overflow: 'hidden',
    background:
      'radial-gradient(900px 420px at 50% 25%, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.85) 55%, #000 100%)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: 'inset 0 25px 80px rgba(0,0,0,0.78)',
    zIndex: 1,
  };

  const glassOverlay = {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.0) 32%)',
    opacity: 0.18,
    pointerEvents: 'none',
    zIndex: 3,
  };

  const clusterBody = { position: 'relative', zIndex: 2, padding: isMobile ? 14 : 18 };

  const clusterHud = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  };

  const hudLeft = { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' };

  const hudDot = (c) => ({
    width: 10,
    height: 10,
    borderRadius: 999,
    background: c,
    boxShadow: `0 0 12px ${c}`,
  });

  const hudText = { color: 'rgba(255,255,255,0.70)', fontSize: 12 };

  const indicatorIcon = (_txt, color) => ({
    color,
    fontWeight: 900,
    fontSize: 14,
    padding: '2px 8px',
    borderRadius: 999,
    border: '1px solid rgba(255,255,255,0.10)',
    background: 'rgba(0,0,0,0.35)',
    boxShadow: `0 0 14px ${color}33`,
  });

  const clusterGrid = {
    display: 'grid',
    gap: isMobile ? 16 : 12,
    alignItems: 'end',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1.15fr 1.12fr',
  };

  const gaugeFrame = {
    padding: 10,
    borderRadius: 18,
    background:
      'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.06), rgba(255,255,255,0.02) 55%, rgba(0,0,0,0) 100%)',
    border: '1px solid rgba(255,255,255,0.08)',
  };

  const dialWrap = { display: 'flex', justifyContent: 'center', alignItems: 'center' };

  const dialCaption = {
    marginTop: 8,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
  };

  const rightStack = {
    display: 'grid',
    gap: 12,
    justifyItems: 'center',
    justifySelf: isMobile ? 'stretch' : 'end',
    maxWidth: isMobile ? '100%' : 310,
  };

  const screenBase = {
    ...mono,
    width: '100%',
    borderRadius: 14,
    padding: '10px 12px',
    background:
      'linear-gradient(180deg, rgba(40,120,210,0.28) 0%, rgba(10,35,70,0.22) 35%, rgba(0,0,0,0.35) 100%)',
    border: '1px solid rgba(255,255,255,0.10)',
    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.35)',
    textAlign: 'center',
  };

  const MiniScreen = ({ label, value, tone = 'neutral' }) => {
    const toneColor =
      tone === 'success' ? '#52c41a' : tone === 'danger' ? '#ff4d4f' : tone === 'warn' ? '#faad14' : '#8ec8ff';

    return (
      <div style={screenBase}>
        <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11 }}>{label}</div>
        <div style={{ color: toneColor, fontWeight: 900, fontSize: 16, marginTop: 4 }}>{value}</div>
      </div>
    );
  };

  return (
    <div style={{ padding: isMobile ? 8 : 24 }}>
      {/* Header + filtres */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Dashboard</Title>
          <Space size={8} wrap>
            <Text type="secondary">Tableau de bord véhicule</Text>
            <Tag style={{ borderRadius: 999, margin: 0 }}>{periodeLabel}</Tag>
            {lastUpdatedLabel && (
              <Tag color="blue" style={{ borderRadius: 999, margin: 0 }}>
                MAJ {lastUpdatedLabel}
              </Tag>
            )}
            {isGlobal && (
              <Tag color="green" style={{ borderRadius: 999, margin: 0 }}>
                GLOBAL
              </Tag>
            )}
          </Space>
        </div>

        <Space
          direction={isMobile ? 'vertical' : 'horizontal'}
          wrap={!isMobile}
          style={{
            minWidth: 0,
            width: isMobile ? '100%' : 'auto',
            alignItems: isMobile ? 'stretch' : 'center',
            justifyContent: isMobile ? 'flex-start' : 'flex-end',
          }}
        >
          {/* ✅ Month picker : clear => GLOBAL */}
          <DatePicker
            picker="month"
            value={isGlobal ? null : periode}
            allowClear
            placeholder="Global (toutes les données)"
            onChange={(v) => {
              if (!v) {
                setIsGlobal(true);
                return;
              }
              setIsGlobal(false);
              setPeriode(v.startOf('month'));
            }}
            suffixIcon={<CalendarOutlined />}
            style={{ width: isMobile ? '100%' : 190 }}
          />

          <Space style={{ width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
            <Button icon={<ReloadOutlined />} onClick={() => fetchDashboard(periode, 0)} loading={loading}>
              Actualiser
            </Button>
            {/* <Button icon={<DownloadOutlined />} onClick={exportToCSV}>
              Export CSV
            </Button> */}
          </Space>
        </Space>
      </div>

      {/* ALERTES */}
      <Row gutter={[isMobile ? 12 : 16, isMobile ? 12 : 16]} style={{ marginBottom: 16 }}>
        <Col xs={24}>
          <Card bordered={false} style={{ ...cardSoft, borderLeft: `6px solid ${derived.voyantColor}` }} bodyStyle={{ padding: isMobile ? 14 : 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 12, height: 12, borderRadius: 999, background: derived.voyantColor, boxShadow: `0 0 12px ${derived.voyantColor}` }} />
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Alertes</Text>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Text strong style={{ color: derived.voyantColor }}>{derived.voyantText}</Text>
                    <Tag style={{ borderRadius: 999, margin: 0 }}>
                      {filteredAlerts.length} {filteredAlerts.length > 1 ? 'items' : 'item'}
                    </Tag>
                  </div>
                </div>
              </div>

              <Segmented value={alertFilter} onChange={setAlertFilter} options={alertOptions} style={{ width: isMobile ? '100%' : 'auto' }} />
            </div>

            <Divider style={{ margin: '12px 0' }} />

            {filteredAlerts.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <WarningOutlined style={{ color: '#52c41a' }} />
                <Text style={{ fontSize: 12 }}>{alertFilter === 'all' ? 'Aucune alerte' : 'Aucune alerte pour ce filtre'}</Text>
              </div>
            ) : (
              <List
                size="small"
                dataSource={filteredAlerts.slice(0, isMobile ? 3 : 5)}
                renderItem={(a) => {
                  const c =
                    a.level === 'red'
                      ? '#ff4d4f'
                      : a.level === 'orange'
                        ? '#faad14'
                        : a.level === 'green'
                          ? '#52c41a'
                          : '#1890ff';

                  return (
                    <List.Item style={{ paddingLeft: 0, paddingRight: 0 }}>
                      <Space direction="vertical" size={0} style={{ width: '100%' }}>
                        <Space align="center" wrap>
                          <span style={{ width: 10, height: 10, borderRadius: 999, background: c, display: 'inline-block' }} />
                          <Text strong style={{ fontSize: 12 }}>{a.title}</Text>
                          <Badge count={a.level === 'red' ? '!' : ''} style={{ backgroundColor: c }} />
                        </Space>
                        <Text type="secondary" style={{ fontSize: 11 }}>{a.message}</Text>
                      </Space>
                    </List.Item>
                  );
                }}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* ====== CLUSTER ====== */}
      <Row gutter={[isMobile ? 12 : 16, isMobile ? 12 : 16]}>
        <Col xs={24}>
          <Card bordered={false} style={clusterCard} bodyStyle={{ padding: 0 }}>
            <div style={rimTop} />
            <div style={rimBottom} />

            {/* ✅ Courbe blanche en haut */}
            <svg style={topArcSvg} viewBox="0 0 1000 220" preserveAspectRatio="none">
              <defs>
                <filter id="arcGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3.2" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <path
                d="M 70 170 Q 500 18 930 170"
                fill="none"
                stroke="rgba(255,255,255,0.40)"
                strokeWidth="50"
                strokeLinecap="round"
                filter="url(#arcGlow)"
              />
              <path
                d="M 70 170 Q 500 18 930 170"
                fill="none"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </svg>

            <div style={clusterFace}>
              <div style={glassOverlay} />

              <div style={clusterBody}>
                <div style={clusterHud}>
                  <div style={hudLeft}>
                    <div style={hudDot(derived.voyantColor)} />
                    <span style={hudText}>
                      {periodeLabel} {lastUpdatedLabel ? `• MAJ ${lastUpdatedLabel}` : ''}
                    </span>

                    <Pill tone={derived.diffPositif ? 'success' : 'danger'}>
                      {derived.diffPositif ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                      {Math.abs(derived.pct).toFixed(1)}%
                    </Pill>

                    <Pill tone={cashNegatif ? 'danger' : cashPct < 20 ? 'warn' : 'success'}>
                      CASH {cashNegatif ? 'NÉGATIF' : cashPct < 20 ? 'RÉSERVE' : 'OK'}
                    </Pill>

                    <AntTooltip title="✅ Ariary (Ar) avec 2 décimales + GLOBAL via clear du mois">
                      <InfoCircleOutlined style={{ color: 'rgba(255,255,255,0.55)' }} />
                    </AntTooltip>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={indicatorIcon('◀', '#52c41a')}>◀</span>
                    <span style={indicatorIcon('⛭', 'rgba(255,255,255,0.55)')}>⛭</span>
                    <span style={indicatorIcon('▶', '#52c41a')}>▶</span>
                  </div>
                </div>

                <div style={clusterGrid}>
                  {/* GAUCHE : CA */}


                  {/* centre : Enc/Dec */}



                  <div>
                    <div style={dialWrap}>
                      <div style={gaugeFrame}>
                        <DarkDialGauge
                          value={derived.caMois}
                          max="auto"
                          size={isMobile ? 270 : 450}
                          bottomValue={formatMontantAbs(derived.caMois)}
                          subtitle={isGlobal ? 'CA global' : 'CA du mois'}
                          blueGlow
                        />
                      </div>
                    </div>
                    <div style={dialCaption}>
                      {isGlobal ? 'Période précédente:' : 'Mois précédent:'}{' '}
                      <span style={{ ...mono, fontWeight: 900 }}>{formatMontantAbs(derived.caMoisPrec)}</span>
                    </div>
                  </div>

                  <div style={rightStack}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                      {/* <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <TrafficLight state={derived.feu} />
                        <Pill tone={derived.feu === 'green' ? 'success' : derived.feu === 'orange' ? 'warn' : 'danger'}>
                          {derived.feu === 'green' ? 'OK' : derived.feu === 'orange' ? 'VIGILANCE' : 'ATTENTION'}
                        </Pill>
                      </div> */}
                    </div>

                    <div style={gaugeFrame}>
                      <DarkDialGauge
                        value={derived.enc}
                        max="auto"
                        size={isMobile ? 240 : 240}
                        bottomValue={formatMontantAbs(derived.enc)}
                        subtitle="Encaissements"
                        blueGlow
                        labelMode="auto"
                        accentColor="#52c41a"
                        needleColor="#52c41a"
                        showProgress
                      />
                    </div>

                    <div style={gaugeFrame}>
                      <DarkDialGauge
                        value={derived.dec}
                        max="auto"
                        size={isMobile ? 240 : 240}
                        bottomValue={formatMontantAbs(derived.dec)}
                        subtitle="Décaissements"
                        blueGlow
                        labelMode="auto"
                        accentColor="#faad14"
                        needleColor="#ff4d4f"
                        showProgress
                      />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <CashFuelGauge
                        cashDisponible={derived.cashDisponible}
                        cashPct={cashPct}
                        formatMontantSigned={formatMontantSigned}
                        isMobile={isMobile}
                      />
                    </div>

                    <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                      <MiniScreen label="ENC" value={formatMontantAbs(derived.enc)} tone="neutral" />
                      <MiniScreen
                        label="SOLDE"
                        value={formatMontantSigned(derived.soldeMois)}
                        tone={derived.soldeMois >= 0 ? 'success' : 'danger'}
                      />
                      <MiniScreen
                        label="VOYANT"
                        value={derived.voyantText}
                        tone={
                          derived.voyantText === 'ALERTE'
                            ? 'danger'
                            : derived.voyantText === 'VIGILANCE'
                              ? 'warn'
                              : 'success'
                        }
                      />
                    </div>
                  </div>



                  {/* droite : CASH */}




                </div>
              </div>
            </div>
          </Card>

        </Col>
      </Row>

      {/* ====== LIGNE 2 : autres KPI ====== */}
      <Row gutter={[isMobile ? 12 : 16, isMobile ? 12 : 16]} style={{ marginTop: 16 }}>
        {/* Charges principales */}
        <Col xs={24} lg={8}>
          <Card bordered={false} style={cardSoft}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Charges principales</Text>
                <div style={{ fontWeight: 900, fontSize: 18, marginTop: 6 }}>
                  {formatMontantAbs(derived.totalChargesMois)}
                </div>
              </div>
              <AntTooltip title="Somme des débits ACH (camembert par partenaire)">
                <InfoCircleOutlined style={{ color: 'rgba(0,0,0,0.45)' }} />
              </AntTooltip>
            </div>

            <div style={{ height: 170, marginTop: 10 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={derived.chargesPieData} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={2}>
                    {derived.chargesPieData.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value, _name, props) => {
                      const label = props?.payload?.fullName || props?.payload?.name || '';
                      return [formatMontantAbs(value), label];
                    }}
                    labelFormatter={() => ''}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ marginTop: 6 }}>
              {derived.chargesPieData.slice(0, 4).map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 8 }}>
                  <Text style={{ fontSize: 12 }}>
                    {c.fullName?.length > 18 ? `${c.fullName.slice(0, 16)}…` : c.fullName}
                  </Text>
                  <Text strong style={{ fontSize: 12 }}>{formatMontantAbs(c.value)}</Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Retards */}
        <Col xs={24} lg={8}>
          <Card bordered={false} style={cardSoft}>
            <Text type="secondary" style={{ fontSize: 12 }}>Retards</Text>

            <div style={{ marginTop: 12, display: 'grid', gap: 14 }}>
              {/* Clients */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Text strong>Clients en retard</Text>
                    <Tag color="cyan" style={{ borderRadius: 999, margin: 0 }}>VTE/PRE</Tag>
                    <Tag style={{ borderRadius: 999, margin: 0 }}>{Number(derived.clients?.count || 0)} partenaires</Tag>
                    <Tag style={{ borderRadius: 999, margin: 0 }}>{Number(derived.clients?.nbRetard || 0)} écritures</Tag>
                  </div>

                  <div style={{ fontWeight: 900, fontSize: 18, marginTop: 4 }}>
                    {formatMontantAbs(derived.clients?.retard || 0)}
                  </div>

                  {derived.clients?.oldestDate && (
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      Plus ancien: {dayjs(derived.clients.oldestDate).format('DD/MM/YYYY')}
                    </Text>
                  )}
                </div>

                <Space direction="vertical" size={8} style={{ alignItems: 'flex-end' }}>
                  <TrendTag trend={derived.clients?.retardTrend} invertColors />
                  <Button size="small" onClick={() => setOpenClients(true)}>Voir détails</Button>
                </Space>
              </div>

              {/* Fournisseurs */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Text strong>Fournisseurs en retard</Text>
                    <Tag color="gold" style={{ borderRadius: 999, margin: 0 }}>ACH</Tag>
                    <Tag style={{ borderRadius: 999, margin: 0 }}>{Number(derived.fournisseurs?.count || 0)} partenaires</Tag>
                    <Tag style={{ borderRadius: 999, margin: 0 }}>{Number(derived.fournisseurs?.nbRetard || 0)} écritures</Tag>
                  </div>

                  <div style={{ fontWeight: 900, fontSize: 18, marginTop: 4 }}>
                    {formatMontantAbs(derived.fournisseurs?.retard || 0)}
                  </div>

                  {derived.fournisseurs?.oldestDate && (
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      Plus ancien: {dayjs(derived.fournisseurs.oldestDate).format('DD/MM/YYYY')}
                    </Text>
                  )}
                </div>

                <Space direction="vertical" size={8} style={{ alignItems: 'flex-end' }}>
                  <TrendTag trend={derived.fournisseurs?.retardTrend} invertColors />
                  <Button size="small" onClick={() => setOpenFournisseurs(true)}>Voir détails</Button>
                </Space>
              </div>
            </div>

            <Divider style={{ margin: '14px 0' }} />
            <Text type="secondary" style={{ fontSize: 11 }}>
              Retards calculés sur les échéances (net par partenaire).
            </Text>
          </Card>
        </Col>

        {/* Résultat brut */}
        <Col xs={24} lg={8}>
          <Card bordered={false} style={cardSoft}>
            <Text type="secondary" style={{ fontSize: 12 }}>Résultat brut</Text>

            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: derived.resultatBrut >= 0 ? '#52c41a' : '#ff4d4f',
                  color: '#fff',
                }}
              >
                {derived.resultatBrut >= 0 ? <RiseOutlined /> : <FallOutlined />}
              </div>

              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: derived.resultatBrut >= 0 ? '#52c41a' : '#ff4d4f' }}>
                  {formatMontantSigned(derived.resultatBrut)}
                </div>
                <Text type="secondary" style={{ fontSize: 11 }}>Simple : CA – charges</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* DRAWERS */}
      <Drawer title="Détails — Clients en retard" open={openClients} onClose={() => setOpenClients(false)} width={isMobile ? '100%' : 560}>
        {(derived.clients?.top || []).length === 0 ? (
          <Text type="secondary">Aucun détail disponible.</Text>
        ) : (
          <List
            dataSource={derived.clients.top}
            renderItem={(it, idx) => (
              <List.Item key={`${it.partner || it.partenaire || 'client'}-${idx}`}>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <Text strong>{it.partner || it.partenaire || 'Client'}</Text>
                    <Text strong>{formatMontantAbs(it.montant || 0)}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 2 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>{typeof it.nb === 'number' ? `${it.nb} écritures` : '—'}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{it.date ? dayjs(it.date).format('DD/MM/YYYY') : ''}</Text>
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </Drawer>

      <Drawer title="Détails — Fournisseurs en retard" open={openFournisseurs} onClose={() => setOpenFournisseurs(false)} width={isMobile ? '100%' : 560}>
        {(derived.fournisseurs?.top || []).length === 0 ? (
          <Text type="secondary">Aucun détail disponible.</Text>
        ) : (
          <List
            dataSource={derived.fournisseurs.top}
            renderItem={(it, idx) => (
              <List.Item key={`${it.partner || it.partenaire || 'fourn'}-${idx}`}>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <Text strong>{it.partner || it.partenaire || 'Fournisseur'}</Text>
                    <Text strong>{formatMontantAbs(it.montant || 0)}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 2 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>{typeof it.nb === 'number' ? `${it.nb} écritures` : '—'}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{it.date ? dayjs(it.date).format('DD/MM/YYYY') : ''}</Text>
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </Drawer>

      <div style={{ marginTop: 14 }}>
        <Text type="secondary" style={{ fontSize: 11 }}>
          Page d’accueil = KPI & voyants. Les détails (écritures) vont dans “Trésorerie”, “Activité”, “Échéances”.
        </Text>
      </div>
    </div>
  );
}
