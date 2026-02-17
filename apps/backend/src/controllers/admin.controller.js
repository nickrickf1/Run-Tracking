const prisma = require("../lib/prisma");

async function getUsers(req, res, next) {
    try {
        const page = Math.max(parseInt(req.query.page || "1", 10), 1);
        const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || "20", 10), 1), 100);
        const search = req.query.search ? String(req.query.search).trim() : "";

        const where = search
            ? {
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { email: { contains: search, mode: "insensitive" } },
                ],
            }
            : {};

        const [total, users] = await Promise.all([
            prisma.user.count({ where }),
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    _count: { select: { runs: { where: { deletedAt: null } } } },
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
        ]);

        return res.json({ page, pageSize, total, users });
    } catch (err) {
        next(err);
    }
}

async function getUserDetail(req, res, next) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                runs: {
                    where: { deletedAt: null },
                    orderBy: { date: "desc" },
                    take: 20,
                },
            },
        });

        if (!user) return res.status(404).json({ message: "Utente non trovato" });

        return res.json({ user });
    } catch (err) {
        next(err);
    }
}

async function getDashboard(req, res, next) {
    try {
        const [totalUsers, totalRuns, runsAgg, recentUsers] = await Promise.all([
            prisma.user.count(),
            prisma.run.count({ where: { deletedAt: null } }),
            prisma.run.aggregate({
                where: { deletedAt: null },
                _sum: { distanceKm: true, durationSec: true },
            }),
            prisma.user.findMany({
                orderBy: { createdAt: "desc" },
                take: 5,
                select: { id: true, name: true, email: true, createdAt: true },
            }),
        ]);

        // Registrations per month (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const usersInRange = await prisma.user.findMany({
            where: { createdAt: { gte: sixMonthsAgo } },
            select: { createdAt: true },
            orderBy: { createdAt: "asc" },
        });

        const regByMonth = {};
        for (const u of usersInRange) {
            const key = u.createdAt.toISOString().slice(0, 7); // YYYY-MM
            regByMonth[key] = (regByMonth[key] || 0) + 1;
        }

        const registrationSeries = Object.entries(regByMonth).map(([month, count]) => ({ month, count }));

        return res.json({
            totalUsers,
            totalRuns,
            totalDistanceKm: Number(runsAgg._sum.distanceKm || 0),
            totalDurationSec: runsAgg._sum.durationSec || 0,
            recentUsers,
            registrationSeries,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = { getUsers, getUserDetail, getDashboard };
