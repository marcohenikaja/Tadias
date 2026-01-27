import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Card,
  Typography,
  Table,
  Button,
  Space,
  Tag,
  Input,
  Alert,
  Spin,
  Modal,
  message,
  Tooltip,
  Upload,
  Divider,
} from 'antd';
import {
  ReloadOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  CopyOutlined,
  HistoryOutlined,
  InboxOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import { useNavigate } from "react-router-dom";
import { Grid } from 'antd';

const { useBreakpoint } = Grid;

dayjs.locale('fr');

const { Title, Text } = Typography;
const { Dragger } = Upload;

const API_BASE = process.env.REACT_APP_API_BASE;

export default function ImportsManager({ mode = "light" }) {
  const isDark = mode === "dark";

  // ✅ Styles globaux inline (pas de CSS)
  const ui = useMemo(() => {
    const textPrimary = isDark ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.88)';
    const textSecondary = isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.45)';
    const textTertiary = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.35)';
    const split = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)';

    return {
      textPrimary,
      textSecondary,
      textTertiary,
      split,
      pageBg: isDark ? '#0f1115' : 'transparent',

      cardBg: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
      cardBorder: isDark ? '1px solid rgba(255,255,255,0.10)' : 'none',
      shadow: isDark
        ? '0 18px 45px rgba(0,0,0,0.55), 0 0 1px rgba(0,0,0,0.40)'
        : '0 18px 45px rgba(15,23,42,0.10), 0 0 1px rgba(15,23,42,0.08)',

      icon: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.55)',

      draggerBg: isDark ? 'rgba(255,255,255,0.02)' : 'transparent',
      draggerBorder: isDark ? '1px dashed rgba(255,255,255,0.18)' : undefined,
    };
  }, [isDark]);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const token = localStorage.getItem("token");
  const me = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const headers = useMemo(() => {
    const h = { Accept: 'application/json' };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const fetchImports = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_BASE}/api/imports`, { headers });
      if (!res.ok) throw new Error(`Erreur ${res.status}: ${res.statusText}`);
      const json = await res.json();
      setItems(Array.isArray(json.items) ? json.items : []);
    } catch (e) {
      setError(e?.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    fetchImports();
  }, [fetchImports]);

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    if (!me || me.role !== "admin") {
      message.error("Cette page est réservée aux admins.");
      navigate("/dashboard", { replace: true });
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const s = (search || '').trim().toLowerCase();
    if (!s) return items;

    return items.filter((it) => {
      const hay = [
        it?.id,
        it?.type,
        it?.fileName,
        it?.sheetName,
        it?.importedCount,
        it?.createdAt,
      ]
        .map((x) => String(x ?? '').toLowerCase())
        .join(' | ');
      return hay.includes(s);
    });
  }, [items, search]);

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(String(text));
      message.success('Copié');
    } catch {
      message.error("Impossible de copier (permissions navigateur)");
    }
  };

  const deleteById = useCallback(
    async (id) => {
      try {
        setBusyId(id);
        const res = await fetch(`${API_BASE}/api/imports/${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers,
        });
        if (!res.ok) throw new Error(`Erreur ${res.status}: ${res.statusText}`);

        const json = await res.json();
        message.success(`Import supprimé (${json.deletedRows ?? 0} lignes)`);
        await fetchImports();
      } catch (e) {
        message.error(e?.message || 'Erreur suppression import');
      } finally {
        setBusyId(null);
      }
    },
    [headers, fetchImports]
  );

  const deleteLast = useCallback(async () => {
    try {
      setBusyId('LAST');
      const res = await fetch(`${API_BASE}/api/imports-last`, {
        method: 'DELETE',
        headers,
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}: ${res.statusText}`);

      const json = await res.json();
      message.success(`Dernier import supprimé (${json.deletedRows ?? 0} lignes)`);
      await fetchImports();
    } catch (e) {
      message.error(e?.message || 'Erreur suppression dernier import');
    } finally {
      setBusyId(null);
    }
  }, [headers, fetchImports]);

  const confirmDelete = (record) => {
    Modal.confirm({
      title: 'Supprimer cet import ?',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div style={{ marginTop: 8 }}>
          <div>
            <Text strong style={{ color: ui.textPrimary }}>Fichier :</Text>{' '}
            <Text style={{ color: ui.textPrimary }}>{record.fileName || '—'}</Text>
          </div>
          <div>
            <Text strong style={{ color: ui.textPrimary }}>Feuille :</Text>{' '}
            <Text style={{ color: ui.textPrimary }}>{record.sheetName || '—'}</Text>
          </div>
          <div>
            <Text strong style={{ color: ui.textPrimary }}>Lignes :</Text>{' '}
            <Text style={{ color: ui.textPrimary }}>{record.importedCount ?? '—'}</Text>
          </div>
          <div style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 12, color: ui.textSecondary }}>
              Cette action supprimera toutes les lignes associées à ce batchId.
            </Text>
          </div>
        </div>
      ),
      okText: 'Supprimer',
      okButtonProps: { danger: true },
      cancelText: 'Annuler',
      onOk: () => deleteById(record.id),
    });
  };

  const confirmDeleteLast = () => {
    Modal.confirm({
      title: 'Supprimer le dernier import ?',
      icon: <ExclamationCircleOutlined />,
      content: <Text style={{ color: ui.textSecondary }}>Cela supprimera le batch le plus récent (et toutes ses lignes).</Text>,
      okText: 'Supprimer',
      okButtonProps: { danger: true },
      cancelText: 'Annuler',
      onOk: () => deleteLast(),
    });
  };

  const propsUpload = useMemo(
    () => ({
      name: 'file',
      multiple: false,
      accept: '.xlsx,.xls',
      action: `${API_BASE}/import/grand-livre`,
      showUploadList: false,
      headers,
      onChange(info) {
        const { status } = info.file;

        if (status === 'uploading') {
          setUploading(true);
          return;
        }

        if (status === 'done') {
          setUploading(false);
          const res = info.file.response;
          message.success(res?.message || 'Fichier importé avec succès.');
          fetchImports();
        } else if (status === 'error') {
          setUploading(false);
          const res = info.file.response;
          message.error(res?.message || "Erreur lors de l'import du fichier.");
        }
      },
      onDrop() {},
    }),
    [headers, fetchImports]
  );

  const desktopColumns = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      width: 160,
      render: (v) => dayjs(v).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      width: 110,
      render: (v) => <Tag style={{ borderRadius: 999 }}>{v}</Tag>,
    },
    {
      title: 'Fichier',
      dataIndex: 'fileName',
      render: (v) => <Text style={{ color: ui.textPrimary }}>{v}</Text>,
    },
    {
      title: 'Lignes',
      dataIndex: 'importedCount',
      width: 90,
      align: 'right',
      render: (v) => <Text strong style={{ color: ui.textPrimary }}>{v}</Text>,
    },
    {
      title: 'Batch',
      dataIndex: 'id',
      width: 200,
      render: (id) => (
        <Space size={6}>
          <Text code style={{ color: ui.textPrimary }}>
            {String(id).slice(0, 6)}…{String(id).slice(-4)}
          </Text>
          <Button size="small" icon={<CopyOutlined />} onClick={() => copy(id)} />
        </Space>
      ),
    },
    {
      title: 'Actions',
      width: 120,
      render: (_, r) => (
        <Button
          danger
          size="small"
          icon={<DeleteOutlined />}
          loading={busyId === r.id}
          onClick={() => confirmDelete(r)}
        />
      ),
    },
  ];

  const mobileColumns = [
    {
      title: 'Import',
      dataIndex: 'id',
      render: (_, record) => (
        <div style={{ display: 'grid', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text strong style={{ color: ui.textPrimary }}>{record.fileName || '—'}</Text>
            <Tag style={{ borderRadius: 999 }}>{record.type}</Tag>
          </div>

          <Text style={{ fontSize: 12, color: ui.textSecondary }}>
            {dayjs(record.createdAt).format('DD/MM/YYYY HH:mm')}
          </Text>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: ui.textPrimary }}>
              Lignes : <strong>{record.importedCount}</strong>
            </Text>

            <Space>
              <Button size="small" icon={<CopyOutlined />} onClick={() => copy(record.id)} />
              <Button danger size="small" icon={<DeleteOutlined />} loading={busyId === record.id} onClick={() => confirmDelete(record)} />
            </Space>
          </div>
        </div>
      ),
    },
  ];

  const cardBase = {
    borderRadius: 18,
    boxShadow: ui.shadow,
    background: ui.cardBg,          // ✅ c’est ça qui enlève le blanc
    border: ui.cardBorder,          // ✅ optionnel, joli en dark
  };

  return (
    <div style={{ padding: isMobile ? 8 : 24, background: ui.pageBg }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: ui.textPrimary }}>
            <HistoryOutlined /> Gestion des imports
          </Title>
          <Text style={{ color: ui.textSecondary }}>
            Importer un grand livre + historique des imports + suppression par batch.
          </Text>
        </div>

        <Space wrap>
          <Input
            allowClear
            placeholder="Rechercher (fichier, type, batchId...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ minWidth: 280 }}
          />

          <Button icon={<TeamOutlined />} onClick={() => navigate("/admin-users")}>
            Gestion users
          </Button>

          <Button icon={<ReloadOutlined />} onClick={fetchImports} loading={loading}>
            Actualiser
          </Button>

          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={confirmDeleteLast}
            loading={busyId === 'LAST'}
            disabled={items.length === 0}
          >
            Supprimer dernier import
          </Button>
        </Space>
      </div>

      {error && (
        <Alert
          type="error"
          showIcon
          message="Erreur"
          description={error}
          style={{ marginBottom: 12 }}
        />
      )}

      {/* Upload */}
      <Card bordered={false} style={{ ...cardBase, marginBottom: 14 }}>
        <Title level={4} style={{ marginBottom: 4, color: ui.textPrimary }}>
          Import du fichier Grand livre
        </Title>
        <Text style={{ fontSize: 13, color: ui.textSecondary }}>
          Chargez votre fichier Excel <strong>grand_livre.xlsx</strong> (onglet <strong>"Grand livre"</strong>) pour mettre à jour les indicateurs.
        </Text>

        <div style={{ marginTop: 18 }}>
          <Dragger
            {...propsUpload}
            disabled={uploading || busyId === 'LAST' || !!busyId}
            style={{
              background: ui.draggerBg,
              border: ui.draggerBorder,
              borderRadius: 14,
            }}
          >
            <p style={{ marginBottom: 8 }}>
              <InboxOutlined style={{ fontSize: 40, color: ui.icon }} />
            </p>
            <p style={{ marginBottom: 4, fontSize: 15, color: ui.textPrimary }}>
              Cliquez ou glissez un fichier Excel ici
            </p>
            <p style={{ fontSize: 12, color: ui.textSecondary }}>
              Formats acceptés : .xls, .xlsx. Onglet <strong>Grand livre</strong> avec les colonnes :
              <br />
              <strong>Code, Nom du compte, Date, Communication, Partenaire, Débit, Crédit, Solde</strong>.
            </p>
          </Dragger>

          {uploading && (
            <div style={{ marginTop: 10 }}>
              <Tag color="blue" style={{ borderRadius: 999 }}>
                Import en cours…
              </Tag>
            </div>
          )}
        </div>
      </Card>

      <Divider style={{ margin: '10px 0 14px' }} />

      {/* Table */}
      <Card bordered={false} style={cardBase}>
        {loading ? (
          <div style={{ minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }}>
            <Spin />
            <Text style={{ color: ui.textSecondary }}>Chargement des imports…</Text>
          </div>
        ) : (
          <Table
            rowKey="id"
            columns={isMobile ? mobileColumns : desktopColumns}
            dataSource={filtered}
            pagination={{
              pageSize: isMobile ? 5 : 10,
              showSizeChanger: !isMobile,
            }}
          />
        )}
      </Card>
    </div>
  );
}
