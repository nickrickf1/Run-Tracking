const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];
    if (!email) {
        console.log("Uso: node scripts/make-admin.js email@esempio.com");
        process.exit(1);
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        console.log(`Utente con email "${email}" non trovato`);
        process.exit(1);
    }

    if (user.role === "admin") {
        console.log(`${user.name} (${user.email}) è già admin`);
        process.exit(0);
    }

    await prisma.user.update({
        where: { email },
        data: { role: "admin" },
    });

    console.log(`${user.name} (${user.email}) è ora admin`);
}

main()
    .catch((err) => {
        console.error(err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
