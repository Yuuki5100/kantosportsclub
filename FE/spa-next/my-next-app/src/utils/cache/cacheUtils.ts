// cacheUtils.ts
import { CachedTemplate } from "@/utils/cache/type";
import {
  HeaderDefinition,
  TemplateSchemaFromYAML,
  ColumnSchema,
} from "@/utils/file";
import { getMessage, MessageCodes } from "@/message";

const templateCache: Map<string, CachedTemplate> = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

export const setTemplateSchemaCache = (template: TemplateSchemaFromYAML): void => {
  templateCache.set(template.templateId, {
    data: template,
    timestamp: Date.now(),
  });
};

export const getOrFetchTemplateSchema = async (
  templateId: string,
  fetcher: () => Promise<TemplateSchemaFromYAML>
): Promise<TemplateSchemaFromYAML> => {
  const cached = getCachedTemplateSchema(templateId);
  if (cached) return cached;

  const fetched = await fetcher();
  setTemplateSchemaCache(fetched);
  return fetched;
};

export const clearTemplateSchemaCache = (): void => {
  templateCache.clear();
};

export const getCachedTemplateSchema = (templateId: string): TemplateSchemaFromYAML | null => {
  const cached = templateCache.get(templateId);
  if (!cached) return null;

  const now = Date.now();
  const isExpired = now - cached.timestamp > CACHE_TTL_MS;

  if (isExpired) {
    templateCache.delete(templateId);
    return null;
  }

  return cached.data;
};

/**
 * Template ID に応じた schema を解決（HeaderDefinition[] を返す）
 */
export const resolveSchema = (templateId: string): HeaderDefinition[] => {
  const cached = templateCache.get(templateId);
  if (!cached) throw new Error(getMessage(MessageCodes.CACHE_TEMPLATE_NOT_FOUND));

  const now = Date.now();
  const isExpired = now - cached.timestamp > CACHE_TTL_MS;

  if (isExpired) {
    templateCache.delete(templateId);
    throw new Error(getMessage(MessageCodes.CACHE_EXPIRED));
  }

  const data = cached.data as TemplateSchemaFromYAML;

  // ✅ v1構造の判定（columns が存在しており、かつ中身が1つ以上ある場合）
  if (Array.isArray(data.columns) && data.columns.length > 0) {
    return convertToHeaderDefinitions(data.columns);
  }

  // ✅ v2構造の判定（sheets が存在しており、かつ columns あり）
  if (Array.isArray(data.sheets)) {
    const firstSheet = data.sheets[0];
    if (firstSheet?.columns?.length) {
      return convertToHeaderDefinitions(firstSheet.columns);
    } else {
      throw new Error(getMessage(MessageCodes.TEMPLATE_SHEETS_COLUMNS_EMPTY));
    }
  }

  throw new Error(getMessage(MessageCodes.TEMPLATE_UNKNOWN_FORMAT));
};


/**
 * ColumnSchema[] → HeaderDefinition[] に変換
 */
export const convertToHeaderDefinitions = (columns: ColumnSchema[]): HeaderDefinition[] => {
  return columns.map((col): HeaderDefinition => ({
    field: col.field,
    name: col.name,
    required: col.required,
    type: col.type ?? 'string',
    repository: col.repository,
    pattern: col.pattern,
    validationMessage: col.validationMessage,
    enumValues:
      typeof col.enumValues === 'string'
        ? col.enumValues.split(',').map((v) => v.trim())
        : Array.isArray(col.enumValues)
          ? col.enumValues
          : undefined,
  }));
};
