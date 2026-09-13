import type { ComplaintFormData, ComplaintType, Severity, Priority } from '@/types/complaint';
import { COMPLAINT_TYPES, SEVERITY_LEVELS, PRIORITY_LEVELS, emptyFormData } from '@/types/complaint';

interface ParsedComplaint {
  customer_name?: string;
  product_name?: string;
  batch_lot_number?: string;
  manufacturing_date?: string;
  expiry_date?: string;
  quantity_affected?: number | string;
  complaint_type?: string;
  description?: string;
  severity?: string;
  priority?: string;
}

function normalizeEnum<T extends string>(value: string | undefined, options: readonly T[]): T | '' {
  if (!value) return '';
  const lower = value.toLowerCase().trim();
  const match = options.find((opt) => opt.toLowerCase() === lower);
  if (match) return match;
  const partial = options.find((opt) => opt.toLowerCase().includes(lower) || lower.includes(opt.toLowerCase()));
  return partial ?? '';
}

function normalizeDate(value: string | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

export function mapParsedToForm(parsed: ParsedComplaint): ComplaintFormData {
  return {
    customer_name: parsed.customer_name ?? '',
    product_name: parsed.product_name ?? '',
    batch_lot_number: parsed.batch_lot_number ?? '',
    manufacturing_date: normalizeDate(parsed.manufacturing_date),
    expiry_date: normalizeDate(parsed.expiry_date),
    quantity_affected: parsed.quantity_affected != null ? String(parsed.quantity_affected) : '',
    complaint_type: normalizeEnum(parsed.complaint_type, COMPLAINT_TYPES),
    description: parsed.description ?? '',
    severity: normalizeEnum(parsed.severity, SEVERITY_LEVELS),
    priority: normalizeEnum(parsed.priority, PRIORITY_LEVELS),
  };
}

export function mergeParsedIntoForm(current: ComplaintFormData, parsed: ParsedComplaint): ComplaintFormData {
  const mapped = mapParsedToForm(parsed);
  return {
    customer_name: mapped.customer_name || current.customer_name,
    product_name: mapped.product_name || current.product_name,
    batch_lot_number: mapped.batch_lot_number || current.batch_lot_number,
    manufacturing_date: mapped.manufacturing_date || current.manufacturing_date,
    expiry_date: mapped.expiry_date || current.expiry_date,
    quantity_affected: mapped.quantity_affected || current.quantity_affected,
    complaint_type: mapped.complaint_type || current.complaint_type,
    description: mapped.description || current.description,
    severity: mapped.severity || current.severity,
    priority: mapped.priority || current.priority,
  };
}

export { emptyFormData };
