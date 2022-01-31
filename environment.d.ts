declare namespace NodeJS {
    export interface ProcessEnv {
        PORT: string;
        DB_USER: string;
        DB_PASS: string;
        DB_NAME: string;
        DB_PORT: string;
        DB_HOST: string;
        NODE_ENV: 'dev' | 'prod' | 'test';
        SECRET_SESSION: string;
        SECRET_TOKEN: string;
        SENTRY_DSN: string;
    }
}