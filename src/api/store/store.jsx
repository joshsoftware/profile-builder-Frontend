import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { achievementApi } from "../achievementApi";
import { certificationApi } from "../certificationApi";
import { educationApi } from "../educationApi";
import { experienceApi } from "../experienceApi";
import { loginApi } from "../loginApi";
import { profileApi } from "../profileApi";
import { projectApi } from "../projectApi";
import authReducer from "./authSlice";

const token = window.localStorage.getItem("token");
const preloadedState = {
  auth: {
    token: token ? token : null
  }
};
const rootReducer = combineReducers({
  [loginApi.reducerPath]: loginApi.reducer,
  [profileApi.reducerPath]: profileApi.reducer,
  [achievementApi.reducerPath]: achievementApi.reducer,
  [certificationApi.reducerPath]: certificationApi.reducer,
  [educationApi.reducerPath]: educationApi.reducer,
  [experienceApi.reducerPath]: experienceApi.reducer,
  [projectApi.reducerPath]: projectApi.reducer,
  auth: authReducer
});

const store = configureStore({
  reducer: rootReducer,
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      loginApi.middleware,
      profileApi.middleware,
      achievementApi.middleware,
      certificationApi.middleware,
      educationApi.middleware,
      experienceApi.middleware,
      projectApi.middleware
    )
});

export default store;
