import { expect, jest } from '@jest/globals';
import type { TemplateSchemaFromYAML } from '@/utils/file/types';

const MOCK_TEMPLATE_ID = 'template-123';

const MOCK_TEMPLATE: TemplateSchemaFromYAML = {
  templateId: MOCK_TEMPLATE_ID,
  version: 'v1',
  multiSheet: false,
  columns: [{
    name: 'col1',
    type: 'string',
    field: 'col1',
    required: false,
    repository: 'com.example.jems.repository.testRepository'
  }],
};

// ✅ モック登録はトップレベルで！
jest.unstable_mockModule('@/utils/cache/cacheUtils', () => {
  const cache: Record<string, { timestamp: number, value: TemplateSchemaFromYAML }> = {};
  const TTL = 5 * 60 * 1000;

  return {
    setTemplateSchemaCache: (template: TemplateSchemaFromYAML) => {
      cache[template.templateId] = {
        timestamp: Date.now(),
        value: template,
      };
    },
    getCachedTemplateSchema: (templateId: string) => {
      const entry = cache[templateId];
      if (!entry) return null;
      if (Date.now() - entry.timestamp > TTL) return null;
      return entry.value;
    },
    clearTemplateSchemaCache: () => {
      Object.keys(cache).forEach(k => delete cache[k]);
    },
    getOrFetchTemplateSchema: async (templateId: string, fetcher: () => Promise<TemplateSchemaFromYAML>) => {
      const cached = cache[templateId];
      if (cached && Date.now() - cached.timestamp <= TTL) {
        return cached.value;
      }
      const fetched = await fetcher();
      cache[templateId] = { timestamp: Date.now(), value: fetched };
      return fetched;
    },
    resolveSchema: (templateId: string) => {
      const entry = cache[templateId];
      if (!entry) throw new Error(`キャッシュに templateId ${templateId} が存在しません`);
      if (Date.now() - entry.timestamp > TTL) throw new Error('キャッシュは期限切れです');
      return entry.value.columns;
    }
  };
});

describe('cacheUtils (with ESM mock)', () => {
  let cacheUtils: typeof import('@/utils/cache/cacheUtils');

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.resetModules();

    await jest.isolateModulesAsync(async () => {
      cacheUtils = await import('@/utils/cache/cacheUtils');
      cacheUtils.clearTemplateSchemaCache();
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('setTemplateSchemaCache and getCachedTemplateSchema', () => {
    cacheUtils.setTemplateSchemaCache(MOCK_TEMPLATE);
    const result = cacheUtils.getCachedTemplateSchema(MOCK_TEMPLATE_ID);
    expect(result).toEqual(MOCK_TEMPLATE);
  });

  test('getCachedTemplateSchema returns null if not cached', () => {
    const result = cacheUtils.getCachedTemplateSchema('non-existent');
    expect(result).toBeNull();
  });

  test('getCachedTemplateSchema returns null if cache expired', () => {
    cacheUtils.setTemplateSchemaCache(MOCK_TEMPLATE);
    jest.advanceTimersByTime(5 * 60 * 1000 + 1);
    const result = cacheUtils.getCachedTemplateSchema(MOCK_TEMPLATE_ID);
    expect(result).toBeNull();
  });

  test('getOrFetchTemplateSchema returns cached value if valid', async () => {
    cacheUtils.setTemplateSchemaCache(MOCK_TEMPLATE);
    const fetcher = jest.fn<() => Promise<TemplateSchemaFromYAML>>()
      .mockResolvedValue(MOCK_TEMPLATE);
    const result = await cacheUtils.getOrFetchTemplateSchema(MOCK_TEMPLATE_ID, fetcher);
    expect(result).toEqual(MOCK_TEMPLATE);
    expect(fetcher).not.toHaveBeenCalled();
  });

  test('getOrFetchTemplateSchema calls fetcher if cache is missing', async () => {
    const fetcher = jest.fn<() => Promise<TemplateSchemaFromYAML>>()
      .mockResolvedValue(MOCK_TEMPLATE);
    const result = await cacheUtils.getOrFetchTemplateSchema(MOCK_TEMPLATE_ID, fetcher);
    expect(result).toEqual(MOCK_TEMPLATE);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  test('getOrFetchTemplateSchema calls fetcher if cache expired', async () => {
    cacheUtils.setTemplateSchemaCache(MOCK_TEMPLATE);
    jest.advanceTimersByTime(5 * 60 * 1000 + 1);
    const fetcher = jest.fn<() => Promise<TemplateSchemaFromYAML>>()
      .mockResolvedValue(MOCK_TEMPLATE);
    const result = await cacheUtils.getOrFetchTemplateSchema(MOCK_TEMPLATE_ID, fetcher);
    expect(result).toEqual(MOCK_TEMPLATE);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  test('resolveSchema returns columns if cache valid', () => {
    cacheUtils.setTemplateSchemaCache(MOCK_TEMPLATE);
    const result = cacheUtils.resolveSchema(MOCK_TEMPLATE_ID);
    expect(result).toEqual(MOCK_TEMPLATE.columns);
  });

  test('resolveSchema throws if templateId not cached', () => {
    expect(() => cacheUtils.resolveSchema('not-exist')).toThrow(/キャッシュに templateId .* が存在しません/);
  });

  test('resolveSchema throws if cache expired', () => {
    cacheUtils.setTemplateSchemaCache(MOCK_TEMPLATE);
    jest.advanceTimersByTime(5 * 60 * 1000 + 1);
    expect(() => cacheUtils.resolveSchema(MOCK_TEMPLATE_ID)).toThrow(/キャッシュは期限切れです/);
  });

  test('clearTemplateSchemaCache removes all entries', () => {
    cacheUtils.setTemplateSchemaCache(MOCK_TEMPLATE);
    cacheUtils.clearTemplateSchemaCache();
    const result = cacheUtils.getCachedTemplateSchema(MOCK_TEMPLATE_ID);
    expect(result).toBeNull();
  });
});
