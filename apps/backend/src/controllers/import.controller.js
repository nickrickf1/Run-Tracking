const prisma = require("../lib/prisma");
const { XMLParser } = require("fast-xml-parser");

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
});

function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function parseGpx(buffer) {
    const xml = buffer.toString("utf-8");
    const parsed = parser.parse(xml);

    const gpx = parsed.gpx;
    if (!gpx) throw new Error("Formato GPX non valido");

    // Support both single and multiple tracks
    let tracks = gpx.trk;
    if (!tracks) throw new Error("Nessuna traccia trovata nel file GPX");
    if (!Array.isArray(tracks)) tracks = [tracks];

    const results = [];

    for (const trk of tracks) {
        let segments = trk.trkseg;
        if (!segments) continue;
        if (!Array.isArray(segments)) segments = [segments];

        const points = [];
        for (const seg of segments) {
            let pts = seg.trkpt;
            if (!pts) continue;
            if (!Array.isArray(pts)) pts = [pts];

            for (const pt of pts) {
                const lat = parseFloat(pt["@_lat"]);
                const lon = parseFloat(pt["@_lon"]);
                const time = pt.time ? new Date(pt.time) : null;
                if (!isNaN(lat) && !isNaN(lon)) {
                    points.push({ lat, lon, time });
                }
            }
        }

        if (points.length < 2) continue;

        // Calculate distance
        let distanceKm = 0;
        for (let i = 1; i < points.length; i++) {
            distanceKm += haversineKm(
                points[i - 1].lat,
                points[i - 1].lon,
                points[i].lat,
                points[i].lon
            );
        }

        // Calculate duration from timestamps
        const firstTime = points.find((p) => p.time)?.time;
        const lastTime = [...points].reverse().find((p) => p.time)?.time;
        const durationSec =
            firstTime && lastTime
                ? Math.round((lastTime.getTime() - firstTime.getTime()) / 1000)
                : 0;

        const date = firstTime || new Date();
        const name = trk.name || null;

        // Sample points for map display (max ~200 points)
        const step = Math.max(1, Math.floor(points.length / 200));
        const sampled = points.filter((_, i) => i % step === 0).map((p) => [p.lat, p.lon]);

        results.push({
            date,
            distanceKm: Math.round(distanceKm * 100) / 100,
            durationSec,
            name,
            gpxData: sampled.length > 1 ? sampled : null,
        });
    }

    return results;
}

async function importGpx(req, res, next) {
    try {
        const userId = req.user.userId;

        if (!req.file) {
            return res.status(400).json({ message: "Nessun file caricato" });
        }

        const tracks = parseGpx(req.file.buffer);

        if (tracks.length === 0) {
            return res.status(400).json({ message: "Nessuna traccia valida trovata nel file GPX" });
        }

        const created = [];
        for (const track of tracks) {
            if (track.distanceKm <= 0 || track.durationSec <= 0) continue;

            const run = await prisma.run.create({
                data: {
                    userId,
                    date: track.date,
                    distanceKm: track.distanceKm,
                    durationSec: track.durationSec,
                    type: "lento",
                    notes: track.name ? `Importato da GPX: ${track.name}` : "Importato da GPX",
                    gpxData: track.gpxData || undefined,
                },
            });
            created.push(run);
        }

        return res.status(201).json({
            message: `${created.length} cors${created.length === 1 ? "a importata" : "e importate"} con successo`,
            runs: created,
        });
    } catch (err) {
        if (err.message?.includes("GPX")) {
            return res.status(400).json({ message: err.message });
        }
        next(err);
    }
}

module.exports = { importGpx };
