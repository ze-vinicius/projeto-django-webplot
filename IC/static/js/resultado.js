/**
 * ---------------------------------------
 * This demo was created using amCharts 4.
 *
 * For more information visit:
 * https://www.amcharts.com/
 *
 * Documentation is available at:
 * https://www.amcharts.com/docs/v4/
 * ---------------------------------------
 */

// Create map instance
var chart = am4core.create("chartdiv", am4maps.MapChart);

// Set map definition
chart.geodata = am4geodata_brasilHighs;

// Set projection
chart.projection = new am4maps.projections.Miller();

// Create map polygon series
var polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());

// Make map load polygon (like country names) data from GeoJSON
polygonSeries.useGeodata = true;

// Configure series
var polygonTemplate = polygonSeries.mapPolygons.template;
polygonTemplate.tooltipText = "{NOME_MUNI} : {value}";
polygonTemplate.fill = am4core.color("#74B266");

// Create hover state and set alternative fill color
var hs = polygonTemplate.states.create("hover");
hs.properties.fill = am4core.color("#367B25");

let result;

$.ajax({
    method:"get",
    dataType: "json",
    url: "static/resultados/peso.json",
    success: function(data) {
        data = JSON.stringify(data);
        result = JSON.parse(data);

        polygonSeries.data = result;
    }
});

// Add some data
// polygonSeries.data.url = "IC/static/resultados/resultado.json";

// Bind "fill" property to "fill" key in data
polygonTemplate.propertyFields.fill = "fill";

polygonSeries.heatRules.push({
"property": "fill",
"target": polygonSeries.mapPolygons.template,
"min": am4core.color("#F5DBCB"),
"max": am4core.color("#ED7B84"),
// "dataField" : "PESO"
});

let heatLegend = chart.createChild(am4maps.HeatLegend);
heatLegend.minValue = 0;
heatLegend.maxValue = 1;
heatLegend.orientation = "vertical";
heatLegend.series = polygonSeries;
heatLegend.width = am4core.percent(100);

// console.log(result);