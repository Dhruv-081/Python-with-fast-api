import { useState, useCallback } from 'react';
import Header from '@/components/Header';
import ComplaintForm from '@/components/ComplaintForm';
import AIIntakeAssistant from '@/components/AIIntakeAssistant';
import { supabase } from '@/lib/supabase';
import { mergeParsedIntoForm, emptyFormData } from '@/lib/parsing';
import type { ComplaintFormData } from '@/types/complaint';

export default function App() {
  const [formData, setFormData] = useState<ComplaintFormData>(emptyFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedFieldsCount, setParsedFieldsCount] = useState<number | null>(null);
  const [savedCount, setSavedCount] = useState(0);

  const handleFieldChange = (field: keyof ComplaintFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSubmitSuccess(false);
  };

  const handleSubmit = async () => {
    if (!formData.customer_name.trim() || !formData.product_name.trim()) return;
    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      const { error } = await supabase.from('complaints').insert({
        customer_name: formData.customer_name,
        product_name: formData.product_name,
        batch_lot_number: formData.batch_lot_number || null,
        manufacturing_date: formData.manufacturing_date || null,
        expiry_date: formData.expiry_date || null,
        quantity_affected: formData.quantity_affected ? parseInt(formData.quantity_affected, 10) : null,
        complaint_type: formData.complaint_type || null,
        description: formData.description || null,
        severity: formData.severity || null,
        priority: formData.priority || null,
      });

      if (error) throw error;

      setSubmitSuccess(true);
      setSavedCount((c) => c + 1);
      setTimeout(() => {
        setFormData(emptyFormData);
        setSubmitSuccess(false);
      }, 1800);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save complaint';
      setParseError(`Save error: ${msg}`);
      setTimeout(() => setParseError(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(emptyFormData);
    setSubmitSuccess(false);
    setParseError(null);
    setParsedFieldsCount(null);
  };

  const handleParse = useCallback(async (text: string) => {
    setIsParsing(true);
    setParseError(null);
    setParsedFieldsCount(null);

    try {
      const response = await fetch('/api/parse-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => null);
        throw new Error(errBody?.detail || `Server returned ${response.status}`);
      }

        const data = await response.json();
        const parsed = data.parsed || data;

        // Direct mapping fallback patch:
        const normalizedParsed = {
          ...parsed,
          product_name: parsed.product_name || parsed.productName || parsed.product,
          quantity_affected: parsed.quantity_affected != null ? String(parsed.quantity_affected) : (parsed.quantity ? String(parsed.quantity) : null),
          batch_lot_number: parsed.batch_lot_number || parsed.batch_number,
        };

        setFormData((prev) => {
          const merged = mergeParsedIntoForm(prev, normalizedParsed);
          let count = 0;
          (Object.keys(merged) as (keyof ComplaintFormData)[]).forEach((key) => {
            if (merged[key] && merged[key] !== prev[key]) count++;
          });
          setParsedFieldsCount(count);
          return merged;
        });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to parse complaint text';
      setParseError(msg);
    } finally {
      setIsParsing(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Complaints', value: savedCount, color: 'text-slate-700', bg: 'bg-white' },
            { label: 'AI Parsed', value: parsedFieldsCount != null ? '1' : '0', color: 'text-indigo-600', bg: 'bg-white' },
            { label: 'Critical', value: '—', color: 'text-rose-600', bg: 'bg-white' },
            { label: 'System Status', value: 'Active', color: 'text-emerald-600', bg: 'bg-white' },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} rounded-lg border border-slate-200 px-4 py-3 shadow-sm`}>
              <p className="text-xs text-slate-500 mb-0.5">{stat.label}</p>
              <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <ComplaintForm
            formData={formData}
            onFieldChange={handleFieldChange}
            onSubmit={handleSubmit}
            onReset={handleReset}
            isSubmitting={isSubmitting}
            submitSuccess={submitSuccess}
          />
          <AIIntakeAssistant
            onParse={handleParse}
            isParsing={isParsing}
            parseError={parseError}
            parsedFieldsCount={parsedFieldsCount}
          />
        </div>
      </div>
    </div>
  );
}
