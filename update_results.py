import fastf1
import supabase
import os

def update_results():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    client = supabase.create_client(url, key)

    # Cache para evitar timeouts en GitHub Actions
    if not os.path.exists('cache'): os.makedirs('cache')
    fastf1.Cache.enable_cache('cache')

    year, round_num = 2025, 24 # Abu Dhabi 2025
    
    try:
        session = fastf1.get_session(year, round_num, 'R')
        session.load()
        
        lista_resultados = []
        for _, driver in session.results.iterrows():
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

        print(f"Enviando datos a Supabase: {year} - {session.event['EventName']}")
        
        # Guardamos la respuesta para ver si Supabase dice algo
        response = client.table("race_results").upsert(data).execute()
        
        # LOG DE VERIFICACIÓN
        print(f"Respuesta de Supabase: {response}")
        print("¡Proceso finalizado!")
        
    except Exception as e:
        print(f"ERROR CRÍTICO: {e}")

if __name__ == "__main__":
    update_results()