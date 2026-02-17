const prisma = require("../lib/prisma");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const BCRYPT_ROUNDS = 12;

const profileSchema = z.object({
    name: z.string().min(2),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
});

async function updateProfile(req, res, next) {
    try {
        const userId = req.user.userId;
        const parsed = profileSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: "Errore di validazione", errors: parsed.error.flatten() });
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: { name: parsed.data.name },
            select: { id: true, name: true, email: true, createdAt: true },
        });

        return res.json({ user });
    } catch (err) {
        next(err);
    }
}

async function changePassword(req, res, next) {
    try {
        const userId = req.user.userId;
        const parsed = passwordSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: "Errore di validazione", errors: parsed.error.flatten() });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ message: "Utente non trovato" });

        const ok = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
        if (!ok) return res.status(401).json({ message: "Password attuale non corretta" });

        const passwordHash = await bcrypt.hash(parsed.data.newPassword, BCRYPT_ROUNDS);
        await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

        return res.json({ ok: true });
    } catch (err) {
        next(err);
    }
}

module.exports = { updateProfile, changePassword };
