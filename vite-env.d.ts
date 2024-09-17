/// <reference types="vite/client" />

declare namespace NodeJS {
  export interface ProcessEnv {
    APP_ENV: string;
    API_URL: string;
  }
}
