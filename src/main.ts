import "./style.css";
import "@esri/calcite-components/dist/calcite/calcite.css";
import "@arcgis/core/assets/esri/themes/light/main.css";

import { defineCustomElements as defineCalciteElements } from "@esri/calcite-components/dist/loader";
import { defineCustomElements as defineMapElements } from "@arcgis/map-components/dist/loader";

defineCalciteElements(window, {
  resourcesUrl: "https://js.arcgis.com/calcite-components/1.7.0/assets",
});
defineMapElements();

const shellPanel = document.querySelector(
  "#shell-panel"
) as HTMLCalciteShellPanelElement;

shellPanel.querySelectorAll("calcite-action").forEach((action) => {
  action.addEventListener("click", (event) => {
    const target = event.target as HTMLCalciteActionElement;
    shellPanel.querySelectorAll("calcite-block").forEach((block) => {
      block.id.split("-")[0] === target.id.split("-")[0]
        ? (block.open = true)
        : (block.open = false);
    });

    shellPanel.querySelectorAll("calcite-action").forEach((action) => {
      action.id === target.id
        ? (action.active = true)
        : (action.active = false);
    });
  });
});
