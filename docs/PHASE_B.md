# Phase B — sensor node deployment

(Stub. Detail this once Phase A passes and the C3 SuperMinis arrive.)

## Open questions

- **Sleep cadence.** 15 min between wakes is fine for moisture, too coarse for light. Options:
  - Single cadence (e.g. 5 min) — simpler, more battery drain.
  - Two cadences via an internal counter — moisture every Nth wake.
- **Calibration.** Per-pot dry/wet endpoints stored where?
  - On the node (flash) — survives reboots, but a dead node loses calibration.
  - In InfluxDB / Grafana — applied at query time. More flexible, recalibratable without redeploying.
- **Provisioning 15 nodes.** Each needs a unique `device_name` and (probably) MAC-based MQTT topic. Two paths:
  - Hand-write 15 YAMLs with `packages: !include common/node.yaml` — simplest, most LLM-readable.
  - Generate from a template — fewer files but harder to audit.
- **OTA on a sleeping node.** See the C3 deep-sleep + OTA gotcha in [CLAUDE.md](../CLAUDE.md). Plan: include a `mqtt.on_message` trigger that delays the next sleep when an "update" topic is published, so a config can land within one wake cycle.
- **Backend ingest.** Telegraf MQTT input → InfluxDB output is the obvious choice. Compose entry is already stubbed (commented) in [`backend/docker-compose.yml`](../backend/docker-compose.yml).

## Once decided

Commit `esphome/common/node.yaml` and one `esphome/node-NN.yaml` per device. Backfill calibration after a few days of readings.
