FROM node:20-alpine

WORKDIR /app

# Copia file di dipendenze
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Installa dipendenze (incluse dev per prisma generate)
RUN npm ci

# Genera il client Prisma
RUN npx prisma generate

# Copia il resto del codice
COPY . .

# Esponi la porta
EXPOSE 4000

# Avvia: migrazione DB + server
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
