// import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// import {
//   Row,
//   Col,
//   Card,
//   Typography,
//   Grid,
//   Spin,
//   Alert,
//   DatePicker,
//   Input,
//   Button,
//   Tag,
//   Segmented,
//   Space,
//   Divider,
//   List,
//   Tooltip as AntTooltip,
// } from 'antd';
// import {
//   ReloadOutlined,
//   InfoCircleOutlined,
//   WarningOutlined,
//   ArrowUpOutlined,
//   ArrowDownOutlined,
// } from '@ant-design/icons';
// import dayjs from 'dayjs';
// import 'dayjs/locale/fr';
// import {
//   ResponsiveContainer,
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   BarChart,
//   Bar,
// } from 'recharts';
// import Statistic from 'antd';
// dayjs.locale('fr');

// const { Title, Text } = Typography;
// const { useBreakpoint } = Grid;

// const API_BASE =
//   (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
//   process.env.REACT_APP_API_URL ||
//   'http://localhost:8000';

// export default function Activite() {
//   const screens = useBreakpoint();
//   const isMobile = !screens.md;

//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   // ✅ filtres
//   const [periode, setPeriode] = useState(() => dayjs().startOf('month'));
//   const [partenaire, setPartenaire] = useState('');
//   const [docType, setDocType] = useState('ALL'); // ✅ ALL | VTE | PRE

//   const abortRef = useRef(null);

//   const token = useMemo(() => localStorage.getItem('token'), []);
//   const headers = useMemo(() => {
//     const h = { Accept: 'application/json' };
//     if (token) h.Authorization = `Bearer ${token}`;
//     return h;
//   }, [token]);

//   const formatMGA = useCallback((v) => {
//     const n = Number(v || 0);
//     return new Intl.NumberFormat('fr-FR', {
//       style: 'currency',
//       currency: 'MGA',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0,
//     }).format(n);
//   }, []);

//   const formatAxis = useCallback((v) => {
//     const n = Number(v || 0);
//     return new Intl.NumberFormat('fr-FR', {
//       notation: 'compact',
//       compactDisplay: 'short',
//       maximumFractionDigits: 1,
//     }).format(n);
//   }, []);

//   const buildUrl = useCallback(() => {
//     const sp = new URLSearchParams();
//     sp.set('year', String(periode.year()));
//     sp.set('month', String(periode.month() + 1));

//     if (partenaire.trim()) sp.set('partenaire', partenaire.trim());

//     // ✅ filtre VTE/PRE
//     if (docType && docType !== 'ALL') sp.set('docType', docType);

//     return `${API_BASE}/api/activite?${sp.toString()}`;
//   }, [periode, partenaire, docType]);

//   const fetchActivite = useCallback(async () => {
//     abortRef.current?.abort();
//     const controller = new AbortController();
//     abortRef.current = controller;

//     try {
//       setLoading(true);
//       setError('');

//       const url = buildUrl();
//       const res = await fetch(url, { signal: controller.signal, headers });

//       if (!res.ok) throw new Error(`Erreur ${res.status}: ${res.statusText}`);
//       const json = await res.json();

//       setData(json);
//     } catch (e) {
//       if (e?.name !== 'AbortError') setError(e?.message || 'Erreur inconnue');
//     } finally {
//       setLoading(false);
//     }
//   }, [buildUrl, headers]);

//   // load + debounce filtres
//   useEffect(() => {
//     const t = setTimeout(() => fetchActivite(), 250);
//     return () => clearTimeout(t);
//   }, [periode, partenaire, docType, fetchActivite]);

//   const derived = useMemo(() => {
//     if (!data) return null;

//     const caMois = Number(data.caTotalMois || 0);
//     const nbFactures = Number(data.nbFactures || 0);
//     const ticketMoyen = Number(data.ticketMoyen || 0);

//     const caParMois = Array.isArray(data.caParMois) ? data.caParMois : [];
//     const caParService = Array.isArray(data.caParService) ? data.caParService : [];
//     const notifications = Array.isArray(data.notifications) ? data.notifications : [];

//     // comparaison mois précédent (si possible, côté frontend: caParMois)
//     let trend = null;
//     if (caParMois.length >= 2) {
//       const prev = Number(caParMois[caParMois.length - 2]?.montant || 0);
//       const cur = Number(caParMois[caParMois.length - 1]?.montant || 0);
//       if (prev > 0) {
//         const pct = ((cur - prev) / prev) * 100;
//         trend = { pct, direction: pct >= 0 ? 'up' : 'down' };
//       }
//     }

//     return {
//       caMois,
//       nbFactures,
//       ticketMoyen,
//       caParMois,
//       caParService,
//       notifications,
//       trend,
//     };
//   }, [data]);

//   const ChartTooltip = ({ active, payload, label }) => {
//     if (!active || !payload?.length) return null;
//     return (
//       <div
//         style={{
//           background: 'rgba(0,0,0,0.85)',
//           border: '1px solid rgba(255,255,255,0.18)',
//           borderRadius: 12,
//           padding: 10,
//         }}
//       >
//         <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>{label}</div>
//         <div style={{ color: '#fff', fontWeight: 800, marginTop: 6 }}>
//           {formatMGA(payload[0].value)}
//         </div>
//       </div>
//     );
//   };

//   if (loading && !data) {
//     return (
//       <div style={{ minHeight: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
//         <Spin tip="Chargement de l’activité…" />
//         <Text type="secondary">Récupération des données</Text>
//       </div>
//     );
//   }

//   if (error || !data || !derived) {
//     return (
//       <Alert
//         type="error"
//         showIcon
//         message="Impossible de charger l’activité"
//         description={error}
//         action={
//           <Button size="small" icon={<ReloadOutlined />} onClick={fetchActivite}>
//             Réessayer
//           </Button>
//         }
//       />
//     );
//   }

//   const periodeLabel = periode.format('MMMM YYYY');

//   const cardSoft = {
//     borderRadius: 20,
//     boxShadow: '0 18px 45px rgba(15,23,42,0.12), 0 0 1px rgba(15,23,42,0.08)',
//   };

//   return (
//     <div style={{ padding: isMobile ? 8 : 24 }}>
//       {/* Header + filtres */}
//       <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
//         <div>
//           <Title level={3} style={{ margin: 0 }}>Activité</Title>


//           <Space size={6} wrap style={{ marginTop: 6 }}>
//             <Tag color="green" style={{ borderRadius: 999, margin: 0 }}>VTE = Vente</Tag>
//             <Tag color="purple" style={{ borderRadius: 999, margin: 0 }}>PRE = Prestation de service</Tag>
//           </Space>

//         </div>

//         <Space
//           direction={isMobile ? 'vertical' : 'horizontal'}
//           style={{ width: isMobile ? '100%' : 'auto', alignItems: isMobile ? 'stretch' : 'center' }}
//           wrap
//         >
//           <DatePicker
//             picker="month"
//             value={periode}
//             allowClear={false}
//             onChange={(v) => v && setPeriode(v.startOf('month'))}
//             style={{ width: isMobile ? '100%' : 190 }}
//           />

//           {/* ✅ Filtre VTE/PRE */}
//           <Segmented
//             value={docType}
//             onChange={setDocType}
//             options={[
//               { label: 'Tous', value: 'ALL' },
//               { label: 'VTE', value: 'VTE' },
//               { label: 'PRE', value: 'PRE' },
//             ]}
//             style={{ width: isMobile ? '100%' : 'auto' }}
//           />

//           <Input
//             placeholder="Filtrer par partenaire…"
//             allowClear
//             value={partenaire}
//             onChange={(e) => setPartenaire(e.target.value)}
//             style={{ width: isMobile ? '100%' : 260 }}
//           />

//           <Button icon={<ReloadOutlined />} onClick={fetchActivite} loading={loading}>
//             Actualiser
//           </Button>
//         </Space>
//       </div>

//       {/* Notifications */}
//       <Card bordered={false} style={{ ...cardSoft, marginBottom: 14 }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
//           <div>
//             <Text type="secondary" style={{ fontSize: 12 }}>Alertes activité</Text>
//             <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//               <Text strong style={{ fontSize: 14 }}>{derived.notifications.length}</Text>
//               <Text type="secondary" style={{ fontSize: 12 }}>signal(s)</Text>
//             </div>
//           </div>

//           <AntTooltip title="Ces alertes viennent du backend (baisse CA, inactivité, variabilité)">
//             <InfoCircleOutlined style={{ color: 'rgba(0,0,0,0.45)' }} />
//           </AntTooltip>
//         </div>

//         <Divider style={{ margin: '12px 0' }} />

//         {derived.notifications.length === 0 ? (
//           <Space>
//             <WarningOutlined style={{ color: '#52c41a' }} />
//             <Text type="secondary">Aucune alerte sur cette période.</Text>
//           </Space>
//         ) : (
//           <List
//             size="small"
//             dataSource={derived.notifications}
//             renderItem={(n, idx) => (
//               <List.Item key={idx} style={{ paddingLeft: 0, paddingRight: 0 }}>
//                 <div style={{ width: '100%' }}>
//                   <Space align="center" wrap>
//                     <Tag color="orange" style={{ borderRadius: 999, margin: 0 }}>
//                       {n.type || 'warning'}
//                     </Tag>
//                     <Text strong style={{ fontSize: 12 }}>{n.title}</Text>
//                     <Text type="secondary" style={{ fontSize: 11 }}>{n.subtitle}</Text>
//                   </Space>
//                   <div style={{ marginTop: 4 }}>
//                     <Text type="secondary" style={{ fontSize: 12 }}>{n.message}</Text>
//                   </div>
//                 </div>
//               </List.Item>
//             )}
//           />
//         )}
//       </Card>

//       {/* KPI */}
//       <Row gutter={[isMobile ? 12 : 16, isMobile ? 12 : 16]}>
//         <Col xs={24} lg={8}>
//           <Card bordered={false} style={{ ...cardSoft, background: 'radial-gradient(circle at 0% 0%, #074a73ff 0, #8bcdd7ff 55%, #1fa6c1ff 100%)', color: '#fff' }}>
//             <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>CA du mois</Text>
//             <div style={{ fontSize: 28, fontWeight: 900, marginTop: 8 }}>{formatMGA(derived.caMois)}</div>

//             {derived.trend && (
//               <Tag
//                 color={derived.trend.direction === 'up' ? 'green' : 'red'}
//                 style={{ borderRadius: 999, border: 'none', marginTop: 12 }}
//               >
//                 {derived.trend.direction === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}{' '}
//                 {Math.abs(derived.trend.pct).toFixed(1)}% vs mois précédent
//               </Tag>
//             )}

//             <Text style={{ display: 'block', marginTop: 10, color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>
//               Calcul : somme des <b>crédits</b> sur <b>{docType === 'ALL' ? 'VTE + PRE' : docType}</b>
//             </Text>
//           </Card>
//         </Col>

//         <Col xs={24} lg={8}>
//           <Card bordered={false} style={cardSoft}>
//             <Text type="secondary" style={{ fontSize: 12 }}>Nombre de factures</Text>
//             <div style={{ fontSize: 26, fontWeight: 900, marginTop: 8 }}>
//               {Number(derived.nbFactures).toLocaleString('fr-FR')}
//             </div>
//             <Text type="secondary" style={{ fontSize: 12 }}>
//               Factures = <b>COUNT DISTINCT nomDuCompte</b>
//             </Text>
//           </Card>
//         </Col>

//         <Col xs={24} lg={8}>
//           <Card bordered={false} style={cardSoft}>
//             <Text type="secondary" style={{ fontSize: 12 }}>Ticket moyen</Text>
//             <div style={{ fontSize: 26, fontWeight: 900, marginTop: 8 }}>{formatMGA(derived.ticketMoyen)}</div>
//             <Text type="secondary" style={{ fontSize: 12 }}>
//               Ticket = CA / nb factures
//             </Text>
//           </Card>
//         </Col>
//       </Row>

//       {/* Charts */}
//       <Row gutter={[isMobile ? 12 : 16, isMobile ? 12 : 16]} style={{ marginTop: 14 }}>
//         <Col xs={24} lg={12}>
//           <Card bordered={false} style={cardSoft}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
//               <div>
//                 <Title level={5} style={{ marginBottom: 4 }}>Évolution du CA</Title>
//                 <Text type="secondary" style={{ fontSize: 12 }}>6 derniers mois</Text>
//               </div>
//               <AntTooltip title="Survol = montant exact">
//                 <InfoCircleOutlined style={{ color: 'rgba(0,0,0,0.45)' }} />
//               </AntTooltip>
//             </div>

//             <div style={{ height: 260, marginTop: 12 }}>
//               <ResponsiveContainer width="100%" height="100%">
//                 <AreaChart data={derived.caParMois} margin={{ top: 10, right: 10, left: 16, bottom: 0 }}>
//                   <defs>
//                     <linearGradient id="caArea" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="5%" stopColor="#13c2c2" stopOpacity={0.35} />
//                       <stop offset="95%" stopColor="#13c2c2" stopOpacity={0} />
//                     </linearGradient>
//                   </defs>
//                   <CartesianGrid strokeDasharray="3 3" vertical={false} />
//                   <XAxis dataKey="label" tickLine={false} axisLine={false} />
//                   <YAxis tickFormatter={formatAxis} tickLine={false} axisLine={false} width={80} />
//                   <Tooltip content={<ChartTooltip />} />
//                   <Area type="monotone" dataKey="montant" stroke="#13c2c2" strokeWidth={2} fill="url(#caArea)" />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </div>
//           </Card>
//         </Col>

//         <Col xs={24} lg={12}>
//           <Card bordered={false} style={cardSoft}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
//               <div>
//                 <Title level={5} style={{ marginBottom: 4 }}>Top services (communication)</Title>
//                 <Text type="secondary" style={{ fontSize: 12 }}>
//                   Somme crédits + nb factures distinctes
//                 </Text>
//               </div>
//               <AntTooltip title="Ticket moyen par service = total / nb factures">
//                 <InfoCircleOutlined style={{ color: 'rgba(0,0,0,0.45)' }} />
//               </AntTooltip>
//             </div>

//             <div style={{ height: 260, marginTop: 12 }}>
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={derived.caParService} margin={{ top: 10, right: 10, left: 16, bottom: 0 }}>
//                   <CartesianGrid strokeDasharray="3 3" vertical={false} />
//                   <XAxis
//                     dataKey="label"
//                     tickLine={false}
//                     axisLine={false}
//                     interval={0}
//                     tick={{ fontSize: 11 }}
//                   />
//                   <YAxis tickFormatter={formatAxis} tickLine={false} axisLine={false} width={80} />
//                   <Tooltip
//                     content={({ active, payload, label }) => {
//                       if (!active || !payload?.length) return null;
//                       const row = payload[0].payload || {};
//                       return (
//                         <div style={{ background: 'rgba(0,0,0,0.85)', borderRadius: 12, padding: 10 }}>
//                           <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>{label}</div>
//                           <div style={{ color: '#fff', fontWeight: 800, marginTop: 6 }}>
//                             Total: {formatMGA(row.montant)}
//                           </div>
//                           <div style={{ color: 'rgba(255,255,255,0.85)', marginTop: 4, fontSize: 12 }}>
//                             Factures: {Number(row.nbFactures || 0).toLocaleString('fr-FR')}
//                           </div>
//                           <div style={{ color: 'rgba(255,255,255,0.85)', marginTop: 4, fontSize: 12 }}>
//                             Ticket: {formatMGA(row.ticketMoyen)}
//                           </div>
//                         </div>
//                       );
//                     }}
//                   />
//                   <Bar dataKey="montant" fill="#00ABC9" radius={[8, 8, 0, 0]} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>

//             <Divider style={{ margin: '10px 0' }} />

//             <div style={{ display: 'grid', gap: 8 }}>
//               {(derived.caParService || []).slice(0, 4).map((s, i) => (
//                 <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
//                   <Text style={{ fontSize: 12 }}>
//                     {String(s.label || '').length > 22 ? `${String(s.label).slice(0, 20)}…` : s.label}
//                   </Text>
//                   <Space size={10} wrap>
//                     <Tag style={{ borderRadius: 999, margin: 0 }}>
//                       {Number(s.nbFactures || 0)} fact.
//                     </Tag>
//                     <Text strong style={{ fontSize: 12 }}>{formatMGA(s.ticketMoyen)}</Text>
//                   </Space>
//                 </div>
//               ))}
//             </div>
//           </Card>
//         </Col>
//       </Row>
//     </div>
//   );
// }

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

const cleanBase = (s) => (s || "").replace(/\/+$/, "");
const API_BASE =
  cleanBase(process.env.REACT_APP_API_BASE) || "http://localhost:8000";


export default function Activite() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ✅ filtres
  const [periode, setPeriode] = useState(() => dayjs().startOf('month'));
  const [isGlobal, setIsGlobal] = useState(false);

  const [partenaire, setPartenaire] = useState('');
  const [docType, setDocType] = useState('ALL'); // ALL | VTE | PRE

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

  const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
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
          {formatMGA(payload[0].value)}
        </div>
      </div>
    );
  };

  if (loading && !data) {
    return (
      <div style={{ minHeight: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <Spin tip="Chargement de l’activité…" />
        <Text type="secondary">Récupération des données</Text>
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
      />
    );
  }

  const periodeLabel = isGlobal ? 'GLOBAL (toutes les données)' : periode.format('MMMM YYYY');

  const cardSoft = {
    borderRadius: 20,
    boxShadow: '0 18px 45px rgba(15,23,42,0.12), 0 0 1px rgba(15,23,42,0.08)',
  };

  return (
    <div style={{ padding: isMobile ? 8 : 24 }}>
      {/* Header + filtres */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Activité</Title>

          <Space size={8} wrap style={{ marginTop: 6 }}>
            <Tag color={isGlobal ? 'green' : 'blue'} style={{ borderRadius: 999, margin: 0 }}>
              {isGlobal ? 'GLOBAL' : periodeLabel}
            </Tag>
            <Tag color="green" style={{ borderRadius: 999, margin: 0 }}>VTE = Vente de produits</Tag>
            <Tag color="purple" style={{ borderRadius: 999, margin: 0 }}>PRE = Prestation de services</Tag>
          </Space>
        </div>

        <Space
          direction={isMobile ? 'vertical' : 'horizontal'}
          style={{ width: isMobile ? '100%' : 'auto', alignItems: isMobile ? 'stretch' : 'center' }}
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

          {/* Filtre VTE/PRE */}
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
            <Text type="secondary" style={{ fontSize: 12 }}>Alertes activité</Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Text strong style={{ fontSize: 14 }}>{derived.notifications.length}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>signal(s)</Text>
            </div>
          </div>

          <AntTooltip title="Ces alertes viennent du backend (baisse CA, inactivité, variabilité)">
            <InfoCircleOutlined style={{ color: 'rgba(0,0,0,0.45)' }} />
          </AntTooltip>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        {derived.notifications.length === 0 ? (
          <Space>
            <WarningOutlined style={{ color: '#52c41a' }} />
            <Text type="secondary">Aucune alerte sur cette période.</Text>
          </Space>
        ) : (
          <List
            size="small"
            dataSource={derived.notifications}
            renderItem={(n, idx) => (
              <List.Item key={idx} style={{ paddingLeft: 0, paddingRight: 0 }}>
                <div style={{ width: '100%' }}>
                  <Space align="center" wrap>
                    <Tag color="orange" style={{ borderRadius: 999, margin: 0 }}>
                      {n.type || 'warning'}
                    </Tag>
                    <Text strong style={{ fontSize: 12 }}>{n.title}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>{n.subtitle}</Text>
                  </Space>
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>{n.message}</Text>
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
          <Card bordered={false} style={{ ...cardSoft, background: 'radial-gradient(circle at 0% 0%, #074a73ff 0, #8bcdd7ff 55%, #1fa6c1ff 100%)', color: '#fff' }}>
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

            <Text style={{ display: 'block', marginTop: 10, color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>
              Calcul : somme des <b>crédits</b> sur <b>{docType === 'ALL' ? 'VTE + PRE' : docType}</b>
              {isGlobal ? ' (global)' : ' (mois)'}
            </Text>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card bordered={false} style={cardSoft}>
            <Text type="secondary" style={{ fontSize: 12 }}>Nombre de factures</Text>
            <div style={{ fontSize: 26, fontWeight: 900, marginTop: 8 }}>
              {Number(derived.nbFactures).toLocaleString('fr-FR')}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Factures = <b>COUNT DISTINCT nomDuCompte</b> {isGlobal ? '(global)' : '(mois)'}
            </Text>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card bordered={false} style={{ ...cardSoft, background: 'radial-gradient(circle at 0% 0%, #074a73ff 0, #8bcdd7ff 55%, #1fa6c1ff 100%)', color: '#fff' }}>
            <Text type="secondary" style={{ fontSize: 12, color: '#fff' }}>Ticket moyen</Text>
            <div style={{ fontSize: 26, fontWeight: 900, marginTop: 8 }}>{formatMGA(derived.ticketMoyen)}</div>
            <Text type="secondary" style={{ fontSize: 12 ,color:'#fff'}}>
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
                <Title level={5} style={{ marginBottom: 4 }}>Évolution du CA</Title>
                <Text type="secondary" style={{ fontSize: 12 }}>6 derniers mois</Text>
              </div>
              <AntTooltip title="Survol = montant exact">
                <InfoCircleOutlined style={{ color: 'rgba(0,0,0,0.45)' }} />
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={formatAxis} tickLine={false} axisLine={false} width={80} />
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
                <Title level={5} style={{ marginBottom: 4 }}>
                  Top services (communication) {isGlobal ? '(global)' : '(mois)'}
                </Title>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Somme crédits + nb factures distinctes
                </Text>
              </div>
              <AntTooltip title="Ticket moyen par service = total / nb factures">
                <InfoCircleOutlined style={{ color: 'rgba(0,0,0,0.45)' }} />
              </AntTooltip>
            </div>

            <div style={{ height: 260, marginTop: 12 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={derived.caParService} margin={{ top: 10, right: 10, left: 16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} interval={0} tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={formatAxis} tickLine={false} axisLine={false} width={80} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const row = payload[0].payload || {};
                      return (
                        <div style={{ background: 'rgba(0,0,0,0.85)', borderRadius: 12, padding: 10 }}>
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
