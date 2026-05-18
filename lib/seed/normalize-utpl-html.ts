import { UTPL_PORTAL_BASE_URL } from '@/lib/seed/utpl-portal-api-types';

export function absolutizeUtplUrls(html: string): string {
  return html
    .replace(/src="\/sites\//gi, `src="${UTPL_PORTAL_BASE_URL}/sites/`)
    .replace(/href="\/sites\//gi, `href="${UTPL_PORTAL_BASE_URL}/sites/`)
    .replace(/src="\/themes\//gi, `src="${UTPL_PORTAL_BASE_URL}/themes/`)
    .replace(/href="\/themes\//gi, `href="${UTPL_PORTAL_BASE_URL}/themes/`);
}

export function sanitizeUtplHtml(html: string): string {
  const withoutScripts = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '');

  return absolutizeUtplUrls(withoutScripts).trim();
}

export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\u003C/g, '<')
    .replace(/\u003E/g, '>');
}

export function stripHtmlToText(html: string): string {
  const withBreaks = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n');

  return decodeHtmlEntities(withBreaks.replace(/<[^>]+>/g, ' '))
    .replace(/\s+\n/g, '\n')
    .replace(/\n\s+/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function extractAnchorLinks(
  html: string,
): Array<{ label: string; url: string }> {
  const links: Array<{ label: string; url: string }> = [];
  const regex = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null = regex.exec(html);
  while (match) {
    const url = absolutizeUtplUrls(match[1].trim());
    const label = stripHtmlToText(match[2]);
    if (label && url.startsWith('http')) {
      links.push({ label, url });
    }
    match = regex.exec(html);
  }
  return links;
}

export function extractListItems(html: string): string[] {
  const items: string[] = [];
  const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let match: RegExpExecArray | null = liRegex.exec(html);
  while (match) {
    const text = stripHtmlToText(match[1]);
    if (text) items.push(text);
    match = liRegex.exec(html);
  }
  return items;
}
