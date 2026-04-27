# Phase A — receiver bring-up + BLE feasibility

**Goal:** validate that BLE actually reaches through the (possibly low-E) windows from the receiver's intended location, before committing to 15 sensor nodes.

## Steps

1. **Flash the receiver via USB.**
   ```sh
   cd esphome
   cp secrets.yaml.example secrets.yaml   # fill in WiFi + generate api_key, ota_password
   esphome run receiver.yaml
   ```
   Confirm WiFi join (logs show IP) and that the web server is reachable on `http://plant-receiver.local/`.

2. **OTA round-trip.** Make a trivial change to `receiver.yaml` (e.g. log level → DEBUG) and push:
   ```sh
   esphome run receiver.yaml --device plant-receiver.local
   ```
   No USB cable from now on. If OTA fails, fix it before moving on — the rest of the project relies on it.

3. **Power up the Mi Flora.** Pop the cell. Confirm BLE advertisements with any phone scanner; note the MAC.

4. **Add Mi Flora to receiver config.** Set `miflora_mac` in `secrets.yaml`, uncomment the `xiaomi_hhccjcy01` and `ble_rssi` blocks in `receiver.yaml`, OTA-push.

5. **Place receiver where the real one will live.** Behind the same window/wall you'd use in production.

6. **Place Mi Flora at the worst-case pot.** Far end of the balcony, behind anything that'd attenuate.

7. **Observe RSSI for 24 h.** ESPHome web server (`/`) shows live values; or scrape via the API.
   - **RSSI ≥ −80 dBm consistently** → good. Phase B will work.
   - **RSSI −80 to −90 dBm with gaps** → marginal. Try the C3 SuperMini Plus + external antenna once it arrives.
   - **No reception** → low-E glass is killing it. Move the receiver to the windowsill or to the balcony itself (weatherproof enclosure).

## Exit criteria

- Receiver online, OTA working, recoverable from a bad config without a USB cable (i.e. fallback AP works).
- Mi Flora visible from the receiver's intended location with usable RSSI.
- Decision recorded: stay with WROOM-32 indoors / switch to C3 + external antenna / move receiver onto the balcony.
