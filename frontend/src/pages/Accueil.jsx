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
import { ArrowRightOutlined, CheckCircleFilled, WhatsAppOutlined, LoginOutlined } from "@ant-design/icons";
import { motion, useReducedMotion } from "framer-motion";

import logo1 from "../assets/logo/logoblanc.jpeg";
import videotadias from "../assets/video/tadias.mp4";

const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;
const { Header, Content, Footer } = Layout;
const API_BASE = process.env.REACT_APP_API_BASE;
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
    maxWidth: 1080,
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

  const Section = ({ id, title, children }) => (
    <section id={id} style={{ padding: isMobile ? "26px 0" : "44px 0" }}>
      <div style={container}>
        {title && (
          <Title
            level={2}
            style={{
              margin: 0,
              color: brand.ink,
              fontSize: isMobile ? 22 : 28,
              letterSpacing: -0.3,
            }}
          >
            {title}
          </Title>
        )}
        <div style={{ marginTop: title ? 14 : 0 }}>{children}</div>
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
      bodyStyle={{ padding: isMobile ? 16 : 20, ...bodyStyle }}
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

  // ✅ Source vidéo robuste (mp4 local ou iframe HeyGen)
  const mediaSrc = typeof videotadias === "string" ? videotadias : videotadias?.src || "";
  const isDirectVideo = !!mediaSrc && /\.(mp4|webm|ogg)(\?.*)?$/i.test(mediaSrc);

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
        {/* blobs subtils */}
        <MotionDiv aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <MotionDiv
            style={{
              position: "absolute",
              width: 540,
              height: 540,
              borderRadius: 999,
              left: -240,
              top: -240,
              background: brand.soft,
              filter: "blur(18px)",
            }}
            animate={reduceMotion ? {} : { x: [0, 22, 0], y: [0, 14, 0] }}
            transition={reduceMotion ? {} : { duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />

          <MotionDiv
            style={{
              position: "absolute",
              width: 460,
              height: 460,
              borderRadius: 999,
              right: -200,
              bottom: -220,
              background: "rgba(6,22,33,0.04)",
              filter: "blur(18px)",
            }}
            animate={reduceMotion ? {} : { x: [0, -16, 0], y: [0, -10, 0] }}
            transition={reduceMotion ? {} : { duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </MotionDiv>

        {/* HEADER SIMPLE (pas de menu complexe) */}
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
                  width: 46,
                  height: 46,
                  borderRadius: 12,
                  overflow: "hidden",
                  border: `1px solid ${brand.border}`,
                  background: "rgba(255,255,255,0.85)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  preview={false}
                  src={logo1}
                  alt="Logo TADIAS"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              <div style={{ lineHeight: 1.15 }}>
                <Text strong style={{ color: brand.ink, fontSize: 14 }}>
                  TADIAS
                </Text>
                <br />
                <Text style={{ color: brand.muted, fontSize: 12 }}>
                  Dématérialisez. Voyer clair. Décidez mieux.
                </Text>
              </div>
            </Space>


            <Space>
              <Button
                shape="round"
                icon={<LoginOutlined />}
                href={`/login`}
                style={btnPrimary}
              >
                Espace client
              </Button>

              {/* <Button
                shape="round"
                size={isMobile ? "middle" : "large"}
                icon={<ArrowRightOutlined />}
                onClick={() => scrollTo("demat")}
                style={btnPrimary}
              >
                Découvrir Tadias
              </Button> */}
            </Space>
          </div>
        </Header>

        <Content id="top">
          {/* 1) HERO */}
          <section style={{ padding: isMobile ? "28px 0 16px" : "54px 0 22px" }}>
            <div style={container}>
              <MotionDiv variants={fadeUp} initial="hidden" animate="show">
                <Row gutter={[18, 18]} align="middle">
                  <Col xs={24} md={14}>
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
                      Dirigeant TPE / PME
                    </Tag>

                    <Title
                      level={1}
                      style={{
                        margin: 0,
                        color: brand.primary,
                        fontSize: isMobile ? 34 : 52,
                        lineHeight: 1.06,
                        letterSpacing: -0.9,
                        maxWidth: "26ch",
                      }}
                    >
                      Dématérialisez. Voyez clair. Décidez mieux.
                    </Title>

                    <Paragraph
                      style={{
                        margin: "12px 0 0",
                        color: brand.muted,
                        fontSize: isMobile ? 16 : 18,
                        lineHeight: 1.6,
                        maxWidth: "62ch",
                      }}
                    >
                      Tadias dématérialise votre comptabilité et transforme vos données en visibilité utile pour piloter
                      votre entreprise.
                    </Paragraph>

                    <Space style={{ marginTop: 14 }}>
                      <Button
                        size="large"
                        shape="round"
                        onClick={() => scrollTo("demat")}
                        style={btnPrimary}
                      >
                        Découvrir Tadias <ArrowRightOutlined />
                      </Button>
                    </Space>
                  </Col>

                  <Col xs={24} md={10}>
                    <MotionDiv whileHover={hoverLift}>
                      <ProCard>
                        <HeroVisualPro reduceMotion={reduceMotion} brand={brand} />
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

          {/* 2) RISQUE */}
          <Section id="risque" style={{ color: brand.primary }} title="Décider sans visibilité est devenu un risque.">
            <ProCard style={{ border: "1px solid rgba(0,171,201,0.18)", background: "linear-gradient(180deg, rgba(0,171,201,0.10), rgba(255,255,255,0.92))", }}>
              <Paragraph style={{ color: brand.muted, margin: 0, lineHeight: 1.7 }}>
                La comptabilité est obligatoire, mais elle arrive souvent trop tard.
                <br />
                Les tableaux Excel sont produits, mais rarement consultés.
                <br />
                Faute de lecture claire, les décisions se prennent à l’intuition — parfois trop tard.
              </Paragraph>
            </ProCard>
          </Section>


          <MotionDiv aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <MotionDiv
              style={{
                position: "absolute",
                width: 540,
                height: 540,
                borderRadius: 999,
                left: -240,
                top: -240,
                background: brand.soft,
                filter: "blur(18px)",
              }}
              animate={reduceMotion ? {} : { x: [0, 22, 0], y: [0, 14, 0] }}
              transition={reduceMotion ? {} : { duration: 9, repeat: Infinity, ease: "easeInOut" }}
            />

            <MotionDiv
              style={{
                position: "absolute",
                width: 460,
                height: 460,
                borderRadius: 999,
                right: -200,
                bottom: -220,
                background: "rgba(6,22,33,0.04)",
                filter: "blur(18px)",
              }}
              animate={reduceMotion ? {} : { x: [0, -16, 0], y: [0, -10, 0] }}
              transition={reduceMotion ? {} : { duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
          </MotionDiv>



          {/* 3) DÉMAT */}
          <Section title="Une comptabilité dématérialisée, sans prise de tête.">
            <ProCard style={{ border: "1px solid rgba(0,171,201,0.18)", background: "linear-gradient(180deg, rgba(0,171,201,0.10), rgba(255,255,255,0.92))", }}>
              <List
                dataSource={[
                  "Le client a uniquement à scanner ou prendre en photo ses pièces comptables de manière lisible et à les déposer sur la plateforme Tadias.",
                  "Aucune compétence comptable ou financière n’est requise. Le traitement des données et la tenue de la comptabilité de gestion sont pris en charge en back-end.",
                  "Les données sont ensuite automatiquement visibles sur la plateforme Tadias,sous forme d’indicateurs simples, de tendances et de signaux de pilotage.",
                  "Les obligations légales et fiscales (déclarations, clôtures, régularisations) ne sont pas incluses.",
                ]}
                renderItem={(item) => (
                  <List.Item style={{ border: "none", padding: "8px 0" }}>
                    <Space align="start">
                      <CheckCircleFilled style={{ color: brand.primary, marginTop: 4 }} />
                      <Text style={{ color: brand.ink }}>{item}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            </ProCard>
          </Section>

          {/* 4) VISIBILITÉ */}
          <Section id="visibilite" title="Mais surtout, vous voyez enfin ce qui se passe.">
            <ProCard style={{ border: "1px solid rgba(0,171,201,0.18)", background: "linear-gradient(180deg, rgba(0,171,201,0.10), rgba(255,255,255,0.92))", }}>
              <Paragraph style={{ color: brand.muted, margin: 0, lineHeight: 1.7 }}>
                Contrairement à des tableaux difficiles à lire, Tadias restitue vos données sous forme de tendances, de
                tensions et de signaux simples.
                <br />
                Une lecture claire de la santé de votre entreprise, accessible à tout moment sur ordinateur, tablette
                ou mobile.
              </Paragraph>
            </ProCard>
          </Section>

          {/* 5) POUR QUI */}
          <Section id="cible" title="Le pilotage n’est plus réservé aux grandes entreprises.">
            <ProCard style={{ border: "1px solid rgba(0,171,201,0.18)", background: "linear-gradient(180deg, rgba(0,171,201,0.10), rgba(255,255,255,0.92))", }}>
              <Paragraph style={{ color: brand.muted, margin: 0, lineHeight: 1.7 }}>
                Tadias s’adresse aux dirigeants de TPE et PME qui veulent comprendre leur activité sans jargon
                financier et prendre de meilleures décisions sans passer des heures sur les chiffres.
              </Paragraph>
            </ProCard>
          </Section>

          {/* 6) VIDÉO */}
          <Section id="demat" title="Pourquoi Tadias existe.">
            <Row gutter={[14, 14]} align="top">
              <Col xs={24} md={16}>
                <ProCard style={{ border: "1px solid rgba(0,171,201,0.18)", background: "linear-gradient(180deg, rgba(0,171,201,0.10), rgba(255,255,255,0.92))", }}>
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
                      <video
                        src={mediaSrc}
                        controls
                        playsInline
                        preload="metadata"
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          display: "block",
                        }}
                      >
                        Votre navigateur ne supporte pas la vidéo.
                      </video>
                    ) : (
                      <iframe
                        title="Vidéo Tadias"
                        src={mediaSrc}
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          border: 0,
                        }}
                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    )}
                  </div>

                  <Text style={{ color: brand.muted, fontSize: 12, display: "block", marginTop: 10 }}>
                    (Pourquoi Tadias existe)
                  </Text>
                </ProCard>
              </Col>

              <Col xs={24} md={8}>
                <MotionDiv whileHover={hoverLift}>
                  <ProCard style={{ border: "1px solid rgba(0,171,201,0.18)", background: "linear-gradient(180deg, rgba(0,171,201,0.10), rgba(255,255,255,0.92))", }}>
                    <Text strong style={{ color: brand.ink, fontSize: 16 }}>
                      Une lecture simple, quand vous en avez besoin
                    </Text>
                    <Paragraph style={{ color: brand.muted, margin: "8px 0 0" }}>
                      Objectif : une visibilité utile et actionnable, sans surcharge ni jargon.
                    </Paragraph>
                  </ProCard>
                </MotionDiv>
              </Col>
            </Row>
          </Section>

          {/* 7) ÉCOSYSTÈME */}
          <Section id="ecosysteme" title="Une plateforme, un écosystème.">
            <ProCard style={{ border: "1px solid rgba(0,171,201,0.18)", background: "linear-gradient(180deg, rgba(0,171,201,0.10), rgba(255,255,255,0.92))", }}>
              <Paragraph style={{ color: brand.muted, margin: 0, lineHeight: 1.7 }}>
                Tadias automatise et structure les données issues de la comptabilité dématérialisée.
                <br />
                <br />
                Lorsque le traitement comptable est assuré en back-end, des états intermédiaires ou bilans peuvent être
                produits à la demande, dans le cadre de prestations complémentaires, en collaboration avec des cabinets
                comptables partenaires.
                <br />
                <br />
                Ces documents peuvent être intégrés directement dans l’espace Tadias du client, afin de conserver une
                continuité de lecture entre données comptables et pilotage.
                <br />
                <br />
                Les obligations légales, fiscales et déclaratives (déclarations, clôtures, régularisations de fin
                d’exercice) sont également proposées en sus, dans le cadre de collaborations avec des cabinets
                comptables.
                <br />
                <br />
                <Text strong style={{ color: brand.ink }}>
                  Tadias ne remplace pas l’expert-comptable.
                </Text>{" "}
                Il facilite le lien entre production comptable et lecture managériale.
              </Paragraph>
            </ProCard>
          </Section>

          {/* 8) DISCLAIMER OUTIL */}
          <Section id="pilotage" title="Un outil de pilotage, pas un outil comptable.">
            <ProCard style={{ border: "1px solid rgba(0,171,201,0.18)", background: "linear-gradient(180deg, rgba(0,171,201,0.10), rgba(255,255,255,0.92))", }}>
              <Paragraph style={{ color: brand.muted, margin: 0, lineHeight: 1.7 }}>
                Les indicateurs proposés par Tadias sont estimatifs et évolutifs.
                <br />
                Ils servent à piloter, anticiper et arbitrer à partir de tendances et de signaux.
                <br />
                Ils ne constituent pas des données comptables certifiées et ne remplacent pas les obligations légales
                et fiscales.
              </Paragraph>
            </ProCard>
          </Section>

          {/* 9) EXPÉRIENCE */}
          <Section id="experience" title={null}>
            <ProCard
              style={{
                border: "1px solid rgba(0,171,201,0.18)",
                background: "linear-gradient(180deg, rgba(0,171,201,0.08), rgba(255,255,255,0.92))",
              }}
            >
              <Text style={{ color: brand.ink }}>
                Conçu à partir de plus de vingt ans d’expérience terrain en gestion, finance et accompagnement
                d’entreprises à taille humaine.
              </Text>
            </ProCard>
          </Section>

          {/* 10) CTA + CONTACT DISCRET EN BAS */}
          <Section id="contact" title="Voir clair, c’est reprendre le contrôle.">
            <ProCard
              style={{
                border: "1px solid rgba(0,171,201,0.18)",
                background: "linear-gradient(180deg, rgba(0,171,201,0.10), rgba(255,255,255,0.92))",
              }}
            >
              <Paragraph style={{ color: brand.muted, margin: "0 0 10px", lineHeight: 1.7 }}>
                Tadias n’est pas un outil de plus.
                <br />
                C’est une manière plus simple de comprendre son entreprise au quotidien.
              </Paragraph>

              <Divider style={{ borderColor: "rgba(0,171,201,0.18)", margin: "14px 0" }} />

              <Text strong style={{ color: brand.ink, fontSize: 16 }}>
                Envie d’y voir plus clair sur votre activité ?
              </Text>
              <Paragraph style={{ color: brand.muted, margin: "8px 0 0", lineHeight: 1.7 }}>
                Tadias s’adresse aux dirigeants qui veulent une vision simple et lisible de leurs chiffres, sans
                complexité inutile.
                <br />
                Nous échangeons d’abord pour comprendre votre contexte et voir si la plateforme est pertinente pour
                vous.
              </Paragraph>

              <Space style={{ marginTop: 12 }} wrap>
                <Button
                  shape="round"
                  icon={<WhatsAppOutlined />}
                  href="https://wa.me/261382308971?text=Bonjour%20Tadias%2C%20je%20souhaite%20en%20savoir%20plus."
                  target="_blank"
                  rel="noreferrer"
                  style={btnPrimary}
                >
                  Nous contacter
                </Button>

              </Space>

              <div style={{ marginTop: 10 }}>
                <Text style={{ color: "rgba(6,22,33,0.50)", fontSize: 12, fontStyle: "italic" }}>
                  Les indicateurs présentés sont des estimations destinées au pilotage et à l’analyse des tendances.
                  Tadias n’est pas un outil de décision financière ou d’investissement.
                </Text>
              </div>
            </ProCard>
          </Section>
        </Content>

        <Footer style={{ background: "transparent", padding: "20px 0 26px" }}>
          <div style={container}>
            <Divider style={{ borderColor: brand.border2, margin: "0 0 14px" }} />
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <Text style={{ color: "rgba(6,22,33,0.55)", fontSize: 12, background: "linear-gradient(180deg, rgba(0,171,201,0.10), rgba(255,255,255,0.92))", }}>
                © {new Date().getFullYear()} TADIAS
              </Text>
              <Button type="text" onClick={() => scrollTo("top")} style={{ color: brand.ink }}>
                Haut de page
              </Button>
            </Space>
          </div>
        </Footer>
      </Layout>
    </ConfigProvider >
  );
}

/** Visual pro : plus sobre + plus “dashboard” */
function HeroVisualPro({ reduceMotion, brand }) {
  const pulse = reduceMotion
    ? {}
    : {
      opacity: [0.55, 1, 0.55],
      transition: { duration: 2.6, repeat: Infinity, ease: "easeInOut" },
    };

  const floatSlow = (delay = 0) =>
    reduceMotion
      ? {}
      : {
        y: [0, -6, 0],
        transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut", delay },
      };

  return (
    <div
      aria-label="Aperçu cockpit"
      style={{
        position: "relative",
        width: "100%",
        height: 240,
        borderRadius: 16,
        overflow: "hidden",
        border: `1px solid ${brand.border}`,
        background: "linear-gradient(180deg, rgba(6,22,33,0.03), rgba(6,22,33,0.01))",
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 600 300" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <pattern id="gridPro" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(6,22,33,0.10)" strokeWidth="1" />
          </pattern>

          <linearGradient id="lineGradPro" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(6,22,33,0.28)" />
            <stop offset="55%" stopColor={brand.primary} />
            <stop offset="100%" stopColor="rgba(6,22,33,0.18)" />
          </linearGradient>

          <linearGradient id="areaPro" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,171,201,0.18)" />
            <stop offset="100%" stopColor="rgba(0,171,201,0.00)" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="600" height="300" fill="url(#gridPro)" />

        <path
          d="M40,220 C140,160 220,210 300,150 C380,95 440,175 520,125 C555,105 575,110 590,95 L590,300 L40,300 Z"
          fill="url(#areaPro)"
        />

        <motion.path
          d="M40,220 C140,160 220,210 300,150 C380,95 440,175 520,125 C555,105 575,110 590,95"
          fill="none"
          stroke="url(#lineGradPro)"
          strokeWidth="3.5"
          strokeLinecap="round"
          initial={reduceMotion ? {} : { pathLength: 0 }}
          animate={reduceMotion ? {} : { pathLength: 1 }}
          transition={reduceMotion ? {} : { duration: 1.2, ease: "easeOut" }}
        />

        {[
          { cx: 300, cy: 150, delay: 0.0 },
          { cx: 520, cy: 125, delay: 0.35 },
          { cx: 590, cy: 95, delay: 0.7 },
        ].map((p, i) => (
          <motion.circle
            key={i}
            cx={p.cx}
            cy={p.cy}
            r="6"
            fill={brand.primary}
            animate={
              reduceMotion
                ? {}
                : {
                  opacity: [0.6, 1, 0.6],
                  r: [5, 7, 5],
                  transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: p.delay },
                }
            }
          />
        ))}
      </svg>

      <motion.div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 12,
          top: 12,
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
        }}
        {...floatSlow(0.1)}
      >
        {[
          { label: "Tendance", value: "↗", bg: brand.soft, b: "rgba(0,171,201,0.25)", c: brand.primary },
          {
            label: "Tadias",
            value: "",
            bg: "rgba(6,22,33,0.04)",
            b: "rgba(6,22,33,0.10)",
            c: "rgba(6,22,33,0.70)",
          },
        ].map((k) => (
          <div
            key={k.label}
            style={{
              borderRadius: 999,
              padding: "8px 10px",
              background: k.bg,
              border: `1px solid ${k.b}`,
              display: "flex",
              gap: 8,
              alignItems: "center",
              boxShadow: "0 10px 26px rgba(6,22,33,0.08)",
            }}
          >
            <span style={{ color: k.c, fontWeight: 700 }}>{k.value}</span>
            <span style={{ color: "rgba(6,22,33,0.70)", fontSize: 12 }}>{k.label}</span>
          </div>
        ))}
      </motion.div>

      <motion.div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: 12,
          bottom: 12,
          width: 168,
          height: 72,
          borderRadius: 16,
          background: "rgba(255,255,255,0.78)",
          border: "1px solid rgba(6,22,33,0.10)",
          boxShadow: "0 18px 50px rgba(6,22,33,0.10)",
          overflow: "hidden",
        }}
        {...floatSlow(0.35)}
      >
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 20% 30%, rgba(0,171,201,0.18), rgba(0,0,0,0))",
          }}
          {...pulse}
        />
        <div style={{ position: "absolute", left: 12, top: 10 }}>

        </div>

        <div
          style={{
            position: "absolute",
            left: 12,
            right: 12,
            bottom: 10,
            display: "flex",
            gap: 6,
            alignItems: "flex-end",
          }}
        >
          {[10, 18, 14, 22, 16, 26].map((h, i) => (
            <div
              key={i}
              style={{
                width: 10,
                height: h,
                borderRadius: 8,
                background: i === 5 ? brand.primary : "rgba(6,22,33,0.10)",
                border: "1px solid rgba(6,22,33,0.10)",
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
  //test
}
