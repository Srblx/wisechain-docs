# Gestion des versions et branches du projet

## Vue d'ensemble de ma stratégie de branches

J'ai organisé mon développement autour de plusieurs branches principales :

- `main` : La branche principale contenant le code stable
- `develop` : Ma branche de développement principal
- `WC-2` à `WC-12` : Les branches de fonctionnalités (feature branches)

![Diagramme des branches Git](/wisechain-docs/assets/img/git-tree.png)
- Les tests sont isolés dans une branche dédiée

## Détail de mon workflow

1. J'ai commencé par créer une branche `develop` à partir de `main`
2. Pour chaque nouvelle fonctionnalité, j'ai créé une branche dédiée (WC-X)
3. Les premières fonctionnalités (WC-2 à WC-4) ont été développées en parallèle
4. J'ai ensuite fusionné ces branches dans `develop` une fois les développements terminés

![Diagramme des branches Git](/wisechain-docs/assets/img/git-tree-detail.png)

5. J'ai continué ce processus avec les fonctionnalités suivantes :
   - WC-5 à WC-7 : Deuxième vague de développement
   - WC-8 à WC-11 : Troisième vague de développement
6. La dernière branche `test-WC-12` a été créée pour les tests finaux
7. Une fois tous les tests validés, j'ai fusionné `develop` dans `main`

## Points clés de ma stratégie

- J'ai utilisé un workflow basé sur GitFlow
- Chaque fonctionnalité a sa propre branche
- Les fusions sont faites de manière régulière vers `develop`
- Les tests sont isolés dans une branche dédiée
- La branche `main` ne reçoit que du code stable et testé

Cette organisation m'a permis de :
- Travailler sur plusieurs fonctionnalités en parallèle
- Maintenir un historique clair des développements
- Isoler les bugs potentiels
- Faciliter les revues de code
- Garantir la stabilité de la branche principale
