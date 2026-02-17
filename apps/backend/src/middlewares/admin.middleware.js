const prisma = require("../lib/prisma");

async function adminMiddleware(req, res, next) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { role: true },
        });

        if (!user || user.role !== "admin") {
            return res.status(403).json({ message: "Accesso riservato agli admin" });
        }

        next();
    } catch (err) {
        next(err);
    }
}

module.exports = { adminMiddleware };
