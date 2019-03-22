function getCookie(name)
{
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?

            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

$.ajaxSetup({
     beforeSend: function(xhr, settings) {
         if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
             // Only send the token to relative URLs i.e. locally.
             xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
         }
     }
});

//Isso de cima são os bagulhos de crsf token do django

$(document).ready(function() {
    let arquivo = $("#id_arquivo");
    let assuntos = $("#id_assuntos");
    let indices = $("#id_indices");
    let alg = $("#id_algoritmo");
    assuntos.empty();
    indices.empty();

    // Quando adicionarem um arquivo, automaticamente será desabilitado
    // a opção de selecionar os assuntos ou índices
    arquivo.on("change", function() {
        if(this.files[0].type === "text/csv")
        {
            assuntos.attr("disabled", "disabled");
            indices.attr("disabled", "disabled");
            $("#erro-arquivo").remove();
        } else
        {
            $("#erro-arquivo").append("Adicione um arquivo csv");
            $(this).val("");
        }
    });

    // Quando um assunto for selecionado serão mostrados os índices
    // Calculados daquele assunto
    assuntos.on("click", function()
    {
        if(assuntos.val() === null)
        {
            $.ajax({
                type: "POST",
                url: '/',
                dataType: "json",
                success: function(data)
                {
                    // console.log(data);
                    if(data.length > 0)
                    {
                        $.each(data, function(key, value)
                        {
                            assuntos.append(new Option(value[1], value[0]));
                        })
                    }
                    get_indices(assuntos.val());
                    arquivo.attr("disabled", "disabled");
                }
            })
        }
    });

    function get_indices(assunto_id)
    {
        $.ajax({
            type: "POST",
            url: '/',
            data: {"id_assunto" : assunto_id},
            dataType: "json",
            success: function(data) {
                indices.empty();

                if(data.length > 0){
                    $.each(data, function(key, value)
                    {
                        //Adiciona os options no select de indices
                        indices.append(new Option(value[1], value[0]));
                    })
                }
            }
        })
    }

    assuntos.on("change", function() {
        //Envia uma requisição ajax para a view puxar os indices calculados
        get_indices(assuntos.val());
    });

    // indices.on("click", function() {
    //     $.post("/", function(data) {
    //
    //     });
    // });

    function verificaArquivo(arq)
    {
        if(arq.files)
        {
            console.log(arq.files.type);
        }
    }
    
    let btn_limpar = $("#btn-limpar");

    function limpa_form() {
        arquivo.val("");
        arquivo.attr("disabled", false);
        assuntos.empty()
        assuntos.attr("disabled", false);
        indices.empty();
        indices.attr("disabled", false);
    };

    btn_limpar.on("click", limpa_form());



    $('#enviar').on('click', function()
    {

        $.ajax({
            type: "POST",
            url: '/',
            data: {"submit" : "form", "arquivo" : arquivo.val(), "assuntos" : assuntos.val(), "indices" : indices.val(), "algoritmo" : alg.val()},
            dataType: "json",
            success: function (data) {
                // console.log(data);
                // data = JSON.parse(data);
                // GRÁFICO SEM A SUAVIZAÇÃO
                        // Create map instance
                        limpa_form();
                        $("#chart1div").addClass("chartdiv");
                        $("#chart2div").addClass("chartdiv");

                        let chart = am4core.create("chart1div", am4maps.MapChart);
                        chart.preloader.disabled = true;

                        //set title to the chart
                        let title = chart.titles.create();
                        title.text = "GRÁFICO SEM SUAVIAÇÃO";
                        title.fontSize = 25;
                        title.marginBottom = 30;

                        // Set map definition
                        chart.geodata = am4geodata_brasilHighs;

                        // Set projection
                        chart.projection = new am4maps.projections.Miller();

                        // Create map polygon series
                        let polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());

                        polygonSeries.useGeodata = true;

                        var polygonTemplate = polygonSeries.mapPolygons.template;
                        polygonTemplate.tooltipText = "{NOME_MUNI} : {value}";
                        polygonTemplate.fill = am4core.color("#afaeb2");

                        // Create hover state and set alternative fill color
                        var hs = polygonTemplate.states.create("hover");

                        polygonTemplate.propertyFields.fill = "fill";


                        polygonSeries.heatRules.push({
                        "property": "fill",
                        "target": polygonSeries.mapPolygons.template,
                        "min": am4core.color("#d4c900"),
                        "max": am4core.color("#310000"),
                        // "dataField" : "PESO"
                        });
                        let peso = JSON.parse(data["peso"]);
                        polygonSeries.data = peso;

                        // Cria uma legenda de calor
                        let heatLegend = chart.createChild(am4maps.HeatLegend);

                        heatLegend.orientation = "horizontal";
                        heatLegend.series = polygonSeries;
                        heatLegend.width = am4core.percent(100);
                        heatLegend.padding(20, 20, 20, 20);
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
                                {"type" : "json", "label" : "JSON"},
                            ]
                        }];

                        chart.exporting.filePrefix = "PESO";

                        // data = JSON.stringify(data);
                        // result = JSON.parse(data);

                        // polygonSeries.data = data;

                        // GRAFICO PROCESSADO
                        // Create map instance
                        let chart2 = am4core.create("chart2div", am4maps.MapChart);
                        chart2.preloader.disabled = true;

                        //set title2 to the chart2
                        let title2 = chart2.titles.create();
                        title2.text = "GRÁFICO PROCESSADO";
                        title2.fontSize = 25;
                        title2.marginBottom = 30;

                        // Set map definition
                        chart2.geodata = am4geodata_brasilHighs;

                        // Set projection
                        chart2.projection = new am4maps.projections.Miller();

                        // Create map polygon series
                        let polygonSeries2 = chart2.series.push(new am4maps.MapPolygonSeries());

                        // Pegar os dados do json de resultado (PESO ou MEDIA MOVEL)
                        // $(document).ready(function() {
                        //     $.ajax({
                        //     method:"post",
                        //     dataType: "json",
                        //     url: "static/resultados/media_movel.json",
                        //     success: function(data) {
                        //         data = JSON.stringify(data);
                        //         result = JSON.parse(data);
                        //
                        //         polygonSeries2.data = result;
                        //         }
                        //     });
                        // });

                        // Make map load polygon (like country names) data from GeoJSON
                        polygonSeries2.useGeodata = true;

                        let media_movel = JSON.parse(data["media_movel"]);
                        polygonSeries2.data = media_movel;

                        // Configure series
                        var polygonTemplate2 = polygonSeries2.mapPolygons.template;
                        polygonTemplate2.tooltipText = "{NOME_MUNI} : {value}";
                        polygonTemplate2.fill = am4core.color("#afaeb2");

                        // Create hover state and set alternative fill color
                        var hs2 = polygonTemplate2.states.create("hover");

                        polygonTemplate2.propertyFields.fill = "fill";

                        polygonSeries2.heatRules.push({
                        "property": "fill",
                        "target": polygonSeries2.mapPolygons.template,
                        "min": am4core.color("#d4c900"),
                        "max": am4core.color("#310000"),
                        // "dataField" : "PESO"
                        });

                        // Cria uma legenda de calor
                        let heatlegend2 = chart2.createChild(am4maps.HeatLegend);

                        heatlegend2.orientation = "horizontal";
                        heatlegend2.series = polygonSeries2;
                        heatlegend2.width = am4core.percent(100);
                        heatlegend2.padding(20, 20, 20, 20);
                        heatlegend2.valueAxis.renderer.labels.template.fontSize = 9;
                        heatlegend2.valueAxis.renderer.minGridDistance = 0.1;
                        heatlegend2.markerCount = 10;

                        //
                        polygonSeries2.mapPolygons.template.events.on("over", function(ev) {
                          if (!isNaN(ev.target.dataItem.value)) {
                            heatlegend2.valueAxis.showTooltipAt(ev.target.dataItem.value)
                          }
                          else {
                            heatlegend2.valueAxis.hideTooltip();
                          }
                        });

                        polygonSeries2.mapPolygons.template.events.on("out", function(ev) {
                          heatlegend2.valueAxis.hideTooltip();
                        });

                        chart2.exporting.menu = new am4core.ExportMenu();
                        chart2.exporting.menu.items = [{
                            "label" : "...",
                            "menu" : [
                                {"type" : "png" , "label" : "PNG"},
                                {"type" : "jpg" , "label" : "JPG"},
                                {"type" : "pdf" , "label" : "PDF"},
                            ]
                        }];

                        chart2.exporting.filePrefix = "MEDIA_MOVEL";
            }
        })
    });

});

