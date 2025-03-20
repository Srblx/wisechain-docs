# Guide de Déploiement sur Scaleway avec Docker

## Introduction

Ce guide explique comment déployer l'application wisechain sur Scaleway en utilisant Docker.

## Prérequis

- Un compte Scaleway
- Docker et Docker Compose installés localement
- Accès au registre d'images Docker (DockerHub, GitLab Registry, etc.)
- Clés SSH configurées

## Architecture de déploiement

```
┌─────────────────────────────────────────────────┐
│                 Scaleway Cloud                  │
│                                                 │
│  ┌─────────────┐       ┌─────────────────────┐  │
│  │             │       │                     │  │
│  │  Instance   │       │  Database Instance  │  │
│  │  (Docker)   │◄─────►│  (MySQL)            │  │
│  │             │       │                     │  │
│  └─────┬───────┘       └─────────────────────┘  │
│        │                                        │
│        │       ┌─────────────────────┐          │
│        │       │                     │          │
│        └──────►│  Object Storage     │          │
│                │  (S3 compatible)    │          │
│                │                     │          │
│                └─────────────────────┘          │
└─────────────────────────────────────────────────┘
```

## Configuration de l'instance Scaleway

### 1. Création d'une instance

1. Connectez-vous à la console Scaleway
2. Naviguez vers Instances > Create Instance
3. Sélectionnez une instance de type DEV1-L (4 vCPUs, 8 GB RAM)
4. Choisissez Debian 11 comme système d'exploitation
5. Ajoutez votre clé SSH
6. Créez l'instance

### 2. Configuration du réseau

1. Allez dans Network > Security Groups
2. Créez un nouveau groupe de sécurité pour votre application
3. Autorisez les ports suivants :
   - 22 (SSH)
   - 80 (HTTP)
   - 443 (HTTPS)
4. Associez ce groupe de sécurité à votre instance

### 3. Configuration DNS

1. Achetez un nom de domaine ou utilisez un existant
2. Configurez les enregistrements DNS pour pointer vers l'IP de votre instance :
   - Type A : `wisechain.fr` → `<IP_INSTANCE>`
   - Type A : `www.wisechain.fr` → `<IP_INSTANCE>`
   - Type A : `api.wisechain.fr` → `<IP_INSTANCE>`

## Configuration de la base de données

### 1. Création d'une base de données managée

1. Allez dans Databases > Create a Database
2. Sélectionnez MySQL
3. Choisissez un plan adapté à vos besoins (Start-S est suffisant pour commencer)
4. Configurez un utilisateur et un mot de passe sécurisé
5. Notez les informations de connexion

### 2. Configuration de la base de données

1. Connectez-vous à la base de données via un client MySQL
2. Créez une base de données pour votre application :
   ```sql
   CREATE DATABASE wisechain CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

## Déploiement avec Docker

### 1. Préparation des images Docker

Construisez et publiez vos images Docker :

```bash
# Construction de l'image
docker build -t registry.example.com/wisechain/frontend:latest ./frontend
docker build -t registry.example.com/wisechain/backend:latest ./backend

# Publication des images
docker push registry.example.com/wisechain/frontend:latest
docker push registry.example.com/wisechain/backend:latest
```

### 2. Configuration sur l'instance Scaleway

Connectez-vous à votre instance :

```bash
ssh root@<IP_INSTANCE>
```

Installez Docker et Docker Compose :

```bash
# Mise à jour des paquets
apt update && apt upgrade -y

# Installation des dépendances
apt install apt-transport-https ca-certificates curl software-properties-common -y

# Ajout de la clé GPG Docker
curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Ajout du dépôt Docker
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Mise à jour et installation de Docker
apt update
apt install docker-ce docker-compose -y

# Démarrage et activation de Docker
systemctl start docker
systemctl enable docker
```

### 3. Création du fichier docker-compose.yml

Créez un répertoire pour votre application :

```bash
mkdir -p /opt/wisechain
cd /opt/wisechain
```

Créez le fichier docker-compose.yml :

<!-- ```yaml
# version: '3.8'

# services:
#   frontend:
#     image: registry.example.com/wisechain/frontend:latest
#     restart: always
#     environment:
#       - NODE_ENV=production
#       - NEXT_PUBLIC_API_URL=https://api.wisechain.fr
#     ports:
#       - "3000:3000"
#     depends_on:
#       - backend
#     networks:
#       - wisechain-network

#   backend:
#     image: registry.example.com/wisechain/backend:latest
#     restart: always
#     environment:
#       - NODE_ENV=production
#       - DATABASE_URL=mysql://user:password@db-mysql-fra1-12345-do-user-12345-0.b.db.ondigitalocean.com:25060/wisechain?ssl-mode=REQUIRED
#       - JWT_SECRET=votre_secret_jwt_tres_securise
#     ports:
#       - "3001:3001"
#     networks:
#       - wisechain-network

#   nginx:
#     image: nginx:alpine
#     restart: always
#     ports:
#       - "80:80"
#       - "443:443"
#     volumes:
#       - ./nginx:/etc/nginx/conf.d
#       - ./certbot/conf:/etc/letsencrypt
#       - ./certbot/www:/var/www/certbot
#     depends_on:
#       - frontend
#       - backend
#     networks:
#       - wisechain-network

#   certbot:
#     image: certbot/certbot
#     volumes:
#       - ./certbot/conf:/etc/letsencrypt
#       - ./certbot/www:/var/www/certbot
#     entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"

# networks:
#   wisechain-network:
#     driver: bridge
# ``` -->
```yaml
version: "3.8"

services:
  s3:
    image: minio/minio:latest
    environment:
      MINIO_ROOT_USER: site-name
      MINIO_ROOT_PASSWORD: site-password
    ports:
      - 9000:9000
      - 8900:8900
    volumes:
      - minio:/data/minio
      - /etc/letsencrypt/live/folder-root/.minio/certs/public.crt:ro
      - /etc/letsencrypt/live/folder-root/.minio/certs/private.key:ro
    command: 'minio server /data/minio --console-address ":8900"'

networks:
  faable-network:
    driver: overlay

volumes:
  minio:
    driver: local
```    

### 4. Configuration Nginx

Créez le répertoire pour la configuration Nginx :

```bash
mkdir -p /opt/wisechain/nginx
```

Créez le fichier de configuration Nginx :

```bash
cat > /opt/site-name/nginx/default.conf << 'EOF'
server {
    listen 80;
    server_name site-name.fr www.site-name.fr;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name site-name.fr www.site-name.fr;
    
    ssl_certificate /etc/letsencrypt/live/site-name.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/site-name.fr/privkey.pem;
    
    location / {
        proxy_pass http://frontend:PORT_FRONTEND;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name api.site-name.fr;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name api.site-name.fr;
    
    ssl_certificate /etc/letsencrypt/live/api.site-name.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.site-name.fr/privkey.pem;
    
    location / {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
```

### 5. Initialisation des certificats SSL

Créez les répertoires pour Certbot :

```bash
mkdir -p /opt/site-name/certbot/conf
mkdir -p /opt/site-name/certbot/www
```

Démarrez Nginx pour la première fois :

```bash
cd /opt/site-name
docker-compose up -d nginx
```

Obtenez les certificats SSL :

```bash
docker-compose run --rm certbot certonly --webroot --webroot-path=/var/www/certbot --email votre@email.com --agree-tos --no-eff-email -d site-name.fr -d www.site-name.fr
docker-compose run --rm certbot certonly --webroot --webroot-path=/var/www/certbot --email votre@email.com --agree-tos --no-eff-email -d api.site-name.fr
```

Redémarrez Nginx pour appliquer les certificats :

```bash
docker-compose restart nginx
```

### 6. Démarrage de l'application

Démarrez tous les services :

```bash
docker-compose up -d
```

Vérifiez que tout fonctionne correctement :

```bash
docker-compose ps
```

## Maintenance et mises à jour

### Mise à jour des images Docker

Pour mettre à jour votre application :

```bash
# Tirez les dernières images
docker-compose pull

# Redémarrez les services
docker-compose up -d
```

### Sauvegarde de la base de données

Configurez des sauvegardes régulières de votre base de données :

```bash
# Créez un script de sauvegarde
cat > /opt/wisechain/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_DIR="/opt/wisechain/backups"

# Créez le répertoire de sauvegarde s'il n'existe pas
mkdir -p $BACKUP_DIR

# Variables de connexion à la base de données
DB_HOST="db-mysql-fra1-12345-do-user-12345-0.b.db.ondigitalocean.com"
DB_PORT="25060"
DB_USER="user"
DB_PASS="password"
DB_NAME="wisechain"

# Sauvegarde de la base de données
mysqldump --host=$DB_HOST --port=$DB_PORT --user=$DB_USER --password=$DB_PASS --ssl-mode=REQUIRED $DB_NAME > $BACKUP_DIR/wisechain_$DATE.sql

# Compression de la sauvegarde
gzip $BACKUP_DIR/wisechain_$DATE.sql

# Suppression des sauvegardes de plus de 30 jours
find $BACKUP_DIR -name "wisechain_*.sql.gz" -type f -mtime +30 -delete

# Log
echo "Sauvegarde terminée: $BACKUP_DIR/wisechain_$DATE.sql.gz" >> $BACKUP_DIR/backup.log
EOF

# Rendre le script exécutable
chmod +x /opt/wisechain/backup.sh

# Ajouter une tâche cron pour exécuter le script quotidiennement
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/wisechain/backup.sh") | crontab -
```

### Monitoring

Pour surveiller votre application, vous pouvez utiliser des outils comme Prometheus et Grafana :

```bash
# Créez un répertoire pour le monitoring
mkdir -p /opt/wisechain/monitoring

# Créez un fichier docker-compose pour le monitoring
cat > /opt/wisechain/monitoring/docker-compose.yml << 'EOF'
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus:/etc/prometheus
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--web.enable-lifecycle'
    ports:
      - "9090:9090"
    restart: always
    networks:
      - monitoring-network

  grafana:
    image: grafana/grafana:latest
    volumes:
      - grafana_data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=secure_password
      - GF_USERS_ALLOW_SIGN_UP=false
    ports:
      - "3100:3000"
    restart: always
    networks:
      - monitoring-network

  node-exporter:
    image: prom/node-exporter:latest
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    ports:
      - "9100:9100"
    restart: always
    networks:
      - monitoring-network

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro
    ports:
      - "8080:8080"
    restart: always
    networks:
      - monitoring-network

networks:
  monitoring-network:
    driver: bridge

volumes:
  prometheus_data:
  grafana_data:
EOF

# Créez la configuration Prometheus
mkdir -p /opt/wisechain/monitoring/prometheus
cat > /opt/wisechain/monitoring/prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']
EOF

# Démarrez les services de monitoring
cd /opt/wisechain/monitoring
docker-compose up -d
```

## Sécurité

### Pare-feu

Configurez un pare-feu pour limiter l'accès à votre serveur :

```bash
# Installation de UFW
apt install ufw -y

# Configuration des règles de base
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https

# Activation du pare-feu
ufw enable
```

### Mises à jour de sécurité automatiques

Configurez des mises à jour de sécurité automatiques :

```bash
apt install unattended-upgrades -y
dpkg-reconfigure -plow unattended-upgrades
```

## Dépannage

### Vérification des logs

Pour vérifier les logs des conteneurs :

```bash
# Logs de tous les services
docker-compose logs

# Logs d'un service spécifique
docker-compose logs frontend
docker-compose logs backend
docker-compose logs nginx
```

### Redémarrage des services

Si un service ne fonctionne pas correctement :

```bash
# Redémarrer un service spécifique
docker-compose restart frontend

# Redémarrer tous les services
docker-compose restart
```

### Problèmes courants

1. **Certificats SSL expirés** : Exécutez `docker-compose run --rm certbot renew`
2. **Base de données inaccessible** : Vérifiez les informations de connexion et le pare-feu
3. **Erreur 502 Bad Gateway** : Vérifiez que les services backend et frontend sont en cours d'exécution

## Conclusion

Vous avez maintenant déployé avec succès votre application Wisechain sur Scaleway en utilisant Docker. Cette configuration vous offre :

- Un environnement isolé et reproductible grâce à Docker
- Une sécurisation via HTTPS avec Let's Encrypt
- Un reverse proxy avec Nginx
- Des sauvegardes automatiques de la base de données
- Un système de monitoring pour surveiller les performances

Pour toute question ou assistance supplémentaire, n'hésitez pas à contacter l'équipe Wisechain à l'adresse support@wisechain.fr.