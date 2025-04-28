# Étape de build
FROM node:20.12.2-alpine3.19 AS build

# Installer Bun
RUN apk add --no-cache curl unzip
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="${PATH}:/root/.bun/bin"

WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# Étape de production
FROM node:20.12.2-alpine3.19 AS production

WORKDIR /app

# Copier les fichiers de build
COPY --from=build /app/build ./build
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules

# Exposer le port
EXPOSE 3000

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Commande de démarrage
CMD ["node", "build"]