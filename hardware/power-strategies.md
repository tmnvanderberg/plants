# Power strategies — battery node

The current design (`README.md` → Power management) wakes each node every
~1 hour, opens a full WiFi+MQTT session, publishes one reading, and
deep-sleeps. WiFi association dominates radio-on time (~2–5 s out of a
~3–6 s wake), and that's where most of the battery goes.

This document captures two alternative transport/wake models we may
explore if 12-month battery life proves insufficient. Neither is
implemented today. They are not mutually exclusive.

## Baseline (current design)

| | |
|---|---|
| Wake interval | ~1 hour |
| Wake duration | ~3–6 s |
| Radio-on time | ~2–5 s (association + TX) |
| Transport | WiFi → MQTT |
| OTA window | every wake |

## Option A — ESP-NOW to the receiver

Replace WiFi+MQTT on battery nodes with ESP-NOW, an Espressif peer-to-peer
protocol over the WiFi radio that skips the IP stack entirely. Battery
nodes never associate with the AP. They wake, send one packet to
`plant-receiver` by MAC, and sleep. The mains-powered receiver gateways
ESP-NOW packets into MQTT.

| | |
|---|---|
| Wake interval | unchanged (~1 hour) |
| Wake duration | ~300–500 ms (sensor settling dominates) |
| Radio-on time | ~10–50 ms (TX + ack) |
| Transport | ESP-NOW → receiver → MQTT |
| OTA path | separate periodic WiFi wake |

Expected gain: radio-on time per wake drops ~50–100×. Sensor settling
becomes the next bottleneck — moisture and BH1750 each need
~100–200 ms.

### Constraints

- **Same WiFi channel.** Sender and receiver must be on the same channel.
  Easiest fix: lock the AP to a fixed channel.
- **Not in ESPHome core.** Requires a community external component
  (e.g. `esphome-esp-now`). Bumps the "stock components only" rule in
  `CLAUDE.md` — document the rationale inline if adopted.
- **OTA still needs WiFi.** ESP-NOW does not support OTA. Strategies:
  an extra "OTA wake" every Nth cycle (e.g. once a day) that does a full
  WiFi association, or a flag in the receiver's ESP-NOW ack instructing
  the node to associate to WiFi this cycle.
- **Encryption is opt-in.** ESP-NOW supports CCMP with a 16-byte shared
  key. Probably not needed inside a home network, but available.
- **Receiver becomes a gateway.** Add an ESP-NOW → MQTT bridge on
  `plant-receiver` (lambda + stock MQTT publish).

## Option B — Local buffering, daily upload

Sample on the current schedule but don't transmit each reading. Store
readings in RTC slow memory across deep-sleep cycles; once per day, wake
WiFi, drain the buffer to MQTT in one batch, sleep.

| | |
|---|---|
| Sensor wake interval | ~1 hour |
| Sensor wake duration | ~200–400 ms (sensor read + RTC write, no radio) |
| Upload interval | once per 24 h |
| Upload duration | ~3–6 s (one WiFi session) |
| Transport | WiFi → MQTT, batched payload |
| OTA window | once per day |

Expected gain: radio-on time amortised across 24 readings → ~24×
reduction in transport cost. Total battery life depends on the new
sensor-wake / radio-wake ratio.

### Constraints

- **Custom C++ required.** ESPHome has no stock buffered-readings
  component. Implementation is a `globals` array in RTC slow memory
  plus lambdas for write/drain. Bumps "stock only" — document inline.
- **OTA risk.** A bad firmware push only gets one recovery window per
  day. On a battery node the fallback is a USB cable. `CLAUDE.md`
  already flags this for any deep-sleep + OTA design.
- **RTC memory budget.** ESP32-C3 has ~16 KB of slow RTC RAM. 24
  readings × ~16 bytes (timestamp + moisture + light + battery) is well
  under budget, but plan the schema.
- **No real-time monitoring.** A dying plant is invisible until
  tomorrow's upload. Mitigate with thresholds: if any reading crosses a
  critical band, force an immediate WiFi upload that wake.
- **Time sync.** Each buffered reading needs a timestamp. Either store
  `millis()` since boot and reconstruct on the backend, or NTP-sync at
  upload and timestamp future readings going forward.

## Combining

Nothing prevents using both: sample hourly, buffer in RTC, drain once a
day over ESP-NOW. The OTA-window tradeoff still applies (OTA still needs
WiFi). The two stack rather than overlap — A reduces per-transmission
cost, B reduces transmission count.
