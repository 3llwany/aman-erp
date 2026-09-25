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
    let created;
    realm.write(() => {
      const now = new Date();
      const payload = {
        ...data,
        id: data.id || `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: data.createdAt ? new Date(data.createdAt) : now,
        updatedAt: now
      };
      created = realm.create(entityName, payload, 'modified');
    });
    return serializeRealmObject(created);
  },

  async update(entityName, id, data) {
    const realm = await getDb();
    let updated;
    realm.write(() => {
      const existing = realm.objectForPrimaryKey(entityName, id);
      if (!existing) {
        throw new Error(`Record not found in ${entityName} with id ${id}`);
      }
      const payload = {
        ...data,
        id,
        updatedAt: new Date()
      };
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
    const results = [];
    realm.write(() => {
      const now = new Date();
      for (const item of items) {
        const payload = {
          ...item,
          id: item.id || `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: item.createdAt ? new Date(item.createdAt) : now,
          updatedAt: now
        };
        const created = realm.create(entityName, payload, 'modified');
        results.push(serializeRealmObject(created));
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
