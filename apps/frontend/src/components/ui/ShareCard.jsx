import { useRef, useCallback } from "react";
import { formatPace, formatDuration } from "../../utils/format";

function drawCard(canvas, data) {
    const ctx = canvas.getContext("2d");
    const W = 600;
    const H = 340;
    canvas.width = W;
    canvas.height = H;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#0f172a");
    grad.addColorStop(1, "#1e3a5f");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Accent bar
    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(0, 0, 6, H);

    // App name
    ctx.fillStyle = "#94a3b8";
    ctx.font = "600 13px system-ui, sans-serif";
    ctx.fillText("RunTracker", 30, 36);

    // Title
    ctx.fillStyle = "#f1f5f9";
    ctx.font = "700 22px system-ui, sans-serif";
    ctx.fillText(data.title, 30, 72);

    // Date
    if (data.date) {
        ctx.fillStyle = "#64748b";
        ctx.font = "400 14px system-ui, sans-serif";
        ctx.fillText(data.date, 30, 98);
    }

    // Stats grid
    const stats = data.stats.filter(Boolean);
    const colW = (W - 60) / Math.min(stats.length, 3);
    let y = 140;

    stats.forEach((stat, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 30 + col * colW;
        const yOff = y + row * 80;

        ctx.fillStyle = "#94a3b8";
        ctx.font = "500 12px system-ui, sans-serif";
        ctx.fillText(stat.label.toUpperCase(), x, yOff);

        ctx.fillStyle = "#f8fafc";
        ctx.font = "700 28px system-ui, sans-serif";
        ctx.fillText(stat.value, x, yOff + 32);
    });

    // Footer
    ctx.fillStyle = "#475569";
    ctx.font = "400 11px system-ui, sans-serif";
    ctx.fillText("runtracker.app", 30, H - 20);

    // Running emoji
    ctx.font = "32px serif";
    ctx.fillText("\uD83C\uDFC3", W - 60, H - 16);
}

export function useShareCard() {
    const canvasRef = useRef(null);

    const shareRun = useCallback(async (run) => {
        const canvas = canvasRef.current || document.createElement("canvas");
        canvasRef.current = canvas;

        const distKm = Number(run.distanceKm);
        const durSec = Number(run.durationSec);

        drawCard(canvas, {
            title: `${distKm.toFixed(1)} km - ${run.type || "Corsa"}`,
            date: run.date ? new Date(run.date).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" }) : "",
            stats: [
                { label: "Distanza", value: `${distKm.toFixed(1)} km` },
                { label: "Durata", value: formatDuration(durSec, { showSeconds: true }) },
                { label: "Passo", value: formatPace(distKm, durSec) },
                run.rpe ? { label: "RPE", value: String(run.rpe) } : null,
            ],
        });

        await shareOrDownload(canvas, `corsa-${distKm.toFixed(1)}km`);
    }, []);

    const sharePB = useCallback(async (label, run) => {
        const canvas = canvasRef.current || document.createElement("canvas");
        canvasRef.current = canvas;

        const distKm = Number(run.distanceKm);
        const durSec = Number(run.durationSec);

        drawCard(canvas, {
            title: `Personal Best: ${label}`,
            date: run.date ? new Date(run.date).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" }) : "",
            stats: [
                { label: "Distanza", value: `${distKm.toFixed(1)} km` },
                { label: "Durata", value: formatDuration(durSec, { showSeconds: true }) },
                { label: "Passo", value: formatPace(distKm, durSec) },
            ],
        });

        await shareOrDownload(canvas, `pb-${label.replace(/\s+/g, "-")}`);
    }, []);

    return { shareRun, sharePB };
}

async function shareOrDownload(canvas, filename) {
    try {
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
        const file = new File([blob], `${filename}.png`, { type: "image/png" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: "La mia corsa" });
            return;
        }
    } catch {
        // fallback to download
    }

    // Download fallback
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.png`;
    a.click();
}

export default function ShareButton({ onClick, className = "" }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-slate-800 transition-colors ${className}`}
            title="Condividi"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
            </svg>
            Condividi
        </button>
    );
}
