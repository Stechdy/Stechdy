# Stechdy Backend Deployment Guide

Hướng dẫn chi tiết để deploy Stechdy Backend lên VPS với Docker, Nginx SSL, và MongoDB.

## 📋 Prerequisites

### Trên VPS
- Ubuntu 20.04+ hoặc CentOS 7+ (recommend Ubuntu 22.04)
- Docker và Docker Compose đã cài đặt
- Domain đã trỏ về IP của VPS (A record)
- Port 80 và 443 mở (cho HTTP và HTTPS)
- Port 22 mở (cho SSH)
- Ít nhất 2GB RAM và 20GB disk space

### Trên GitHub
Các secrets sau đã được tạo trong repository Settings → Secrets and variables → Actions:
- `BACKEND_ENV` - Nội dung file .env của backend
- `DOCKER_USERNAME` - Username Docker Hub
- `DOCKER_PASSWORD` - Password Docker Hub
- `SSH_KEY` - Private SSH key để connect VPS
- `VPS_IP` - IP address của VPS

## 🚀 First-Time VPS Setup

### 1. Install Docker và Docker Compose

```bash
# SSH vào VPS
ssh root@<VPS_IP>

# Update system
apt-get update && apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt-get install -y docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

### 2. Tạo thư mục deployment

```bash
mkdir -p /opt/stechdy
cd /opt/stechdy
```

### 3. Clone hoặc copy files

**Option A: Clone từ GitHub (recommend)**
```bash
git clone https://github.com/<your-username>/Stechdy.git .
```

**Option B: Copy files từ local**
```bash
# Trên máy local
scp -r docker-compose.yml nginx/ scripts/ backend/.env root@<VPS_IP>:/opt/stechdy/
```

### 4. Cấu hình MongoDB credentials

Tạo file `.env` trong `/opt/stechdy/`:

```bash
cat > .env << EOF
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=<your-secure-password>
EOF
```

**⚠️ QUAN TRỌNG:** Thay `<your-secure-password>` bằng password mạnh!

### 5. Setup SSL Certificate

```bash
cd /opt/stechdy

# Cấp quyền execute cho script
chmod +x scripts/setup-ssl.sh

# Chạy SSL setup script
./scripts/setup-ssl.sh
```

Script sẽ:
- Cài đặt Certbot
- Tạo SSL certificate cho `stechdy.ai.vn`
- Setup auto-renewal (chạy 2 lần/ngày)
- Restart Nginx với SSL

**⚠️ Lưu ý:** Email trong script được set là `admin@stechdy.ai.vn`. Bạn có thể đổi trong file `scripts/setup-ssl.sh` trước khi chạy.

### 6. Start Services

```bash
cd /opt/stechdy

# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### 7. Verify Deployment

```bash
# Test HTTP → HTTPS redirect
curl -I http://stechdy.ai.vn

# Test HTTPS API
curl https://stechdy.ai.vn/

# Should return: {"message": "Welcome to S-Techdy API"}
```

## 🔄 GitHub Actions Auto-Deployment

Sau khi setup xong VPS, mọi push lên branch `main` sẽ tự động trigger deployment.

### Workflow Steps

1. **Build Stage:**
   - Build Docker image từ `backend/Dockerfile`
   - Push image lên Docker Hub với tag `latest` và commit SHA

2. **Deploy Stage:**
   - Copy files lên VPS qua SSH
   - Pull latest Docker image
   - Stop old containers
   - Start new containers
   - Verify health checks

### Xem Deployment Logs

Vào GitHub repository → Actions tab để xem logs của mỗi deployment.

## 🔧 Configuration

### Environment Variables

File `backend/.env` cần có các biến sau (đã được inject từ `BACKEND_ENV` secret):

```env
# Application
PORT=3001
NODE_ENV=production
JWT_SECRET=<your-jwt-secret>

# Database (sẽ được override bởi Docker Compose)
MONGODB_URI=mongodb://admin:<password>@mongodb:27017/Stechdy?authSource=admin

# Google OAuth
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=<your-email>
EMAIL_PASSWORD=<your-app-password>

# Cloudinary
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>

# Frontend URL
FRONTEND_URL=https://stechdy.ai.vn
```

### Docker Compose Services

- **mongodb**: MongoDB 7.0, port 27017 (internal only)
- **backend**: Node.js app, port 3001 (internal only)
- **nginx**: Reverse proxy, ports 80 & 443 (public)
- **certbot**: SSL certificate auto-renewal

## 📊 Monitoring & Maintenance

### Check Service Status

```bash
cd /opt/stechdy

# View all containers
docker compose ps

# View logs
docker compose logs -f backend
docker compose logs -f mongodb
docker compose logs -f nginx
```

### Database Backup

```bash
# Backup MongoDB
docker compose exec mongodb mongodump \
  --uri="mongodb://admin:<password>@localhost:27017/Stechdy?authSource=admin" \
  --out=/data/backup

# Copy backup to host
docker cp stechdy-mongodb:/data/backup ./mongodb-backup-$(date +%Y%m%d)
```

### Restore Database

```bash
# Copy backup to container
docker cp ./mongodb-backup stechdy-mongodb:/data/restore

# Restore
docker compose exec mongodb mongorestore \
  --uri="mongodb://admin:<password>@localhost:27017" \
  /data/restore
```

### Update SSL Certificate Manually

```bash
cd /opt/stechdy

# Renew certificate
docker compose run --rm certbot renew

# Restart Nginx
docker compose restart nginx
```

### Clean Up Old Docker Images

```bash
# Remove unused images
docker image prune -af

# Remove old containers
docker container prune -f

# Remove unused volumes (⚠️ careful with this)
docker volume prune -f
```

## 🐛 Troubleshooting

### Issue: SSL Certificate Failed

**Cause:** Domain chưa trỏ đúng về VPS

**Solution:**
```bash
# Check DNS
nslookup stechdy.ai.vn

# Verify A record points to VPS IP
dig stechdy.ai.vn +short
```

### Issue: Backend Cannot Connect to MongoDB

**Cause:** MongoDB chưa healthy hoặc credentials sai

**Solution:**
```bash
# Check MongoDB logs
docker-compose logs mongodb

# Verify MongoDB health
docker inspect stechdy-mongodb | grep Health -A 10

# Test connection
docker-compose exec backend node -e "
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected'))
    .catch(err => console.error('❌ Error:', err));
"
```

### Issue: Nginx 502 Bad Gateway

**Cause:** Backend service chưa sẵn sàng

**Solution:**
```bash
# Check backend health
docker inspect stechdy-backend | grep Health -A 10

# Restart backend
docker-compose restart backend

# Wait 30s then check again
curl https://stechdy.ai.vn/
```

### Issue: Port Already in Use

**Cause:** Port 80 hoặc 443 đã được service khác sử dụng

**Solution:**
```bash
# Check what's using port 80
sudo lsof -i :80

# Stop conflicting service (ví dụ: Apache)
sudo systemctl stop apache2
sudo systemctl disable apache2

# Start Nginx again
docker-compose up -d nginx
```

## 🔐 Security Best Practices

1. **Strong Passwords:**
   - Sử dụng password mạnh cho MongoDB
   - Rotate JWT_SECRET định kỳ

2. **Firewall:**
   ```bash
   # Install UFW
   apt-get install -y ufw
   
   # Allow SSH, HTTP, HTTPS
   ufw allow 22
   ufw allow 80
   ufw allow 443
   
   # Enable firewall
   ufw enable
   ```

3. **SSH Key Only:**
   - Disable password authentication
   - Chỉ dùng SSH key để login

4. **Regular Updates:**
   ```bash
   # Update Docker images monthly
   docker-compose pull
   docker-compose up -d
   ```

5. **MongoDB Access:**
   - MongoDB chỉ accessible trong Docker network
   - Không expose port 27017 ra ngoài

## 📞 Support

Nếu gặp vấn đề:
1. Check logs: `docker-compose logs -f`
2. Verify health: `docker-compose ps`
3. Review GitHub Actions logs
4. Check Nginx error logs: `docker-compose logs nginx`

## 🔄 Manual Deployment

Nếu cần deploy manually (không qua GitHub Actions):

```bash
# SSH vào VPS
ssh root@<VPS_IP>

cd /opt/stechdy

# Pull latest code (if using git)
git pull origin main

# Run deployment script
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

---

**🎉 Deployment hoàn tất!** API của bạn đã sẵn sàng tại: `https://stechdy.ai.vn`
