import React from "react";
import { Link } from "react-router-dom";
import "./KpiCard.css";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  trend?: string;
  description?: string;
  to?: string;
  onClick?: () => void;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon,
  iconBg = "var(--accent-light)",
  iconColor = "var(--accent)",
  trend,
  description,
  to,
  onClick,
}) => {
  const content = (
    <div
      className={`kpi-card ${to || onClick ? "clickable" : ""}`}
      onClick={onClick}
    >
      <div className="kpi-header">
        {icon && (
          <div
            className="kpi-icon-wrapper"
            style={{ backgroundColor: iconBg, color: iconColor }}
          >
            {icon}
          </div>
        )}
        {trend && <span className="kpi-trend">{trend}</span>}
      </div>

      <div className="kpi-content">
        <span className="kpi-title">{title}</span>
        <h2 className="kpi-value">{value}</h2>
        {description && <span className="kpi-description">{description}</span>}
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="kpi-card-link">
        {content}
      </Link>
    );
  }

  return content;
};

export default KpiCard;
