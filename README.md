# plants

DIY moisture + light monitoring for ~15 plants (10 on a covered Zwolle balcony, ~5 indoors). ESPHome devices reporting to a Pi running Mosquitto + InfluxDB + Grafana.

## Status

**Phase A** — receiver bring-up and BLE-through-windows feasibility test.

## Layout

```
esphome/        device firmware (ESPHome YAML)
  common/       shared config blocks
  receiver.yaml ESP32-WROOM-32 receiver
backend/        Pi services (docker-compose)
docs/           BOM, wiring, phase plans
CLAUDE.md       conventions for LLM-assisted edits
```

## Quick start

### Receiver (Phase A)

```sh
cd esphome
cp secrets.yaml.example secrets.yaml      # fill in WiFi + generated keys
esphome run receiver.yaml                 # initial flash via USB
esphome run receiver.yaml --device plant-receiver.local   # OTA from now on
```

### Backend (Pi)

```sh
cd backend
cp .env.example .env                      # fill in
docker compose up -d                      # or `docker-compose up -d` on Bookworm (apt ships compose v1)
```

Grafana on `:3000`, InfluxDB on `:8086`, Mosquitto on `:1883`.

