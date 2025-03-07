# Architecture de Wisechain
## Fonctionnalités NextJS

### Server-Side Rendering (SSR)/Client-Side Rendering (CSR)

J'utilise le SSR pour les pages qui nécessitent des données au moment du chargement et du CSR pour les pages qui nécessitent des données au moment du chargement.

## Middleware d'authentification

J'utilise le middleware NextJS pour protéger certaines routes :

```typescript
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if ((request.nextUrl.pathname.startsWith('/api-doc') || 
       request.nextUrl.pathname.startsWith('/backoffice')) && !token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const response = NextResponse.next();

  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), browsing-topics=()'
  );

  async function verifyRolesAndRedirect(allowedRoles: Roles[]) {
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);

      if (!payload || typeof payload !== 'object' || !('roles' in payload)) {
        throw new Error('Invalid token payload');
      }

      const userRoles = Array.isArray(payload.roles) ? payload.roles : [payload.roles];

      if (!userRoles.some(role => allowedRoles.includes(role))) {
        return NextResponse.redirect(new URL('/', request.url));
      }

      return null;
    } catch (error) {
      console.error('Erreur de vérification du token:', error);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  if (request.nextUrl.pathname.startsWith('/backoffice')) {
    const redirectResponse = await verifyRolesAndRedirect([
      Roles.ADMIN,
      Roles.DEVELOPER,
      Roles.REDACTOR,
      Roles.MODERATOR
    ]);
    if (redirectResponse) return redirectResponse;
  }

  if (request.nextUrl.pathname.startsWith('/api-doc')) {
    const redirectResponse = await verifyRolesAndRedirect([
      Roles.ADMIN,
      Roles.DEVELOPER
    ]);
    if (redirectResponse) return redirectResponse;
  }
  
  if (token) {
    response.cookies.set('token', token, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  matcher: ['/:path*', '/api-doc', '/api-doc/:path*', '/backoffice', '/backoffice/:path*'],
};
```

## Prisma

Mon application utilise Prisma comme ORM pour interagir avec la base de données MySQL. <a href="/db/">Documentation Prisma</a>

### Client Prisma Singleton

Pour éviter de créer trop d'instances du client Prisma, j'utilise un pattern singleton :
```typescript
declare global {
  var prisma: PrismaClient | undefined
}

const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') global.prisma = prisma

export default prisma
```

### API Routes

J'utilise les API Routes de NextJS pour créer notre API backend 

## Structure du projet

```
app/
├── api/               # API Routes
├── page.tsx           # Pages
├── layout.tsx         # Layout
├── error.tsx          # Erreur
├── page.tsx           # Pages
├── sitmap.tsx         # Referencement SEO
├── components/        # Composants React réutilisables
├── cypress/           # Tests
│   ├── Data/          # Données de test
│   ├── e2e/           # Script de tests e2e
│   ├── Fixtures/      # Fixtures de test
│   ├── Support/       # Support de test
│   └── ...            
├── hooks/             # Hooks
│   └── ...            
├── lib/               # Utilitaires et fonctions partagées
│   ├──axios           # Axios
│   ├──constants       # Constantes
│   ├──enums           # Enums
│   ├──interfaces      # Interfaces
│   ├──middleware      # Middleware
│   ├──services        # Services
│   ├──sql             # Backup SQL BDD
│   ├──store           # Store
│   ├──utils           # Utilitaires
│   └──validators      # Validators
│       └──...         
├── prisma/            # Configuration Prisma
│   ├── schema.prisma  # Schéma de base de données
│   └── migrations/    # Migrations de base de données
├── public/            # Fichiers statiques
├── styles/            # Fichiers CSS/SCSS
├── .env               # Variables d'environnement
├── .env.prod          # Variables d'environnement de production
├── cypress.config.ts  # Configuration Cypress
├── tailwind.config.ts # Configuration Tailwind
├── tsconfig.json      # Configuration TypeScript
├── minio.config.ts    # Configuration Minio
├── middleware.ts      # Middleware NextJs pour les routes protégées
├── docker-compose.yml # Configuration Docker
├── .gitignore         # Fichiers ignorés par Git
├── .prettier.config.js# Configuration Prettier
├── .eslintrc.json     # Configuration ESLint
├── postcss.config.ts  # Configuration PostCSS
├── next.config.js     # Configuration NextJS
├── robot.txt          # Configuration Robot referencement SEO
└── package.json       # Dépendances
```

## Vue d'ensemble

Wisechain est une application full-stack construite avec les technologies suivantes :

- **Frontend** : Next.js, React, TypeScript
- **Backend** : API Routes Next.js, Node.js
- **Base de données** : MySQL via Prisma ORM
- **Infrastructure** : Conteneurs Docker sur Scaleway
- **CI/CD** : Pipeline GitLab

## Architecture des composants

```
┌─────────────────────────────────────┐
│            Client Browser           │
└───────────────────┬─────────────────┘
                    │
                    ▼
┌─────────────────────────────────────┐
│              Nginx Proxy            │
└───────────────────┬─────────────────┘
                    │
                    ▼
┌─────────────────────────────────────┐
│         Next.js Application         │
├─────────────────┬───────────────────┤
│    Frontend     │      Backend      │
│     (Next)      │ (API Routes Next) │
└─────────────────┴─────────┬─────────┘
                            │
                            ▼
┌─────────────────────────────────────┐
│           Prisma Client             │
└───────────────────┬─────────────────┘
                    │
                    ▼
┌─────────────────────────────────────┐
│            MySQL Database           │
└─────────────────────────────────────┘
```

## Flux de données

1. Le navigateur client envoie une requête au serveur
2. Nginx reçoit la requête et la transmet à l'application Next.js
3. Next.js traite la requête :
   - Si c'est une page, le rendu est effectué côté serveur (SSR) lorsque le composant est un composant serveur side rendering
   - Si c'est une API, la route API correspondante est appelée
4. Les requêtes de données sont gérées par Prisma Client
5. Prisma communique avec la base de données MySQL
6. Les données sont renvoyées au client

## Environnements

| Environnement | URL | Description |
|---------------|-----|-------------|
| Production | https://wisechain.fr | Environnement de production |
| Staging | https://staging.wisechain.fr | Environnement de pré-production |
| Développement | Local | Environnement local des développeurs |

## Sécurité

- **HTTPS** : Toutes les communications sont chiffrées via SSL/TLS
- **Authentication** : Système d'authentification basé sur JWT
- **Autorisation** : Contrôle d'accès basé sur les rôles
- **Protection des données** : Validation des entrées, échappement des sorties

## Scalabilité

L'architecture est conçue pour être scalable horizontalement :

- Conteneurs Docker sans état
- Base de données séparée
- Cache distribué

## Bonnes pratiques

1. **Validation des données** : Utilisez zod ou joi pour valider les entrées utilisateur
2. **Gestion des erreurs** : Implémentez une gestion d'erreurs cohérente
3. **Optimisation des requêtes Prisma** : Utilisez `select` pour limiter les champs retournés
4. **Sécurité** : Protégez contre les injections SQL, XSS et CSRF
5. **Performance** : Utilisez le SSG quand c'est possible, le SSR quand nécessaire


<!-- 
## Configuration de Prisma

Notre application utilise Prisma comme ORM pour interagir avec la base de données MySQL. Voici comment nous l'avons configuré :

### Client Prisma Singleton

Pour éviter de créer trop d'instances du client Prisma, nous utilisons un pattern singleton :

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;
```

### Utilisation dans les API Routes

```typescript
// pages/api/users/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: String(id) },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        pseudo: true,
        profile_img: true,
        // Exclure les champs sensibles comme password
      }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    return res.status(200).json(user);
  } catch (error) {
    console.error('Erreur:', error);
    return res.status(500).json({ message: 'Erreur serveur interne' });
  }
}
```

## Fonctionnalités NextJS

### Server-Side Rendering (SSR)

Nous utilisons le SSR pour les pages qui nécessitent des données au moment du chargement :

```typescript
// pages/courses/[id].tsx
import { GetServerSideProps } from 'next';
import prisma from '../../lib/prisma';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params;
  
  try {
    const course = await prisma.course.findUnique({
      where: { id: String(id) },
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
    
    if (!course) {
      return { notFound: true };
    }
    
    return {
      props: {
        course: JSON.parse(JSON.stringify(course)) // Serialisation pour NextJS
      }
    };
  } catch (error) {
    console.error('Erreur:', error);
    return { notFound: true };
  }
}
```

### Static Site Generation (SSG)

Pour les pages dont le contenu change peu fréquemment, nous utilisons la génération statique :

```typescript
// pages/articles/index.tsx
import { GetStaticProps } from 'next';
import prisma from '../../lib/prisma';

export const getStaticProps: GetStaticProps = async () => {
  const articles = await prisma.article.findMany({
    where: { status: 'published' },
    take: 10,
    orderBy: { created_at: 'desc' },
    include: {
      user: {
        select: { pseudo: true }
      },
      category: true
    }
  });
  
  return {
    props: {
      articles: JSON.parse(JSON.stringify(articles))
    },
    revalidate: 3600 // Revalidation toutes les heures
  };
};
```



```typescript
// pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }
  
  const { email, password } = req.body;
  
  try {
    const user = await prisma.user.findUnique({
      where: { mail: email }
    });
    
    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }
    
    const token = jwt.sign(
      { userId: user.id, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        pseudo: user.pseudo,
        roles: user.roles
      }
    });
  } catch (error) {
    console.error('Erreur:', error);
    return res.status(500).json({ message: 'Erreur serveur interne' });
  }
}
```

## Middleware d'authentification

Nous utilisons le middleware NextJS pour protéger certaines routes :

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuth } from './lib/auth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  // Vérifier si l'utilisateur est authentifié pour les routes protégées
  if (request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/profile')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    try {
      // Vérifier le token
      await verifyAuth(token);
      return NextResponse.next();
    } catch (error) {
      // Token invalide
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // Vérifier les permissions admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    try {
      const payload = await verifyAuth(token);
      if (payload.roles !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/admin/:path*'],
};
```

## Bonnes pratiques

1. **Validation des données** : Utilisez zod ou joi pour valider les entrées utilisateur
2. **Gestion des erreurs** : Implémentez une gestion d'erreurs cohérente
3. **Optimisation des requêtes Prisma** : Utilisez `select` pour limiter les champs retournés
4. **Sécurité** : Protégez contre les injections SQL, XSS et CSRF
5. **Performance** : Utilisez le SSG quand c'est possible, le SSR quand nécessaire -->