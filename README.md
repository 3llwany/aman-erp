# AMAN ERP

Electron migration workspace for the existing AMAN ERP prototype.

## Current phase

Phase 2 creates a secure Electron shell around the existing `index.html.html`.
The current UI and localStorage data model are intentionally unchanged. Realm,
repositories, migration, and secure IPC will be introduced in later phases.

## Commands

```powershell
npm install
npm start
npm run lint:syntax
npm run build
```

Application data will eventually live under `%LOCALAPPDATA%\AMAN ERP\`.
The current prototype still uses its original browser storage until the migration
layer is implemented and validated.
