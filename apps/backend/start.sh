#!/bin/sh

echo "=== Debug: working directory ==="
pwd
echo "=== Debug: contenuto prisma/ ==="
ls -laR prisma/ 2>&1 || echo "Directory prisma/ non trovata!"
echo "=== Debug: prisma.config.ts ==="
cat prisma.config.ts 2>&1 || echo "prisma.config.ts non trovato!"
echo "=== Fine debug ==="

echo "Aspetto che il database sia raggiungibile..."

MAX_RETRIES=10
RETRY=0

while [ "$RETRY" -lt "$MAX_RETRIES" ]; do
    echo "Tentativo migrazione $((RETRY + 1))/$MAX_RETRIES..."
    if npx prisma migrate deploy 2>&1; then
        echo "Migrazioni applicate con successo. Avvio server..."
        exec node src/server.js
    fi
    RETRY=$((RETRY + 1))
    echo "DB non raggiungibile, riprovo tra 3 secondi... ($RETRY/$MAX_RETRIES)"
    sleep 3
done

echo "Impossibile connettersi al database dopo $MAX_RETRIES tentativi"
exit 1
