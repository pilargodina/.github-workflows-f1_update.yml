import fastf1
import supabase
import os
import json

def update_results():
    # Conexión
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    client = supabase.create_client(url, key)

    # Configurar Cache (VITAL para FastF1 en scripts automáticos)
    if not os.path.exists('cache'):
        os.makedirs('cache')
    fastf1.Cache.enable_cache('cache')

    # PRUEBA: Vamos a traer Abu Dhabi 2025 (Round 24)
    year, round_num = 2025, 24 
    
    print(f"Descargando datos de FastF1 para el año {year} ronda {round_num}...")
    
    try:
        session = fastf1.get_session(year, round_num, 'R')
        session.load()
        
        lista_resultados = []
        for _, driver in session.results.iterrows():
            # Limpiamos los datos para evitar errores de JSON
            lista_resultados.append({
                "pos": int(driver['Position']),
                "name": str(driver['FullName']),
                "team": str(driver['TeamName'])
            })

        data = {
            "year": year,
            "round": round_num,
            "gp_name": session.event['EventName'],
            "session_type": "Race",
            "results": lista_resultados 
        }

        # Ejecutamos el Upsert
        response = client.table("race_results").upsert(data).execute()
        print(f"¡Éxito! Insertados {len(lista_resultados)} pilotos para {session.event['EventName']}")
        
    except Exception as e:
        print(f"Error cargando FastF1: {e}")

if __name__ == "__main__":
    update_results()