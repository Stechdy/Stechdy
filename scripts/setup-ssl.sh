#!/bin/bash

set -e

echo "🔐 Setting up SSL certificate for stechdy.ai.vn"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
DOMAIN="stechdy.ai.vn"
EMAIL="admin@stechdy.ai.vn"  # Change this to your email
DEPLOY_DIR="/opt/stechdy"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root${NC}"
    exit 1
fi

cd $DEPLOY_DIR

# Install Certbot if not already installed
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Certbot...${NC}"
    
    if [[ -f /etc/debian_version ]]; then
        # Debian/Ubuntu
        apt-get update
        apt-get install -y certbot
    elif [[ -f /etc/redhat-release ]]; then
        # CentOS/RHEL
        yum install -y certbot
    else
        echo -e "${RED}❌ Unsupported OS. Please install Certbot manually.${NC}"
        exit 1
    fi
fi

# Create directories for Certbot
mkdir -p certbot/conf
mkdir -p certbot/www

# Start Nginx temporarily for ACME challenge
echo -e "${YELLOW}🚀 Starting Nginx for ACME challenge...${NC}"
docker compose up -d nginx

# Wait for Nginx to start
sleep 5

# Request SSL certificate
echo -e "${YELLOW}📜 Requesting SSL certificate from Let's Encrypt...${NC}"
docker compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d www.$DOMAIN

# Check if certificate was created
if [ ! -f "certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    echo -e "${RED}❌ Failed to obtain SSL certificate${NC}"
    exit 1
fi

echo -e "${GREEN}✅ SSL certificate obtained successfully!${NC}"

# Restart Nginx to apply SSL
echo -e "${YELLOW}🔄 Restarting Nginx with SSL...${NC}"
docker compose restart nginx

# Setup auto-renewal cron job
echo -e "${YELLOW}⏰ Setting up auto-renewal...${NC}"

# Create renewal script
cat > /opt/stechdy/scripts/renew-ssl.sh << 'RENEWAL_SCRIPT'
#!/bin/bash
cd /opt/stechdy
docker compose run --rm certbot renew
docker compose restart nginx
RENEWAL_SCRIPT

chmod +x /opt/stechdy/scripts/renew-ssl.sh

# Add to crontab (runs twice daily)
CRON_JOB="0 0,12 * * * /opt/stechdy/scripts/renew-ssl.sh >> /var/log/certbot-renewal.log 2>&1"

# Check if cron job already exists
if ! crontab -l 2>/dev/null | grep -q "renew-ssl.sh"; then
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo -e "${GREEN}✅ Auto-renewal cron job added${NC}"
else
    echo -e "${YELLOW}⚠️  Auto-renewal cron job already exists${NC}"
fi

# Test auto-renewal
echo -e "${YELLOW}🧪 Testing auto-renewal...${NC}"
docker compose run --rm certbot renew --dry-run

echo -e "\n${GREEN}✅ SSL setup completed successfully!${NC}"
echo -e "${GREEN}🔐 Your site is now secured with HTTPS${NC}"
echo -e "${GREEN}🌐 Visit: https://$DOMAIN${NC}"
echo -e "\n${YELLOW}ℹ️  Certificate will auto-renew twice daily${NC}"
echo -e "${YELLOW}ℹ️  Renewal logs: /var/log/certbot-renewal.log${NC}"
