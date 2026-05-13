import { Hono } from "hono";
import { type AppVariables, type Bindings } from "../env";

export const filesRoutes = new Hono<{
  Bindings: Bindings;
  Variables: AppVariables;
}>();

type UploadedFileResponse = {
  fileId: string;
  originalName: string;
};

const normalizeResourceType = (value: unknown): string => {
  if (typeof value !== "string") {
    return "USER";
  }

  const trimmed = value.trim();
  return trimmed ? trimmed.toUpperCase() : "USER";
};

const sanitizeFileName = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "file";
  }

  return trimmed.replace(/[\\/\u0000-\u001f]+/g, "_");
};

const buildFilePrefix = (resourceType: string, mypagePrefix: string | undefined): string => {
  if (resourceType === "MYPAGE") {
    return mypagePrefix?.trim() || "kantosportsclub/mypage";
  }

  return `kantosportsclub/${resourceType.toLowerCase()}`;
};

const isFile = (value: unknown): value is File =>
  typeof value === "object" && value !== null && value instanceof File;

filesRoutes.post("/files/upload", async (c) => {
  const formData = await c.req.formData().catch(() => null);
  if (!formData) {
    return c.json(
      {
        error: {
          code: "BAD_REQUEST",
          message: "multipart/form-data is required"
        },
        requestId: c.get("requestId")
      },
      400
    );
  }

  const fileEntry = formData.get("file");
  if (!isFile(fileEntry)) {
    return c.json(
      {
        error: {
          code: "BAD_REQUEST",
          message: "file is required"
        },
        requestId: c.get("requestId")
      },
      400
    );
  }

  const resourceType = normalizeResourceType(formData.get("resourceType"));
  const originalName = fileEntry.name || "file";
  const safeName = sanitizeFileName(originalName);
  const filePrefix = buildFilePrefix(resourceType, c.env.FILE_STORAGE_PREFIX_MYPAGE);
  const fileId = `${filePrefix}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;

  const body = await fileEntry.arrayBuffer();

  await c.env.FILE_STORAGE_BUCKET.put(fileId, body, {
    httpMetadata: {
      contentType: fileEntry.type || "application/octet-stream",
      contentDisposition: `inline; filename="${safeName}"`
    }
  });

  const response: UploadedFileResponse = {
    fileId,
    originalName
  };

  return c.json({
    success: true,
    data: response,
    error: null
  });
});
