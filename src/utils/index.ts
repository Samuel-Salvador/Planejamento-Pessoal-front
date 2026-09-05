import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DecodedToken } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  // Handle ISO string or YYYY-MM-DD correcting timezone offset
  const parts = dateString.split('T')[0].split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  }
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR').format(date);
}

export function decodeJWT(token: string): DecodedToken | null {
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return null;
    const jsonPayload = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Erro ao decodificar token JWT:', error);
    return null;
  }
}

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
