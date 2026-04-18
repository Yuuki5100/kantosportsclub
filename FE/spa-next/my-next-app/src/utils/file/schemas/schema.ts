import { ColumnSchema, TemplateSchemaFromYAML, TemplateSheetSchema } from '@/utils/file/types';
import { getMessage, MessageCodes } from '@/message';

export const parseTemplateSchema = (
  key: string,
  yamlData: TemplateSchemaFromYAML
): TemplateSchemaFromYAML => {
  if (!yamlData || typeof yamlData !== 'object') {
    throw new Error(getMessage(MessageCodes.INVALID_YAML_DATA));
  }

  return {
    templateId: yamlData.templateId,
    version: yamlData.version,
    multiSheet: false,
    sheets:
      Array.isArray(yamlData.sheets) && yamlData.sheets.length > 0
        ? yamlData.sheets.map((sheet: unknown) => {
            const s = sheet as TemplateSheetSchema;
            return {
              sheetName: s.sheetName || 'Sheet',
              columns: Array.isArray(s.columns)
                ? s.columns.map((col: unknown) => {
                    const c = col as ColumnSchema;
                    return {
                      field: c.field,
                      name: c.name,
                      required: c.required ?? false,
                      type: c.type,
                      repository: c.repository,
                      entity: c.entity,
                      maxLength: typeof c.maxLength === 'number' ? c.maxLength : undefined,
                      pattern: typeof c.pattern === 'string' ? c.pattern : undefined,
                      validationMessage: c.validationMessage,
                      enumValues: Array.isArray(c.enumValues)
                        ? c.enumValues
                        : undefined, // 文字列は不正なので弾く
                    };
                  })
                : [],
            };
          })
        : Array.isArray(yamlData.columns)
          ? [
              {
                sheetName: 'Sheet1',
                columns: yamlData.columns.map((col: unknown) => {
                  const c = col as ColumnSchema;
                  return {
                    field: c.field,
                    name: c.name,
                    required: c.required ?? false,
                    type: c.type,
                    repository: c.repository,
                    entity: c.entity,
                    maxLength: typeof c.maxLength === 'number' ? c.maxLength : undefined,
                    pattern: typeof c.pattern === 'string' ? c.pattern : undefined,
                    validationMessage: c.validationMessage,
                    enumValues: Array.isArray(c.enumValues)
                      ? c.enumValues
                      : undefined, // ← ここも同様に配列のみ許可
                  };
                }),
              },
            ]
          : [],
  };
};
