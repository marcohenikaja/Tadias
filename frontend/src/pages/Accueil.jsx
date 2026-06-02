import React from "react";
import {
  Typography,
  Space,
  Button,
  Row,
  Col,
  Card,
  Image,
  List,
  Grid,
  Tag,
  Layout,
  Divider,
  ConfigProvider,
} from "antd";
import {
  ArrowRightOutlined,
  CheckCircleFilled,
  WhatsAppOutlined,
  LoginOutlined,
  SafetyCertificateOutlined,
  DashboardOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { motion, useReducedMotion } from "framer-motion";

import logo1 from "../assets/logo/logoblanc.jpeg";
import videotadias from "../assets/video/tadias.mp4";
import dashboardPreview from "../assets/images/dashboard-tadias.jpeg";
// Option recommandé : ajoute une vraie capture ici puis remplace le visuel SVG.
// import dashboardPreview from "../assets/images/dashboard-tadias.png";

const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;
const { Header, Content, Footer } = Layout;

const MotionDiv = motion.div;

export default function AccueilPro() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const reduceMotion = useReducedMotion();

  const brand = {
    primary: "#00A5C5",
    ink: "rgba(6, 22, 33, 0.92)",
    muted: "rgba(6, 22, 33, 0.62)",
    border: "rgba(6, 22, 33, 0.10)",
    border2: "rgba(6, 22, 33, 0.06)",
    surface: "rgba(255,255,255,0.92)",
    surface2: "rgba(255,255,255,0.82)",
    soft: "rgba(0,171,201,0.10)",
    bg: "linear-gradient(180deg, #ffffff 0%, #f6fbfd 55%, #ffffff 100%)",
  };

  const container = {
    maxWidth: 1120,
    margin: "0 auto",
    padding: "0 18px",
  };

  const baseTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.65, ease: [0.22, 1, 0.36, 1] };

  const fadeUp = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: baseTransition },
  };

  const hoverLift = reduceMotion ? {} : { y: -4, transition: { duration: 0.16 } };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 86;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const Section = ({ id, label, title, subtitle, children }) => (
    <section id={id} style={{ padding: isMobile ? "30px 0" : "52px 0" }}>
      <div style={container}>
        {(label || title) && (
          <div style={{ marginBottom: 16 }}>
            {label && (
              <Text
                strong
                style={{
                  display: "block",
                  color: brand.primary,
                  fontSize: 13,
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  marginBottom: 6,
                }}
              >
                {label}
              </Text>
            )}
            {title && (
              <Title
                level={2}
                style={{
                  margin: 0,
                  color: brand.ink,
                  fontSize: isMobile ? 24 : 32,
                  letterSpacing: -0.4,
                }}
              >
                {title}
              </Title>
            )}
            {subtitle && (
              <Paragraph style={{ color: brand.muted, margin: "8px 0 0", maxWidth: 760 }}>
                {subtitle}
              </Paragraph>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );

  const ProCard = ({ children, style, bodyStyle }) => (
    <Card
      style={{
        borderRadius: 18,
        background: `linear-gradient(180deg, ${brand.surface}, ${brand.surface2})`,
        border: `1px solid ${brand.border}`,
        boxShadow: "0 12px 34px rgba(6,22,33,0.08)",
        ...style,
      }}
      bodyStyle={{ padding: isMobile ? 16 : 22, ...bodyStyle }}
    >
      {children}
    </Card>
  );

  const btnPrimary = {
    background: brand.primary,
    borderColor: brand.primary,
    color: "rgba(255,255,255,0.95)",
    boxShadow: "0 16px 40px rgba(0,171,201,0.22)",
  };

  const mediaSrc = typeof videotadias === "string" ? videotadias : videotadias?.src || "";
  const isDirectVideo = !!mediaSrc && /\.(mp4|webm|ogg)(\?.*)?$/i.test(mediaSrc);

  const offers = [
    {
      name: "Essentiel",
      target: "Activité simple",
      price: "450 000 Ar",
      kpis: "Standards",
      reporting: "PDF mensuel",
      meeting: "Visio 30 min",
    },
    {
      name: "Business",
      target: "PME structurée",
      price: "700 000 Ar",
      kpis: "Personnalisés",
      reporting: "PDF + analyse",
      meeting: "Visio 1h préparé",
      featured: true,
    },
    {
      name: "Performance",
      target: "Entreprise complexe",
      price: "Sur devis dès 2 000 000 Ar",
      kpis: "Multi-axes",
      reporting: "PDF + forecast",
      meeting: "Fréquence adaptée",
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: brand.primary,
          borderRadius: 10,
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
        },
      }}
    >
      <Layout
        style={{
          minHeight: "100vh",
          background: brand.bg,
          color: brand.ink,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            height: 74,
            display: "flex",
            alignItems: "center",
            background: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            borderBottom: `1px solid ${brand.border2}`,
            padding: 0,
          }}
        >
          <div
            style={{
              ...container,
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <Space size={12} align="center">
              <div
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 12,
                  overflow: "hidden",
                  border: `1px solid ${brand.border}`,
                  background: "rgba(255,255,255,0.85)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image preview={false} src={logo1} alt="Logo TADIAS" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>

              <div style={{ lineHeight: 1.15 }}>
                <Text strong style={{ color: brand.ink, fontSize: 14 }}>TADIAS</Text>
                <br />
                <Text style={{ color: brand.muted, fontSize: 12 }}>Pilotage • Data • Impact</Text>
              </div>
            </Space>

            <Space>
              <Button shape="round" icon={<LoginOutlined />} href="/login" style={btnPrimary}>
                Espace client
              </Button>
            </Space>
          </div>
        </Header>

        <Content id="top">
          <section style={{ padding: isMobile ? "30px 0 18px" : "62px 0 28px" }}>
            <div style={container}>
              <MotionDiv variants={fadeUp} initial="hidden" animate="show">
                <Row gutter={[22, 22]} align="middle">
                  <Col xs={24} md={13}>
                    <Tag
                      style={{
                        borderRadius: 999,
                        padding: "6px 10px",
                        background: brand.soft,
                        border: "1px solid rgba(0,171,201,0.25)",
                        color: brand.primary,
                        marginBottom: 12,
                      }}
                    >
                      Dirigeants d'entreprise
                    </Tag>

                    <Title
                      level={1}
                      style={{
                        margin: 0,
                        color: brand.primary,
                        fontSize: isMobile ? 34 : 52,
                        lineHeight: 1.06,
                        letterSpacing: -0.9,
                        maxWidth: "22ch",
                      }}
                    >
                      Voyez enfin ce qui se passe dans votre entreprise.
                    </Title>

                    <Paragraph
                      style={{
                        margin: "14px 0 0",
                        color: brand.muted,
                        fontSize: isMobile ? 16 : 18,
                        lineHeight: 1.6,
                        maxWidth: "62ch",
                      }}
                    >
                      Tadias transforme vos données en tableau de bord clair et lisible — accessible sur mobile,
                      tablette ou ordinateur. Sans saisie. Sans compétence financière requise.
                    </Paragraph>

                    <Space style={{ marginTop: 16 }} wrap>
                      <Button size="large" shape="round" onClick={() => scrollTo("pourquoi")} style={btnPrimary}>
                        Découvrir Tadias <ArrowRightOutlined />
                      </Button>
                      <Button size="large" shape="round" onClick={() => scrollTo("offres")}>
                        Voir nos offres
                      </Button>
                    </Space>
                  </Col>

                  <Col xs={24} md={11}>
                    <MotionDiv whileHover={hoverLift}>
                      <ProCard>
                            <Image preview={false} src={dashboardPreview} alt="Tableau de bord Tadias" style={{ borderRadius: 14 }} /> 
                      </ProCard>
                    </MotionDiv>
                  </Col>
                </Row>
              </MotionDiv>
            </div>
          </section>

          <div style={container}>
            <Divider style={{ borderColor: brand.border2, margin: isMobile ? "18px 0" : "22px 0" }} />
          </div>

          <Section id="probleme" label="Le problème" title="Décider sans visibilité, c'est piloter à l'aveugle.">
            <Row gutter={[14, 14]}>
              {[
                "Vous faites du chiffre, mais vous ne savez pas exactement si vous gagnez ou perdez de l'argent ce mois-ci.",
                "Vos données existent quelque part — mais personne ne les lit vraiment.",
                "Les grandes entreprises ont des directeurs financiers pour ça. Tadias rend cette expertise accessible à toute entreprise.",
              ].map((item, index) => (
                <Col xs={24} md={8} key={item}>
                  <MotionDiv whileHover={hoverLift}>
                    <ProCard style={{ height: "100%" }}>
                      <Text strong style={{ color: brand.primary, fontSize: 20 }}>0{index + 1}</Text>
                      <Paragraph style={{ color: brand.ink, margin: "10px 0 0", lineHeight: 1.65 }}>{item}</Paragraph>
                    </ProCard>
                  </MotionDiv>
                </Col>
              ))}
            </Row>
          </Section>

          <Section id="fonctionnement" label="Comment ça fonctionne" title="Simple pour vous. Rigoureux pour nous.">
            <ProCard>
              <List
                dataSource={[
                  {
                    title: "① Cadrage stratégique",
                    text: "Une séance de travail avec vous pour comprendre vos objectifs et définir les indicateurs qui ont du sens pour votre activité. Inclus dans l'abonnement.",
                  },
                  {
                    title: "② Vous scannez, on gère",
                    text: "Photographiez ou scannez vos pièces. Nos équipes traitent tout en arrière-plan. Votre tableau de bord se met à jour automatiquement.",
                  },
                  {
                    title: "③ Reporting mensuel + point stratégique",
                    text: "Chaque mois : un rapport PDF commenté et un point en visio avec un consultant dédié pour analyser vos résultats et anticiper.",
                  },
                  {
                    title: "＋ Forecast & pilotage avancé",
                    text: "Une fois votre historique constitué, on intègre des prévisions budgétaires et une lecture prospective de votre activité. Le pilotage de performance comme les grandes entreprises.",
                  },
                ]}
                renderItem={(item) => (
                  <List.Item style={{ borderColor: brand.border2, padding: "14px 0" }}>
                    <Space align="start">
                      <CheckCircleFilled style={{ color: brand.primary, marginTop: 5 }} />
                      <div>
                        <Text strong style={{ color: brand.ink }}>{item.title}</Text>
                        <Paragraph style={{ color: brand.muted, margin: "4px 0 0", lineHeight: 1.65 }}>{item.text}</Paragraph>
                      </div>
                    </Space>
                  </List.Item>
                )}
              />
              <Tag style={{ borderRadius: 999, padding: "7px 11px", background: brand.soft, color: brand.primary }}>
                Alertes automatiques incluses dans toutes les offres
              </Tag>
            </ProCard>
          </Section>

          <Section id="offres" label="Les offres" title="Nos offres d'abonnement mensuel">
            <Row gutter={[14, 14]}>
              {offers.map((offer) => (
                <Col xs={24} md={8} key={offer.name}>
                  <MotionDiv whileHover={hoverLift}>
                    <ProCard
                      style={{
                        height: "100%",
                        border: offer.featured ? "1px solid rgba(0,171,201,0.45)" : `1px solid ${brand.border}`,
                      }}
                    >
                      {offer.featured && <Tag color="cyan">Populaire</Tag>}
                      <Title level={3} style={{ margin: "8px 0 4px", color: brand.ink }}>{offer.name}</Title>
                      <Text style={{ color: brand.muted }}>{offer.target}</Text>
                      <Title level={4} style={{ color: brand.primary, margin: "16px 0" }}>{offer.price} / mois</Title>

                      <List
                        size="small"
                        dataSource={[
                          ["KPIs", offer.kpis],
                          ["Reporting", offer.reporting],
                          ["Point mensuel", offer.meeting],
                        ]}
                        renderItem={([label, value]) => (
                          <List.Item style={{ paddingLeft: 0, paddingRight: 0 }}>
                            <Text style={{ color: brand.muted }}>{label}</Text>
                            <Text strong style={{ color: brand.ink }}>{value}</Text>
                          </List.Item>
                        )}
                      />
                    </ProCard>
                  </MotionDiv>
                </Col>
              ))}
            </Row>

            <ProCard style={{ marginTop: 14, background: "linear-gradient(180deg, rgba(0,171,201,0.08), rgba(255,255,255,0.92))" }}>
              <Paragraph style={{ color: brand.muted, margin: 0 }}>
                * Alertes automatiques et tableau de bord digital inclus dans toutes les offres.<br />
                * Les obligations légales et fiscales ne sont pas incluses dans l'abonnement.
              </Paragraph>
              <Button
                shape="round"
                icon={<WhatsAppOutlined />}
                href="https://wa.me/261382308971?text=Bonjour%20Tadias%2C%20je%20souhaite%20en%20savoir%20plus."
                target="_blank"
                rel="noreferrer"
                style={{ ...btnPrimary, marginTop: 12 }}
              >
                Nous contacter via WhatsApp
              </Button>
            </ProCard>
          </Section>

          <Section id="pourquoi" label="Pourquoi Tadias?" title="Conçu par des praticiens, pour des dirigeants.">
            <Row gutter={[14, 14]} align="top">
              <Col xs={24} md={15}>
                <ProCard>
                  <Title level={3} style={{ marginTop: 0, color: brand.ink }}>Pourquoi Tadias existe?</Title>
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      paddingTop: "56.25%",
                      borderRadius: 14,
                      overflow: "hidden",
                      border: `1px solid ${brand.border}`,
                      background: "rgba(6,22,33,0.03)",
                    }}
                  >
                    {isDirectVideo ? (
                      <video src={mediaSrc} controls playsInline preload="metadata" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}>
                        Votre navigateur ne supporte pas la vidéo.
                      </video>
                    ) : (
                      <iframe
                        title="Vidéo Tadias"
                        src={mediaSrc}
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    )}
                  </div>
                </ProCard>
              </Col>

              <Col xs={24} md={9}>
                <ProCard>
                  <Paragraph style={{ color: brand.muted, lineHeight: 1.7 }}>
                    Tadias existe depuis novembre 2003. À l'époque, sous le nom Tadiass Consulting, le cabinet accompagnait déjà des PME malgaches en gestion, finance et procédures. Vingt ans plus tard, nous avons gardé l'essentiel — et ajouté ce qui manquait : un outil digital, des tableaux de bord en temps réel, et un suivi continu.
                    Nous avons vu des dirigeants prendre de mauvaises décisions faute de lisibilité — pas par manque d'intelligence, mais par manque d'outil adapté.
                  </Paragraph>
                  <Paragraph style={{ color: brand.muted, lineHeight: 1.7, marginBottom: 0 }}>
                    <Text strong style={{ color: brand.ink }}>Tadias ne remplace pas votre expert-comptable.</Text>Il fait le lien entre vos données comptables et votre lecture managériale au quotidien.
                  </Paragraph>
                </ProCard>
              </Col>
            </Row>

            <Row gutter={[14, 14]} style={{ marginTop: 14 }}>
              {[
                [<DashboardOutlined />, "Tableau de bord accessible partout, à tout moment"],
                [<SafetyCertificateOutlined />, "Vos données restent les vôtres"],
                [<UserOutlined />, "Un consultant dédié, pas un logiciel livré seul"],
              ].map(([icon, text]) => (
                <Col xs={24} md={8} key={text}>
                  <ProCard style={{ height: "100%" }}>
                    <Space align="start">
                      <span style={{ color: brand.primary, fontSize: 22 }}>{icon}</span>
                      <Text strong style={{ color: brand.ink }}>{text}</Text>
                    </Space>
                  </ProCard>
                </Col>
              ))}
            </Row>
          </Section>

          <Section id="contact" label="Call to action final" title="Envie d'y voir plus clair sur votre activité ?">
            <ProCard style={{ background: "linear-gradient(180deg, rgba(0,171,201,0.10), rgba(255,255,255,0.92))" }}>
              <Paragraph style={{ color: brand.muted, margin: "0 0 14px", lineHeight: 1.7 }}>
                On commence par échanger pour comprendre votre contexte et voir si Tadias est fait pour vous. Aucun engagement.
              </Paragraph>
              <Button
                size="large"
                shape="round"
                icon={<WhatsAppOutlined />}
                href="https://wa.me/261382308971?text=Bonjour%20Tadias%2C%20je%20souhaite%20en%20savoir%20plus."
                target="_blank"
                rel="noreferrer"
                style={btnPrimary}
              >
                Nous contacter via WhatsApp
              </Button>
            </ProCard>
          </Section>

          <Section id="mention-legale" label="Mention légale" title="Informations de pilotage et cadre d’usage">
            <ProCard
              style={{
                background: "linear-gradient(180deg, rgba(0,171,201,0.05), rgba(255,255,255,0.92))",
              }}
            >
              <Paragraph style={{ color: brand.muted, margin: 0, lineHeight: 1.7 }}>
                Les indicateurs affichés sur la plateforme sont des estimations de gestion destinées au pilotage opérationnel.
                Dans le cadre d'un projet de financement ou d'investissement, notre équipe peut produire des états de gestion
                approfondis sur demande, en sus de l'abonnement.
              </Paragraph>

              <Divider style={{ borderColor: "rgba(0,171,201,0.18)", margin: "18px 0" }} />

              <Text strong style={{ color: brand.ink }}>
                tadias.co | Pilotage • Data • Impact
              </Text>
            </ProCard>
          </Section>
        </Content>

        <Footer style={{ background: "transparent", padding: "20px 0 26px" }}>
          <div style={container}>
            <Divider style={{ borderColor: brand.border2, margin: "0 0 14px" }} />
            <Space style={{ width: "100%", justifyContent: "space-between" }} wrap>
              <Text style={{ color: "rgba(6,22,33,0.55)", fontSize: 12 }}>
                © {new Date().getFullYear()} TADIAS — tadias.co | Pilotage • Data • Impact
              </Text>
              <Button type="text" onClick={() => scrollTo("top")} style={{ color: brand.ink }}>
                Haut de page
              </Button>
            </Space>
          </div>
        </Footer>
      </Layout>
    </ConfigProvider>
  );
}

function HeroVisualPro({ reduceMotion, brand }) {
  const pulse = reduceMotion
    ? {}
    : {
      opacity: [0.55, 1, 0.55],
      transition: { duration: 2.6, repeat: Infinity, ease: "easeInOut" },
    };

  return (
    <div
      aria-label="Aperçu tableau de bord Tadias"
      style={{
        position: "relative",
        width: "100%",
        minHeight: 290,
        borderRadius: 16,
        overflow: "hidden",
        border: `1px solid ${brand.border}`,
        background: "linear-gradient(180deg, rgba(6,22,33,0.03), rgba(6,22,33,0.01))",
        padding: 16,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
        {["Chiffre", "Marge", "Trésorerie"].map((label, index) => (
          <div key={label} style={{ flex: 1, borderRadius: 14, background: "rgba(255,255,255,0.82)", border: `1px solid ${brand.border}`, padding: 12 }}>
            <Text style={{ color: brand.muted, fontSize: 12 }}>{label}</Text>
            <br />
            <Text strong style={{ color: index === 1 ? brand.primary : brand.ink, fontSize: 18 }}>{index === 0 ? "+12%" : index === 1 ? "34%" : "OK"}</Text>
          </div>
        ))}
      </div>

      <div style={{ borderRadius: 14, background: "rgba(255,255,255,0.78)", border: `1px solid ${brand.border}`, height: 156, position: "relative", overflow: "hidden" }}>
        <svg width="100%" height="100%" viewBox="0 0 600 190" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGradHome" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(6,22,33,0.28)" />
              <stop offset="55%" stopColor={brand.primary} />
              <stop offset="100%" stopColor="rgba(6,22,33,0.18)" />
            </linearGradient>
            <linearGradient id="areaHome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(0,171,201,0.18)" />
              <stop offset="100%" stopColor="rgba(0,171,201,0.00)" />
            </linearGradient>
          </defs>
          <path d="M20,150 C110,92 190,132 270,78 C350,28 430,112 500,65 C540,40 570,52 590,32 L590,190 L20,190 Z" fill="url(#areaHome)" />
          <motion.path
            d="M20,150 C110,92 190,132 270,78 C350,28 430,112 500,65 C540,40 570,52 590,32"
            fill="none"
            stroke="url(#lineGradHome)"
            strokeWidth="4"
            strokeLinecap="round"
            initial={reduceMotion ? {} : { pathLength: 0 }}
            animate={reduceMotion ? {} : { pathLength: 1 }}
            transition={reduceMotion ? {} : { duration: 1.2, ease: "easeOut" }}
          />
        </svg>
      </div>

      <motion.div {...pulse} style={{ marginTop: 12, borderRadius: 999, padding: "9px 12px", background: brand.soft, border: "1px solid rgba(0,171,201,0.25)", color: brand.primary, display: "inline-block" }}>
        Tableau de bord clair et lisible
      </motion.div>
    </div>
  );
}
