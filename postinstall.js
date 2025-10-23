#!/usr/bin/env node

console.log('\n' + '='.repeat(70));
console.log('\n⚠️  DEPRECATION WARNING ⚠️\n');
console.log("The 'specrec-ts' package has been renamed to 'global-object-factory'.\n");
console.log('Please update your dependencies:');
console.log('  - Remove: npm uninstall specrec-ts');
console.log('  - Install: npm install global-object-factory\n');
console.log('Update your imports:');
console.log("  - Old: import { ObjectFactory } from 'specrec-ts'");
console.log("  - New: import { ObjectFactory } from 'global-object-factory'\n");
console.log('For more information, visit: https://github.com/devill/global-object-factory-ts\n');
console.log('='.repeat(70) + '\n');
