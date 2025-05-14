import "@arcgis/map-components/components/arcgis-map";
import "@esri/calcite-components/components/calcite-shell";
import "./style.css";

init();

async function init() {
  const appShell = document.querySelector("#app-shell");

  const arcgisMap = document.createElement("arcgis-map");
  arcgisMap.itemId = "ef2644781da844648e8bb30ab52a02bc";
  appShell?.appendChild(arcgisMap);

  await arcgisMap.viewOnReady();
}
