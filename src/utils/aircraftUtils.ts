// src/utils/aircraftUtils.ts
import type { ExtendedMarker } from '../aircraftType';

export const addTrackById = (trackedIds: string[], idOrCallsign: string) => {
    if (!trackedIds.includes(idOrCallsign)) {
        trackedIds.push(idOrCallsign);
    }
};

export const removeTrackById = (
    markers: ExtendedMarker[],
    trackedIds: string[],
    id: string
) => {
    const markerObj = markers.find(m => m.id === id);
    if (!markerObj) { return; }

    // Remove do array
    const newMarkers = markers.filter(m => m.id !== id);
    const newTrackedIds = trackedIds.filter(tid => tid !== id && tid !== markerObj.aircraft.callsign);

    return { newMarkers, newTrackedIds };
};
