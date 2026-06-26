type PlaceholderProps = {
  color: string;
  /** 車隊代號文字，例如 "#2" */
  badge?: string;
  className?: string;
};

/** 佔位賽車：依車隊 livery 色生成的側視剪影 */
export function PlaceholderCar({ color, className }: PlaceholderProps) {
  return (
    <svg
      viewBox="0 0 320 120"
      className={className}
      role="img"
      aria-label="待生成賽車"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={`car-${color.replace("#", "")}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor={color} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      {/* 車身 */}
      <path
        d="M18 78 L58 78 L78 58 L150 52 L182 56 L210 44 L250 46 L268 60 L300 64 L300 78 L18 78 Z"
        fill={`url(#car-${color.replace("#", "")})`}
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* 前後翼 */}
      <rect x="6" y="74" width="26" height="8" rx="2" fill={color} opacity="0.9" />
      <rect x="288" y="40" width="10" height="26" rx="2" fill={color} opacity="0.9" />
      {/* 座艙 */}
      <path d="M150 52 L168 38 L196 40 L188 54 Z" fill="#0b0b0e" opacity="0.85" />
      {/* 輪胎 */}
      <circle cx="92" cy="86" r="22" fill="#0b0b0e" />
      <circle cx="92" cy="86" r="9" fill={color} opacity="0.8" />
      <circle cx="234" cy="86" r="22" fill="#0b0b0e" />
      <circle cx="234" cy="86" r="9" fill={color} opacity="0.8" />
    </svg>
  );
}

/** 佔位 Logo：圓形徽章 + 車隊代號 */
export function PlaceholderLogo({ color, badge, className }: PlaceholderProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="待生成 Logo"
      preserveAspectRatio="xMidYMid meet"
    >
      <circle cx="32" cy="32" r="29" fill="#0b0b0e" stroke={color} strokeWidth="3" />
      <circle cx="32" cy="32" r="20" fill="none" stroke={color} strokeWidth="1.5" opacity="0.5" />
      <text
        x="32"
        y="32"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="20"
        fontWeight="700"
        fill={color}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {badge ?? "?"}
      </text>
    </svg>
  );
}
