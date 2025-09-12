#!/usr/bin/env node
// Plain JS version to avoid ESM loader issues; reads the TypeScript source and evals object.
const fs = require('fs');
const path = require('path');

const i18nPath = path.resolve(process.cwd(), 'src/lib/i18n.ts');
const source = fs.readFileSync(i18nPath, 'utf8');

// Naive extraction of translations object (assumes well-formed)
const match = source.match(/export const translations = (\{[\s\S]*?\n\});/);
if (!match) {
  console.error('Failed to locate translations object in i18n.ts');
  process.exit(2);
}

// Safely evaluate by constructing a Function returning the object
let translations;
try {
  translations = Function('return ' + match[1])();
} catch (e) {
  console.error('Failed to evaluate translations object:', e);
  process.exit(3);
}

const locales = Object.keys(translations);
const allKeys = Array.from(new Set(locales.flatMap(l => Object.keys(translations[l])))).sort();

const missingPer = locales.map(locale => {
  const set = new Set(Object.keys(translations[locale]));
  const missing = allKeys.filter(k => !set.has(k));
  return { locale, missing };
});

console.log(`i18n key audit: ${allKeys.length} keys / ${locales.length} locales`);
let hasMissing = false;
for (const r of missingPer) {
  if (r.missing.length) {
    hasMissing = true;
    console.log(`\nLocale ${r.locale} missing ${r.missing.length} keys:`);
    r.missing.forEach((k,i)=>console.log(`  ${(i+1).toString().padStart(3,' ')}. ${k}`));
  }
}
if (!hasMissing) {
  console.log('✔ All locales complete');
  process.exit(0);
} else {
  process.exit(1);
}