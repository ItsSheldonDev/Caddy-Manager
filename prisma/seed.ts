import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto'; // Pour générer un mot de passe hashé

const prisma = new PrismaClient();

async function main() {
  // Créer un utilisateur admin par défaut
  const adminId = crypto.randomUUID();
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      id: adminId,
      email: 'admin@example.com',
      hashedPassword: 'CHANGE_ME_LATER', // À remplacer par un vrai hash
      name: 'Admin',
      role: 'admin'
    }
  });

  // Insérer les paramètres par défaut
  await prisma.setting.createMany({
    data: [
      {
        key: 'caddy_api_url',
        value: 'http://localhost:2019',
        description: 'URL de l\'API Caddy'
      },
      {
        key: 'caddy_file_path',
        value: '/etc/caddy/Caddyfile',
        description: 'Chemin vers le fichier Caddyfile'
      },
      {
        key: 'enable_auto_https',
        value: 'true',
        description: 'Activer HTTPS automatique avec Let\'s Encrypt'
      },
      {
        key: 'default_email',
        value: 'admin@example.com',
        description: 'Email par défaut pour Let\'s Encrypt'
      }
    ],
    skipDuplicates: true
  });

  console.log('Base de données initialisée avec succès');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });