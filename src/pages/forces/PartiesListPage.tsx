import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Party {
  id: string;
  nom: string;
  description: string;
  logo_url?: string;
}

export default function PartiesListPage() {
  const [parties, setParties] = useState<Party[]>([]);
  useEffect(() => {
    fetch("/parties")
      .then(res => res.json())
      .then(setParties);
  }, []);

  const [showForm, setShowForm] = useState(false);
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/parties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, description, logo_url: logoUrl })
      });
      if (!res.ok) throw new Error("Erreur lors de la création du parti");
      setNom(""); setDescription(""); setLogoUrl("");
      setShowForm(false);
      // Rafraîchir la liste
      fetch("/parties").then(res => res.json()).then(setParties);
    } catch (err: unknown) {
      setError(err.message || "Erreur inconnue");
    }
    setCreating(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Forces & Faiblesses — Partis Politiques</h1>
        <button
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition"
          onClick={() => setShowForm(f => !f)}
        >
          {showForm ? "Annuler" : "Créer un parti"}
        </button>
      </div>
      {showForm && (
        <form className="mb-6 bg-white p-4 rounded shadow grid gap-4" onSubmit={handleCreate}>
          <div>
            <label className="block text-sm font-medium">Nom</label>
            <input value={nom} onChange={e => setNom(e.target.value)} required className="mt-1 border rounded px-2 py-1 w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} required className="mt-1 border rounded px-2 py-1 w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium">Logo (URL, optionnel)</label>
            <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} className="mt-1 border rounded px-2 py-1 w-full" />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button type="submit" disabled={creating} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
            {creating ? "Création..." : "Créer"}
          </button>
        </form>
      )}
      <ul className="space-y-4">
        {parties.map(party => (
          <li key={party.id} className="p-4 bg-white rounded-lg shadow flex items-center">
            {party.logo_url && (
              <img src={party.logo_url} alt={party.nom} className="w-16 h-16 object-contain mr-4" />
            )}
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{party.nom}</h2>
              <p className="text-gray-700 text-sm">{party.description}</p>
            </div>
            <Link to={`/parties/${party.id}`} className="ml-6 text-blue-600 hover:underline">Voir la fiche</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
