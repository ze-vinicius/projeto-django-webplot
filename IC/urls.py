from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('testes', views.testes, name='maps'),
]