const ISRAEL_TIME_ZONE =
  "Asia/Jerusalem";

type ZonedDateTimeParts = {
  year: number;
  month: number;
  day: number;

  hour: number;
  minute: number;
  second: number;
};

const israelDateTimeFormatter =
  new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone:
        ISRAEL_TIME_ZONE,

      year:
        "numeric",

      month:
        "2-digit",

      day:
        "2-digit",

      hour:
        "2-digit",

      minute:
        "2-digit",

      second:
        "2-digit",

      hourCycle:
        "h23",
    },
  );

function getIsraelDateTimeParts(
  date: Date,
): ZonedDateTimeParts {
  const parts =
    israelDateTimeFormatter.formatToParts(
      date,
    );

  const values =
    Object.fromEntries(
      parts.map(
        (part) => [
          part.type,
          part.value,
        ],
      ),
    );

  return {
    year:
      Number(
        values.year,
      ),

    month:
      Number(
        values.month,
      ),

    day:
      Number(
        values.day,
      ),

    hour:
      Number(
        values.hour,
      ),

    minute:
      Number(
        values.minute,
      ),

    second:
      Number(
        values.second,
      ),
  };
}

/*
 * Returns the UTC offset of Israel for
 * a specific instant.
 *
 * This automatically respects daylight
 * saving time.
 */
function getIsraelOffsetMilliseconds(
  date: Date,
): number {
  const parts =
    getIsraelDateTimeParts(
      date,
    );

  const representedAsUtc =
    Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    );

  return (
    representedAsUtc -
    date.getTime()
  );
}

/*
 * Converts a date/time expressed in Israel
 * local time into the corresponding UTC Date.
 */
function israelLocalDateTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
): Date {
  const localTimestamp =
    Date.UTC(
      year,
      month - 1,
      day,
      hour,
      minute,
      second,
    );

  let candidate =
    new Date(
      localTimestamp,
    );

  let offset =
    getIsraelOffsetMilliseconds(
      candidate,
    );

  candidate =
    new Date(
      localTimestamp -
        offset,
    );

  /*
   * Recalculate once because the first guess
   * may cross a daylight-saving boundary.
   */
  const correctedOffset =
    getIsraelOffsetMilliseconds(
      candidate,
    );

  if (
    correctedOffset !==
    offset
  ) {
    offset =
      correctedOffset;

    candidate =
      new Date(
        localTimestamp -
          offset,
      );
  }

  return candidate;
}

/*
 * Returns the exact UTC range corresponding
 * to the current calendar month in Israel.
 *
 * Example:
 * 01/09/2026 00:00 Israel
 * becomes the appropriate UTC instant,
 * rather than 01/09/2026 00:00 UTC.
 */
export function getCurrentIsraelMonthRange(): {
  startOfMonth: Date;
  startOfNextMonth: Date;
} {
  const now =
    new Date();

  const israelNow =
    getIsraelDateTimeParts(
      now,
    );

  const startOfMonth =
    israelLocalDateTimeToUtc(
      israelNow.year,
      israelNow.month,
      1,
    );

  let nextMonth =
    israelNow.month +
    1;

  let nextYear =
    israelNow.year;

  if (
    nextMonth ===
    13
  ) {
    nextMonth =
      1;

    nextYear +=
      1;
  }

  const startOfNextMonth =
    israelLocalDateTimeToUtc(
      nextYear,
      nextMonth,
      1,
    );

  return {
    startOfMonth,
    startOfNextMonth,
  };
}