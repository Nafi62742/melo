const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [target, replacement] of replacements) {
    if (typeof target === 'string') {
      content = content.split(target).join(replacement);
    } else {
      content = content.replace(target, replacement);
    }
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated ' + path.basename(filePath));
}

// 1. UPDATE manual-order-modal.tsx
const manualOrderModalPath = path.join(__dirname, '..', 'src/features/admin/modals/manual-order-modal.tsx');
let manualContent = fs.readFileSync(manualOrderModalPath, 'utf8');

manualContent = manualContent.replace(
  'border border-slate-800 bg-slate-900 text-slate-100 shadow-2xl',
  'border border-slate-200 bg-white text-slate-900 shadow-2xl'
);
manualContent = manualContent.replace(
  'bg-slate-950 px-5 py-3.5 border-b border-slate-800',
  'bg-slate-50 px-5 py-3.5 border-b border-slate-200'
);
manualContent = manualContent.replace('text-white leading-tight', 'text-slate-900 leading-tight');
manualContent = manualContent.replace('text-slate-400 mt-0.5', 'text-slate-500 mt-0.5');
manualContent = manualContent.replace(
  'text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800',
  'text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100'
);

// Channel buttons
manualContent = manualContent.replace(
  "border-slate-800 bg-slate-950 text-slate-400 hover:border-emerald-500 hover:text-white",
  "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
);
manualContent = manualContent.replace(
  "border-slate-800 bg-slate-950 text-slate-400 hover:border-sky-500 hover:text-white",
  "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
);

// Returning customer card
manualContent = manualContent.replace(
  'rounded-xl border border-slate-800 bg-slate-950 px-3 py-2',
  'rounded-xl border border-slate-200 bg-slate-50 px-3 py-2'
);
manualContent = manualContent.replace(
  'border border-slate-800 bg-slate-900 hover:border-indigo-500 px-2.5 py-1 text-[11px] font-medium text-slate-200',
  'border border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-800'
);
manualContent = manualContent.replace('font-semibold text-white', 'font-semibold text-slate-900');

// Form inputs
manualContent = manualContent.replace(
  /border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 rounded-xl/g,
  'border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 rounded-xl'
);
manualContent = manualContent.replace(
  /border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 rounded-xl/g,
  'border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:border-slate-900 rounded-xl'
);
manualContent = manualContent.replace(
  /text-xs font-bold uppercase tracking-wider text-slate-300/g,
  'text-xs font-bold uppercase tracking-wider text-slate-700'
);
manualContent = manualContent.replace(
  /text-xs font-bold uppercase tracking-wider text-slate-400/g,
  'text-xs font-bold uppercase tracking-wider text-slate-600'
);

// bKash sender box
manualContent = manualContent.replace(
  'bg-pink-950/40 border border-pink-500/30 p-3 rounded-xl',
  'bg-pink-50 border border-pink-200 p-3 rounded-xl'
);
manualContent = manualContent.replace(
  /text-pink-300/g,
  'text-pink-800'
);
manualContent = manualContent.replace(
  /border border-pink-500\/30 bg-slate-950 px-2.5 py-1.5 text-xs text-white/g,
  'border border-pink-300 bg-white px-2.5 py-1.5 text-xs text-slate-900'
);

// Right Column Product Picker
manualContent = manualContent.replace(
  'border border-slate-800 bg-slate-950 rounded-2xl overflow-hidden shadow-inner',
  'border border-slate-200 bg-white rounded-2xl overflow-hidden shadow-xs'
);
manualContent = manualContent.replace(
  'border-b border-slate-800 bg-slate-900/90 space-y-2',
  'border-b border-slate-200 bg-slate-50 space-y-2'
);
manualContent = manualContent.replace(
  'text-xs font-bold uppercase tracking-wider text-white',
  'text-xs font-bold uppercase tracking-wider text-slate-900'
);
manualContent = manualContent.replace(
  'border border-slate-700 bg-slate-950 px-2.5 py-1.5 rounded-xl focus-within:border-indigo-500',
  'border border-slate-300 bg-white px-2.5 py-1.5 rounded-xl focus-within:border-slate-900'
);
manualContent = manualContent.replace(
  'w-full bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none',
  'w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none'
);
manualContent = manualContent.replace(
  "border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:border-slate-700",
  "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
);
manualContent = manualContent.replace(
  'divide-y divide-slate-800/80 bg-slate-900',
  'divide-y divide-slate-100 bg-white'
);
manualContent = manualContent.replace(
  'hover:bg-slate-800/60 transition',
  'hover:bg-slate-50/80 transition'
);
manualContent = manualContent.replace(
  'font-semibold text-xs text-white truncate',
  'font-semibold text-xs text-slate-900 truncate'
);
manualContent = manualContent.replace(
  'font-mono font-bold text-white',
  'font-mono font-bold text-slate-900'
);
manualContent = manualContent.replace(
  'border border-slate-700 bg-slate-950',
  'border border-slate-200 bg-white'
);
manualContent = manualContent.replace(
  "bg-indigo-600 text-white hover:bg-indigo-500",
  "bg-slate-900 text-white hover:bg-black"
);

// Selected items list
manualContent = manualContent.replace(
  'border-t border-slate-800 bg-slate-950 space-y-2.5',
  'border-t border-slate-200 bg-slate-50/70 space-y-2.5'
);
manualContent = manualContent.replace(
  'border border-dashed border-slate-800 bg-slate-900/60 py-4 px-3 text-center text-xs text-slate-500',
  'border border-dashed border-slate-300 bg-white py-4 px-3 text-center text-xs text-slate-500'
);
manualContent = manualContent.replace(
  'bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-xl shadow-xs',
  'bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl shadow-2xs'
);
manualContent = manualContent.replace(
  'font-semibold text-xs text-white truncate',
  'font-semibold text-xs text-slate-900 truncate'
);
manualContent = manualContent.replace(
  '<strong className="text-white">',
  '<strong className="text-slate-900">'
);
manualContent = manualContent.replace(
  'border border-slate-700 bg-slate-950 rounded-lg overflow-hidden',
  'border border-slate-300 bg-white rounded-lg overflow-hidden'
);
manualContent = manualContent.replace(
  'font-mono font-bold text-xs text-white',
  'font-mono font-bold text-xs text-slate-900'
);
manualContent = manualContent.replace(
  'rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 flex items-center justify-between',
  'rounded-xl border border-slate-200 bg-white px-3 py-2 flex items-center justify-between shadow-2xs'
);
manualContent = manualContent.replace(
  'font-mono text-base font-bold text-white',
  'font-mono text-base font-bold text-slate-900'
);

// Bottom modal actions
manualContent = manualContent.replace(
  'border-t border-slate-800',
  'border-t border-slate-200'
);
manualContent = manualContent.replace(
  'border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer rounded-xl transition shadow-xs',
  'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-5 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer rounded-xl transition shadow-2xs'
);
manualContent = manualContent.replace(
  'bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer rounded-xl shadow-md transition',
  'bg-slate-900 hover:bg-black disabled:opacity-40 text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer rounded-xl shadow-sm transition'
);

fs.writeFileSync(manualOrderModalPath, manualContent, 'utf8');
console.log('Updated manual-order-modal.tsx to Light Mode');

// 2. UPDATE analytics-tab.tsx
const analyticsTabPath = path.join(__dirname, '..', 'src/features/admin/tabs/analytics-tab.tsx');
let analyticsContent = fs.readFileSync(analyticsTabPath, 'utf8');

analyticsContent = analyticsContent.replace(
  'border border-slate-800 bg-slate-900 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl shadow-md',
  'border border-slate-200 bg-white p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl shadow-xs'
);
analyticsContent = analyticsContent.replace('text-white leading-tight', 'text-slate-900 leading-tight');
analyticsContent = analyticsContent.replace('text-slate-400 mt-1', 'text-slate-600 mt-1');
analyticsContent = analyticsContent.replace(
  'border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white font-mono',
  'border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 font-mono'
);
analyticsContent = analyticsContent.replace(
  'border border-slate-700 bg-slate-950 text-xs text-white rounded-xl px-2 py-1',
  'border border-slate-300 bg-white text-xs text-slate-900 rounded-xl px-2 py-1'
);
analyticsContent = analyticsContent.replace(
  'border border-slate-800 bg-slate-950/80 p-1 rounded-xl',
  'border border-slate-200 bg-slate-100 p-1 rounded-xl'
);
analyticsContent = analyticsContent.replace(
  /active\s*\?\s*'bg-indigo-600 text-white shadow-xs'\s*:\s*'text-slate-400 hover:text-white'/g,
  "active ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'"
);
// KPI grid
analyticsContent = analyticsContent.replace(
  /border border-slate-800 bg-slate-900 p-4 rounded-2xl shadow-sm/g,
  'border border-slate-200 bg-white p-4 rounded-2xl shadow-xs'
);
analyticsContent = analyticsContent.replace(
  /text-slate-400 uppercase tracking-\[0\.14em\]/g,
  'text-slate-500 uppercase tracking-[0.14em]'
);
analyticsContent = analyticsContent.replace(
  /text-xl sm:text-2xl font-bold font-mono text-white/g,
  'text-xl sm:text-2xl font-bold font-mono text-slate-900'
);
// Table
analyticsContent = analyticsContent.replace(
  'border border-slate-800 bg-slate-900 rounded-2xl shadow-md overflow-hidden',
  'border border-slate-200 bg-white rounded-2xl shadow-xs overflow-hidden'
);
analyticsContent = analyticsContent.replace(
  'bg-slate-950/80 border-b border-slate-800 px-5 py-3',
  'bg-slate-50 border-b border-slate-200 px-5 py-3'
);
analyticsContent = analyticsContent.replace(
  'text-white',
  'text-slate-900'
);
analyticsContent = analyticsContent.replace(
  'bg-slate-950/90 border-b border-slate-800 text-slate-400 uppercase font-bold text-\[10px\] tracking-\[0\.14em\]',
  'bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider'
);
analyticsContent = analyticsContent.replace(
  'divide-y divide-slate-800/80 bg-slate-900',
  'divide-y divide-slate-100 bg-white'
);
analyticsContent = analyticsContent.replace(
  /hover:bg-slate-850\/60 transition/g,
  'hover:bg-slate-50/70 transition'
);
analyticsContent = analyticsContent.replace(
  /font-bold text-white capitalize/g,
  'font-bold text-slate-900 capitalize'
);

fs.writeFileSync(analyticsTabPath, analyticsContent, 'utf8');
console.log('Updated analytics-tab.tsx to Light Mode');

// 3. UPDATE product-types-tab.tsx
const typesTabPath = path.join(__dirname, '..', 'src/features/admin/tabs/product-types-tab.tsx');
let typesContent = fs.readFileSync(typesTabPath, 'utf8');

typesContent = typesContent.replace(
  'border border-slate-800 bg-slate-900 p-6 rounded-2xl shadow-md',
  'border border-slate-200 bg-white p-6 rounded-2xl shadow-xs'
);
typesContent = typesContent.replace('text-white mt-0.5', 'text-slate-900 mt-0.5');
typesContent = typesContent.replace('border-b border-slate-800', 'border-b border-slate-200');
typesContent = typesContent.replace(
  'text-xs font-bold text-slate-200 bg-slate-950 border border-slate-800',
  'text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200'
);
typesContent = typesContent.replace(
  /border border-slate-800 bg-slate-950 rounded-xl px-3\.5 py-2/g,
  'border border-slate-200 bg-slate-50 rounded-xl px-3.5 py-2'
);
typesContent = typesContent.replace(
  /font-bold text-white/g,
  'font-bold text-slate-900'
);
typesContent = typesContent.replace(
  'border border-slate-800 bg-slate-950 p-4 rounded-xl',
  'border border-slate-200 bg-slate-50 p-4 rounded-xl'
);
typesContent = typesContent.replace(
  /border border-slate-700 bg-slate-900 px-3 py-2 text-white/g,
  'border border-slate-300 bg-white px-3 py-2 text-slate-900'
);
typesContent = typesContent.replace(
  'bg-indigo-600 hover:bg-indigo-500 text-white',
  'bg-slate-900 hover:bg-black text-white'
);

fs.writeFileSync(typesTabPath, typesContent, 'utf8');
console.log('Updated product-types-tab.tsx to Light Mode');

// 4. UPDATE links-tab.tsx
const linksTabPath = path.join(__dirname, '..', 'src/features/admin/tabs/links-tab.tsx');
let linksContent = fs.readFileSync(linksTabPath, 'utf8');

linksContent = linksContent.replace(
  'border border-slate-800 bg-slate-900 p-6 rounded-2xl shadow-md',
  'border border-slate-200 bg-white p-6 rounded-2xl shadow-xs'
);
linksContent = linksContent.replace('border-b border-slate-800', 'border-b border-slate-200');
linksContent = linksContent.replace('text-base sm:text-lg font-bold text-white', 'text-base sm:text-lg font-bold text-slate-900');
linksContent = linksContent.replace(
  /border border-slate-800 bg-slate-950/g,
  'border border-slate-200 bg-slate-50'
);
linksContent = linksContent.replace(
  /border border-slate-700 bg-slate-900 px-3 py-2 text-white/g,
  'border border-slate-300 bg-white px-3 py-2 text-slate-900'
);
linksContent = linksContent.replace(
  'bg-indigo-600 hover:bg-indigo-500 text-white',
  'bg-slate-900 hover:bg-black text-white'
);

fs.writeFileSync(linksTabPath, linksContent, 'utf8');
console.log('Updated links-tab.tsx to Light Mode');

// 5. UPDATE product-modal.tsx
const productModalPath = path.join(__dirname, '..', 'src/features/admin/modals/product-modal.tsx');
let pModalContent = fs.readFileSync(productModalPath, 'utf8');

pModalContent = pModalContent.replace(
  'border border-slate-800 bg-slate-900 text-slate-100 shadow-2xl',
  'border border-slate-200 bg-white text-slate-900 shadow-2xl'
);
pModalContent = pModalContent.replace(
  'border-b border-slate-800 bg-slate-950 px-5 sm:px-6 py-4',
  'border-b border-slate-200 bg-slate-50 px-5 sm:px-6 py-4'
);
pModalContent = pModalContent.replace('text-white', 'text-slate-900');
pModalContent = pModalContent.replace(
  'hover:bg-slate-800 text-slate-400 hover:text-white',
  'hover:bg-slate-200 text-slate-400 hover:text-slate-700'
);
pModalContent = pModalContent.replace(
  /border border-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 bg-slate-950/g,
  'border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 bg-white'
);
pModalContent = pModalContent.replace(
  /border border-slate-700 rounded-xl bg-slate-950 px-3 py-2 text-white focus:outline-none focus:border-indigo-500/g,
  'border border-slate-300 rounded-xl bg-white px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900'
);
pModalContent = pModalContent.replace(
  /text-xs font-bold uppercase tracking-wider text-slate-300/g,
  'text-xs font-bold uppercase tracking-wider text-slate-700'
);
pModalContent = pModalContent.replace(
  'border-t border-slate-800 bg-slate-950 px-5 sm:px-6 py-4',
  'border-t border-slate-200 bg-slate-50 px-5 sm:px-6 py-4'
);
pModalContent = pModalContent.replace(
  'border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer rounded-xl transition shadow-xs',
  'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-5 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer rounded-xl transition shadow-2xs'
);
pModalContent = pModalContent.replace(
  'bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer rounded-xl shadow-md transition',
  'bg-slate-900 hover:bg-black text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer rounded-xl shadow-xs transition'
);

fs.writeFileSync(productModalPath, pModalContent, 'utf8');
console.log('Updated product-modal.tsx to Light Mode');

// 6. UPDATE delete-product-modal.tsx
const deleteModalPath = path.join(__dirname, '..', 'src/features/admin/modals/delete-product-modal.tsx');
let delContent = fs.readFileSync(deleteModalPath, 'utf8');

delContent = delContent.replace(
  'border border-slate-800 bg-slate-900 text-slate-100 shadow-2xl',
  'border border-slate-200 bg-white text-slate-900 shadow-2xl'
);
delContent = delContent.replace(
  'border-b border-slate-800 bg-slate-950 px-6 py-4',
  'border-b border-slate-200 bg-slate-50 px-6 py-4'
);
delContent = delContent.replace('text-white', 'text-slate-900');
delContent = delContent.replace(
  'border-t border-slate-800 bg-slate-950 px-6 py-4',
  'border-t border-slate-200 bg-slate-50 px-6 py-4'
);
delContent = delContent.replace(
  'border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white',
  'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
);

fs.writeFileSync(deleteModalPath, delContent, 'utf8');
console.log('Updated delete-product-modal.tsx to Light Mode');

