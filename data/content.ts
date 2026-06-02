import content from '@/data/content.json';

function format(template: string, parameters: Record<string, string>): string {
  return template.replaceAll(/\{(\w+)\}/g, (_match, key) => parameters[key] ?? `{${key}}`);
}

const c = content;
type Content = typeof content;

export { c, format };
export type { Content };
