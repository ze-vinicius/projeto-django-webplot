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

$(document).ready(function() {
    let arquivo = $("#id_arquivo");
    let assuntos = $("#id_assuntos");
    let indices = $("#id_indices");



    // Quando adicionarem um arquivo, automaticamente será desabilitado
    // a opção de selecionar os assuntos ou índices
    arquivo.on("change", function() {
        assuntos.attr("disabled", "disabled");
        indices.attr("disabled", "disabled");
    });


    // Quando um assunto for selecionado serão mostrados os índices
    // Calculados daquele assunto
    assuntos.on("change", function() {
        $.ajax({
            type: "POST",
            url: $("form").attr("action"),
            data: {"id_assunto" : assuntos.val()},
            dataType: "json",
            success: function(data) {
                indices.empty();

                if(data.length > 0){
                    $.each(data, function(key, value)
                    {
                        indices.append(new Option(value[1], value[0]));
                        // console.log("key: " + value[0] + ", value: " + value[1]);
                    })
                }
            }
        })
    });

    indices.on("click", function() {
        $.post("//", function(data) {

        });
    });
});