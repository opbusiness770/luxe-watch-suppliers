import {
  cloudinary,
} from "../lib/cloudinary.js";

const WATCH_IMAGE_DELIVERY_TYPE =
  "authenticated" as const;

export type WatchImageDeliveryData = {
  displayImageUrl:
    | string
    | null;

  displayImageUrls:
    string[];
};

/*
 * Generates a signed Cloudinary URL for
 * one authenticated watch image.
 *
 * The API secret remains only on the backend.
 */
export function createSignedWatchImageUrl(
  publicId: string,
): string | null {
  const normalizedPublicId =
    publicId.trim();

  if (!normalizedPublicId) {
    return null;
  }

  return cloudinary.url(
    normalizedPublicId,
    {
      resource_type:
        "image",

      type:
        WATCH_IMAGE_DELIVERY_TYPE,

      secure:
        true,

      sign_url:
        true,
    },
  );
}

/*
 * Converts stored watch images into URLs
 * that the browser can actually display.
 *
 * New Cloudinary images:
 * publicId -> signed authenticated URL
 *
 * Legacy images:
 * original URL is kept as-is.
 *
 * Array order is preserved.
 */
export function createWatchDeliveryUrls(
  imageUrls: string[],
  imagePublicIds: string[],
): string[] {
  return imageUrls.map(
    (
      originalUrl,
      index,
    ) => {
      const publicId =
        imagePublicIds[
          index
        ]?.trim();

      if (!publicId) {
        return originalUrl;
      }

      return (
        createSignedWatchImageUrl(
          publicId,
        ) ??
        originalUrl
      );
    },
  );
}

/*
 * Creates the image information that should
 * be returned to the frontend.
 *
 * The stored imageUrls remain untouched.
 *
 * displayImageUrls contains the safe delivery
 * URLs that React should use for rendering.
 */
export function createWatchImageDeliveryData(
  imageUrl:
    | string
    | null,

  imageUrls: string[],

  imagePublicIds: string[],
): WatchImageDeliveryData {
  /*
   * New watches use imageUrls.
   *
   * imageUrl is kept as a fallback for older
   * records created before the gallery existed.
   */
  const storedImages =
    imageUrls.length > 0
      ? imageUrls
      : imageUrl
        ? [
            imageUrl,
          ]
        : [];

  const publicIds =
    imageUrls.length > 0
      ? imagePublicIds
      : storedImages.map(
          () => "",
        );

  const displayImageUrls =
    createWatchDeliveryUrls(
      storedImages,
      publicIds,
    );

  return {
    displayImageUrl:
      displayImageUrls[
        0
      ] ??
      null,

    displayImageUrls,
  };
}