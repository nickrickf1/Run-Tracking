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
                    _count: { select: { runs: true } },
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

module.exports = { getUsers, getUserDetail };
