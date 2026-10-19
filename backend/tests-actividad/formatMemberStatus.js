function formatMemberStatus(daysRemaining) {
  const remainingDays = Number(daysRemaining);

  if (daysRemaining === null || daysRemaining === undefined || Number.isNaN(remainingDays)) {
    return { label: 'Sin membresía', color: 'red' };
  }

  if (remainingDays > 5) return { label: 'Al día', color: 'green' };
  if (remainingDays >= 3 && remainingDays <= 5) return { label: '5-3 días', color: 'yellow' };
  if (remainingDays >= 1 && remainingDays <= 2) return { label: '2-1 días', color: 'orange' };
  return { label: 'Vencida', color: 'red' };
}

module.exports = { formatMemberStatus };