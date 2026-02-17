const prisma = require('../lib/prisma');
const { toDate, startOfWeekMonday, addDays, formatYMD } = require('../utils/date');

async function getSummary(req, res, next) {
    try {
        const userId = req.user.userId;
        const { from, to } = req.query;

        const fromDate = toDate(from);
        const toDateVal = toDate(to);

        const where = { userId, deletedAt: null };
        if (fromDate || toDateVal) {
            where.date = {};
            if (fromDate) where.date.gte = fromDate;
            if (toDateVal) where.date.lte = toDateVal;
        }

        const runs = await prisma.run.findMany({
            where,
            select: { distanceKm: true, durationSec: true },
        });

        const totalRuns = runs.length;
        const totalDurationSec = runs.reduce((acc, r) => acc + (r.durationSec || 0), 0);
        const totalDistanceKm = runs.reduce((acc, r) => acc + Number(r.distanceKm || 0), 0);
        const avgDistanceKm = totalRuns ? totalDistanceKm / totalRuns : 0;
        const avgDurationSec = totalRuns ? totalDurationSec / totalRuns : 0;
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
        next(err);
    }
}

async function getWeekly(req, res, next) {
    try {
        const userId = req.user.userId;
        const weeks = Math.min(Math.max(parseInt(req.query.weeks || "12", 10), 1), 52);

        const now = new Date();
        const thisWeekStart = startOfWeekMonday(now);
        const from = addDays(thisWeekStart, -7 * (weeks - 1));
        const to = addDays(thisWeekStart, 7);

        const runs = await prisma.run.findMany({
            where: {
                userId,
                deletedAt: null,
                date: { gte: from, lt: to },
            },
            select: { date: true, distanceKm: true, durationSec: true },
            orderBy: { date: "asc" },
        });

        const buckets = new Map();

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

        return res.json({ weeks, from: from.toISOString(), to: to.toISOString(), series });
    } catch (err) {
        next(err);
    }
}

// PB distances in km with a small tolerance (e.g. 5K = runs >= 4.9 km)
const PB_DISTANCES = [
    { label: "5K", minKm: 4.9, maxKm: 5.5 },
    { label: "10K", minKm: 9.8, maxKm: 10.5 },
    { label: "Mezza maratona", minKm: 21.0, maxKm: 21.5 },
    { label: "Maratona", minKm: 42.0, maxKm: 42.5 },
];

async function getPersonalBests(req, res, next) {
    try {
        const userId = req.user.userId;

        const runs = await prisma.run.findMany({
            where: { userId, deletedAt: null },
            select: { id: true, date: true, distanceKm: true, durationSec: true },
            orderBy: { date: "desc" },
        });

        const pbs = [];
        for (const dist of PB_DISTANCES) {
            let best = null;
            for (const r of runs) {
                const km = Number(r.distanceKm);
                if (km < dist.minKm || km > dist.maxKm) continue;
                if (!best || r.durationSec < best.durationSec) {
                    best = r;
                }
            }
            pbs.push({
                label: dist.label,
                run: best
                    ? {
                        id: best.id,
                        date: best.date,
                        distanceKm: Number(best.distanceKm),
                        durationSec: best.durationSec,
                    }
                    : null,
            });
        }

        // Best pace (on runs >= 3 km)
        let bestPaceRun = null;
        for (const r of runs) {
            const km = Number(r.distanceKm);
            if (km < 3) continue;
            const pace = r.durationSec / km;
            if (!bestPaceRun || pace < bestPaceRun._pace) {
                bestPaceRun = { ...r, _pace: pace };
            }
        }

        // Longest run
        let longestRun = null;
        for (const r of runs) {
            const km = Number(r.distanceKm);
            if (!longestRun || km > Number(longestRun.distanceKm)) {
                longestRun = r;
            }
        }

        return res.json({
            distances: pbs,
            bestPace: bestPaceRun
                ? { id: bestPaceRun.id, date: bestPaceRun.date, distanceKm: Number(bestPaceRun.distanceKm), durationSec: bestPaceRun.durationSec }
                : null,
            longestRun: longestRun
                ? { id: longestRun.id, date: longestRun.date, distanceKm: Number(longestRun.distanceKm), durationSec: longestRun.durationSec }
                : null,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = { getSummary, getWeekly, getPersonalBests };
