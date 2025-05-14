import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface Party {
  id: string;
  nom: string;
  description: string;
  logo_url?: string;
}

interface StrengthWeakness {
  id: string;
  type: "force" | "faiblesse";
  contenu: string;
  date: string;
  source?: string;
  auteur?: string;
}

export default function PartyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [party, setParty] = useState<Party | null>(null);
  const [items, setItems] = useState<StrengthWeakness[]>([]);
  const [refresh, setRefresh] = useState(0);

  // Formulaire d'ajout
  const [type, setType] = useState<"force" | "faiblesse">("force");
  const [contenu, setContenu] = useState("");
  const [date, setDate] = useState("");
  const [source, setSource] = useState("");
  const [auteur, setAuteur] = useState("");

  useEffect(() => {
    fetch(`/parties/${id}`)
      .then(res => res.json())
      .then(setParty);
    fetch(`/forces-faiblesses/${id}`)
      .then(res => res.json())
      .then(setItems);
  }, [id, refresh]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    fetch(`/forces-faiblesses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        party_id: id,
        type,
        contenu,
        date_: date,
        source,
        auteur,
      }),
    }).then(() => {
      setContenu("");
      setDate("");
      setSource("");
      setAuteur("");
      setRefresh(r => r + 1);
    });
  };

  const handleDelete = (sw_id: string) => {
    fetch(`/forces-faiblesses/${sw_id}`, { method: "DELETE" })
      .then(() => setRefresh(r => r + 1));
  };

  if (!party) return <div>Chargement...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center mb-6">
        {party.logo_url && (
          <img src={party.logo_url} alt={party.nom} className="w-20 h-20 object-contain mr-6" />
        )}
        <div>
          <h1 className="text-2xl font-bold">{party.nom}</h1>
          <p className="text-gray-700 mt-2">{party.description}</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-2">Ajouter une force ou faiblesse</h2>
      <form className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleAdd}>
        <select value={type} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setType(e.target.value as "force" | "faiblesse")}
          className="border rounded px-2 py-1">
          <option value="force">Force</option>
          <option value="faiblesse">Faiblesse</option>
        </select>
        <input type="text" placeholder="Contenu" value={contenu} onChange={e => setContenu(e.target.value)} className="border rounded px-2 py-1" required />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border rounded px-2 py-1" required />
        <input type="text" placeholder="Source (optionnel)" value={source} onChange={e => setSource(e.target.value)} className="border rounded px-2 py-1" />
        <input type="text" placeholder="Auteur (optionnel)" value={auteur} onChange={e => setAuteur(e.target.value)} className="border rounded px-2 py-1" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Ajouter</button>
      </form>

      <h2 className="text-xl font-semibold mb-2">Liste des forces et faiblesses</h2>
      <ul className="space-y-2">
        {items.map(item => (
          <li key={item.id} className="p-3 bg-gray-50 rounded flex items-center justify-between">
            <div>
              <span className={item.type === "force" ? "text-green-600 font-bold" : "text-red-600 font-bold"}>{item.type === "force" ? "Force" : "Faiblesse"}:</span> {item.contenu}
              <span className="ml-2 text-xs text-gray-500">({item.date})</span>
              {item.source && <span className="ml-2 text-xs text-blue-500">{item.source}</span>}
              {item.auteur && <span className="ml-2 text-xs text-gray-400">par {item.auteur}</span>}
            </div>
            <button onClick={() => handleDelete(item.id)} className="ml-4 text-red-500 hover:underline">Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
