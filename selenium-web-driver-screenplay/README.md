# Proyecto de Pruebas Automatizadas con ScreenPy

Este proyecto utiliza el patrón Screenplay con `pytest`, `screenpy` y `selenium` para realizar pruebas automatizadas en navegadores.

## Requisitos Previos

- Python 3.10 o superior
- Google Chrome instalado
- Conexión a internet (para instalación inicial de dependencias)

## Instalación del Proyecto

Seguir estos pasos en la raíz del proyecto:

### 1. Crear y activar entorno virtual

#### Windows (PowerShell o CMD):
python -m venv venv
venv\Scripts\activate

#### Linux/macOS (bash/zsh):
python3 -m venv venv
source venv/bin/activate

### 2. Instalar dependencias

pip install -r requirements.txt

## Ejecución de Pruebas

Para ejecutar todas las pruebas con reporte HTML:

pytest -q --html=report.html --self-contained-html

También puedes ejecutar una prueba específica, por ejemplo:

pytest tests/test_login.py -q

## Reportes

Después de la ejecución, se generará el archivo:

report.html
start .\report.html

Puedes abrirlo desde tu navegador para revisar los resultados.

Las capturas de pantalla se guardan automáticamente en la carpeta:

screenshots

## Estructura del Proyecto (Resumen)

screenplay_project/
├── actors/
├── pages/
├── questions/
├── tasks/
├── tests/
│   ├── conftest.py
│   ├── test_login.py
│   ├── test_invalid_login.py
│   ├── test_duckduckgo_search.py
│   ├── test_duckduckgo_searchFail.py
│   └── test_duckduckgo_failure.py
├── requirements.txt
├── venv/  (creado localmente)
└── report.html (generado tras ejecutar pruebas)


## Ejecución Rápida (opcional)

Si existen los archivos, puedes usar:

Windows:
run.bat

Linux/macOS:
chmod +x run.sh
./run.sh
