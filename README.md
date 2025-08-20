# web-app-template

A **production-ready** full-stack deployment template with authentication, MFA, and automated deployment via GitHub Actions. Built with Docker, Nginx/Certbot (HTTPS), FastAPI, React, and MySQL.

## ✨ What's Included (Ready to Use)

- 🔐 **Complete Authentication System** - JWT + refresh tokens, MFA via email
- 🚀 **GitHub Actions CI/CD** - Automated deployment to your server
- 🔒 **HTTPS by Default** - Automatic SSL certificate management
- 🐳 **Docker Everything** - One-command deployment
- 📧 **SMTP Integration** - Email verification and MFA codes
- 🏗️ **Production Architecture** - Nginx reverse proxy, proper database setup

**Just add your business logic and deploy!**

## 🔧 Tech Stack

- **Frontend:** React with authentication flows (`/frontend`)
- **Backend:** FastAPI with JWT auth, MFA, email (`/backend`)
- **Database:** MySQL with user management schema (`/db`)
- **Proxy + HTTPS:** Nginx + Certbot (auto-renewal)
- **Deployment:** GitHub Actions → SSH → Docker deployment
- **Authentication:** JWT access/refresh tokens, TOTP MFA, email verification

## 📁 Project Structure

```
web-app-template/
├── .github/workflows/    # GitHub Actions CI/CD
│   └── deploy.yml        # Automated deployment workflow
│   └── renew-sslcert.yml # Automated checking and updating of cert
│   └── test.yml          # Automated test workflow
├── backend/              # FastAPI with auth system built-in
│   ├── auth/             # JWT, MFA, email verification
│   ├── database/         # User models and database setup
│   └── main.py           # Ready-to-extend API
├── frontend/             # React with login/register/MFA flows
│   ├── components/auth/  # Authentication components
│   └── pages/            # Login, register, dashboard pages
├── nginx/
│   ├── nginx.dev.conf    # Local development
│   ├── nginx.setup.conf  # SSL certificate setup
│   └── nginx.prod.conf   # Production with HTTPS
├── db/
│   └── migrations/       # User tables, auth schema (ready to use)
├── scripts/
│   ├── deploy.sh         # Production deployment script
│   └── cert_check.sh     # SSL certificate management
├── .env.example          # Complete environment template
├── compose.dev.yml       # Local development
├── compose.staging.yml   # E2E testing with Playwright
├── compose.test.yml      # Unit/integration tests
└── compose.yml           # Production deployment
```

## ⚙️ Environment Variables

Complete `.env` configuration (all authentication features included):

```env
# Backend Authentication
ALLOWED_ORIGINS=["http://localhost:8000"]
JWT_ALGORITHM=HS256
JWT_ACCESS_SECRET=your_super_secret_access_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
MFA_ENCRYPTION_KEY=your_32_char_encryption_key_here

# Email/SMTP (for MFA and verification)
SUPPORT_EMAIL=noreply@yourdomain.com
SUPPORT_EMAIL_PASSWORD=your_app_password

# Database
MYSQL_ROOT_PASSWORD=secure_root_password
MYSQL_DATABASE=webapp_db
MYSQL_USER=webapp_user
MYSQL_PASSWORD=secure_user_password
MYSQL_HOST=mysql_db
MYSQL_PORT=3306
DBMATE_DATABASE_URL=mysql://webapp_user:secure_user_password@mysql_db:3306/webapp_db
BACKEND_DATABASE_URL=mysql+pymysql://webapp_user:secure_user_password@mysql_db:3306/webapp_db

# Frontend
VITE_API_BASE_URL=/api

# Production Deployment
DOMAIN_ROOT=yourdomain.com
DOMAIN_NAME=www.yourdomain.com
SSL_CERT=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
SSL_CERT_KEY=/etc/letsencrypt/live/yourdomain.com/privkey.pem
CERTBOT_EMAIL=admin@yourdomain.com
CERTBOT_CONTAINER=web-app-template-certbot-setup-1
CERTBOT_VOLUME=web-app-template_certbot-etc
```

## 🚀 Quick Deployment (5 Minutes)

### 1. Fork & Configure

1. **Fork this repository**
2. **Set up your server** (Ubuntu 20.04+ recommended)
   - Point your domain's A record to server IP
   - Ensure ports 80, 443 are open
   - Ensure SSH is enabled
3. **Add GitHub Secrets** (Repository Settings → Secrets):
   ```
   PRODUCTION_KEY_PRIVATE   # Your server's SSH private key
   PRODUCTION_IP            # Your server's IP address
   PRODUCTION_USERNAME      # Server username (usually 'admin' or 'root')
   PRODUCTION_PORT          # You server's SSH Port
   ENV_FILE                 # Your complete .env file content
   ```

### 2. Deploy

- Push to `main` branch or manually trigger "Deploy to Production" workflow
- GitHub Actions will automatically:
  - Build your app
  - Deploy via SSH
  - Configure HTTPS with Let's Encrypt
  - Start all services

### 3. Ready!

Your app will be live at `https://yourdomain.com` with:

- ✅ User registration/login
- ✅ Email verification
- ✅ Two-factor authentication
- ✅ JWT token management
- ✅ HTTPS encryption
- ✅ Production monitoring

## 🔐 Built-in Authentication Features

### Frontend (React)

- Login/Register forms with validation
- Email verification flow
- MFA setup and verification
- Protected routes and auth guards
- Token refresh handling
- User dashboard template

### Backend (FastAPI)

- JWT access/refresh token system
- Password hashing (bcrypt)
- Email verification with secure tokens
- TOTP-based MFA (compatible with Google Authenticator)
- Password reset flows

### Database

- User table with auth fields
- MFA secrets and backup codes
- Email verification tracking
- Session management
- Ready-to-extend schema

## 🧪 Local Development

```bash
./scripts/run dev

# Your app runs at:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Docs: http://localhost:8000/docs
```

## 🧪 Testing

```bash
# Unit tests
./scripts/run test unit backend
./scripts/run test unit frontend

# Integration tests
./scripts/run test integration backend
./scripts/run test integration frontend

# E2E tests
./scripts/run test e2e

# PLaywright with UI
./scripts/run dev
./scripts/run playwright
```

## ✅ Customize for Your App

This template handles all the authentication/deployment boilerplate. **Just add your business logic:**

1. **Extend the database** schema in `/db/migrations/`
2. **Add your API endpoints** in `/backend/routers/`
3. **Build your frontend** pages in `/frontend/src/pages/`
4. **Configure your domain** in `.env`
5. **Deploy** with GitHub Actions

## 🛠️ Advanced Configuration

### Custom Email Templates

- Modify `/backend/templates/` for custom verification emails
- Update MFA email styling and branding

## 🌟 Example Use Cases

- **SaaS Applications** - User management ready, focus on features
- **E-commerce Sites** - Authentication + payments integration
- **API Services** - Secure endpoints from day one
- **MVPs & Prototypes** - Production-ready in minutes
- **Learning Projects** - Real-world authentication patterns

---

## 🛠️ License

MIT — Fork freely, deploy confidently, build amazing things!
