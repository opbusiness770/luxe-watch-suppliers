import {
  cloudinary,
} from "../lib/cloudinary.js";

const WATCH_IMAGES_FOLDER =
  "luxe-watch-suppliers/watches";

const WATCH_IMAGE_DELIVERY_TYPE =
  "authenticated" as const;

/*
 * Creates the signed parameters required
 * for a direct browser upload to Cloudinary.
 *
 * Watch images are uploaded using the
 * "authenticated" delivery type so they
 * cannot be publicly accessed with a normal
 * Cloudinary URL.
 */
export function createWatchUploadSignature() {
  const timestamp =
    Math.floor(
      Date.now() / 1000,
    );

  const apiSecret =
    process.env.CLOUDINARY_API_SECRET;

  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME;

  const apiKey =
    process.env.CLOUDINARY_API_KEY;

  if (
    !apiSecret ||
    !cloudName ||
    !apiKey
  ) {
    throw new Error(
      "Cloudinary environment variables are missing",
    );
  }

  /*
   * Every upload parameter sent by the browser
   * must match the parameters used here when
   * creating the signature.
   *
   * Therefore "type: authenticated" is included
   * in the signed payload.
   */
  const signature =
    cloudinary.utils.api_sign_request(
      {
        timestamp,

        folder:
          WATCH_IMAGES_FOLDER,

        type:
          WATCH_IMAGE_DELIVERY_TYPE,
      },
      apiSecret,
    );

  return {
    timestamp,

    signature,

    folder:
      WATCH_IMAGES_FOLDER,

    deliveryType:
      WATCH_IMAGE_DELIVERY_TYPE,

    cloudName,

    apiKey,
  };
}