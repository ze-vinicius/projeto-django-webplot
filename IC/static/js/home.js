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
                url: $("form").attr("action"),
                dataType: "json",
                success: function(data)
                {
                    console.log(data);
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
            url: $("form").attr("action"),
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

    indices.on("click", function() {
        $.post("//", function(data) {

        });
    });

    function verificaArquivo(arq)
    {
        if(arq.files)
        {
            console.log(arq.files.type);
        }
    }
});