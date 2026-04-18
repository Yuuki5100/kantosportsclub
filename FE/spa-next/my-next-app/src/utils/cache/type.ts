import { TemplateSchemaFromYAML } from "@/utils/file";

// キャッシュテンプレートのレスポンスタイプ
export type CachedTemplate = {
  data: TemplateSchemaFromYAML;
  timestamp: number;
};
