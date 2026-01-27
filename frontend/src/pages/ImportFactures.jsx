import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Card,
  Upload,
  Button,
  Typography,
  message,
  Space,
  List,
  Divider,
  Input,
  Popconfirm,
  Tooltip,
  Radio,
  Tag,
} from "antd";
import {
  UploadOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  LockOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const cleanBase = (s) => (s || "").replace(/\/+$/, "");
const API_BASE = cleanBase(process.env.REACT_APP_API_BASE);

const COMPTA_PREFIX = "__COMPTA__";

export default function ImportFactures({ mode = "light" }) {
  const isDark = mode === "dark";

  // ✅ Palette inline (sans CSS)
  const ui = useMemo(() => {
    const textPrimary = isDark ? "rgba(255,255,255,0.88)" : "rgba(0,0,0,0.88)";
    const textSecondary = isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.45)";
    const cardBg = isDark ? "rgba(255,255,255,0.04)" : "#fff";
    const border = isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.06)";
    const shadow = isDark
      ? "0 18px 45px rgba(0,0,0,0.55), 0 0 1px rgba(0,0,0,0.40)"
      : "0 18px 45px rgba(15,23,42,0.10), 0 0 1px rgba(15,23,42,0.08)";

    return {
      textPrimary,
      textSecondary,
      cardBg,
      border,
      shadow,
      link: isDark ? "rgba(105,192,255,1)" : undefined,
    };
  }, [isDark]);

  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [serverFiles, setServerFiles] = useState([]);
  const [loadingServerFiles, setLoadingServerFiles] = useState(false);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // all | facture | compta

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const isAdmin = (user?.role || user?.profil) === "admin";

  const token = useMemo(() => localStorage.getItem("token"), []);
  const authHeaders = useMemo(() => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  const getDocType = (filename) =>
    (filename || "").startsWith(COMPTA_PREFIX) ? "compta" : "facture";

  const stripPrefix = (filename) => {
    const name = filename || "";
    return name.startsWith(COMPTA_PREFIX) ? name.slice(COMPTA_PREFIX.length) : name;
  };

  const fetchServerFiles = useCallback(async () => {
    setLoadingServerFiles(true);
    try {
      const res = await fetch(`${API_BASE}/api/factures`, {
        headers: { Accept: "application/json", ...authHeaders },
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data?.message || "Erreur chargement fichiers");
      }
      setServerFiles(data.files || []);
    } catch (e) {
      message.error(e.message || "Erreur liste factures");
    } finally {
      setLoadingServerFiles(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    fetchServerFiles();
  }, [fetchServerFiles]);

  const prefixFile = (originFileObj, prefix) => {
    const f = originFileObj;
    return new File([f], `${prefix}${f.name}`, {
      type: f.type,
      lastModified: f.lastModified,
    });
  };

  const handleSend = async (docType = "facture") => {
    if (fileList.length === 0) {
      message.warning("Ajoutez au moins un fichier");
      return;
    }

    if (docType === "compta" && !isAdmin) {
      message.error("Action réservée aux administrateurs");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("docType", docType);

      fileList.forEach((file) => {
        const origin = file.originFileObj;
        if (!origin) return;

        const toSend = docType === "compta" ? prefixFile(origin, COMPTA_PREFIX) : origin;
        formData.append("files", toSend);
      });

      const res = await fetch(`${API_BASE}/api/factures/upload`, {
        method: "POST",
        body: formData,
        headers: { ...authHeaders },
      });

      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.message || "Upload échoué");

      message.success(
        docType === "compta"
          ? "Documents compta envoyés avec succès"
          : "Factures envoyées avec succès"
      );

      setFileList([]);
      fetchServerFiles();
    } catch (e) {
      message.error(e.message || "Erreur upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteServerFile = async (item) => {
    if (!isAdmin) {
      message.error("Action réservée aux administrateurs");
      return;
    }

    try {
      setServerFiles((prev) => prev.filter((f) => f.filename !== item.filename));

      const res = await fetch(
        `${API_BASE}/api/factures/${encodeURIComponent(item.filename)}`,
        {
          method: "DELETE",
          headers: { Accept: "application/json", ...authHeaders },
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        fetchServerFiles();
        throw new Error(data?.message || "Suppression échouée");
      }

      message.success("Fichier supprimé");
    } catch (e) {
      message.error(e.message || "Erreur suppression");
    }
  };

  const formatSize = (bytes) => {
    if (bytes == null) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredFiles = useMemo(() => {
    const q = search.trim().toLowerCase();

    return (serverFiles || [])
      .filter((f) => {
        if (typeFilter === "all") return true;
        return getDocType(f.filename) === typeFilter;
      })
      .filter((f) => {
        if (!q) return true;
        const raw = (f.filename || "").toLowerCase();
        const shown = stripPrefix(f.filename).toLowerCase();
        return raw.includes(q) || shown.includes(q);
      });
  }, [serverFiles, search, typeFilter]);

  return (
    <Card
      bordered={false}
      style={{
        borderRadius: 16,
        background: ui.cardBg,
        border: ui.border,
        boxShadow: ui.shadow,
      }}
    >
      <Text style={{ display: "block", marginBottom: 12, color: ui.textPrimary }}>
        Sélectionnez vos documents, puis cliquez sur <b>Envoyer</b>.
      </Text>

      <Upload
        multiple
        fileList={fileList}
        beforeUpload={() => false}
        onChange={({ fileList }) => setFileList(fileList)}
        onRemove={(file) => {
          setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
        }}
      >
        <Button icon={<UploadOutlined />}>Choisir des fichiers</Button>
      </Upload>

      <Space style={{ marginTop: 16 }} wrap>
        <Button
          type="primary"
          icon={<CloudUploadOutlined />}
          loading={uploading}
          onClick={() => handleSend("facture")}
          disabled={fileList.length === 0}
        >
          Envoyer factures
        </Button>

        {isAdmin && (
          <Button
            icon={<CloudUploadOutlined />}
            loading={uploading}
            onClick={() => handleSend("compta")}
            disabled={fileList.length === 0}
          >
            Envoyer docs compta
          </Button>
        )}

        <Button
          danger
          icon={<DeleteOutlined />}
          disabled={fileList.length === 0 || uploading}
          onClick={() => setFileList([])}
        >
          Vider la liste
        </Button>
      </Space>

      <Divider style={{ margin: "16px 0", borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)" }} />

      <Space style={{ width: "100%", justifyContent: "space-between" }} wrap>
        <Text style={{ fontWeight: 600, color: ui.textPrimary }}>Fichiers déjà importés</Text>
        <Button icon={<ReloadOutlined />} onClick={fetchServerFiles} loading={loadingServerFiles}>
          Rafraîchir
        </Button>
      </Space>

      <div style={{ marginTop: 12 }}>
        <Radio.Group
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          optionType="button"
          buttonStyle="solid"
        >
          <Radio.Button value="all">Tous</Radio.Button>
          <Radio.Button value="facture">Factures</Radio.Button>
          <Radio.Button value="compta">Docs compta</Radio.Button>
        </Radio.Group>
      </div>

      <Input
        style={{ marginTop: 12 }}
        placeholder="Rechercher un fichier (ex: facture, png, docx...)"
        prefix={<SearchOutlined />}
        allowClear
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <List
        style={{ marginTop: 12 }}
        loading={loadingServerFiles}
        dataSource={filteredFiles}
        rowKey={(item) => item.filename}
        locale={{
          emptyText: search
            ? "Aucun fichier ne correspond à votre recherche."
            : "Aucun fichier importé pour le moment.",
        }}
        renderItem={(item) => {
          const url = `${API_BASE}${item.path}`;
          const updatedAt = item.updatedAt ? new Date(item.updatedAt).toLocaleString() : null;

          const docType = getDocType(item.filename);
          const displayName = stripPrefix(item.filename);

          const actions = [
            <a key="open" href={url} target="_blank" rel="noreferrer" style={{ color: ui.link }}>
              Ouvrir
            </a>,
            <a key="download" href={url} download style={{ color: ui.link }}>
              Télécharger
            </a>,
          ];

          if (isAdmin) {
            actions.push(
              <Popconfirm
                key="delete"
                title="Supprimer ce fichier ?"
                okText="Supprimer"
                cancelText="Annuler"
                onConfirm={() => handleDeleteServerFile(item)}
              >
                <Button danger size="small" icon={<DeleteOutlined />}>
                  Supprimer
                </Button>
              </Popconfirm>
            );
          } else {
            actions.push(
              <Tooltip key="locked" title="Suppression réservée aux administrateurs">
                <Button size="small" icon={<LockOutlined />} disabled>
                  Supprimer
                </Button>
              </Tooltip>
            );
          }

          return (
            <List.Item actions={actions}>
              <List.Item.Meta
                title={
                  <Space size={8}>
                    <span style={{ color: ui.textPrimary }}>{displayName}</span>
                    <Tag style={{ borderRadius: 999 }}>
                      {docType === "compta" ? "Compta" : "Facture"}
                    </Tag>
                  </Space>
                }
                description={
                  <span style={{ color: ui.textSecondary }}>
                    {[
                      item.size != null ? `Taille: ${formatSize(item.size)}` : null,
                      updatedAt ? `Modifié: ${updatedAt}` : null,
                    ]
                      .filter(Boolean)
                      .join(" — ")}
                  </span>
                }
              />
            </List.Item>
          );
        }}
      />
    </Card>
  );
}
