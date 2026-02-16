FROM node:20-alpine

WORKDIR /app

# Copia file di dipendenze
COPY package.json package-lock.json ./

# Installa dipendenze (incluse dev per prisma generate)
RUN npm ci

# Copia prisma schema, config e migrazioni
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Genera il client Prisma (URL dummy: prisma generate non si connette al DB)
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

# Copia il resto del codice
COPY . .

# Script di avvio con retry per aspettare il DB
COPY start.sh ./
RUN chmod +x start.sh

ENV NODE_ENV=production

EXPOSE 4000

CMD ["./start.sh"]
