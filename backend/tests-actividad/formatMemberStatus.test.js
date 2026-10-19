const { formatMemberStatus } = require('./formatMemberStatus');

describe('formatMemberStatus - Cobertura de sentencia y decisión', () => {
  test('TS-01/TD-01: null retorna "Sin membresía" (D1 verdadero)', () => {
    expect(formatMemberStatus(null)).toEqual({ label: 'Sin membresía', color: 'red' });
  });

  test('TS-02/TD-02: 8 días retorna "Al día" (D2 verdadero)', () => {
    expect(formatMemberStatus(8)).toEqual({ label: 'Al día', color: 'green' });
  });

  test('TS-03/TD-03: 4 días retorna "5-3 días" (D3 verdadero)', () => {
    expect(formatMemberStatus(4)).toEqual({ label: '5-3 días', color: 'yellow' });
  });

  test('TS-04/TD-04: 1 día retorna "2-1 días" (D4 verdadero)', () => {
    expect(formatMemberStatus(1)).toEqual({ label: '2-1 días', color: 'orange' });
  });

  test('TS-05/TD-05: 0 días retorna "Vencida" (D4 falso, última rama)', () => {
    expect(formatMemberStatus(0)).toEqual({ label: 'Vencida', color: 'red' });
  });

  test('TC-02: undefined activa la segunda condición atómica de D1', () => {
    expect(formatMemberStatus(undefined)).toEqual({ label: 'Sin membresía', color: 'red' });
  });

  test('TC-03: valor no numérico activa Number.isNaN en D1', () => {
    expect(formatMemberStatus('abc')).toEqual({ label: 'Sin membresía', color: 'red' });
  });
});