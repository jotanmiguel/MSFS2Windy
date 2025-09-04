export interface Aircraft {
    altitude_agl: number;
    ground_altitude: number;
    ground_speed: number;
    heading: number;
    indicated_altitude: number;
    indicated_speed: number;
    position: [number, number];
    sea_level_pressure: number;
    true_airspeed: number;
    vertical_speed: number;
    track: [number, number][];
    callsign?: string;
    source: "local" | "vatsim";
}

export interface VatsimPilot {
    cid: number;                // VATSIM ID
    name: string;               // Pilot name
    callsign: string;           // Aircraft callsign
    server: string;             // Server where connected
    pilot_rating: number;       // Rating

    flight_plan?: {
        flight_rules: string;     // IFR/VFR
        aircraft: string;         // ICAO code
        departure: string;        // ICAO departure
        arrival: string;          // ICAO arrival
        alternate: string;        // ICAO alternate
        remarks: string;
        route: string;
    };

    latitude: number;
    longitude: number;
    altitude: number;           // ft MSL
    groundspeed: number;        // kts
    heading: number;            // degrees
    qnh_mb: number;             // sea level pressure
    transponder: string;        // squawk code
    facility: number;           // facility rating
    visual_range: number;       // nm
}

export interface DisplayedVatsimAircraft extends VatsimPilot {
    color: string;
    marker: L.Marker;   // Leaflet marker
    latestPosition: [number, number];
}

export interface DisplayedAircraft extends Aircraft {
    // We attach color later
    color: string;
}

export interface ExtendedMarker {
    id: string;
    marker: L.Marker;
    aircraft: NormalizedAircraft;
    latestPosition: [number, number];
}

export interface NormalizedAircraft {
    id: string; // pode ser vatsim_id ou "local"
    source: "local" | "vatsim";
    callsign?: string;

    position: [number, number];
    heading: number;
    ground_speed: number;
    true_airspeed?: number;
    vertical_speed?: number;
    altitude: number;   // altitude MSL
    indicated_altitude?: number;
    ground_altitude?: number;
    color?: string;
}

export function fromLocalAircraft(local: Aircraft): NormalizedAircraft {
    return {
        id: "local",
        source: "local",
        callsign: local.callsign,
        position: local.position,
        heading: local.heading,
        ground_speed: local.ground_speed,
        true_airspeed: local.true_airspeed,
        vertical_speed: local.vertical_speed,
        altitude: local.indicated_altitude,
        indicated_altitude: local.indicated_altitude,
        ground_altitude: local.ground_altitude,
        color: "blue",
    };
}

export function fromVatsimPilot(p: VatsimPilot): NormalizedAircraft {
    return {
        id: String(p.cid),
        source: "vatsim",
        callsign: p.callsign,
        position: [p.latitude, p.longitude],
        heading: p.heading,
        ground_speed: p.groundspeed,
        true_airspeed: undefined, // não vem direto da API
        vertical_speed: undefined,
        altitude: p.altitude,
        indicated_altitude: p.altitude,
        ground_altitude: undefined,
        color: "green",
    };
}