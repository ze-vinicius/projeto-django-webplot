from django import forms
from .models import Assunto, Indice, IndiceEspDes


def get_assuntos():
    choices = []

    for assunto in Assunto.objects.all():
        choices.append((assunto.id, assunto.nome))

    return choices


def get_indices(id_assunto = None):
    choices = []

    if id_assunto is None:
        for indice in Indice.objects.all():
            choices.append((indice.id, indice.nome))
    else:
        indices_esp_des = IndiceEspDes.objects.filter(assunto=id_assunto).distinct('indice').exclude(indice=1339)

        for obj in indices_esp_des:
            choices.append((obj.indice.id, obj.indice.nome))

    return choices


class FormCalcular(forms.Form):
    arquivo = forms.FileField(required=False)
    assuntos = forms.ChoiceField(choices=(), required=False)
    indices = forms.ChoiceField(choices=(), required=False)
