export function formatDay(dateString: string) {
  const date = new Date(dateString);
  let formattedDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
  }).format(date);

  formattedDate = formattedDate.replace(',', '');
  return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
}
export function formatDate(dateString: string) {
  let day = '';
  const date = new Date(dateString);
  const today = new Date();
  let formattedDate = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
  }).format(date);

  formattedDate = formattedDate.replace(',', '');
  if (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  ) {
    day = 'Hari ini';
  } else {
    day = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  }
  return day;
}

export function formatDateNoCheck(dateString: string) {
  let day = '';
  const date = new Date(dateString);
  const today = new Date();
  let formattedDate = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
  }).format(date);

  formattedDate = formattedDate.replace(',', '');

  return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
}

export function formatYear(dateString: string) {
  const date = new Date(dateString);
  let formattedDate = new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
  }).format(date);

  formattedDate = formattedDate.replace(',', '');
  return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
}

export function formatDateDiff(date: string): string {
  const now: number = Date.now();

  const timestamp: number = new Date(date).getTime();

  if (isNaN(timestamp)) {
    throw new Error('Invalid date string');
  }

  const nowDate = new Date(now);
  const pastDate = new Date(timestamp);

  let years = nowDate.getFullYear() - pastDate.getFullYear();
  let months = nowDate.getMonth() - pastDate.getMonth();
  let days = nowDate.getDate() - pastDate.getDate();

  if (days < 0) {
    months -= 1;
    days += new Date(nowDate.getFullYear(), nowDate.getMonth(), 0).getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  let result = '';
  if (years > 0) result += `${years} tahun `;
  if (months > 0) result += `${months} bulan `;
  if (days > 0) result += `${days} hari`;

  return result.trim() || 'Hari ini';
}
