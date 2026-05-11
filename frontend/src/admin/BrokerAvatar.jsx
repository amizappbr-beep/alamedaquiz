import React from "react";
import { getInitials, colorFromString } from "./channels";

/**
 * Compact circular badge with broker initials. Used inline on lead cards.
 * size: "sm" (20px) | "md" (28px) | "lg" (36px)
 */
export default function BrokerAvatar({ broker, size = "sm", title }) {
  const dim = size === "lg" ? 36 : size === "md" ? 28 : 20;
  const fontSize = size === "lg" ? 12 : size === "md" ? 10 : 9;
  const ringColor = colorFromString(broker?.id || broker?.name || "");
  const label = broker?.name || "Sem dono";
  const initials = broker?.name ? getInitials(broker.name) : "—";

  return (
    <span
      data-testid={broker ? `broker-avatar-${broker.id}` : "broker-avatar-empty"}
      title={title || label}
      className="inline-flex items-center justify-center rounded-full font-bold text-white"
      style={{
        width: dim,
        height: dim,
        fontSize,
        backgroundColor: broker ? ringColor : "#cbd5e1",
        letterSpacing: "0.02em",
      }}
    >
      {initials}
    </span>
  );
}
