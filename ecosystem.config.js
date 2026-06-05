module.exports = {
  /**
   * This file manages multiple instances of the nirbachonhub application.
   * Each instance runs the backend and frontend for different projects.
   */
  apps: [
    {
      name: 'humam-backend',
      cwd: './backend',
      script: 'index.js',
      env: {
        PORT: 8001,
        NODE_ENV: 'production',
        DB_HOST: '127.0.0.1',
        DB_PORT: 3306,
        DB_USER: 'sedp_user',
        DB_PASS: 'Q&P@886@h12025',
        DB_NAME: 'nirbachonhub_humam',
        DB_DIALECT: 'mysql',
        JWT_SECRET: 'SEDP',
        JWT_EXPIRED_IN: '30d',
        SMTP_HOST: 'smtp.example.com',
        SMTP_PORT: 587,
        SMTP_USER: 'user@example.com',
        SMTP_PASS: 'password',
        SMTP_FROM: 'noreply@example.com',
        GEMINI_API_KEY: '',
        SOCIAL_ANALYTICS_URL: 'https://api.nirbachonhub.com',
        ZKTECO_IP: '192.168.1.106',
        ZKTECO_PORT: 4370,
        ZKTECO_TIMEOUT: 5200,
        DEFAULT_USER_PASSWORD: '123456',
        TZ: 'Asia/Dhaka',
        WHATSAPP_SESSION_NAME: 'humam',
        GROQ_API_KEY: ''
      }
    },
    {
      name: 'humam-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'start',
      env: {
        PORT: 3001,
        NEXT_DIST_DIR: '.next_humam',
        NEXT_PUBLIC_BASE_URL: 'https://api.humam.nirbachonhub.com',
        NEXT_PUBLIC_BASE_URL_FOR_CLIENT: 'https://humam.nirbachonhub.com',
        NEXT_JWT_EXPIRED_IN: '30d',
        NEXT_PUBLIC_ELECTION_DASHBOARD_EMBED_URL: 'https://lookerstudio.google.com/embed/reporting/cc2201de-a22d-4a64-8dd0-792c0f22f7d2/page/rt0iF',
      }
    },
    {
      name: 'shahjahan-backend',
      cwd: './backend',
      script: 'index.js',
      env: {
        PORT: 8002,
        NODE_ENV: 'production',
        DB_HOST: '127.0.0.1',
        DB_PORT: 3306,
        DB_USER: 'sedp_user',
        DB_PASS: 'Q&P@886@h12025',
        DB_NAME: 'nirbachonhub_shahjahan',
        DB_DIALECT: 'mysql',
        JWT_SECRET: 'SEDP',
        JWT_EXPIRED_IN: '30d',
        SMTP_HOST: 'smtp.example.com',
        SMTP_PORT: 587,
        SMTP_USER: 'user@example.com',
        SMTP_PASS: 'password',
        SMTP_FROM: 'noreply@example.com',
        GEMINI_API_KEY: '',
        SOCIAL_ANALYTICS_URL: 'https://api.nirbachonhub.com',
        ZKTECO_IP: '192.168.1.106',
        ZKTECO_PORT: 4370,
        ZKTECO_TIMEOUT: 5200,
        DEFAULT_USER_PASSWORD: '123456',
        TZ: 'Asia/Dhaka',
        WHATSAPP_SESSION_NAME: 'shahjahan',
        GROQ_API_KEY: ''
      }
    },
    {
      name: 'shahjahan-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'start',
      env: {
        PORT: 3002,
        NEXT_DIST_DIR: '.next_shahjahan',
        NEXT_PUBLIC_BASE_URL: 'https://api.shahjahan.nirbachonhub.com',
        NEXT_PUBLIC_BASE_URL_FOR_CLIENT: 'https://shahjahan.nirbachonhub.com',
        NEXT_JWT_EXPIRED_IN: '30d',
        NEXT_PUBLIC_ELECTION_DASHBOARD_EMBED_URL: 'https://lookerstudio.google.com/embed/reporting/6cd73909-ec0a-4215-971b-ede8bc3bf3c3/page/rt0iF'
      }
    },
    {
      name: 'amirkhasru-backend',
      cwd: './backend',
      script: 'index.js',
      env: {
        PORT: 8003,
        NODE_ENV: 'production',
        DB_HOST: '127.0.0.1',
        DB_PORT: 3306,
        DB_USER: 'sedp_user',
        DB_PASS: 'Q&P@886@h12025',
        DB_NAME: 'nirbachonhub_amirkhasru',
        DB_DIALECT: 'mysql',
        JWT_SECRET: 'SEDP',
        JWT_EXPIRED_IN: '30d',
        SMTP_HOST: 'smtp.example.com',
        SMTP_PORT: 587,
        SMTP_USER: 'user@example.com',
        SMTP_PASS: 'password',
        SMTP_FROM: 'noreply@example.com',
        GEMINI_API_KEY: '',
        SOCIAL_ANALYTICS_URL: 'https://api.nirbachonhub.com',
        ZKTECO_IP: '192.168.1.106',
        ZKTECO_PORT: 4370,
        ZKTECO_TIMEOUT: 5200,
        DEFAULT_USER_PASSWORD: '123456',
        TZ: 'Asia/Dhaka',
        WHATSAPP_SESSION_NAME: 'amirkhasru',
        GROQ_API_KEY: ''
      }
    },
    {
      name: 'amirkhasru-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'start',
      env: {
        PORT: 3003,
        NEXT_DIST_DIR: '.next_amirkhasru',
        NEXT_PUBLIC_BASE_URL: 'https://api.amirkhasru.nirbachonhub.com',
        NEXT_PUBLIC_BASE_URL_FOR_CLIENT: 'https://amirkhasru.nirbachonhub.com',
        NEXT_JWT_EXPIRED_IN: '30d',
        NEXT_PUBLIC_ELECTION_DASHBOARD_EMBED_URL: ''
      }
    },
  ]
};