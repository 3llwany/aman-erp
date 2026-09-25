const { openRealm } = require('../database/realm');

let realmInstance = null;

async function getDb() {
  if (!realmInstance || realmInstance.isClosed) {
    realmInstance = await openRealm();
  }
  return realmInstance;
}

function serializeRealmObject(obj) {
  if (!obj) return null;
  const raw = typeof obj.toJSON === 'function' ? obj.toJSON() : obj;
  const result = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value && typeof value === 'object' && value._isDecimal128) {
      result[key] = parseFloat(value.toString());
    } else if (value instanceof Date) {
      result[key] = value.toISOString();
    } else if (Array.isArray(value)) {
      result[key] = value.map(item => (item && typeof item === 'object' ? serializeRealmObject(item) : item));
    } else {
      result[key] = value;
    }
  }
  return result;
}

// Convert input data to match Realm schema property types (Decimal128, Date, Strings)
function normalizePayload(schema, data) {
  if (!data || !schema) return data;
  const props = schema.properties || {};
  const normalized = {};

  for (const [key, propDef] of Object.entries(props)) {
    const rawVal = data[key];
    const typeStr = typeof propDef === 'string' ? propDef : (propDef.type || '');

    if (rawVal === undefined || rawVal === null) {
      // If optional, set null/undefined; if required string, default to ''
      if (!typeStr.endsWith('?') && typeStr === 'string') {
        normalized[key] = '';
      }
      continue;
    }

    if (typeStr.includes('decimal128') || typeStr.includes('double') || typeStr.includes('float')) {
      const num = Number(rawVal);
      normalized[key] = isNaN(num) ? 0 : num;
    } else if (typeStr.includes('date')) {
      const d = new Date(rawVal);
      normalized[key] = isNaN(d.getTime()) ? new Date() : d;
    } else if (typeStr.includes('int')) {
      const num = parseInt(rawVal, 10);
      normalized[key] = isNaN(num) ? 0 : num;
    } else if (typeStr.includes('bool')) {
      normalized[key] = Boolean(rawVal);
    } else if (typeStr.includes('string')) {
      normalized[key] = String(rawVal);
    } else {
      normalized[key] = rawVal;
    }
  }

  // Ensure ID and timestamps
  normalized.id = data.id ? String(data.id) : (data.number ? String(data.number) : `id_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`);
  if (!normalized.createdAt) normalized.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
  if (!normalized.updatedAt) normalized.updatedAt = new Date();

  return normalized;
}

const dbService = {
  async getAll(entityName, query = '', args = []) {
    const realm = await getDb();
    let results = realm.objects(entityName);
    if (query) {
      results = results.filtered(query, ...args);
    }
    return Array.from(results).map(serializeRealmObject);
  },

  async getById(entityName, id) {
    const realm = await getDb();
    const item = realm.objectForPrimaryKey(entityName, id);
    return serializeRealmObject(item);
  },

  async create(entityName, data) {
    const realm = await getDb();
    const schema = realm.schema.find(s => s.name === entityName);
    const payload = normalizePayload(schema, data);

    let created;
    realm.write(() => {
      created = realm.create(entityName, payload, 'modified');
    });
    return serializeRealmObject(created);
  },

  async update(entityName, id, data) {
    const realm = await getDb();
    const schema = realm.schema.find(s => s.name === entityName);
    const payload = normalizePayload(schema, { ...data, id });

    let updated;
    realm.write(() => {
      updated = realm.create(entityName, payload, 'modified');
    });
    return serializeRealmObject(updated);
  },

  async delete(entityName, id) {
    const realm = await getDb();
    let success = false;
    realm.write(() => {
      const item = realm.objectForPrimaryKey(entityName, id);
      if (item) {
        realm.delete(item);
        success = true;
      }
    });
    return { success };
  },

  async bulkInsert(entityName, items = []) {
    const realm = await getDb();
    const schema = realm.schema.find(s => s.name === entityName);
    const results = [];

    realm.write(() => {
      for (const item of items) {
        try {
          const payload = normalizePayload(schema, item);
          const created = realm.create(entityName, payload, 'modified');
          results.push(serializeRealmObject(created));
        } catch (itemErr) {
          console.error(`[bulkInsert error in ${entityName}]:`, itemErr.message, item);
        }
      }
    });
    return results;
  },

  async getStats() {
    const realm = await getDb();
    const stats = {};
    for (const schema of realm.schema) {
      stats[schema.name] = realm.objects(schema.name).length;
    }
    return stats;
  }
};

module.exports = { dbService, getDb };
