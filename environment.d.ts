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
        S3_ENDPOINT: string;
        AWS_SECRET_ACCESS_KEY: string;
        AWS_ACCESS_KEY_ID: string;
        BUCKET_NAME: string;
    }
}