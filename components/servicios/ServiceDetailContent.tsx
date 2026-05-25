'use client';

import { X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import type { ServiceDetail } from '@/lib/academic-services/domain/service-detail';

import styles from '@/components/servicios/service-detail-content.module.css';

type Props = {
  detail: ServiceDetail;
  title: string;
  onClose: () => void;
};

export function ServiceDetailContent({ detail, title, onClose }: Props) {
  const tabGroups = useMemo(() => {
    const grouped = new Map<
      string,
      {
        id: string;
        label: string;
        blocks: ServiceDetail['requirementTabs'][number]['blocks'];
      }
    >();

    detail.requirementTabs.forEach((tab, index) => {
      const label = tab.tabName.replace(/\s+/g, ' ').trim() || `Modalidad ${index + 1}`;
      const key = normalizeName(label);
      const existing = grouped.get(key);
      if (existing) {
        existing.blocks.push(...tab.blocks);
        return;
      }

      grouped.set(key, {
        id: `${key || 'tab'}-${grouped.size}`,
        label,
        blocks: [...tab.blocks],
      });
    });

    return [...grouped.values()];
  }, [detail.requirementTabs]);

  const [activeDocsTab, setActiveDocsTab] = useState<string>(tabGroups[0]?.id ?? '');
  const [activeGuidesTab, setActiveGuidesTab] = useState<string>(tabGroups[0]?.id ?? '');
  useEffect(() => {
    if (!tabGroups.length) return;
    if (!tabGroups.some((tab) => tab.id === activeDocsTab)) {
      setActiveDocsTab(tabGroups[0].id);
    }
    if (!tabGroups.some((tab) => tab.id === activeGuidesTab)) {
      setActiveGuidesTab(tabGroups[0].id);
    }
  }, [activeDocsTab, activeGuidesTab, tabGroups]);

  const activeDocsTabData = tabGroups.find((tab) => tab.id === activeDocsTab) ?? tabGroups[0];
  const activeGuidesTabData = tabGroups.find((tab) => tab.id === activeGuidesTab) ?? tabGroups[0];
  const modalityText = detail.modality?.trim() || null;
  const levelText = detail.level?.trim() || null;
  const categoryName = detail.categoryName?.trim() || null;
  const datesText = detail.calendarText?.trim() || null;
  const requirements = detail.requirements.map((item) => item.text.trim()).filter(Boolean);
  const hasAnyGuides = tabGroups.some((tab) => tab.blocks.some((block) => block.guides.length > 0));
  const hasAnyDocumentation = tabGroups.some((tab) => tab.blocks.some((block) => block.items.length > 0));
  const requestWindow = extractRequestWindow(detail.calendarText);
  const footerStats = [
    detail.cost?.trim()
      ? { label: 'Costo', value: detail.cost.trim() }
      : null,
    detail.responseTime?.trim()
      ? { label: 'Tiempo de respuesta', value: detail.responseTime.trim() }
      : null,
    requestWindow
      ? { label: 'Plazo de solicitud', value: requestWindow }
      : null,
  ].filter((stat): stat is { label: string; value: string } => Boolean(stat));

  return (
    <div className={styles.modal}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Servicio académico · MP / MAD / TEC</p>
          <h1 className={styles.title}>{title}</h1>
          {categoryName ? <p className={styles.category}>{categoryName}</p> : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className={styles.closeBtn}
        >
          <X size={18} />
        </button>
      </div>

      <div className={styles.body}>
        {detail.description ? <p className={styles.description}>{detail.description}</p> : null}

        {modalityText || levelText ? (
          <div className={styles.metaRow}>
            {modalityText ? (
              <div>
                <p className={styles.metaLabel}>Modalidad</p>
                <p className={styles.metaValue}>{modalityText}</p>
              </div>
            ) : null}
            {modalityText && levelText ? <div className={styles.metaDivider} aria-hidden /> : null}
            {levelText ? (
              <div>
                <p className={styles.metaLabel}>Nivel</p>
                <p className={styles.metaValue}>{levelText}</p>
              </div>
            ) : null}
          </div>
        ) : null}

        {requirements.length > 0 ? (
          <div className={styles.section}>
            <p className={styles.sectionLabel}>Requisitos</p>
            <ul className={styles.ul}>
              {requirements.map((item, index) => (
                <li key={`${item}-${index}`} className={styles.li}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {datesText ? (
          <div className={styles.section}>
            <p className={styles.sectionLabel}>Fechas</p>
            <p className={styles.datesText}>{datesText}</p>
          </div>
        ) : null}

        {hasAnyDocumentation ? (
          <div className={styles.section}>
            <p className={styles.sectionLabel}>Documentación por modalidad</p>
            <div className={styles.tabBar} role="tablist" aria-label="Documentación por modalidad">
              {tabGroups.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeDocsTab === tab.id}
                  onClick={() => setActiveDocsTab(tab.id)}
                  className={`${styles.tabButton} ${activeDocsTab === tab.id ? styles.tabButtonActive : ''}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeDocsTabData ? (
              <div className={styles.tabContent}>
                {activeDocsTabData.blocks.some((block) => block.items.length > 0) ? (
                  activeDocsTabData.blocks.map((block, blockIndex) => (
                    <div key={`${activeDocsTabData.id}-${block.title ?? blockIndex}`} className={styles.group}>
                      {block.title ? <p className={styles.groupLabel}>{block.title}</p> : null}
                      {block.items.length > 0 ? (
                        <div className={styles.careerGrid}>
                          {block.items.map((item) =>
                            item.pdfUrl ? (
                              <a
                                key={`${item.text}-${item.sortOrder}`}
                                href={item.pdfUrl}
                                target="_blank"
                                rel="noreferrer"
                                className={styles.careerLink}
                              >
                                {cleanBullet(item.text)}
                              </a>
                            ) : (
                              <span key={`${item.text}-${item.sortOrder}`} className={styles.careerText}>
                                {cleanBullet(item.text)}
                              </span>
                            ),
                          )}
                        </div>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className={styles.pendingNote}>
                    No hay documentación publicada para esta modalidad.
                  </p>
                )}
              </div>
            ) : null}
          </div>
        ) : null}

        {hasAnyGuides ? (
          <div className={styles.section}>
            <p className={styles.sectionLabel}>Documento</p>
            <p className={styles.sectionSubLabel}>Guías por modalidad</p>
            <div className={styles.tabBar} role="tablist" aria-label="Guías por modalidad">
              {tabGroups.map((tab) => (
                <button
                  key={`guides-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={activeGuidesTab === tab.id}
                  onClick={() => setActiveGuidesTab(tab.id)}
                  className={`${styles.tabButton} ${activeGuidesTab === tab.id ? styles.tabButtonActive : ''}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeGuidesTabData ? (
              <div className={styles.tabContent}>
                {activeGuidesTabData.blocks.some((block) => block.guides.length > 0) ? (
                  activeGuidesTabData.blocks.map((block, blockIndex) => (
                    <div key={`guides-${activeGuidesTabData.id}-${block.title ?? blockIndex}`} className={styles.group}>
                      {block.title ? <p className={styles.groupLabel}>{block.title}</p> : null}
                      {block.guides.length > 0 ? (
                        <ul className={styles.guideList}>
                          {block.guides.map((guide) => (
                            <li key={`${guide.url}-${guide.sortOrder}`}>
                              <a
                                href={guide.url}
                                target="_blank"
                                rel="noreferrer"
                                className={styles.guideLink}
                              >
                                {guide.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className={styles.pendingNote}>
                    No hay guías publicadas para esta modalidad.
                  </p>
                )}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {footerStats.length > 0 ? (
        <div className={styles.footer}>
          <div className={styles.footerRow}>
            {footerStats.map((stat, index) => (
              <div key={stat.label} className={styles.footerStat}>
                {index > 0 ? <div className={styles.footerDivider} aria-hidden /> : null}
                <FooterStat label={stat.label} value={stat.value} />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FooterStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className={styles.metaLabel}>{label}</p>
      <p className={styles.metaValue}>{value}</p>
    </div>
  );
}

function extractRequestWindow(calendarText: string | null) {
  if (!calendarText) return null;

  const line = calendarText
    .split('\n')
    .map((row) => row.trim())
    .find((row) => /^solicitudes?/i.test(row));

  if (!line) return null;
  return line.replace(/^solicitudes?\s*:\s*/i, '');
}

function cleanBullet(text: string) {
  return text.replace(/^[\u2022\-]\s*/, '').trim();
}

function normalizeName(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}
