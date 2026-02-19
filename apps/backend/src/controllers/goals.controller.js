const prisma = require("../lib/prisma");
const { z } = require("zod");
const { startOfWeekMonday, addDays } = require("../utils/date");

const goalSchema = z.object({
    targetKm: z.number().positive().max(1000).optional(),
    targetRuns: z.number().int().positive().max(30).optional(),
    targetPaceSec: z.number().int().positive().optional(),
    targetMonthlyKm: z.number().positive().max(5000).optional(),
});

async function getGoal(req, res, next) {
    try {
        const userId = req.user.userId;
        const goal = await prisma.weeklyGoal.findUnique({ where: { userId } });

        const now = new Date();
        const weekStart = startOfWeekMonday(now);
        const weekEnd = addDays(weekStart, 7);

        // Month boundaries
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        const [weekRuns, monthRuns] = await Promise.all([
            prisma.run.findMany({
                where: { userId, deletedAt: null, date: { gte: weekStart, lt: weekEnd } },
                select: { distanceKm: true, durationSec: true },
            }),
            prisma.run.findMany({
                where: { userId, deletedAt: null, date: { gte: monthStart, lt: monthEnd } },
                select: { distanceKm: true },
            }),
        ]);

        const currentKm = weekRuns.reduce((acc, r) => acc + Number(r.distanceKm || 0), 0);
        const currentRuns = weekRuns.length;
        const totalWeekDist = weekRuns.reduce((acc, r) => acc + Number(r.distanceKm || 0), 0);
        const totalWeekDur = weekRuns.reduce((acc, r) => acc + (r.durationSec || 0), 0);
        const currentPaceSec = totalWeekDist > 0 ? Math.round(totalWeekDur / totalWeekDist) : 0;
        const currentMonthlyKm = monthRuns.reduce((acc, r) => acc + Number(r.distanceKm || 0), 0);

        return res.json({
            targetKm: goal ? Number(goal.targetKm) : null,
            targetRuns: goal?.targetRuns || null,
            targetPaceSec: goal?.targetPaceSec || null,
            targetMonthlyKm: goal?.targetMonthlyKm ? Number(goal.targetMonthlyKm) : null,
            currentKm,
            currentRuns,
            currentPaceSec,
            currentMonthlyKm,
            weekStart: weekStart.toISOString(),
            weekEnd: weekEnd.toISOString(),
        });
    } catch (err) {
        next(err);
    }
}

async function setGoal(req, res, next) {
    try {
        const userId = req.user.userId;
        const parsed = goalSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: "Errore di validazione", errors: parsed.error.errors });
        }

        const data = {};
        if (parsed.data.targetKm !== undefined) data.targetKm = parsed.data.targetKm;
        if (parsed.data.targetRuns !== undefined) data.targetRuns = parsed.data.targetRuns;
        if (parsed.data.targetPaceSec !== undefined) data.targetPaceSec = parsed.data.targetPaceSec;
        if (parsed.data.targetMonthlyKm !== undefined) data.targetMonthlyKm = parsed.data.targetMonthlyKm;

        const goal = await prisma.weeklyGoal.upsert({
            where: { userId },
            update: data,
            create: { userId, targetKm: data.targetKm || 0, ...data },
        });

        return res.json({
            targetKm: Number(goal.targetKm),
            targetRuns: goal.targetRuns,
            targetPaceSec: goal.targetPaceSec,
            targetMonthlyKm: goal.targetMonthlyKm ? Number(goal.targetMonthlyKm) : null,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = { getGoal, setGoal };
