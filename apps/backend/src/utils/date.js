/**
 * Converte una stringa data in oggetto Date UTC.
 * Supporta "YYYY-MM-DD" e ISO datetime.
 * Restituisce null se il valore è vuoto.
 * Lancia un errore se la data non è valida.
 */
function toDate(value) {
    if (!value) return null;

    let date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        date = new Date(value + "T00:00:00.000Z");
    } else {
        date = new Date(value);
    }

    if (isNaN(date.getTime())) {
        throw new Error(`Data non valida: "${value}"`);
    }

    return date;
}

function startOfWeekMonday(date) {
    const d = new Date(date);
    const day = d.getUTCDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setUTCDate(d.getUTCDate() + diff);
    d.setUTCHours(0, 0, 0, 0);
    return d;
}

function addDays(date, days) {
    const d = new Date(date);
    d.setUTCDate(d.getUTCDate() + days);
    return d;
}

function formatYMD(date) {
    return date.toISOString().slice(0, 10);
}

module.exports = { toDate, startOfWeekMonday, addDays, formatYMD };
