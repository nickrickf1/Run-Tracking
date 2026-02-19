import { formatPace, formatDuration, formatDate } from "../utils/format";

export async function generateMonthlyPdf(runs, summary, monthLabel) {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text(`Report Mensile - ${monthLabel}`, 14, 20);

    // Summary stats
    doc.setFontSize(11);
    doc.setTextColor(100);
    let y = 35;
    doc.text(`Corse: ${summary.totalRuns}`, 14, y);
    doc.text(`Distanza: ${summary.totalDistanceKm.toFixed(1)} km`, 80, y);
    y += 7;
    doc.text(`Tempo: ${formatDuration(summary.totalDurationSec)}`, 14, y);
    doc.text(`Passo medio: ${formatPace(summary.totalDistanceKm, summary.totalDurationSec)}`, 80, y);

    // Table header
    y += 15;
    doc.setFontSize(9);
    doc.setTextColor(60);
    doc.setFont(undefined, "bold");
    const cols = [14, 40, 65, 90, 120, 145];
    doc.text("Data", cols[0], y);
    doc.text("Distanza", cols[1], y);
    doc.text("Durata", cols[2], y);
    doc.text("Passo", cols[3], y);
    doc.text("Tipo", cols[4], y);
    doc.text("RPE", cols[5], y);

    doc.setDrawColor(200);
    y += 2;
    doc.line(14, y, 196, y);
    y += 5;

    // Rows
    doc.setFont(undefined, "normal");
    doc.setTextColor(40);
    for (const r of runs) {
        if (y > 275) {
            doc.addPage();
            y = 20;
        }
        const km = Number(r.distanceKm);
        doc.text(formatDate(r.date), cols[0], y);
        doc.text(`${km.toFixed(1)} km`, cols[1], y);
        doc.text(formatDuration(r.durationSec, { showSeconds: true }), cols[2], y);
        doc.text(formatPace(km, r.durationSec), cols[3], y);
        doc.text(r.type, cols[4], y);
        doc.text(r.rpe != null ? String(r.rpe) : "-", cols[5], y);
        y += 6;
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Generato da Run Tracker", 14, 290);

    doc.save(`report-${monthLabel.replace(/\s+/g, "-").toLowerCase()}.pdf`);
}
