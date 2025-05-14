from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings

class RAGEngine:
    def __init__(self, collection_name="docs"):
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        self.client = chromadb.Client(Settings(anonymized_telemetry=False))
        self.collection = self.client.get_or_create_collection(collection_name)

    def add_document(self, doc_id: str, text: str):
        try:
            embedding = self.model.encode([text])[0]
            self.collection.add(documents=[text], embeddings=[embedding], ids=[doc_id])
            print(f"[RAGEngine] Document ajouté: {doc_id}")
        except Exception as e:
            print(f"[RAGEngine][ERROR] add_document: {e}")
            raise

    def search(self, query: str, n_results: int = 3):
        try:
            query_emb = self.model.encode([query])[0]
            results = self.collection.query(query_embeddings=[query_emb], n_results=n_results)
            # Formatage pour le front :
            return {
                "documents": results.get("documents", [[]])[0],
                "ids": results.get("ids", [[]])[0],
                "distances": results.get("distances", [[]])[0],
            }
        except Exception as e:
            print(f"[RAGEngine][ERROR] search: {e}")
            return {"documents": [], "ids": [], "distances": [], "error": str(e)}
