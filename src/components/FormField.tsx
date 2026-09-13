import { type ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: ReactNode;
  fullWidth?: boolean;
}

export default function FormField({ label, required, children, fullWidth }: FormFieldProps) {
  return (
    <div className={fullWidth ? 'col-span-1 sm:col-span-2' : ''}>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
