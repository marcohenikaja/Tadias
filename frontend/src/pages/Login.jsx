import React, { useEffect, useState } from "react";
import Logo1 from "../assets/logo/logoblanc.jpeg";
import Logo from "../assets/logo/logocomplet.jpeg";

import {
  Layout,
  Card,
  Form,
  Input,
  Button,
  Typography,
  Alert,
  Grid,
  Row,
  Col,
} from "antd";
import { LockOutlined, MailOutlined, GlobalOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

// ✅ Palette demandée
const C1 = "#005F99";
const C2 = "#009CBD";
const C3 = "#00A8C7";

// ✅ API_BASE depuis .env (CRA)
const cleanBase = (s) => (s || "").replace(/\/+$/, "");
const API_BASE =
  cleanBase(process.env.REACT_APP_API_BASE) ;
const API_URL = `${API_BASE}/auth/login`;

export default function Login({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // ✅ Toggle logo toutes les 1.5s
  const [logoToggle, setLogoToggle] = useState(true);

  useEffect(() => {
    // ✅ Précharge les images
    const imgA = new Image();
    imgA.src = Logo;
    const imgB = new Image();
    imgB.src = Logo1;

    const id = setInterval(() => {
      setLogoToggle((v) => !v);
    }, 1500);

    return () => clearInterval(id);
  }, []);

  const handleFinish = async (values) => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(data?.message || "Connexion échouée");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (onLogin) onLogin();
      navigate("/dashboard", { replace: true });
    } catch (e) {
      setError(e.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const slogan = "Dématérialisez. Voyez clair. Décidez mieux.";

  // ✅ LogoBlock avec crossfade (fluide)
  const LogoBlock = ({ dark = false, size = 200 }) => (
    <div style={{ display: "grid", justifyItems: "center", gap: 10 }}>
      <div
        style={{
          width: size + 18,
          height: size + 18,
          borderRadius: 22,
          padding: 6,
          background: dark
            ? `linear-gradient(135deg, ${C1}66, ${C2}44, ${C3}33)`
            : `linear-gradient(135deg, ${C1}22, ${C2}18, ${C3}14)`,
          border: dark
            ? "1px solid rgba(255,255,255,0.18)"
            : "1px solid rgba(0,0,0,0.06)",
          boxShadow: dark
            ? "0 18px 40px rgba(0,0,0,0.45)"
            : "0 18px 40px rgba(15,23,42,0.14)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* ✅ Container pour superposer les 2 images */}
        <div
          style={{
            width: size,
            height: size,
            borderRadius: 18,
            overflow: "hidden",
            position: "relative",
            boxShadow: dark
              ? "0 10px 22px rgba(0,0,0,0.35)"
              : "0 10px 22px rgba(15,23,42,0.12)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <img
            src={Logo1}
            alt="Logo A"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: logoToggle ? 1 : 0,
              transition: "opacity 650ms ease-in-out",
              willChange: "opacity",
            }}
          />
          <img
            src={Logo1}
            alt="Logo B"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: logoToggle ? 0 : 1,
              transition: "opacity 650ms ease-in-out",
              willChange: "opacity",
            }}
          />
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <div
          style={{
            marginTop: 4,
            fontSize: 12,
            lineHeight: 1.25,
            color: dark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.45)",
            maxWidth: 260,
          }}
        >
          {slogan}
        </div>
      </div>
    </div>
  );

  return (
    <Layout
      style={{
        minHeight: "100vh",
        background: `radial-gradient(circle at 0 0, ${C3}22 0, #f5f7fb 45%, #ffffff 100%)`,
      }}
    >
      <Content
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: isMobile ? 16 : 32,
        }}
      >
        <Row gutter={isMobile ? 16 : 32} style={{ width: "100%", maxWidth: 980 }}>
          {!isMobile && (
            <Col md={12}>
              <div
                style={{
                  height: "100%",
                  borderRadius: 24,
                  padding: 24,
                  background: `radial-gradient(circle at 0% 0%, ${C3} 0, ${C1} 38%, #000000 100%)`,
                  color: "#fff",
                  boxShadow: "0 22px 45px rgba(15,23,42,0.45)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ marginTop: 6 }}>
                  <LogoBlock dark size={92} />
                </div>

                <div style={{ marginTop: 18 }}>
                  <Title level={3} style={{ color: "#fff", margin: 0, marginBottom: 10 }}>
                    Pilotez votre activité
                  </Title>
                  <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 14 }}>
                    Accédez aux indicateurs essentiels de votre entreprise dans un seul cockpit.
                    Cash estimé, chiffre d&apos;affaires, signaux clés:
                    <br />
                    <b>en un coup d&apos;oeil vous savez où vous allez</b>
                  </Text>
                </div>

                <div
                  style={{
                    marginTop: 28,
                    padding: 16,
                    borderRadius: 16,
                    background: "rgba(0,0,0,0.35)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  <div style={{ marginBottom: 4, opacity: 0.9 }}>✦ Exemple d’insights :</div>
                  <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 1.6 }}>
                    <li>Visibilité cash (autonomie) en mois.</li>
                    <li>Évolution du chiffre d’affaires.</li>
                    <li>Alertes sur les retards de paiement et les risques.</li>
                  </ul>
                </div>

                <div
                  style={{
                    position: "absolute",
                    right: -80,
                    bottom: -80,
                    width: 220,
                    height: 220,
                    borderRadius: 999,
                    background: `${C3}33`,
                  }}
                />
              </div>
            </Col>
          )}

          <Col xs={24} md={12}>
            <Card
              bordered={false}
              style={{
                borderRadius: 20,
                boxShadow:
                  "0 18px 45px rgba(15,23,42,0.12), 0 0 1px rgba(15,23,42,0.08)",
              }}
            >
              {isMobile && (
                <div style={{ marginBottom: 14 }}>
                  <LogoBlock dark={false} size={76} />
                </div>
              )}

              {!isMobile && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <GlobalOutlined style={{ color: C1, fontSize: 18, opacity: 0.55 }} />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Tadias — Connexion
                  </Text>
                </div>
              )}

              <Title level={4} style={{ marginBottom: 4, fontWeight: 700 }}>
                Connexion
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Entrez vos identifiants pour accéder à votre espace de pilotage.
              </Text>

              {error && (
                <Alert
                  type="error"
                  showIcon
                  message={error}
                  style={{ marginTop: 16, marginBottom: 8 }}
                />
              )}

              <Form
                layout="vertical"
                onFinish={handleFinish}
                requiredMark={false}
                style={{ marginTop: 16 }}
              >
                <Form.Item
                  label="Adresse e-mail"
                  name="email"
                  rules={[
                    { required: true, message: "L'e-mail est obligatoire" },
                    { type: "email", message: "L'e-mail n'est pas valide" },
                  ]}
                >
                  <Input
                    autoComplete="email"
                    prefix={<MailOutlined style={{ color: "rgba(0,0,0,0.25)" }} />}
                    placeholder="vous@entreprise.com"
                  />
                </Form.Item>

                <Form.Item
                  label="Mot de passe"
                  name="password"
                  rules={[{ required: true, message: "Le mot de passe est obligatoire" }]}
                >
                  <Input.Password
                    autoComplete="current-password"
                    prefix={<LockOutlined style={{ color: "rgba(0,0,0,0.25)" }} />}
                    placeholder="Votre mot de passe"
                  />
                </Form.Item>

                <Form.Item style={{ marginBottom: 8 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={loading}
                    style={{ background: C2, borderColor: C2 }}
                  >
                    Se connecter
                  </Button>
                </Form.Item>

                <Text type="secondary" style={{ fontSize: 12 }}>
                  Vos identifiants sont personnels. Contactez l’administrateur pour créer ou
                  réinitialiser un accès.
                </Text>
              </Form>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}
