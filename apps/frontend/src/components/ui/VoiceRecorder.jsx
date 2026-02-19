import { useState, useRef } from "react";

export default function VoiceRecorder({ token, runId, audioUrl, apiBase, onAudioChange }) {
    const [recording, setRecording] = useState(false);
    const [uploading, setUploading] = useState(false);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    async function startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                stream.getTracks().forEach((t) => t.stop());
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                await uploadAudio(blob);
            };

            mediaRecorder.start();
            setRecording(true);
        } catch {
            // permission denied or not supported
        }
    }

    function stopRecording() {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }
        setRecording(false);
    }

    async function uploadAudio(blob) {
        setUploading(true);
        try {
            const form = new FormData();
            form.append("audio", blob, "voice-note.webm");

            const base = apiBase || import.meta.env.VITE_API_URL || "http://localhost:3000";
            const res = await fetch(`${base}/runs/${runId}/audio`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: form,
            });

            if (!res.ok) throw new Error("Upload fallito");
            const data = await res.json();
            if (onAudioChange) onAudioChange(data.run.audioUrl);
        } catch {
            // upload failed
        } finally {
            setUploading(false);
        }
    }

    async function deleteAudio() {
        setUploading(true);
        try {
            const base = apiBase || import.meta.env.VITE_API_URL || "http://localhost:3000";
            const res = await fetch(`${base}/runs/${runId}/audio`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Eliminazione fallita");
            if (onAudioChange) onAudioChange(null);
        } catch {
            // delete failed
        } finally {
            setUploading(false);
        }
    }

    const btnCls = "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors";

    return (
        <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nota vocale</label>

            {audioUrl && (
                <div className="flex items-center gap-2">
                    <audio
                        controls
                        src={`${apiBase || import.meta.env.VITE_API_URL || "http://localhost:3000"}${audioUrl}`}
                        className="h-8 flex-1"
                    />
                    <button
                        type="button"
                        onClick={deleteAudio}
                        disabled={uploading}
                        className={`${btnCls} text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-slate-800`}
                    >
                        Elimina
                    </button>
                </div>
            )}

            <div className="flex gap-2">
                {recording ? (
                    <button
                        type="button"
                        onClick={stopRecording}
                        className={`${btnCls} bg-red-600 text-white hover:bg-red-700`}
                    >
                        <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
                        Ferma registrazione
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={startRecording}
                        disabled={uploading}
                        className={`${btnCls} bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                        </svg>
                        {uploading ? "Caricamento..." : "Registra nota vocale"}
                    </button>
                )}
            </div>
        </div>
    );
}
