export type WatchUploadSignature = {
  timestamp: number;

  signature: string;

  folder: string;

  deliveryType:
    "authenticated";

  cloudName: string;

  apiKey: string;
};

export type UploadedWatchImage = {
  url: string;

  publicId: string;
};

type CloudinaryUploadResponse = {
  secure_url?: string;

  public_id?: string;

  error?: {
    message?: string;
  };
};

const MAX_CONCURRENT_UPLOADS =
  3;

/*
 * Requests a signed upload configuration
 * from our backend.
 *
 * The Cloudinary API secret never reaches
 * the browser.
 */
export async function getWatchUploadSignature(
  signal?: AbortSignal,
): Promise<WatchUploadSignature> {
  const response =
    await fetch(
      "/api/admin/uploads/signature",
      {
        method:
          "POST",

        credentials:
          "include",

        signal,
      },
    );

  const data =
    (await response.json()) as
      | WatchUploadSignature
      | {
          message?: string;
        };

  if (!response.ok) {
    const message =
      "message" in data
        ? data.message
        : undefined;

    throw new Error(
      message ||
        "לא ניתן להכין את העלאת התמונות",
    );
  }

  if (
    !(
      "timestamp" in data
    ) ||
    !(
      "signature" in data
    ) ||
    !(
      "folder" in data
    ) ||
    !(
      "deliveryType" in data
    ) ||
    !(
      "cloudName" in data
    ) ||
    !(
      "apiKey" in data
    )
  ) {
    throw new Error(
      "התקבלה תשובה לא תקינה מהשרת",
    );
  }

  if (
    data.deliveryType !==
    "authenticated"
  ) {
    throw new Error(
      "הגדרת פרטיות התמונות אינה תקינה",
    );
  }

  return data;
}

/*
 * Uploads one watch image directly
 * from the browser to Cloudinary.
 *
 * The file never passes through our
 * Express server.
 */
async function uploadSingleWatchImage(
  file: File,

  uploadSignature:
    WatchUploadSignature,

  signal?: AbortSignal,
): Promise<UploadedWatchImage> {
  const formData =
    new FormData();

  formData.append(
    "file",
    file,
  );

  formData.append(
    "api_key",
    uploadSignature.apiKey,
  );

  formData.append(
    "timestamp",
    String(
      uploadSignature.timestamp,
    ),
  );

  formData.append(
    "signature",
    uploadSignature.signature,
  );

  formData.append(
    "folder",
    uploadSignature.folder,
  );

  /*
   * IMPORTANT:
   *
   * This must exactly match the delivery type
   * included when the backend created the
   * Cloudinary signature.
   */
  formData.append(
    "type",
    uploadSignature.deliveryType,
  );

  const uploadUrl =
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(
      uploadSignature.cloudName,
    )}/image/upload`;

  const response =
    await fetch(
      uploadUrl,
      {
        method:
          "POST",

        body:
          formData,

        signal,
      },
    );

  const data =
    (await response.json()) as
      CloudinaryUploadResponse;

  if (!response.ok) {
    throw new Error(
      data.error?.message ||
        `לא ניתן להעלות את התמונה "${file.name}"`,
    );
  }

  if (
    !data.secure_url ||
    !data.public_id
  ) {
    throw new Error(
      `Cloudinary לא החזיר נתוני תמונה תקינים עבור "${file.name}"`,
    );
  }

  return {
    url:
      data.secure_url,

    publicId:
      data.public_id,
  };
}

/*
 * Uploads multiple watch images.
 *
 * A maximum of three images are uploaded
 * simultaneously to keep memory and network
 * usage reasonable.
 *
 * The original file order is preserved.
 */
export async function uploadWatchImages(
  files: File[],

  signal?: AbortSignal,
): Promise<UploadedWatchImage[]> {
  if (
    files.length ===
    0
  ) {
    return [];
  }

  if (
    files.length >
    10
  ) {
    throw new Error(
      "ניתן להעלות עד 10 תמונות לכל שעון",
    );
  }

  const uploadSignature =
    await getWatchUploadSignature(
      signal,
    );

  const results =
    new Array<UploadedWatchImage>(
      files.length,
    );

  let nextIndex =
    0;

  async function uploadWorker() {
    while (true) {
      const currentIndex =
        nextIndex;

      nextIndex +=
        1;

      if (
        currentIndex >=
        files.length
      ) {
        return;
      }

      results[
        currentIndex
      ] =
        await uploadSingleWatchImage(
          files[
            currentIndex
          ],

          uploadSignature,

          signal,
        );
    }
  }

  const workerCount =
    Math.min(
      MAX_CONCURRENT_UPLOADS,
      files.length,
    );

  await Promise.all(
    Array.from(
      {
        length:
          workerCount,
      },
      () =>
        uploadWorker(),
    ),
  );

  return results;
}