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
		ADMIN_ROLE_ID: string;
		S3_ENDPOINT: string;
		AWS_SECRET_ACCESS_KEY: string;
		AWS_ACCESS_KEY_ID: string;
		AWS_BUCKET_NAME: string
		AWS_REGION: string;
		OPEN_IA_API_KEY: string;
		DISABLE_MULTI_THREADS: 'true' | 'false';
		MAX_THREADS: string;
	}
}
