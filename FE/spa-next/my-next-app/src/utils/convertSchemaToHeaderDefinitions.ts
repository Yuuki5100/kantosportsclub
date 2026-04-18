import { HeaderDefinition, TemplateSchemaFromYAML } from '@/utils/file';

export function convertSchemaToHeaderDefinitions(
  template: TemplateSchemaFromYAML
): HeaderDefinition[] {
  const result: HeaderDefinition[] = [];

  // v2構造（複数シート）
  if (template.multiSheet && template.sheets?.length) {
    for (const sheet of template.sheets) {
      for (const col of sheet.columns) {
        result.push({
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
          sheetName: sheet.sheetName, // ✅ シート名を埋め込む
        });
      }
    }
  } else if (template.columns?.length) {
    // v1構造（単一シート）
    for (const col of template.columns) {
      result.push({
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
        // sheetName: undefined（← 単一シート扱い）
      });
    }
  }

  return result;
}
