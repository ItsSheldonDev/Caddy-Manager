# Caddy Manager

Un tableau de bord moderne pour gérer facilement vos configurations Caddy Server.

## Fonctionnalités

- 🔄 Création et gestion de sites en reverse proxy
- 📂 Configuration de sites web statiques
- 🔒 Gestion des certificats SSL
- 📊 Dashboard avec statistiques et monitoring
- 📝 Journalisation des activités
- 👥 Gestion des utilisateurs et des permissions

## Technologies utilisées

- **Frontend**: SvelteKit, Tailwind CSS
- **Backend**: Node.js
- **Base de données**: PostgreSQL avec Prisma ORM
- **Serveur web**: Caddy Server v2

## Installation

### Prérequis

- Node.js 18+
- PostgreSQL
- Docker (recommandé)

### Installation avec Docker

```bash
# Cloner le dépôt
git clone https://github.com/ItsSheldonDev/Caddy-Manager.git
cd Caddy-Manager

# Installer les dépendances
bun install

# Configurer les variables d'environnement
cp .env.example .env
# Éditez .env pour configurer vos paramètres

# Lancer les conteneurs Docker
docker-compose up -d

# Exécuter les migrations de base de données
bunx prisma migrate dev

# Lancer l'application en mode développement
bun dev
```

## Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/caddy_manager"
CADDY_API_URL="http://localhost:2019"
```

## Développement

```bash
# Lancer en mode développement
bun dev

# Générer les types Prisma
bunx prisma generate

# Exécuter les migrations
bunx prisma migrate dev
```

## Déploiement en production

```bash
# Construire l'application
bun run build

# Démarrer en production
bun run start
```

## Structure du projet

```
src/
├── lib/               # Librairies et utilitaires
│   ├── repositories/  # Couche d'accès aux données
│   ├── services/      # Services métier
│   └── types/         # Types TypeScript
├── routes/            # Routes SvelteKit
└── app.html           # Template HTML
```

## Contribuer

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## Licence

Ce projet est sous licence MIT.