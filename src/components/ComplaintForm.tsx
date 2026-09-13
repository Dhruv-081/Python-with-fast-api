import {
  ClipboardList,
  Calendar,
  Hash,
  Package,
  AlertTriangle,
  Flag,
  User,
  FileText,
  Boxes,
  Save,
  Loader2,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { type ReactNode } from 'react';
import FormField from './FormField';
import type { ComplaintFormData } from '@/types/complaint';
import { COMPLAINT_TYPES, SEVERITY_LEVELS, PRIORITY_LEVELS } from '@/types/complaint';

interface ComplaintFormProps {
  formData: ComplaintFormData;
  onFieldChange: (field: keyof ComplaintFormData, value: string) => void;
  onSubmit: () => void;
  onReset: () => void;
  isSubmitting: boolean;
  submitSuccess: boolean;
}

const inputClass =
  'w-full px-3.5 py-2.5 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg ' +
  'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 ' +
  'focus:bg-white placeholder:text-slate-400';

function IconWrapper({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center gap-1.5">{children}</span>;
}

export default function ComplaintForm({
  formData,
  onFieldChange,
  onSubmit,
  onReset,
  isSubmitting,
  submitSuccess,
}: ComplaintFormProps) {
  const isFormValid = formData.customer_name.trim() && formData.product_name.trim();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Log Customer Complaint</h2>
            <p className="text-xs text-slate-500">Record a new quality complaint entry</p>
          </div>
        </div>
      </div>

      <div className="p-5 overflow-y-auto flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Customer Name" required>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={formData.customer_name}
                onChange={(e) => onFieldChange('customer_name', e.target.value)}
                placeholder="e.g., City Medical Center"
                className={inputClass + ' pl-9'}
              />
            </div>
          </FormField>

          <FormField label="Product Name" required>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={formData.product_name}
                onChange={(e) => onFieldChange('product_name', e.target.value)}
                placeholder="e.g., Amoxicillin 500mg"
                className={inputClass + ' pl-9'}
              />
            </div>
          </FormField>

          <FormField label="Batch/Lot Number">
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={formData.batch_lot_number}
                onChange={(e) => onFieldChange('batch_lot_number', e.target.value)}
                placeholder="e.g., AMX2024-0042"
                className={inputClass + ' pl-9'}
              />
            </div>
          </FormField>

          <FormField label="Quantity Affected">
            <div className="relative">
              <Boxes className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="number"
                min="0"
                value={formData.quantity_affected}
                onChange={(e) => onFieldChange('quantity_affected', e.target.value)}
                placeholder="e.g., 120"
                className={inputClass + ' pl-9'}
              />
            </div>
          </FormField>

          <FormField label="Manufacturing Date">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={formData.manufacturing_date}
                onChange={(e) => onFieldChange('manufacturing_date', e.target.value)}
                className={inputClass + ' pl-9'}
              />
            </div>
          </FormField>

          <FormField label="Expiry Date">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => onFieldChange('expiry_date', e.target.value)}
                className={inputClass + ' pl-9'}
              />
            </div>
          </FormField>

          <FormField label="Complaint Type">
            <select
              value={formData.complaint_type}
              onChange={(e) => onFieldChange('complaint_type', e.target.value)}
              className={inputClass + ' appearance-none cursor-pointer'}
            >
              <option value="">Select type...</option>
              {COMPLAINT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Severity">
            <div className="relative">
              <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={formData.severity}
                onChange={(e) => onFieldChange('severity', e.target.value)}
                className={inputClass + ' pl-9 appearance-none cursor-pointer'}
              >
                <option value="">Select severity...</option>
                {SEVERITY_LEVELS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </FormField>

          <FormField label="Priority">
            <div className="relative">
              <Flag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={formData.priority}
                onChange={(e) => onFieldChange('priority', e.target.value)}
                className={inputClass + ' pl-9 appearance-none cursor-pointer'}
              >
                <option value="">Select priority...</option>
                {PRIORITY_LEVELS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </FormField>

          <FormField label="Description" fullWidth>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => onFieldChange('description', e.target.value)}
                placeholder="Detailed description of the complaint..."
                className={inputClass + ' pl-9 resize-none'}
              />
            </div>
          </FormField>
        </div>
      </div>

      <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
        <button
          onClick={onReset}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800
            bg-white border border-slate-200 rounded-lg transition-all hover:bg-slate-50
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <IconWrapper>
            <RotateCcw className="w-4 h-4" />
            Reset
          </IconWrapper>
        </button>

        {submitSuccess ? (
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
            Complaint Saved
          </div>
        ) : (
          <button
            onClick={onSubmit}
            disabled={isSubmitting || !isFormValid}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white
              bg-gradient-to-r from-teal-600 to-cyan-700 rounded-lg transition-all shadow-sm
              hover:shadow-md hover:from-teal-700 hover:to-cyan-800
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm"
          >
            {isSubmitting ? (
              <IconWrapper>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </IconWrapper>
            ) : (
              <IconWrapper>
                <Save className="w-4 h-4" />
                Save Complaint
              </IconWrapper>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
