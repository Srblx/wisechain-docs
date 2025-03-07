# Vue d'ensemble du déploiement

Cette documentation vous guidera à travers le processus complet de déploiement d'une application Wisechain sur un serveur Debian.

## Étapes principales

Le déploiement se déroule en quatre étapes principales :

1. **Configuration du Serveur Debian** - Préparation de l'environnement serveur
2. **Docker Build** - Construction et déploiement des images Docker
3. **Installation de Nginx** - Configuration du serveur web et du reverse proxy
4. **Installation de Certbot** - Sécurisation avec SSL/TLS

Suivez les guides détaillés pour chaque étape dans les sections correspondantes.

## Prérequis

- Un serveur Debian (version 10 ou supérieure)
- Accès SSH au serveur
- Un nom de domaine pointant vers votre serveur
- Connaissances de base en administration système Linux