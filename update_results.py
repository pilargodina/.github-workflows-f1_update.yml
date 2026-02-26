import fastf1
import supabase
import os

def update_results():
    # Conexión
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") # Usa la Service Role para saltar el RLS
    client = supabase.create_client(url, key)

    # Datos de la carrera (esto podrías hacerlo dinámico después)
    year, round_num = 2025, 1
    
    session = fastf1.get_session(year, round_num, 'R')
    session.load()
    
    # Creamos un formato JSON para guardar en la columna 'results'
    lista_resultados = []
    for _, driver in session.results.iterrows():
        lista_resultados.append({
            "pos": int(driver['Position']),
            "name": driver['FullName'],
            "team": driver['TeamName']
        })

    # Subimos a la tabla public.race_results
    data = {
        "year": year,
        "round": round_num,
        "gp_name": session.event['EventName'],
        "session_type": "Race",
        "results": lista_resultados # Esto entra en el campo JSONB
    }

    client.table("race_results").upsert(data).execute()
    print("¡Resultados actualizados!")

if __name__ == "__main__":
    update_results()