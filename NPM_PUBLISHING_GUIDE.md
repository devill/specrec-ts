# NPM Publishing Guide for specrec-ts

## Prerequisites

### 1. NPM Account Setup
If you don't have an npm account:
1. Go to https://www.npmjs.com/signup
2. Create an account with your preferred username
3. Verify your email address

### 2. Two-Factor Authentication (Recommended)
1. Enable 2FA in your npm account settings
2. Install an authenticator app (Google Authenticator, Authy, etc.)

### 3. Local NPM Setup
1. Install npm (comes with Node.js)
2. Login to npm from command line:
   ```bash
   npm login
   ```
   Enter your username, password, and 2FA code when prompted.

## Pre-Publication Checklist

✅ **Package is ready:**
- ✅ Tests pass: `npm test`
- ✅ Builds successfully: `npm run build`
- ✅ Package.json metadata is complete
- ✅ README.md is comprehensive
- ✅ LICENSE.md exists
- ✅ .npmignore excludes unnecessary files
- ✅ Local package test passed

✅ **Repository Setup (if you want GitHub links to work):**
- Create GitHub repository at `https://github.com/ivettordog/specrec-ts`
- Push your code to the repository
- Or update package.json URLs to match your actual repository

## Publishing Steps

### 1. Final Version Check
```bash
cd specrec/specrec-ts
npm version patch  # or minor/major depending on changes
```

### 2. Test Package Contents
```bash
npm pack --dry-run
```
This shows what files will be included in the package.

### 3. Publish to NPM
```bash
npm publish
```

**Note:** The `prepublishOnly` script will automatically run `npm run build && npm test` before publishing.

### 4. Verify Publication
```bash
npm view specrec-ts
```

## Alternative: Scoped Package

If you prefer to publish under your username scope:

1. Update package.json name to: `"@yourusername/specrec-ts"`
2. Publish with: `npm publish --access public`

## Post-Publication

### 1. Test Installation
```bash
npm install specrec-ts
```

### 2. Update Documentation
- Add installation instructions to README if needed
- Update any documentation that references the package

### 3. Create Git Tag (if using git)
```bash
git tag v1.0.0
git push origin v1.0.0
```

## Future Updates

For future versions:
1. Make your changes
2. Update version: `npm version patch|minor|major`
3. Run tests: `npm test`
4. Publish: `npm publish`

## Package Information

- **Package Name:** specrec-ts
- **Current Version:** 1.0.0
- **License:** PolyForm-Noncommercial-1.0.0
- **Main Entry:** dist/index.js
- **TypeScript Types:** dist/index.d.ts
- **Dependencies:** None (dev dependencies only)

## Troubleshooting

### Package Name Already Taken
If "specrec-ts" is taken, consider:
- `@yourusername/specrec-ts` (scoped package)
- `specrec-typescript`
- `specrec-ts-lib`

### Permission Errors
- Make sure you're logged in: `npm whoami`
- Check 2FA if enabled
- Verify package name isn't taken by someone else

### Build Issues
- Ensure TypeScript compiles: `npm run build`
- Check tsconfig.json settings
- Verify all imports/exports work

## Files Included in Package

The following files will be included in the published package:
- `dist/` directory (compiled JavaScript and TypeScript definitions)
- `README.md`
- `LICENSE.md`
- `package.json`

Source files (`src/`, tests, config files) are excluded via `.npmignore`.

## Success Indicators

✅ Package builds without errors
✅ All tests pass
✅ Package installs and imports correctly in test project
✅ TypeScript types work properly
✅ README provides clear usage instructions
✅ All metadata is correct in package.json

The package is ready for publication! 🚀