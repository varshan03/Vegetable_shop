// src/components/HeaderBar.js
import React from "react";
import { Typography } from "antd";
import logoImg from "../Images/logo.jpg";
import "../theme.css";

const { Title, Text } = Typography;

export default function HeaderBar() {
  return (
    <header className="global-header">
      <div className="global-header-inner">
        <div className="global-brand">
          <img src={logoImg} alt="RR Fresh Delivery" className="company-logo" />
          <div className="global-brand-text">
            <Title level={3} className="global-brand-title">RR Fresh Delivery</Title>
            <Text className="global-brand-tagline">Fresh & Organic</Text>
          </div>
        </div>
      </div>
    </header>
  );
}
