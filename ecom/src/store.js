import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // uses localStorage by default
import counterReducer from './counterslice'
import userReducer from './userdt'

// Config: only persist the 'user' slice (login state)
const userPersistConfig = {
  key: 'user',
  storage,
}

const persistedUserReducer = persistReducer(userPersistConfig, userReducer)

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    user: persistedUserReducer,   // ← persisted across page refreshes
  },
  // Required: ignore redux-persist internal actions in serializability check
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)