# Deployment Guide

This guide covers how to deploy the GitHub Notebooks (TypeScript) backend to an Ubuntu server.

We provide two methods:
1.  **Docker Deployment (Recommended)**: Easiest to manage and scale.
2.  **Manual Deployment**: Native installation on Ubuntu using PM2 and Nginx.

---

## Method 1: Docker Deployment (Recommended)

### Prerequisites
- An Ubuntu server (20.04 or 22.04 LTS).
- `git` installed.
- `docker` and `docker-compose` installed.

### Step 1: Install Docker
If you haven't installed Docker yet, run:

```bash
# Update packages
sudo apt update
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Install Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
sudo apt install -y docker-compose-plugin
# Or legacy docker-compose if needed: sudo apt install docker-compose
```

### Step 2: Clone and Configure
1. Clone the repository:
   ```bash
   git clone https://github.com/anzchy/github-notebooks-typescript.git
   cd github-notebooks-typescript
   ```

2. Setup Environment Variables:
   ```bash
   cp .env.example .env
   nano .env
   ```
   *Fill in your `SUPABASE_URL`, `SUPABASE_KEYS`, etc.*

### Step 3: Run with Docker Compose
```bash
# Build and start in detached mode
sudo docker compose up -d --build
```

### Step 4: Verify
Check if the container is running:
```bash
sudo docker compose ps
# Name                      Command             State           Ports
# github-notebooks-backend  "docker-entry..."   Up              0.0.0.0:5000->5000/tcp
```

Your API is now available at `http://YOUR_SERVER_IP:5000`.

---

## Method 2: Manual Deployment (Ubuntu + PM2 + Nginx)

If you prefer running directly on the host or cannot use Docker.

### Step 1: Install Node.js
Use NVM (Node Version Manager) to install Node.js 20.
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

### Step 2: Install Dependencies & Build
```bash
git clone https://github.com/anzchy/github-notebooks-typescript.git
cd github-notebooks-typescript

# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build
```

### Step 3: Configure Environment
```bash
cp .env.example .env
nano .env
# Ensure PORT=5000 and NODE_ENV=production
```

### Step 4: Setup Process Manager (PM2)
PM2 keeps your app alive and restarts it on crashes.

```bash
# Install PM2 globally
npm install -g pm2

# Start the app
pm2 start dist/app.js --name "github-notebooks"

# Save list for reboot
pm2 save

# Generate startup script (Copy/Paste the output command)
pm2 startup
```

### Step 5: Setup Nginx Reverse Proxy (Optional but Recommended)
Instead of exposing port 5000 directly, use Nginx to handle SSL and forward traffic.

1. Install Nginx:
   ```bash
   sudo apt update
   sudo apt install -y nginx
   ```

2. Create config:
   ```bash
   sudo nano /etc/nginx/sites-available/notebooks
   ```

3. Paste content:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com; # Or your IP

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/notebooks /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

## Updating the Deployment

### Docker Method
```bash
git pull origin main
sudo docker compose down
sudo docker compose up -d --build
```

### Manual Method
```bash
git pull origin main
npm install
npm run build
pm2 restart github-notebooks
```
