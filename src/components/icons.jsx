/**
 * 统一线描图标系统。
 * 规格：24×24 viewBox，stroke=currentColor，strokeWidth 1.5，圆头圆角。
 * 所有图标视觉重量一致，14px 下仍可辨识。
 */

function Svg({ size = 18, children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/* ---------- 界面图标 ---------- */

export const IconLocation = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="10" r="3" />
    <path d="M12 21c3.6-4.2 6-7.3 6-10.4A6 6 0 0 0 6 10.6C6 13.7 8.4 16.8 12 21Z" />
  </Svg>
);

export const IconSearch = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6" />
    <path d="M15.5 15.5 20 20" />
  </Svg>
);

export const IconChevronLeft = (p) => (
  <Svg {...p}><path d="M14.5 6 9 12l5.5 6" /></Svg>
);

export const IconChevronRight = (p) => (
  <Svg {...p}><path d="M9.5 6 15 12l-5.5 6" /></Svg>
);

export const IconClose = (p) => (
  <Svg {...p}><path d="M7 7l10 10M17 7 7 17" /></Svg>
);

export const IconSun = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
  </Svg>
);

export const IconMoon = (p) => (
  <Svg {...p}><path d="M20 14.2A8 8 0 0 1 9.8 4 8.2 8.2 0 1 0 20 14.2Z" /></Svg>
);

export const IconSunrise = (p) => (
  <Svg {...p}>
    <path d="M12 3v4M5.6 9.6 7 11M18.4 9.6 17 11M2.5 18h3M18.5 18h3" />
    <path d="M8 18a4 4 0 0 1 8 0" />
    <path d="M3 21h18" />
  </Svg>
);

export const IconSunset = (p) => (
  <Svg {...p}>
    <path d="M12 7V3M5.6 9.6 7 11M18.4 9.6 17 11" />
    <path d="M8 18a4 4 0 0 1 8 0" />
    <path d="M3 21h18M2.5 18h3M18.5 18h3" />
  </Svg>
);

export const IconCompass = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15.5 8.5-2 5-5 2 2-5z" />
  </Svg>
);

export const IconScore = (p) => (
  <Svg {...p}>
    <path d="M4 16a8 8 0 1 1 16 0" />
    <path d="m12 16 4.2-5" />
    <circle cx="12" cy="16" r="1.2" />
  </Svg>
);

export const IconCalendar = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
    <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" />
  </Svg>
);

export const IconLayers = (p) => (
  <Svg {...p}>
    <path d="m12 3 8.5 4.6L12 12.2 3.5 7.6z" />
    <path d="m4.5 12.4 7.5 4 7.5-4M4.5 16.8l7.5 4 7.5-4" />
  </Svg>
);

/* ---------- 环境指标图标 ---------- */

export const IconEye = (p) => (
  <Svg {...p}>
    <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="2.8" />
  </Svg>
);

export const IconCloud = (p) => (
  <Svg {...p}>
    <path d="M7 18.5A4.25 4.25 0 0 1 7.6 10a6 6 0 0 1 11.3 1.6A3.6 3.6 0 0 1 18 18.5Z" />
  </Svg>
);

export const IconCloudLow = (p) => (
  <Svg {...p}>
    <path d="M7.5 15.5A3.75 3.75 0 0 1 8 8.1a5.4 5.4 0 0 1 10.2 1.4 3.2 3.2 0 0 1-.3 6Z" />
    <path d="M4 19.5h16" />
  </Svg>
);

export const IconCloudMid = (p) => (
  <Svg {...p}>
    <path d="M7.5 14.5A3.75 3.75 0 0 1 8 7.1a5.4 5.4 0 0 1 10.2 1.4 3.2 3.2 0 0 1-.3 6Z" />
    <path d="M4 18h16M6.5 21h11" />
  </Svg>
);

export const IconCloudHigh = (p) => (
  <Svg {...p}>
    <path d="M8 17.5A3.4 3.4 0 0 1 8.4 10.9a4.9 4.9 0 0 1 9.2 1.3 2.9 2.9 0 0 1-.2 5.3Z" />
    <path d="M3 6.5h9M17 6.5h4M5 10h4" />
  </Svg>
);

export const IconTemperature = (p) => (
  <Svg {...p}>
    <path d="M10 13.6V5.5a2 2 0 1 1 4 0v8.1a4 4 0 1 1-4 0Z" />
    <path d="M12 17.5v-2" />
  </Svg>
);

export const IconHumidity = (p) => (
  <Svg {...p}>
    <path d="M12 3.5s5.5 6 5.5 9.6a5.5 5.5 0 0 1-11 0C6.5 9.5 12 3.5 12 3.5Z" />
  </Svg>
);

export const IconWind = (p) => (
  <Svg {...p}>
    <path d="M3.5 8.5h11a2.75 2.75 0 1 0-2.75-2.75" />
    <path d="M3.5 15.5h14a2.75 2.75 0 1 1-2.75 2.75" />
    <path d="M3.5 12h6.5" />
  </Svg>
);

export const IconUv = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3.4" />
    <path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M18 6l-1.4 1.4M7.4 16.6 6 18" />
  </Svg>
);

/* ---------- 天气图标（WMO 码位映射） ---------- */

export const WeatherSunny = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" />
  </Svg>
);

export const WeatherMostlySunny = (p) => (
  <Svg {...p}>
    <circle cx="9" cy="8.5" r="2.9" />
    <path d="M9 3v1.6M3 8.5h1.6M4.8 4.3l1.1 1.1M13.2 4.3l-1.1 1.1" />
    <path d="M9.5 20.5a3.6 3.6 0 0 1 .5-7.1 5.2 5.2 0 0 1 9.8 1.3 3.1 3.1 0 0 1-.3 5.8Z" />
  </Svg>
);

export const WeatherPartlyCloudy = (p) => (
  <Svg {...p}>
    <circle cx="15.5" cy="7" r="3.2" />
    <path d="M15.5 2v1.5M20.5 7H22M18.7 3.8l1.1-1.1" />
    <path d="M6.5 20.5a3.6 3.6 0 0 1 .5-7.1 5.2 5.2 0 0 1 9.8 1.3 3.1 3.1 0 0 1-.3 5.8Z" />
  </Svg>
);

export const WeatherOvercast = (p) => (
  <Svg {...p}>
    <path d="M8 12.6A3.1 3.1 0 0 1 8.4 6.5a4.5 4.5 0 0 1 8.5 1.2" />
    <path d="M7.5 20.5a3.9 3.9 0 0 1 .5-7.7 5.6 5.6 0 0 1 10.5 1.4 3.3 3.3 0 0 1-.3 6.3Z" />
  </Svg>
);

export const WeatherFog = (p) => (
  <Svg {...p}>
    <path d="M7.5 14.5a3.6 3.6 0 0 1 .5-7.1 5.2 5.2 0 0 1 9.8 1.3 3.1 3.1 0 0 1-.3 5.8Z" />
    <path d="M4 18h11M9 21.2h11" />
  </Svg>
);

export const WeatherDrizzle = (p) => (
  <Svg {...p}>
    <path d="M7.5 14.5a3.6 3.6 0 0 1 .5-7.1 5.2 5.2 0 0 1 9.8 1.3 3.1 3.1 0 0 1-.3 5.8Z" />
    <path d="M9 18v1.6M13 18v1.6M17 18v1.6" />
  </Svg>
);

export const WeatherRain = (p) => (
  <Svg {...p}>
    <path d="M7.5 13.5a3.6 3.6 0 0 1 .5-7.1 5.2 5.2 0 0 1 9.8 1.3 3.1 3.1 0 0 1-.3 5.8Z" />
    <path d="M8.5 17 7 21.5M13 17l-1.5 4.5M17.5 17 16 21.5" />
  </Svg>
);

export const WeatherHeavyRain = (p) => (
  <Svg {...p}>
    <path d="M7.5 13a3.6 3.6 0 0 1 .5-7.1 5.2 5.2 0 0 1 9.8 1.3 3.1 3.1 0 0 1-.3 5.8Z" />
    <path d="M7 16.5 5.4 21.5M11 16.5 9.4 21.5M15 16.5l-1.6 5M19 16.5l-1.6 5" />
  </Svg>
);

export const WeatherSleet = (p) => (
  <Svg {...p}>
    <path d="M7.5 13.5a3.6 3.6 0 0 1 .5-7.1 5.2 5.2 0 0 1 9.8 1.3 3.1 3.1 0 0 1-.3 5.8Z" />
    <path d="M9 17.2v4.4M13 17.2v4.4" />
    <circle cx="17.5" cy="19.4" r="1.1" />
  </Svg>
);

export const WeatherSnow = (p) => (
  <Svg {...p}>
    <path d="M7.5 13.5a3.6 3.6 0 0 1 .5-7.1 5.2 5.2 0 0 1 9.8 1.3 3.1 3.1 0 0 1-.3 5.8Z" />
    <path d="M9 17.6v3.6M7.6 18.6l2.8 1.6M10.4 18.6l-2.8 1.6" />
    <path d="M16 17.6v3.6M14.6 18.6l2.8 1.6M17.4 18.6l-2.8 1.6" />
  </Svg>
);

export const WeatherShowers = (p) => (
  <Svg {...p}>
    <circle cx="8" cy="6.8" r="2.4" />
    <path d="M8 2.6v1.3M3.8 6.8h1.3M5 3.8l.9.9M11 3.8l-.9.9" />
    <path d="M8.5 18.5a3.4 3.4 0 0 1 .5-6.7 4.9 4.9 0 0 1 9.2 1.3 2.9 2.9 0 0 1-.3 5.4Z" />
    <path d="M11 20.5v1.2M15.5 20.5v1.2" />
  </Svg>
);

export const WeatherThunder = (p) => (
  <Svg {...p}>
    <path d="M7.5 13.5a3.6 3.6 0 0 1 .5-7.1 5.2 5.2 0 0 1 9.8 1.3 3.1 3.1 0 0 1-.3 5.8Z" />
    <path d="m13 16-2.6 4.2h3.2L11 24" />
  </Svg>
);

/* ---------- WMO 码位 → 图标 ---------- */

const WMO_ICON = {
  0: WeatherSunny,
  1: WeatherMostlySunny,
  2: WeatherPartlyCloudy,
  3: WeatherOvercast,
  45: WeatherFog,
  48: WeatherFog,
  51: WeatherDrizzle,
  53: WeatherDrizzle,
  55: WeatherDrizzle,
  56: WeatherSleet,
  57: WeatherSleet,
  61: WeatherRain,
  63: WeatherRain,
  65: WeatherHeavyRain,
  66: WeatherSleet,
  67: WeatherSleet,
  71: WeatherSnow,
  73: WeatherSnow,
  75: WeatherSnow,
  77: WeatherSnow,
  80: WeatherShowers,
  81: WeatherShowers,
  82: WeatherHeavyRain,
  85: WeatherSnow,
  86: WeatherSnow,
  95: WeatherThunder,
  96: WeatherThunder,
  99: WeatherThunder,
};

export function weatherGlyph(code) {
  return WMO_ICON[code] ?? WeatherPartlyCloudy;
}
