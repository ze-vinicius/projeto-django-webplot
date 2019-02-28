from django.shortcuts import render, HttpResponse
from django.http import JsonResponse
from .forms import *
import json
# Create your views here.


def index(request):
    if request.is_ajax() and request.POST:
        if "id_assunto" in request.POST:
            indices = get_indices(request.POST['id_assunto'])
            print(indices)
            indices = json.dumps(indices)
            return HttpResponse(indices, content_type='application/json')

    elif request.method == 'POST':
        form = FormCalcular(request.POST, request.FILES)

        if form.is_valid():
            return HttpResponse("")
    else:
        form = FormCalcular()

    return render(request, 'home.html', {'form': form})
