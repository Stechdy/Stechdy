# Stechdy Platform

Full-stack educational platform with Backend API và Frontend application.

## 📁 Project Structure

```
.
├── Stechdy_BE/          # Backend API (Node.js + Express + MongoDB)
├── Stechdy_FE/          # Frontend Application
├── docker-compose.yml   # Docker orchestration
├── nginx/               # Nginx reverse proxy configs
├── scripts/             # Deployment scripts
├── .github/workflows/   # CI/CD workflows
└── DEPLOYMENT.md        # Deployment guide
```

## 🚀 Quick Start

### Development

**Backend:**
```bash
cd Stechdy_BE/backend
npm install
cp .env.example .env
npm run dev
```

**Frontend:**
```bash
cd Stechdy_FE
npm install
npm run dev
```

### Production with Docker

```bash
# Start all services (Backend + MongoDB + Nginx)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🚢 Deployment

This project includes complete CI/CD setup for VPS deployment:
- ✅ Docker containerization
- ✅ Nginx reverse proxy with SSL (Let's Encrypt)
- ✅ MongoDB with data persistence
- ✅ Automated GitHub Actions deployment

**Live API:** https://stechdy.ai.vn

For complete deployment guide, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🛠️ Tech Stack

**Backend:**
- Node.js 18 + Express
- MongoDB 7.0
- Socket.IO (real-time)
- Passport.js (auth)
- Cloudinary (storage)

**Infrastructure:**
- Docker & Docker Compose
- Nginx (reverse proxy + SSL)
- GitHub Actions (CI/CD)
- Let's Encrypt (SSL certificates)

## 📚 Documentation

- [Backend README](./Stechdy_BE/README.md) - Backend API documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [Frontend README](./Stechdy_FE/README.md) - Frontend documentation

## 🔧 Configuration

### GitHub Secrets Required

For automated deployment, configure these secrets in GitHub repository settings:

- `BACKEND_ENV` - Backend environment variables (.env content)
- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub password
- `SSH_KEY` - Private SSH key for VPS access
- `VPS_IP` - VPS IP address

### Environment Variables

Create `.env` file in repository root:

```env
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your_secure_password
```

## 🐳 Docker Services

- **mongodb** - MongoDB 7.0 database
- **backend** - Node.js backend API
- **nginx** - Reverse proxy with SSL
- **certbot** - SSL certificate auto-renewal

## 🔄 CI/CD Workflow

Every push to `main` branch triggers automatic deployment:

1. **Build** - Build Docker image and push to Docker Hub
2. **Deploy** - Deploy to VPS via SSH
3. **Verify** - Health checks and rollback if needed

View deployment status in GitHub Actions tab.

## 📞 Support

For issues or questions, check:
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Troubleshooting guide
- GitHub Issues
- Backend logs: `docker-compose logs backend`

---

**Built with ❤️ by Stechdy Team**
