import { useRef, useState } from 'react';
import {
  Bot,
  Upload,
  FileText,
  Sparkles,
  Loader2,
  CornerDownLeft,
  Paperclip,
  X,
  AlertCircle,
  Wand2,
} from 'lucide-react';

interface AIIntakeAssistantProps {
  onParse: (text: string) => Promise<void>;
  isParsing: boolean;
  parseError: string | null;
  parsedFieldsCount: number | null;
}

export default function AIIntakeAssistant({
  onParse,
  isParsing,
  parseError,
  parsedFieldsCount,
}: AIIntakeAssistantProps) {
  const [pastedText, setPastedText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileRead = (file: File) => {
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setFileContent(String(reader.result || ''));
    };
    reader.readAsText(file);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileRead(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileRead(file);
  };

  const removeFile = () => {
    setUploadedFile(null);
    setFileContent('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleParse = async () => {
    const textToParse = pastedText || fileContent;
    if (!textToParse.trim()) return;
    await onParse(textToParse);
  };

  const canParse = (pastedText.trim() || fileContent.trim()) && !isParsing;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-slate-50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-sm">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">AI Complaint Intake Assistant</h2>
            <p className="text-xs text-slate-500">Powered by Groq + LangGraph (gemma2-9b-it)</p>
          </div>
        </div>
      </div>

      <div className="p-5 overflow-y-auto flex-1 space-y-5">
        {/* Upload Area */}
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
            Document Upload
          </p>
          {!uploadedFile ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200
                ${dragActive
                  ? 'border-indigo-400 bg-indigo-50 scale-[1.01]'
                  : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/50'}`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-indigo-500" />
                </div>
                <p className="text-sm font-medium text-slate-600">
                  Drop a file here or click to browse
                </p>
                <p className="text-xs text-slate-400">Supports .txt, .csv, .md</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.csv,.md,.json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3.5 bg-indigo-50 border border-indigo-100 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <FileText className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{uploadedFile.name}</p>
                <p className="text-xs text-slate-400">
                  {(uploadedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={removeFile}
                className="w-7 h-7 rounded-full hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          )}
        </div>

        {/* Paste Box */}
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
            Or Paste Complaint Text
          </p>
          <div className="relative">
            <textarea
              rows={6}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste raw complaint text here, e.g.&#10;&#10;Customer: Mercy Hospital&#10;Product: Paracetamol 500mg Tablets&#10;Batch: PCT-2024-887&#10;Mfg Date: 2024-01-15&#10;Expiry: 2026-01-14&#10;Quantity affected: 50 units&#10;Issue: tablets discolored and crumbling..."
              className="w-full px-3.5 py-3 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg
                resize-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30
                focus:border-indigo-500 focus:bg-white placeholder:text-slate-400"
            />
            {pastedText && (
              <span className="absolute bottom-3 right-3 text-xs text-slate-400">
                {pastedText.length} chars
              </span>
            )}
          </div>
        </div>

        {/* Error */}
        {parseError && (
          <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-rose-700">{parseError}</p>
          </div>
        )}

        {/* Success indicator */}
        {parsedFieldsCount != null && parsedFieldsCount > 0 && !parseError && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <p className="text-sm text-emerald-700">
              Filled {parsedFieldsCount} field{parsedFieldsCount === 1 ? '' : 's'} from complaint text
            </p>
          </div>
        )}
      </div>

      <div className="px-5 py-4 border-t border-slate-100 bg-slate-50">
        <button
          onClick={handleParse}
          disabled={!canParse}
          className="w-full flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white
            bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-lg transition-all shadow-sm
            hover:shadow-md hover:from-indigo-600 hover:to-indigo-800
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isParsing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              AI is parsing...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              Parse with AI
            </>
          )}
        </button>
        <div className="flex items-center justify-center gap-1.5 mt-2.5">
          {uploadedFile ? (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Paperclip className="w-3 h-3" />
              Will parse uploaded file
            </span>
          ) : pastedText ? (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <CornerDownLeft className="w-3 h-3" />
              Will parse pasted text
            </span>
          ) : (
            <span className="text-xs text-slate-400">Upload a file or paste text to begin</span>
          )}
        </div>
      </div>
    </div>
  );
}
