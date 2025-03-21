# Documentation des Tests E2E

## 🎯 Objectifs des Tests

Les tests end-to-end ont été implémentés pour sécuriser les fonctionnalités critiques de l'application, particulièrement celles impliquant :

- La gestion des données utilisateurs
- La sécurité des accès
- La persistance des données en base

## 🛠️ Configuration Cypress

Les tests sont exécutés avec Cypress, configuré comme suit :

```javascript
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:2323', 
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
  },
  video: true,
});
```

## 🔍 Fonctionnalités Testées

### 1. Authentification
- **Inscription**
- **Connexion**
- **Mise à jour du profil**

> **Pourquoi ?** Ces fonctionnalités sont critiques car elles gèrent les données sensibles des utilisateurs et l'accès à l'application.

### 2. Questionnaires
- **Réalisation des quiz**
- **Sauvegarde des scores**

> **Pourquoi ?** C'est le cœur fonctionnel de l'application, impliquant des interactions complexes et la persistance de données.

## 💡 Exemples de Tests

### 1. Test d'Inscription
```javascript
describe('Signup', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(1500);
    cy.get('[data-testid="user-menu-button"]').click();
    cy.get('[data-testid="signup-link"]').click();
    cy.get('[data-testid="terms-checkbox"]').click();
  });

  it('should display error messages for invalid inputs', () => {
    cy.get('[data-testid="firstname"]').clear().type(CypressData.firstNameError);
    cy.get('[data-testid="lastname"]').clear().type(CypressData.lastNameError);
    cy.get('[data-testid="pseudo"]').clear().type(CypressData.pseudoError);
    cy.get('[data-testid="mail"]').clear().type(CypressData.mailError);
    cy.get('[data-testid="password"]').clear().type(CypressData.passwordError);
    cy.get('[data-testid="confirmPassword"]').clear().type(CypressData.confirmPasswordError);
    cy.get('[data-testid="dateOfBirth"]').clear().type(CypressData.birthDateErrorLess10Years);
    cy.get('[data-testid="country"]').click();
    cy.contains(CypressData.countryError).click();

    cy.contains('Le nom doit contenir au moins 3 caractères').should('be.visible');
    cy.contains('Le prénom doit contenir au moins 3 caractères').should('be.visible');
    cy.contains('Le pseudo doit contenir au moins 3 caractères').should('be.visible');
    cy.contains('Email invalide').should('be.visible');
    cy.contains('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial').should('be.visible');
    cy.contains('Les mots de passe ne correspondent pas').should('be.visible');
    cy.contains('Vous devez avoir au moins 10 ans').should('be.visible');
  });
  .../
```
<video width="100%" controls>
  <source src="/wisechain-docs/assets/videos/signup.cy.ts.mp4" type="video/mp4">
  Votre navigateur ne supporte pas la lecture de vidéos.
</video>

### 2. Test du Profil Utilisateur 
```javascript
/...
it('should show error for incorrect current password', () => {
    cy.get('[data-testid="update-password-button"]').click();
    cy.get('[data-testid="current-password-field"]').clear().type(CypressData.passwordLenghtError);
    cy.get('[data-testid="new-password-field"]').clear().type(CypressData.newPassword);
    cy.get('[data-testid="confirm-new-password-field"]').clear().type(CypressData.newPassword);
    cy.contains('button', 'Enregistrer le mot de passe').click();
    cy.get('.Toastify__toast--error')
      .should('be.visible')
      .and('have.text', 'Ancien mot de passe incorrect');
  });

  it('should successfully update password', () => {
    cy.get('[data-testid="update-password-button"]').click();
    cy.get('[data-testid="current-password-field"]').clear().type(CypressData.password);
    cy.get('[data-testid="new-password-field"]').clear().type(CypressData.newPassword);
    cy.get('[data-testid="confirm-new-password-field"]').clear().type(CypressData.newPassword);
    cy.contains('button', 'Enregistrer le mot de passe').click();
    cy.wait(1000);
    cy.get('.Toastify__toast--success')
      .should('be.visible')
      .and('have.text', 'Mot de passe mis à jour avec succès');
      CypressData.password = CypressData.newPassword;
  });
.../
```
<video width="100%" controls>
  <source src="/wisechain-docs/assets/videos/profile.cy.ts.mp4" type="video/mp4">
  Votre navigateur ne supporte pas la lecture de vidéos.
</video>

## ❌ Fonctionnalités Non Testées

### Navigation Simple
- Menu
- Liens de base
- Affichage statique

> **Pourquoi ?** Ces éléments sont moins critiques et ne comportent pas de logique complexe ou de manipulation de données.

## 📊 Résultats

Les tests automatisés nous permettent de :
- Détecter rapidement les régressions
- Valider les fonctionnalités critiques
- Assurer la qualité des déploiements

## 🔄 Fréquence d'Exécution

Les tests sont exécutés :
- À chaque push sur la branche principale
- Avant chaque déploiement
- Sur demande pendant le développement

Cette approche ciblée des tests nous permet de maintenir un équilibre entre couverture de test et efficacité du développement.