const prisma = require("../lib/prisma");
const { z } = require("zod");
const { startOfWeekMonday, addDays } = require("../utils/date");

const goalSchema = z.object({
    targetKm: z.number().positive().max(1000),
});

async function getGoal(req, res, next) {
    try {
        const userId = req.user.userId;

        const goal = await prisma.weeklyGoal.findUnique({ where: { userId } });

        // Calculate current week progress
        const now = new Date();
        const weekStart = startOfWeekMonday(now);
        const weekEnd = addDays(weekStart, 7);

        const runs = await prisma.run.findMany({
            where: {
                userId,
                deletedAt: null,
                date: { gte: weekStart, lt: weekEnd },
            },
            select: { distanceKm: true },
        });

        const currentKm = runs.reduce((acc, r) => acc + Number(r.distanceKm || 0), 0);

        return res.json({
            targetKm: goal ? Number(goal.targetKm) : null,
            currentKm,
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

        const goal = await prisma.weeklyGoal.upsert({
            where: { userId },
            update: { targetKm: parsed.data.targetKm },
            create: { userId, targetKm: parsed.data.targetKm },
        });

        return res.json({ targetKm: Number(goal.targetKm) });
    } catch (err) {
        next(err);
    }
}

module.exports = { getGoal, setGoal };
