# Documentation de la Base de Données Wisechain

## Vue d'ensemble

La base de données Wisechain est une base de données relationnelle MySQL gérée via Prisma ORM. Elle est conçue pour stocker et gérer les données d'une plateforme d'apprentissage et de contenu avec des fonctionnalités communautaires.

## Configuration

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

La connexion à la base de données est configurée via la variable d'environnement `DATABASE_URL`.

## Modèles de données

### User

Table des utilisateurs de la plateforme.

| Colonne | Type | Attributs | Description |
|---------|------|-----------|-------------|
| id | String | @id @default(cuid()) | Identifiant unique de l'utilisateur |
| firstname | String | | Prénom de l'utilisateur |
| lastname | String | | Nom de famille de l'utilisateur |
| pseudo | String | @unique | Pseudonyme unique de l'utilisateur |
| mail | String | @unique | Adresse email unique de l'utilisateur |
| password | String | | Mot de passe hashé de l'utilisateur |
| country | String | @default("france") | Pays de l'utilisateur |
| date_of_birth | DateTime | @db.Date | Date de naissance |
| roles | String | @default("suscriber") | Rôle de l'utilisateur dans le système |
| profile_img | String? | | URL de l'image de profil (optionnel) |
| is_verified | Boolean | @default(false) | Indique si l'utilisateur est vérifié |
| is_revoice | Boolean | | Indique si l'utilisateur a activé certaines notifications |
| created_at | DateTime | @default(now()) | Date de création du compte |

**Relations :**
- One-to-Many avec `Article` (un utilisateur peut créer plusieurs articles)
- One-to-Many avec `RealizeQuestionary` (un utilisateur peut réaliser plusieurs questionnaires)
- One-to-Many avec `StaffRequest` (un utilisateur peut envoyer plusieurs demandes au staff)
- One-to-Many avec `CommunityMessage` (un utilisateur peut envoyer plusieurs messages communautaires)
- One-to-Many avec `FictiveAccount` (un utilisateur peut avoir plusieurs comptes fictifs)
- One-to-Many avec `UserReward` (un utilisateur peut avoir plusieurs récompenses)
- One-to-Many avec `UserCourse` (un utilisateur peut suivre plusieurs cours)

### Article

Table des articles publiés sur la plateforme.

| Colonne | Type | Attributs | Description |
|---------|------|-----------|-------------|
| id | String | @id @default(cuid()) | Identifiant unique de l'article |
| title | String | | Titre de l'article |
| summary | String | @db.Text | Résumé de l'article |
| img | String | | URL de l'image principale de l'article |
| created_at | DateTime | @default(now()) | Date de création de l'article |
| user_id | String | | Référence à l'auteur de l'article |
| category_id | String | | Référence à la catégorie de l'article |
| status | String? | | Statut de publication de l'article |

**Relations :**
- Many-to-One avec `User` (un article appartient à un utilisateur)
- Many-to-One avec `Category` (un article appartient à une catégorie)
- One-to-Many avec `SequenceArticle` (un article peut avoir plusieurs séquences)

### SequenceArticle

Table des séquences d'un article.

| Colonne | Type | Attributs | Description |
|---------|------|-----------|-------------|
| id | String | @id @default(cuid()) | Identifiant unique de la séquence |
| index | Int | | Ordre de la séquence dans l'article |
| title | String | @db.Text | Titre de la séquence |
| containt | String | @db.Text | Contenu de la séquence |
| img | String? | @db.Text | URL de l'image de la séquence (optionnel) |
| article_id | String | | Référence à l'article parent |

**Relations :**
- Many-to-One avec `Article` (une séquence appartient à un article)

### Course

Table des cours disponibles sur la plateforme.

| Colonne | Type | Attributs | Description |
|---------|------|-----------|-------------|
| id | String | @id @default(cuid()) | Identifiant unique du cours |
| main_title | String | | Titre principal du cours |
| description | String? | @db.Text | Description du cours (optionnel) |
| img | String | | URL de l'image du cours |
| content | String | @db.Text | Contenu principal du cours |
| created_at | DateTime | @default(now()) | Date de création du cours |
| update_at | DateTime | @updatedAt @db.Date | Date de dernière mise à jour |
| category_id | String | | Référence à la catégorie du cours |
| difficulty | String | @default("Facile") | Niveau de difficulté du cours |
| status | String? | | Statut de publication du cours |

**Relations :**
- Many-to-One avec `Category` (un cours appartient à une catégorie)
- One-to-Many avec `Sequence` (un cours peut avoir plusieurs séquences)
- Many-to-Many avec `Tool` via `ToolCourse` (un cours peut utiliser plusieurs outils)
- One-to-Many avec `Questionary` (un cours peut avoir plusieurs questionnaires)
- One-to-Many avec `UserCourse` (un cours peut être suivi par plusieurs utilisateurs)

### Sequence

Table des séquences d'un cours.

| Colonne | Type | Attributs | Description |
|---------|------|-----------|-------------|
| id | String | @id @default(cuid()) | Identifiant unique de la séquence |
| index | Int | | Ordre de la séquence dans le cours |
| title | String | @db.Text | Titre de la séquence |
| containt | String | @db.Text | Contenu de la séquence |
| img | String? | @db.Text | URL de l'image de la séquence (optionnel) |
| course_id | String | | Référence au cours parent |

**Relations :**
- Many-to-One avec `Course` (une séquence appartient à un cours)

### Questionary

Table des questionnaires d'évaluation.

| Colonne | Type | Attributs | Description |
|---------|------|-----------|-------------|
| id | String | @id @default(cuid()) | Identifiant unique du questionnaire |
| subject | String | @db.VarChar(150) | Sujet du questionnaire |
| creator | String | | Créateur du questionnaire |
| created_at | DateTime | @default(now()) | Date de création |
| courseId | String? | | Référence au cours associé (optionnel) |

**Relations :**
- One-to-Many avec `RealizeQuestionary` (un questionnaire peut être réalisé plusieurs fois)
- One-to-Many avec `Reward` (un questionnaire peut offrir plusieurs récompenses)
- One-to-Many avec `Question` (un questionnaire contient plusieurs questions)
- One-to-Many avec `Answer` (un questionnaire contient plusieurs réponses)
- Many-to-One avec `Course` (un questionnaire peut être associé à un cours)

### Question

Table des questions dans les questionnaires.

| Colonne | Type | Attributs | Description |
|---------|------|-----------|-------------|
| id | String | @id @default(cuid()) | Identifiant unique de la question |
| question | String | @db.VarChar(255) | Texte de la question |
| questionary_id | String | | Référence au questionnaire parent |

**Relations :**
- Many-to-One avec `Questionary` (une question appartient à un questionnaire)
- One-to-Many avec `Answer` (une question peut avoir plusieurs réponses)

### Answer

Table des réponses aux questions.

| Colonne | Type | Attributs | Description |
|---------|------|-----------|-------------|
| id | String | @id @default(cuid()) | Identifiant unique de la réponse |
| answer | String | @db.VarChar(255) | Texte de la réponse |
| correct_answer | Boolean | | Indique si c'est la bonne réponse |
| questionary_id | String | | Référence au questionnaire parent |
| question_id | String | | Référence à la question parent |

**Relations :**
- Many-to-One avec `Questionary` (une réponse appartient à un questionnaire)
- Many-to-One avec `Question` (une réponse appartient à une question)

### RealizeQuestionary

Table des réalisations de questionnaires par les utilisateurs.

| Colonne | Type | Attributs | Description |
|---------|------|-----------|-------------|
| id | String | @id @default(cuid()) | Identifiant unique de la réalisation |
| score | Int | | Score obtenu |
| date_of_realize_questionary | DateTime | @default(now()) | Date de réalisation |
| user_id | String | | Référence à l'utilisateur |
| questionary_id | String | | Référence au questionnaire |

**Relations :**
- Many-to-One avec `User` (une réalisation appartient à un utilisateur)
- Many-to-One avec `Questionary` (une réalisation concerne un questionnaire)

### Reward

Table des récompenses disponibles.

| Colonne | Type | Attributs | Description |
|---------|------|-----------|-------------|
| id | String | @id @default(cuid()) | Identifiant unique de la récompense |
| is_claim | Boolean | | Indique si la récompense a été réclamée |
| date_of_claim | DateTime? | @db.Date | Date de réclamation (optionnel) |
| questionary_id | String | | Référence au questionnaire associé |

**Relations :**
- Many-to-One avec `Questionary` (une récompense est associée à un questionnaire)
- One-to-Many avec `UserReward` (une récompense peut être attribuée à plusieurs utilisateurs)

### UserReward

Table de jonction entre utilisateurs et récompenses.

| Colonne | Type | Attributs | Description |
|---------|------|-----------|-------------|
| user_id | String | | Référence à l'utilisateur |
| reward_id | String | | Référence à la récompense |

**Clé primaire composite :** `[reward_id, user_id]`

**Relations :**
- Many-to-One avec `User` (une attribution appartient à un utilisateur)
- Many-to-One avec `Reward` (une attribution concerne une récompense)

### UserCourse

Table de suivi des cours par les utilisateurs.

| Colonne | Type | Attributs | Description |
|---------|------|-----------|-------------|
| id | String | @id @default(cuid()) | Identifiant unique |
| user_id | String | | Référence à l'utilisateur |
| course_id | String | | Référence au cours |
| progress | Float | @default(0.0) | Progression dans le cours (0-100%) |
| is_completed | Boolean | @default(false) | Indique si le cours est terminé |
| last_accessed | DateTime | @default(now()) | Dernière date d'accès |
| started_at | DateTime? | | Date de début du cours (optionnel) |
| completed_at | DateTime? | | Date de fin du cours (optionnel) |

**Contrainte d'unicité :** `[user_id, course_id]`

**Relations :**
- Many-to-One avec `User` (un suivi appartient à un utilisateur)
- Many-to-One avec `Course` (un suivi concerne un cours)

### Category

Table des catégories pour les articles et cours.

| Colonne | Type | Attributs | Description |
|---------|------|-----------|-------------|
| id | String | @id @default(cuid()) | Identifiant unique de la catégorie |
| name | String | @unique | Nom unique de la catégorie |

**Relations :**
- One-to-Many avec `Article` (une catégorie peut contenir plusieurs articles)
- One-to-Many avec `Course` (une catégorie peut contenir plusieurs cours)

### Tool

Table des outils utilisés dans les cours.

| Colonne | Type | Attributs | Description |
|---------|------|-----------|-------------|
| id | String | @id @default(cuid()) | Identifiant unique de l'outil |
| name | String | @db.VarChar(150) | Nom de l'outil |
| link | String | @db.VarChar(200) | Lien vers l'outil |
| img | String | @db.Text | URL de l'image de l'outil |

**Relations :**
- Many-to-Many avec `Course` via `ToolCourse` (un outil peut être utilisé dans plusieurs cours)

### ToolCourse

Table de jonction entre outils et cours.

| Colonne | Type | Attributs | Description |
|---------|------|-----------|-------------|
| course_id | String | | Référence au cours |
| tool_id | String | | Référence à l'outil |

**Clé primaire composite :** `[course_id, tool_id]`

**Relations :**
- Many-to-One avec `Course` (une association appartient à un cours)
- Many-to-One avec `Tool` (une association concerne un outil)

### StaffRequest

Table des demandes adressées au staff.

| Colonne | Type | Attributs | Description |
|---------|------|-----------|-------------|
| id | String | @id @default(cuid()) | Identifiant unique de la demande |
| subject | String | @db.VarChar(150) | Sujet de la demande |
| message | String | @db.Text | Contenu de la demande |
| date_sending | DateTime | @db.Date | Date d'envoi |
| user_id | String | | Référence à l'utilisateur |

**Relations :**
- Many-to-One avec `User` (une demande est envoyée par un utilisateur)

### CommunityMessage

Table des messages communautaires.

| Colonne | Type | Attributs | Description |
|---------|------|-----------|-------------|
| id | String | @id @default(cuid()) | Identifiant unique du message |
| subject | String | @db.VarChar(150) | Sujet du message |
| content | String | @db.Text | Contenu du message |
| user_id | String | | Référence à l'utilisateur |

**Relations :**
- Many-to-One avec `User` (un message est envoyé par un utilisateur)

### FictiveAccount

Table des comptes fictifs pour les simulations.

| Colonne | Type | Attributs | Description |
|---------|------|-----------|-------------|
| id | String | @id @default(cuid()) | Identifiant unique du compte |
| solde | Int | | Solde du compte |
| number_account | Int | | Numéro du compte |
| user_id | String | | Référence à l'utilisateur |

**Relations :**
- Many-to-One avec `User` (un compte fictif appartient à un utilisateur)

### Glossary

Table du glossaire des termes.

| Colonne | Type | Attributs | Description |
|---------|------|-----------|-------------|
| id | String | @id @default(cuid()) | Identifiant unique de l'entrée |
| title | String | @unique | Terme unique du glossaire |
| definition | String | @db.Text | Définition du terme |
| created_at | DateTime | @default(now()) | Date de création |

## Diagramme des relations

```
User 1--* Article
User 1--* RealizeQuestionary
User 1--* StaffRequest
User 1--* CommunityMessage
User 1--* FictiveAccount
User 1--* UserReward
User 1--* UserCourse

Article *--1 Category
Article 1--* SequenceArticle

Course *--1 Category
Course 1--* Sequence
Course *--* Tool (via ToolCourse)
Course 1--* Questionary
Course 1--* UserCourse

Questionary 1--* Question
Questionary 1--* Answer
Questionary 1--* RealizeQuestionary
Questionary 1--* Reward

Question 1--* Answer

Reward 1--* UserReward
```

## Bonnes pratiques d'utilisation

### Création d'un utilisateur

```typescript
const newUser = await prisma.user.create({
  data: {
    firstname: "John",
    lastname: "Doe",
    pseudo: "johndoe",
    mail: "john.doe@example.com",
    password: hashedPassword,
    date_of_birth: new Date("1990-01-01"),
    is_revoice: false
  }
});
```

### Récupération d'un cours avec ses séquences

```typescript
const course = await prisma.course.findUnique({
  where: { id: courseId },
  include: {
    sequences: {
      orderBy: { index: 'asc' }
    },
    category: true,
    tool_courses: {
      include: { tool: true }
    }
  }
});
```

### Suivi de progression d'un utilisateur

```typescript
const userProgress = await prisma.userCourse.upsert({
  where: {
    user_id_course_id: {
      user_id: userId,
      course_id: courseId
    }
  },
  update: {
    progress: newProgress,
    last_accessed: new Date(),
    is_completed: newProgress >= 100,
    completed_at: newProgress >= 100 ? new Date() : null
  },
  create: {
    user_id: userId,
    course_id: courseId,
    progress: newProgress,
    started_at: new Date(),
    is_completed: false
  }
});
```

## Migrations et gestion du schéma

### Création d'une migration

```bash
npx prisma migrate dev --name nom_de_la_migration
```

### Application des migrations en production

```bash
npx prisma migrate deploy
```

### Réinitialisation de la base de données (développement uniquement)

```bash
npx prisma migrate reset
```

## Sécurité et bonnes pratiques

1. **Ne jamais stocker de mots de passe en clair** - Toujours utiliser des algorithmes de hachage comme bcrypt
2. **Utiliser des transactions** pour les opérations qui modifient plusieurs tables
3. **Valider les entrées utilisateur** avant de les enregistrer dans la base de données
4. **Limiter les permissions** de l'utilisateur de base de données en production
5. **Sauvegarder régulièrement** la base de données
6. **Utiliser des index** pour optimiser les requêtes fréquentes
7. **Éviter les requêtes N+1** en utilisant les fonctionnalités `include` de Prisma