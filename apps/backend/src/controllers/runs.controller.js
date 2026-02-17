const prisma = require('../lib/prisma');
const { z } = require('zod');
const { toDate } = require('../utils/date');

const dateSchema = z.union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La data deve essere in formato YYYY-MM-DD"),
    z.string().datetime(),
]);

const runCreateSchema = z.object({
    date: dateSchema,
    distanceKm: z.number().positive(),
    durationSec: z.number().int().positive(),
    type: z.enum(['lento', 'tempo', 'variato', 'lungo', 'gara', 'forza']).optional().default('lento'),
    rpe: z.number().int().min(1).max(10).optional(),
    notes: z.string().max(1000).optional(),
});

const runUpdateSchema = z.object({
    date: dateSchema.optional(),
    distanceKm: z.number().positive().optional(),
    durationSec: z.number().int().positive().optional(),
    type: z.enum(['lento', 'tempo', 'variato', 'lungo', 'gara', 'forza']).optional(),
    rpe: z.number().int().min(1).max(10).nullable().optional(),
    notes: z.string().max(1000).nullable().optional(),
});

async function createRun(req, res, next) {
    try {
        const parsed = runCreateSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: "Errore di validazione", errors: parsed.error.errors });
        }

        const userId = req.user.userId;
        const data = parsed.data;

        const run = await prisma.run.create({
            data: {
                userId,
                date: toDate(data.date),
                distanceKm: data.distanceKm,
                durationSec: data.durationSec,
                type: data.type,
                rpe: data.rpe,
                notes: data.notes,
            },
        });
        return res.status(201).json({ run });
    } catch (err) {
        next(err);
    }
}

async function listRuns(req, res, next) {
    try {
        const userId = req.user.userId;

        const { from, to, type } = req.query;
        const page = Math.max(parseInt(req.query.page || "1", 10), 1);
        const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || "10", 10), 1), 50);

        const where = { userId };

        if (type) where.type = String(type);

        if (from || to) {
            where.date = {};
            if (from) where.date.gte = toDate(String(from));
            if (to) where.date.lte = toDate(String(to));
        }

        const [total, runs] = await Promise.all([
            prisma.run.count({ where }),
            prisma.run.findMany({
                where,
                orderBy: { date: "desc" },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
        ]);

        return res.json({ page, pageSize, total, runs });
    } catch (err) {
        next(err);
    }
}

async function getRunById(req, res, next) {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        const run = await prisma.run.findFirst({ where: { id, userId } });
        if (!run) return res.status(404).json({ message: "Corsa non trovata" });

        return res.json({ run });
    } catch (err) {
        next(err);
    }
}

async function updateRun(req, res, next) {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        const parsed = runUpdateSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: "Errore di validazione", errors: parsed.error.errors });
        }

        const existing = await prisma.run.findFirst({ where: { id, userId } });
        if (!existing) return res.status(404).json({ message: "Corsa non trovata" });

        const data = parsed.data;

        const updated = await prisma.run.update({
            where: { id },
            data: {
                ...(data.date ? { date: toDate(data.date) } : {}),
                ...(data.distanceKm !== undefined ? { distanceKm: data.distanceKm } : {}),
                ...(data.durationSec !== undefined ? { durationSec: data.durationSec } : {}),
                ...(data.type !== undefined ? { type: data.type } : {}),
                ...(data.rpe !== undefined ? { rpe: data.rpe } : {}),
                ...(data.notes !== undefined ? { notes: data.notes } : {}),
            },
        });
        return res.json({ run: updated });
    } catch (err) {
        next(err);
    }
}

async function deleteRun(req, res, next) {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        const existing = await prisma.run.findFirst({ where: { id, userId } });
        if (!existing) return res.status(404).json({ message: "Corsa non trovata" });

        await prisma.run.delete({ where: { id } });
        return res.status(204).end();
    } catch (err) {
        next(err);
    }
}

async function exportCsv(req, res, next) {
    try {
        const userId = req.user.userId;

        const runs = await prisma.run.findMany({
            where: { userId },
            orderBy: { date: "desc" },
        });

        const header = "Data,Distanza (km),Durata (sec),Passo (sec/km),Tipo,RPE,Note";
        const rows = runs.map((r) => {
            const km = Number(r.distanceKm);
            const pace = km > 0 ? Math.round(r.durationSec / km) : 0;
            const notes = (r.notes || "").replace(/"/g, '""');
            return `${r.date.toISOString().slice(0, 10)},${km.toFixed(2)},${r.durationSec},${pace},${r.type},${r.rpe || ""},${notes ? `"${notes}"` : ""}`;
        });

        const csv = [header, ...rows].join("\n");

        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", "attachment; filename=corse.csv");
        return res.send(csv);
    } catch (err) {
        next(err);
    }
}

module.exports = { createRun, listRuns, getRunById, updateRun, deleteRun, exportCsv };
