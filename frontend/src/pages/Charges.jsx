// import React, { useEffect, useMemo, useState, useCallback } from 'react';
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
//   Tooltip as AntTooltip,
//   Progress,
//   Space,
// } from 'antd';
// import {
//   ArrowUpOutlined,
//   ArrowDownOutlined,
//   ReloadOutlined,
//   InfoCircleOutlined,
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
//   PieChart,
//   Pie,
//   Cell,
//   Legend,
// } from 'recharts';

// dayjs.locale('fr');

// const { Title, Text } = Typography;
// const { useBreakpoint } = Grid;

// const API_BASE =
//   (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
//   process.env.REACT_APP_API_URL ||
//   'http://localhost:8000';

// const PIE_COLORS = ['#6bc6ffff', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#1890ff'];

// export default function Charges() {
//   const screens = useBreakpoint();
//   const isMobile = !screens.md;

//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   // ✅ Filtre par mois
//   const [periode, setPeriode] = useState(() => dayjs().startOf('month'));
//   // ✅ Filtre partenaire (texte)
//   const [partenaire, setPartenaire] = useState('');

//   // (optionnel) auth
//   const token = useMemo(() => localStorage.getItem('token'), []);
//   const headers = useMemo(() => {
//     const h = { Accept: 'application/json' };
//     if (token) h.Authorization = `Bearer ${token}`;
//     return h;
//   }, [token]);

//   const formatAr = useCallback((v) => `${Number(v || 0).toLocaleString('fr-FR')} Ar`, []);
//   const formatArAxis = useCallback((v) => {
//     const n = Number(v || 0);
//     return new Intl.NumberFormat('fr-FR', {
//       notation: 'compact',
//       compactDisplay: 'short',
//       maximumFractionDigits: 1,
//     }).format(n);
//   }, []);

//   const buildUrl = useCallback((params = {}) => {
//     const sp = new URLSearchParams();

//     if (params.periode) {
//       sp.set('year', String(params.periode.year()));
//       sp.set('month', String(params.periode.month() + 1)); // 1..12
//     }

//     if (params.partenaire && params.partenaire.trim()) {
//       sp.set('partenaire', params.partenaire.trim());
//     }

//     const qs = sp.toString();
//     return qs ? `${API_BASE}/api/charges?${qs}` : `${API_BASE}/api/charges`;
//   }, []);

//   const fetchCharges = useCallback(
//     async (params = {}, retryCount = 0) => {
//       const controller = new AbortController();
//       let timeoutId;

//       const url = buildUrl(params);
//       const cacheKey = `charges_cache:${url}`;

//       try {
//         setLoading(true);
//         setError('');
//         timeoutId = setTimeout(() => controller.abort(), 10000);

//         const res = await fetch(url, { signal: controller.signal, headers });
//         if (!res.ok) throw new Error(`Erreur ${res.status}: chargement charges impossible`);

//         const json = await res.json();
//         setData(json);

//         localStorage.setItem(cacheKey, JSON.stringify({ data: json, timestamp: Date.now() }));
//       } catch (e) {
//         // fallback cache (1h)
//         try {
//           const cache = localStorage.getItem(cacheKey);
//           if (cache) {
//             const { data: cached, timestamp } = JSON.parse(cache);
//             if (Date.now() - timestamp < 3600000) {
//               setData(cached);
//               setError('');
//               return;
//             }
//           }
//         } catch (_) {}

//         if (retryCount < 2 && e?.name !== 'AbortError') {
//           setTimeout(() => fetchCharges(params, retryCount + 1), 1500 * (retryCount + 1));
//         } else {
//           setError(e?.name === 'AbortError' ? 'Timeout du serveur' : (e?.message || 'Erreur inconnue'));
//         }
//       } finally {
//         if (timeoutId) clearTimeout(timeoutId);
//         setLoading(false);
//       }
//     },
//     [buildUrl, headers]
//   );

//   // initial
//   useEffect(() => {
//     fetchCharges({ periode, partenaire: '' }, 0);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // debounce filtres
//   useEffect(() => {
//     const t = setTimeout(() => {
//       fetchCharges({ periode, partenaire }, 0);
//     }, 350);
//     return () => clearTimeout(t);
//   }, [periode, partenaire, fetchCharges]);

//   const resetFilters = () => {
//     const p = dayjs().startOf('month');
//     setPeriode(p);
//     setPartenaire('');
//     fetchCharges({ periode: p, partenaire: '' }, 0);
//   };

//   const derived = useMemo(() => {
//     if (!data) return null;

//     const totalChargesMois = Number(data.totalChargesMois ?? 0);
//     const totalChargesPrevMois = Number(data.totalChargesPrevMois ?? 0);
//     const variationChargesPourcent = Number(data.variationChargesPourcent ?? 0);

//     const chargesParMois = Array.isArray(data.chargesParMois) ? data.chargesParMois : [];
//     const parPartenaire = Array.isArray(data.parPartenaire) ? data.parPartenaire : [];

//     const totalGlobal = Number(data.totalGlobal ?? 0); // ✅ total charges (debits) sur période
//     const totalPartenaires = Number(data.totalPartenaires ?? parPartenaire.length);

//     const chargesEnHausse = totalChargesMois > totalChargesPrevMois;

//     const maxChargesMois = chargesParMois.length
//       ? Math.max(...chargesParMois.map((p) => Number(p.montant || 0)))
//       : 0;

//     const totalChargesHistorique = chargesParMois.reduce((sum, m) => sum + Number(m.montant || 0), 0);

//     const maxPartner = parPartenaire.length
//       ? Math.max(...parPartenaire.map((p) => Number(p.totalSolde || 0)))
//       : 0;

//     const chargesTrend = chargesParMois.map((m) => ({
//       label: m.label,
//       montant: Number(m.montant || 0),
//     }));

//     const partnersSorted = [...parPartenaire]
//       .map((p) => ({ partner: p.partner, total: Number(p.totalSolde || 0) })) // ✅ totalSolde = total debit backend
//       .sort((a, b) => b.total - a.total);

//     const top = partnersSorted.slice(0, 6);
//     const reste = partnersSorted.slice(6).reduce((s, x) => s + x.total, 0);

//     const partnersPie = [
//       ...top.map((p, idx) => ({
//         name: p.partner?.length > 14 ? `${p.partner.slice(0, 12)}…` : p.partner,
//         fullName: p.partner,
//         value: p.total,
//         color: PIE_COLORS[idx % PIE_COLORS.length],
//       })),
//       ...(reste > 0 ? [{ name: 'Autres', fullName: 'Autres', value: reste, color: 'rgba(0,0,0,0.25)' }] : []),
//     ];

//     const jaugeChargesPct = maxChargesMois ? Math.min((totalChargesMois / maxChargesMois) * 100, 100) : 0;
//     const jaugeVariationPct = Math.min(Math.abs(variationChargesPourcent), 100);

//     const notifications = Array.isArray(data.notifications) ? data.notifications : [];

//     return {
//       totalChargesMois,
//       totalChargesPrevMois,
//       variationChargesPourcent,
//       chargesParMois,
//       parPartenaire,
//       totalGlobal,
//       totalPartenaires,
//       chargesEnHausse,
//       maxChargesMois,
//       totalChargesHistorique,
//       maxPartner,
//       chargesTrend,
//       partnersPie,
//       jaugeChargesPct,
//       jaugeVariationPct,
//       notifications,
//     };
//   }, [data]);

//   const ChartTooltip = ({ active, payload, label }) => {
//     if (!active || !payload?.length) return null;
//     const v = payload[0]?.value ?? 0;
//     return (
//       <div
//         style={{
//           backgroundColor: 'rgba(0,0,0,0.85)',
//           border: '1px solid rgba(255,255,255,0.15)',
//           borderRadius: 10,
//           padding: 10,
//         }}
//       >
//         <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{label}</div>
//         <div style={{ color: '#fff', fontWeight: 900, marginTop: 4 }}>{formatAr(v)}</div>
//       </div>
//     );
//   };

//   if (loading && !data) {
//     return (
//       <div style={{ minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
//         <Spin tip="Chargement des charges..." />
//         <Text type="secondary">Récupération des dernières données</Text>
//       </div>
//     );
//   }

//   if (error || !data || !derived) {
//     return (
//       <Alert
//         type="error"
//         message="Impossible de charger les charges"
//         description={error}
//         showIcon
//         action={
//           <Button size="small" icon={<ReloadOutlined />} onClick={() => fetchCharges({ periode, partenaire }, 0)}>
//             Réessayer
//           </Button>
//         }
//       />
//     );
//   }

//   const periodeLabel = periode.format('MMMM YYYY');

//   return (
//     <div style={{ padding: isMobile ? 8 : 24 }}>
//       {/* Header */}
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
//         <div>
//           <Title level={3} style={{ margin: 0 }}>Charges</Title>
//           <Text type="secondary">Somme des débits des comptes <b>ACH%</b> (charges)</Text>
//         </div>

//         <div style={{ display: 'flex', gap: 8 }}>
//           <Button icon={<ReloadOutlined />} onClick={() => fetchCharges({ periode, partenaire }, 0)} loading={loading}>
//             Actualiser
//           </Button>
//           <Button onClick={resetFilters} disabled={!partenaire && periode.isSame(dayjs(), 'month')}>
//             Réinitialiser
//           </Button>
//         </div>
//       </div>

//       {/* ✅ ALERTES (7) + (8) */}
//       {(derived.notifications || []).length > 0 && (
//         <div style={{ marginBottom: 16 }}>
//           {derived.notifications.map((n, idx) => {
//             const type =
//               n.type === 'error' || n.type === 'critical'
//                 ? 'error'
//                 : n.type === 'info'
//                   ? 'info'
//                   : 'warning';

//             const meta = n?.meta || {};

//             const isSpike = n.code === 'CHARGE_SPEC_ALERTE';
//             const pct = typeof meta.pct === 'number' ? meta.pct : null;

//             return (
//               <Alert
//                 key={`${n.code || 'notif'}-${idx}`}
//                 type={type}
//                 showIcon
//                 style={{ marginBottom: 12, borderRadius: 14 }}
//                 message={
//                   <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
//                     <span>{n.title || 'Notification'}</span>
//                     {n.subtitle && (
//                       <Tag color={type === 'error' ? 'red' : type === 'warning' ? 'orange' : 'blue'} style={{ borderRadius: 999 }}>
//                         {n.subtitle}
//                       </Tag>
//                     )}
//                   </div>
//                 }
//                 description={
//                   <div>
//                     <div>« {n.message || ''} »</div>

//                     {/* (7) */}
//                     {n.code === 'CHARGES_HAUSSE_10' && (
//                       <div style={{ marginTop: 6, fontSize: 12, opacity: 0.9 }}>
//                         {typeof meta.variationChargesPourcent === 'number' && (
//                           <span style={{ marginRight: 12 }}>
//                             Variation : <b>{meta.variationChargesPourcent.toFixed(1)}%</b>
//                           </span>
//                         )}
//                         {typeof meta.totalChargesMois === 'number' && (
//                           <span style={{ marginRight: 12 }}>
//                             Mois : <b>{formatAr(meta.totalChargesMois)}</b>
//                           </span>
//                         )}
//                         {typeof meta.totalChargesPrevMois === 'number' && (
//                           <span>
//                             Mois précédent : <b>{formatAr(meta.totalChargesPrevMois)}</b>
//                           </span>
//                         )}
//                       </div>
//                     )}

//                     {/* (8) */}
//                     {isSpike && (
//                       <div style={{ marginTop: 6, fontSize: 12, opacity: 0.9 }}>
//                         {meta.nomDuCompte && (
//                           <span style={{ marginRight: 12 }}>
//                             Poste : <b>{meta.nomDuCompte}</b>
//                           </span>
//                         )}
//                         {pct !== null && (
//                           <span style={{ marginRight: 12 }}>
//                             Écart : <b>+{pct.toFixed(1)}%</b>
//                           </span>
//                         )}
//                         {typeof meta.cur === 'number' && (
//                           <span style={{ marginRight: 12 }}>
//                             Ce mois : <b>{formatAr(meta.cur)}</b>
//                           </span>
//                         )}
//                         {typeof meta.avg === 'number' && (
//                           <span>
//                             Moy. : <b>{formatAr(meta.avg)}</b>
//                           </span>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 }
//               />
//             );
//           })}
//         </div>
//       )}

//       <Row gutter={[isMobile ? 16 : 24, isMobile ? 16 : 24]}>
//         {/* HERO KPI */}
//         <Col span={24}>
//           <Card
//             bordered={false}
//             style={{
//               borderRadius: 24,
//               boxShadow: '0 22px 45px rgba(15,23,42,0.18),0 0 1px rgba(15,23,42,0.10)',
//               background: 'radial-gradient(circle at 0% 0%, #032338ff 0, #4095a6ff 45%, #00ABC9 100%)',
//               color: '#fff',
//               overflow: 'hidden',
//             }}
//           >
//             <div style={{ marginBottom: 12 }}>
//               <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
//                 <div>
//                   <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Période</Text>
//                   <div style={{ marginTop: 6 }}>
//                     <DatePicker
//                       picker="month"
//                       value={periode}
//                       allowClear={false}
//                       onChange={(v) => v && setPeriode(v.startOf('month'))}
//                       style={{ minWidth: isMobile ? '100%' : 190 }}
//                     />
//                     <Tag style={{ marginLeft: 8, borderRadius: 999 }}>{periodeLabel}</Tag>
//                   </div>
//                 </div>

//                 <div style={{ minWidth: isMobile ? '100%' : 260 }}>
//                   <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Partenaire (filtre)</Text>
//                   <div style={{ marginTop: 6 }}>
//                     <Input
//                       placeholder="Ex : JIRAMA, fournisseur X..."
//                       allowClear
//                       value={partenaire}
//                       onChange={(e) => setPartenaire(e.target.value)}
//                     />
//                   </div>
//                 </div>
//               </Space>
//             </div>

//             <Row gutter={[16, 16]}>
//               {/* Charges mois */}
//               <Col xs={24} md={8}>
//                 <div style={{ padding: 8 }}>
//                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                     <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Charges du mois (ACH)</Text>
//                     <AntTooltip title="Total des charges (somme des débits) sur la période">
//                       <InfoCircleOutlined style={{ color: 'rgba(255,255,255,0.6)' }} />
//                     </AntTooltip>
//                   </div>

//                   <Title level={2} style={{ color: '#fff', margin: '10px 0 8px' }}>
//                     {formatAr(derived.totalChargesMois)}
//                   </Title>

//                   <Tag
//                     color={derived.chargesEnHausse ? 'red' : 'green'}
//                     style={{ borderRadius: 999, border: 'none', padding: '4px 12px' }}
//                   >
//                     {derived.chargesEnHausse ? <ArrowUpOutlined /> : <ArrowDownOutlined />}{' '}
//                     {derived.variationChargesPourcent > 0 ? '+' : ''}
//                     {derived.variationChargesPourcent.toFixed(1)}% vs mois précédent
//                   </Tag>

//                   <div style={{ marginTop: 12 }}>
//                     <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Niveau vs max historique</Text>
//                     <Progress
//                       percent={derived.jaugeChargesPct}
//                       showInfo={false}
//                       trailColor="rgba(255,255,255,0.12)"
//                       strokeColor={{ '0%': '#fa8c16', '100%': '#ff4d4f' }}
//                       style={{ marginTop: 6 }}
//                     />
//                   </div>

//                   <div style={{ marginTop: 10, color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>
//                     Mois précédent : <strong>{formatAr(derived.totalChargesPrevMois)}</strong>
//                   </div>
//                 </div>
//               </Col>

//               {/* Variation (jauge) */}
//               <Col xs={24} md={8}>
//                 <div style={{ padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
//                   <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 10 }}>
//                     Variation (intensité)
//                   </Text>

//                   <Progress
//                     type="circle"
//                     percent={derived.jaugeVariationPct}
//                     size={170}
//                     strokeWidth={10}
//                     trailColor="rgba(255,255,255,0.10)"
//                     strokeColor={derived.variationChargesPourcent >= 0 ? '#ff4d4f' : '#52c41a'}
//                     format={() => (
//                       <div style={{ textAlign: 'center', lineHeight: 1.1 }}>
//                         <div style={{ fontWeight: 900, fontSize: 22, color: '#fff' }}>
//                           {derived.variationChargesPourcent > 0 ? '+' : ''}
//                           {derived.variationChargesPourcent.toFixed(1)}%
//                         </div>
//                         <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>
//                           {derived.variationChargesPourcent >= 0 ? 'Hausse' : 'Baisse'}
//                         </div>
//                       </div>
//                     )}
//                   />
//                 </div>
//               </Col>

//               {/* KPIs secondaires */}
//               <Col xs={24} md={8}>
//                 <div
//                   style={{
//                     padding: 16,
//                     borderRadius: 18,
//                     background: 'rgba(0,0,0,0.35)',
//                     border: '1px solid rgba(255,255,255,0.12)',
//                     height: '100%',
//                   }}
//                 >
//                   <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>
//                     Indicateurs
//                   </Text>

//                   <div style={{ marginTop: 14 }}>
//                     <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: 13 }}>
//                       <span>Total charges historique</span>
//                       <strong style={{ color: '#ffd666' }}>{formatAr(derived.totalChargesHistorique)}</strong>
//                     </div>
//                     <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, color: '#fff', fontSize: 13 }}>
//                       <span>Catégorie des charges (mois)</span>
//                       <strong style={{ color: '#52c41a' }}>{derived.parPartenaire.length}</strong>
//                     </div>
//                     <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, color: '#fff', fontSize: 13 }}>
//                       <span>Total charges (mois)</span>
//                       <strong style={{ color: '#69c0ff' }}>{formatAr(derived.totalGlobal)}</strong>
//                     </div>
//                   </div>
//                 </div>
//               </Col>
//             </Row>
//           </Card>
//         </Col>

//         {/* Graph mensuel */}
//         <Col xs={24} lg={12}>
//           <Card bordered={false} style={{ borderRadius: 20, boxShadow: '0 18px 45px rgba(15,23,42,0.12), 0 0 1px rgba(15,23,42,0.08)' }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
//               <div>
//                 <Title level={5} style={{ marginBottom: 4 }}>Évolution des charges</Title>
//                 <Text type="secondary" style={{ fontSize: 12 }}>Montant par mois (historique).</Text>
//               </div>
//               <AntTooltip title="Axe Y en format compact, survol = montant complet">
//                 <InfoCircleOutlined style={{ color: 'rgba(0,0,0,0.45)' }} />
//               </AntTooltip>
//             </div>

//             <div style={{ height: 260, marginTop: 12 }}>
//               <ResponsiveContainer width="100%" height="100%">
//                 <AreaChart data={derived.chargesTrend} margin={{ top: 10, right: 10, left: 22, bottom: 0 }}>
//                   <defs>
//                     <linearGradient id="chargesArea" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="5%" stopColor="#00ABC9" stopOpacity={0.35} />
//                       <stop offset="95%" stopColor="#005C97" stopOpacity={0} />
//                     </linearGradient>
//                   </defs>

//                   <CartesianGrid strokeDasharray="3 3" vertical={false} />
//                   <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} interval={isMobile ? 'preserveStartEnd' : 0} />
//                   <YAxis
//                     width={90}
//                     tickLine={false}
//                     axisLine={false}
//                     tickMargin={8}
//                     allowDecimals={false}
//                     tickFormatter={formatArAxis}
//                     tick={{ fontSize: 11, fill: 'rgba(0,0,0,0.60)' }}
//                   />
//                   <Tooltip content={<ChartTooltip />} />
//                   <Area type="monotone" dataKey="montant" stroke="#00ABC9" strokeWidth={2} fill="url(#chargesArea)" />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </div>
//           </Card>
//         </Col>

//         {/* Donut catégories */}
//         <Col xs={24} lg={12}>
//           <Card bordered={false} style={{ borderRadius: 20, boxShadow: '0 18px 45px rgba(15,23,42,0.12), 0 0 1px rgba(15,23,42,0.08)' }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
//               <div>
//                 <Title level={5} style={{ marginBottom: 4 }}>Répartition des charges par catégorie</Title>
//                 <Text type="secondary" style={{ fontSize: 12 }}>Top catégories + “Autres”.</Text>
//               </div>
//               <AntTooltip title="Total charges (centre du donut)">
//                 <InfoCircleOutlined style={{ color: 'rgba(0,0,0,0.45)' }} />
//               </AntTooltip>
//             </div>

//             <div style={{ height: 280, marginTop: 12 }}>
//               <ResponsiveContainer width="100%" height="100%">
//                 <PieChart>
//                   <Pie
//                     data={derived.partnersPie}
//                     dataKey="value"
//                     nameKey="name"
//                     cx="50%"
//                     cy="50%"
//                     innerRadius={80}
//                     outerRadius={110}
//                     paddingAngle={2}
//                   >
//                     {derived.partnersPie.map((entry, idx) => (
//                       <Cell key={`pp-${idx}`} fill={entry.color} />
//                     ))}
//                   </Pie>

//                   <text
//                     x="50%"
//                     y="50%"
//                     textAnchor="middle"
//                     dominantBaseline="middle"
//                     style={{ fontSize: 14, fontWeight: 900, fill: 'rgba(0,0,0,0.82)' }}
//                   >
//                     {formatAr(derived.totalGlobal)}
//                   </text>
//                   <text
//                     x="50%"
//                     y="50%"
//                     dy={18}
//                     textAnchor="middle"
//                     dominantBaseline="middle"
//                     style={{ fontSize: 12, fill: 'rgba(0,0,0,0.45)' }}
//                   >
//                     Total
//                   </text>

//                   <Tooltip
//                     formatter={(value, name) => [formatAr(value), name]}
//                     labelFormatter={(label) => {
//                       const it = derived.partnersPie.find((x) => x.name === label);
//                       return it?.fullName || label;
//                     }}
//                   />
//                   <Legend />
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>
//           </Card>
//         </Col>

//         {/* Liste par partenaire */}
//         <Col span={24}>
//           <Card bordered={false} style={{ borderRadius: 20, boxShadow: '0 18px 45px rgba(15,23,42,0.12), 0 0 1px rgba(15,23,42,0.08)' }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
//               <div>
//                 <Title level={5} style={{ marginBottom: 4 }}>Charges par catégorie</Title>
//                 <Text type="secondary" style={{ fontSize: 12 }}>
//                   Filtre mois + catégories (comptes ACH%).
//                 </Text>
//               </div>
//               <Tag color="blue" style={{ borderRadius: 999 }}>
//                 {derived.totalPartenaires} catégories
//               </Tag>
//             </div>

//             <Row gutter={[16, 12]} style={{ marginTop: 16 }}>
//               <Col xs={24} md={12}>
//                 <Text style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>Total charges (mois)</Text>
//                 <div style={{ fontSize: 24, fontWeight: 900 }}>{formatAr(derived.totalGlobal)}</div>
//               </Col>
//               <Col xs={24} md={12}>
//                 <Text style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>Nombre de catégories</Text>
//                 <div style={{ fontSize: 22, fontWeight: 900 }}>{derived.totalPartenaires}</div>
//               </Col>
//             </Row>

//             <div style={{ marginTop: 16 }}>
//               {derived.parPartenaire.length === 0 && (
//                 <Text type="secondary" style={{ fontSize: 13 }}>
//                   Aucun résultat trouvé avec les filtres actuels.
//                 </Text>
//               )}

//               {derived.parPartenaire.map((p, index) => {
//                 const montant = Number(p.totalSolde || 0);
//                 const ratio = derived.maxPartner ? (montant / derived.maxPartner) * 100 : 0;

//                 return (
//                   <div
//                     key={`${p.partner}-${index}`}
//                     style={{
//                       padding: '10px 0',
//                       borderBottom: index === derived.parPartenaire.length - 1 ? 'none' : '1px solid rgba(0,0,0,0.04)',
//                     }}
//                   >
//                     <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
//                       <Text style={{ fontSize: 13 }}>
//                         {p.partner?.length > 34 ? `${p.partner.slice(0, 32)}…` : p.partner}
//                       </Text>
//                       <Text strong style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
//                         {formatAr(montant)}
//                       </Text>
//                     </div>

//                     <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
//                       <Progress
//                         percent={Math.max(ratio, 1)}
//                         showInfo={false}
//                         strokeColor="#fa8c16"
//                         trailColor="rgba(0,0,0,0.06)"
//                         size="small"
//                       />
//                       <Text type="secondary" style={{ fontSize: 12, minWidth: 46 }}>
//                         {ratio.toFixed(0)}%
//                       </Text>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </Card>
//         </Col>
//       </Row>
//     </div>
//   );
// }


import React, { useEffect, useMemo, useState, useCallback } from 'react';
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
  Tooltip as AntTooltip,
  Progress,
  Space,
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
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
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

dayjs.locale('fr');

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const cleanBase = (s) => (s || "").replace(/\/+$/, "");
const API_BASE =
  cleanBase(process.env.REACT_APP_API_BASE);


const PIE_COLORS = ['#6bc6ffff', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#1890ff'];

export default function Charges() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ✅ filtre mois OU global
  const [periode, setPeriode] = useState(() => dayjs().startOf('month'));
  const [isGlobal, setIsGlobal] = useState(false);

  // ✅ filtre partenaire
  const [partenaire, setPartenaire] = useState('');

  const token = useMemo(() => localStorage.getItem('token'), []);
  const headers = useMemo(() => {
    const h = { Accept: 'application/json' };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const formatAr = useCallback((v) => `${Number(v || 0).toLocaleString('fr-FR')} Ar`, []);
  const formatArAxis = useCallback((v) => {
    const n = Number(v || 0);
    return new Intl.NumberFormat('fr-FR', {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1,
    }).format(n);
  }, []);

  const buildUrl = useCallback((params = {}) => {
    const sp = new URLSearchParams();

    if (params.isGlobal) {
      sp.set('mode', 'global');
    } else if (params.periode) {
      sp.set('year', String(params.periode.year()));
      sp.set('month', String(params.periode.month() + 1)); // 1..12
    }

    if (params.partenaire && params.partenaire.trim()) {
      sp.set('partenaire', params.partenaire.trim());
    }

    const qs = sp.toString();
    return qs ? `${API_BASE}/api/charges?${qs}` : `${API_BASE}/api/charges`;
  }, []);

  const fetchCharges = useCallback(
    async (params = {}, retryCount = 0) => {
      const controller = new AbortController();
      let timeoutId;

      const url = buildUrl(params);
      const cacheKey = `charges_cache:${url}`;

      try {
        setLoading(true);
        setError('');
        timeoutId = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(url, { signal: controller.signal, headers });
        if (!res.ok) throw new Error(`Erreur ${res.status}: chargement charges impossible`);

        const json = await res.json();
        setData(json);

        localStorage.setItem(cacheKey, JSON.stringify({ data: json, timestamp: Date.now() }));
      } catch (e) {
        try {
          const cache = localStorage.getItem(cacheKey);
          if (cache) {
            const { data: cached, timestamp } = JSON.parse(cache);
            if (Date.now() - timestamp < 3600000) {
              setData(cached);
              setError('');
              return;
            }
          }
        } catch (_) {}

        if (retryCount < 2 && e?.name !== 'AbortError') {
          setTimeout(() => fetchCharges(params, retryCount + 1), 1500 * (retryCount + 1));
        } else {
          setError(e?.name === 'AbortError' ? 'Timeout du serveur' : (e?.message || 'Erreur inconnue'));
        }
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
        setLoading(false);
      }
    },
    [buildUrl, headers]
  );

  // initial
  useEffect(() => {
    fetchCharges({ periode, partenaire: '', isGlobal }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // debounce filtres
  useEffect(() => {
    const t = setTimeout(() => {
      fetchCharges({ periode, partenaire, isGlobal }, 0);
    }, 350);
    return () => clearTimeout(t);
  }, [periode, partenaire, isGlobal, fetchCharges]);

  const resetFilters = () => {
    const p = dayjs().startOf('month');
    setIsGlobal(false);
    setPeriode(p);
    setPartenaire('');
    fetchCharges({ periode: p, partenaire: '', isGlobal: false }, 0);
  };

  const derived = useMemo(() => {
    if (!data) return null;

    const totalChargesMois = Number(data.totalChargesMois ?? 0);
    const totalChargesPrevMois = data.totalChargesPrevMois == null ? null : Number(data.totalChargesPrevMois ?? 0);
    const variationChargesPourcent = Number(data.variationChargesPourcent ?? 0);

    const chargesParMois = Array.isArray(data.chargesParMois) ? data.chargesParMois : [];
    const parPartenaire = Array.isArray(data.parPartenaire) ? data.parPartenaire : [];

    const totalGlobal = Number(data.totalGlobal ?? 0);
    const totalPartenaires = Number(data.totalPartenaires ?? parPartenaire.length);

    const chargesEnHausse =
      totalChargesPrevMois != null ? totalChargesMois > totalChargesPrevMois : false;

    const maxChargesMois = chargesParMois.length
      ? Math.max(...chargesParMois.map((p) => Number(p.montant || 0)))
      : 0;

    const totalChargesHistorique = chargesParMois.reduce((sum, m) => sum + Number(m.montant || 0), 0);

    const maxPartner = parPartenaire.length
      ? Math.max(...parPartenaire.map((p) => Number(p.totalSolde || 0)))
      : 0;

    const chargesTrend = chargesParMois.map((m) => ({
      label: m.label,
      montant: Number(m.montant || 0),
    }));

    const partnersSorted = [...parPartenaire]
      .map((p) => ({ partner: p.partner, total: Number(p.totalSolde || 0) }))
      .sort((a, b) => b.total - a.total);

    const top = partnersSorted.slice(0, 6);
    const reste = partnersSorted.slice(6).reduce((s, x) => s + x.total, 0);

    const partnersPie = [
      ...top.map((p, idx) => ({
        name: p.partner?.length > 14 ? `${p.partner.slice(0, 12)}…` : p.partner,
        fullName: p.partner,
        value: p.total,
        color: PIE_COLORS[idx % PIE_COLORS.length],
      })),
      ...(reste > 0 ? [{ name: 'Autres', fullName: 'Autres', value: reste, color: 'rgba(0,0,0,0.25)' }] : []),
    ];

    // ✅ En mode GLOBAL : on évite des jauges "mensuelles" incohérentes
    const jaugeChargesPct = !isGlobal && maxChargesMois
      ? Math.min((totalChargesMois / maxChargesMois) * 100, 100)
      : 0;

    const jaugeVariationPct = !isGlobal ? Math.min(Math.abs(variationChargesPourcent), 100) : 0;

    const notifications = Array.isArray(data.notifications) ? data.notifications : [];

    return {
      totalChargesMois,
      totalChargesPrevMois,
      variationChargesPourcent,
      chargesParMois,
      parPartenaire,
      totalGlobal,
      totalPartenaires,
      chargesEnHausse,
      maxChargesMois,
      totalChargesHistorique,
      maxPartner,
      chargesTrend,
      partnersPie,
      jaugeChargesPct,
      jaugeVariationPct,
      notifications,
      mode: data?.periode?.mode || (isGlobal ? 'global' : 'month'),
    };
  }, [data, isGlobal]);

  const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const v = payload[0]?.value ?? 0;
    return (
      <div
        style={{
          backgroundColor: 'rgba(0,0,0,0.85)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 10,
          padding: 10,
        }}
      >
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{label}</div>
        <div style={{ color: '#fff', fontWeight: 900, marginTop: 4 }}>{formatAr(v)}</div>
      </div>
    );
  };

  if (loading && !data) {
    return (
      <div style={{ minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <Spin tip="Chargement des charges..." />
        <Text type="secondary">Récupération des dernières données</Text>
      </div>
    );
  }

  if (error || !data || !derived) {
    return (
      <Alert
        type="error"
        message="Impossible de charger les charges"
        description={error}
        showIcon
        action={
          <Button size="small" icon={<ReloadOutlined />} onClick={() => fetchCharges({ periode, partenaire, isGlobal }, 0)}>
            Réessayer
          </Button>
        }
      />
    );
  }

  const periodeLabel = isGlobal ? 'GLOBAL (toutes les données)' : periode.format('MMMM YYYY');

  return (
    <div style={{ padding: isMobile ? 8 : 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Charges</Title>
          <Text type="secondary">Somme des débits des comptes <b>ACH%</b> (charges)</Text>
          <div style={{ marginTop: 6 }}>
            <Tag color={isGlobal ? 'green' : 'blue'} style={{ borderRadius: 999, margin: 0 }}>
              {periodeLabel}
            </Tag>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Button icon={<ReloadOutlined />} onClick={() => fetchCharges({ periode, partenaire, isGlobal }, 0)} loading={loading}>
            Actualiser
          </Button>
          <Button onClick={resetFilters} disabled={!partenaire && !isGlobal && periode.isSame(dayjs(), 'month')}>
            Réinitialiser
          </Button>
        </div>
      </div>

      {/* ALERTES */}
      {(derived.notifications || []).length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {derived.notifications.map((n, idx) => {
            const type =
              n.type === 'error' || n.type === 'critical'
                ? 'error'
                : n.type === 'info'
                  ? 'info'
                  : 'warning';

            const meta = n?.meta || {};
            const isSpike = n.code === 'CHARGE_SPEC_ALERTE';
            const pct = typeof meta.pct === 'number' ? meta.pct : null;

            return (
              <Alert
                key={`${n.code || 'notif'}-${idx}`}
                type={type}
                showIcon
                style={{ marginBottom: 12, borderRadius: 14 }}
                message={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span>{n.title || 'Notification'}</span>
                    {n.subtitle && (
                      <Tag color={type === 'error' ? 'red' : type === 'warning' ? 'orange' : 'blue'} style={{ borderRadius: 999 }}>
                        {n.subtitle}
                      </Tag>
                    )}
                  </div>
                }
                description={
                  <div>
                    <div>« {n.message || ''} »</div>

                    {n.code === 'CHARGES_HAUSSE_10' && (
                      <div style={{ marginTop: 6, fontSize: 12, opacity: 0.9 }}>
                        {typeof meta.variationChargesPourcent === 'number' && (
                          <span style={{ marginRight: 12 }}>
                            Variation : <b>{meta.variationChargesPourcent.toFixed(1)}%</b>
                          </span>
                        )}
                        {typeof meta.totalChargesMois === 'number' && (
                          <span style={{ marginRight: 12 }}>
                            Mois réf : <b>{formatAr(meta.totalChargesMois)}</b>
                          </span>
                        )}
                        {typeof meta.totalChargesPrevMois === 'number' && (
                          <span>
                            Mois préc : <b>{formatAr(meta.totalChargesPrevMois)}</b>
                          </span>
                        )}
                        {meta.note && (
                          <span style={{ marginLeft: 12 }}>
                            <Tag style={{ borderRadius: 999 }}>{meta.note}</Tag>
                          </span>
                        )}
                      </div>
                    )}

                    {isSpike && (
                      <div style={{ marginTop: 6, fontSize: 12, opacity: 0.9 }}>
                        {meta.nomDuCompte && (
                          <span style={{ marginRight: 12 }}>
                            Poste : <b>{meta.nomDuCompte}</b>
                          </span>
                        )}
                        {pct !== null && (
                          <span style={{ marginRight: 12 }}>
                            Écart : <b>+{pct.toFixed(1)}%</b>
                          </span>
                        )}
                        {typeof meta.cur === 'number' && (
                          <span style={{ marginRight: 12 }}>
                            Ce mois : <b>{formatAr(meta.cur)}</b>
                          </span>
                        )}
                        {typeof meta.avg === 'number' && (
                          <span>
                            Moy. : <b>{formatAr(meta.avg)}</b>
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

      <Row gutter={[isMobile ? 16 : 24, isMobile ? 16 : 24]}>
        {/* HERO KPI */}
        <Col span={24}>
          <Card
            bordered={false}
            style={{
              borderRadius: 24,
              boxShadow: '0 22px 45px rgba(15,23,42,0.18),0 0 1px rgba(15,23,42,0.10)',
              background: 'radial-gradient(circle at 0% 0%, #032338ff 0, #4095a6ff 45%, #00ABC9 100%)',
              color: '#fff',
              overflow: 'hidden',
            }}
          >
            <div style={{ marginBottom: 12 }}>
              <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
                <div>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Période</Text>
                  <div style={{ marginTop: 6 }}>
                    <DatePicker
                      picker="month"
                      value={isGlobal ? null : periode}
                      allowClear
                      placeholder="GLOBAL (toutes les données)"
                      suffixIcon={<CalendarOutlined />}
                      onChange={(v) => {
                        if (!v) {
                          setIsGlobal(true);
                          return;
                        }
                        setIsGlobal(false);
                        setPeriode(v.startOf('month'));
                      }}
                      style={{ minWidth: isMobile ? '100%' : 190 }}
                    />
                    <Tag style={{ marginLeft: 8, borderRadius: 999 }}>{periodeLabel}</Tag>
                  </div>
                </div>

                <div style={{ minWidth: isMobile ? '100%' : 260 }}>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Partenaire (filtre)</Text>
                  <div style={{ marginTop: 6 }}>
                    <Input
                      placeholder="Ex : JIRAMA, fournisseur X..."
                      allowClear
                      value={partenaire}
                      onChange={(e) => setPartenaire(e.target.value)}
                    />
                  </div>
                </div>
              </Space>
            </div>

            <Row gutter={[16, 16]}>
              {/* Charges */}
              <Col xs={24} md={8}>
                <div style={{ padding: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                      {isGlobal ? 'Charges (GLOBAL) (ACH)' : 'Charges du mois (ACH)'}
                    </Text>
                    <AntTooltip title="Total des charges (somme des débits) selon le mode">
                      <InfoCircleOutlined style={{ color: 'rgba(255,255,255,0.6)' }} />
                    </AntTooltip>
                  </div>

                  <Title level={2} style={{ color: '#fff', margin: '10px 0 8px' }}>
                    {formatAr(derived.totalChargesMois)}
                  </Title>

                  {!isGlobal && (
                    <>
                      <Tag
                        color={derived.chargesEnHausse ? 'red' : 'green'}
                        style={{ borderRadius: 999, border: 'none', padding: '4px 12px' }}
                      >
                        {derived.chargesEnHausse ? <ArrowUpOutlined /> : <ArrowDownOutlined />}{' '}
                        {derived.variationChargesPourcent > 0 ? '+' : ''}
                        {derived.variationChargesPourcent.toFixed(1)}% vs mois précédent
                      </Tag>

                      <div style={{ marginTop: 12 }}>
                        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Niveau vs max historique</Text>
                        <Progress
                          percent={derived.jaugeChargesPct}
                          showInfo={false}
                          trailColor="rgba(255,255,255,0.12)"
                          strokeColor={{ '0%': '#fa8c16', '100%': '#ff4d4f' }}
                          style={{ marginTop: 6 }}
                        />
                      </div>

                      <div style={{ marginTop: 10, color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>
                        Mois précédent : <strong>{formatAr(derived.totalChargesPrevMois || 0)}</strong>
                      </div>
                    </>
                  )}

                  {isGlobal && (
                    <div style={{ marginTop: 10, color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>
                      Mode GLOBAL : comparaisons mensuelles désactivées.
                    </div>
                  )}
                </div>
              </Col>

              {/* Variation */}
              <Col xs={24} md={8}>
                <div style={{ padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 10 }}>
                    Variation (intensité)
                  </Text>

                  {isGlobal ? (
                    <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>
                      (non applicable en GLOBAL)
                    </div>
                  ) : (
                    <Progress
                      type="circle"
                      percent={derived.jaugeVariationPct}
                      size={170}
                      strokeWidth={10}
                      trailColor="rgba(255,255,255,0.10)"
                      strokeColor={derived.variationChargesPourcent >= 0 ? '#ff4d4f' : '#52c41a'}
                      format={() => (
                        <div style={{ textAlign: 'center', lineHeight: 1.1 }}>
                          <div style={{ fontWeight: 900, fontSize: 22, color: '#fff' }}>
                            {derived.variationChargesPourcent > 0 ? '+' : ''}
                            {derived.variationChargesPourcent.toFixed(1)}%
                          </div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>
                            {derived.variationChargesPourcent >= 0 ? 'Hausse' : 'Baisse'}
                          </div>
                        </div>
                      )}
                    />
                  )}
                </div>
              </Col>

              {/* KPIs secondaires */}
              <Col xs={24} md={8}>
                <div
                  style={{
                    padding: 16,
                    borderRadius: 18,
                    background: 'rgba(0,0,0,0.35)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    height: '100%',
                  }}
                >
                  <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>
                    Indicateurs
                  </Text>

                  <div style={{ marginTop: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: 13 }}>
                      <span>Total charges historique</span>
                      <strong style={{ color: '#ffd666' }}>{formatAr(derived.totalChargesHistorique)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, color: '#fff', fontSize: 13 }}>
                      <span>Catégories ({isGlobal ? 'global' : 'mois'})</span>
                      <strong style={{ color: '#52c41a' }}>{derived.parPartenaire.length}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, color: '#fff', fontSize: 13 }}>
                      <span>Total charges ({isGlobal ? 'global' : 'mois'})</span>
                      <strong style={{ color: '#69c0ff' }}>{formatAr(derived.totalGlobal)}</strong>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Graph mensuel */}
        <Col xs={24} lg={12}>
          <Card bordered={false} style={{ borderRadius: 20, boxShadow: '0 18px 45px rgba(15,23,42,0.12), 0 0 1px rgba(15,23,42,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Title level={5} style={{ marginBottom: 4 }}>Évolution des charges</Title>
                <Text type="secondary" style={{ fontSize: 12 }}>Montant par mois (historique).</Text>
              </div>
              <AntTooltip title="Axe Y en format compact, survol = montant complet">
                <InfoCircleOutlined style={{ color: 'rgba(0,0,0,0.45)' }} />
              </AntTooltip>
            </div>

            <div style={{ height: 260, marginTop: 12 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={derived.chargesTrend} margin={{ top: 10, right: 10, left: 22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="chargesArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00ABC9" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#005C97" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} interval={isMobile ? 'preserveStartEnd' : 0} />
                  <YAxis
                    width={90}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    allowDecimals={false}
                    tickFormatter={formatArAxis}
                    tick={{ fontSize: 11, fill: 'rgba(0,0,0,0.60)' }}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="montant" stroke="#00ABC9" strokeWidth={2} fill="url(#chargesArea)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Donut catégories */}
        <Col xs={24} lg={12}>
          <Card bordered={false} style={{ borderRadius: 20, boxShadow: '0 18px 45px rgba(15,23,42,0.12), 0 0 1px rgba(15,23,42,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <Title level={5} style={{ marginBottom: 4 }}>Répartition des charges par catégorie</Title>
                <Text type="secondary" style={{ fontSize: 12 }}>Top catégories + “Autres”.</Text>
              </div>
              <AntTooltip title="Total charges (centre du donut)">
                <InfoCircleOutlined style={{ color: 'rgba(0,0,0,0.45)' }} />
              </AntTooltip>
            </div>

            <div style={{ height: 280, marginTop: 12 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={derived.partnersPie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={2}
                  >
                    {derived.partnersPie.map((entry, idx) => (
                      <Cell key={`pp-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>

                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontSize: 14, fontWeight: 900, fill: 'rgba(0,0,0,0.82)' }}
                  >
                    {formatAr(derived.totalGlobal)}
                  </text>
                  <text
                    x="50%"
                    y="50%"
                    dy={18}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontSize: 12, fill: 'rgba(0,0,0,0.45)' }}
                  >
                    Total
                  </text>

                  <Tooltip
                    formatter={(value, name) => [formatAr(value), name]}
                    labelFormatter={(label) => {
                      const it = derived.partnersPie.find((x) => x.name === label);
                      return it?.fullName || label;
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Liste par partenaire */}
        <Col span={24}>
          <Card bordered={false} style={{ borderRadius: 20, boxShadow: '0 18px 45px rgba(15,23,42,0.12), 0 0 1px rgba(15,23,42,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <Title level={5} style={{ marginBottom: 4 }}>Charges par catégorie</Title>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Mode {isGlobal ? 'GLOBAL' : 'MOIS'} • comptes ACH%.
                </Text>
              </div>
              <Tag color="blue" style={{ borderRadius: 999 }}>
                {derived.totalPartenaires} catégories
              </Tag>
            </div>

            <Row gutter={[16, 12]} style={{ marginTop: 16 }}>
              <Col xs={24} md={12}>
                <Text style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>Total charges ({isGlobal ? 'global' : 'mois'})</Text>
                <div style={{ fontSize: 24, fontWeight: 900 }}>{formatAr(derived.totalGlobal)}</div>
              </Col>
              <Col xs={24} md={12}>
                <Text style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>Nombre de catégories</Text>
                <div style={{ fontSize: 22, fontWeight: 900 }}>{derived.totalPartenaires}</div>
              </Col>
            </Row>

            <div style={{ marginTop: 16 }}>
              {derived.parPartenaire.length === 0 && (
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Aucun résultat trouvé avec les filtres actuels.
                </Text>
              )}

              {derived.parPartenaire.map((p, index) => {
                const montant = Number(p.totalSolde || 0);
                const ratio = derived.maxPartner ? (montant / derived.maxPartner) * 100 : 0;

                return (
                  <div
                    key={`${p.partner}-${index}`}
                    style={{
                      padding: '10px 0',
                      borderBottom: index === derived.parPartenaire.length - 1 ? 'none' : '1px solid rgba(0,0,0,0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
                      <Text style={{ fontSize: 13 }}>
                        {p.partner?.length > 34 ? `${p.partner.slice(0, 32)}…` : p.partner}
                      </Text>
                      <Text strong style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
                        {formatAr(montant)}
                      </Text>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                      <Progress
                        percent={Math.max(ratio, 1)}
                        showInfo={false}
                        strokeColor="#6BC6FF"
                        trailColor="rgba(0,0,0,0.06)"
                        size="small"
                      />
                      <Text type="secondary" style={{ fontSize: 12, minWidth: 46 }}>
                        {ratio.toFixed(0)}%
                      </Text>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
