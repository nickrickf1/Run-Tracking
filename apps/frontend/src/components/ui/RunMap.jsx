import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function RunMap({ points }) {
    const mapRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!points || points.length < 2 || !containerRef.current) return;

        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }

        const map = L.map(containerRef.current, {
            scrollWheelZoom: false,
            attributionControl: false,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 18,
        }).addTo(map);

        const latlngs = points.map(([lat, lon]) => [lat, lon]);
        const polyline = L.polyline(latlngs, { color: "#3b82f6", weight: 3 }).addTo(map);
        map.fitBounds(polyline.getBounds(), { padding: [20, 20] });

        // Start/end markers
        L.circleMarker(latlngs[0], { radius: 6, color: "#16a34a", fillColor: "#16a34a", fillOpacity: 1 })
            .bindTooltip("Partenza")
            .addTo(map);
        L.circleMarker(latlngs[latlngs.length - 1], { radius: 6, color: "#dc2626", fillColor: "#dc2626", fillOpacity: 1 })
            .bindTooltip("Arrivo")
            .addTo(map);

        mapRef.current = map;

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [points]);

    if (!points || points.length < 2) return null;

    return (
        <div
            ref={containerRef}
            className="h-64 w-full rounded-xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700"
        />
    );
}
