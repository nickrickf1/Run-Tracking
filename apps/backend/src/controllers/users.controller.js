const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const { z } = require("zod");

const prisma = new PrismaClient();

const profileSchema = z.object({
    name: z.string().min(2),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
});

async function updateProfile(req, res) {
    try {
        const userId = req.user.userId;
        const parsed = profileSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: "Validation error", errors: parsed.error.flatten() });
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: { name: parsed.data.name },
            select: { id: true, name: true, email: true, createdAt: true },
        });

        return res.json({ user });
    } catch (err) {
        console.error("updateProfile error:", err);
        return res.status(500).json({ message: "Update profile failed", error: err.message });
    }
}

async function changePassword(req, res) {
    try {
        const userId = req.user.userId;
        const parsed = passwordSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: "Validation error", errors: parsed.error.flatten() });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ message: "User not found" });

        const ok = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
        if (!ok) return res.status(401).json({ message: "Current password is wrong" });

        const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
        await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

        return res.json({ ok: true });
    } catch (err) {
        console.error("changePassword error:", err);
        return res.status(500).json({ message: "Change password failed", error: err.message });
    }
}

module.exports = { updateProfile, changePassword };
