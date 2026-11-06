import { OrderStatus, PaymentMethod, ProductCategory, UnitOfMeasure } from '../types';

export function formatBRL(value: number): string {
  if (isNaN(value) || value === null || value === undefined) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'America/Sao_Paulo',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatTime(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatPhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; border: string; step: number }
> = {
  recebido: {
    label: 'Recebido',
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/30',
    step: 1,
  },
  em_preparo: {
    label: 'Em Preparo',
    color: 'text-orange-400',
    bg: 'bg-orange-500/15',
    border: 'border-orange-500/30',
    step: 2,
  },
  pronto: {
    label: 'Pronto / Aguardando',
    color: 'text-blue-400',
    bg: 'bg-blue-500/15',
    border: 'border-blue-500/30',
    step: 3,
  },
  saiu_entrega: {
    label: 'Saiu para Entrega',
    color: 'text-purple-400',
    bg: 'bg-purple-500/15',
    border: 'border-purple-500/30',
    step: 4,
  },
  entregue: {
    label: 'Concluído',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/30',
    step: 5,
  },
  cancelado: {
    label: 'Cancelado',
    color: 'text-red-400',
    bg: 'bg-red-500/15',
    border: 'border-red-500/30',
    step: 0,
  },
};

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  hamburgueres: 'Hambúrgueres Artesanais',
  combos: 'Combos & Promoções',
  porcoes: 'Porções & Batatas',
  bebidas: 'Bebidas & Sucos',
  sobremesas: 'Sobremesas',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: 'PIX (Imediato)',
  credito: 'Cartão de Crédito',
  debito: 'Cartão de Débito',
  dinheiro: 'Dinheiro em Espécie',
};

export const UNIT_LABELS: Record<UnitOfMeasure, string> = {
  un: 'Unidade(s)',
  kg: 'Quilograma (kg)',
  g: 'Gramas (g)',
  l: 'Litros (L)',
  ml: 'Mililitros (ml)',
  pct: 'Pacote(s)',
};

export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]): void {
  const processCell = (cell: string | number) => {
    let str = cell === null || cell === undefined ? '' : String(cell);
    str = str.replace(/"/g, '""');
    if (str.search(/("|,|\n)/g) >= 0) {
      str = `"${str}"`;
    }
    return str;
  };

  const csvContent =
    '\uFEFF' + // UTF-8 BOM
    headers.map(processCell).join(';') +
    '\n' +
    rows.map((row) => row.map(processCell).join(';')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
