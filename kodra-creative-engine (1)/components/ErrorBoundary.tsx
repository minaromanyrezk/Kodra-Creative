
import React, { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { KodraIcon } from "./KodraIcon";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans" dir="rtl">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/30 rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <KodraIcon icon={AlertTriangle} size={32} strokeWidth={2} />
            </div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-2">عذراً، حدث خطأ غير متوقع</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed text-sm">
              واجه نظام "كودرا" مشكلة تقنية مفاجئة. تم تأمين بياناتك، ولكننا بحاجة لإعادة تحميل الواجهة.
            </p>
            <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-xl mb-6 text-left overflow-auto max-h-32 text-[10px] font-mono text-red-500 border border-slate-200 dark:border-slate-800" dir="ltr">
                {this.state.error?.message}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
            >
              <KodraIcon icon={RefreshCcw} size={18} /> إعادة تحميل النظام
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
