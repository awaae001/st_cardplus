const DEFAULT_LOCALE = 'zh-CN';
export function now(): Date {
  return new Date();
}

export function nowIso(): string {
  return now().toISOString();
}

export function toDateSafe(input: string | number | Date | null | undefined): Date | null {
  if (input === null || input === undefined || input === '') {
    return null;
  }
  const date = input instanceof Date ? input : new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(
  input: string | number | Date | null | undefined,
  locale = DEFAULT_LOCALE,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' }
): string {
  const date = toDateSafe(input);
  if (!date) return '';
  return date.toLocaleDateString(locale, options);
}

export function formatDateTime(
  input: string | number | Date | null | undefined,
  locale = DEFAULT_LOCALE,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }
): string {
  const date = toDateSafe(input);
  if (!date) return '';
  return date.toLocaleString(locale, options);
}

export function formatRelative(
  input: string | number | Date | null | undefined,
  nowDate = now(),
  locale = DEFAULT_LOCALE
): string {
  const date = toDateSafe(input);
  if (!date) return '';

  const diffMs = date.getTime() - nowDate.getTime();
  const diffAbsSeconds = Math.abs(Math.round(diffMs / 1000));
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffAbsSeconds < 60) return rtf.format(Math.round(diffMs / 1000), 'second');

  const diffAbsMinutes = Math.abs(Math.round(diffMs / 60000));
  if (diffAbsMinutes < 60) return rtf.format(Math.round(diffMs / 60000), 'minute');

  const diffAbsHours = Math.abs(Math.round(diffMs / 3600000));
  if (diffAbsHours < 24) return rtf.format(Math.round(diffMs / 3600000), 'hour');

  const diffAbsDays = Math.abs(Math.round(diffMs / 86400000));
  if (diffAbsDays < 30) return rtf.format(Math.round(diffMs / 86400000), 'day');

  const diffAbsMonths = Math.abs(Math.round(diffMs / (86400000 * 30)));
  if (diffAbsMonths < 12) return rtf.format(Math.round(diffMs / (86400000 * 30)), 'month');

  return rtf.format(Math.round(diffMs / (86400000 * 365)), 'year');
}
