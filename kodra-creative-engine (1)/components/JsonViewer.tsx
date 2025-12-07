
import React, { useState } from 'react';
import { SCHEMA_TOOLTIPS } from '../constants';
import { Info, Copy, Check, ChevronRight, ChevronDown } from 'lucide-react';
import { KodraIcon } from './KodraIcon';

interface JsonViewerProps {
  json: unknown;
}

const JsonNode: React.FC<{ name?: string; value: unknown; isLast: boolean; depth: number }> = ({ name, value, isLast, depth }) => {
  const [collapsed, setCollapsed] = useState(false);
  
  const isObject = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);
  
  // Safe casting after type check
  const objValue = isObject ? (value as Record<string, unknown> | unknown[]) : null;
  const isEmpty = isObject && objValue && Object.keys(objValue).length === 0;

  const paddingLeft = `${depth * 1.5}rem`;

  const renderKey = () => {
    if (name === undefined) return null;
    const description = SCHEMA_TOOLTIPS[name];
    
    return (
      <span className="text-sky-400 mr-2 relative group cursor-help inline-flex items-center">
        "{name}":
        {description && (
           <div className="absolute left-full top-0 ml-2 z-50 w-64 p-3 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-700 whitespace-normal text-right backdrop-blur-sm" dir="rtl">
             <div className="font-bold mb-1 flex items-center gap-1.5 text-amber-400">
                <KodraIcon icon={Info} size={12}/> {name}
             </div>
             {description}
           </div>
        )}
      </span>
    );
  };

  if (!isObject || !objValue) {
    let colorClass = 'text-slate-400';
    if (typeof value === 'string') colorClass = 'text-emerald-400';
    else if (typeof value === 'number') colorClass = 'text-amber-400';
    else if (typeof value === 'boolean' || value === null) colorClass = 'text-purple-400';

    const displayValue = typeof value === 'string' ? `"${value}"` : String(value);

    return (
      <div className="font-mono text-xs md:text-sm leading-7 hover:bg-white/5 rounded px-1 transition-colors flex items-center" style={{ paddingLeft }}>
        {renderKey()}
        <span className={colorClass}>{displayValue}</span>
        {!isLast && <span className="text-slate-500">,</span>}
      </div>
    );
  }

  const openBracket = isArray ? '[' : '{';
  const closeBracket = isArray ? ']' : '}';
  const itemCount = Object.keys(objValue).length;

  return (
    <div className="font-mono text-xs md:text-sm leading-7">
      <div className="hover:bg-white/5 rounded px-1 flex items-center transition-colors select-none" style={{ paddingLeft }}>
        {!isEmpty && (
            <button 
                onClick={() => setCollapsed(!collapsed)}
                className="mr-1 text-slate-500 hover:text-white focus:outline-none transition-colors"
                aria-label={collapsed ? "Expand" : "Collapse"}
            >
                {collapsed ? <KodraIcon icon={ChevronRight} size={14}/> : <KodraIcon icon={ChevronDown} size={14}/>}
            </button>
        )}
        {isEmpty && <span className="w-[14px] mr-1 inline-block"></span>}

        {renderKey()}
        <span className="text-yellow-500">{openBracket}</span>
        
        {collapsed && !isEmpty && (
           <span 
             className="text-slate-500 mx-2 cursor-pointer hover:text-slate-300 select-none text-[10px] bg-white/5 px-2 rounded-full" 
             onClick={() => setCollapsed(false)}
           >
             ... {itemCount} items
           </span>
        )}
        
        {(collapsed || isEmpty) && (
            <span>
                <span className="text-yellow-500">{closeBracket}</span>
                {!isLast && <span className="text-slate-500">,</span>}
            </span>
        )}
      </div>

      {!collapsed && !isEmpty && (
        <div className="animate-fade-in border-l border-white/5 ml-1">
          {Object.entries(objValue).map(([key, val], index, arr) => (
            <JsonNode 
                key={key} 
                name={isArray ? undefined : key} 
                value={val} 
                isLast={index === arr.length - 1} 
                depth={depth + 1} 
            />
          ))}
          <div className="hover:bg-white/5 rounded px-1" style={{ paddingLeft }}>
             <span className="text-yellow-500">{closeBracket}</span>
             {!isLast && <span className="text-slate-500">,</span>}
          </div>
        </div>
      )}
    </div>
  );
};

const JsonViewer: React.FC<JsonViewerProps> = ({ json }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(json, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group text-left">
       <button 
         onClick={handleCopy}
         className={`absolute -top-3 right-0 p-2 rounded-lg transition-all z-10 flex items-center gap-1.5 border border-slate-600 ${copied ? 'bg-green-500/10 text-green-400 border-green-500/50' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 opacity-0 group-hover:opacity-100'}`}
         title="نسخ كود JSON"
       >
         {copied ? <KodraIcon icon={Check} size={14}/> : <KodraIcon icon={Copy} size={14}/>}
         {copied && <span className="text-[10px] font-bold">Copied</span>}
       </button>
       <JsonNode value={json} isLast={true} depth={0} />
    </div>
  );
};

export default JsonViewer;
