# web-cloud-template

A minimal full-stack deployment template that uses Docker, Nginx, Certbot (for HTTPS), and MySQL — ready to run on a real cloud server with a real domain name.

This repo is ideal for:

- Trying out production deployment with Docker
- Forking and adapting for your own web apps
- Referencing when deploying other projects

## 🔧 Tech Stack

- **Frontend:** React (or any static frontend in `/frontend`)
- **Backend:** FastAPI (or any backend in `/backend`)
- **Database:** MySQL (via Docker)
- **Proxy + HTTPS:** Nginx + Certbot
- **Deployment:** Shell script via `ssh`, GitHub Actions-ready

## 📁 Project Structure

```
cloud-deploy-template/
├── backend/              # Backend app
├── frontend/             # Frontend app
├── nginx/                
│   └── nginx.dev.conf    # Nginx configuration for local dev   
│   └── nginx.setup.conf  # Nginx configuration for cerbot validation and renewal 
│   └── nginx.prod.conf   # Nginx configuration for production
├── sql/                  # SQL schema & seed data (optional)
│   └── schema.sql
├── docker-compose.yml    # Core services: backend, frontend, MySQL
├── .env.example          # Environment variable template
├── scripts/
│   └── deploy.sh         # SSH-based deploy script
│   └── cert_check.sh     # Script for creating and renewing SSL Certificate 
└── README.md
```

## ⚙️ Environment Variables

Create a `.env` file in the root or use GitHub Secrets for CI/CD:

```env
# Example .env file
DOMAIN=example.com
MYSQL_ROOT_PASSWORD=changeme
MYSQL_DATABASE=app_db
MYSQL_USER=app_user
MYSQL_PASSWORD=securepass
```

## 🚀 Deployment

### 1. Prepare your server

- Set up a cloud VM (Ubuntu 22.04+ recommended)
- Point your domain’s A record to your server’s IP
- Ensure ports 80 and 443 are open

### 2. SSH into the server and run:

```bash
git clone https://github.com/anthonyb8/cloud-deploy-template.git
cd cloud-deploy-template
cp .env.example .env  # Edit with real secrets
chmod +x ./scripts/deploy.sh
./scripts/deploy.sh
```

This will:

- Build and start all services via Docker
- Configure HTTPS with Certbot
- Serve your app via Nginx reverse proxy

## ✅ To Do / Customize

- [ ] Replace frontend/backend placeholders with your own code
- [ ] Add `schema.sql` to auto-init the database (via volume or script)
- [ ] Optionally configure GitHub Actions for CI/CD deployment

## 🧪 Example Use Cases

- Fast prototyping in real environments
- Learning real-world deployment with Docker
- Spinning up test environments with HTTPS

---

## 🛠️ License

MIT — fork freely and deploy confidently
