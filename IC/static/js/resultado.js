// Create map instance
let chart = am4core.create("chartdiv", am4maps.MapChart);
chart.preloader.disabled = true;

var indicator;
var indicatorInterval;


function showIndicator() {

  if (!indicator) {
    var indicator = chart.tooltipContainer.createChild(am4core.Container);
    indicator.background.fill = am4core.color("#fff");
    indicator.background.fillOpacity = 0.8;
    indicator.width = am4core.percent(100);
    indicator.height = am4core.percent(100);

    var indicatorLabel = indicator.createChild(am4core.Label);
    indicatorLabel.text = "Loading stuff...";
    indicatorLabel.align = "center";
    indicatorLabel.valign = "middle";
    indicatorLabel.fontSize = 20;
    indicatorLabel.dy = 50;

    var hourglass = indicator.createChild(am4core.Image);
    hourglass.href = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/t-160/hourglass.svg";
    hourglass.align = "center";
    hourglass.valign = "middle";
    hourglass.horizontalCenter = "middle";
    hourglass.verticalCenter = "middle";
    hourglass.scale = 0.7;
  }

  indicator.hide(0);
  indicator.show();

  clearInterval(indicatorInterval);
  indicatorInterval = setInterval(function() {
    hourglass.animate([{
      from: 0,
      to: 360,
      property: "rotation"
    }], 2000);
  }, 3000);
}

function hideIndicator() {
  indicator.hide(0);
  clearInterval(indicatorInterval);
}

showIndicator();

chart.addListener("rendered", function (event) {
    hideIndicator();
});

// Set map definition
chart.geodata = am4geodata_brasilHighs;

// Set projection
chart.projection = new am4maps.projections.Miller();

// Create map polygon series
let polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());

// Pegar os dados do json de resultado (PESO ou MEDIA MOVEL)
$(document).ready(function() {
    $.ajax({
    method:"get",
    dataType: "json",
    url: "static/resultados/peso.json",
    success: function(data) {
        data = JSON.stringify(data);
        result = JSON.parse(data);

        console.log(result);
        polygonSeries.data = result;
        }
    });
});

// Make map load polygon (like country names) data from GeoJSON
polygonSeries.useGeodata = true;

// Configure series
var polygonTemplate = polygonSeries.mapPolygons.template;
polygonTemplate.tooltipText = "{NOME_MUNI} : {value}";
polygonTemplate.fill = am4core.color("#afaeb2");

// Create hover state and set alternative fill color
var hs = polygonTemplate.states.create("hover");

polygonTemplate.propertyFields.fill = "fill";

polygonSeries.heatRules.push({
"property": "fill",
"target": polygonSeries.mapPolygons.template,
"min": am4core.color("#0533d4"),
"max": am4core.color("#3b8f03"),
// "dataField" : "PESO"
});

// Cria uma legenda de calor
let heatLegend = chart.createChild(am4maps.HeatLegend);

heatLegend.orientation = "horizontal";
heatLegend.series = polygonSeries;
heatLegend.width = am4core.percent(100);

heatLegend.valueAxis.renderer.labels.template.fontSize = 9;
heatLegend.valueAxis.renderer.minGridDistance = 0.1;
heatLegend.markerCount = 10;

//
polygonSeries.mapPolygons.template.events.on("over", function(ev) {
  if (!isNaN(ev.target.dataItem.value)) {
    heatLegend.valueAxis.showTooltipAt(ev.target.dataItem.value)
  }
  else {
    heatLegend.valueAxis.hideTooltip();
  }
});

polygonSeries.mapPolygons.template.events.on("out", function(ev) {
  heatLegend.valueAxis.hideTooltip();
});

chart.exporting.menu = new am4core.ExportMenu();
chart.exporting.menu.items = [{
    "label" : "...",
    "menu" : [
        {"type" : "png" , "label" : "PNG"},
        {"type" : "jpg" , "label" : "JPG"},
        {"type" : "pdf" , "label" : "PDF"},
    ]
}];

chart.exporting.filePrefix = "PESO";
