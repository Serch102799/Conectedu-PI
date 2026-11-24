from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd

# 1. Cargamos el cerebro (el modelo que exportaste)
modelo = joblib.load('modelo_riesgo_rf.joblib')

# 2. Inicializamos la aplicación FastAPI
app = FastAPI()

# 3. Definimos qué datos nos va a enviar Node.js/Angular
class Estudiante(BaseModel):
    perfil_vak: str
    dias_inactivos: int
    racha_actual: int
    promedio_calificaciones: float
    tutorias_asistidas: int

# 4. Creamos la ruta donde escucharemos las peticiones
@app.post("/predecir")
def predecir_riesgo(alumno: Estudiante):
    # Convertimos los datos que llegan a un formato de tabla (DataFrame)
    datos_df = pd.DataFrame([alumno.dict()])
    
    # Le pedimos al modelo que haga la predicción
    prediccion = modelo.predict(datos_df)[0]
    
    # También obtenemos la probabilidad (certeza del modelo)
    # predict_proba devuelve algo como [[0.1, 0.9]], tomamos la probabilidad de "riesgo alto" (índice 1)
    if hasattr(modelo, "predict_proba"):
        probabilidad = float(modelo.predict_proba(datos_df)[0][1])
    else:
        probabilidad = 1.0 if prediccion else 0.0
    
    # Preparamos la respuesta que enviaremos de regreso
    return {
        "riesgo_alto": bool(prediccion),
        "probabilidad": probabilidad,
        "mensaje": "Riesgo de deserción" if prediccion else "Estudiante estable"
    }