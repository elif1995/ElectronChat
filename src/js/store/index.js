
import {createStore, combineReducers , applyMiddleware} from 'redux'
import { configureStore } from "@reduxjs/toolkit";
import thunkMiddleware from "redux-thunk";
import chatReducer from '../reducers/chats';
import authReducer from '../reducers/auth';
import appReducer from '../reducers/app';
import settingsReducer from '../reducers/settings';

import appMiddleware from './middlewares/app';

export default function initStore() {

  const middlewares = [
    thunkMiddleware,
    appMiddleware
  ];

  const mainReducer = combineReducers ({
    chats:chatReducer,
    auth: authReducer,
    app: appReducer,
    settings: settingsReducer
  })

  const rootReducer = (state, action) => {
    if(action.type === "AUTH_LOGOUT_SUCCESS"){
      Object.keys(state).forEach(sk => {
        if(state[sk].saveable){
          return;
        }
      })
    }

    return mainReducer(state, action)
  }

  const store = createStore(
    rootReducer,
    applyMiddleware(...middlewares));

  return store;
}
