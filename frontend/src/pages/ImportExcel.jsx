import React from "react";
import { Upload, Typography, Card, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";

const { Dragger } = Upload;
const { Title, Text } = Typography;

// ✅ API_BASE (CRA)
const cleanBase = (s) => (s || "").replace(/\/+$/, "");
const API_BASE =
  cleanBase(process.env.REACT_APP_API_BASE) || "http://localhost:8000";

export default function ImportExcel() {
  const propsUpload = {
    name: "file",
    multiple: false,
    accept: ".xlsx,.xls",
    action: `${API_BASE}/import/grand-livre`, // ✅ ici
    showUploadList: false,
    onChange(info) {
      const { status } = info.file;

      if (status === "uploading") return;

      if (status === "done") {
        const res = info.file.response;
        message.success(res?.message || "Fichier importé avec succès.");
      } else if (status === "error") {
        const res = info.file.response;
        message.error(res?.message || "Erreur lors de l'import du fichier.");
      }
    },
  };

  return (
    <Card
      bordered={false}
      style={{
        borderRadius: 20,
        boxShadow:
          "0 18px 45px rgba(15,23,42,0.12), 0 0 1px rgba(15,23,42,0.08)",
      }}
    >
      <Title level={4} style={{ marginBottom: 4 }}>
        Import du fichier Grand livre
      </Title>
      <Text type="secondary" style={{ fontSize: 13 }}>
        Chargez votre fichier Excel <strong>grand_livre.xlsx</strong> (onglet
        <strong> "Grand livre"</strong>) pour mettre à jour les indicateurs.
      </Text>

      <div style={{ marginTop: 24 }}>
        <Dragger {...propsUpload}>
          <p style={{ marginBottom: 8 }}>
            <InboxOutlined style={{ fontSize: 40 }} />
          </p>
          <p style={{ marginBottom: 4, fontSize: 15 }}>
            Cliquez ou glissez un fichier Excel ici
          </p>
          <p style={{ fontSize: 12, color: "rgba(0,0,0,0.45)" }}>
            Formats acceptés : .xls, .xlsx. Onglet{" "}
            <strong>Grand livre</strong> avec les colonnes :
            <br />
            <strong>
              Code, Nom du compte, Date, Communication, Partenaire, Débit,
              Crédit, Solde
            </strong>
            .
          </p>
        </Dragger>
      </div>
    </Card>
  );
}
