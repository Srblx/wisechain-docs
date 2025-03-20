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

<div style="text-align: center;">✅ **Votre déploiement est maintenant prêt !** 🎉</div>

<div style="text-align: center;">
  <p> N'hésitez pas à me contacter pour toute question ou demande de support. </p>
  <p> Email: <a href="mailto:wisechainnet@gmail.com">wisechainnet@gmail.com</a></p>
</div>
 -->

# Documentation Wisechain

<div class="hero">
  <img src="assets/img/logo.svg" alt="Logo Wisechain" class="hero-logo" />
  <h1>Bienvenue dans la documentation Wisechain</h1>
  <p>Tout ce dont vous avez besoin pour comprendre, déployer et développer sur la plateforme Wisechain</p>
</div>

<!-- ## Guides disponibles

<div class="card-container">
  <a href="deploiement/overview/" class="card">
    <h3>🖥️ Guide de Déploiement</h3>
    <p>Apprenez à configurer votre serveur, déployer avec Docker et sécuriser avec Nginx et SSL.</p>
  </a>
  <a href="developer-guide/api/" class="card">
    <h3>👨‍💻 Guide Développeur</h3>
    <p>Documentation API, structure de la base de données et intégration CI/CD.</p>
  </a>
</div> -->

## Démarrage rapide

<div class="step-container">
  <div class="step-number">1</div>
  <div class="step-content">
    <h4>Configurer le serveur</h4>
    <p>Suivez notre <a href="hosting/#configuration-de-linstance-scaleway">guide de configuration du serveur</a> pour préparer votre environnement.</p>
  </div>
</div>

<div class="step-container">
  <div class="step-number">2</div>
  <div class="step-content">
    <h4>Déployer avec Docker</h4>
    <p>Utilisez notre <a href="deploiement/#4-installation-des-dependances-docker/">guide Docker</a> pour construire et déployer vos images.</p>
  </div>
</div>

<div class="step-container">
  <div class="step-number">3</div>
  <div class="step-content">
    <h4>Configurer Nginx</h4>
    <p>Mettez en place un <a href="deploiement/#2-configuration-du-reverse-proxy/">reverse proxy avec Nginx</a> pour gérer le trafic.</p>
  </div>
</div>

<div class="step-container">
  <div class="step-number">4</div>
  <div class="step-content">
    <h4>Sécuriser avec SSL</h4>
    <p>Protégez votre site avec <a href="documentation_deploiement/#iv-installation-de-certbot/">Certbot et SSL</a>.</p>
  </div>
</div>

## Documentation pour développeurs

<div class="card-container">
  <a href="architecture/" class="card">
    <h3>🛠️ Architecture</h3>
    <p>Architecture générale de la plateforme Wisechain.</p>
  </a>
  <a href="db/" class="card">
    <h3>🗄️ Base de Données</h3>
    <p>Structure complète de la base de données MySQL avec Prisma.</p>
  </a>
  <a href="hosting/" class="card">
    <h3>☁️ Déploiement Scaleway</h3>
    <p>Guide de déploiement sur l'infrastructure Scaleway.</p>
  </a>
   <a href="deploiement/" class="card">
    <h3>🚀 Déploiement Wisechain</h3>
    <p>Guide de déploiement Front/Back/S3 avec l'infrastructure Scaleway.</p>
  </a>
  <a href="ci-cd.md" class="card">
    <h3>🔄 CI/CD GitLab</h3>
    <p>Pipeline d'intégration et déploiement continus.</p>
  </a>
</div>

## Besoin d'aide ?

<div class="support-section">
  <h2>Support et Contact</h2>
  <div class="support-links">
    <a href="mailto:wisechainnet@gmail.com" class="support-link">
      <span class="support-icon">📧</span>
      wisechainnet@gmail.com
    </a>
    <a href="https://github.com/Srblx/New-Wisechain" class="support-link" target="_blank">
      <span class="support-icon">📂</span>
      GitHub Repository
    </a>
  </div>
</div>

<style>
  .hero {
    text-align: center;
    padding: 2rem;
    margin-bottom: 3rem;
    background: linear-gradient(to right, #6e42ca, #8e5cf7);
    color: white;
    border-radius: 8px;
  }

  .hero-logo {
    width: 120px;
    margin-bottom: 1rem;
  }

  .card-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
  }

  .card {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    text-decoration: none;
    color: inherit;
    transition: transform 0.2s;
  }

  .card:hover {
    transform: translateY(-3px);
  }

  .step-container {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    align-items: flex-start;
  }

  .step-number {
    background: #6e42ca;
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    flex-shrink: 0;
  }

  .step-content {
    flex: 1;
  }

  .step-content h4 {
    margin: 0 0 0.5rem 0;
  }

  .support-section {
    text-align: center;
    padding: 2rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin-top: 3rem;
  }

  .support-links {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-top: 1rem;
  }

  .support-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    color: #6e42ca;
  }

  @media (max-width: 768px) {
    .card-container {
      grid-template-columns: 1fr;
    }

    .support-links {
      flex-direction: column;
      align-items: center;
    }
  }
</style>