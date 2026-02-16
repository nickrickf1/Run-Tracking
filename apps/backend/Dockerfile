FROM node:20-alpine

WORKDIR /app

# Copia file di dipendenze e prisma
COPY package.json package-lock.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Installa dipendenze (incluse dev per prisma generate)
RUN npm ci

# Genera il client Prisma
RUN npx prisma generate

# Copia il resto del codice
COPY . .

ENV NODE_ENV=production

EXPOSE 4000

# Avvia: migrazione DB + server
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
