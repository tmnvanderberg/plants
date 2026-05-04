# Hardware design — sensor node

Per-node hardware for the 15× plant monitoring deployment. One identical
node per pot, addressed `plant-node-01` … `plant-node-15`.

## Bill of materials (per node)

| Ref | Part | Notes |
|-----|------|-------|
| MCU | ESP32-C3 SuperMini Plus, soldered male headers | 2×8 pin layout, USB-C |
| Light sensor | GY-30 BH1750 module | 1×5 male header replaced with 5-pin JST-XH; see assembly |
| BH1750 cable | JST-XH 5-pin, 5-wire, both ends crimped | stock part |
| Moisture sensor | Capacitive Soil Moisture Sensor with cable (Soldered) | ships with 3-pin cable |
| Battery | 3× AA alkaline holder, integrated switch | nominal 4.5 V, EOL ~3.6 V |
| Carrier PCB | custom, see below | one per node |
| Enclosure | houses carrier + battery holder; BH1750 mounts outside | TBD |

## Power

- 3× AA → carrier `J3` (2-pin JST-PH) → ESP32-C3 `VBUS` pin (silkscreen `5V`).
- C3's onboard LDO (ME6217A33) regulates to 3.3 V; ~150 mV dropout at sleep
  currents holds the rail solid down to a depleted 3.6 V pack.
- Both sensor VCCs share a single switch (not connected to `+3V3` directly):
  - Moisture + BH1750 VCC ← GPIO0 (`SENSOR_PWR`)
  - Combined draw is well under the 40 mA GPIO source limit, so no MOSFET.
- Battery monitor: 1 MΩ / 1 MΩ divider from VBAT to GND, midpoint to GPIO4,
  with 100 nF (`C1`) from the midpoint to GND so the ADC's sample-and-hold
  sees a low AC source impedance.
- USB-C and battery share `VSYS` on the C3. The C3 has a Schottky blocking
  battery → USB-host backfeed, but no diode the other way: with USB plugged
  in **and** the battery switch on, the USB rail will push ~0.2 V into the
  alkaline pack. **Switch the AA holder off (or unplug `J3`) before
  connecting USB.**

## Pin assignment (ESP32-C3)

| GPIO | Net | Function |
|------|-----|----------|
| GPIO0 | SENSOR_PWR | shared sensor VCC switch (high = on) |
| GPIO1 | AOUT | moisture analog in (ADC1_CH1, 12 dB attenuation) |
| GPIO4 | VBAT_DIV | battery voltage monitor |
| GPIO5 | SDA | I²C data |
| GPIO6 | SCL | I²C clock |
| 5V (VBUS) | VBAT | battery + |
| GND | GND | battery − |

## Carrier PCB

Small board, lives inside the enclosure. C3 plugs in via female sockets;
all three sensor/battery wires enter through JSTs.

| Ref | Connector | Purpose |
|-----|-----------|---------|
| U1  | 2×8 female header, 2.54 mm | ESP32-C3 SuperMini Plus socket |
| J1  | JST-XH 3-pin, vertical | moisture sensor cable |
| J2  | JST-XH 5-pin, vertical | BH1750 cable |
| J3  | JST-PH 2-pin, vertical | battery |
| R1  | 1 MΩ, 1206 | VBAT divider, top |
| R2  | 1 MΩ, 1206 | VBAT divider, bottom |
| C1  | 100 nF, 0805 | VBAT divider AC bypass (midpoint to GND) |

### J1 — moisture (3-pin JST-XH)

| Pin | Net |
|-----|-----|
| 1 | SENSOR_PWR |
| 2 | GND |
| 3 | AOUT |

### J2 — BH1750 (5-pin JST-XH, straight-through cable)

Pin order matches the GY-30 module silk (`GND ADD SDA SCL VCC`, end to end),
so the JST-XH on the module installs with **pin 1 over the `GND` pad** and
the cable is a stock straight-through.

| Pin | Net | BH1750 module pin |
|-----|-----|-------------------|
| 1 | GND | GND |
| 2 | GND | ADD |
| 3 | SDA | SDA |
| 4 | SCL | SCL |
| 5 | SENSOR_PWR | VCC |

Pin 2 is tied to GND in copper on the carrier → I²C address `0x23`.

### J3 — battery (2-pin JST-PH)

| Pin | Net |
|-----|-----|
| 1 | VBAT |
| 2 | GND |

## Assembly

1. Carrier PCB ordered with PCBA — sockets, JSTs, resistors, and `C1`
   pre-populated.
2. BH1750 module (per node):
   - Remove the existing 1×5 male header.
   - Solder a 5-pin JST-XH male connector onto the same pads, with **pin 1
     over the `GND` pad** (silk: `GND ADD SDA SCL VCC` end to end). Wrong
     orientation will short `SENSOR_PWR` to GND when the rail switches on.
3. ESP32-C3 SuperMini Plus (per node):
   - Remove the always-on red `PWR` LED (`CD1` on the C3 schematic, 0603,
     top edge near the BOOT button) — hot tweezers, hot-air, or alternately
     reflow both pads with an iron and slide it off. Lifting one end of
     `UR7` (the 0201 limiting resistor in series) is equivalent.
   - Without this, the LED draws ~300–500 µA continuously and the 12-month
     battery target is unreachable.
4. ESP32-C3 pressed into `U1` female sockets.
5. Moisture cable plugged into `J1`.
6. BH1750 cable plugged between the module and `J2`; BH1750 mounted on
   the outside of the enclosure.
7. Battery holder plugged into `J3`.

## I²C

- Bus: GPIO5 (SDA) / GPIO6 (SCL).
- Devices: BH1750 at `0x23`.

## Power management

- **Sleep model:** ESPHome `deep_sleep` between reads; expected wake interval 1 hour.
- **Sensors during sleep:** the `SENSOR_PWR` rail is driven low → moisture
  probe and BH1750 module fully unpowered, including their on-module LEDs.
  GPIO0 is RTC-capable on the C3, so the rail stays held low through deep sleep.
- **C3 SuperMini during sleep:** stock board with the `PWR` LED removed (see
  Assembly), no LDO swap. Expected sleep current ~50–200 µA depending on board
  revision; with the LED in place, add ~300–500 µA on top.
- **Target battery life:** 12+ months on 3× AA alkaline, assuming the LED is
  out. With the LED in place: ~6 months.
- **ESPHome side:** both sensors declare a `power_supply:` referencing the
  shared GPIO0 switch. The switch enables the rail, waits for settling, the
  sensors read, then it disables.
