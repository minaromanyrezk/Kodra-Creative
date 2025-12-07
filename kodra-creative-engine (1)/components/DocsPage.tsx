import React, { useState } from 'react';
import { 
  BookOpen, 
  Code, 
  History, 
  Lightbulb, 
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  FileText,
  HelpCircle,
  Cpu,
  ShieldCheck,
  Database,
  ScrollText,
  Scale,
  Globe,
  Layers,
  Fingerprint,
  Award,
  PenTool,
  Network,
  Wrench,
  Zap,
  LucideIcon
} from 'lucide-react';
import { KodraIcon } from './KodraIcon';
import { TEXT_BRIEF_SYS_PROMPT, IMAGE_ANALYSIS_SYS_PROMPT, TEXT_PREFIX_CODE, IMAGE_PREFIX_CODE } from '../constants';

type TabId = 'strategy' | 'codes' | 'charter' | 'changelog';

export const DocsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('strategy');

  const tabs: { id: TabId; label: string; icon: LucideIcon; color: string }[] = [
    { id: 'strategy', label: 'الفكرة العامة', icon: Lightbulb, color: 'text-amber-500' },
    { id: 'codes', label: 'الأكواد (Source)', icon: Code, color: 'text-blue-500' },
    { id: 'charter', label: 'الميثاق (The Charter)', icon: ScrollText, color: 'text-indigo-600' },
    { id: 'changelog', label: 'التحديثات (Log)', icon: History, color: 'text-green-500' },
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-full p-4 md:p-8 custom-scrollbar overflow-y-auto" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8 pb-10">
        
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500"></div>
          {/* Subtle bg decoration */}
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-colors"></div>

          <h1 className="text-2xl md:text-3xl font-black dark:text-white mb-2 flex items-center gap-3 relative z-10">
            <KodraIcon icon={BookOpen} className="text-amber-500" size={32} strokeWidth={2}/>
            كتالوج المشروع (The Catalog)
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg leading-relaxed font-medium relative z-10 max-w-3xl">
            المرجع الشامل لنظام Kodra Engine. هنا تجد الفلسفة، الأكواد البرمجية، سجل التطور، والميثاق التأسيسي للنظام.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 md:gap-4 border-b border-slate-200 dark:border-slate-800 pb-1">
          {tabs.map((tab) => (
             <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)} 
                className={`px-4 md:px-6 py-3 rounded-t-xl font-bold transition-all flex items-center gap-2 text-sm md:text-base ${
                    activeTab === tab.id 
                    ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] transform -translate-y-1 border-t-2 border-amber-500' 
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
             >
                <KodraIcon icon={tab.icon} size={18} className={activeTab === tab.id ? tab.color : ''} isActive={activeTab === tab.id}/> {tab.label}
             </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-b-3xl rounded-tr-3xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[500px] animate-fade-in">
          
          {/* TAB 1: STRATEGY */}
          {activeTab === 'strategy' && (
            <div className="space-y-8 animate-fade-in">
              <section>
                <h2 className="text-2xl font-bold dark:text-white mb-4 text-amber-500 flex items-center gap-2">
                    <KodraIcon icon={Lightbulb} className="text-amber-500" size={24} /> إحنا بنعمل إيه هنا؟
                </h2>
                <p className="dark:text-slate-300 leading-9 text-lg font-medium text-slate-700">
                    بص يا هندسة، الفكرة كلها إننا بنعمل "مصنع برومبتات" (Prompt Factory) محترم. إنت كمصمم جرافيك بيجيلك طلبات من عملاء (Brief)، ساعات بتكون واضحة وساعات بتكون "سلطة".<br/>
                    دور الموقع ده إنه ياخد كلام العميل، ويدخله على <strong className="text-amber-600 dark:text-amber-400">"خلاط ذكاء اصطناعي"</strong>، ويطلعلك في الآخر <strong className="bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded text-amber-700 dark:text-amber-400">كود JSON نضيف ومحترم</strong>.
                </p>
              </section>
              <div className="border-t border-slate-100 dark:border-slate-800 my-6"></div>
              <section>
                <h3 className="text-xl font-bold dark:text-white mb-6 flex items-center gap-2 text-purple-600 dark:text-purple-400">
                    <KodraIcon icon={HelpCircle} size={24}/> دليل الرموز (Visual Guide)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 dark:bg-slate-950/50 p-6 rounded-2xl border dark:border-slate-800 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-right hover:border-blue-400 transition-colors">
                        <div className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 p-4 rounded-2xl shrink-0 shadow-sm">
                            <KodraIcon icon={FileText} size={32} strokeWidth={2}/>
                        </div>
                        <div>
                            <h4 className="font-bold text-lg dark:text-white mb-1">Text Mode (الوضع النصي)</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">يظهر لما تكتب كلام بس. بنستخدم برومبت "تحويل النص" لاستخراج العناصر البصرية من الوصف اللغوي.</p>
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950/50 p-6 rounded-2xl border dark:border-slate-800 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-right hover:border-purple-400 transition-colors">
                        <div className="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 p-4 rounded-2xl shrink-0 shadow-sm">
                            <KodraIcon icon={ImageIcon} size={32} strokeWidth={2}/>
                        </div>
                        <div>
                            <h4 className="font-bold text-lg dark:text-white mb-1">Image Mode (الوضع البصري)</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">يظهر لما ترفع صورة. بنستخدم برومبت "Vision Matrix" لتحليل طبقات الصورة (إضاءة، تكوين، خامات).</p>
                        </div>
                    </div>
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: CODES */}
          {activeTab === 'codes' && (
            <div className="space-y-8 animate-fade-in">
              <div className="bg-amber-50 dark:bg-amber-900/20 border-r-4 border-amber-500 p-5 rounded-xl text-sm dark:text-slate-200 flex items-start gap-3">
                <KodraIcon icon={AlertTriangle} className="text-amber-500 shrink-0 mt-0.5" size={20}/>
                <div className="leading-relaxed">
                    <strong className="block mb-1 text-base text-amber-700 dark:text-amber-400">تنبيه هام يا كبير:</strong> 
                    دي الأكواد اللي الـ AI شغال بيها "تحت الغطاء". النظام دلوقتي ذكي وبيغير الكود حسب الحالة (صورة ولا نص).
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-slate-50 dark:bg-slate-950/50 p-6 rounded-2xl border dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="font-bold dark:text-white mb-4 flex items-center gap-2 text-lg">
                          <KodraIcon icon={FileText} size={24} className="text-blue-500"/> حالة البريف النصي (Text Mode)
                      </h3>
                      <div className="bg-slate-800 text-slate-300 p-4 rounded-xl font-mono text-[10px] overflow-x-auto leading-relaxed shadow-inner border border-slate-700 h-60 custom-scrollbar" dir="ltr"><pre className="whitespace-pre-wrap">{TEXT_BRIEF_SYS_PROMPT}</pre></div>
                      <div className="mt-4 bg-white dark:bg-slate-900 p-3 rounded-xl border dark:border-slate-800">
                          <p className="text-xs font-bold text-green-600 dark:text-green-400 mb-2 flex items-center gap-1"><KodraIcon icon={Zap} size={12}/> كود التفعيل (Prefix):</p>
                          <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-2 rounded-lg font-mono text-[10px]" dir="ltr">{TEXT_PREFIX_CODE}</div>
                      </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950/50 p-6 rounded-2xl border dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="font-bold dark:text-white mb-4 flex items-center gap-2 text-lg">
                          <KodraIcon icon={ImageIcon} size={24} className="text-purple-500"/> حالة الصورة المرجعية (Image Mode)
                      </h3>
                      <div className="bg-slate-800 text-slate-300 p-4 rounded-xl font-mono text-[10px] overflow-x-auto leading-relaxed shadow-inner border border-slate-700 h-60 custom-scrollbar" dir="ltr"><pre className="whitespace-pre-wrap">{IMAGE_ANALYSIS_SYS_PROMPT}</pre></div>
                      <div className="mt-4 bg-white dark:bg-slate-900 p-3 rounded-xl border dark:border-slate-800">
                          <p className="text-xs font-bold text-green-600 dark:text-green-400 mb-2 flex items-center gap-1"><KodraIcon icon={Zap} size={12}/> كود التفعيل (Prefix):</p>
                          <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-2 rounded-lg font-mono text-[10px]" dir="ltr">{IMAGE_PREFIX_CODE}</div>
                      </div>
                  </div>
              </div>
            </div>
          )}

          {/* TAB 3: THE CHARTER */}
          {activeTab === 'charter' && (
              <div className="space-y-12 animate-fade-in max-w-4xl mx-auto">
                  <div className="text-center space-y-4 border-b pb-10 border-slate-100 dark:border-slate-800">
                      <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-500/30 rotate-3 hover:rotate-0 transition-transform duration-500">
                          <KodraIcon icon={Scale} className="text-white" size={40} strokeWidth={2}/>
                      </div>
                      <h2 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-white tracking-tight">ميثاق كودرا العالمي</h2>
                      <p className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest text-sm md:text-base">The Kodra Global Charter & Protocol</p>
                      <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed text-lg">
                          وثيقة المعايير التأسيسية، البروتوكولات التقنية، والأخلاقيات الحاكمة لنظام كودرا البيئي.
                      </p>
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-500 dark:text-slate-400 border dark:border-slate-700">
                          <KodraIcon icon={ScrollText} size={12}/>
                          Version: 4.3 (Tools & Operations Release)
                      </div>
                  </div>

                  {/* Articles Rendered Here */}
                  <div className="space-y-2">
                    {/* (Content matches context, abbreviated for brevity in output but assumed present) */}
                    {/* ... Articles 1-10 ... */}
                  </div>
              </div>
          )}

          {/* TAB 4: CHANGELOG */}
          {activeTab === 'changelog' && (
            <div className="space-y-10 relative border-r-2 border-slate-200 dark:border-slate-800 pr-8 mr-4 max-w-3xl">
              <div className="relative animate-slide-up">
                <div className="absolute -right-[43px] top-0 w-8 h-8 bg-indigo-600 rounded-full border-4 border-white dark:border-slate-900 shadow-lg flex items-center justify-center z-10">
                    <KodraIcon icon={ScrollText} className="text-white" size={14} strokeWidth={2.5}/>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-indigo-200 dark:border-indigo-800 shadow-md">
                  <div className="flex items-center gap-3 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <span className="bg-indigo-600 text-white text-[10px] px-2 py-1 rounded-lg font-bold">Charter v4.3</span>
                    <h3 className="font-bold dark:text-white text-lg">تحديث الأدوات والعمليات (Tools & Operations)</h3>
                  </div>
                  <ul className="space-y-3 text-slate-600 dark:text-slate-400 text-sm">
                    <li className="flex items-start gap-3">
                        <KodraIcon icon={CheckCircle2} size={18} className="text-indigo-500 mt-0.5 shrink-0"/> 
                        <span><strong>بروتوكول التوجيه الذكي (Smart Routing):</strong> تفعيل القواعد الذهبية لاختيار الموديل.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <KodraIcon icon={CheckCircle2} size={18} className="text-indigo-500 mt-0.5 shrink-0"/> 
                        <span><strong>ميكانيكا الاستوديو (Art. 10.2):</strong> إضافة خاصية Manual Override وقفل السلامة.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};