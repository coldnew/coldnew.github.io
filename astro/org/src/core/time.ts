/**
 * Time parsing utilities for org-mode timestamps and Hugo time formats
 */

export interface OrgTimestamp {
  type: 'active' | 'inactive';
  date: Date;
  endDate?: Date;
  repeat?: string;
  delay?: string;
}

export interface ParsedTimestamp {
  date: Date;
  endDate?: Date;
  type?: 'active' | 'inactive';
  repeat?: string;
  delay?: string;
}

/**
 * Regex pattern for org-mode timestamps
 * Matches: [<]YYYY-MM-DD( DDD)?( HH:MM)?(-HH:MM)? ( +Nd)?( -Nd)?[>]
 * Groups: 1:open, 2:date, 3:day, 4:startTime, 5:endTime, 6:repeat, 7:delay, 8:close
 */
const ORG_TIMESTAMP_REGEX =
  /^([<[])\s*(\d{4}-\d{2}-\d{2})(?:\s+(\w{3}))?(?:\s+(\d{2}:\d{2})(?:-(\d{2}:\d{2}))?)?(?:\s+(\+\d+[dwmy]))?(?:\s+(-\d+[dwmy]))?\s*([\]>])$/;

/**
 * Parse an org-mode timestamp string
 */
export function parseOrgTimestamp(timestampStr: string): OrgTimestamp | null {
  const match = timestampStr.match(ORG_TIMESTAMP_REGEX);
  if (!match) return null;

  const [
    ,
    openBracket,
    dateStr,
    _day,
    startTime,
    endTime,
    repeat,
    delay,
    closeBracket,
  ] = match;

  // Validate brackets match
  if (
    (openBracket === '<' && closeBracket !== '>') ||
    (openBracket === '[' && closeBracket !== ']')
  ) {
    return null;
  }

  const type: 'active' | 'inactive' =
    openBracket === '<' ? 'active' : 'inactive';

  // Parse date and time
  const date = parseDateTime(dateStr, startTime);
  if (!date) return null;

  let endDate: Date | undefined;
  if (endTime) {
    const parsedEnd = parseDateTime(dateStr, endTime);
    if (parsedEnd) {
      endDate = parsedEnd;
    }
  }

  return {
    type,
    date,
    endDate,
    repeat,
    delay,
  };
}

/**
 * Parse date and time strings into a Date object
 */
function parseDateTime(dateStr: string, timeStr?: string): Date | null {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return null;

  if (!timeStr) {
    // Date only
    return new Date(year, month - 1, day);
  }

  const [hour, minute] = timeStr.split(':').map(Number);
  if (hour === undefined || minute === undefined) return null;

  return new Date(year, month - 1, day, hour, minute);
}

/**
 * Parse a time string, trying org-mode format first, then Hugo format
 */
export function parseTime(timeStr: string): ParsedTimestamp | null {
  // Try org-mode first
  const orgResult = parseOrgTimestamp(timeStr);
  if (orgResult) {
    return {
      date: orgResult.date,
      endDate: orgResult.endDate,
      type: orgResult.type,
      repeat: orgResult.repeat,
      delay: orgResult.delay,
    };
  }

  // Try Hugo format
  const hugoResult = parseHugoTime(timeStr);
  if (hugoResult) {
    return { date: hugoResult };
  }

  return null;
}

/**
 * Parse Hugo time format (ISO 8601)
 */
export function parseHugoTime(timeStr: string): Date | null {
  try {
    const date = new Date(timeStr);
    // Check if valid date
    if (Number.isNaN(date.getTime())) return null;
    return date;
  } catch {
    return null;
  }
}

/**
 * Format a parsed timestamp back to ISO string for MDX frontmatter
 */
export function formatToISOString(timestamp: ParsedTimestamp): string {
  return timestamp.date.toISOString();
}

/**
 * Format a Date object as an org-mode timestamp string
 */
export function formatAsOrgTimestamp(
  date: Date,
  type: 'active' | 'inactive' = 'active'
): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const bracket = type === 'active' ? '<' : '[';
  const closeBracket = type === 'active' ? '>' : ']';

  // Include time if not midnight
  const hours = date.getHours();
  const minutes = date.getMinutes();
  if (hours === 0 && minutes === 0) {
    return `${bracket}${year}-${month}-${day}${closeBracket}`;
  } else {
    const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    return `${bracket}${year}-${month}-${day} ${timeStr}${closeBracket}`;
  }
}
