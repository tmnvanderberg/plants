# Wiring

## Receiver (ESP32-WROOM-32, Phase A)

Power only. No GPIO connections — Phase A just needs the radio. USB to a wall adapter.

## Receiver (ESP32-C3 SuperMini Plus, post-Phase-A)

External antenna via U.FL. Otherwise power only. Place near a window if the WROOM-32 result was marginal.

## Sensor node (ESP32-C3 SuperMini, Phase B — draft)

```
Capacitive soil moisture v1.2
   3V3   ──> VCC
   GND   ──> GND
   GPIO1 ──> AOUT       (ADC1_CH1)

BH1750 (I2C, addr 0x23)
   3V3   ──> VCC
   GND   ──> GND
   GPIO5 ──> SDA
   GPIO6 ──> SCL

Battery monitor
   GPIO4 ──> midpoint of 1MΩ + 1MΩ divider on VBAT (ADC1_CH4)

Power
   2× AAA (3.0 V nominal) → SuperMini 5V/VBUS via on-pack switch
```

### C3 strapping pin notes

- **GPIO 2** — strapping pin (boot mode). Avoid as input pulled low at startup.
- **GPIO 8** — strapping pin. Needs an internal pull-up for normal boot.
- **GPIO 9** — boot button. Pulled low at boot enters bootloader. Don't tie a peripheral here.

GPIO 1 (ADC) and GPIO 5/6 (I2C) keep all strapping pins clear.

### Battery monitor sizing

1 MΩ + 1 MΩ divider keeps idle current ~1.5 µA at 3 V — negligible vs the C3's deep-sleep current. Read once per wake, then disable the ADC.
