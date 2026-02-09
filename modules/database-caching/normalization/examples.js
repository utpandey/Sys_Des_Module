/**
 * Normalization - Vanilla JS & React/Redux Examples
 */

/* ============================================
   VANILLA JS NORMALIZATION
   ============================================ */

/**
 * 1. API Response Normalizer
 * 
 * Transforms nested API response → flat normalized state
 */
function normalizeResponse(data, schema) {
  const entities = {};

  function normalize(item, entitySchema) {
    const { name, relations = {} } = entitySchema;

    if (!entities[name]) {
      entities[name] = { byId: {}, allIds: [] };
    }

    const normalized = { ...item };

    // Process relations
    Object.entries(relations).forEach(([key, relSchema]) => {
      const relData = item[key];
      if (!relData) return;

      if (Array.isArray(relData)) {
        normalized[`${key}Ids`] = relData.map(child => {
          normalize(child, relSchema);
          return child.id;
        });
      } else {
        normalize(relData, relSchema);
        normalized[`${key}Id`] = relData.id;
      }

      delete normalized[key]; // Remove nested data
    });

    entities[name].byId[normalized.id] = normalized;
    if (!entities[name].allIds.includes(normalized.id)) {
      entities[name].allIds.push(normalized.id);
    }

    return normalized.id;
  }

  const rootIds = Array.isArray(data)
    ? data.map(item => normalize(item, schema))
    : [normalize(data, schema)];

  return { entities, result: rootIds };
}

// Usage:
const apiResponse = [
  {
    id: 1,
    title: 'First Post',
    author: { id: 10, name: 'John' },
    comments: [
      { id: 100, text: 'Nice!', author: { id: 10, name: 'John' } },
      { id: 101, text: 'Great!', author: { id: 20, name: 'Jane' } }
    ]
  }
];

const schema = {
  name: 'posts',
  relations: {
    author: { name: 'users' },
    comments: {
      name: 'comments',
      relations: {
        author: { name: 'users' }
      }
    }
  }
};

// normalizeResponse(apiResponse, schema)
// Result:
// {
//   entities: {
//     posts: { byId: { 1: { id: 1, title: 'First Post', authorId: 10, commentsIds: [100, 101] } }, allIds: [1] },
//     users: { byId: { 10: { id: 10, name: 'John' }, 20: { id: 20, name: 'Jane' } }, allIds: [10, 20] },
//     comments: { byId: { 100: { id: 100, text: 'Nice!', authorId: 10 }, 101: { ... } }, allIds: [100, 101] }
//   },
//   result: [1]
// }


/**
 * 2. Normalized State Manager
 */
class NormalizedStore {
  constructor() {
    this.entities = {};
  }

  // Add/update entity
  upsert(entityType, entity) {
    if (!this.entities[entityType]) {
      this.entities[entityType] = { byId: {}, allIds: [] };
    }

    const store = this.entities[entityType];
    const isNew = !store.byId[entity.id];

    store.byId[entity.id] = { ...store.byId[entity.id], ...entity };
    if (isNew) store.allIds.push(entity.id);

    return store.byId[entity.id];
  }

  // Batch upsert
  upsertMany(entityType, entities) {
    return entities.map(e => this.upsert(entityType, e));
  }

  // Get single entity
  getById(entityType, id) {
    return this.entities[entityType]?.byId[id] || null;
  }

  // Get all entities
  getAll(entityType) {
    const store = this.entities[entityType];
    if (!store) return [];
    return store.allIds.map(id => store.byId[id]);
  }

  // Get filtered entities
  getWhere(entityType, predicate) {
    return this.getAll(entityType).filter(predicate);
  }

  // Remove entity
  remove(entityType, id) {
    const store = this.entities[entityType];
    if (!store) return;
    delete store.byId[id];
    store.allIds = store.allIds.filter(i => i !== id);
  }

  // Denormalize: resolve references back to nested objects
  denormalize(entityType, id, relations = {}) {
    const entity = this.getById(entityType, id);
    if (!entity) return null;

    const result = { ...entity };

    Object.entries(relations).forEach(([key, config]) => {
      const idKey = `${key}Id`;
      const idsKey = `${key}Ids`;

      if (result[idKey] !== undefined) {
        result[key] = this.denormalize(config.type, result[idKey], config.relations || {});
        delete result[idKey];
      } else if (result[idsKey] !== undefined) {
        result[key] = result[idsKey].map(relId =>
          this.denormalize(config.type, relId, config.relations || {})
        );
        delete result[idsKey];
      }
    });

    return result;
  }
}

// Usage:
// const store = new NormalizedStore();
// store.upsert('users', { id: 1, name: 'John' });
// store.upsert('posts', { id: 1, title: 'Hello', authorId: 1 });
// const post = store.denormalize('posts', 1, {
//   author: { type: 'users' }
// });
// → { id: 1, title: 'Hello', author: { id: 1, name: 'John' } }


/* ============================================
   REACT / REDUX EXAMPLES
   ============================================ */

/**
 * 3. Redux Normalized Slice (Redux Toolkit)
 */
/*
import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

// createEntityAdapter provides normalized state management
const usersAdapter = createEntityAdapter({
  selectId: (user) => user.id,
  sortComparer: (a, b) => a.name.localeCompare(b.name)
});

const usersSlice = createSlice({
  name: 'users',
  initialState: usersAdapter.getInitialState({
    // Additional state: { ids: [], entities: {} }
    loading: false,
    error: null
  }),
  reducers: {
    addUser: usersAdapter.addOne,
    addUsers: usersAdapter.addMany,
    updateUser: usersAdapter.updateOne,
    removeUser: usersAdapter.removeOne,
    setUsers: usersAdapter.setAll,
  }
});

// Auto-generated selectors
const usersSelectors = usersAdapter.getSelectors(state => state.users);
// usersSelectors.selectAll(state)     → [user1, user2, ...]
// usersSelectors.selectById(state, 1) → user1
// usersSelectors.selectIds(state)     → [1, 2, 3]
// usersSelectors.selectTotal(state)   → 3
*/


/**
 * 4. useNormalizedState Hook (lightweight alternative)
 */
function useNormalizedState(initialEntities = {}) {
  const [state, setState] = React.useState(() => {
    const normalized = {};
    Object.entries(initialEntities).forEach(([key, items]) => {
      normalized[key] = {
        byId: Object.fromEntries(items.map(item => [item.id, item])),
        allIds: items.map(item => item.id)
      };
    });
    return normalized;
  });

  const upsert = React.useCallback((entityType, entity) => {
    setState(prev => {
      const store = prev[entityType] || { byId: {}, allIds: [] };
      const isNew = !store.byId[entity.id];

      return {
        ...prev,
        [entityType]: {
          byId: { ...store.byId, [entity.id]: { ...store.byId[entity.id], ...entity } },
          allIds: isNew ? [...store.allIds, entity.id] : store.allIds
        }
      };
    });
  }, []);

  const remove = React.useCallback((entityType, id) => {
    setState(prev => {
      const store = prev[entityType];
      if (!store) return prev;

      const { [id]: removed, ...rest } = store.byId;
      return {
        ...prev,
        [entityType]: {
          byId: rest,
          allIds: store.allIds.filter(i => i !== id)
        }
      };
    });
  }, []);

  const selectAll = React.useCallback((entityType) => {
    const store = state[entityType];
    if (!store) return [];
    return store.allIds.map(id => store.byId[id]);
  }, [state]);

  const selectById = React.useCallback((entityType, id) => {
    return state[entityType]?.byId[id] || null;
  }, [state]);

  return { state, upsert, remove, selectAll, selectById };
}

// Usage:
// function App() {
//   const { upsert, selectAll, selectById, remove } = useNormalizedState({
//     users: [{ id: 1, name: 'John' }],
//     posts: [{ id: 1, title: 'Hello', authorId: 1 }]
//   });
//
//   const allUsers = selectAll('users');
//   const john = selectById('users', 1);
// }


console.log('See README.md for documentation');
