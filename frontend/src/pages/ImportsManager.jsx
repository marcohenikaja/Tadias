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
  TeamOutlined, // ✅ AJOUT
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import { useNavigate } from "react-router-dom";
dayjs.locale('fr');

const { Title, Text } = Typography;
const { Dragger } = Upload;

const API_BASE = process.env.REACT_APP_API_BASE;

export default function ImportsManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const navigate = useNavigate();

  const [loadingList, setLoadingList] = useState(false);
  const [users, setUsers] = useState([]);

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
    fetchUsers();
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

  const apiFetch = async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 401) {
      message.error("Session expirée. Reconnectez-vous.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
      throw new Error("Non authentifié");
    }

    if (res.status === 403) {
      message.error("Accès refusé (admin requis).");
      navigate("/dashboard", { replace: true });
      throw new Error("Accès refusé");
    }

    if (!res.ok || data.ok === false) {
      throw new Error(data?.message || "Erreur API");
    }

    return data;
  };

  const fetchUsers = async () => {
    setLoadingList(true);
    try {
      const data = await apiFetch(`${API_BASE}/api/admin/users`);
      setUsers(data.users || []);
    } catch (e) {
      if (e.message !== "Non authentifié" && e.message !== "Accès refusé") {
        message.error(e.message || "Erreur");
      }
    } finally {
      setLoadingList(false);
    }
  };

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
            <Text strong>Fichier :</Text> {record.fileName || '—'}
          </div>
          <div>
            <Text strong>Feuille :</Text> {record.sheetName || '—'}
          </div>
          <div>
            <Text strong>Lignes :</Text> {record.importedCount ?? '—'}
          </div>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
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
      content: (
        <Text type="secondary">
          Cela supprimera le batch le plus récent (et toutes ses lignes).
        </Text>
      ),
      okText: 'Supprimer',
      okButtonProps: { danger: true },
      cancelText: 'Annuler',
      onOk: () => deleteLast(),
    });
  };

  // ✅ Upload intégré
  const propsUpload = useMemo(
    () => ({
      name: 'file',
      multiple: false,
      accept: '.xlsx,.xls',
      action: `${API_BASE}/import/grand-livre`,
      showUploadList: false,
      headers, // ⚠️ si ton backend utilise auth
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

  const columns = [
    {
      title: 'Date import',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (v) => (v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '—'),
      sorter: (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (v) => <Tag style={{ borderRadius: 999 }}>{v || '—'}</Tag>,
    },
    {
      title: 'Fichier',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (v) => <Text>{v || '—'}</Text>,
    },
    {
      title: 'Feuille',
      dataIndex: 'sheetName',
      key: 'sheetName',
      width: 180,
      render: (v) => <Text type="secondary">{v || '—'}</Text>,
    },
    {
      title: 'Lignes',
      dataIndex: 'importedCount',
      key: 'importedCount',
      width: 90,
      align: 'right',
      render: (v) => <Text strong>{Number(v || 0).toLocaleString('fr-FR')}</Text>,
      sorter: (a, b) => Number(a.importedCount || 0) - Number(b.importedCount || 0),
    },
    {
      title: 'Batch ID',
      dataIndex: 'id',
      key: 'id',
      width: 220,
      render: (id) => (
        <Space size={6}>
          <Text code style={{ maxWidth: 160, display: 'inline-block' }}>
            {String(id || '').slice(0, 8)}…{String(id || '').slice(-6)}
          </Text>
          <Tooltip title="Copier le batchId">
            <Button size="small" icon={<CopyOutlined />} onClick={() => copy(id)} />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      render: (_, record) => (
        <Space>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            loading={busyId === record.id}
            onClick={() => confirmDelete(record)}
          >
            Supprimer
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            <HistoryOutlined /> Gestion des imports
          </Title>
          <Text type="secondary">
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

          {/* ✅ BOUTON VERS ADMIN USERS */}
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
      <Card
        bordered={false}
        style={{
          borderRadius: 18,
          boxShadow: '0 18px 45px rgba(15,23,42,0.10),0 0 1px rgba(15,23,42,0.08)',
          marginBottom: 14,
        }}
      >
        <Title level={4} style={{ marginBottom: 4 }}>
          Import du fichier Grand livre
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Chargez votre fichier Excel <strong>grand_livre.xlsx</strong> (onglet <strong>"Grand livre"</strong>) pour mettre à jour les indicateurs.
        </Text>

        <div style={{ marginTop: 18 }}>
          <Dragger {...propsUpload} disabled={uploading || busyId === 'LAST' || !!busyId}>
            <p style={{ marginBottom: 8 }}>
              <InboxOutlined style={{ fontSize: 40 }} />
            </p>
            <p style={{ marginBottom: 4, fontSize: 15 }}>
              Cliquez ou glissez un fichier Excel ici
            </p>
            <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
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
      <Card
        bordered={false}
        style={{
          borderRadius: 18,
          boxShadow: '0 18px 45px rgba(15,23,42,0.10),0 0 1px rgba(15,23,42,0.08)',
        }}
      >
        {loading ? (
          <div style={{ minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }}>
            <Spin />
            <Text type="secondary">Chargement des imports…</Text>
          </div>
        ) : (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filtered}
            pagination={{ pageSize: 10, showSizeChanger: true }}
          />
        )}
      </Card>
    </div>
  );
}
