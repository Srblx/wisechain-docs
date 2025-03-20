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


<!-- 
# Déploiement avec Docker

## Dockerfile

Mon application Next.js est conteneurisée à l'aide d'un Dockerfile multi-étapes qui optimise la taille de l'image finale et améliore les performances.

dockerfile
Utilisez une image Node.js Alpine comme base (légère)
FROM node:20-alpine AS base
Définir le répertoire de travail dans le conteneur
WORKDIR /app
Copier les fichiers de définition de dépendances
COPY package.json ./
COPY prisma ./prisma/
Installer les dépendances (avec caching)
RUN npm install
Copier le reste du code source
COPY . .
Générer le client Prisma (important avant la construction Next.js)
RUN npx prisma generate
Construire l'application Next.js pour la production
RUN npm run build
Étape de production (image plus petite)
FROM node:20-alpine AS prod
WORKDIR /app


Copier uniquement les fichiers nécessaires à l'exécution
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/package.json ./
COPY --from=base /app/ ./
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/node_modules ./node_modules
Générer le client Prisma (encore une fois pour l'image de production)
RUN npx prisma generate
Exposer le port sur lequel Next.js écoute (par défaut: 3000)
EXPOSE 3000
Définir les variables d'environnement (si nécessaire)
ENV NODE_ENV production
ENV NEXT_PUBLIC_API_URL "http://wisechain.fr"
Commande pour démarrer l'application Next.js
CMD ["npm", "start"]


### Explication du Dockerfile

1. **Étape de base (build)**:
   - Utilise Node.js 20 sur Alpine Linux pour minimiser la taille
   - Installe toutes les dépendances
   - Génère le client Prisma
   - Construit l'application Next.js

2. **Étape de production**:
   - Crée une image finale plus légère
   - Copie uniquement les fichiers nécessaires depuis l'étape de base
   - Configure les variables d'environnement pour la production
   - Expose le port 3000 pour accéder à l'application

## Construction et exécution de l'image

Pour construire l'image Docker:
bash
docker build -t mon-app-nextjs .


Pour exécuter le conteneur:

bash
docker run -p 3000:3000 mon-app-nextjs


## Variables d'environnement

Les variables d'environnement suivantes sont définies dans le Dockerfile:

- `NODE_ENV`: Défini sur "production"
- `NEXT_PUBLIC_API_URL`: URL de l'API (http://wisechain.fr)

Pour surcharger ces variables lors de l'exécution:

bash
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://autre-url.com mon-app-nextjs
```

markdown:docs/deployment/gitlab-ci.md
Pipeline CI/CD GitLab
Notre application utilise GitLab CI/CD pour automatiser les tests, la construction et le déploiement sur notre serveur Scaleway.
Configuration du pipeline
Voici notre fichier .gitlab-ci.yml qui définit notre pipeline CI/CD:

stages:
  - lint-and-test
  - build
  - deploy

variables:
  DOCKER_IMAGE: $CI_REGISTRY_IMAGE:$CI_COMMIT_REF_SLUG

lint-and-test:
  stage: lint-and-test
  image: node:20-alpine
  script:
    - npm ci
    - npm run lint
    - npm test
  cache:
    paths:
      - node_modules/

cypress-tests:
  stage: lint-and-test
  image: cypress/browsers:node18.12.0-chrome106-ff106
  script:
    - npm ci
    - npm run build
    - npm start & npx wait-on http://localhost:3000
    - npx cypress run
  variables:
    DATABASE_URL: $TEST_DATABASE_URL
    WEBSITE_URL: http://localhost:3000/
    MINIO_ENDPOINT: $TEST_MINIO_ENDPOINT
    MINIO_PORT: $TEST_MINIO_PORT
    MINIO_USE_SSL: $TEST_MINIO_USE_SSL
    MINIO_BUCKET_NAME: $TEST_MINIO_BUCKET_NAME
    MINIO_ACCESS_KEY: $TEST_MINIO_ACCESS_KEY
    MINIO_SECRET_KEY: $TEST_MINIO_SECRET_KEY
    JWT_SECRET: $TEST_JWT_SECRET

build:
  stage: build
  image: docker:20.10.16
  services:
    - docker:20.10.16-dind
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $DOCKER_IMAGE .
    - docker push $DOCKER_IMAGE
  only:
    - main
    - develop

deploy-production:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
    - echo "$SSH_KNOWN_HOSTS" > ~/.ssh/known_hosts
    - chmod 644 ~/.ssh/known_hosts
  script:
    - ssh $SERVER_USER@$SERVER_IP "docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY"
    - ssh $SERVER_USER@$SERVER_IP "docker pull $DOCKER_IMAGE"
    - ssh $SERVER_USER@$SERVER_IP "docker stop app-container || true"
    - ssh $SERVER_USER@$SERVER_IP "docker rm app-container || true"
    - ssh $SERVER_USER@$SERVER_IP "docker run -d --name app-container -p 3000:3000 --restart always --env-file /path/to/env/file $DOCKER_IMAGE"
  only:
    - main
  environment:
    name: production
    url: https://wisechain.fr

    Étapes du pipeline
1. Lint et Tests (lint-and-test)
Exécute les linters pour vérifier la qualité du code
Lance les tests unitaires
2. Tests Cypress (cypress-tests)
Exécute les tests d'intégration avec Cypress
Utilise des variables d'environnement de test spécifiques
3. Construction (build)
Construit l'image Docker de l'application
Pousse l'image vers le registre GitLab
S'exécute uniquement sur les branches main et develop
4. Déploiement (deploy-production)
Se connecte au serveur Scaleway via SSH
Tire l'image Docker la plus récente
Arrête et supprime le conteneur existant
Démarre un nouveau conteneur avec l'image mise à jour
S'exécute uniquement sur la branche main
Variables d'environnement GitLab
Les variables suivantes doivent être configurées dans les paramètres CI/CD de GitLab:
CI_REGISTRY, CI_REGISTRY_USER, CI_REGISTRY_PASSWORD: Informations d'authentification du registre GitLab
SSH_PRIVATE_KEY: Clé SSH privée pour se connecter au serveur Scaleway
SSH_KNOWN_HOSTS: Empreintes des hôtes connus pour la connexion SSH
SERVER_USER: Nom d'utilisateur sur le serveur Scaleway
SERVER_IP: Adresse IP du serveur Scaleway
Variables de test pour Cypress (DATABASE_URL, MINIO_, etc.)
Déploiement manuel
Si vous avez besoin de déployer manuellement l'application sur le serveur Scaleway:
tag


# Se connecter au registre GitLab
docker login registry.gitlab.com

# Tirer l'image
docker pull registry.gitlab.com/votre-projet/votre-image:tag

# Arrêter et supprimer le conteneur existant
docker stop app-container
docker rm app-container

# Démarrer un nouveau conteneur
docker run -d --name app-container -p 3000:3000 --restart always --env-file /path/to/env/file registry.gitlab.com/votre-projet/votre-image:tag

















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
</div> -->



<!-- 
# 🛠️ Documentation de Déploiement

## 🚀 **I - Déploiement avec Docker**

### 1️⃣ **Dockerfile**
Mon application Next.js utilise un Dockerfile multi-étapes pour optimiser la taille de l'image et les performances.

#### Contenu du Dockerfile
```dockerfile
# Étape de construction
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json ./
COPY prisma ./prisma/
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# Étape de production
FROM node:20-alpine AS prod
WORKDIR /app
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/package.json ./
COPY --from=base /app/ .
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/node_modules ./node_modules
RUN npx prisma generate
EXPOSE 3000
ENV NODE_ENV production
ENV NEXT_PUBLIC_API_URL "http://wisechain.fr"
CMD ["npm", "start"]
```

#### Étapes principales
1. **Étape de construction** :
   - Installe les dépendances et génère les fichiers nécessaires.
   - Compile l'application Next.js.

2. **Étape de production** :
   - Crée une image plus légère contenant uniquement les fichiers nécessaires.
   - Définit les variables d'environnement et expose le port 3000.

---

### 2️⃣ **Construction et exécution de l'image**

#### Construction de l'image
```bash
docker build -t mon-app-nextjs .
```

#### Exécution du conteneur
```bash
docker run -p 3000:3000 mon-app-nextjs
```

#### Variables d'environnement
Pour passer des variables dynamiques :
```bash
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://autre-url.com mon-app-nextjs
```

---

## 🛠️ **II - Pipeline CI/CD GitLab**

### **Structure du fichier `.gitlab-ci.yml`**
```yaml
stages:
  - lint-and-test
  - build
  - deploy

variables:
  DOCKER_IMAGE: $CI_REGISTRY_IMAGE:$CI_COMMIT_REF_SLUG

lint-and-test:
  stage: lint-and-test
  image: node:20-alpine
  script:
    - npm ci
    - npm run lint
    - npm test
  cache:
    paths:
      - node_modules/

cypress-tests:
  stage: lint-and-test
  image: cypress/browsers:node18.12.0-chrome106-ff106
  script:
    - npm ci
    - npm run build
    - npm start & npx wait-on http://localhost:3000
    - npx cypress run
  variables:
    DATABASE_URL: $TEST_DATABASE_URL
    JWT_SECRET: $TEST_JWT_SECRET

build:
  stage: build
  image: docker:20.10.16
  services:
    - docker:20.10.16-dind
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $DOCKER_IMAGE .
    - docker push $DOCKER_IMAGE
  only:
    - main
    - develop

deploy-production:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
    - mkdir -p ~/.ssh
    - echo "$SSH_KNOWN_HOSTS" > ~/.ssh/known_hosts
  script:
    - ssh $SERVER_USER@$SERVER_IP "docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY"
    - ssh $SERVER_USER@$SERVER_IP "docker pull $DOCKER_IMAGE"
    - ssh $SERVER_USER@$SERVER_IP "docker stop app-container || true"
    - ssh $SERVER_USER@$SERVER_IP "docker rm app-container || true"
    - ssh $SERVER_USER@$SERVER_IP "docker run -d --name app-container -p 3000:3000 --restart always --env-file /path/to/env/file $DOCKER_IMAGE"
  only:
    - main
  environment:
    name: production
    url: https://wisechain.fr
```

### Étapes du pipeline
1. **Lint et Tests** :
   - Exécute les linters et les tests unitaires.
2. **Tests Cypress** :
   - Effectue des tests d'intégration.
3. **Construction Docker** :
   - Crée et pousse l'image Docker dans le registre.
4. **Déploiement** :
   - Déploie l'application sur le serveur de production via SSH.

---

## 🖥️ **III - Configuration du Serveur Debian**

### Étapes principales
1. **Connexion SSH** :
   ```bash
   ssh root@ip
   ```

2. **Mise à jour des paquets** :
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. **Installation de Docker** :
   ```bash
   sudo apt install apt-transport-https ca-certificates curl software-properties-common -y
   curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
   echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   sudo apt update
   sudo apt install docker-ce -y
   ```

4. **Création d'un utilisateur Docker** :
   ```bash
   sudo adduser user-name
   sudo usermod -aG docker user-name
   ```

---

## 🌐 **IV - Reverse Proxy avec Nginx**

### Configuration de base
1. **Installation de Nginx** :
   ```bash
   sudo apt install nginx -y
   ```

2. **Ajout du reverse proxy** :
   ```nginx
   server {
       listen 80;
       server_name sous-domaine.domaine.com;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
       }
   }
   ```
   Activez le site et redémarrez Nginx :
   ```bash
   sudo ln -s /etc/nginx/sites-available/nom-du-site /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

## 🔒 **V - Certificat SSL avec Certbot**

1. **Installation de Certbot** :
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx
   ```

2. **Renouvellement automatique** :
   ```bash
   echo "0 0 * * * certbot renew --quiet" | sudo tee -a /etc/crontab > /dev/null
   ```

---

Votre environnement est désormais complètement configuré pour le déploiement de votre application avec Docker, GitLab CI/CD, et Nginx ! 🎉 -->


# 🛠️ Documentation de Déploiement

## 🚀 **I - Déploiement avec Docker**

### 1️⃣ **Dockerfile**
Mon application Next.js utilise un Dockerfile multi-étapes pour optimiser la taille de l'image et les performances.

#### Contenu du Dockerfile
```dockerfile
# Étape de construction
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json ./
COPY prisma ./prisma/
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# Étape de production
FROM node:20-alpine AS prod
WORKDIR /app
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/package.json ./
COPY --from=base /app/ .
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/node_modules ./node_modules
RUN npx prisma generate
EXPOSE 3000
ENV NODE_ENV production
ENV NEXT_PUBLIC_API_URL "http://wisechain.fr"
CMD ["npm", "start"]
```

#### Étapes principales
1. **Étape de construction** :
   - Installe les dépendances et génère les fichiers nécessaires.
   - Compile l'application Next.js.

2. **Étape de production** :
   - Crée une image plus légère contenant uniquement les fichiers nécessaires.
   - Définit les variables d'environnement et expose le port 3000.

---

### 2️⃣ **Construction et exécution de l'image**

#### Construction de l'image
```bash
docker build -t mon-app-nextjs .
```

#### Exécution du conteneur
```bash
docker run -p 3000:3000 mon-app-nextjs
```

#### Variables d'environnement
Pour passer des variables dynamiques :
```bash
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://autre-url.com mon-app-nextjs
```

---

## 🛠️ **II - Pipeline CI/CD GitLab**

### **Structure du fichier `.gitlab-ci.yml`**
```yaml
# include: 
#   - template: Jobs/SAST.gitlab-ci.yml

stages : 
  - build
  # - test
  - deploy

build-app:
  image: docker:28
  stage: build
  services:
    - docker:28-dind
  variables:
    IMAGE_TAG: $CI_REGISTRY_IMAGE:$CI_COMMIT_REF_SLUG
    # SECURE_FILES_DOWNLOAD_PATH: $CI_PROJECT_DIR/secure-files
  script:
    - echo $ENV_PRODUCTION > .env.prod
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $IMAGE_TAG -f Dockerfile .
    - docker push $IMAGE_TAG
  rules:
    - if: $CI_COMMIT_BRANCH == 'deployed'

```

### Étapes du pipeline
1. **Lint et Tests** :
   - Exécute les linters et les tests unitaires.
2. **Tests Cypress** :
   - Effectue des tests d'intégration.
3. **Construction Docker** :
   - Crée et pousse l'image Docker dans le registre.
4. **Déploiement** :
   - Déploie l'application sur le serveur de production via SSH.

---

<!-- ## 🖥️ **III - Configuration du Serveur Debian** -->
<!-- 
### Étapes principales
1. **Connexion SSH** :
   ```bash
   ssh root@ip
   ```

2. **Mise à jour des paquets** :
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. **Installation de Docker** :
   ```bash
   sudo apt install apt-transport-https ca-certificates curl software-properties-common -y
   curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
   echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   sudo apt update
   sudo apt install docker-ce -y
   ```

4. **Création d'un utilisateur Docker** :
   ```bash
   sudo adduser user-name
   sudo usermod -aG docker user-name
   ```

---

## 🌐 **IV - Reverse Proxy avec Nginx**

### Configuration de base
1. **Installation de Nginx** :
   ```bash
   sudo apt install nginx -y
   ```

2. **Ajout du reverse proxy** :
   ```nginx
   server {
       listen 80;
       server_name sous-domaine.domaine.com;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
       }
   }
   ```
   Activez le site et redémarrez Nginx :
   ```bash
   sudo ln -s /etc/nginx/sites-available/nom-du-site /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

## 🔒 **V - Certificat SSL avec Certbot**

1. **Installation de Certbot** :
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx
   ```

2. **Renouvellement automatique** :
   ```bash
   echo "0 0 * * * certbot renew --quiet" | sudo tee -a /etc/crontab > /dev/null
   ```

---

Votre environnement est désormais complètement configuré pour le déploiement de votre application avec Docker, GitLab CI/CD, et Nginx ! 🎉 -->

## 🖥️ III - Configuration du Serveur Debian et déploiement avec Docker et Nginx
## I - Configuration du Serveur Debian

### 1 - Connexion en SSH

Pour accéder à votre serveur Debian, utilisez la commande suivante :

```bash
ssh root@ip
```

### 2 - Enregistrement de la clé SSH

Pour éviter de devoir saisir votre mot de passe à chaque connexion :

```bash
ssh-copy-id root@ip
```

### 3 - Mise à jour des paquets

Assurez-vous que tous les paquets sont à jour :

```bash
sudo apt update && sudo apt upgrade -y
```

### 4 - Installation des dépendances Docker

Installez les dépendances nécessaires pour Docker :

```bash
sudo apt install apt-transport-https ca-certificates curl software-properties-common -y
```



### 5 - Installation et configuration de Docker

Installez Docker :

```bash
sudo apt install docker-ce -y
```

Démarrez Docker et activez-le au démarrage :

```bash
sudo systemctl start docker
sudo systemctl enable docker
```

Créez un répertoire pour vos sites :

```bash
mkdir /sites
cd /sites
mkdir /nom-du-site
```

### 6 - Gestion des utilisateurs

Ajoutez un utilisateur nommé `srbl` :

```bash
sudo adduser srbl
```

Ajoutez-le au groupe Docker :

```bash
sudo usermod -aG docker srbl
```

## II - Docker Build

### 1 - Build et Push des images Docker

Buildez une image Docker avec un tag spécifique :

```bash
docker build --platform=linux/amd64 -t srbl/xxx:1.0 ./front
```

Poussez cette image sur DockerHub :

```bash
docker push srbl/xxx:1.0
```

### 2 - Déploiement avec Docker Compose

Copiez les fichiers nécessaires sur le serveur :

```bash
scp -r back/.env.prod root@ip:../sites/nom-du-site
scp -r front/.env root@ip:../sites/nom-du-site
scp -r docker-compose.yml root@ip:../sites/nom-du-site
```

Initialisez Docker Swarm et déployez les conteneurs :

```bash
docker swarm init
docker stack deploy -c /tmp/docker-compose.yml site1
```

## III - Installation de Nginx

### 1 - Installation de base

Installez et démarrez Nginx :

```bash
sudo apt update && sudo apt upgrade -y
```

```bash
sudo apt install nginx -y
```

```bash
sudo systemctl start nginx
```

```bash
sudo systemctl enable nginx
```

Autoriser les connexions HTTP et HTTPS :

```bash
sudo ufw allow 80
```

```bash
sudo ufw allow 443
```

Modifier la conf nginx par défaut :

```bash
nano /etc/nginx/nginx.conf
```

Modifiez la ligne suivante :

```bash
- include /etc/nginx/modules-enabled/*.conf;
+ include /etc/nginx/modules-enabled/*;
```

### 2 - Configuration du Reverse Proxy

Créez une configuration Nginx :

```bash
sudo nano /etc/nginx/sites-available/nom-du-site
```

Ajoutez cette configuration (exemple pour un front back et s3) :

```nginx
server {
    listen 80;
    client_max_body_size 100M;
    server_name sous-domaine.domaine.com;

    location / {
        proxy_pass http://127.0.0.1:81;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /s3/ {
        client_max_body_size 100M;
        proxy_pass http://127.0.0.1:9000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }

    location /adminer {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        error_page 502 503 504 = /;
    }
}
```

### 3 - Activation et vérification

Créez un lien symbolique et vérifiez la configuration :

```bash
sudo ln -s /etc/nginx/sites-available/nom-du-site /etc/nginx/sites-enabled/
```

```bash
sudo nginx -t
```

```bash
sudo systemctl restart nginx
```

## IV - Installation de Certbot

### 1 - Génération de certificat SSL

Installez Certbot et générez un certificat :

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx
```

### 2 - Renouvellement automatique

Ajoutez une tâche cron pour renouveler automatiquement les certificats :

```bash
echo "0 0 * * * certbot renew --quiet" | sudo tee -a /etc/crontab > /dev/null
```



<!-- ### 5 - Ajout des clés et dépôts Docker

Ajoutez la clé GPG officielle :

```bash
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```

Ajoutez le dépôt officiel Docker à vos sources :

```bash
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

Mettez à jour les paquets :

```bash
sudo apt update
``` -->