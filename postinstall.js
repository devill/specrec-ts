#!/usr/bin/env node

console.log('\n' + '='.repeat(70));
console.log('\n⚠️  DEPRECATION WARNING ⚠️\n');
console.log("The 'specrec-ts' package has been renamed to 'objectfactory'.\n");
console.log('Please update your dependencies:');
console.log('  - Remove: npm uninstall specrec-ts');
console.log('  - Install: npm install objectfactory\n');
console.log('Update your imports:');
console.log("  - Old: import { ObjectFactory } from 'specrec-ts'");
console.log("  - New: import { ObjectFactory } from 'objectfactory'\n");
console.log('For more information, visit: https://github.com/devill/objectfactory-ts\n');
console.log('='.repeat(70) + '\n');
