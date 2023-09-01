import "./style.css";
import "@esri/calcite-components/dist/calcite/calcite.css";
import "@arcgis/map-components/node_modules/@arcgis/core/assets/esri/themes/light/main.css";

import { defineCustomElements as defineCalciteElements } from "@esri/calcite-components/dist/loader";
import { defineCustomElements as defineMapElements } from "@arcgis/map-components/dist/loader";

defineCalciteElements(window, {
  resourcesUrl: "https://js.arcgis.com/calcite-components/1.6.1/assets",
});
defineMapElements();

const layerListAction = document.querySelector(
  "#layer-list-action"
) as HTMLCalciteActionElement;
const legendAction = document.querySelector(
  "#legend-action"
) as HTMLCalciteActionElement;
const layerListBlock = document.querySelector(
  "#layer-list-block"
) as HTMLCalciteBlockElement;
const legendBlock = document.querySelector(
  "#legend-block"
) as HTMLCalciteBlockElement;

layerListAction?.addEventListener("click", () => {
  layerListAction.active = true;
  layerListBlock.open = true;

  legendAction.active = false;
  legendBlock.open = false;
});

legendAction?.addEventListener("click", () => {
  layerListAction.active = false;
  layerListBlock.open = false;

  legendAction.active = true;
  legendBlock.open = true;
});
