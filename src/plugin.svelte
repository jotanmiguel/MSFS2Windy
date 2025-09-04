{#if isMobileOrTablet}
{:else if showList}
    <aside class="aircraft-list" 
            bind:this={trackListRef}
            on:mousedown={startDrag}
        >
        <button class="close" on:click={() => showList = false}>✖</button>
        <h3>Tracked Aircraft</h3>

        <div class="local-flight-status">
            {#if localMarker}
                <div class="aircraft-item">
                    <b>Simulator Flight Active</b><br>
                    {localMarker.aircraft.callsign ?? "You"} <br>
                    Alt: {localMarker.aircraft.altitude.toFixed(0)} ft <br>
                    GS: {localMarker.aircraft.ground_speed.toFixed(0)} kt
                </div>
            {:else}
                <div class="aircraft-item">No active simulator flight</div>
            {/if}
        </div>

        {#if markers.length === 0}
            <div class="aircraft-item">No aircraft tracked</div>
            <div class="add-track">
                <input bind:value={newTrack} placeholder="Enter VATSIM ID or Callsign" />
                <button on:click={() => { addTrackById(newTrack); newTrack = ''; }}>
                    Track Flight
                </button>
            </div>
        {/if}

        {#each markers as m}
            <div
                class="aircraft-item {selectedMarkerId === m.id ? 'selected' : ''}"
                on:mouseenter={() => highlightedMarkerId = m.id}
                on:mouseleave={() => highlightedMarkerId = null}
                on:click={() => { selectedMarkerId = m.id; displayPopup(m); }}
                >
                    <div class="info">
                        {m.aircraft.callsign ?? "You"} ({m.aircraft.source})
                        <div class="stats">
                            HDG: {m.aircraft.heading.toFixed(0)}° <br>
                            GS: {m.aircraft.ground_speed.toFixed(0)} kt <br>
                            Alt: {m.aircraft.altitude.toFixed(0)} ft
                        </div>
                    </div>

                    <div class="actions">
                        <button
                            class="icon-btn {followedMarkerId === m.id ? 'selected' : ''}"
                            on:click={(e) => { e.stopPropagation(); toggleFollow(m.id); }}
                            title="Follow"
                        >
                            {@html followIcon.options.html}
                        </button>
                        <button
                            class="icon-btn"
                            on:click={(e) => { e.stopPropagation(); removeTrack(m.id); }}
                            title="Delete"
                        >
                            {@html deleteIcon.options.html}
                        </button>
                    </div>
                </div>
        {/each}
    </aside>
{/if}


<script lang="ts">
    import { map } from '@windy/map';
    import { isMobileOrTablet } from '@windy/rootScope';
    import store from '@windy/store';
    import { aircraftIcon } from './aircraftIcon';
    import { deleteIcon } from './deleteIcon';
    import { followIcon } from './followIcon';
    import { onMount, onDestroy } from 'svelte';

    import type { Aircraft, VatsimPilot } from './aircraftType';
    import type { ExtendedMarker } from './aircraftType';
    import { fromLocalAircraft, fromVatsimPilot } from './aircraftType';

    let markers: ExtendedMarker[] = [];
    const traces: { 
        [id: string]: { polyline: L.Polyline, history: L.LatLng[] } 
    } = {};
    let followedTrace: L.Polyline | null = null;
    let followedHistory: L.LatLng[] = [];

    let openedPopup: L.Popup | null = null;

    let rotateIcons = true;

    let newTrack = '';

    /** roda o ícone conforme heading */
    const updateIconStyles = () => {
        if (!rotateIcons) return;
        for (const { marker, aircraft } of markers) {
            if (marker._icon) {
                marker._icon.style.transformOrigin = '12px 12px';
                const heading = aircraft.heading || 0;
                if (marker._icon.style.transform.indexOf('rotateZ') === -1) {
                    marker._icon.style.transform = `${marker._icon.style.transform} rotateZ(${heading}deg)`;
                }
            }
        }
    };

    const updateFollowed = () => {
        if (!selectedMarkerId) return;
        const followed = markers.find(m => m.id === selectedMarkerId);
        if (followed) {
            map.setView(followed.latestPosition, map.getZoom());

            // Atualiza popup se estiver aberto
            if (openedPopup) {
                openedPopup.setLatLng(followed.latestPosition);
            }
        }
    };

// Handlers
    const toggleFollow = (id: string) => {
        if (followedMarkerId === id) {
            followedMarkerId = null;
        } else {
            followedMarkerId = id;
            selectedMarkerId = id; // garante que mostra trail também
            const followed = markers.find(x => x.id === id);
            if (followed) map.setView(followed.latestPosition, map.getZoom());
        }
    };


    const displayPopup = (m: ExtendedMarker) => {
        highlightedMarkerId = m.id; // destaca na lista
        selectedMarkerId = m.id;    // seleciona também (para mostrar trilha)

        const ac = m.aircraft;
        const [lat, lon] = m.latestPosition;

        let nameHtml = ac.callsign ?? "You";
        if (ac.source === "vatsim") {
            nameHtml = `<a href="https://vatsim-radar.com/?pilot=${ac.callsign}" target="_blank">${ac.callsign}</a>`;
        }

        let html = `
            <b>${nameHtml}</b><br />
            ${ac.source}<br /><br />
            Alt: ${ac.altitude.toFixed(0)} ft<br>
            GS: ${ac.ground_speed.toFixed(0)} kt<br>
            HDG: ${ac.heading.toFixed(0)}°<br>
        `;

        openedPopup?.remove();
        openedPopup = new L.Popup({ autoClose: false, closeOnClick: false })
            .setLatLng([lat, lon])
            .setContent(html)
            .openOn(map);
    };



    let localMarker: ExtendedMarker | null = null;
    let selectedMarkerId: string | null = null;
    let highlightedMarkerId: string | null = null; // hover
    let followedMarkerId: string | null = null;    // follow ativo


    const loadLocal = async () => {
        try {
            const localRaw: Aircraft = await fetch('https://desktop-joao:8965/api/sim/info')
                .then(r => r.json());
            const local = fromLocalAircraft(localRaw);

            const pos = local.position;
            if (!localMarker) {
                const m = new L.Marker(pos, { icon: aircraftIcon }).addTo(map);
                localMarker = { id: local.id, marker: m, latestPosition: pos, aircraft: local };
                markers.push(localMarker);
            } else {
                localMarker.latestPosition = pos;
                localMarker.aircraft = local;
                localMarker.marker.setLatLng(pos);
            }

            updateIconStyles();
            updateFollowed(); 

        } catch (err) {
            console.warn("Local aircraft fetch failed:", err);
        }
    };

    let trackedIds: string[] = []; // começa vazio

    const addTrackById = (idOrCallsign: string) => {
        if (!trackedIds.includes(idOrCallsign)) {
            trackedIds.push(idOrCallsign);
        }
    };

    const loadVatsim = async () => {
        try {
            const vatsimRaw = await fetch('https://data.vatsim.net/v3/vatsim-data.json')
                .then(r => r.json());
            
            vatsimRaw.pilots.forEach((p: VatsimPilot) => {
                if (trackedIds.includes(String(p.cid)) || trackedIds.includes(p.callsign)) {
                    const ac = fromVatsimPilot(p);
                    const pos = ac.position;
                    let markerObj = markers.find(m => m.id === ac.id);
                    if (!markerObj) {
                        const m = new L.Marker(pos, { icon: aircraftIcon }).addTo(map);
                        markerObj = { id: ac.id, marker: m, latestPosition: pos, aircraft: ac };
                        markers.push(markerObj);
                        markers = [...markers];
                    } else {
                        markerObj.latestPosition = pos;
                        markerObj.aircraft = ac;
                        markerObj.marker.setLatLng(pos);
                    }
                }
            });

            updateIconStyles();
            updateFollowed();
        } catch (err) {
            console.warn("VATSIM fetch failed:", err);
        }
    };

    const goToAircraft = (m: ExtendedMarker) => {
        displayPopup(m);
        map.setView(m.latestPosition, map.getZoom()); // mantém zoom atual
    };

    const drawTrace = () => {
        markers.forEach(m => {
            const pos = L.latLng(m.latestPosition[0], m.latestPosition[1]);

            if (!traces[m.id]) {
                traces[m.id] = {
                    polyline: L.polyline([], { color: m.aircraft.color || 'orange', weight: 2 }),
                    history: []
                };
            }

            traces[m.id].history.push(pos);

            // Se é seguido → desenha com destaque
            if (followedMarkerId === m.id) {
                traces[m.id].polyline.setStyle({ color: 'lime', weight: 3 });
                traces[m.id].polyline.setLatLngs(traces[m.id].history);
                if (!map.hasLayer(traces[m.id].polyline)) map.addLayer(traces[m.id].polyline);
            }
            // Se está só selecionado → mostra trail normal
            else if (selectedMarkerId === m.id) {
                traces[m.id].polyline.setStyle({ color: m.aircraft.color || 'orange', weight: 2 });
                traces[m.id].polyline.setLatLngs(traces[m.id].history);
                if (!map.hasLayer(traces[m.id].polyline)) map.addLayer(traces[m.id].polyline);
            }
            // Se está só em hover → mostra trace clarinho
            else if (highlightedMarkerId === m.id) {
                traces[m.id].polyline.setStyle({ color: 'yellow', dashArray: '4 4', weight: 2 });
                traces[m.id].polyline.setLatLngs(traces[m.id].history);
                if (!map.hasLayer(traces[m.id].polyline)) map.addLayer(traces[m.id].polyline);
            }
            else {
                if (map.hasLayer(traces[m.id].polyline)) map.removeLayer(traces[m.id].polyline);
            }
        });
    };


    const removeAllMapFeatures = () => {
        // Remove popup aberto
        openedPopup?.remove();

        // Remove todos os marcadores do mapa
        markers.forEach(m => map.removeLayer(m.marker));

        // Remove todas as trilhas do mapa
        Object.values(traces).forEach(t => {
            if (map.hasLayer(t.polyline)) map.removeLayer(t.polyline);
        });

        // Limpa arrays/objetos
        markers = [];
        followedTrace = null;
        followedHistory = [];
        for (const id in traces) delete traces[id];
    };

    const removeTrack = (id: string) => {
        const markerObj = markers.find(m => m.id === id);
        if (!markerObj) return;

        // Remove do mapa
        map.removeLayer(markerObj.marker);
        if (traces[id]?.polyline) map.removeLayer(traces[id].polyline);

        // Remove do array/objeto
        markers = markers.filter(m => m.id !== id);
        delete traces[id];

        // Também remove da lista de trackedIds
        trackedIds = trackedIds.filter(tid => tid !== id && tid !== markerObj.aircraft.callsign);

        // Se estava selecionado ou seguido, limpa
        if (selectedMarkerId === id) {
            selectedMarkerId = null;
        }
        if (followedMarkerId === id) {
            followedMarkerId = null;
        }
    };

    let trackListRef: HTMLDivElement;
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };
    let showList = true;

    function startDrag(e: MouseEvent) {
        isDragging = true;
        dragOffset.x = e.clientX - trackListRef.offsetLeft;
        dragOffset.y = e.clientY - trackListRef.offsetTop;

        window.addEventListener('mousemove', dragMove);
        window.addEventListener('mouseup', stopDrag);
    }

    function dragMove(e: MouseEvent) {
        if (!isDragging) return;
        trackListRef.style.left = `${e.clientX - dragOffset.x}px`;
        trackListRef.style.top = `${e.clientY - dragOffset.y}px`;
    }

    function stopDrag() {
        isDragging = false;
        window.removeEventListener('mousemove', dragMove);
        window.removeEventListener('mouseup', stopDrag);
    }

    export const onopen = () => {
        map.setView([14, -29], 4);
        store.set('overlay', 'wind');

        loadLocal();
        loadVatsim();

        setInterval(() => {
            drawTrace();
            updateFollowed();
        }, 1000);
        setInterval(loadLocal, 1000);  // refresh local 1s
        setInterval(loadVatsim, 20000); // refresh vatsim 5s

        showList = true;
    };

    onMount(() => {
        map.on('zoom', updateIconStyles);
        map.on('zoomend', updateIconStyles);
        map.on('viewreset', updateIconStyles);
    });

    onDestroy(() => {
        removeAllMapFeatures();
        map.off('zoom', updateIconStyles);
        map.off('zoomend', updateIconStyles);
        map.off('viewreset', updateIconStyles);
    });
</script>

<style lang="less">
    .aircraft-list .close {
        position: absolute;
        top: 5px;
        right: 5px;
        cursor: pointer;
        background: transparent;
        border: none;
        color: white;
        font-size: 1.2rem;
    }

    .aircraft-item.selected {
        background: rgba(255,165,0,0.3);
        border-left: 3px solid orange;
    }

    .aircraft-list {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 220px;
        max-height: 80vh;
        overflow-y: auto;
        background: rgba(0,0,0,0.7);
        padding: 10px;
        border-radius: 8px;
        color: white;
        font-size: 0.9rem;
        z-index: 1000;
    }

    .aircraft-item {
        display: flex;
        align-items: center;
        padding: 5px;
        margin-bottom: 5px;
        border-bottom: 1px solid rgba(255,255,255,0.2);
    }

    .aircraft-item:hover {
        background: rgba(255,255,255,0.1);
    }

    .color-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        margin-right: 8px;
    }

    .info {
        flex: 1;
    }

    .stats {
        font-size: 0.8rem;
        color: #ccc;
    }

    button.selected {
        background: orange;
        color: black;
    }

    .aircraft-item {
        position: relative; // necessário para posicionamento absoluto
        padding: 10px;
        border-bottom: 1px solid rgba(255,255,255,0.2);
    }

    .aircraft-item .actions {
        position: absolute;
        top: 5px;
        right: 5px;
        display: flex;
        gap: 5px;
    }

    .aircraft-item .actions img {
        width: 20px;
        height: 20px;
        cursor: pointer;
    }

    button.selected,
    img.selected {
        filter: invert(50%) sepia(100%) saturate(500%) hue-rotate(35deg);
    }

    .aircraft-item {
        position: relative;
        padding: 10px;
        border-bottom: 1px solid rgba(255,255,255,0.2);
    }

    .actions {
        position: absolute;
        bottom: 5px;   /* antes era top */
        right: 5px;
        display: flex;
        gap: 6px;
    }

    .icon-btn {
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 4px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .icon-btn svg {
        width: 20px;
        height: 20px;
        fill: white;
    }
    .icon-btn:hover svg {
        fill: orange;
    }
</style>
