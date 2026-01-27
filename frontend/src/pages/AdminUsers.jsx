import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  message,
  Table,
  Space,
  Switch,
  Typography,
  Modal,
  Popconfirm,
  List,
  Grid,
  Divider,
} from "antd";
import { useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

export default function AdminUsers() {
  const [form] = Form.useForm();
  const [resetForm] = Form.useForm();
  const navigate = useNavigate();
  const screens = useBreakpoint();

  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [updatingIds, setUpdatingIds] = useState(new Set());
  const [deletingIds, setDeletingIds] = useState(new Set());
  const [users, setUsers] = useState([]);

  // reset password modal
  const [resetOpen, setResetOpen] = useState(false);
  const [resetUser, setResetUser] = useState(null);
  const [resetLoading, setResetLoading] = useState(false);

  const token = localStorage.getItem("token");
  const me = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const apiFetch = async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (res.status === 204) return {};

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

  const onCreate = async (values) => {
    setLoadingCreate(true);
    try {
      const payload = {
        email: values.email,
        name: values.name || null,
        password: values.password,
        role: values.role || "user",
      };

      await apiFetch(`${API_BASE}/api/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      message.success("Utilisateur créé");
      form.resetFields();
      fetchUsers();
    } catch (e) {
      if (e.message !== "Non authentifié" && e.message !== "Accès refusé") {
        message.error(e.message || "Erreur création");
      }
    } finally {
      setLoadingCreate(false);
    }
  };

  const setActive = async (userId, isActive) => {
    setUpdatingIds((prev) => new Set(prev).add(userId));
    try {
      await apiFetch(`${API_BASE}/api/admin/users/${userId}/active`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });

      message.success("Statut mis à jour");
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isActive } : u)));
    } catch (e) {
      if (e.message !== "Non authentifié" && e.message !== "Accès refusé") {
        message.error(e.message || "Erreur update");
      }
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const deleteUser = async (userId) => {
    setDeletingIds((prev) => new Set(prev).add(userId));
    try {
      await apiFetch(`${API_BASE}/api/admin/users/${userId}`, { method: "DELETE" });
      message.success("Utilisateur supprimé");
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (e) {
      if (e.message !== "Non authentifié" && e.message !== "Accès refusé") {
        message.error(e.message || "Erreur suppression");
      }
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const openResetModal = (u) => {
    setResetUser(u);
    resetForm.resetFields();
    setResetOpen(true);
  };

  const confirmResetPassword = async () => {
    try {
      const values = await resetForm.validateFields();
      setResetLoading(true);

      await apiFetch(`${API_BASE}/api/admin/users/${resetUser.id}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: values.password }),
      });

      message.success("Mot de passe réinitialisé");
      setResetOpen(false);
      setResetUser(null);
    } catch (e) {
      if (e?.message && e.message !== "Non authentifié" && e.message !== "Accès refusé") {
        message.error(e.message || "Erreur reset");
      }
    } finally {
      setResetLoading(false);
    }
  };

  // Responsive: on cache/affiche certaines colonnes selon la taille
  const columns = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ellipsis: true,
      width: 240,
      responsive: ["md"],
    },
    {
      title: "Nom",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
      render: (v) => v || "-",
      width: 200,
      responsive: ["lg"],
    },
    { title: "Rôle", dataIndex: "role", key: "role", width: 120, responsive: ["md"] },
    {
      title: "Actif",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      responsive: ["md"],
      render: (val, record) => (
        <Switch
          checked={!!val}
          disabled={updatingIds.has(record.id)}
          onChange={(checked) => setActive(record.id, checked)}
        />
      ),
    },
    {
      title: "Créé",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      responsive: ["xl"],
      render: (v) => (v ? new Date(v).toLocaleString() : ""),
    },
    {
      title: "Actions",
      key: "actions",
      width: 260,
      responsive: ["md"],
      render: (_, record) => {
        const isMe = me?.id === record.id;
        return (
          <Space wrap>
            <Button size="small" onClick={() => openResetModal(record)}>
              Réinitialiser MDP
            </Button>

            <Popconfirm
              title="Supprimer cet utilisateur ?"
              okText="Supprimer"
              cancelText="Annuler"
              onConfirm={() => deleteUser(record.id)}
              disabled={isMe}
            >
              <Button size="small" danger disabled={isMe} loading={deletingIds.has(record.id)}>
                Supprimer
              </Button>
            </Popconfirm>

            {isMe ? <Text type="secondary">(vous)</Text> : null}
          </Space>
        );
      },
    },
  ];

  // Mobile: cartes ultra lisibles
  const MobileUsersList = () => (
    <List
      loading={loadingList}
      dataSource={users}
      locale={{ emptyText: "Aucun utilisateur" }}
      renderItem={(u) => {
        const isMe = me?.id === u.id;
        return (
          <List.Item style={{ paddingLeft: 0, paddingRight: 0 }}>
            <Card style={{ width: "100%" }} bodyStyle={{ padding: 12 }}>
              <Space direction="vertical" style={{ width: "100%" }} size={6}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ minWidth: 0 }}>
                    <Text strong style={{ display: "block" }} ellipsis>
                      {u.email}
                    </Text>
                    <Text type="secondary">{u.name || "-"}</Text>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: "right" }}>
                    <Text>{u.role}</Text>
                    <div style={{ marginTop: 6 }}>
                      <Switch
                        checked={!!u.isActive}
                        disabled={updatingIds.has(u.id)}
                        onChange={(checked) => setActive(u.id, checked)}
                      />
                    </div>
                  </div>
                </div>

                <Divider style={{ margin: "8px 0" }} />

                <Space wrap>
                  <Button size="small" onClick={() => openResetModal(u)}>
                    Réinitialiser MDP
                  </Button>

                  <Popconfirm
                    title="Supprimer cet utilisateur ?"
                    okText="Supprimer"
                    cancelText="Annuler"
                    onConfirm={() => deleteUser(u.id)}
                    disabled={isMe}
                  >
                    <Button size="small" danger disabled={isMe} loading={deletingIds.has(u.id)}>
                      Supprimer
                    </Button>
                  </Popconfirm>

                  {isMe ? <Text type="secondary">(vous)</Text> : null}
                </Space>
              </Space>
            </Card>
          </List.Item>
        );
      }}
    />
  );

  const isMobile = !screens.md; // xs/sm => mobile

  return (
    <Space direction="vertical" style={{ width: "100%" }} size={16}>
      <Card>
        <Title level={4} style={{ marginTop: 0 }}>
          Admin — Créer un utilisateur
        </Title>
        <Text type="secondary">
          Vous devez être connecté avec un compte <b>admin</b>.
        </Text>

        <Form
          form={form}
          layout="vertical"
          onFinish={onCreate}
          requiredMark={false}
          style={{ marginTop: 12 }}
          initialValues={{ role: "user" }}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Email requis" }, { type: "email" }]}
          >
            <Input placeholder="user@entreprise.com" />
          </Form.Item>

          <Form.Item label="Nom" name="name">
            <Input placeholder="Nom (optionnel)" />
          </Form.Item>

          <Form.Item
            label="Mot de passe"
            name="password"
            rules={[
              { required: true, message: "Mot de passe requis" },
              { min: 6, message: "Minimum 6 caractères" },
            ]}
            hasFeedback
          >
            <Input.Password placeholder="Mot de passe" />
          </Form.Item>

          <Form.Item
            label="Confirmer le mot de passe"
            name="confirmPassword"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: "Confirmation requise" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) return Promise.resolve();
                  return Promise.reject(new Error("Les mots de passe ne correspondent pas"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirmer" />
          </Form.Item>

          <Form.Item label="Rôle" name="role">
            <Select
              options={[
                { value: "user", label: "Utilisateur" },
                { value: "admin", label: "Admin" },
              ]}
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loadingCreate} block={isMobile}>
            Créer
          </Button>
        </Form>
      </Card>

      <Card title="Utilisateurs" loading={false}>
        {isMobile ? (
          <MobileUsersList />
        ) : (
          <Table
            rowKey="id"
            dataSource={users}
            columns={columns}
            loading={loadingList}
            pagination={{ pageSize: 10, showSizeChanger: true }}
            // important pour la responsivité desktop
            scroll={{ x: "max-content" }}
            size="middle"
          />
        )}
      </Card>

      <Modal
        title={
          resetUser
            ? `Réinitialiser le mot de passe — ${resetUser.email}`
            : "Réinitialiser le mot de passe"
        }
        open={resetOpen}
        onCancel={() => {
          setResetOpen(false);
          setResetUser(null);
        }}
        onOk={confirmResetPassword}
        okText="Enregistrer"
        confirmLoading={resetLoading}
      >
        <Form form={resetForm} layout="vertical" requiredMark={false}>
          <Form.Item
            label="Nouveau mot de passe"
            name="password"
            rules={[
              { required: true, message: "Mot de passe requis" },
              { min: 6, message: "Minimum 6 caractères" },
            ]}
            hasFeedback
          >
            <Input.Password placeholder="Nouveau mot de passe" />
          </Form.Item>

          <Form.Item
            label="Confirmer"
            name="confirm"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: "Confirmation requise" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) return Promise.resolve();
                  return Promise.reject(new Error("Les mots de passe ne correspondent pas"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirmer" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
