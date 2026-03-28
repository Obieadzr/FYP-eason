import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import { CATEGORY_GROUPS } from '../../utils/categoryAttributes';

export default function CategoryPicker({ categories, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedGroup, setExpandedGroup] = useState(null);

  const selectedCategory = categories?.find(c => c._id === value);

  // Map DB categories into the visual groups
  const groupsWithCategories = useMemo(() => {
    if (!categories) return [];
    return CATEGORY_GROUPS.map(group => {
      const groupCats = categories.filter(c => group.slugs.includes(c.slug));
      return { ...group, categories: groupCats };
    }).filter(g => g.categories.length > 0);
  }, [categories]);

  // Filter based on search
  const filteredGroups = useMemo(() => {
    if (!search.trim()) return groupsWithCategories;
    const lowerSearch = search.toLowerCase();
    
    return groupsWithCategories.map(group => {
      const matchedCats = group.categories.filter(c => c.name.toLowerCase().includes(lowerSearch));
      return { ...group, categories: matchedCats };
    }).filter(g => g.categories.length > 0);
  }, [search, groupsWithCategories]);

  const handleSelect = (categoryId) => {
    onChange(categoryId);
    setIsOpen(false);
    setSearch("");
  };

  if (!isOpen && selectedCategory) {
    return (
      <div className="w-full bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between shadow-sm transition-all hover:border-emerald-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mb-0.5">Selected Category</p>
            <p className="font-semibold text-gray-900">{selectedCategory.name}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          type="button"
          className="text-xs font-bold text-gray-500 hover:text-gray-900 bg-white border border-gray-200 px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          Change
        </button>
      </div>
    );
  }

  const renderPickerContent = () => (
    <div className="flex flex-col h-full lg:max-h-[500px] bg-white lg:rounded-2xl flex-1 overflow-hidden">
      {/* Header & Search */}
      <div className="p-4 border-b border-gray-100 flex flex-col gap-3 shrink-0">
        <div className="flex items-center justify-between lg:hidden">
           <h3 className="font-bold text-lg text-gray-900 tracking-tight">Select Category</h3>
           <button type="button" onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"><X className="w-5 h-5" /></button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Search all categories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-sm"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredGroups.length === 0 ? (
          <div className="text-center text-gray-400 py-10 flex flex-col items-center gap-2">
            <Search className="w-8 h-8 opacity-20" />
            <p className="font-medium text-sm">No categories found matching "{search}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredGroups.map((group, idx) => {
              const isExpanded = expandedGroup === idx || search.length > 0;
              return (
                <div key={group.group} className={`border rounded-xl overflow-hidden transition-all duration-300 ${isExpanded ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-100 bg-white hover:border-gray-300'}`}>
                  {/* Card Header */}
                  <button
                    type="button"
                    onClick={() => setExpandedGroup(isExpanded ? null : idx)}
                    className="w-full p-3.5 flex items-center justify-between text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${group.color} bg-opacity-10 shadow-sm`}>
                        {group.emoji}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm tracking-tight">{group.group}</h4>
                        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mt-0.5">{group.categories.length} items</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-emerald-500' : 'group-hover:text-gray-600'}`} />
                  </button>
                  
                  {/* Card Expanded Content */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-3.5 pb-4 pt-1 flex flex-wrap gap-2">
                          {group.categories.map(cat => (
                            <button
                              key={cat._id}
                              type="button"
                              onClick={() => handleSelect(cat._id)}
                              className="px-3 py-[7px] bg-white border border-gray-200 text-[13px] font-medium text-gray-700 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-[10px] shadow-sm transition-all text-left"
                            >
                              {cat.name}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  if (!isOpen && !selectedCategory) {
    return (
      <button 
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full bg-gray-50 border border-gray-200 text-gray-500 rounded-xl px-4 py-3.5 text-left font-medium hover:bg-white hover:border-gray-300 hover:shadow-sm transition-all flex justify-between items-center"
      >
        <span className="text-[15px]">Select Category...</span>
        <ChevronDown className="w-5 h-5 text-gray-400" />
      </button>
    );
  }

  return (
    <>
      <div className="hidden lg:block w-full border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-xl shadow-gray-200/40">
        {renderPickerContent()}
      </div>

      {/* Mobile Bottom Sheet Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm lg:hidden flex flex-col justify-end"
          >
            <div className="absolute inset-0" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full h-[85vh] bg-white rounded-t-3xl relative z-10 flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 shrink-0" />
              {renderPickerContent()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
