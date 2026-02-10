const bcrypt = require('bcrypt');
const {z} = require("zod")
const {PrismaClient} = require('@prisma/client')
const {signAccessToken} = require('../services/token.services')

const prisma = new PrismaClient()

const registerSchema = z.object({
    name : z.string().min(2),
    email : z.email(),
    password: z.string().min(8),
});

const loginSchema = z.object({
    email : z.email(),
    password: z.string().min(8),
});

async function register(req, res) {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({message : "Errore di validazione", errors: parsed.error.errors})
    }

    const {name, email, password} = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return res.status(409).json({message : "Email gia in uso"});
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
        data : {name, email, passwordHash},
        select : {id: true, name: true, email: true, createdAt: true},
    });

    const token = signAccessToken({ userId: user.id, email: user.email });

    return res.status(201).json({user, token });

}

async function login(req, res) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({message : "Errore di validazione", errors: parsed.error.errors})
    }

    const {email, password} = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return res.status(401).json({message : "credenziali errati"});
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok){
        return res.status(401).json({message : "credenziali errati"});
    }

    const token = signAccessToken({ userId: user.id, email: user.email });

    return res.json({
        user: {id : user.id, name : user.name ,email : user.email, createdAt : user.createdAt },
        token : token,
    });
}

async function me(req, res) {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {id: true, name: true, email: true, createdAt: true},
    });

    return res.json({user})
}

module.exports = {register, login, me}