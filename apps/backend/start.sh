#!/bin/sh
set -e

echo "Aspetto che il database sia raggiungibile..."

MAX_RETRIES=10
RETRY=0

until npx prisma migrate deploy 2>/dev/null; do
    RETRY=$((RETRY + 1))
    if [ "$RETRY" -ge "$MAX_RETRIES" ]; then
        echo "Impossibile connettersi al database dopo $MAX_RETRIES tentativi"
        exit 1
    fi
    echo "DB non raggiungibile, riprovo tra 3 secondi... ($RETRY/$MAX_RETRIES)"
    sleep 3
done

echo "Migrazioni applicate. Avvio server..."
exec node src/server.js
