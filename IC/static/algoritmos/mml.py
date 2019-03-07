import matplotlib
matplotlib.use('TkAgg')
import pandas as pd
import geopandas as gpd
import libpysal as lps
from django.db import connections
import numpy as np


def vizinhos(x, municipios, neighbors):
    temp = municipios.loc[municipios['COD_IBGE'].isin(neighbors[x.COD_IBGE])]
    if len(temp) == 0:
        return 0
    return sum(temp.PESO) / len(temp)


def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]


def calculo_assunto_indice(indice_id, assunto_id):
    municipios = gpd.read_file('App/shapes/municipios.shp')

    with connections['base'].cursor() as cursor:
        cursor.execute("SELECT * FROM indice_esp_des WHERE indice_id = %s AND assunto_id = %s", [indice_id, assunto_id])
        assunto = cursor.fetchall()
        df = pd.DataFrame(assunto, columns=['id', 'ano_ref', 'i_codigo_amc', 'valor', 'assunto_id', 'indice_id',
                                            'territorio_codigo'])

        return media_movel_local(df, municipios)


def media_movel_local(dataframe, municipios):
    dataframe.fillna(0.0, inplace=True)
    dataframe.loc[dataframe['valor'] == 'null', 'valor'] = '0'

    #Converter as strings em numéricos
    dataframe.loc[:, 'valor'] = pd.to_numeric(dataframe['valor'], 'ignore')
    dataframe.loc[:, 'i_codigo_amc'] = pd.to_numeric(dataframe['i_codigo_amc'])

    municipios.loc[:, 'COD_IBGE'] = pd.to_numeric(municipios['COD_IBGE'])
    ######

    municipios['PESO'] = 0.0
    municipios['MEDIA_MOVEL'] = 0.0

    municipios = municipios[municipios['COD_IBGE'].isin(dataframe['i_codigo_amc'])]
    municipios.set_index(municipios['COD_IBGE'], inplace=True)
    dataframe.set_index(dataframe['i_codigo_amc'], inplace=True)
    municipios.loc[:, 'PESO'] = dataframe.loc[:, 'valor']

    municipios.reset_index(drop=True, inplace=True)

    # CRIA A MATRIZ DE VIZINHAÇA
    neighbors = lps.weights.Rook.from_dataframe(municipios, idVariable='COD_IBGE').neighbors
    municipios.loc[:, 'MEDIA_MOVEL'] = municipios.apply(lambda x: vizinhos(x, municipios, neighbors), axis=1)

    municipios[['COD_IBGE', 'PESO', 'MEDIA_MOVEL']].to_json("static/resultado.json", orient='records')


def calculo_csv_usuario(path, delimiter=','):
    if path:
        municipios = gpd.read_file('App/shapes/municipios.shp')

        # utilizando um shape de 2010.
        dataframe = pd.read_csv(path, delimiter=delimiter)

        return media_movel_local(dataframe, municipios)

    else:
        print()
    # return 'plot.png'
