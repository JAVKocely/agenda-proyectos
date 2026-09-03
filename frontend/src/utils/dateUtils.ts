export function formatDate(dateString?: string | null): string {
  if (!dateString) return 'Sin fecha';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return 'Fecha inválida';
  }
}

export function getDaysRemaining(targetDateStr?: string | null): {
  days: number;
  isOverdue: boolean;
  label: string;
} {
  if (!targetDateStr) {
    return { days: 0, isOverdue: false, label: 'Sin límite' };
  }

  try {
    const target = new Date(targetDateStr);
    const now = new Date();
    // Normalizar a medianoche
    target.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        days: Math.abs(diffDays),
        isOverdue: true,
        label: `Venció hace ${Math.abs(diffDays)} d`,
      };
    } else if (diffDays === 0) {
      return {
        days: 0,
        isOverdue: false,
        label: 'Vence hoy',
      };
    } else {
      return {
        days: diffDays,
        isOverdue: false,
        label: `${diffDays} d restantes`,
      };
    }
  } catch {
    return { days: 0, isOverdue: false, label: 'Fecha inválida' };
  }
}
