from django.shortcuts import render, HttpResponse
from django.http import JsonResponse
from .forms import *
import json
from .static.algoritmos.mml import *
# Create your views here.


def index(request):
    if request.is_ajax() and request.method == 'POST':
        if 'id_assunto' in request.POST:
            indices = get_indices(request.POST['id_assunto'])
            indices = json.dumps(indices)
            return HttpResponse(indices, content_type='application/json')
        else:
            assuntos = get_assuntos()
            assuntos = json.dumps(assuntos)
            return HttpResponse(assuntos, content_type='applications/json')
    elif request.method == 'POST':
        algoritmos = [calculo_csv_usuario, calculo_assunto_indice]

        form = FormCalcular(request.POST, request.FILES)

        if form.is_valid():
            dados = form.cleaned_data

            if dados['arquivo']:
                calculo_csv_usuario(dados['arquivo'])
                return render(request, 'resultado.html')
            elif dados['assuntos'] and dados['indices']:
                calculo_assunto_indice(dados['indices'], dados['assuntos'])
                return render(request, 'resultado.html')
    else:
        form = FormCalcular()

    return render(request, 'home.html', {'form': form})


def testes(request):
    return render(request, 'resultado.html')