# Conventions for LLM-assisted edits

This project will be ~99% vibe-coded. Keep it predictable so future edits stay safe.

## Architecture rules

- **One YAML per device.** Each ESP32 has its own file under `esphome/`. No code generation, no templating beyond ESPHome's `substitutions:`.
- **Share via `packages:` + `!include`.** Common config (wifi, api, ota, logger) lives in `esphome/common/`. New devices import it — don't copy-paste.
- **Stock ESPHome components only.** Reach for custom C++ / lambdas only when no stock platform fits, and comment why inline.
- **Secrets stay out of the repo.** ESPHome → `esphome/secrets.yaml` (gitignored). Backend → `backend/.env` (gitignored). The `*.example` files are the contract for what must be filled in.
- **Backend is docker-compose only.** No imperative setup scripts. Service config is mounted from `backend/<service>/config/...` or driven by env vars. The compose file is the deployment.
- **MQTT topics: `plants/<device_name>/<sensor>`.** Flat. Add a sensor by adding an entry in the device YAML, not by inventing a new topic scheme.
- **Hostnames: `plant-receiver`, `plant-node-01`, …, `plant-node-15`.** Match `${device_name}`.

## Hardware gotchas worth flagging

- **ESP32-C3 strapping pins:** GPIO 2, 8, 9 affect boot. GPIO 9 is the boot button — don't tie a peripheral that pulls it low at startup. ADC lives on GPIO 0–4; I2C is conventionally GPIO 5/6.
- **C3 deep sleep + OTA:** if a node sleeps before the OTA handshake completes, the only recovery is a USB cable. Always allow a long-enough awake window on the first boot of new firmware (or a `stay_awake` MQTT trigger).
- **Capacitive moisture v1.2:** power from 3.3V on a battery node, not 5V. Calibrate dry/wet per pot — readings drift across soils and over time.
- **BH1750:** I2C address 0x23 by default; 0x5C only if ADDR is pulled high.

## Validate before deploying

```sh
esphome config esphome/<file>.yaml          # validate ESPHome YAML
cd backend && docker compose config         # validate docker-compose
```

Don't push a config you haven't validated. ESPHome OTA failures on a battery node mean a USB cable.

## What lives where

- New device YAML → `esphome/<device-name>.yaml`, with `packages: { base: !include common/base.yaml }`.
- New shared snippet → `esphome/common/<topic>.yaml`, imported by name from device files.
- New backend service → add to `backend/docker-compose.yml`, configs under `backend/<service>/`.
- New phase doc → `docs/PHASE_X.md`, linked from README.
