# Plant photos

Drop images named `<device_name>.jpg` (or `.png`/`.webp`) here. They'll be served
by the `plant-images` container at `http://plant-pi.local:8088/<filename>` and
referenced from the Grafana dashboard's plant-info panel.

Sizing: keep under ~500 KB. The dashboard renders thumbnails at 180 px wide;
anything larger just adds load time without visual benefit.

Examples:
  plant-node-01.jpg   →  http://plant-pi.local:8088/plant-node-01.jpg
  plant-node-02.png   →  http://plant-pi.local:8088/plant-node-02.png
