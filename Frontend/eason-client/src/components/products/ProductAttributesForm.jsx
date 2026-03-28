import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Check, X, Info, Plus } from 'lucide-react';
import { getAttributesForCategory, CATEGORY_UNIT_HINTS } from '../../utils/categoryAttributes';

// 24 Recommended / Nepal-friendly colors
const PRESET_COLORS = [
  { name: "Crimson Red", hex: "#dc143c" }, { name: "Navy Blue", hex: "#000080" },
  { name: "Forest Green", hex: "#228b22" }, { name: "Marigold", hex: "#ffb300" },
  { name: "Pure White", hex: "#ffffff" }, { name: "Jet Black", hex: "#000000" },
  { name: "Ash Grey", hex: "#b2beb5" }, { name: "Sand Beige", hex: "#f5f5dc" },
  { name: "Sky Blue", hex: "#87ceeb" }, { name: "Royal Purple", hex: "#7851a9" },
  { name: "Rose Pink", hex: "#ff66cc" }, { name: "Teal", hex: "#008080" },
  { name: "Mustard", hex: "#ffdb58" }, { name: "Olive Green", hex: "#808000" },
  { name: "Charcoal", hex: "#36454f" }, { name: "Silver", hex: "#c0c0c0" },
  { name: "Gold", hex: "#ffd700" }, { name: "Bronze", hex: "#cd7f32" },
  { name: "Maroon", hex: "#800000" }, { name: "Peach", hex: "#ffe5b4" },
  { name: "Mint", hex: "#98ff98" }, { name: "Coral", hex: "#ff7f50" },
  { name: "Lavender", hex: "#e6e6fa" }, { name: "Turquoise", hex: "#40e0d0" }
];

// Reusable animated Field wrapper
const FieldWrapper = ({ label, helpText, required, children, error }) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-sm font-semibold text-gray-800 tracking-wide flex items-center justify-between">
      <span>{label} {required && <span className="text-red-500 ml-0.5">*</span>}</span>
    </label>
    {children}
    {error && <span className="text-xs font-medium text-red-500 mt-0.5">{error}</span>}
    {helpText && !error && <span className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5"><Info className="w-3.5 h-3.5" />{helpText}</span>}
  </div>
);

// Searchable MultiSelect
const MultiSelectWidget = ({ options, value = [], onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  
  const toggleOption = (opt) => {
    if (value.includes(opt)) onChange(value.filter(v => v !== opt));
    else onChange([...value, opt]);
  };

  const removeOption = (e, opt) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== opt));
  };

  const visibleChips = value.slice(0, 3);
  const extraCount = value.length - 3;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full min-h-[50px] bg-gray-50 border ${isOpen ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-gray-200'} rounded-xl px-3 py-2 cursor-pointer transition-all flex flex-wrap items-center gap-2`}
      >
        {value.length === 0 ? (
          <span className="text-gray-400 font-medium ml-1 text-sm">{placeholder || "Select options..."}</span>
        ) : (
          <>
            {visibleChips.map(v => (
              <span key={v} className="bg-white border border-gray-200 text-gray-800 text-[13px] font-medium px-2.5 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 break-all">
                {v}
                <button type="button" onClick={(e) => removeOption(e, v)} className="hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
              </span>
            ))}
            {extraCount > 0 && (
              <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-1 rounded-md">
                +{extraCount} more
              </span>
            )}
          </>
        )}
        <ChevronDown className="w-4 h-4 text-gray-400 ml-auto shrink-0" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden"
          >
            <div className="p-3 border-b border-gray-50 relative bg-gray-50/50">
              <Search className="absolute left-6 top-5 w-4 h-4 text-gray-400" />
              <input 
                type="text" autoFocus placeholder="Search options..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div className="max-h-60 overflow-y-auto p-2 custom-scrollbar">
              {filtered.length === 0 ? <p className="text-center text-gray-400 text-sm py-4">No match found</p> : null}
              {filtered.map(opt => {
                const isSel = value.includes(opt);
                return (
                  <button key={opt} type="button" onClick={() => toggleOption(opt)} className="w-full flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-lg transition-colors text-left">
                    <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-colors ${isSel ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-gray-300'}`}>
                      {isSel && <Check className="w-3 h-3" />}
                    </div>
                    <span className={`text-sm ${isSel ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{opt}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Custom ColorPicker
const ColorPickerWidget = ({ value = [], onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customHex, setCustomHex] = useState("#");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const addColor = (colorObj) => {
    if (!value.find(v => v.hex === colorObj.hex)) {
      onChange([...value, colorObj]);
    }
  };

  const removeColor = (e, hex) => {
    e.stopPropagation();
    onChange(value.filter(v => v.hex !== hex));
  };

  const handleCustomAdd = () => {
    if (/^#[0-9A-F]{6}$/i.test(customHex)) {
      addColor({ name: "Custom", hex: customHex });
      setCustomHex("#");
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[50px] bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 cursor-pointer flex flex-wrap items-center gap-2 hover:border-gray-300 transition-colors"
      >
        {value.length === 0 ? (
          <span className="text-gray-400 font-medium ml-1 text-sm pt-1">Select colors...</span>
        ) : (
          value.map(c => (
            <span key={c.hex} className="bg-white border border-gray-200 text-gray-800 text-[13px] font-medium pl-2 pr-1.5 py-1 rounded-full shadow-sm flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full border border-gray-200" style={{ backgroundColor: c.hex }} />
              {c.name}
              <button type="button" onClick={(e) => removeColor(e, c.hex)} className="w-5 h-5 ml-1 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"><X className="w-3 h-3 text-gray-500" /></button>
            </span>
          ))
        )}
        <Plus className="w-5 h-5 text-gray-400 ml-auto shrink-0" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}
            className="absolute z-50 w-full lg:w-80 lg:-right-4 mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl p-4"
          >
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Presets</h4>
            <div className="grid grid-cols-6 gap-2 mb-4">
              {PRESET_COLORS.map(c => (
                <button
                  key={c.hex} type="button" onClick={() => addColor(c)} title={c.name}
                  className="aspect-square rounded-full border-2 border-transparent hover:scale-110 hover:shadow-md transition-all focus:outline-none"
                  style={{ backgroundColor: c.hex, boxShadow: value.find(v=>v.hex===c.hex) ? `0 0 0 2px #10b981` : 'inset 0 0 0 1px rgba(0,0,0,0.1)' }}
                />
              ))}
            </div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 border-t border-gray-100 pt-3">Custom Hex</h4>
            <div className="flex gap-2">
              <input type="text" value={customHex} onChange={e => setCustomHex(e.target.value)} className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 text-sm font-mono focus:outline-none focus:border-emerald-400" />
              <button type="button" onClick={handleCustomAdd} className="bg-gray-900 text-white px-3 rounded-lg text-sm font-bold hover:bg-black transition-colors">Add</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Styled Toggle
const ToggleWidget = ({ checked, onChange }) => (
  <button 
    type="button" 
    onClick={() => onChange(!checked)}
    className={`w-12 h-6 rounded-full flex items-center transition-colors px-1 ${checked ? 'bg-emerald-500' : 'bg-gray-300'}`}
  >
    <motion.div 
      layout transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`w-4 h-4 bg-white rounded-full shadow-sm`}
      style={{ marginLeft: checked ? 'auto' : '0' }}
    />
  </button>
);


export default function ProductAttributesForm({ categorySlug, onChange, initialValues = {}, onUnitSuggest, compact = false }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const attributes = useMemo(() => getAttributesForCategory(categorySlug), [categorySlug]);
  const unitHints = useMemo(() => CATEGORY_UNIT_HINTS[categorySlug] || [], [categorySlug]);

  useEffect(() => {
    // Notify parent whenever values change
    onChange(values);
  }, [values]);

  const handleUpdate = (key, val) => {
    setValues(prev => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const evaluateVisibility = (rule) => {
    if (!rule) return true;
    const { key, value, values: allowedValues, notValue } = rule;
    const actualVal = values[key];
    
    if (value !== undefined) return actualVal === value;
    if (notValue !== undefined) return actualVal !== notValue;
    if (allowedValues !== undefined) return allowedValues.includes(actualVal);
    return true;
  };

  // Group attributes by section
  const sections = useMemo(() => {
    const map = {};
    attributes.forEach(attr => {
      // Only include if visible
      if (!evaluateVisibility(attr.visibleWhen)) {
        // Automatically clear hidden values so they don't submit? Optional but good practice.
        return; 
      }
      const s = attr.section || "General";
      if (!map[s]) map[s] = [];
      map[s].push(attr);
    });
    return map;
  }, [attributes, values]);

  if (!attributes || attributes.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 text-center mt-6">
        <p className="text-gray-500 font-medium text-sm">Select a category above to configure its dynamic product attributes.</p>
      </div>
    );
  }

  const renderInput = (attr) => {
    const val = values[attr.key];
    const borderCls = errors[attr.key] ? "border-red-400 bg-red-50/20" : "border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";
    
    switch (attr.type) {
      case "text":
        return <input type="text" value={val || ""} onChange={e => handleUpdate(attr.key, e.target.value)} placeholder={attr.placeholder} className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-medium transition-all outline-none ${borderCls}`} />;
      
      case "select":
        return (
          <div className="relative">
            <select value={val || ""} onChange={e => handleUpdate(attr.key, e.target.value)} className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-medium transition-all outline-none appearance-none ${borderCls}`}>
              <option value="">Select an option</option>
              {attr.options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-4 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        );
      
      case "multiselect":
        return <MultiSelectWidget options={attr.options} value={val || []} onChange={(v) => handleUpdate(attr.key, v)} placeholder={attr.placeholder} />;
      
      case "number":
        return (
          <div className="relative">
            <input type="number" value={val || ""} onChange={e => handleUpdate(attr.key, e.target.value)} placeholder={attr.placeholder} className={`w-full bg-gray-50 border rounded-xl pl-4 pr-12 py-3 text-sm font-medium transition-all outline-none ${borderCls}`} />
            {attr.unit && <div className="absolute right-4 top-3 text-sm font-bold text-gray-400 pointer-events-none">{attr.unit}</div>}
          </div>
        );

      case "colorpicker":
        return <ColorPickerWidget value={val || []} onChange={(v) => handleUpdate(attr.key, v)} />;

      case "boolean":
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">{attr.label}?</span>
            <ToggleWidget checked={!!val} onChange={(c) => handleUpdate(attr.key, c)} />
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Smart Unit Suggestion Banner */}
      {unitHints.length > 0 && onUnitSuggest && (
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-blue-900 mb-1 tracking-tight">Recommended Units</h4>
              <p className="text-xs text-blue-700/80">Select a frequently used wholesale box type for this category.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {unitHints.map(u => (
              <button 
                key={u} type="button" onClick={() => onUnitSuggest(u)}
                className="bg-white border border-blue-200 text-blue-700 text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors shadow-sm"
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Sections */}
      {Object.entries(sections).map(([sectionName, fields]) => (
        <div key={sectionName} className="space-y-5">
          {/* Section Header */}
          <div className="flex items-center gap-4">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">{sectionName}</h3>
            <div className="h-px bg-gray-100 w-full" />
          </div>

          <div className={`grid ${compact ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-x-6 gap-y-7`}>
            {fields.map(attr => (
              <motion.div 
                key={attr.key}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={attr.type === "colorpicker" && !compact ? "lg:col-span-2" : ""}
              >
                <FieldWrapper label={attr.label} helpText={attr.helpText} required={attr.required} error={errors[attr.key]}>
                  {renderInput(attr)}
                </FieldWrapper>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
