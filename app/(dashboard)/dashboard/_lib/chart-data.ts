export interface ChartDay {
  label: string;
  fullDate: string;
  count: number;
  isToday: boolean;
}

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function buildLast7Days(
  movimentacoes: { created_at: string }[],
  referenceDate = new Date()
): ChartDay[] {
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  const days: ChartDay[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const key = date.toISOString().slice(0, 10);

    days.push({
      label: i === 0 ? 'Hoje' : DAY_NAMES[date.getDay()],
      fullDate: key,
      count: 0,
      isToday: i === 0
    });
  }

  for (const movimentacao of movimentacoes) {
    const key = movimentacao.created_at.slice(0, 10);
    const day = days.find((item) => item.fullDate === key);

    if (day) {
      day.count++;
    }
  }

  return days;
}
