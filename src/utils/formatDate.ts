export function formatDate(
  value: string | null | undefined,
  locale: string = "uk-UA"
): string {
  if (!value) return "";

  let date: Date;

  const localizedDate = value.match(
    /^(\d{2})\.(\d{2})\.(\d{4})$/
  );

  if (localizedDate) {
    const [, day, month, year] = localizedDate;

    date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );

    if (
      date.getFullYear() !== Number(year) ||
      date.getMonth() !== Number(month) - 1 ||
      date.getDate() !== Number(day)
    ) {
      return "";
    }
  } else {
    date = new Date(value);
  }

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(locale);
}