#!/bin/sh
set -e

echo "=== Debug: contenuto prisma/migrations ==="
ls -la prisma/migrations/ 2>/dev/null || echo "Directory prisma/migrations non trovata!"
ls -la prisma/migrations/20260216160000_init/ 2>/dev/null || echo "Directory migrazione init non trovata!"
echo "=== Fine debug ==="

echo "Aspetto che il database sia raggiungibile..."

MAX_RETRIES=10
RETRY=0

while [ "$RETRY" -lt "$MAX_RETRIES" ]; do
    echo "Tentativo migrazione $((RETRY + 1))/$MAX_RETRIES..."
    if npx prisma migrate deploy; then
        echo "Migrazioni applicate con successo. Avvio server..."
        exec node src/server.js
    fi
    RETRY=$((RETRY + 1))
    echo "DB non raggiungibile, riprovo tra 3 secondi... ($RETRY/$MAX_RETRIES)"
    sleep 3
done

echo "Impossibile connettersi al database dopo $MAX_RETRIES tentativi"
exit 1
