import React, { useState } from 'react';
import SearchBar from '../../components/SearchBar';
import SearchResults from '../../components/SearchResults';
import { Database, Upload, Search } from 'lucide-react';
import Button from '../../components/ui/Button';
import ragService from '../../services/ragService';

// Type pour les résultats de recherche
interface SearchResultData {
  documents: string[];
  ids: string[];
  distances: number[];
}

const SearchPage: React.FC = () => {
  const [results, setResults] = useState<SearchResultData | null>(null);
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [docId, setDocId] = useState('');
  const [docText, setDocText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Gestion des résultats de recherche
  const handleSearchResults = (data: SearchResultData) => {
    setResults(data);
  };

  // Ajout d'un document au moteur RAG
  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!docId.trim() || !docText.trim()) {
      setMessage({ text: 'ID et contenu du document requis', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await ragService.addDocument(docId, docText);
      setMessage({ text: 'Document ajouté avec succès', type: 'success' });
      setDocId('');
      setDocText('');
      setIsAddingDoc(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du document', error);
      setMessage({ text: 'Erreur lors de l\'ajout du document', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Recherche Contextuelle RAG</h1>
        <p className="text-neutral-600">
          Recherchez dans les documents indexés avec la puissance des embeddings vectoriels
        </p>
      </header>

      <div className="mb-8">
        <SearchBar onResultsFound={handleSearchResults} />
      </div>

      {message && (
        <div 
          className={`mb-4 p-3 rounded ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {!isAddingDoc ? (
        <div className="flex justify-center mb-8">
          <Button
            onClick={() => setIsAddingDoc(true)}
            className="flex items-center gap-2"
          >
            <Upload size={16} /> Ajouter un document
          </Button>
        </div>
      ) : (
        <div className="max-w-xl mx-auto mb-8 p-6 bg-white rounded-lg shadow-sm border border-neutral-200">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <Database className="mr-2 h-5 w-5" /> Ajouter un document
          </h2>
          
          <form onSubmit={handleAddDocument}>
            <div className="mb-4">
              <label htmlFor="docId" className="block text-sm font-medium mb-1">
                ID du document
              </label>
              <input
                type="text"
                id="docId"
                value={docId}
                onChange={(e) => setDocId(e.target.value)}
                className="w-full p-2 border border-neutral-300 rounded"
                placeholder="ex: doc123"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="docText" className="block text-sm font-medium mb-1">
                Contenu du document
              </label>
              <textarea
                id="docText"
                value={docText}
                onChange={(e) => setDocText(e.target.value)}
                className="w-full p-2 border border-neutral-300 rounded h-32"
                placeholder="Entrez le contenu textuel à indexer..."
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddingDoc(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Ajout en cours...' : 'Ajouter le document'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {results && <SearchResults results={results} />}

      <div className="mt-12 text-center text-sm text-neutral-500">
        <p>Recherche vectorielle propulsée par ChromaDB + Sentence Transformers</p>
        <p className="flex items-center justify-center mt-1">
          <Search className="h-3 w-3 mr-1" /> Interface de recherche RAG
        </p>
      </div>
    </div>
  );
};

export default SearchPage;
