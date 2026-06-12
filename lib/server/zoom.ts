const ZOOM_MEETING_ID =
  process.env.ZOOM_MEETING_ID ??
  process.env.NEXT_PUBLIC_ZOOM_MEETING_ID ??
  '89419717339';

function buildZoomDisplayName(
  turnoNumber: string,
  nombres?: string,
  apellidos?: string
): string {
  if (nombres && apellidos) {
    const firstName = nombres.trim().split(' ')[0];
    const firstLastName = apellidos.trim().split(' ')[0];
    const namePart = `${firstName}_${firstLastName}`.replaceAll(/\s/g, '_');
    return `${turnoNumber}-${namePart}`;
  }
  return turnoNumber;
}

/** Enlace deep link para app Zoom en iOS / Android (zoomus://). */
export function generateMobileZoomLink(
  turnoNumber: string,
  nombres?: string,
  apellidos?: string
): string {
  const uname = buildZoomDisplayName(turnoNumber, nombres, apellidos);
  return `zoomus://zoom.us/join?confno=${ZOOM_MEETING_ID}&uname=${encodeURIComponent(uname)}&zc=0`;
}

/** Alias: zoomLink en API = enlace móvil (zoomus). */
export function generateZoomLink(
  turnoNumber: string,
  nombres?: string,
  apellidos?: string
): string {
  return generateMobileZoomLink(turnoNumber, nombres, apellidos);
}

export function generateWebZoomLink(
  turnoNumber: string,
  nombres?: string,
  apellidos?: string
): string {
  const uname = buildZoomDisplayName(turnoNumber, nombres, apellidos);
  return `https://zoom.us/j/${ZOOM_MEETING_ID}?uname=${encodeURIComponent(uname)}`;
}

/** Intent de Android con fallback web si la app no está instalada. */
export function generateAndroidZoomIntent(
  turnoNumber: string,
  nombres?: string,
  apellidos?: string
): string {
  const uname = buildZoomDisplayName(turnoNumber, nombres, apellidos);
  const webLink = generateWebZoomLink(turnoNumber, nombres, apellidos);
  const query = `confno=${ZOOM_MEETING_ID}&uname=${encodeURIComponent(uname)}&zc=0`;
  const fallback = encodeURIComponent(webLink);
  return `intent://zoom.us/join?${query}#Intent;scheme=zoomus;package=us.zoom.videomeetings;S.browser_fallback_url=${fallback};end`;
}
