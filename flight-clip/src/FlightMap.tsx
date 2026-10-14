import { useMemo } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  geoDistance,
  geoGraticule10,
  geoInterpolate,
  geoOrthographic,
  geoPath,
} from "d3-geo";
import { feature, mesh } from "topojson-client";
import type { Feature, FeatureCollection, Geometry, MultiLineString } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import worldTopology from "world-atlas/countries-110m.json";

export const FPS = 30;
export const DURATION_IN_FRAMES = 330;

// Timeline (frames)
const INTRO_END = 45;
const FLIGHT_START = 45;
const FLIGHT_END = 255;

type LonLat = [number, number];

const ORIGIN = {
  code: "ISB",
  city: "Islamabad",
  country: "Pakistan",
  coords: [73.0479, 33.6844] as LonLat,
};
const DESTINATION = {
  code: "JFK",
  city: "New York",
  country: "United States",
  coords: [-73.7781, 40.6413] as LonLat,
};

// ISO 3166-1 numeric ids used by world-atlas
const HIGHLIGHTED_COUNTRIES = new Set(["586", "840"]);

const EARTH_RADIUS_KM = 6371;
const FLIGHT_HOURS = 14.25;

const COLORS = {
  spaceInner: "#0d1b33",
  spaceOuter: "#03060d",
  oceanLight: "#123a63",
  oceanDark: "#071a33",
  land: "#1f4d4a",
  landStroke: "#2f6f69",
  highlight: "#f4b740",
  route: "#ffd166",
  routeGhost: "rgba(255, 209, 102, 0.28)",
  graticule: "rgba(140, 190, 255, 0.10)",
  atmosphere: "rgba(90, 170, 255, 0.35)",
  text: "#f5f7fb",
  textMuted: "#9fb3cc",
  pakistan: "#01a35b",
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

const routeInterpolator = geoInterpolate(ORIGIN.coords, DESTINATION.coords);
const routeDistanceKm =
  geoDistance(ORIGIN.coords, DESTINATION.coords) * EARTH_RADIUS_KM;

const ROUTE_SAMPLES = 160;

const isVisible = (point: LonLat, center: LonLat) =>
  geoDistance(point, center) < Math.PI / 2 - 0.02;

const formatNumber = (value: number) =>
  Math.round(value).toLocaleString("en-US");

const formatDuration = (hours: number) => {
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`;
};

// Simple top-down airliner silhouette pointing up (north), centered on 0,0
const PLANE_PATH =
  "M0,-30 C3,-30 4,-26 4,-20 L4,-8 L28,6 L28,11 L4,4 L4,16 L11,22 L11,26 L0,23 L-11,26 L-11,22 L-4,16 L-4,4 L-28,11 L-28,6 L-4,-8 L-4,-20 C-4,-26 -3,-30 0,-30 Z";

const Pin: React.FC<{
  x: number;
  y: number;
  frame: number;
  appearAt: number;
  color: string;
  fps: number;
}> = ({ x, y, frame, appearAt, color, fps }) => {
  const pop = spring({ frame: frame - appearAt, fps, config: { damping: 12 } });
  const pulse = ((frame - appearAt) % 45) / 45;
  if (frame < appearAt) return null;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle
        r={10 + pulse * 40}
        fill="none"
        stroke={color}
        strokeWidth={3}
        opacity={(1 - pulse) * 0.8}
      />
      <circle r={14 * pop} fill={color} opacity={0.3} />
      <circle r={8 * pop} fill={color} stroke="#ffffff" strokeWidth={3} />
    </g>
  );
};

const CityLabel: React.FC<{
  x: number;
  y: number;
  code: string;
  city: string;
  opacity: number;
  align: "left" | "right";
  scale: number;
}> = ({ x, y, code, city, opacity, align, scale }) => {
  const anchor = align === "left" ? "start" : "end";
  const dx = align === "left" ? 24 : -24;
  return (
    <g opacity={opacity} transform={`translate(${x + dx * scale}, ${y})`}>
      <text
        textAnchor={anchor}
        y={-6 * scale}
        fill={COLORS.text}
        fontSize={34 * scale}
        fontWeight={800}
        letterSpacing={2}
        style={{ paintOrder: "stroke" }}
        stroke="rgba(3, 6, 13, 0.85)"
        strokeWidth={6 * scale}
      >
        {code}
      </text>
      <text
        textAnchor={anchor}
        y={26 * scale}
        fill={COLORS.textMuted}
        fontSize={22 * scale}
        fontWeight={600}
        style={{ paintOrder: "stroke" }}
        stroke="rgba(3, 6, 13, 0.85)"
        strokeWidth={5 * scale}
      >
        {city}
      </text>
    </g>
  );
};

export const FlightMap: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const isVertical = height > width;
  const ui = isVertical ? 1.15 : 1;

  // Flight progress along the great-circle route, 0 to 1
  const progress = interpolate(frame, [FLIGHT_START, FLIGHT_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  // Camera follows slightly behind the plane so the route ahead stays in view
  const cameraT = interpolate(progress, [0, 1], [0, 1]);
  const cameraCenter = routeInterpolator(
    Math.min(1, Math.max(0, cameraT + 0.04 * Math.sin(Math.PI * progress))),
  ) as LonLat;

  // Zoom: close on departure, pull back mid-flight, push in on arrival
  const baseRadius = Math.min(width, height) * (isVertical ? 0.46 : 0.44);
  const introZoom = interpolate(frame, [0, INTRO_END], [1.15, 1.7], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const flightZoom = 1.7 - 0.75 * Math.sin(Math.PI * progress);
  const outroZoom = interpolate(
    frame,
    [FLIGHT_END, DURATION_IN_FRAMES],
    [1, 1.12],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) },
  );
  const zoom = (frame < INTRO_END ? introZoom : flightZoom) * outroZoom;

  // Keep the globe slightly below center in landscape so the HUD has room
  const globeCenterY = height * (isVertical ? 0.52 : 0.55);

  const projection = useMemo(
    () =>
      geoOrthographic()
        .translate([width / 2, globeCenterY])
        .scale(baseRadius * zoom)
        .rotate([-cameraCenter[0], -cameraCenter[1] * 0.85, 0])
        .clipAngle(90)
        .precision(0.3),
    [width, globeCenterY, baseRadius, zoom, cameraCenter[0], cameraCenter[1]],
  );
  const path = geoPath(projection);

  // Rotation center in lon/lat (used for visibility tests)
  const viewCenter: LonLat = [cameraCenter[0], cameraCenter[1] * 0.85];

  const routeSoFar = useMemo(() => {
    const steps = Math.max(2, Math.ceil(ROUTE_SAMPLES * progress));
    const coords: LonLat[] = [];
    for (let i = 0; i <= steps; i++) {
      coords.push(routeInterpolator((i / steps) * progress) as LonLat);
    }
    return coords;
  }, [progress]);

  const fullRoute = useMemo(() => {
    const coords: LonLat[] = [];
    for (let i = 0; i <= ROUTE_SAMPLES; i++) {
      coords.push(routeInterpolator(i / ROUTE_SAMPLES) as LonLat);
    }
    return coords;
  }, []);

  const routeGhostOpacity = interpolate(frame, [10, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Plane position and heading
  const planeGeo = routeInterpolator(progress) as LonLat;
  const aheadGeo = routeInterpolator(Math.min(1, progress + 0.01)) as LonLat;
  const behindGeo = routeInterpolator(Math.max(0, progress - 0.01)) as LonLat;
  const planeXY = projection(planeGeo) ?? [width / 2, height / 2];
  const aheadXY = projection(aheadGeo) ?? planeXY;
  const behindXY = projection(behindGeo) ?? planeXY;
  const headingDeg =
    (Math.atan2(aheadXY[1] - behindXY[1], aheadXY[0] - behindXY[0]) * 180) /
      Math.PI +
    90;
  const altitude = Math.sin(Math.PI * progress);
  const planeScale = (1.25 + altitude * 0.55) * ui;
  const planeOpacity = interpolate(
    frame,
    [FLIGHT_START - 15, FLIGHT_START, FLIGHT_END, FLIGHT_END + 20],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const originXY = projection(ORIGIN.coords);
  const destXY = projection(DESTINATION.coords);
  const originVisible = isVisible(ORIGIN.coords, viewCenter);
  const destVisible = isVisible(DESTINATION.coords, viewCenter);

  // Deterministic starfield
  const stars = useMemo(
    () =>
      new Array(140).fill(0).map((_, i) => ({
        x: random(`star-x-${i}`) * width,
        y: random(`star-y-${i}`) * height,
        r: 0.6 + random(`star-r-${i}`) * 1.6,
        phase: random(`star-p-${i}`) * Math.PI * 2,
      })),
    [width, height],
  );

  // HUD animations
  const titleIn = spring({ frame: frame - 5, fps, config: { damping: 200 } });
  const hudIn = spring({ frame: frame - 20, fps, config: { damping: 200 } });
  const arrivalIn = spring({
    frame: frame - (FLIGHT_END + 5),
    fps,
    config: { damping: 14, mass: 0.8 },
  });
  const fadeOut = interpolate(
    frame,
    [DURATION_IN_FRAMES - 12, DURATION_IN_FRAMES],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const kmFlown = routeDistanceKm * progress;
  const timeFlown = FLIGHT_HOURS * progress;
  const globeRadius = projection.scale();

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 55%, ${COLORS.spaceInner} 0%, ${COLORS.spaceOuter} 70%)`,
        fontFamily:
          "Inter, 'Helvetica Neue', 'Segoe UI', Roboto, Arial, sans-serif",
        opacity: fadeOut,
      }}
    >
      <svg width={width} height={height} style={{ position: "absolute" }}>
        <defs>
          <radialGradient id="ocean" cx="40%" cy="35%" r="75%">
            <stop offset="0%" stopColor={COLORS.oceanLight} />
            <stop offset="100%" stopColor={COLORS.oceanDark} />
          </radialGradient>
          <radialGradient id="shade" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.45)" />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="atmo" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="22" />
          </filter>
          <filter id="planeShadow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        {stars.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="#ffffff"
            opacity={0.25 + 0.35 * (0.5 + 0.5 * Math.sin(frame / 12 + s.phase))}
          />
        ))}

        {/* Atmosphere glow */}
        <circle
          cx={width / 2}
          cy={globeCenterY}
          r={globeRadius + 14}
          fill="none"
          stroke={COLORS.atmosphere}
          strokeWidth={28}
          filter="url(#atmo)"
        />

        {/* Ocean */}
        <path d={path({ type: "Sphere" }) ?? undefined} fill="url(#ocean)" />
        <path
          d={path(geoGraticule10()) ?? undefined}
          fill="none"
          stroke={COLORS.graticule}
          strokeWidth={1}
        />

        {/* Land */}
        {countries.features.map((country: Feature<Geometry, { name: string }>) => {
          const id = String(country.id);
          const highlighted = HIGHLIGHTED_COUNTRIES.has(id);
          const d = path(country);
          if (!d) return null;
          return (
            <path
              key={id + country.properties.name}
              d={d}
              fill={
                highlighted
                  ? id === "586"
                    ? COLORS.pakistan
                    : "#2e6fd1"
                  : COLORS.land
              }
              opacity={highlighted ? 0.95 : 1}
            />
          );
        })}
        <path
          d={path(borders) ?? undefined}
          fill="none"
          stroke={COLORS.landStroke}
          strokeWidth={0.8}
        />

        {/* Globe edge shading */}
        <path d={path({ type: "Sphere" }) ?? undefined} fill="url(#shade)" />

        {/* Full route preview */}
        <path
          d={path({ type: "LineString", coordinates: fullRoute }) ?? undefined}
          fill="none"
          stroke={COLORS.routeGhost}
          strokeWidth={3 * ui}
          strokeDasharray={`${10 * ui} ${12 * ui}`}
          strokeDashoffset={-frame * 1.5}
          opacity={routeGhostOpacity}
        />

        {/* Route flown so far */}
        {progress > 0 && (
          <path
            d={path({ type: "LineString", coordinates: routeSoFar }) ?? undefined}
            fill="none"
            stroke={COLORS.route}
            strokeWidth={5 * ui}
            strokeLinecap="round"
            filter="url(#glow)"
          />
        )}

        {/* Pins and labels */}
        {originXY && originVisible && (
          <>
            <Pin
              x={originXY[0]}
              y={originXY[1]}
              frame={frame}
              appearAt={8}
              color={COLORS.pakistan}
              fps={fps}
            />
            <CityLabel
              x={originXY[0]}
              y={originXY[1]}
              code={ORIGIN.code}
              city={`${ORIGIN.city}, PK`}
              opacity={titleIn}
              align={originXY[0] > width - 260 * ui ? "right" : "left"}
              scale={ui}
            />
          </>
        )}
        {destXY && destVisible && (
          <>
            <Pin
              x={destXY[0]}
              y={destXY[1]}
              frame={frame}
              appearAt={FLIGHT_START + 60}
              color="#4f9bff"
              fps={fps}
            />
            <CityLabel
              x={destXY[0]}
              y={destXY[1]}
              code={DESTINATION.code}
              city={`${DESTINATION.city}, US`}
              opacity={interpolate(
                frame,
                [FLIGHT_START + 60, FLIGHT_START + 80],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              )}
              align={destXY[0] < 260 * ui ? "left" : "right"}
              scale={ui}
            />
          </>
        )}

        {/* Plane with drop shadow that separates as it climbs */}
        <g opacity={planeOpacity}>
          <path
            d={PLANE_PATH}
            fill="rgba(0,0,0,0.35)"
            filter="url(#planeShadow)"
            transform={`translate(${planeXY[0] + 6 + altitude * 22}, ${
              planeXY[1] + 10 + altitude * 30
            }) rotate(${headingDeg}) scale(${planeScale * 0.9})`}
          />
          <path
            d={PLANE_PATH}
            fill="#ffffff"
            stroke="#0b1424"
            strokeWidth={1.2}
            transform={`translate(${planeXY[0]}, ${planeXY[1]}) rotate(${headingDeg}) scale(${planeScale})`}
          />
        </g>
      </svg>

      {/* Top backdrop keeps the title readable over the globe */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: isVertical ? 420 : 260,
          background:
            "linear-gradient(180deg, rgba(3,6,13,0.85) 0%, rgba(3,6,13,0.55) 55%, rgba(3,6,13,0) 100%)",
        }}
      />

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: isVertical ? 120 : 56,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleIn,
          transform: `translateY(${(1 - titleIn) * -30}px)`,
        }}
      >
        <div
          style={{
            color: COLORS.textMuted,
            fontSize: 24 * ui,
            fontWeight: 700,
            letterSpacing: 8,
            textTransform: "uppercase",
          }}
        >
          Pakistan to United States
        </div>
        <div
          style={{
            marginTop: 10,
            color: COLORS.text,
            fontSize: (isVertical ? 72 : 64) * ui,
            fontWeight: 800,
            letterSpacing: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 28,
          }}
        >
          <span>{ORIGIN.code}</span>
          <span
            style={{
              display: "inline-block",
              width: 140 * ui,
              height: 4,
              borderRadius: 2,
              background: `linear-gradient(90deg, ${COLORS.pakistan} 0%, ${COLORS.route} ${
                progress * 100
              }%, rgba(255,255,255,0.2) ${progress * 100}%)`,
            }}
          />
          <span>{DESTINATION.code}</span>
        </div>
      </div>

      {/* Flight stats HUD */}
      <div
        style={{
          position: "absolute",
          left: isVertical ? 60 : 64,
          right: isVertical ? 60 : undefined,
          bottom: isVertical ? 150 : 56,
          display: "flex",
          gap: isVertical ? 24 : 20,
          justifyContent: isVertical ? "center" : "flex-start",
          opacity: hudIn,
          transform: `translateY(${(1 - hudIn) * 30}px)`,
        }}
      >
        {[
          { label: "Distance flown", value: `${formatNumber(kmFlown)} km` },
          { label: "Flight time", value: formatDuration(timeFlown) },
          {
            label: "Remaining",
            value: `${formatNumber(routeDistanceKm - kmFlown)} km`,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              padding: `${16 * ui}px ${22 * ui}px`,
              borderRadius: 16,
              background: "rgba(8, 18, 36, 0.72)",
              border: "1px solid rgba(160, 200, 255, 0.18)",
              minWidth: 190 * ui,
            }}
          >
            <div
              style={{
                color: COLORS.textMuted,
                fontSize: 16 * ui,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              {stat.label}
            </div>
            <div
              style={{
                color: COLORS.text,
                fontSize: 34 * ui,
                fontWeight: 800,
                marginTop: 6,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Arrival card */}
      <div
        style={{
          position: "absolute",
          right: isVertical ? 60 : 64,
          left: isVertical ? 60 : undefined,
          top: isVertical ? undefined : 200,
          bottom: isVertical ? 330 : undefined,
          padding: `${22 * ui}px ${30 * ui}px`,
          borderRadius: 20,
          background: "rgba(8, 18, 36, 0.82)",
          border: `2px solid ${COLORS.route}`,
          opacity: Math.min(1, arrivalIn),
          transform: `scale(${0.85 + 0.15 * arrivalIn})`,
          transformOrigin: "center",
          textAlign: isVertical ? "center" : "left",
        }}
      >
        <div
          style={{
            color: COLORS.route,
            fontSize: 18 * ui,
            fontWeight: 800,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          Arrived
        </div>
        <div
          style={{
            color: COLORS.text,
            fontSize: 44 * ui,
            fontWeight: 800,
            marginTop: 6,
          }}
        >
          Welcome to {DESTINATION.city}
        </div>
        <div
          style={{
            color: COLORS.textMuted,
            fontSize: 22 * ui,
            fontWeight: 600,
            marginTop: 8,
          }}
        >
          {formatNumber(routeDistanceKm)} km nonstop from {ORIGIN.city}
        </div>
      </div>
    </AbsoluteFill>
  );
};
