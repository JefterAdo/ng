from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag_engine import RAGEngine
from forces_api import router as forces_router
from rhdpchat_api import router as rhdpchat_router

app = FastAPI()

# Configuration CORS
origins = [
    "http://localhost",          # Pour les développements locaux sans port spécifié
    "http://localhost:3000",     # Si votre frontend React tourne sur le port 3000 (Create React App par défaut)
    "http://localhost:5173",     # Si votre frontend React tourne sur le port 5173 (Vite par défaut)
    # Ajoutez d'autres origines si nécessaire (ex: l'URL de votre application en production)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],  # Limiter aux méthodes nécessaires
    allow_headers=["Content-Type", "Authorization"],  # Limiter aux headers nécessaires
)

app.include_router(forces_router)
app.include_router(rhdpchat_router)
rag = RAGEngine()

class AddDocRequest(BaseModel):
    doc_id: str
    text: str

class SearchRequest(BaseModel):
    query: str
    n_results: int = 3

@app.post("/add-document")
def add_document(req: AddDocRequest):
    try:
        rag.add_document(req.doc_id, req.text)
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'indexation: {e}")

@app.post("/search")
def search(req: SearchRequest):
    results = rag.search(req.query, req.n_results)
    if 'error' in results:
        raise HTTPException(status_code=500, detail=results['error'])
    return results
