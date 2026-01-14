// import React from "react";
// import {
//   Typography,
//   Space,
//   Button,
//   Row,
//   Col,
//   Card,
//   Image,
//   List,
//   Grid,
//   Tag,
// } from "antd";
// import {
//   ArrowRightOutlined,
//   PlayCircleOutlined,
//   CheckCircleFilled,
//   LoginOutlined,
//   WhatsAppOutlined,
// } from "@ant-design/icons";
// import { motion, useReducedMotion } from "framer-motion";

// import logo1 from "../assets/logo/logocomplet.jpeg";
// import videotadias from "../assets/video/tadias.mp4";

// const { Title, Paragraph, Text } = Typography;
// const { useBreakpoint } = Grid;
// const MotionDiv = motion.div;



// export default function Accueil() {
//   const screens = useBreakpoint();
//   const isMobile = !screens.md;
//   const reduceMotion = useReducedMotion();

//   const colors = {
//     bg: "radial-gradient(circle at 0% 0%, #032338 0%, #0b3f52 40%, #00ABC9 115%)",
//     text: "rgba(255,255,255,0.92)",
//     muted: "rgba(255,255,255,0.74)",
//     border: "rgba(255,255,255,0.14)",
//     border2: "rgba(255,255,255,0.10)",
//     primary: "#00ABC9",
//   };

//   const containerStyle = {
//     maxWidth: 980,
//     margin: "0 auto",
//     padding: "0 18px",
//   };

//   const topbarStyle = {
//     position: "sticky",
//     top: 0,
//     zIndex: 50,
//     background: "rgba(3,35,56,0.52)",
//     backdropFilter: "blur(14px)",
//     WebkitBackdropFilter: "blur(14px)",
//     borderBottom: `1px solid ${colors.border2}`,
//   };

//   const logoBoxStyle = {
//     width: 70,
//     height: 70,
//     borderRadius: 14,
//     overflow: "hidden",
//     border: `1px solid ${colors.border}`,
//     background: "rgba(255,255,255,0.08)",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//   };

//   const glassCardStyle = {
//     borderRadius: 26,
//     background:
//       "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))",
//     border: `1px solid ${colors.border}`,
//     boxShadow: "0 18px 55px rgba(0,0,0,0.22)",
//     backdropFilter: "blur(10px)",
//     WebkitBackdropFilter: "blur(10px)",
//   };

//   const cardBodyStyle = { padding: isMobile ? 16 : 22 };

//   const btnSecondaryStyle = {
//     background: "rgba(255,255,255,0.10)",
//     borderColor: "rgba(255,255,255,0.22)",
//     color: colors.text,
//   };

//   const baseTransition = reduceMotion
//     ? { duration: 0 }
//     : { duration: 0.7, ease: [0.22, 1, 0.36, 1] };

//   const fadeUp = {
//     hidden: { opacity: 0, y: 14 },
//     show: { opacity: 1, y: 0, transition: baseTransition },
//   };

//   const hoverLift = reduceMotion ? {} : { y: -4, transition: { duration: 0.16 } };

//   const scrollTo = (id) => {
//     const el = document.getElementById(id);
//     if (!el) return;
//     const y = el.getBoundingClientRect().top + window.scrollY - 84;
//     window.scrollTo({ top: y, behavior: "smooth" });
//   };

//   const Separator = () => (
//     <div
//       style={{
//         height: 1,
//         margin: isMobile ? "18px 0" : "24px 0",
//         background:
//           "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.18), rgba(255,255,255,0))",
//       }}
//     />
//   );

//   // ✅ Source média robuste (selon bundler, un import peut être string ou objet)
//   const mediaSrc =
//     typeof videotadias === "string"
//       ? videotadias
//       : videotadias?.src || "";

//   // ✅ mp4/webm/ogg => <video>, sinon => <iframe>
//   const isDirectVideo =
//     !!mediaSrc && /\.(mp4|webm|ogg)(\?.*)?$/i.test(mediaSrc);

//   return (
//     <div
//       id="top"
//       style={{
//         minHeight: "100vh",
//         background: colors.bg,
//         position: "relative",
//         overflow: "hidden",
//       }}
//     >
//       {/* Blobs subtils */}
//       <MotionDiv aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
//         <MotionDiv
//           style={{
//             position: "absolute",
//             width: 520,
//             height: 520,
//             borderRadius: 999,
//             left: -220,
//             top: -220,
//             background: "rgba(0,171,201,0.18)",
//             filter: "blur(18px)",
//           }}
//           animate={reduceMotion ? {} : { x: [0, 24, 0], y: [0, 16, 0] }}
//           transition={reduceMotion ? {} : { duration: 9, repeat: Infinity, ease: "easeInOut" }}
//         />
//         <MotionDiv
//           style={{
//             position: "absolute",
//             width: 460,
//             height: 460,
//             borderRadius: 999,
//             right: -200,
//             bottom: -220,
//             background: "rgba(255,255,255,0.10)",
//             filter: "blur(18px)",
//           }}
//           animate={reduceMotion ? {} : { x: [0, -18, 0], y: [0, -12, 0] }}
//           transition={reduceMotion ? {} : { duration: 10, repeat: Infinity, ease: "easeInOut" }}
//         />
//       </MotionDiv>

//       {/* TOPBAR */}
//       <div style={topbarStyle}>
//         <div
//           style={{
//             ...containerStyle,
//             height: 72,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             gap: 12,
//           }}
//         >
//           <Space size={12} align="center">
//             <div style={logoBoxStyle}>
//               <Image
//                 preview={false}
//                 src={logo1}
//                 alt="Logo TADIAS"
//                 style={{ width: "100%", height: "100%", objectFit: "cover" }}
//               />
//             </div>

//             <div style={{ lineHeight: 1.15 }}>
//               <Text strong style={{ color: colors.text }}>TADIAS</Text>
//               9
//               <br />
//               <Text style={{ color: colors.muted, fontSize: 12 }}>
//                 Dématérialisation • Visibilité • Pilotage
//               </Text>
//             </div>
//           </Space>

//           <Space>
//             <Button
//               shape="round"
//               icon={<LoginOutlined />}
//               href="http://localhost:3000/login"
//               style={btnSecondaryStyle}
//             >
//               Espace client
//             </Button>

//             <Button
//               shape="round"
//               icon={<ArrowRightOutlined />}
//               onClick={() => scrollTo("demat")}
//               style={{
//                 background: colors.primary,
//                 borderColor: colors.primary,
//                 color: "rgba(255,255,255,0.95)",
//                 boxShadow: "0 16px 40px rgba(0,171,201,0.22)",
//               }}
//             >
//               Découvrir TADIAS
//             </Button>
//           </Space>
//         </div>
//       </div>

//       {/* CONTENT */}
//       <div style={{ ...containerStyle, padding: isMobile ? "26px 0 44px" : "48px 0 56px" }}>
//         {/* 1) HERO */}
//         <MotionDiv variants={fadeUp} initial="hidden" animate="show">
//           <Row gutter={[16, 16]} align="top">
//             <Col xs={24} md={15}>
//               <Tag
//                 style={{
//                   borderRadius: 999,
//                   padding: "6px 10px",
//                   background: "rgba(255,255,255,0.10)",
//                   border: `1px solid ${colors.border}`,
//                   color: colors.text,
//                   marginBottom: 10,
//                 }}
//               >
//                 Dirigeant TPE / PME
//               </Tag>

//               <Title
//                 style={{
//                   margin: 0,
//                   color: colors.text,
//                   fontSize: isMobile ? 34 : 44,
//                   lineHeight: 1.08,
//                   letterSpacing: -0.6,
//                   maxWidth: "22ch",
//                 }}
//               >
//                 Dématérialisez. Voyez clair. Décidez mieux.
//               </Title>

//               <Paragraph
//                 style={{
//                   margin: "12px 0 0",
//                   color: colors.muted,
//                   fontSize: isMobile ? 16 : 18,
//                   lineHeight: 1.55,
//                   maxWidth: "60ch",
//                 }}
//               >
//                 TADIAS dématérialise votre comptabilité
//                 <br />
//                 et transforme vos données en visibilité utile pour piloter votre entreprise.
//               </Paragraph>

//               <div style={{ marginTop: 16 }}>
//                 <Button
//                   size="large"
//                   shape="round"
//                   onClick={() => scrollTo("demat")}
//                   style={{
//                     height: 44,
//                     padding: "0 18px",
//                     background: colors.primary,
//                     borderColor: colors.primary,
//                     color: "rgba(255,255,255,0.95)",
//                     boxShadow: "0 16px 40px rgba(0,171,201,0.22)",
//                   }}
//                 >
//                   Découvrir TADIAS <ArrowRightOutlined />
//                 </Button>
//               </div>
//             </Col>

//             <Col xs={24} md={9}>
//               <MotionDiv whileHover={hoverLift}>
//                 <Card style={glassCardStyle} bodyStyle={cardBodyStyle}>
//                   <HeroVisual reduceMotion={reduceMotion} colors={colors} />
//                 </Card>
//               </MotionDiv>
//             </Col>
//           </Row>
//         </MotionDiv>

//         <Separator />

//         {/* 2) */}
//         <MotionDiv
//           initial={{ opacity: 0, y: 14 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true, amount: 0.2 }}
//           transition={baseTransition}
//         >
//           <Card style={glassCardStyle} bodyStyle={cardBodyStyle}>
//             <Title level={2} style={{ margin: 0, color: colors.text, fontSize: isMobile ? 22 : 26 }}>
//               Décider sans visibilité est devenu un risque.
//             </Title>
//             <Paragraph style={{ color: colors.muted, margin: "10px 0 0", maxWidth: "70ch" }}>
//               La comptabilité est obligatoire, mais elle arrive souvent trop tard.
//               <br />
//               Les tableaux Excel sont produits, mais rarement consultés.
//               <br />
//               Faute de lecture claire, les décisions se prennent à l’intuition — parfois trop tard.
//             </Paragraph>
//           </Card>
//         </MotionDiv>

//         <Separator />

//         {/* 3) */}
//         <div id="demat" />
//         <MotionDiv
//           initial={{ opacity: 0, y: 14 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true, amount: 0.2 }}
//           transition={baseTransition}
//         >
//           <Card style={glassCardStyle} bodyStyle={cardBodyStyle}>
//             <Title level={2} style={{ margin: 0, color: colors.text, fontSize: isMobile ? 22 : 26 }}>
//               Une comptabilité dématérialisée, sans prise de tête.
//             </Title>

//             <List
//               style={{ marginTop: 10 }}
//               dataSource={[
//                 "Vous scannez vos factures.",
//                 "Les données sont automatiquement centralisées et structurées.",
//                 "Vous n’avez plus à gérer des fichiers, des tableaux ou des ressaisies.",
//                 "TADIAS s’occupe du reste.",
//               ]}
//               renderItem={(item) => (
//                 <List.Item style={{ border: "none", padding: "8px 0" }}>
//                   <Space align="start">
//                     <CheckCircleFilled style={{ color: colors.primary, marginTop: 4 }} />
//                     <Text style={{ color: "rgba(255,255,255,0.88)", lineHeight: 1.45 }}>{item}</Text>
//                   </Space>
//                 </List.Item>
//               )}
//             />
//           </Card>
//         </MotionDiv>

//         <Separator />

//         {/* 4) */}
//         <MotionDiv
//           initial={{ opacity: 0, y: 14 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true, amount: 0.2 }}
//           transition={baseTransition}
//         >
//           <Card style={glassCardStyle} bodyStyle={cardBodyStyle}>
//             <Title level={2} style={{ margin: 0, color: colors.text, fontSize: isMobile ? 22 : 26 }}>
//               Mais surtout, vous voyez enfin ce qui se passe.
//             </Title>
//             <Paragraph style={{ color: colors.muted, margin: "10px 0 0", maxWidth: "70ch" }}>
//               Contrairement à des tableaux difficiles à lire,
//               <br />
//               TADIAS restitue vos données sous forme de tendances, de tensions et de signaux simples.
//               <br />
//               Une lecture claire de la santé de votre entreprise, accessible à tout moment sur ordinateur,
//               tablette ou mobile.
//             </Paragraph>
//           </Card>
//         </MotionDiv>

//         <Separator />

//         {/* 5) */}
//         <MotionDiv
//           initial={{ opacity: 0, y: 14 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true, amount: 0.2 }}
//           transition={baseTransition}
//         >
//           <Card style={glassCardStyle} bodyStyle={cardBodyStyle}>
//             <Title level={2} style={{ margin: 0, color: colors.text, fontSize: isMobile ? 22 : 26 }}>
//               Le pilotage n’est plus réservé aux grandes entreprises.
//             </Title>
//             <Paragraph style={{ color: colors.muted, margin: "10px 0 0", maxWidth: "70ch" }}>
//               TADIAS s’adresse aux dirigeants de TPE et PME
//               <br />
//               qui veulent comprendre leur activité sans jargon financier
//               <br />
//               et prendre de meilleures décisions sans passer des heures sur les chiffres.
//             </Paragraph>
//           </Card>
//         </MotionDiv>

//         <Separator />

//         {/* 6) VIDEO */}
//         <MotionDiv
//           initial={{ opacity: 0, y: 14 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true, amount: 0.2 }}
//           transition={baseTransition}
//         >
//           <Card style={glassCardStyle} bodyStyle={cardBodyStyle}>
//             <Title level={2} style={{ margin: 0, color: colors.text, fontSize: isMobile ? 22 : 26 }}>
//               TADIAS en 50 secondes.
//             </Title>

//             <div style={{ marginTop: 12 }}>

//                 <div
//                   style={{
//                     position: "relative",
//                     width: "100%",
//                     paddingTop: "56.25%", // 16/9
//                     borderRadius: 18,
//                     overflow: "hidden",
//                     border: `1px solid ${colors.border}`,
//                     background: "rgba(0,0,0,0.25)",
//                   }}
//                 >

//                     <video
//                       src={videotadias}
//                       controls
//                       playsInline
//                       preload="metadata"
//                       style={{
//                         position: "absolute",
//                         inset: 0,
//                         width: "100%",
//                         height: "100%",
//                         display: "block",
//                       }}
//                       onError={(e) =>
//                         console.log("video error:", e.currentTarget.error, "src=", mediaSrc)
//                       }
//                     >
//                       Votre navigateur ne supporte pas la vidéo.
//                     </video>

//                 </div>

//                 <div
//                   style={{
//                     width: "100%",
//                     borderRadius: 18,
//                     border: `1px dashed ${colors.border}`,
//                     padding: 16,
//                     background: "rgba(0,0,0,0.18)",
//                     display: "flex",
//                     alignItems: "center",
//                     gap: 12,
//                   }}
//                 >


//                 </div>

//             </div>
//           </Card>
//         </MotionDiv>

//         <Separator />

//         {/* 7) */}
//         <MotionDiv
//           initial={{ opacity: 0, y: 14 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true, amount: 0.2 }}
//           transition={baseTransition}
//         >
//           <Card style={glassCardStyle} bodyStyle={cardBodyStyle}>
//             <Title level={2} style={{ margin: 0, color: colors.text, fontSize: isMobile ? 22 : 26 }}>
//               Une plateforme, un écosystème.
//             </Title>

//             <Paragraph style={{ color: colors.muted, margin: "10px 0 0", maxWidth: "78ch" }}>

//               TADIAS automatise et structure les données issues de la comptabilité dématérialisée.
//               Lorsque le traitement comptable est assuré en back-end, des états intermédiaires ou bilans peuvent
//               être produits à la demande, dans le cadre de prestations complémentaires, en collaboration avec des
//               cabinets comptables partenaires.
//             </Paragraph>

//             <Paragraph style={{ color: colors.muted, margin: "10px 0 0", maxWidth: "78ch" }}>
//               Ces documents peuvent être intégrés directement dans l’espace TADIAS du client, afin de conserver
//               une continuité de lecture entre données comptables et pilotage. Les obligations légales, fiscales et
//               déclaratives (déclarations, clôtures, régularisations de fin d’exercice) sont également proposées en sus,
//               dans le cadre de collaborations avec des cabinets comptables.
//             </Paragraph>

//             <Paragraph style={{ color: colors.muted, margin: "10px 0 0" }}>
//               <Text strong style={{ color: colors.text }}>TADIAS ne remplace pas l’expert-comptable.</Text>
//               <br />
//               Il facilite le lien entre production comptable et lecture managériale.
//             </Paragraph>
//           </Card>
//         </MotionDiv>

//         <Separator />

//         {/* 8) */}
//         <MotionDiv
//           initial={{ opacity: 0, y: 14 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true, amount: 0.2 }}
//           transition={baseTransition}
//         >
//           <Card style={glassCardStyle} bodyStyle={cardBodyStyle}>
//             <Title level={2} style={{ margin: 0, color: colors.text, fontSize: isMobile ? 22 : 26 }}>
//               Un outil de pilotage, pas un outil comptable.
//             </Title>
//             <Paragraph style={{ color: colors.muted, margin: "10px 0 0", maxWidth: "78ch" }}>
//               Les indicateurs proposés par TADIAS sont estimatifs et évolutifs.
//               <br />
//               Ils servent à piloter, anticiper et arbitrer à partir de tendances et de signaux.
//               <br />
//               Ils ne constituent pas des données comptables certifiées
//               <br />
//               et ne remplacent pas les obligations légales et fiscales.
//             </Paragraph>
//           </Card>
//         </MotionDiv>

//         <Separator />

//         {/* 9) */}
//         <MotionDiv
//           initial={{ opacity: 0, y: 14 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true, amount: 0.2 }}
//           transition={baseTransition}
//         >
//           <Card style={glassCardStyle} bodyStyle={cardBodyStyle}>
//             <Paragraph style={{ color: "rgba(255,255,255,0.86)", margin: 0, maxWidth: "78ch" }}>
//               Conçu à partir de plus de vingt ans d’expérience terrain en gestion, finance
//               <br />
//               et accompagnement d’entreprises à taille humaine.
//             </Paragraph>
//           </Card>
//         </MotionDiv>

//         <Separator />

//         {/* 10) CONTACT */}
//         <div id="contact" />
//         <MotionDiv
//           initial={{ opacity: 0, y: 14 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true, amount: 0.2 }}
//           transition={baseTransition}
//         >
//           <Card
//             style={{ ...glassCardStyle, background: "rgba(3,35,56,0.34)" }}
//             bodyStyle={cardBodyStyle}
//           >
//             <Title level={2} style={{ margin: 0, color: colors.text, fontSize: isMobile ? 22 : 26 }}>
//               Voir clair, c’est reprendre le contrôle.
//             </Title>

//             <Paragraph style={{ color: colors.muted, margin: "10px 0 0", maxWidth: "70ch" }}>
//               TADIAS n’est pas un outil de plus.
//               <br />
//               C’est une manière plus simple de comprendre son entreprise au quotidien.
//             </Paragraph>

//             <Separator />

//             <Title level={4} style={{ margin: 0, color: colors.text }}>
//               Envie d’y voir plus clair sur votre activité ?
//             </Title>

//             <Paragraph style={{ color: colors.muted, marginTop: 8, maxWidth: "78ch" }}>
//               TADIAS s’adresse aux dirigeants qui veulent une vision simple et lisible de leurs chiffres, sans complexité inutile.
//               <br />
//               Nous échangeons d’abord pour comprendre votre contexte et voir si la plateforme est pertinente pour vous.
//             </Paragraph>

//             <Space wrap>
//               <Button
//                 shape="round"
//                 icon={<WhatsAppOutlined />}
//                 href="https://wa.me/261382308971?text=Bonjour%20Tadias%2C%20je%20souhaite%20en%20savoir%20plus."
//                 target="_blank"
//                 rel="noreferrer"
//                 style={{
//                   background: colors.primary,
//                   borderColor: colors.primary,
//                   color: "rgba(255,255,255,0.95)",
//                   boxShadow: "0 16px 40px rgba(0,171,201,0.22)",
//                 }}
//               >
//                 Nous contacter
//               </Button>

//               <Button
//                 shape="round"
//                 icon={<LoginOutlined />}
//                 href="http://localhost:3000/login"
//                 style={btnSecondaryStyle}
//               >
//                 Espace client
//               </Button>

//               <Button shape="round" onClick={() => scrollTo("top")} style={btnSecondaryStyle}>
//                 Haut de page
//               </Button>
//             </Space>

//             <div style={{ marginTop: 10 }}>
//               <Text style={{ color: "rgba(255,255,255,0.60)", fontSize: 12 }}>
//                 WhatsApp Business : +261 38 23 089 71
//               </Text>
//             </div>

//             <div style={{ marginTop: 10 }}>
//               <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, fontStyle: "italic" }}>
//                 Les indicateurs présentés sont des estimations destinées au pilotage et à l’analyse des tendances.
//                 TADIAS n’est pas un outil de décision financière ou d’investissement.
//               </Text>
//             </div>
//           </Card>

//           <div style={{ marginTop: 14 }}>
//             <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>
//               © {new Date().getFullYear()} TADIAS
//             </Text>
//           </div>
//         </MotionDiv>
//       </div>
//     </div>
//   );
// }

// /** ✅ Bloc animation (aucun texte visible) */
// function HeroVisual({ reduceMotion, colors }) {
//   const pulse = reduceMotion
//     ? {}
//     : {
//         opacity: [0.55, 1, 0.55],
//         transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
//       };

//   const floatSlow = (delay = 0) =>
//     reduceMotion
//       ? {}
//       : {
//           y: [0, -6, 0],
//           transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut", delay },
//         };

//   const shimmer = reduceMotion
//     ? {}
//     : {
//         x: ["-40%", "140%"],
//         transition: { duration: 2.6, repeat: Infinity, ease: "linear" },
//       };

//   const bars = [0, 1, 2, 3, 4, 5];

//   return (
//     <div
//       aria-label="Aperçu animé du cockpit"
//       style={{
//         position: "relative",
//         width: "100%",
//         height: 220,
//         borderRadius: 18,
//         overflow: "hidden",
//         border: "1px solid rgba(255,255,255,0.12)",
//         background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
//       }}
//     >
//       {/* grille + courbe */}
//       <svg
//         aria-hidden="true"
//         width="100%"
//         height="100%"
//         viewBox="0 0 600 300"
//         style={{ position: "absolute", inset: 0, opacity: 0.35 }}
//       >
//         <defs>
//           <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
//             <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
//           </pattern>

//           <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
//             <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
//             <stop offset="55%" stopColor={colors.primary} />
//             <stop offset="100%" stopColor="rgba(255,255,255,0.40)" />
//           </linearGradient>

//           <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
//             <stop offset="0%" stopColor="rgba(0,171,201,0.35)" />
//             <stop offset="100%" stopColor="rgba(0,171,201,0.00)" />
//           </linearGradient>
//         </defs>

//         <rect x="0" y="0" width="600" height="300" fill="url(#grid)" />

//         <path
//           d="M40,230 C120,190 170,210 240,170 C320,120 390,180 470,140 C520,115 555,120 570,105 L570,300 L40,300 Z"
//           fill="url(#glow)"
//           opacity="0.9"
//         />

//         <motion.path
//           d="M40,230 C120,190 170,210 240,170 C320,120 390,180 470,140 C520,115 555,120 570,105"
//           fill="none"
//           stroke="url(#lineGrad)"
//           strokeWidth="3.5"
//           strokeLinecap="round"
//           initial={reduceMotion ? {} : { pathLength: 0 }}
//           animate={reduceMotion ? {} : { pathLength: 1 }}
//           transition={reduceMotion ? {} : { duration: 1.2, ease: "easeOut" }}
//         />

//         {[
//           { cx: 240, cy: 170, delay: 0.0 },
//           { cx: 470, cy: 140, delay: 0.35 },
//           { cx: 570, cy: 105, delay: 0.7 },
//         ].map((p, i) => (
//           <motion.circle
//             key={i}
//             cx={p.cx}
//             cy={p.cy}
//             r="6"
//             fill={colors.primary}
//             initial={{ opacity: 0.7 }}
//             animate={
//               reduceMotion
//                 ? {}
//                 : {
//                     opacity: [0.6, 1, 0.6],
//                     r: [5, 7, 5],
//                     transition: {
//                       duration: 2.1,
//                       repeat: Infinity,
//                       ease: "easeInOut",
//                       delay: p.delay,
//                     },
//                   }
//             }
//           />
//         ))}
//       </svg>

//       {/* barres animées */}
//       <div
//         aria-hidden="true"
//         style={{
//           position: "absolute",
//           left: 14,
//           bottom: 14,
//           display: "flex",
//           gap: 8,
//           alignItems: "flex-end",
//           opacity: 0.95,
//         }}
//       >
//         {bars.map((i) => (
//           <motion.div
//             key={i}
//             style={{
//               width: 12,
//               borderRadius: 8,
//               background: "rgba(255,255,255,0.16)",
//               border: "1px solid rgba(255,255,255,0.14)",
//               boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
//             }}
//             initial={{ height: 18 + i * 6 }}
//             animate={
//               reduceMotion
//                 ? {}
//                 : {
//                     height: [18 + i * 6, 34 + i * 5, 22 + i * 6, 40 + i * 4, 20 + i * 6],
//                     transition: {
//                       duration: 2.8,
//                       repeat: Infinity,
//                       ease: "easeInOut",
//                       delay: i * 0.08,
//                     },
//                   }
//             }
//           />
//         ))}
//       </div>

//       {/* widgets flottants */}
//       <motion.div
//         aria-hidden="true"
//         style={{
//           position: "absolute",
//           right: 14,
//           top: 14,
//           width: 120,
//           height: 44,
//           borderRadius: 999,
//           background: "rgba(255,255,255,0.10)",
//           border: "1px solid rgba(255,255,255,0.14)",
//           overflow: "hidden",
//           boxShadow: "0 18px 50px rgba(0,0,0,0.22)",
//         }}
//         {...floatSlow(0.1)}
//       >
//         <motion.div
//           style={{
//             position: "absolute",
//             top: -10,
//             left: 0,
//             width: 80,
//             height: 80,
//             transform: "rotate(20deg)",
//             background:
//               "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.20), rgba(255,255,255,0))",
//             opacity: 0.55,
//           }}
//           {...shimmer}
//         />
//         <motion.div
//           style={{
//             position: "absolute",
//             left: 14,
//             top: 16,
//             width: 12,
//             height: 12,
//             borderRadius: 999,
//             background: colors.primary,
//             boxShadow: "0 0 18px rgba(0,171,201,0.45)",
//           }}
//           {...pulse}
//         />
//         <div
//           style={{
//             position: "absolute",
//             left: 34,
//             right: 14,
//             top: 14,
//             height: 6,
//             borderRadius: 99,
//             background: "rgba(255,255,255,0.14)",
//           }}
//         />
//         <div
//           style={{
//             position: "absolute",
//             left: 34,
//             right: 28,
//             top: 26,
//             height: 6,
//             borderRadius: 99,
//             background: "rgba(255,255,255,0.10)",
//           }}
//         />
//       </motion.div>

//       <motion.div
//         aria-hidden="true"
//         style={{
//           position: "absolute",
//           right: 18,
//           bottom: 18,
//           width: 160,
//           height: 62,
//           borderRadius: 18,
//           background: "rgba(0,171,201,0.08)",
//           border: "1px solid rgba(0,171,201,0.22)",
//           boxShadow: "0 18px 50px rgba(0,0,0,0.22)",
//           overflow: "hidden",
//         }}
//         {...floatSlow(0.35)}
//       >
//         <motion.div
//           style={{
//             position: "absolute",
//             inset: 0,
//             background: "radial-gradient(circle at 20% 30%, rgba(0,171,201,0.25), rgba(0,0,0,0))",
//             opacity: 0.8,
//           }}
//           {...pulse}
//         />
//         <motion.div
//           style={{
//             position: "absolute",
//             top: -14,
//             left: 0,
//             width: 90,
//             height: 90,
//             transform: "rotate(20deg)",
//             background:
//               "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.18), rgba(255,255,255,0))",
//             opacity: 0.5,
//           }}
//           {...shimmer}
//         />
//         <div
//           style={{
//             position: "absolute",
//             left: 14,
//             right: 14,
//             bottom: 12,
//             display: "flex",
//             gap: 6,
//             alignItems: "flex-end",
//           }}
//         >
//           {[0, 1, 2, 3, 4].map((i) => (
//             <motion.div
//               key={i}
//               style={{
//                 width: 10,
//                 borderRadius: 8,
//                 background: "rgba(255,255,255,0.18)",
//                 border: "1px solid rgba(255,255,255,0.12)",
//               }}
//               initial={{ height: 10 + i * 4 }}
//               animate={
//                 reduceMotion
//                   ? {}
//                   : {
//                       height: [10 + i * 4, 22 + i * 3, 12 + i * 4, 26 + i * 2, 12 + i * 4],
//                       transition: {
//                         duration: 2.4,
//                         repeat: Infinity,
//                         ease: "easeInOut",
//                         delay: i * 0.06,
//                       },
//                     }
//               }
//             />
//           ))}
//         </div>
//       </motion.div>
//     </div>
//   );
// }


// model2


// import React from "react";
// import {
//   Typography,
//   Space,
//   Button,
//   Row,
//   Col,
//   Card,
//   Image,
//   List,
//   Grid,
//   Tag,
//   Layout,
//   Divider,
//   Steps,
//   Collapse,
//   Statistic,
//   ConfigProvider,
// } from "antd";
// import {
//   ArrowRightOutlined,
//   CheckCircleFilled,
//   LoginOutlined,
//   WhatsAppOutlined,
//   ThunderboltOutlined,
//   LineChartOutlined,
//   SafetyCertificateOutlined,
//   CloudUploadOutlined,
//   FileDoneOutlined,
//   RadarChartOutlined,
// } from "@ant-design/icons";
// import { motion, useReducedMotion } from "framer-motion";

// import logo1 from "../assets/logo/logotadias.jpeg";
// import videotadias from "../assets/video/tadias.mp4";

// const { Title, Paragraph, Text } = Typography;
// const { useBreakpoint } = Grid;
// const { Header, Content, Footer } = Layout;

// const MotionDiv = motion.div;

// export default function AccueilPro() {
//   const screens = useBreakpoint();
//   const isMobile = !screens.md;
//   const reduceMotion = useReducedMotion();

//   const brand = {
//     primary: "#00ABC9",
//     ink: "rgba(6, 22, 33, 0.92)",
//     muted: "rgba(6, 22, 33, 0.62)",
//     border: "rgba(6, 22, 33, 0.10)",
//     border2: "rgba(6, 22, 33, 0.06)",
//     surface: "rgba(255,255,255,0.92)",
//     surface2: "rgba(255,255,255,0.82)",
//     soft: "rgba(0,171,201,0.10)",
//     bg: "linear-gradient(180deg, #ffffff 0%, #f6fbfd 55%, #ffffff 100%)",
//   };

//   const container = {
//     maxWidth: 1080,
//     margin: "0 auto",
//     padding: "0 18px",
//   };

//   const baseTransition = reduceMotion
//     ? { duration: 0 }
//     : { duration: 0.65, ease: [0.22, 1, 0.36, 1] };

//   const fadeUp = {
//     hidden: { opacity: 0, y: 14 },
//     show: { opacity: 1, y: 0, transition: baseTransition },
//   };

//   const hoverLift = reduceMotion ? {} : { y: -4, transition: { duration: 0.16 } };

//   const scrollTo = (id) => {
//     const el = document.getElementById(id);
//     if (!el) return;
//     const y = el.getBoundingClientRect().top + window.scrollY - 86;
//     window.scrollTo({ top: y, behavior: "smooth" });
//   };

//   const Section = ({ id, title, kicker, children }) => (
//     <section id={id} style={{ padding: isMobile ? "26px 0" : "42px 0" }}>
//       <div style={container}>
//         {(kicker || title) && (
//           <>
//             {kicker && (
//               <Tag
//                 style={{
//                   borderRadius: 999,
//                   padding: "6px 10px",
//                   background: brand.soft,
//                   border: "1px solid rgba(0,171,201,0.25)",
//                   color: brand.primary,
//                   marginBottom: 10,
//                 }}
//               >
//                 {kicker}
//               </Tag>
//             )}
//             {title && (
//               <Title
//                 level={2}
//                 style={{
//                   margin: 0,
//                   color: brand.ink,
//                   fontSize: isMobile ? 22 : 28,
//                   letterSpacing: -0.3,
//                 }}
//               >
//                 {title}
//               </Title>
//             )}
//           </>
//         )}
//         <div style={{ marginTop: title || kicker ? 14 : 0 }}>{children}</div>
//       </div>
//     </section>
//   );

//   const ProCard = ({ children, style, bodyStyle }) => (
//     <Card
//       style={{
//         borderRadius: 18,
//         background: `linear-gradient(180deg, ${brand.surface}, ${brand.surface2})`,
//         border: `1px solid ${brand.border}`,
//         boxShadow: "0 12px 34px rgba(6,22,33,0.08)",
//         ...style,
//       }}
//       bodyStyle={{ padding: isMobile ? 16 : 20, ...bodyStyle }}
//     >
//       {children}
//     </Card>
//   );

//   const btnPrimary = {
//     background: brand.primary,
//     borderColor: brand.primary,
//     color: "rgba(255,255,255,0.95)",
//     boxShadow: "0 16px 40px rgba(0,171,201,0.22)",
//   };

//   const btnSecondary = {
//     background: "rgba(6,22,33,0.04)",
//     borderColor: "rgba(6,22,33,0.12)",
//     color: brand.ink,
//   };

//   // ✅ Source vidéo robuste
//   const mediaSrc = typeof videotadias === "string" ? videotadias : videotadias?.src || "";
//   const isDirectVideo = !!mediaSrc && /\.(mp4|webm|ogg)(\?.*)?$/i.test(mediaSrc);

//   const faqItems = [
//     {
//       key: "1",
//       label: "TADIAS remplace-t-il mon expert-comptable ?",
//       children: (
//         <Text style={{ color: brand.muted }}>
//           Non. TADIAS facilite la dématérialisation et la lecture des tendances. Les productions comptables certifiées
//           (bilan, liasse, obligations fiscales) restent du ressort de l’expert-comptable.
//         </Text>
//       ),
//     },
//     {
//       key: "2",
//       label: "Est-ce adapté à une TPE ?",
//       children: (
//         <Text style={{ color: brand.muted }}>
//           Oui : l’objectif est une visibilité simple et actionnable, sans jargon, sur mobile ou ordinateur.
//         </Text>
//       ),
//     },
//     {
//       key: "3",
//       label: "Les indicateurs sont-ils “officiels” ?",
//       children: (
//         <Text style={{ color: brand.muted }}>
//           Ce sont des estimations de pilotage. Ils servent à anticiper et arbitrer, mais ne remplacent pas les
//           documents comptables certifiés.
//         </Text>
//       ),
//     },
//     {
//       key: "4",
//       label: "Comment démarre l’accompagnement ?",
//       children: (
//         <Text style={{ color: brand.muted }}>
//           On échange d’abord sur votre contexte, puis on met en place un flux simple : dépôt/scan, centralisation,
//           structuration et restitution.
//         </Text>
//       ),
//     },
//   ];

//   return (
//     <ConfigProvider
//       theme={{
//         token: {
//           colorPrimary: brand.primary,
//           borderRadius: 10,
//           fontFamily:
//             'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
//         },
//       }}
//     >
//       <Layout
//         style={{
//           minHeight: "100vh",
//           background: brand.bg,
//           color: brand.ink,
//           position: "relative",
//           overflow: "hidden",
//         }}
//       >
//         {/* blobs subtils */}
//         <MotionDiv aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
//           <MotionDiv
//             style={{
//               position: "absolute",
//               width: 540,
//               height: 540,
//               borderRadius: 999,
//               left: -240,
//               top: -240,
//               background: brand.soft,
//               filter: "blur(18px)",
//             }}
//             animate={reduceMotion ? {} : { x: [0, 22, 0], y: [0, 14, 0] }}
//             transition={reduceMotion ? {} : { duration: 9, repeat: Infinity, ease: "easeInOut" }}
//           />
//           <MotionDiv
//             style={{
//               position: "absolute",
//               width: 460,
//               height: 460,
//               borderRadius: 999,
//               right: -200,
//               bottom: -220,
//               background: "rgba(6,22,33,0.04)",
//               filter: "blur(18px)",
//             }}
//             animate={reduceMotion ? {} : { x: [0, -16, 0], y: [0, -10, 0] }}
//             transition={reduceMotion ? {} : { duration: 10, repeat: Infinity, ease: "easeInOut" }}
//           />
//         </MotionDiv>

//         {/* HEADER PRO */}
//         <Header
//           style={{
//             position: "sticky",
//             top: 0,
//             zIndex: 50,
//             height: 74,
//             display: "flex",
//             alignItems: "center",
//             background: "rgba(255,255,255,0.75)",
//             backdropFilter: "blur(14px)",
//             WebkitBackdropFilter: "blur(14px)",
//             borderBottom: `1px solid ${brand.border2}`,
//             padding: 0,
//           }}
//         >
//           <div
//             style={{
//               ...container,
//               width: "100%",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "space-between",
//               gap: 12,
//             }}
//           >
//             <Space size={12} align="center">
//               <div
//                 style={{
//                   width: 46,
//                   height: 46,
//                   borderRadius: 12,
//                   overflow: "hidden",
//                   border: `1px solid ${brand.border}`,
//                   background: "rgba(255,255,255,0.85)",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                 }}
//               >
//                 <Image
//                   preview={false}
//                   src={logo1}
//                   alt="Logo TADIAS"
//                   style={{ width: "100%", height: "100%", objectFit: "cover" }}
//                 />
//               </div>

//               <div style={{ lineHeight: 1.15 }}>
//                 <Text strong style={{ color: brand.ink, fontSize: 14 }}>
//                   TADIAS
//                 </Text>
//                 <br />
//                 <Text style={{ color: brand.muted, fontSize: 12 }}>
//                   Dématérialisation • Visibilité • Pilotage
//                 </Text>
//               </div>
//             </Space>

//             <Space size={10}>
//               {!isMobile && (
//                 <>
//                   <Button type="text" onClick={() => scrollTo("solution")} style={{ color: brand.ink }}>
//                     Solution
//                   </Button>
//                   <Button type="text" onClick={() => scrollTo("comment")} style={{ color: brand.ink }}>
//                     Comment ça marche
//                   </Button>
//                   <Button type="text" onClick={() => scrollTo("video")} style={{ color: brand.ink }}>
//                     Démo
//                   </Button>
//                   <Button type="text" onClick={() => scrollTo("faq")} style={{ color: brand.ink }}>
//                     FAQ
//                   </Button>
//                 </>
//               )}

//               <Button shape="round" icon={<LoginOutlined />} href="http://localhost:3000/login" style={btnSecondary}>
//                 Espace client
//               </Button>

//               <Button shape="round" icon={<ArrowRightOutlined />} onClick={() => scrollTo("contact")} style={btnPrimary}>
//                 Parler à TADIAS
//               </Button>
//             </Space>
//           </div>
//         </Header>

//         <Content>
//           {/* HERO PRO */}
//           <section style={{ padding: isMobile ? "28px 0 18px" : "54px 0 26px" }}>
//             <div style={container}>
//               <MotionDiv variants={fadeUp} initial="hidden" animate="show">
//                 <Row gutter={[18, 18]} align="middle">
//                   <Col xs={24} md={14}>
//                     <Tag
//                       style={{
//                         borderRadius: 999,
//                         padding: "6px 10px",
//                         background: brand.soft,
//                         border: "1px solid rgba(0,171,201,0.25)",
//                         color: brand.primary,
//                         marginBottom: 12,
//                       }}
//                     >
//                       Pour dirigeants de TPE / PME
//                     </Tag>

//                     <Title
//                       style={{
//                         margin: 0,
//                         color: brand.ink,
//                         fontSize: isMobile ? 34 : 50,
//                         lineHeight: 1.06,
//                         letterSpacing: -0.9,
//                         maxWidth: "24ch",
//                       }}
//                     >
//                       Une visibilité claire sur votre activité.
//                       <span style={{ color: brand.primary }}> Sans complexité.</span>
//                     </Title>

//                     <Paragraph
//                       style={{
//                         margin: "12px 0 0",
//                         color: brand.muted,
//                         fontSize: isMobile ? 16 : 18,
//                         lineHeight: 1.6,
//                         maxWidth: "64ch",
//                       }}
//                     >
//                       TADIAS dématérialise la comptabilité et restitue vos données sous forme de signaux simples :
//                       tendances, tensions, alertes — pour décider plus vite, avec plus de confiance.
//                     </Paragraph>

//                     <Space wrap style={{ marginTop: 14 }}>
//                       <Button size="large" shape="round" onClick={() => scrollTo("solution")} style={btnPrimary}>
//                         Découvrir la solution <ArrowRightOutlined />
//                       </Button>
//                       <Button
//                         size="large"
//                         shape="round"
//                         icon={<WhatsAppOutlined />}
//                         href="https://wa.me/261382308971?text=Bonjour%20Tadias%2C%20je%20souhaite%20en%20savoir%20plus."
//                         target="_blank"
//                         rel="noreferrer"
//                         style={btnSecondary}
//                       >
//                         WhatsApp
//                       </Button>
//                     </Space>

//                     <div style={{ marginTop: 16 }}>
//                       <Space wrap size={8}>
//                         {["Lecture simple", "Mobile & desktop", "Tendances & signaux"].map((t) => (
//                           <Tag
//                             key={t}
//                             style={{
//                               borderRadius: 999,
//                               background: "rgba(6,22,33,0.03)",
//                               border: `1px solid ${brand.border2}`,
//                               color: brand.ink,
//                               padding: "6px 10px",
//                             }}
//                           >
//                             <CheckCircleFilled style={{ color: brand.primary, marginRight: 6 }} />
//                             {t}
//                           </Tag>
//                         ))}
//                       </Space>
//                     </div>
//                   </Col>

//                   <Col xs={24} md={10}>
//                     <MotionDiv whileHover={hoverLift}>
//                       <ProCard>
//                         <HeroVisualPro reduceMotion={reduceMotion} brand={brand} />
//                       </ProCard>
//                     </MotionDiv>

//                     <div style={{ marginTop: 12 }}>
//                       <Row gutter={[12, 12]}>
//                         <Col xs={12}>
//                           <ProCard bodyStyle={{ padding: 14 }}>
//                             <Statistic
//                               title={<Text style={{ color: brand.muted }}>Centralisation</Text>}
//                               value="Automatique"
//                               valueStyle={{ color: brand.ink, fontSize: 18, fontWeight: 650 }}
//                             />
//                           </ProCard>
//                         </Col>
//                         <Col xs={12}>
//                           <ProCard bodyStyle={{ padding: 14 }}>
//                             <Statistic
//                               title={<Text style={{ color: brand.muted }}>Lecture</Text>}
//                               value="Instantanée"
//                               valueStyle={{ color: brand.ink, fontSize: 18, fontWeight: 650 }}
//                             />
//                           </ProCard>
//                         </Col>
//                       </Row>
//                     </div>
//                   </Col>
//                 </Row>
//               </MotionDiv>
//             </div>
//           </section>

//           <div style={container}>
//             <Divider style={{ borderColor: brand.border2, margin: isMobile ? "18px 0" : "22px 0" }} />
//           </div>

//           {/* SOLUTION */}
//           <Section
//             id="solution"
//             kicker="Solution"
//             title="Une plateforme de pilotage pensée pour les petites structures."
//           >
//             <Row gutter={[14, 14]}>
//               {[
//                 {
//                   icon: <CloudUploadOutlined />,
//                   title: "Dématérialisation fluide",
//                   text: "Scan/dépôt, centralisation et structuration. Moins de friction, plus de continuité.",
//                 },
//                 {
//                   icon: <LineChartOutlined />,
//                   title: "Visibilité actionnable",
//                   text: "Tendances, tensions, signaux. Une lecture simple pour décider au bon moment.",
//                 },
//                 {
//                   icon: <SafetyCertificateOutlined />,
//                   title: "Cadre clair",
//                   text: "Outil de pilotage (estimatif). Les documents certifiés restent du côté de l’expert-comptable.",
//                 },
//               ].map((f) => (
//                 <Col xs={24} md={8} key={f.title}>
//                   <MotionDiv whileHover={hoverLift}>
//                     <ProCard>
//                       <Space align="start" size={12}>
//                         <div
//                           style={{
//                             width: 40,
//                             height: 40,
//                             borderRadius: 12,
//                             background: brand.soft,
//                             border: "1px solid rgba(0,171,201,0.25)",
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                             color: brand.primary,
//                             fontSize: 18,
//                             flex: "0 0 auto",
//                           }}
//                         >
//                           {f.icon}
//                         </div>
//                         <div>
//                           <Text strong style={{ color: brand.ink, fontSize: 16 }}>
//                             {f.title}
//                           </Text>
//                           <Paragraph style={{ color: brand.muted, margin: "6px 0 0" }}>{f.text}</Paragraph>
//                         </div>
//                       </Space>
//                     </ProCard>
//                   </MotionDiv>
//                 </Col>
//               ))}
//             </Row>

//             <div style={{ marginTop: 14 }}>
//               <ProCard
//                 style={{
//                   border: "1px solid rgba(0,171,201,0.18)",
//                   background: "linear-gradient(180deg, rgba(0,171,201,0.08), rgba(255,255,255,0.92))",
//                 }}
//               >
//                 <Space align="start" size={12}>
//                   <ThunderboltOutlined style={{ color: brand.primary, fontSize: 18, marginTop: 4 }} />
//                   <div>
//                     <Text strong style={{ color: brand.ink }}>
//                       Décider sans visibilité est devenu un risque.
//                     </Text>
//                     <Paragraph style={{ color: brand.muted, margin: "6px 0 0" }}>
//                       La compta arrive parfois trop tard. TADIAS vous donne une lecture plus fréquente et plus simple
//                       pour réduire l’improvisation.
//                     </Paragraph>
//                   </div>
//                 </Space>
//               </ProCard>
//             </div>
//           </Section>

//           {/* COMMENT ÇA MARCHE */}
//           <Section id="comment" kicker="Méthode" title="Comment ça marche (simple, étape par étape)">
//             <ProCard>
//               <Steps
//                 direction={isMobile ? "vertical" : "horizontal"}
//                 items={[
//                   {
//                     title: "Vous déposez",
//                     description: "Scan / import de vos pièces.",
//                     icon: <CloudUploadOutlined />,
//                   },
//                   {
//                     title: "On structure",
//                     description: "Centralisation & organisation des données.",
//                     icon: <FileDoneOutlined />,
//                   },
//                   {
//                     title: "On restitue",
//                     description: "Tendances & signaux lisibles.",
//                     icon: <RadarChartOutlined />,
//                   },
//                   {
//                     title: "Vous pilotez",
//                     description: "Arbitrages plus rapides, plus sereins.",
//                     icon: <ThunderboltOutlined />,
//                   },
//                 ]}
//               />

//               <Divider style={{ borderColor: brand.border2, margin: "14px 0" }} />

//               <Row gutter={[12, 12]}>
//                 {[
//                   "Moins de fichiers et de ressaisies",
//                   "Une lecture plus régulière",
//                   "Des repères simples, accessibles",
//                   "Un cadre clair avec vos partenaires",
//                 ].map((item) => (
//                   <Col xs={24} md={12} key={item}>
//                     <Space align="start">
//                       <CheckCircleFilled style={{ color: brand.primary, marginTop: 4 }} />
//                       <Text style={{ color: brand.ink }}>{item}</Text>
//                     </Space>
//                   </Col>
//                 ))}
//               </Row>
//             </ProCard>
//           </Section>

//           {/* VIDEO */}
//           <Section id="video" kicker="Démo" title="TADIAS en 50 secondes">
//             <Row gutter={[14, 14]} align="top">
//               <Col xs={24} md={15}>
//                 <ProCard>
//                   <div
//                     style={{
//                       position: "relative",
//                       width: "100%",
//                       paddingTop: "56.25%",
//                       borderRadius: 14,
//                       overflow: "hidden",
//                       border: `1px solid ${brand.border}`,
//                       background: "rgba(6,22,33,0.03)",
//                     }}
//                   >
//                     {isDirectVideo ? (
//                       <video
//                         src={mediaSrc}
//                         controls
//                         playsInline
//                         preload="metadata"
//                         style={{
//                           position: "absolute",
//                           inset: 0,
//                           width: "100%",
//                           height: "100%",
//                           display: "block",
//                         }}
//                       >
//                         Votre navigateur ne supporte pas la vidéo.
//                       </video>
//                     ) : (
//                       <iframe
//                         title="Vidéo TADIAS"
//                         src={mediaSrc}
//                         style={{
//                           position: "absolute",
//                           inset: 0,
//                           width: "100%",
//                           height: "100%",
//                           border: 0,
//                         }}
//                         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                         allowFullScreen
//                       />
//                     )}
//                   </div>
//                 </ProCard>
//               </Col>

//               <Col xs={24} md={9}>
//                 <MotionDiv whileHover={hoverLift}>
//                   <ProCard>
//                     <Text strong style={{ color: brand.ink, fontSize: 16 }}>
//                       Ce que vous obtenez
//                     </Text>

//                     <List
//                       style={{ marginTop: 10 }}
//                       dataSource={[
//                         "Une vision plus claire au quotidien",
//                         "Des signaux simples (tendances / tensions)",
//                         "Une continuité entre données & pilotage",
//                         "Accessible sur mobile et ordinateur",
//                       ]}
//                       renderItem={(item) => (
//                         <List.Item style={{ border: "none", padding: "8px 0" }}>
//                           <Space align="start">
//                             <CheckCircleFilled style={{ color: brand.primary, marginTop: 4 }} />
//                             <Text style={{ color: brand.ink }}>{item}</Text>
//                           </Space>
//                         </List.Item>
//                       )}
//                     />
//                   </ProCard>
//                 </MotionDiv>

//                 <div style={{ marginTop: 12 }}>
//                   <Row gutter={[12, 12]}>
//                     <Col xs={12} md={12}>
//                       <ProCard bodyStyle={{ padding: 14 }}>
//                         <Statistic
//                           title={<Text style={{ color: brand.muted }}>Temps</Text>}
//                           value="Gagné"
//                           valueStyle={{ color: brand.ink, fontSize: 18, fontWeight: 650 }}
//                         />
//                       </ProCard>
//                     </Col>
//                     <Col xs={12} md={12}>
//                       <ProCard bodyStyle={{ padding: 14 }}>
//                         <Statistic
//                           title={<Text style={{ color: brand.muted }}>Lecture</Text>}
//                           value="Simple"
//                           valueStyle={{ color: brand.ink, fontSize: 18, fontWeight: 650 }}
//                         />
//                       </ProCard>
//                     </Col>
//                   </Row>
//                 </div>
//               </Col>
//             </Row>
//           </Section>

//           {/* FAQ */}
//           <Section id="faq" kicker="FAQ" title="Questions fréquentes">
//             <ProCard>
//               <Collapse
//                 items={faqItems}
//                 bordered={false}
//                 style={{ background: "transparent" }}
//               />
//             </ProCard>
//             <div style={{ marginTop: 12 }}>
//               <Text style={{ color: "rgba(6,22,33,0.50)", fontSize: 12, fontStyle: "italic" }}>
//                 Les indicateurs présentés sont des estimations destinées au pilotage et à l’analyse des tendances.
//                 TADIAS n’est pas un outil de décision financière ou d’investissement.
//               </Text>
//             </div>
//           </Section>

//           {/* CONTACT / CTA PRO */}
//           <Section id="contact" kicker="Contact" title="On échange 15 minutes ?">
//             <ProCard
//               style={{
//                 border: "1px solid rgba(0,171,201,0.18)",
//                 background: "linear-gradient(180deg, rgba(0,171,201,0.10), rgba(255,255,255,0.92))",
//               }}
//             >
//               <Row gutter={[14, 14]} align="middle">
//                 <Col xs={24} md={16}>
//                   <Text strong style={{ color: brand.ink, fontSize: 18 }}>
//                     Voir clair, c’est reprendre le contrôle.
//                   </Text>
//                   <Paragraph style={{ color: brand.muted, margin: "8px 0 0" }}>
//                     On commence par comprendre votre contexte et vos priorités, puis on vérifie ensemble si TADIAS
//                     est pertinent pour vous.
//                   </Paragraph>
//                 </Col>
//                 <Col xs={24} md={8} style={{ display: "flex", justifyContent: isMobile ? "flex-start" : "flex-end" }}>
//                   <Space wrap>
//                     <Button
//                       shape="round"
//                       icon={<WhatsAppOutlined />}
//                       href="https://wa.me/261382308971?text=Bonjour%20Tadias%2C%20je%20souhaite%20en%20savoir%20plus."
//                       target="_blank"
//                       rel="noreferrer"
//                       style={btnPrimary}
//                     >
//                       Nous contacter
//                     </Button>
//                     <Button
//                       shape="round"
//                       icon={<LoginOutlined />}
//                       href="http://localhost:3000/login"
//                       style={btnSecondary}
//                     >
//                       Espace client
//                     </Button>
//                   </Space>
//                 </Col>
//               </Row>

//               <Divider style={{ borderColor: "rgba(0,171,201,0.18)", margin: "14px 0" }} />

//               <Text style={{ color: brand.muted, fontSize: 12 }}>
//                 WhatsApp Business : +261 38 23 089 71
//               </Text>
//             </ProCard>
//           </Section>
//         </Content>

//         <Footer style={{ background: "transparent", padding: "20px 0 26px" }}>
//           <div style={container}>
//             <Divider style={{ borderColor: brand.border2, margin: "0 0 14px" }} />
//             <Space style={{ width: "100%", justifyContent: "space-between" }}>
//               <Text style={{ color: "rgba(6,22,33,0.55)", fontSize: 12 }}>
//                 © {new Date().getFullYear()} TADIAS
//               </Text>
//               <Button type="text" onClick={() => scrollTo("top")} style={{ color: brand.ink }}>
//                 Haut de page
//               </Button>
//             </Space>
//           </div>
//         </Footer>
//       </Layout>
//     </ConfigProvider>
//   );
// }

// /** Visual pro : plus sobre + plus “dashboard” */
// function HeroVisualPro({ reduceMotion, brand }) {
//   const pulse = reduceMotion
//     ? {}
//     : {
//         opacity: [0.55, 1, 0.55],
//         transition: { duration: 2.6, repeat: Infinity, ease: "easeInOut" },
//       };

//   const floatSlow = (delay = 0) =>
//     reduceMotion
//       ? {}
//       : {
//           y: [0, -6, 0],
//           transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut", delay },
//         };

//   return (
//     <div
//       aria-label="Aperçu cockpit"
//       style={{
//         position: "relative",
//         width: "100%",
//         height: 240,
//         borderRadius: 16,
//         overflow: "hidden",
//         border: `1px solid ${brand.border}`,
//         background: "linear-gradient(180deg, rgba(6,22,33,0.03), rgba(6,22,33,0.01))",
//       }}
//     >
//       {/* Chart */}
//       <svg width="100%" height="100%" viewBox="0 0 600 300" style={{ position: "absolute", inset: 0 }}>
//         <defs>
//           <pattern id="gridPro" width="40" height="40" patternUnits="userSpaceOnUse">
//             <path
//               d="M 40 0 L 0 0 0 40"
//               fill="none"
//               stroke="rgba(6,22,33,0.10)"
//               strokeWidth="1"
//             />
//           </pattern>

//           <linearGradient id="lineGradPro" x1="0" y1="0" x2="1" y2="0">
//             <stop offset="0%" stopColor="rgba(6,22,33,0.28)" />
//             <stop offset="55%" stopColor={brand.primary} />
//             <stop offset="100%" stopColor="rgba(6,22,33,0.18)" />
//           </linearGradient>

//           <linearGradient id="areaPro" x1="0" y1="0" x2="0" y2="1">
//             <stop offset="0%" stopColor="rgba(0,171,201,0.18)" />
//             <stop offset="100%" stopColor="rgba(0,171,201,0.00)" />
//           </linearGradient>
//         </defs>

//         <rect x="0" y="0" width="600" height="300" fill="url(#gridPro)" />

//         <path
//           d="M40,220 C140,160 220,210 300,150 C380,95 440,175 520,125 C555,105 575,110 590,95 L590,300 L40,300 Z"
//           fill="url(#areaPro)"
//         />

//         <motion.path
//           d="M40,220 C140,160 220,210 300,150 C380,95 440,175 520,125 C555,105 575,110 590,95"
//           fill="none"
//           stroke="url(#lineGradPro)"
//           strokeWidth="3.5"
//           strokeLinecap="round"
//           initial={reduceMotion ? {} : { pathLength: 0 }}
//           animate={reduceMotion ? {} : { pathLength: 1 }}
//           transition={reduceMotion ? {} : { duration: 1.2, ease: "easeOut" }}
//         />

//         {[
//           { cx: 300, cy: 150, delay: 0.0 },
//           { cx: 520, cy: 125, delay: 0.35 },
//           { cx: 590, cy: 95, delay: 0.7 },
//         ].map((p, i) => (
//           <motion.circle
//             key={i}
//             cx={p.cx}
//             cy={p.cy}
//             r="6"
//             fill={brand.primary}
//             animate={
//               reduceMotion
//                 ? {}
//                 : {
//                     opacity: [0.6, 1, 0.6],
//                     r: [5, 7, 5],
//                     transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: p.delay },
//                   }
//             }
//           />
//         ))}
//       </svg>

//       {/* KPI chips */}
//       <motion.div
//         aria-hidden="true"
//         style={{
//           position: "absolute",
//           left: 12,
//           top: 12,
//           display: "flex",
//           gap: 8,
//           flexWrap: "wrap",
//         }}
//         {...floatSlow(0.1)}
//       >
//         {[
//           { label: "Tendance", value: "↗", bg: brand.soft, b: "rgba(0,171,201,0.25)", c: brand.primary },
//           { label: "Tension", value: "•", bg: "rgba(6,22,33,0.04)", b: "rgba(6,22,33,0.10)", c: "rgba(6,22,33,0.70)" },
//         ].map((k) => (
//           <div
//             key={k.label}
//             style={{
//               borderRadius: 999,
//               padding: "8px 10px",
//               background: k.bg,
//               border: `1px solid ${k.b}`,
//               display: "flex",
//               gap: 8,
//               alignItems: "center",
//               boxShadow: "0 10px 26px rgba(6,22,33,0.08)",
//             }}
//           >
//             <span style={{ color: k.c, fontWeight: 700 }}>{k.value}</span>
//             <span style={{ color: "rgba(6,22,33,0.70)", fontSize: 12 }}>{k.label}</span>
//           </div>
//         ))}
//       </motion.div>

//       {/* Corner widget */}
//       <motion.div
//         aria-hidden="true"
//         style={{
//           position: "absolute",
//           right: 12,
//           bottom: 12,
//           width: 168,
//           height: 72,
//           borderRadius: 16,
//           background: "rgba(255,255,255,0.78)",
//           border: "1px solid rgba(6,22,33,0.10)",
//           boxShadow: "0 18px 50px rgba(6,22,33,0.10)",
//           overflow: "hidden",
//         }}
//         {...floatSlow(0.35)}
//       >
//         <motion.div
//           style={{
//             position: "absolute",
//             inset: 0,
//             background: "radial-gradient(circle at 20% 30%, rgba(0,171,201,0.18), rgba(0,0,0,0))",
//           }}
//           {...pulse}
//         />
//         <div style={{ position: "absolute", left: 12, top: 10 }}>
//           <div style={{ color: "rgba(6,22,33,0.70)", fontSize: 12 }}>Signal</div>
//           <div style={{ color: brand.ink, fontWeight: 750, fontSize: 16 }}>Stable</div>
//         </div>

//         <div
//           style={{
//             position: "absolute",
//             left: 12,
//             right: 12,
//             bottom: 10,
//             display: "flex",
//             gap: 6,
//             alignItems: "flex-end",
//           }}
//         >
//           {[10, 18, 14, 22, 16, 26].map((h, i) => (
//             <div
//               key={i}
//               style={{
//                 width: 10,
//                 height: h,
//                 borderRadius: 8,
//                 background: i === 5 ? brand.primary : "rgba(6,22,33,0.10)",
//                 border: "1px solid rgba(6,22,33,0.10)",
//               }}
//             />
//           ))}
//         </div>
//       </motion.div>
//     </div>
//   );
// }





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
                href=  {`/login`}
              // style={btnSecondaryStyle}
              >
                Espace client
              </Button>

              <Button
                shape="round"
                size={isMobile ? "middle" : "large"}
                icon={<ArrowRightOutlined />}
                onClick={() => scrollTo("demat")}
                style={btnPrimary}
              >
                Découvrir Tadias
              </Button>
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
          <Section id="demat" title="Une comptabilité dématérialisée, sans prise de tête.">
            <ProCard style={{ border: "1px solid rgba(0,171,201,0.18)", background: "linear-gradient(180deg, rgba(0,171,201,0.10), rgba(255,255,255,0.92))", }}>
              <List
                dataSource={[
                  "Le client a uniquement à scanner ou prendre en photo ses pièces comptablesde manière lisible et à les déposer sur la plateforme Tadias.",
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
          <Section id="video" title="Tadias en quelques minutes.">
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
                    (Tadias en quelques minutes.)
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
}
