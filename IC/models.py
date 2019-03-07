# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey has `on_delete` set to the desired behavior.
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models
# Unable to inspect table 'acesso_tecnologias'
# The error was: permission denied for relation acesso_tecnologias



class Assunto(models.Model):
    id = models.BigAutoField(primary_key=True)
    nome = models.CharField(max_length=255, blank=True, null=True)
    observacao = models.CharField(max_length=255, blank=True, null=True)
    data_carga = models.DateField(blank=True, null=True)
    ano_ref = models.IntegerField(blank=True, null=True)
    ano_base = models.IntegerField(blank=True, null=True)
    # tema = models.ForeignKey('Tema', models.DO_NOTHING, blank=True, null=True)
    # fonte_dados = models.ForeignKey('FonteDados', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'assunto'

    def __str__(self):
        return self.nome

class Indice(models.Model):
    id = models.BigAutoField(primary_key=True)
    nome = models.CharField(max_length=255, blank=True, null=True)
    sigla = models.CharField(max_length=255, blank=True, null=True)
    observacao = models.TextField(blank=True, null=True)
    tipo = models.CharField(max_length=2, blank=True, null=True)
    formula = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'indice'


class IndiceEspDes(models.Model):
    id = models.BigAutoField(primary_key=True)
    # ano_ref = models.ForeignKey('Territorio', models.DO_NOTHING, db_column='ano_ref', blank=True, null=True)
    i_codigo_amc = models.CharField(max_length=255, blank=True, null=True)
    valor = models.CharField(max_length=255, blank=True, null=True)
    assunto = models.ForeignKey(Assunto, models.DO_NOTHING, blank=True, null=True)
    indice = models.ForeignKey(Indice, models.DO_NOTHING, blank=True, null=True)
    territorio_codigo = models.BigIntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'indice_esp_des'

    def make_array(self):
        return [self.id, self.i_codigo_amc, self.valor, self.territorio_codigo]