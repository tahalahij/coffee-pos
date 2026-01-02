# Release Guide

## Creating a New Release

To create a new release with the correct version:

### 1. Create and Push a Version Tag

```bash
# Example: Create version 1.2.3
git tag v1.2.3
git push origin v1.2.3
```

### 2. Automatic Build Process

When you push a tag starting with `v`, the GitHub Actions workflow will:
- ✅ Extract the version from the tag (e.g., `v1.2.3` → `1.2.3`)
- ✅ Update `tauri.conf.json` with the version
- ✅ Update `package.json` files with the version
- ✅ Build the Windows installer with the correct version
- ✅ Create a GitHub release with the installers attached

### 3. Release Artifacts

The workflow will generate:
- `Cafe POS_X.X.X_x64_en-US.msi` (MSI installer)
- `Cafe POS_X.X.X_x64-setup.exe` (NSIS installer)
- Both will have the version from your tag

## Version Naming Convention

Follow semantic versioning: `vMAJOR.MINOR.PATCH`

- `v1.0.0` - Initial release
- `v1.0.1` - Bug fix
- `v1.1.0` - New features (backward compatible)
- `v2.0.0` - Breaking changes

## Examples

```bash
# Patch release (bug fixes)
git tag v1.0.1
git push origin v1.0.1

# Minor release (new features)
git tag v1.1.0
git push origin v1.1.0

# Major release (breaking changes)
git tag v2.0.0
git push origin v2.0.0
```

## Manual Release (Alternative)

If you need to create a release manually:

1. Go to Actions tab on GitHub
2. Find the successful build run
3. Use the "Create Release from Artifacts" workflow
4. Enter the tag name and run ID

## Important Notes

- ⚠️ Always use `v` prefix for tags (e.g., `v1.0.0`, not `1.0.0`)
- ⚠️ The workflow only updates versions for tagged releases
- ⚠️ Non-tagged builds will use the default version from `tauri.conf.json`
- ⚠️ Once a tag is pushed, the version is locked for that release
- ✅ The version in source files doesn't need to be manually updated
