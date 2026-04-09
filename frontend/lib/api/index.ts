//Module Exports

// Re-export all API functions
export * from "./courses";
export * from "./attendance";
export * from "./grades";
export * from "./materials";
export * as studentsApi from "./students";
export * as teachersApi from "./teachers";

// Re-export base API utilities
export { apiRequest, buildQueryString } from "../api";
export {
  login,
  register,
  logout,
  getUserDetails,
  getCachedUser,
  isAuthenticated,
  getAccessToken,
  type User,
} from "../auth";
