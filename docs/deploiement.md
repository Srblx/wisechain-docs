<!-- ## 🖥️ I - Configuration du Serveur Debian

### 1️⃣ Connexion en SSH
```bash
ssh root@ip
```

### 2️⃣ Enregistrement de la clé SSH
```bash
ssh-copy-id root@ip
```

### 3️⃣ Mise à jour des paquets
```bash
sudo apt update && sudo apt upgrade -y
```

### 4️⃣ Installation des dépendances Docker
```bash
sudo apt install apt-transport-https ca-certificates curl software-properties-common -y
```

### 5️⃣ Ajout des clés et dépôts Docker
Ajoutez la clé GPG officielle :
```bash
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```
Ajoutez le dépôt Docker :
```bash
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```
Mettez à jour les paquets :
```bash
sudo apt update
```

### 6️⃣ Installation et configuration de Docker
```bash
sudo apt install docker-ce -y
sudo systemctl start docker
sudo systemctl enable docker
```
Création du répertoire :
```bash
mkdir -p /sites/nom-du-site
```

### 7️⃣ Gestion des utilisateurs
Ajoutez un utilisateur :
```bash
sudo adduser user-name
```
Ajoutez-le au groupe Docker :
```bash
sudo usermod -aG docker user-name
```

---

## 🐳 II - Docker Build

### 1️⃣ Build et Push des images Docker
```bash
docker build --platform=linux/amd64 -t name-image/xxx:1.0 ./front
docker push name-image/xxx:1.0
```

### 2️⃣ Déploiement avec Docker Compose
Copiez les fichiers sur le serveur :
```bash
scp -r back/.env.prod root@ip:/sites/nom-du-site
scp -r front/.env root@ip:/sites/nom-du-site
scp -r docker-compose.yml root@ip:/sites/nom-du-site
```
Initialisez Docker Swarm et déployez :
```bash
docker swarm init
docker stack deploy -c /sites/nom-du-site/docker-compose.yml site1
```

---

## 🌐 III - Installation de Nginx

### 1️⃣ Installation de base
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
sudo ufw allow 80
sudo ufw allow 443
```

### 2️⃣ Configuration du Reverse Proxy
```bash
sudo nano /etc/nginx/sites-available/nom-du-site
```
Exemple de configuration :
```nginx
server {
    listen 80;
    server_name sous-domaine.domaine.com;

    location / {
        proxy_pass http://127.0.0.1:81;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```
Activation :
```bash
sudo ln -s /etc/nginx/sites-available/nom-du-site /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔒 IV - Installation de Certbot

### 1️⃣ Génération de certificat SSL
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx
```

### 2️⃣ Renouvellement automatique
```bash
echo "0 0 * * * certbot renew --quiet" | sudo tee -a /etc/crontab > /dev/null
```

### 3️⃣ Passer Minio en SSL (optionnel)
```bash
sudo certbot certonly --standalone -d s3.nom-du-site.fr
```
Ajout au `docker-compose.yml` :
```yaml
services:
  s3:
    image: minio/minio:latest
    environment:
      MINIO_ROOT_USER: user
      MINIO_ROOT_PASSWORD: password
    ports:
      - "9000:9000"
      - "8900:8900"
    volumes:
      - minio:/data/minio
      - /etc/letsencrypt/live/s3.nom-du-site.fr/fullchain.pem:/root/.minio/certs/public.crt:ro
      - /etc/letsencrypt/live/s3.nom-du-site.fr/privkey.pem:/root/.minio/certs/private.key:ro
    command: 'minio server /data/minio --console-address ":8900"'
```
---

<div style="text-align: center;">✅ **Votre déploiement est maintenant prêt !** 🎉</div> -->




























## 🖥️ I - Configuration du Serveur Debian

### 1️⃣ Connexion en SSH
```bash
ssh root@ip
```

### 2️⃣ Enregistrement de la clé SSH
```bash
ssh-copy-id root@ip
```

### 3️⃣ Mise à jour des paquets
```bash
sudo apt update && sudo apt upgrade -y
```

### 4️⃣ Installation des dépendances Docker
```bash
sudo apt install apt-transport-https ca-certificates curl software-properties-common -y
```

### 5️⃣ Ajout des clés et dépôts Docker
Ajoutez la clé GPG officielle :
```bash
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```
Ajoutez le dépôt Docker :
```bash
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```
Mettez à jour les paquets :
```bash
sudo apt update
```

### 6️⃣ Installation et configuration de Docker
```bash
sudo apt install docker-ce -y
sudo systemctl start docker
sudo systemctl enable docker
```
Création du répertoire :
```bash
mkdir -p /sites/nom-du-site
```

### 7️⃣ Gestion des utilisateurs
Ajoutez un utilisateur :
```bash
sudo adduser user-name
```
Ajoutez-le au groupe Docker :
```bash
sudo usermod -aG docker user-name
```

---

## 🐳 II - Docker Build

### 1️⃣ Build et Push des images Docker
```bash
docker build --platform=linux/amd64 -t name-image/xxx:1.0 ./front
docker push name-image/xxx:1.0
```

### 2️⃣ Déploiement avec Docker Compose
Copiez les fichiers sur le serveur :
```bash
scp -r back/.env.prod root@ip:/sites/nom-du-site
scp -r front/.env root@ip:/sites/nom-du-site
scp -r docker-compose.yml root@ip:/sites/nom-du-site
```
Initialisez Docker Swarm et déployez :
```bash
docker swarm init
docker stack deploy -c /sites/nom-du-site/docker-compose.yml site1
```

---

## 🌐 III - Installation de Nginx

### 1️⃣ Installation de base
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
sudo ufw allow 80
sudo ufw allow 443
```

### 2️⃣ Configuration du Reverse Proxy
```bash
sudo nano /etc/nginx/sites-available/nom-du-site
```
Exemple de configuration :
```nginx
server {
    listen 80;
    server_name sous-domaine.domaine.com;

    location / {
        proxy_pass http://127.0.0.1:81;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```
Activation :
```bash
sudo ln -s /etc/nginx/sites-available/nom-du-site /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔒 IV - Installation de Certbot

### 1️⃣ Génération de certificat SSL
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx
```

### 2️⃣ Renouvellement automatique
```bash
echo "0 0 * * * certbot renew --quiet" | sudo tee -a /etc/crontab > /dev/null
```

### 3️⃣ Passer Minio en SSL (optionnel)
```bash
sudo certbot certonly --standalone -d s3.nom-du-site.fr
```
Ajout au `docker-compose.yml` :
```yaml
services:
  s3:
    image: minio/minio:latest
    environment:
      MINIO_ROOT_USER: user
      MINIO_ROOT_PASSWORD: password
    ports:
      - "9000:9000"
      - "8900:8900"
    volumes:
      - minio:/data/minio
      - /etc/letsencrypt/live/s3.nom-du-site.fr/fullchain.pem:/root/.minio/certs/public.crt:ro
      - /etc/letsencrypt/live/s3.nom-du-site.fr/privkey.pem:/root/.minio/certs/private.key:ro
    command: 'minio server /data/minio --console-address ":8900"'
```
---

<div style="text-align: center;">✅ **Votre déploiement est maintenant prêt !** 🎉</div>

<div style="text-align: center;">
  <p> N'hésitez pas à me contacter pour toute question ou demande de support. </p>
  <p> Email: <a href="mailto:wisechainnet@gmail.com">wisechainnet@gmail.com</a></p>
</div>

