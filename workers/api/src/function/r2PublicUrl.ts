export type R2ImageUrls = {
  imageUrl1: string | null;
  imageUrl2: string | null;
};

const absoluteUrlPattern = /^https?:\/\//i;

const normalizeImageKey = (value: string | null | undefined): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

export const buildR2PublicObjectUrl = (
  objectKey: string | null | undefined,
  publicBaseUrl: string | null | undefined
): string | null => {
  const normalizedKey = normalizeImageKey(objectKey);
  if (!normalizedKey) {
    return null;
  }

  if (absoluteUrlPattern.test(normalizedKey)) {
    return normalizedKey;
  }

  const normalizedBaseUrl = publicBaseUrl?.trim().replace(/\/+$/, "");
  const keyWithoutLeadingSlash = normalizedKey.replace(/^\/+/, "");

  return normalizedBaseUrl
    ? `${normalizedBaseUrl}/${keyWithoutLeadingSlash}`
    : keyWithoutLeadingSlash;
};

export const buildR2ImageUrls = (
  imageUrl1: string | null | undefined,
  imageUrl2: string | null | undefined,
  publicBaseUrl: string | null | undefined
): R2ImageUrls => ({
  imageUrl1: buildR2PublicObjectUrl(imageUrl1, publicBaseUrl),
  imageUrl2: buildR2PublicObjectUrl(imageUrl2, publicBaseUrl)
});
