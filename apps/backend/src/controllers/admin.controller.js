const prisma = require("../lib/prisma");

async function getUsers(req, res, next) {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                _count: { select: { runs: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        return res.json({ users });
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
