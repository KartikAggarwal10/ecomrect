import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './counterslice'
import  userReducer  from './userdt'
export const store = configureStore({
  reducer: {
    counter: counterReducer,
    user: userReducer
  },
})