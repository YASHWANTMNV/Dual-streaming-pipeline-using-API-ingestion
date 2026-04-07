# Production Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the Dual Streaming Crypto Pipeline to production.

---

## Pre-Deployment Checklist

### Backend
- [ ] Update `NODE_ENV=production` in environment
- [ ] Set secure admin credentials (change default admin/admin123)
- [ ] Configure database credentials in `.env`
- [ ] Generate strong API keys for external services
- [ ] Enable HTTPS/SSL for frontend
- [ ] Configure CORS for your domain
- [ ] Set up proper logging and monitoring
- [ ] Backup existing database

### Frontend
- [ ] Build optimized production bundle
- [ ] Update API base URL to production backend
- [ ] Enable compression and caching headers
- [ ] Set CSP (Content Security Policy) headers
- [ ] Test all features on production-like environment
- [ ] Verify performance and load times

---

## Environment Configuration

### Backend `.env` File

```env
# Server
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com

# Database
DB_HOST=your-db-host.com
DB_USER=crypto_user
DB_PASSWORD=STRONG_PASSWORD_HERE
DB_NAME=crypto_pipeline
DB_POOL_SIZE=10

# API
COINGECKO_BASE_URL=https://api.coingecko.com/api/v3
POLL_INTERVAL_MS=5000

# Security
JWT_SECRET=your_super_secret_jwt_key_change_this
SESSION_TIMEOUT_MS=86400000

# Monitoring
LOG_LEVEL=info
ENABLE_METRICS=true
```

### Frontend `.env` File (create in frontend root)

```env
VITE_BACKEND_URL=https://yourdomain.com/api
VITE_WS_URL=wss://yourdomain.com
VITE_ENV=production
```

---

## Database Setup

### MySQL Database

Create database and tables:

```sql
CREATE DATABASE IF NOT EXISTS crypto_pipeline;
USE crypto_pipeline;

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE crypto_prices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  coin_id VARCHAR(50) NOT NULL,
  coin_name VARCHAR(100) NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  current_price DECIMAL(18, 8),
  price_change_pct_24h DECIMAL(10, 4),
  market_cap DECIMAL(20, 2),
  total_volume DECIMAL(20, 2),
  fetched_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_coin_id (coin_id),
  INDEX idx_created_at (created_at)
);

CREATE TABLE api_keys (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  provider VARCHAR(50),
  api_key_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE datasets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(255),
  file_path VARCHAR(500),
  record_count INT,
  column_count INT,
  uploaded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert default admin user (CHANGE PASSWORD!)
INSERT INTO users (username, password_hash, full_name, role) VALUES
('admin', SHA2('CHANGE_THIS_PASSWORD', 256), 'Administrator', 'administrator');
```

---

## Docker Deployment

### Backend Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "src/server.js"]
```

### Frontend Dockerfile

```dockerfile
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      DB_HOST: db
      DB_USER: crypto_user
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: crypto_pipeline
    depends_on:
      - db
    networks:
      - crypto-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - crypto-network

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: crypto_pipeline
      MYSQL_USER: crypto_user
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - db-data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - crypto-network

networks:
  crypto-network:
    driver: bridge

volumes:
  db-data:
```

---

## SSL/HTTPS Setup

### Using Let's Encrypt with Nginx

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d yourdomain.com

# Auto-renew
sudo systemctl enable certbot.timer
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Frontend
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api {
        proxy_pass http://backend:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket
    location /socket.io {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Performance Optimization

### Backend
- Enable connection pooling for database
- Implement response caching
- Enable gzip compression
- Use PM2 for process management
- Monitor memory and CPU usage

### Frontend
- Enable lazy loading for routes
- Optimize bundle size (tree-shaking)
- Enable service workers
- Use CDN for static assets
- Enable browser caching

### Database
- Create indexes on frequently queried columns
- Implement table partitioning
- Set up automated backups
- Monitor query performance

---

## Monitoring & Logging

### Application Monitoring

```javascript
// Example: PM2 Configuration
module.exports = {
  apps: [{
    name: 'crypto-backend',
    script: './src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: { NODE_ENV: 'production' },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  }]
};
```

### Recommended Tools
- **Monitoring:** Prometheus + Grafana
- **Logging:** ELK Stack (Elasticsearch, Logstash, Kibana)
- **Uptime:** Uptime Robot or similar
- **Error Tracking:** Sentry
- **Performance:** New Relic or DataDog

---

## Security Best Practices

### Authentication
- Use strong passwords (minimum 16 characters)
- Implement rate limiting on login endpoint
- Use HTTPS only
- Implement session timeout
- Consider 2FA

### API Security
- Validate all inputs
- Sanitize outputs
- Implement CORS properly
- Use API key rotation
- Log all sensitive operations

### Database
- Use parameterized queries
- Encrypt sensitive data
- Set up automated backups
- Limit database user permissions
- Enable access logs

### Infrastructure
- Use firewall rules
- Implement DDoS protection
- Keep systems updated
- Use VPN for admin access
- Regular security audits

---

## Backup & Recovery

### Automated Backup Strategy

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/crypto-pipeline"
DB_HOST="localhost"
DB_NAME="crypto_pipeline"
DB_USER="backup_user"

# Daily database backup
mysqldump -h $DB_HOST -u $DB_USER -p $DB_NAME | gzip > $BACKUP_DIR/db-$(date +%Y%m%d).sql.gz

# Keep last 7 days of backups
find $BACKUP_DIR -type f -mtime +7 -delete

# Upload to cloud storage (AWS S3)
aws s3 sync $BACKUP_DIR s3://your-bucket/backups/
```

---

## Deployment Steps

### 1. Prepare Server
```bash
ssh user@production-server

# Update system
sudo apt-get update && apt-get upgrade -y

# Install dependencies
sudo apt-get install -y nodejs npm mysql-server nginx docker.io docker-compose
```

### 2. Clone Repository
```bash
cd /opt
git clone https://github.com/your-repo/crypto-pipeline.git
cd crypto-pipeline
```

### 3. Build Images
```bash
docker-compose build
```

### 4. Create .env File
```bash
# Create and edit
nano .env

# Add production configuration
NODE_ENV=production
DB_PASSWORD=your_secure_password
MYSQL_ROOT_PASSWORD=your_root_password
```

### 5. Start Services
```bash
docker-compose up -d

# Verify
docker-compose ps
docker-compose logs -f
```

### 6. Setup SSL
```bash
sudo certbot certonly --nginx -d yourdomain.com
```

### 7. Health Check
```bash
curl -k https://yourdomain.com/health
curl -k https://yourdomain.com/api/latest
```

---

## Rollback Procedure

If deployment fails:

```bash
# Stop current version
docker-compose down

# Restore from backup
docker-compose up -d --build

# Or revert to previous image
docker-compose down
git checkout previous-version
docker-compose up -d
```

---

## Maintenance

### Regular Tasks
- Monitor logs daily
- Check disk usage weekly
- Review security logs monthly
- Update dependencies monthly
- Rotate API keys quarterly
- Full security audit annually

### Update Process
1. Test updates in staging
2. Create backup
3. Stop services
4. Update code/dependencies
5. Run migrations
6. Start services
7. Monitor for errors
8. Rollback if needed

---

## Support & Troubleshooting

### Common Issues

**Connection refused on port 5000**
- Check if backend is running: `docker ps`
- Check logs: `docker-compose logs backend`
- Verify firewall rules

**Database connection error**
- Check MySQL is running: `docker-compose ps db`
- Verify credentials in .env
- Check database exists: `mysql -u root -p -e "SHOW DATABASES;"`

**High memory usage**
- Check for memory leaks: `docker stats`
- Increase container limits in docker-compose.yml
- Implement cache expiration

**Slow API responses**
- Monitor database: `SHOW PROCESSLIST;`
- Add indexes to frequently queried columns
- Check rate limiter hasn't kicked in

---

## Production Checklist

- [ ] All environment variables configured
- [ ] Database initialized and tested
- [ ] SSL certificate installed
- [ ] Backups automated and tested
- [ ] Monitoring and alerting set up
- [ ] Logging configured
- [ ] Security audit completed
- [ ] Load testing successful
- [ ] Disaster recovery plan documented
- [ ] Team trained on deployment and rollback
- [ ] On-call rotation established
- [ ] SLA/SLO defined

---

For additional help, contact your DevOps team or refer to the API documentation.
