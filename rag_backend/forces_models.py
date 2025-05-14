from pydantic import BaseModel
from typing import Optional
from datetime import date

class PoliticalParty(BaseModel):
    id: str
    nom: str
    description: str
    logo_url: Optional[str] = None

class StrengthWeakness(BaseModel):
    id: str
    party_id: str
    type: str  # "force" ou "faiblesse"
    contenu: str
    date: date
    source: Optional[str]
    auteur: Optional[str]
