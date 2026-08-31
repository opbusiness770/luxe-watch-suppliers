export class HttpError extends Error {
  status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name = "HttpError";
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers =
    new Headers(options.headers);

  if (
    options.body &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  const response = await fetch(path, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    const message =
      data &&
      typeof data.message === "string"
        ? data.message
        : "אירעה שגיאה בתקשורת עם השרת";

    throw new HttpError(
      message,
      response.status,
    );
  }

  return data as T;
}