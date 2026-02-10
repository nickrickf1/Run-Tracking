const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

function toDate(value) {
    if (!value) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(value + "T00:00:00.000Z");
    return new Date(value);
}

function startOfWeekMonday(date){
    const d = new Date(date);
    const day = d.getUTCDay();
    const diff = (day === 0 ? -6 : 1 - day)
    d.setUTCDate(d.getUTCDate() + diff);
    d.setUTCHours(0,0,0,0);
    return d;
}

function addDays(date, days){
    const d = new Date(date);
    d.setUTCDate(d.getUTCDate() + days);
    return d;
}

function formatYMD(date){
    return date.toISOString().slice(0,10);
}

async function getSummary(req,res){
    try{
        const userId = req.user.userId;
        const {from , to } = req.query;

        const fromDate = toDate(from);
        const toDateVal = toDate(to);

        const where = {userId}
        if(fromDate || toDateVal){
            where.date = {}
            if (fromDate) where.date.gte = fromDate;
            if (toDateVal) where.date.lte = toDateVal;
        }

        const runs = await prisma.run.findMany({
            where,
            select: {distanceKm: true, durationSec : true},
        });

        const totalRuns = runs.length;
        const totalDurationSec = runs.reduce((acc, r) => acc + (r.durationSec || 0), 0);

        const totalDistanceKm = runs.reduce((acc, r) => acc + Number(r.distanceKm || 0), 0);

        const avgDistanceKm = totalRuns ? totalDistanceKm / totalRuns : 0;
        const avgDurationSec = totalRuns ? totalDurationSec / totalRuns : 0;

        // pace = sec/km
        const avgPaceSecPerKm = totalDistanceKm > 0 ? totalDurationSec / totalDistanceKm : 0;

        return res.json({
            range: {
                from: fromDate ? fromDate.toISOString() : null,
                to: toDateVal ? toDateVal.toISOString() : null,
            },
            totalRuns,
            totalDistanceKm,
            totalDurationSec,
            avgDistanceKm,
            avgDurationSec,
            avgPaceSecPerKm,
        });
    } catch (err) {
        console.error("getSummary error:", err);
        return res.status(500).json({ message: "errore sulle statistiche", error: err.message });
    }
}

async function getWeekly(req, res) {
    try {
        const userId = req.user.userId;
        const weeks = Math.min(Math.max(parseInt(req.query.weeks || "12", 10), 1), 52);

        // calcola intervallo: da inizio settimana (Monday) di N settimane fa fino a fine di questa settimana
        const now = new Date();
        const thisWeekStart = startOfWeekMonday(now);
        const from = addDays(thisWeekStart, -7 * (weeks - 1));
        const to = addDays(thisWeekStart, 7); // esclusivo

        const runs = await prisma.run.findMany({
            where: {
                userId,
                date: { gte: from, lt: to },
            },
            select: { date: true, distanceKm: true, durationSec: true },
            orderBy: { date: "asc" },
        });

        // bucket settimane
        const buckets = new Map(); // key: weekStartYMD -> { weekStart, weekEnd, totalDistanceKm, totalDurationSec, totalRuns }

        // inizializza tutte le settimane (anche vuote) per avere grafico continuo
        for (let i = 0; i < weeks; i++) {
            const weekStart = addDays(from, 7 * i);
            const weekEnd = addDays(weekStart, 7);
            const key = formatYMD(weekStart);
            buckets.set(key, {
                weekStart: weekStart.toISOString(),
                weekEnd: weekEnd.toISOString(),
                totalDistanceKm: 0,
                totalDurationSec: 0,
                totalRuns: 0,
            });
        }

        for (const r of runs) {
            const weekStart = startOfWeekMonday(r.date);
            const key = formatYMD(weekStart);
            const b = buckets.get(key);
            if (!b) continue;

            b.totalRuns += 1;
            b.totalDurationSec += r.durationSec || 0;
            b.totalDistanceKm += Number(r.distanceKm || 0);
        }

        const series = Array.from(buckets.values());

        return res.json({
            weeks,
            from: from.toISOString(),
            to: to.toISOString(),
            series,
        });
    } catch (err) {
        console.error("getWeekly error:", err);
        return res.status(500).json({ message: "Stats weekly failed", error: err.message });
    }
}

module.exports = { getSummary, getWeekly };
