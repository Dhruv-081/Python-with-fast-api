import { ShieldCheck } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-600 to-cyan-700 flex items-center justify-center shadow-sm">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-800 leading-tight">PharmaQA</h1>
          <p className="text-xs text-slate-500">Quality Assurance Complaint Management</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          System Active
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600">
            QA
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-slate-700">Dhruv Choudhary</p>
            <p className="text-xs text-slate-400">Quality Assurance</p>
          </div>
        </div>
      </div>
    </header>
  );
}
