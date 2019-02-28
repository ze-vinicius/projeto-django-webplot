from django.shortcuts import render, HttpResponse
from django.http import JsonResponse
from .forms import *
import json
# Create your views here.


def index(request):
    print(request.is_ajax() and request.method)

    if request.is_ajax() and request.method == "POST":
        if "id_assunto" in request.POST:
            indices = get_indices(request.POST['id_assunto'])
            indices = json.dumps(indices)
            return HttpResponse(indices, content_type='application/json')
        else:
            assuntos = get_assuntos()
            assuntos = json.dumps(assuntos)
            return HttpResponse(assuntos, content_type='applications/json')
    elif request.method == 'POST':
        form = FormCalcular(request.POST, request.FILES)
        print(form.errors)
        if form.is_valid():
            return HttpResponse("")
    else:
        form = FormCalcular()

    return render(request, 'home.html', {'form': form})
