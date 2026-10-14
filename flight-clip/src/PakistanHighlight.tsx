import { useMemo } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  interpolateColors,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { geoGraticule10, geoOrthographic, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";
import type { Feature, FeatureCollection, Geometry, MultiLineString } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import worldTopology from "world-atlas/countries-50m.json";

export const PAKISTAN_FPS = 30;
export const PAKISTAN_DURATION_IN_FRAMES = 360;

// Timeline (frames)
const ZOOM_START = 25;
const ZOOM_END = 115;
const OUTLINE_START = 95;
const OUTLINE_END = 165;
const FILL_START = 140;
const CITIES_START = 170;
const STATS_START = 215;

type LonLat = [number, number];

const PAKISTAN_ID = "586";
const PAKISTAN_CENTER: LonLat = [69.4, 30.2];
const GLOBE_START_CENTER: LonLat = [15, 12];

const CITIES: {
  name: string;
  coords: LonLat;
  capital?: boolean;
  align: "left" | "right";
}[] = [
  { name: "Islamabad", coords: [73.0479, 33.6844], capital: true, align: "right" },
  { name: "Karachi", coords: [67.0011, 24.8607], align: "right" },
  { name: "Lahore", coords: [74.3587, 31.5204], align: "right" },
  { name: "Peshawar", coords: [71.5249, 34.0151], align: "left" },
  { name: "Quetta", coords: [66.975, 30.1798], align: "left" },
  { name: "Multan", coords: [71.4752, 30.1575], align: "left" },
];

const NEIGHBOR_LABELS: { name: string; coords: LonLat; water?: boolean }[] = [
  { name: "Afghanistan", coords: [64.6, 33.6] },
  { name: "Iran", coords: [59.2, 28.6] },
  { name: "India", coords: [77.6, 25.2] },
  { name: "China", coords: [80.5, 37.6] },
  { name: "Arabian Sea", coords: [63.8, 23.6], water: true },
];

const STATS = [
  { label: "Capital", value: "Islamabad" },
  { label: "Population", value: "241.5 million", note: "2023 census" },
  { label: "Area", value: "881,913 km²" },
  { label: "Coastline", value: "1,046 km" },
];

const COLORS = {
  spaceInner: "#0b1a2e",
  spaceOuter: "#02050b",
  oceanLight: "#123a63",
  oceanDark: "#06172d",
  land: "#22403f",
  landDim: "#172a2d",
  borders: "rgba(120, 170, 165, 0.45)",
  graticule: "rgba(140, 190, 255, 0.09)",
  atmosphere: "rgba(90, 170, 255, 0.35)",
  pakistanDark: "#01411c",
  pakistanLight: "#11a35a",
  outline: "#e9fff2",
  text: "#f5f7fb",
  textMuted: "#9fb3cc",
  accent: "#3ddc84",
};

const topology = worldTopology as unknown as Topology<{
  countries: GeometryCollection;
}>;
const countries = feature(topology, topology.objects.countries) as FeatureCollection<
  Geometry,
  { name: string }
>;
const borders = mesh(
  topology,
  topology.objects.countries,
  (a, b) => a !== b,
) as MultiLineString;
const pakistan = countries.features.find(
  (c) => String(c.id) === PAKISTAN_ID,
) as Feature<Geometry, { name: string }>;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const CityPin: React.FC<{
  x: number;
  y: number;
  name: string;
  capital?: boolean;
  align: "left" | "right";
  frame: number;
  appearAt: number;
  fps: number;
  ui: number;
}> = ({ x, y, name, capital, align, frame, appearAt, fps, ui }) => {
  if (frame < appearAt) return null;
  const pop = spring({ frame: frame - appearAt, fps, config: { damping: 11 } });
  const pulse = ((frame - appearAt) % 50) / 50;
  const anchor = align === "left" ? "end" : "start";
  const dx = (align === "left" ? -22 : 22) * ui;
  const r = (capital ? 10 : 7) * ui;
  return (
    <g transform={`translate(${x}, ${y})`}>
      {capital && (
        <circle
          r={(12 + pulse * 34) * ui}
          fill="none"
          stroke="#ffffff"
          strokeWidth={2.5}
          opacity={(1 - pulse) * 0.7}
        />
      )}
      <circle
        r={r * pop}
        fill={capital ? "#ffffff" : COLORS.accent}
        stroke={capital ? COLORS.pakistanDark : "#ffffff"}
        strokeWidth={capital ? 4 * ui : 2.5 * ui}
      />
      <g
        opacity={Math.min(1, pop)}
        transform={`translate(${dx + (1 - pop) * (align === "left" ? 12 : -12)}, 0)`}
      >
        <text
          textAnchor={anchor}
          dominantBaseline="middle"
          fill={COLORS.text}
          fontSize={(capital ? 30 : 24) * ui}
          fontWeight={capital ? 800 : 700}
          stroke="rgba(2, 5, 11, 0.85)"
          strokeWidth={6 * ui}
          style={{ paintOrder: "stroke" }}
        >
          {name}
        </text>
        {capital && (
          <text
            textAnchor={anchor}
            y={26 * ui}
            fill={COLORS.accent}
            fontSize={15 * ui}
            fontWeight={800}
            letterSpacing={3}
            stroke="rgba(2, 5, 11, 0.85)"
            strokeWidth={5 * ui}
            style={{ paintOrder: "stroke" }}
          >
            CAPITAL
          </text>
        )}
      </g>
    </g>
  );
};

export const PakistanHighlight: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const isVertical = height > width;
  const ui = isVertical ? 1.15 : 1;

  // Map area: right side in landscape (text on the left), middle in vertical
  const mapBox = isVertical
    ? { x0: 70, y0: 440, x1: width - 70, y1: height - 560 }
    : { x0: width * 0.36, y0: 90, x1: width - 70, y1: height - 70 };
  const mapCenter: [number, number] = [
    (mapBox.x0 + mapBox.x1) / 2,
    (mapBox.y0 + mapBox.y1) / 2,
  ];
  const globeScale = Math.min(width, height) * 0.36;

  // Scale and translate that frame Pakistan inside the map box
  const fitted = useMemo(() => {
    const p = geoOrthographic()
      .rotate([-PAKISTAN_CENTER[0], -PAKISTAN_CENTER[1], 0])
      .fitExtent(
        [
          [mapBox.x0, mapBox.y0],
          [mapBox.x1, mapBox.y1],
        ],
        pakistan,
      );
    return { scale: p.scale(), translate: p.translate() };
  }, [mapBox.x0, mapBox.y0, mapBox.x1, mapBox.y1]);

  const zoomT = interpolate(frame, [ZOOM_START, ZOOM_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  // Spin the globe in from the west before locking on Pakistan
  const idleSpin = interpolate(frame, [0, ZOOM_START], [-25, 0], {
    extrapolateRight: "clamp",
  });
  const centerLon = lerp(GLOBE_START_CENTER[0] + idleSpin, PAKISTAN_CENTER[0], zoomT);
  const centerLat = lerp(GLOBE_START_CENTER[1], PAKISTAN_CENTER[1], zoomT);

  // Zoom in log space so the move feels constant, then a slow push-in
  const drift = interpolate(frame, [ZOOM_END, PAKISTAN_DURATION_IN_FRAMES], [1, 1.06], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale =
    Math.exp(lerp(Math.log(globeScale), Math.log(fitted.scale), zoomT)) * drift;
  const translate: [number, number] = [
    lerp(width / 2, fitted.translate[0], zoomT),
    lerp(height / 2, fitted.translate[1], zoomT),
  ];

  const projection = geoOrthographic()
    .translate(translate)
    .scale(scale)
    .rotate([-centerLon, -centerLat, 0])
    .clipAngle(90)
    .precision(0.3);
  const path = geoPath(projection);

  // Highlight animations
  const outlineProgress = interpolate(frame, [OUTLINE_START, OUTLINE_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const fillIn = interpolate(frame, [FILL_START, FILL_START + 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dimNeighbors = interpolate(frame, [OUTLINE_START, FILL_START + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const neighborFill = interpolateColors(
    dimNeighbors,
    [0, 1],
    [COLORS.land, COLORS.landDim],
  );
  const neighborLabelsIn = interpolate(frame, [FILL_START, FILL_START + 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const glowPulse = 0.6 + 0.4 * Math.sin((frame - FILL_START) / 14);

  const pakistanPath = path(pakistan) ?? undefined;

  const stars = useMemo(
    () =>
      new Array(140).fill(0).map((_, i) => ({
        x: random(`pk-star-x-${i}`) * width,
        y: random(`pk-star-y-${i}`) * height,
        r: 0.6 + random(`pk-star-r-${i}`) * 1.5,
        phase: random(`pk-star-p-${i}`) * Math.PI * 2,
      })),
    [width, height],
  );

  const titleIn = spring({ frame: frame - (FILL_START - 10), fps, config: { damping: 200 } });
  const fadeOut = interpolate(
    frame,
    [PAKISTAN_DURATION_IN_FRAMES - 15, PAKISTAN_DURATION_IN_FRAMES],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${(mapCenter[0] / width) * 100}% ${
          (mapCenter[1] / height) * 100
        }%, ${COLORS.spaceInner} 0%, ${COLORS.spaceOuter} 75%)`,
        fontFamily: "Inter, 'Helvetica Neue', 'Segoe UI', Roboto, Arial, sans-serif",
        opacity: fadeOut,
      }}
    >
      <svg width={width} height={height} style={{ position: "absolute" }}>
        <defs>
          <radialGradient id="pk-ocean" cx="40%" cy="35%" r="75%">
            <stop offset="0%" stopColor={COLORS.oceanLight} />
            <stop offset="100%" stopColor={COLORS.oceanDark} />
          </radialGradient>
          <linearGradient id="pk-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={COLORS.pakistanLight} />
            <stop offset="100%" stopColor={COLORS.pakistanDark} />
          </linearGradient>
          <filter id="pk-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
          <filter id="pk-atmo" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="22" />
          </filter>
        </defs>

        {stars.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="#ffffff"
            opacity={0.2 + 0.35 * (0.5 + 0.5 * Math.sin(frame / 12 + s.phase))}
          />
        ))}

        {/* Atmosphere, visible while the whole globe is on screen */}
        <circle
          cx={translate[0]}
          cy={translate[1]}
          r={scale + 14}
          fill="none"
          stroke={COLORS.atmosphere}
          strokeWidth={28}
          filter="url(#pk-atmo)"
          opacity={1 - zoomT}
        />

        <path d={path({ type: "Sphere" }) ?? undefined} fill="url(#pk-ocean)" />
        <path
          d={path(geoGraticule10()) ?? undefined}
          fill="none"
          stroke={COLORS.graticule}
          strokeWidth={1}
        />

        {/* Other countries dim as Pakistan comes into focus */}
        {countries.features.map((country) => {
          if (String(country.id) === PAKISTAN_ID) return null;
          const d = path(country);
          if (!d) return null;
          return (
            <path
              key={`${country.id}-${country.properties.name}`}
              d={d}
              fill={neighborFill}
            />
          );
        })}
        <path
          d={path(borders) ?? undefined}
          fill="none"
          stroke={COLORS.borders}
          strokeWidth={1}
        />

        {/* Pakistan base shape before the highlight */}
        <path d={pakistanPath} fill={COLORS.land} />

        {/* Glow behind the highlighted shape */}
        <path
          d={pakistanPath}
          fill={COLORS.pakistanLight}
          opacity={fillIn * 0.45 * glowPulse}
          filter="url(#pk-glow)"
        />
        <path d={pakistanPath} fill="url(#pk-fill)" opacity={fillIn} />

        {/* Outline drawing on */}
        <path
          d={pakistanPath}
          fill="none"
          stroke={COLORS.outline}
          strokeWidth={3.5 * ui}
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - outlineProgress}
          opacity={outlineProgress > 0 ? 1 : 0}
        />

        {/* Neighbor and sea labels */}
        {NEIGHBOR_LABELS.map((label) => {
          const xy = projection(label.coords);
          // Skip labels that would be cut off at the frame edge
          if (!xy || xy[0] < 140 * ui || xy[0] > width - 140 * ui) return null;
          return (
            <text
              key={label.name}
              x={xy[0]}
              y={xy[1]}
              textAnchor="middle"
              fill={label.water ? "rgba(140, 190, 255, 0.55)" : "rgba(200, 215, 230, 0.45)"}
              fontSize={20 * ui}
              fontWeight={700}
              fontStyle={label.water ? "italic" : "normal"}
              letterSpacing={6}
              opacity={neighborLabelsIn}
            >
              {label.name.toUpperCase()}
            </text>
          );
        })}

        {/* Cities */}
        {CITIES.map((city, i) => {
          const xy = projection(city.coords);
          if (!xy) return null;
          return (
            <CityPin
              key={city.name}
              x={xy[0]}
              y={xy[1]}
              name={city.name}
              capital={city.capital}
              align={city.align}
              frame={frame}
              appearAt={CITIES_START + i * 9}
              fps={fps}
              ui={ui}
            />
          );
        })}
      </svg>

      {/* Title */}
      <div
        style={{
          position: "absolute",
          left: isVertical ? 0 : 90,
          right: isVertical ? 0 : undefined,
          top: isVertical ? 130 : 150,
          textAlign: isVertical ? "center" : "left",
          opacity: titleIn,
          transform: `translateY(${(1 - titleIn) * 30}px)`,
        }}
      >
        <div
          style={{
            color: COLORS.accent,
            fontSize: 22 * ui,
            fontWeight: 800,
            letterSpacing: 8,
            textTransform: "uppercase",
          }}
        >
          South Asia
        </div>
        <div
          style={{
            color: COLORS.text,
            fontSize: (isVertical ? 120 : 112) * ui,
            fontWeight: 900,
            letterSpacing: 6,
            lineHeight: 1.05,
            marginTop: 8,
          }}
        >
          PAKISTAN
        </div>
        <div
          style={{
            color: COLORS.textMuted,
            fontSize: 26 * ui,
            fontWeight: 600,
            marginTop: 10,
          }}
        >
          Islamic Republic of Pakistan
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          position: "absolute",
          left: isVertical ? 60 : 90,
          right: isVertical ? 60 : undefined,
          top: isVertical ? undefined : 470,
          bottom: isVertical ? 170 : undefined,
          display: "grid",
          gridTemplateColumns: isVertical ? "1fr 1fr" : "1fr",
          gap: isVertical ? 20 : 16,
          width: isVertical ? undefined : 420,
        }}
      >
        {STATS.map((stat, i) => {
          const s = spring({
            frame: frame - (STATS_START + i * 8),
            fps,
            config: { damping: 200 },
          });
          return (
            <div
              key={stat.label}
              style={{
                padding: `${16 * ui}px ${22 * ui}px`,
                borderRadius: 16,
                background: "rgba(6, 20, 26, 0.75)",
                borderLeft: `4px solid ${COLORS.accent}`,
                opacity: s,
                transform: `translateX(${(1 - s) * -40}px)`,
              }}
            >
              <div
                style={{
                  color: COLORS.textMuted,
                  fontSize: 15 * ui,
                  fontWeight: 800,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  color: COLORS.text,
                  fontSize: 32 * ui,
                  fontWeight: 800,
                  marginTop: 4,
                }}
              >
                {stat.value}
                {stat.note && (
                  <span
                    style={{
                      color: COLORS.textMuted,
                      fontSize: 16 * ui,
                      fontWeight: 600,
                      marginLeft: 10,
                    }}
                  >
                    {stat.note}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
