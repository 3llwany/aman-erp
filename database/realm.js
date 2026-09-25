const path = require('node:path');
const fs = require('node:fs');
const Realm = require('realm');
const { schemas } = require('./schemas');

const CURRENT_SCHEMA_VERSION = 2;
const DATABASE_NAME = 'ghallab-erp.realm';

function getDataDirectory() {
  let root;
  try {
    const { app } = require('electron');
    root = path.join(app.getPath('userData'), 'GHALLAB ERP');
  } catch (_error) {
    root = process.env.LOCALAPPDATA || path.join(process.cwd(), 'data');
    root = path.join(root, 'AMAN ERP');
  }
  const databaseDirectory = path.join(root, 'database');
  fs.mkdirSync(databaseDirectory, { recursive: true });
  return databaseDirectory;
}

function getRealmConfiguration(overrides = {}) {
  return {
    path: overrides.path || path.join(getDataDirectory(), DATABASE_NAME),
    schema: schemas,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    migration: (oldRealm, newRealm) => {
      // Automatic migration when schema changes
    },
    ...overrides
  };
}

function openRealm(overrides = {}) {
  return Realm.open(getRealmConfiguration(overrides));
}

module.exports = {
  CURRENT_SCHEMA_VERSION,
  DATABASE_NAME,
  getDataDirectory,
  getRealmConfiguration,
  openRealm
};
