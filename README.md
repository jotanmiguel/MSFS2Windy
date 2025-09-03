# ✈️ Windy Aircraft Tracker Plugin

A plugin for [Windy](https://www.windy.com/) that allows visualization of **real-time aircraft** from multiple data sources:  
- **Local** (e.g., [LittleNavMap](https://albar965.github.io/littlenavmap.html) webserver)  
- **VATSIM** (Virtual Air Traffic Simulation network)  

---

## 🚀 Current Features
- **Interactive Map (Leaflet):**
  - Aircraft rendered on the map with custom icons.  
  - Automatic refresh (Local: 1s / VATSIM: 5s).  
  - Automatic zoom to the selected aircraft.  
- **Aircraft Management:**
  - Side panel listing “tracked” aircraft (clickable).  
  - Ability to follow/track an aircraft.  
  - Popup displaying aircraft information.  
- **Trails (flight history):**
  - Flight paths are stored for all tracked aircraft.  
  - Trails are displayed only when the aircraft is selected or tracked.  
- **Custom icons:**
  - Action icons (delete, follow, share) implemented with `L.divIcon`.  

---

## ⚙️ Technical Overview
- **Frontend:** Windy Plugin (JS/TS + Leaflet).  
- **Data Sources:**
  - Local (LittleNavMap webserver).  
  - VATSIM API.  
- **CI/CD (in progress):**
  - GitHub Actions workflow for **build + publish** to Windy.  
  - `plugin.json` metadata extended with repo info (`jq`).  
  - Next step: split workflows into **checker** (lint, build, tests) and **release** (version bump + publish).  

---

## 🛠️ Roadmap
- [ ] Add a **Settings page** (likely via `RHPane`) to configure the local data source URL.  
- [ ] Refactor codebase to reduce repetition (split into modules: frontend, data fetchers, map rendering).  
- [ ] Implement **automated tests**:
  - Data parsing.  
  - Refresh rate handler.  
  - Tracked aircraft list management.  
- [ ] Finalize CI/CD pipeline:
  - Checker workflow (lint + build + tests).  
  - Release workflow (auto bump version + publish).  

---

## 📌 Current Status

- **MVP functional:** aircraft already shown on the map (Local + VATSIM).  
- **Basic UI:** side panel for tracked aircraft and custom icons in place.  
- **CI/CD WIP:** automatic upload is working, versioning integration is next.
- **New UI (WIP):** working on refining the ui.
- **simconnect and fsuipc integration:** give the user multiple ways to connect the sim to windy (simconnect or fsuipc vs littlenavmap local webserver). 
