#!/bin/bash

# PulseOps VPS Deployment Setup Script
# For Backend + PostgreSQL (Docker)

set -e  # Exit on error

echo "====================================="
echo "   PulseOps Deployment Setup"
echo "====================================="

# ------------------------------
# Step 1: Check requirements
# ------------------------------
echo ""
echo "[1/7] Checking system requirements..."

if ! command -v curl &> /dev/null
then
    echo "curl is not installed! Please install curl first."
    exit 1
fi

if ! command -v docker &> /dev/null
then
    echo "Docker is not installed! Installing Docker..."
    
    # Install Docker for Debian/Ubuntu
    if [ -f /etc/debian_version ]; then
        sudo apt-get update -y
        sudo apt-get install -y ca-certificates curl gnupg lsb-release
        sudo install -m 0755 -d /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        echo \
          "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
          $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        sudo apt-get update -y
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    fi
    
    # For other distros, user needs to install Docker manually
fi

if ! command -v node &> /dev/null
then
    echo "Node.js is not installed! Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

if ! command -v pnpm &> /dev/null
then
    echo "pnpm is not installed! Installing pnpm..."
    npm install -g pnpm
fi

echo "Requirements checked!"

# ------------------------------
# Step 2: Start PostgreSQL via Docker
# ------------------------------
echo ""
echo "[2/7] Starting PostgreSQL database..."
cd /Users/rusil/Developer/pulseops || cd "$(dirname "$0")"

if [ ! "$(docker ps -q -f name=pulseops-db)" ]; then
    docker compose up -d postgres
    echo "Waiting for PostgreSQL to start..."
    sleep 5
else
    echo "PostgreSQL is already running!"
fi

echo "PostgreSQL is up and running!"

# ------------------------------
# Step 3: Configure Backend Environment
# ------------------------------
echo ""
echo "[3/7] Configuring backend environment..."

cd backend
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    
    # Generate random secrets
    JWT_SECRET=$(openssl rand -base64 32)
    
    # Update .env with default values
    sed -i "s|PORT=|PORT=5000|g" .env
    sed -i "s|DATABASE_URL=|DATABASE_URL=postgresql://pulseops:pulseops123@localhost:5432/pulseops|g" .env
    sed -i "s|JWT_SECRET=|JWT_SECRET=$JWT_SECRET|g" .env
    
    echo ""
    echo "⚠️  Please edit backend/.env and fill in:"
    echo "   - RESEND_API_KEY (from resend.com)"
    echo "   - FROM_EMAIL (your email)"
    echo "   - FRONTEND_URL (your Vercel URL)"
fi

echo "Environment configured!"

# ------------------------------
# Step 4: Install Backend Dependencies
# ------------------------------
echo ""
echo "[4/7] Installing backend dependencies..."
pnpm install

echo "Dependencies installed!"

# ------------------------------
# Step 5: Run Database Migrations
# ------------------------------
echo ""
echo "[5/7] Running database migrations..."
pnpm db:migrate 2>/dev/null || pnpm db:generate && pnpm db:migrate

echo "Migrations applied!"

# ------------------------------
# Step 6: Create a simple systemd service (for auto-start)
# ------------------------------
echo ""
echo "[6/7] Setting up auto-start service..."

# Create systemd service
SERVICE_FILE="/etc/systemd/system/pulseops.service"
if [ ! -f "$SERVICE_FILE" ]; then
    echo "Creating systemd service..."
    sudo bash -c "cat > $SERVICE_FILE << EOF
[Unit]
Description=PulseOps Backend
After=network.target postgresql.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
ExecStart=$(which node) $(pwd)/server.js
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF
"

    sudo systemctl daemon-reload
    sudo systemctl enable pulseops.service
    
    echo "✅ Systemd service created!"
else
    echo "Systemd service already exists!"
fi

# ------------------------------
# Step 7: Done!
# ------------------------------
echo ""
echo "====================================="
echo " Setup Complete! "
echo "====================================="
echo ""
echo "Next steps:"
echo "1. Edit backend/.env and fill in missing values"
echo "2. Start the backend: sudo systemctl start pulseops"
echo "3. Check status: sudo systemctl status pulseops"
echo "4. View logs: sudo journalctl -u pulseops -f"
echo ""
echo "For manual start (without systemd):"
echo "cd backend && pnpm start"
echo ""
echo "====================================="
