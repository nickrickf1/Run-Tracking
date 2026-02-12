const bcrypt = require('bcrypt');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const { signAccessToken } = require('../services/token.services');

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 12;

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.email(),
    password: z.string().min(8),
});

const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
});

async function register(req, res, next) {
    try {
        const parsed = registerSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: "Errore di validazione", errors: parsed.error.errors });
        }

        const { name, email, password } = parsed.data;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: "Email già in uso" });
        }

        const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

        const user = await prisma.user.create({
            data: { name, email, passwordHash },
            select: { id: true, name: true, email: true, createdAt: true },
        });

        const token = signAccessToken({ userId: user.id, email: user.email });

        return res.status(201).json({ user, token });
    } catch (err) {
        next(err);
    }
}

async function login(req, res, next) {
    try {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: "Errore di validazione", errors: parsed.error.errors });
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: "Credenziali non valide" });
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
            return res.status(401).json({ message: "Credenziali non valide" });
        }

        const token = signAccessToken({ userId: user.id, email: user.email });

        return res.json({
            user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
            token,
        });
    } catch (err) {
        next(err);
    }
}

async function me(req, res, next) {
    try {
        const userId = req.user.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, createdAt: true },
        });

        if (!user) return res.status(404).json({ message: "Utente non trovato" });

        return res.json({ user });
    } catch (err) {
        next(err);
    }
}

module.exports = { register, login, me };
