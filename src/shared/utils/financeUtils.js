// Utilidades para el módulo financiero

// Constantes
export const MONTHS = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' }
];

export const PAYMENT_STATUS = {
  PAID: 'PAGADO',
  PENDING: 'PENDIENTE',
  OVERDUE: 'VENCIDA'
};

// Generar años disponibles
export const generateYears = (startYear = 2020, yearsCount = 11) => {
  return Array.from({ length: yearsCount }, (_, i) => startYear + i);
};

// Obtener etiqueta del mes
export const getMonthLabel = (monthNumber) => {
  const month = MONTHS.find(m => m.value === monthNumber);
  return month ? month.label : monthNumber.toString();
};

// Alternar estado de pago
export const getToggleStatus = (currentStatus) => {
  return currentStatus === PAYMENT_STATUS.PAID 
    ? PAYMENT_STATUS.PENDING 
    : PAYMENT_STATUS.PAID;
};

// Obtener clases CSS para el estado
export const getStatusClass = (status) => {
  const statusClasses = {
    [PAYMENT_STATUS.PAID]: 'bg-green-100 text-green-800 hover:bg-green-200',
    [PAYMENT_STATUS.OVERDUE]: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
    [PAYMENT_STATUS.PENDING]: 'bg-red-100 text-red-800 hover:bg-red-200'
  };
  
  return statusClasses[status] || statusClasses[PAYMENT_STATUS.PENDING];
};

// Obtener título del botón
export const getButtonTitle = (status) => {
  return status === PAYMENT_STATUS.PAID 
    ? 'Cambiar a Pendiente' 
    : 'Cambiar a Pagado';
};

// Formatear valor monetario
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount || 0);
};

// Validar datos de mensualidad
export const validateMensualidadData = (data) => {
  const errors = {};

  if (!data.participant_id) {
    errors.participant_id = 'Participante es requerido';
  }

  if (!data.valor || isNaN(data.valor) || data.valor <= 0) {
    errors.valor = 'Valor debe ser un número mayor a 0';
  }

  if (!data.mes || data.mes < 1 || data.mes > 12) {
    errors.mes = 'Mes debe estar entre 1 y 12';
  }

  if (!data.año || data.año < 2020 || data.año > new Date().getFullYear() + 1) {
    errors.año = 'Año no válido';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Calcular estadísticas de pagos
export const calculatePaymentStats = (mensualidades) => {
  const total = mensualidades.length;
  const paid = mensualidades.filter(m => m.status === PAYMENT_STATUS.PAID).length;
  const pending = mensualidades.filter(m => m.status === PAYMENT_STATUS.PENDING).length;
  const overdue = mensualidades.filter(m => m.status === PAYMENT_STATUS.OVERDUE).length;
  
  const totalAmount = mensualidades.reduce((sum, m) => sum + (m.valor || 0), 0);
  const paidAmount = mensualidades
    .filter(m => m.status === PAYMENT_STATUS.PAID)
    .reduce((sum, m) => sum + (m.valor || 0), 0);

  return {
    total,
    paid,
    pending,
    overdue,
    totalAmount,
    paidAmount,
    pendingAmount: totalAmount - paidAmount,
    paymentRate: total > 0 ? (paid / total) * 100 : 0
  };
};
