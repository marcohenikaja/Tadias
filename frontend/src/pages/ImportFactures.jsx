import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  Typography,
  Upload,
  Table,
  Space,
  Button,
  Tag,
  message,
  Modal,
  Input,
  Alert,
  Spin,
  Grid,
} from "antd";
import {
  InboxOutlined,
  ReloadOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/fr";

dayjs.locale("fr");

const { Title, Text } = Typography;
const { Dragger } = Upload;
const { useBreakpoint } = Grid;

const cleanBase = (s) => (s || "").replace(/\/+$/, "");
const API_BASE = cleanBase(process.env.REACT_APP_API_BASE);

function formatBytes(bytes) {
  const n = Number(bytes || 0);
  if (!n) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(n) / Math.log(k)), sizes.length - 1);
  return `${(n / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}

function getExt(filename = "") {
  const m = String(filename).toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : "";
}

function isPreviewable(filename = "") {
  const ext = getExt(filename);
  // preview navigateur OK:
  return ["pdf", "png", "jpg", "jpeg", "webp"].includes(ext);
}

export default function FacturesManager({ mode = "light" }) {
  const isDark = mode === "dark";
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const ui = useMemo(() => {
    const textPrimary = isDark ? "rgba(255,255,255,0.88)" : "rgba(0,0,0,0.88)";
    const textSecondary = isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.45)";
    const cardBg = isDark ? "rgba(255,255,255,0.04)" : "#fff";
    const cardBorder = isDark ? "1px solid rgba(255,255,255,0.10)" : "none";
    const shadow = isDark
      ? "0 18px 45px rgba(0,0,0,0.55), 0 0 1px rgba(0,0,0,0.40)"
      : "0 18px 45px rgba(15,23,42,0.10), 0 0 1px rgba(15,23,42,0.08)";
    return { textPrimary, textSecondary, cardBg, cardBorder, shadow };
  }, [isDark]);

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");
  const headers = useMemo(() => {
    const h = { Accept: "application/json" };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const fetchFactures = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/api/factures`, { headers });
      if (!res.ok) throw new Error(`Erreur ${res.status}: ${res.statusText}`);
      const json = await res.json();
      setFiles(Array.isArray(json.files) ? json.files : []);
    } catch (e) {
      setError(e?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    fetchFactures();
  }, [fetchFactures]);

  const filtered = useMemo(() => {
    const q = String(search || "").trim().toLowerCase();
    if (!q) return files;

    return (files || []).filter((f) => {
      const hay = [
        f?.filename,
        f?.path,
        f?.size,
        f?.updatedAt,
      ]
        .map((x) => String(x ?? "").toLowerCase())
        .join(" | ");
      return hay.includes(q);
    });
  }, [files, search]);

  const openFile = (p) => {
    const url = `${API_BASE}${p}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const downloadFile = (p) => {
    // simple: ouvre direct (le navigateur gère le download selon headers)
    const url = `${API_BASE}${p}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const confirmDelete = (record) => {
    Modal.confirm({
      title: "Supprimer ce fichier ?",
      icon: <ExclamationCircleOutlined />,
      content: (
        <div style={{ marginTop: 8 }}>
          <div>
            <Text strong style={{ color: ui.textPrimary }}>Fichier :</Text>{" "}
            <Text style={{ color: ui.textPrimary }}>{record.filename}</Text>
          </div>
          <div style={{ marginTop: 6 }}>
            <Text style={{ color: ui.textSecondary }}>
              Cette action est irréversible.
            </Text>
          </div>
        </div>
      ),
      okText: "Supprimer",
      okButtonProps: { danger: true },
      cancelText: "Annuler",
      onOk: () => deleteFile(record.filename),
    });
  };

  const deleteFile = useCallback(
    async (filename) => {
      try {
        setBusy(filename);
        const res = await fetch(
          `${API_BASE}/api/factures/${encodeURIComponent(filename)}`,
          { method: "DELETE", headers }
        );
        const json = await res.json().catch(() => ({}));

        if (!res.ok) throw new Error(json?.message || `Erreur ${res.status}`);

        message.success("Fichier supprimé");
        await fetchFactures();
      } catch (e) {
        message.error(e?.message || "Erreur suppression");
      } finally {
        setBusy(null);
      }
    },
    [headers, fetchFactures]
  );

  const uploadProps = useMemo(
    () => ({
      name: "files",
      multiple: true,
      action: `${API_BASE}/api/factures/upload`,
      headers,
      showUploadList: false,
      onChange(info) {
        const { status } = info.file;

        if (status === "uploading") {
          setUploading(true);
          return;
        }

        if (status === "done") {
          setUploading(false);
          const res = info.file.response;
          message.success(res?.message || "Fichiers envoyés");
          fetchFactures();
        } else if (status === "error") {
          setUploading(false);
          const res = info.file.response;
          message.error(res?.message || "Erreur upload");
        }
      },
    }),
    [headers, fetchFactures]
  );

  const columns = useMemo(() => {
    const cols = [
      {
        title: "Fichier",
        dataIndex: "filename",
        render: (v) => (
          <div style={{ minWidth: 0 }}>
            <Text strong style={{ color: ui.textPrimary }}>
              {v}
            </Text>
            <div style={{ fontSize: 12, color: ui.textSecondary }}>
              {isPreviewable(v) ? "Aperçu dispo" : "Téléchargement"}
            </div>
          </div>
        ),
      },
      {
        title: "Taille",
        dataIndex: "size",
        width: 120,
        align: "right",
        render: (v) => <Text style={{ color: ui.textPrimary }}>{formatBytes(v)}</Text>,
      },
      {
        title: "Date",
        dataIndex: "updatedAt",
        width: 170,
        render: (v) => (v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "—"),
      },
      {
        title: "Actions",
        width: 210,
        render: (_, r) => (
          <Space wrap>
            <Button
              size="small"
              icon={<EyeOutlined />}
              disabled={!r?.path}
              onClick={() => openFile(r.path)}
            >
              Voir
            </Button>
            <Button
              size="small"
              icon={<DownloadOutlined />}
              disabled={!r?.path}
              onClick={() => downloadFile(r.path)}
            >
              Télécharger
            </Button>
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              loading={busy === r.filename}
              onClick={() => confirmDelete(r)}
            />
          </Space>
        ),
      },
    ];

    // mobile: on simplifie
    if (isMobile) {
      return [
        {
          title: "Docs",
          render: (_, r) => (
            <div style={{ display: "grid", gap: 6 }}>
              <Text strong style={{ color: ui.textPrimary }}>{r.filename}</Text>
              <Text style={{ fontSize: 12, color: ui.textSecondary }}>
                {formatBytes(r.size)} • {r.updatedAt ? dayjs(r.updatedAt).format("DD/MM/YYYY HH:mm") : "—"}
              </Text>
              <Space wrap>
                <Button size="small" icon={<EyeOutlined />} onClick={() => openFile(r.path)} disabled={!r?.path}>
                  Voir
                </Button>
                <Button size="small" icon={<DownloadOutlined />} onClick={() => downloadFile(r.path)} disabled={!r?.path}>
                  Télécharger
                </Button>
                <Button danger size="small" icon={<DeleteOutlined />} loading={busy === r.filename} onClick={() => confirmDelete(r)} />
              </Space>
            </div>
          ),
        },
      ];
    }

    return cols;
  }, [ui.textPrimary, ui.textSecondary, isMobile, busy]);

  const cardBase = {
    borderRadius: 18,
    boxShadow: ui.shadow,
    background: ui.cardBg,
    border: ui.cardBorder,
  };

  return (
    <div style={{ padding: isMobile ? 8 : 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 14,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0, color: ui.textPrimary }}>
            Documents comptables
          </Title>
          <Text style={{ color: ui.textSecondary }}>
            Envoyez et retrouvez vos factures / pièces comptables au même endroit.
          </Text>
        </div>

        <Space wrap style={{ width: isMobile ? "100%" : "auto" }}>
          <Input
            allowClear
            placeholder="Rechercher (nom, date, taille...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: isMobile ? "100%" : 320, minWidth: 0 }}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchFactures} loading={loading}>
            Actualiser
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

      <Card bordered={false} style={{ ...cardBase, marginBottom: 14 }}>
        <Title level={4} style={{ marginBottom: 4, color: ui.textPrimary }}>
          Envoyer des fichiers
        </Title>
        <Text style={{ fontSize: 13, color: ui.textSecondary }}>
          Glissez-déposez vos PDF / images / Excel. Ils seront listés juste en dessous.
        </Text>

        <div style={{ marginTop: 14 }}>
          <Dragger {...uploadProps} disabled={uploading || !!busy}>
            <p style={{ marginBottom: 8 }}>
              <InboxOutlined style={{ fontSize: 40 }} />
            </p>
            <p style={{ marginBottom: 4, fontSize: 15 }}>
              Cliquez ou glissez vos fichiers ici
            </p>
            <p style={{ fontSize: 12, opacity: 0.75 }}>
              Champs attendu côté API : <strong>files</strong>
            </p>
          </Dragger>

          {uploading && (
            <div style={{ marginTop: 10 }}>
              <Tag color="blue" style={{ borderRadius: 999 }}>
                Upload en cours…
              </Tag>
            </div>
          )}
        </div>
      </Card>

      <Card bordered={false} style={cardBase}>
        {loading ? (
          <div style={{ minHeight: 220, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
            <Spin />
            <Text style={{ color: ui.textSecondary }}>Chargement des documents…</Text>
          </div>
        ) : (
          <Table
            rowKey={(r) => r.filename}
            columns={columns}
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