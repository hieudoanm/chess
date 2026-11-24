import robots from '../robots';

describe('robots', () => {
  it('returns correct rules', () => {
    const result = robots();
    const rules = result.rules as { userAgent: string; allow: string }[];
    expect(rules).toHaveLength(1);
    expect(rules[0].userAgent).toBe('*');
    expect(rules[0].allow).toBe('/');
  });

  it('returns sitemap URL', () => {
    const result = robots();
    expect(result.sitemap).toBe(
      'https://hieudoanm.github.io/chess/sitemap.xml'
    );
  });
});
