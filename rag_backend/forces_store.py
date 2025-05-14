import uuid
import json
from datetime import date
from typing import Dict, List, Optional

from forces_models import PoliticalParty, StrengthWeakness

DB_PARTIES_FILE = "parties.json"
DB_SW_FILE = "strengths_weaknesses.json"

# Initialisation des "bases de données" en mémoire (seront chargées depuis les fichiers)
political_parties_db: Dict[str, PoliticalParty] = {}
strengths_weaknesses_db: Dict[str, StrengthWeakness] = {}

# --- Fonctions de chargement et sauvegarde --- #

def _load_parties():
    global political_parties_db
    try:
        with open(DB_PARTIES_FILE, 'r') as f:
            parties_data = json.load(f)
            political_parties_db = {pid: PoliticalParty(**data) for pid, data in parties_data.items()}
    except FileNotFoundError:
        political_parties_db = {}
    except json.JSONDecodeError:
        political_parties_db = {} # Fichier corrompu ou vide

def _save_parties():
    with open(DB_PARTIES_FILE, 'w') as f:
        json.dump({pid: party.model_dump(mode='json') for pid, party in political_parties_db.items()}, f, indent=2)

def _load_sw():
    global strengths_weaknesses_db
    try:
        with open(DB_SW_FILE, 'r') as f:
            sw_data = json.load(f)
            strengths_weaknesses_db = {sw_id: StrengthWeakness(**data) for sw_id, data in sw_data.items()}
            # Conversion des dates string en objets date
            for sw_id, sw_item in strengths_weaknesses_db.items():
                if isinstance(sw_item.date, str):
                    strengths_weaknesses_db[sw_id].date = date.fromisoformat(sw_item.date)
    except FileNotFoundError:
        strengths_weaknesses_db = {}
    except json.JSONDecodeError:
        strengths_weaknesses_db = {} # Fichier corrompu ou vide

def _save_sw():
    with open(DB_SW_FILE, 'w') as f:
        json.dump({sw_id: sw.model_dump(mode='json') for sw_id, sw in strengths_weaknesses_db.items()}, f, indent=2)

# Charger les données au démarrage du module
_load_parties()
_load_sw()

# --- CRUD pour PoliticalParty --- #

def create_party(nom: str, description: str, logo_url: Optional[str] = None) -> PoliticalParty:
    party_id = str(uuid.uuid4())
    party = PoliticalParty(id=party_id, nom=nom, description=description, logo_url=logo_url)
    political_parties_db[party_id] = party
    _save_parties()
    return party

def get_party(party_id: str) -> Optional[PoliticalParty]:
    return political_parties_db.get(party_id)

def list_parties() -> List[PoliticalParty]:
    return list(political_parties_db.values())

def update_party(party_id: str, nom: Optional[str] = None, description: Optional[str] = None, logo_url: Optional[str] = None) -> Optional[PoliticalParty]:
    party = political_parties_db.get(party_id)
    if party:
        if nom is not None: party.nom = nom
        if description is not None: party.description = description
        if logo_url is not None: party.logo_url = logo_url
        _save_parties()
        return party
    return None

def delete_party(party_id: str) -> bool:
    if party_id in political_parties_db:
        del political_parties_db[party_id]
        # Supprimer aussi les forces/faiblesses associées
        related_sw_ids = [sw_id for sw_id, sw in strengths_weaknesses_db.items() if sw.party_id == party_id]
        for sw_id in related_sw_ids:
            del strengths_weaknesses_db[sw_id]
        _save_parties()
        _save_sw()
        return True
    return False

# --- CRUD pour StrengthWeakness --- #

def add_strength_weakness(party_id: str, type: str, contenu: str, date_input: date, source: Optional[str] = None, auteur: Optional[str] = None) -> Optional[StrengthWeakness]:
    if party_id not in political_parties_db:
        return None # Le parti doit exister
    sw_id = str(uuid.uuid4())
    item = StrengthWeakness(id=sw_id, party_id=party_id, type=type, contenu=contenu, date=date_input, source=source, auteur=auteur)
    strengths_weaknesses_db[sw_id] = item
    _save_sw()
    return item

def list_strengths_weaknesses(party_id: str) -> List[StrengthWeakness]:
    return [sw for sw in strengths_weaknesses_db.values() if sw.party_id == party_id]

def get_strength_weakness(sw_id: str) -> Optional[StrengthWeakness]:
    return strengths_weaknesses_db.get(sw_id)

def list_all_strengths_weaknesses() -> List[StrengthWeakness]:
    """Retourne toutes les forces et faiblesses, tous partis confondus."""
    return list(strengths_weaknesses_db.values())

def delete_strength_weakness(sw_id: str) -> bool:
    if sw_id in strengths_weaknesses_db:
        del strengths_weaknesses_db[sw_id]
        _save_sw()
        return True
    return False
