import {
  BookOpen,
  Calendar,
  DollarSign,
  FileText,
  GraduationCap,
  HelpCircle,
  Monitor,
  Shuffle,
  type LucideIcon,
} from 'lucide-react';

const categoryIconByLabel: Record<string, LucideIcon> = {
  'Libro – matrículas y trámites': BookOpen,
  'Calendario – fechas e información': Calendar,
  'Dinero – pagos y becas': DollarSign,
  'Computadora – plataformas y sistemas': Monitor,
  'Documento – certificados y solicitudes': FileText,
  'Birrete – temas académicos': GraduationCap,
  'Flechas – cambios de carrera': Shuffle,
  'Ayuda – información general': HelpCircle,
};

const DEFAULT_ICON = HelpCircle;

export function getCategoryIcon(iconLabel?: string | null): LucideIcon {
  if (!iconLabel) return DEFAULT_ICON;
  const trimmed = iconLabel.trim();
  return categoryIconByLabel[trimmed] ?? DEFAULT_ICON;
}

export const CATEGORY_ICON_LABELS = Object.keys(categoryIconByLabel);
