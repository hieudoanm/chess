export const DOC_SECTIONS: { id: string; label: string }[] = [
  { id: 'getting-started', label: 'Getting started' },
  { id: 'concepts', label: 'Concepts' },
  { id: 'api-reference', label: 'API reference' },
  { id: 'guides', label: 'Guides' },
  { id: 'deployment', label: 'Deployment' },
];

export const sectionLabel = (id: string): string => {
  return DOC_SECTIONS.find((s) => s.id === id)?.label ?? id;
};
