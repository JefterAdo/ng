from fastapi import APIRouter, HTTPException
from typing import List
from datetime import date
from forces_models import PoliticalParty, StrengthWeakness, BaseModel
from forces_store import (
    create_party, get_party, list_parties, update_party, delete_party,
    add_strength_weakness, list_strengths_weaknesses, delete_strength_weakness,
    list_all_strengths_weaknesses
)

router = APIRouter()

# --- Endpoints pour le Tableau de Bord --- #

class DashboardSummary(BaseModel):
    total_parties: int
    recent_sw: List[StrengthWeakness]

@router.get("/dashboard-summary", response_model=DashboardSummary)
def get_dashboard_summary_api():
    try:
        all_parties = list_parties() or []
        all_sw = list_all_strengths_weaknesses() or []
        sorted_sw = sorted(all_sw, key=lambda x: getattr(x, 'date', None) or '', reverse=True)
        return DashboardSummary(
            total_parties=len(all_parties),
            recent_sw=sorted_sw[:3]
        )
    except Exception as e:
        print(f"[DASHBOARD ERROR] {e}")
        raise HTTPException(status_code=500, detail=f"Erreur lors du résumé du dashboard: {e}")


# --- Endpoints pour les Partis --- #

class PartyCreate(BaseModel):
    nom: str
    description: str
    logo_url: str = None

@router.post("/parties", response_model=PoliticalParty)
def create_party_api(party: PartyCreate):
    return create_party(party.nom, party.description, party.logo_url)

@router.get("/parties", response_model=List[PoliticalParty])
def list_parties_api():
    return list_parties()

@router.get("/parties/{party_id}", response_model=PoliticalParty)
def get_party_api(party_id: str):
    party = get_party(party_id)
    if not party:
        raise HTTPException(status_code=404, detail="Parti non trouvé")
    return party

@router.put("/parties/{party_id}", response_model=PoliticalParty)
def update_party_api(party_id: str, nom: str = None, description: str = None, logo_url: str = None):
    party = update_party(party_id, nom=nom, description=description, logo_url=logo_url)
    if not party:
        raise HTTPException(status_code=404, detail="Parti non trouvé")
    return party

@router.delete("/parties/{party_id}")
def delete_party_api(party_id: str):
    if not delete_party(party_id):
        raise HTTPException(status_code=404, detail="Parti non trouvé")
    return {"status": "deleted"}

class StrengthWeaknessCreate(BaseModel):
    party_id: str
    type: str
    contenu: str
    date_: date
    source: str = None
    auteur: str = None

@router.post("/forces-faiblesses", response_model=StrengthWeakness)
def add_strength_weakness_api(sw: StrengthWeaknessCreate):
    return add_strength_weakness(sw.party_id, sw.type, sw.contenu, sw.date_, sw.source, sw.auteur)

@router.get("/forces-faiblesses/{party_id}", response_model=List[StrengthWeakness])
def list_strengths_weaknesses_api(party_id: str):
    return list_strengths_weaknesses(party_id)

@router.delete("/forces-faiblesses/{sw_id}")
def delete_strength_weakness_api(sw_id: str):
    if not delete_strength_weakness(sw_id):
        raise HTTPException(status_code=404, detail="Élément non trouvé")
    return {"status": "deleted"}
