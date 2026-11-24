import { getTemplates, saveTemplate, deleteTemplate } from '@/lib/templates';

describe('templates', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns an empty list when nothing is stored', () => {
    expect(getTemplates()).toEqual([]);
  });

  it('returns an empty list for corrupted storage', () => {
    window.localStorage.setItem('tourney-templates', '{not json');
    expect(getTemplates()).toEqual([]);
  });

  it('returns an empty list when storage holds a non-array', () => {
    window.localStorage.setItem('tourney-templates', '{"foo": 1}');
    expect(getTemplates()).toEqual([]);
  });

  it('saves a template and prepends it', () => {
    const created = saveTemplate({
      name: 'Cup',
      description: 'Knockout',
      format: 'single-elimination',
      maxParticipants: 16,
    });

    expect(created.id).toBeTruthy();
    expect(created.createdAt).toBeTruthy();
    const templates = getTemplates();
    expect(templates).toHaveLength(1);
    expect(templates[0].name).toBe('Cup');
    expect(templates[0].format).toBe('single-elimination');
    expect(templates[0].maxParticipants).toBe(16);
  });

  it('deletes a template by id', () => {
    const first = saveTemplate({
      name: 'Cup',
      description: '',
      format: 'round-robin',
      maxParticipants: 8,
    });
    saveTemplate({
      name: 'League',
      description: '',
      format: 'league',
      maxParticipants: 32,
    });

    const remaining = deleteTemplate(first.id);
    expect(remaining.map((t) => t.name)).toEqual(['League']);
    expect(getTemplates()).toHaveLength(1);
  });
});
