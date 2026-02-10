const {PrismaClient} = require('@prisma/client');
const { z } = require('zod');

const dateSchema = z.union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
    z.string().datetime(),
]);
const prisma = new PrismaClient();

const runCreateSchema = z.object({
    date: dateSchema,
    distanceKm: z.number().positive(),
    durationSec: z.number().int().positive(),
    type: z.enum(['lento', 'tempo','variato','lungo','gara','forza']).optional().default('facile'),
    rpe: z.number().int().min(1).max(10).optional(),
    notes: z.string().max(1000).optional(),
});

const runUpdateSchema = z.object({
    date: dateSchema,
    distanceKm: z.number().positive().optional(),
    durationSec: z.number().int().positive().optional(),
    type: z.enum(['lento', 'tempo','variato','lungo','gara','forza']).optional(),
    rpe: z.number().int().min(1).max(10).nullable().optional(),
    notes: z.string().max(1000).nullable().optional(),
})

function toDate(value){
    // supporta "2026-02-10" oppure ISO "2026-02-10T10:00:00.000Z"
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(value + "T00:00:00.000Z");
    return new Date(value);
}

async function createRun(req, res) {
    try{
        const parsed = runCreateSchema.safeParse(req.body);
        if (!parsed.success){
            return res.status(400).json({message: "errore di validazione", errors: parsed.error.errors});
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
            }
        })
        return res.status(201).json({run})
    }catch(err){
        console.error("Errore di creazione attività: ", err);
        return res.status(500).json({ message: "Creazione attivita' fallita ", error: err.message });

    }
}

async function listRuns(req, res) {
    try{
        const userId = req.user.userId;

        const {from , to, type} = req.query;
        const page = Math.max(parseInt(req.query.page || "1", 10),1);
        const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || "10", 10),1),5);

        const where = {userId}

        if (type) where.type = String(type)

        if (from || to) {
            where.date = {};
            if (from) where.date.gte = toDate(String(from));
            if (to) where.date.lte = toDate(String(to));
        }

        const [total, runs] = await Promise.all([
            prisma.run.count({where}),
            prisma.run.findMany({
                where,
                orderBy: {date: "desc"},
                skip: (page-1) * pageSize,
                take: pageSize,
            })
        ])

        return res.json({
            page,
            pageSize,
            total,
            runs,
        })
    }catch (err){
        console.error("Errore di creazione lista attivita'", err);
        return res.status(500).json({ message: "Impossibile creare lista attivita'", error: err.message });
    }
}

async function getRunById(req, res) {
    try{
        const userId = req.user.userId;
        const {id} = req.params;
        const run = await prisma.run.findFirst({
            where:{id,userId}
        });

        if (!run)
            return res.status(404).json({
                message: "Corsa non trovata"
            });

        return res.json({run});
    }catch(err){
        console.error("Errore getRunById", err);
        return res.status(500).json({message: "Impossibile getRunById", error: err.message });
    }
}

async function updateRun(req, res) {
    try {
        const userId = req.user.userId;
        const {id} = req.params;

        const parsed = runUpdateSchema.safeParse(req.body);
        if (!parsed.success){
            return res.status(400).json({message: "Errore di validazione", errors: parsed.error.errors});
        }

        const existing = await prisma.run.findFirst({where:{id, userId}});
        if (!existing) return res.status(404).json({message: "Corsa non trovata"});

        const data = parsed.data();

        const updated = await prisma.run.update({
            where:{id},
            data: {
                ...(data.date ? { date: toDate(data.date) } : {}),
                ...(data.distanceKm !== undefined ? { distanceKm: data.distanceKm } : {}),
                ...(data.durationSec !== undefined ? { durationSec: data.durationSec } : {}),
                ...(data.type !== undefined ? { type: data.type } : {}),
                ...(data.rpe !== undefined ? { rpe: data.rpe } : {}),
                ...(data.notes !== undefined ? { notes: data.notes } : {}),
            },
        });
        return res.json({run: updated})
    }catch (err){
        console.error("Errore di aggiornamento attivita'", err);
        return res.status(500).json({message: "aggiornamento corsa fallito", error: err.message });
    }
}

async function deleteRun(req, res) {
    try{
        const userId = req.user.userId;
        const {id} = req.params;

        const existing = await prisma.run.findFirst({where:{id,userId}});

        if (!existing) return res.status(404).json({message: "Corsa non trovata"});

        await prisma.run.delete({where:{id}});
    }catch (err){
        console.error("Errore di eliminazione attivita'", err);
        return res.status(500).json({message:"Eliminazione corsa fallita", error: err.message });
    }
}

module.exports = {createRun,listRuns,getRunById,updateRun,deleteRun};
