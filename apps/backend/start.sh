#!/bin/sh

echo "Aspetto che il database sia raggiungibile..."

MAX_RETRIES=10
RETRY=0

while [ "$RETRY" -lt "$MAX_RETRIES" ]; do
    if npx prisma migrate deploy 2>&1; then
        echo "Migrazioni applicate. Avvio server..."
        exec node src/server.js
    fi
    RETRY=$((RETRY + 1))
    echo "DB non raggiungibile, riprovo tra 3 secondi... ($RETRY/$MAX_RETRIES)"
    sleep 3
done

echo "Impossibile connettersi al database dopo $MAX_RETRIES tentativi"
exit 1
