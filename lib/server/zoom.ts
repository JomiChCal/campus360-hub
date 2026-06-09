const ZOOM_MEETING_ID = process.env.ZOOM_MEETING_ID ?? '89419717339';

export function generateZoomLink(
  turnoNumber: string,
  nombres?: string,
  apellidos?: string
): string {
  if (nombres && apellidos) {
    const firstName = nombres.trim().split(' ')[0];
    const firstLastName = apellidos.trim().split(' ')[0];
    const namePart = `${firstName}_${firstLastName}`.replaceAll(/\s/g, '_');
    const fullName = `${turnoNumber}-${namePart}`;
    return `zoommtg://zoom.us/join?confno=${ZOOM_MEETING_ID}&uname=${fullName}`;
  }
  return `zoommtg://zoom.us/join?confno=${ZOOM_MEETING_ID}&uname=${turnoNumber}`;
}

export function generateWebZoomLink(
  turnoNumber: string,
  nombres?: string,
  apellidos?: string
): string {
  if (nombres && apellidos) {
    const firstName = nombres.trim().split(' ')[0];
    const firstLastName = apellidos.trim().split(' ')[0];
    const namePart = `${firstName}_${firstLastName}`.replaceAll(/\s/g, '_');
    const fullName = `${turnoNumber}-${namePart}`;
    return `https://zoom.us/j/${ZOOM_MEETING_ID}?uname=${fullName}`;
  }
  return `https://zoom.us/j/${ZOOM_MEETING_ID}?uname=${turnoNumber}`;
}
