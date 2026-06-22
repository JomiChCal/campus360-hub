import { sanitizeInput } from '@/lib/server/api-utilities';
import type { BannerAnnouncement } from '@/types/banner';

type SharePointChoiceField = {
  Value?: string;
};

type SharePointBannerRow = {
  Title?: string;
  field_1?: string;
  field_2?: string;
  field_3?: string;
  activar?: SharePointChoiceField;
};

function isActivated(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const choice = value as SharePointChoiceField;
  return String(choice.Value ?? '').trim().toLowerCase() === 'activado';
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function mapRow(row: SharePointBannerRow): BannerAnnouncement | null {
  if (!isActivated(row.activar)) return null;

  const title = sanitizeInput(String(row.Title ?? '').trim());
  const message = sanitizeInput(String(row.field_1 ?? '').trim());

  if (!title || !message) return null;

  const linkLabel = sanitizeInput(String(row.field_2 ?? '').trim());
  const linkUrl = String(row.field_3 ?? '').trim();

  const announcement: BannerAnnouncement = { title, message };

  if (linkLabel && linkUrl && isHttpUrl(linkUrl)) {
    announcement.link = { label: linkLabel, url: linkUrl };
  }

  return announcement;
}

export function mapSharePointBanners(raw: unknown): BannerAnnouncement[] {
  if (!Array.isArray(raw)) return [];

  const messages: BannerAnnouncement[] = [];

  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const mapped = mapRow(item as SharePointBannerRow);
    if (mapped) messages.push(mapped);
  }

  return messages;
}
