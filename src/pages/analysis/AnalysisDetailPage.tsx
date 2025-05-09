import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, Copy, Download, ThumbsUp, ThumbsDown, MinusCircle, Trash } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import useAnalysisStore from '../../store/analysis-store';
import { formatDate, downloadAsFile } from '../../utils';

const AnalysisDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { getAnalysisById, currentRequest, currentResult, isLoading, deleteAnalysis } = useAnalysisStore();
  const [selectedPoints, setSelectedPoints] = useState<string[]>([]);
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    if (id) {
      getAnalysisById(id);
    }
  }, [id, getAnalysisById]);
  
  if (isLoading) {
    return (
      <div className="animate-pulse-slow flex flex-col space-y-4">
        <div className="h-8 w-64 bg-neutral-200 rounded"></div>
        <div className="h-64 bg-neutral-200 rounded"></div>
      </div>
    );
  }
  
  if (!currentRequest || !currentResult) {
    return (
      <div className="text-center py-12">
        <Search className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-neutral-900 mb-2">Analyse non trouvée</h3>
        <p className="text-neutral-500 mb-6">L'analyse que vous recherchez n'existe pas ou a été supprimée.</p>
        <Button as={Link} to="/analysis">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux analyses
        </Button>
      </div>
    );
  }
  
  const togglePointSelection = (pointId: string) => {
    setSelectedPoints(prev => 
      prev.includes(pointId)
        ? prev.filter(id => id !== pointId)
        : [...prev, pointId]
    );
  };
  
  const handleCopyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [id]: true });
    setTimeout(() => {
      setCopied({ ...copied, [id]: false });
    }, 2000);
  };
  
  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette analyse ? Cette action est irréversible.')) {
      await deleteAnalysis(currentRequest.id);
      navigate('/analysis');
    }
  };
  
  const handleExport = () => {
    const exportData = {
      id: currentRequest.id,
      content: currentRequest.content,
      contentType: currentRequest.contentType,
      source: currentRequest.source,
      createdAt: currentRequest.createdAt,
      analysis: {
        summary: currentResult.summary,
        keyPoints: currentResult.keyPoints,
        arguments: currentResult.arguments,
        criticisms: currentResult.criticisms,
      },
    };
    
    downloadAsFile(
      JSON.stringify(exportData, null, 2),
      `analyse-${currentRequest.id}.json`,
      'application/json'
    );
  };
  
  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return <ThumbsUp className="h-4 w-4 text-success" />;
      case 'negative':
        return <ThumbsDown className="h-4 w-4 text-error" />;
      default:
        return <MinusCircle className="h-4 w-4 text-neutral-400" />;
    }
  };
  
  const contentTypeLabels: Record<string, string> = {
    article: 'Article',
    social_media: 'Réseaux sociaux',
    criticism: 'Critique',
    question: 'Question',
    other: 'Autre',
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/analysis')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="h1">Détails de l'analyse</h1>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDelete}
            className="text-error hover:bg-error/10"
          >
            <Trash className="h-4 w-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle>Contenu analysé</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Badge>{contentTypeLabels[currentRequest.contentType] || 'Autre'}</Badge>
                <span className="text-sm text-neutral-500">
                  {formatDate(currentRequest.createdAt, 'dd MMMM yyyy HH:mm')}
                </span>
              </div>
              
              <div className="bg-neutral-50 rounded-md p-4 whitespace-pre-wrap">
                {currentRequest.content}
              </div>
              
              {currentRequest.source && (
                <p className="text-sm text-neutral-500 mt-4">
                  Source: {currentRequest.source}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-7">
          <div className="space-y-6">
            {/* Résumé de l'analyse */}
            <div className="mb-6">
              <h2 className="h2 mb-2">Résumé de l'analyse</h2>
              <p className="text-neutral-700 whitespace-pre-wrap">
                {currentResult.summary || 'Aucun résumé disponible.'}
              </p>
            </div>

            {/* Points Positifs */}
            {currentResult.positivePoints && currentResult.positivePoints.length > 0 && (
              <div className="mb-6">
                <h2 className="h2 mb-2">Points Positifs Clés</h2>
                <ul className="list-disc list-inside space-y-1 text-neutral-700">
                  {currentResult.positivePoints.map((point, index) => (
                    <li key={`positive-${index}`}>{point}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Points Négatifs */}
            {currentResult.negativePoints && currentResult.negativePoints.length > 0 && (
              <div className="mb-6">
                <h2 className="h2 mb-2">Points Négatifs Clés</h2>
                <ul className="list-disc list-inside space-y-1 text-neutral-700">
                  {currentResult.negativePoints.map((point, index) => (
                    <li key={`negative-${index}`}>{point}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Propositions de Réponses */}
            {currentResult.suggestedResponses && currentResult.suggestedResponses.length > 0 && (
              <div className="mb-6">
                <h2 className="h2 mb-2">Propositions de Réponses</h2>
                <ul className="list-decimal list-inside space-y-1 text-neutral-700">
                  {currentResult.suggestedResponses.map((response, index) => (
                    <li key={`response-${index}`}>{response}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Points clés identifiés */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Points clés identifiés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentResult.keyPoints.map(point => (
                    <div 
                      key={point.id}
                      className={`p-3 rounded-md border flex items-start gap-3 ${
                        selectedPoints.includes(point.id)
                          ? 'bg-primary/10 border-primary'
                          : 'bg-white border-neutral-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPoints.includes(point.id)}
                        onChange={() => togglePointSelection(point.id)}
                        className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 mb-1">
                            {getSentimentIcon(point.sentiment)}
                            {point.category && (
                              <Badge variant="outline" className="text-xs">
                                {point.category}
                              </Badge>
                            )}
                          </div>
                          <button
                            onClick={() => handleCopyToClipboard(point.content, point.id)}
                            className="text-neutral-400 hover:text-neutral-600"
                          >
                            {copied[point.id] ? (
                              <Check className="h-4 w-4 text-success" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <p className="text-sm text-neutral-700">{point.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Arguments identifiés */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Arguments identifiés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentResult.arguments.map(point => (
                    <div 
                      key={point.id}
                      className={`p-3 rounded-md border flex items-start gap-3 ${
                        selectedPoints.includes(point.id)
                          ? 'bg-primary/10 border-primary'
                          : 'bg-white border-neutral-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPoints.includes(point.id)}
                        onChange={() => togglePointSelection(point.id)}
                        className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 mb-1">
                            {getSentimentIcon(point.sentiment)}
                            {point.category && (
                              <Badge variant="outline" className="text-xs">
                                {point.category}
                              </Badge>
                            )}
                          </div>
                          <button
                            onClick={() => handleCopyToClipboard(point.content, point.id)}
                            className="text-neutral-400 hover:text-neutral-600"
                          >
                            {copied[point.id] ? (
                              <Check className="h-4 w-4 text-success" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <p className="text-sm text-neutral-700">{point.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Critiques identifiées */}
            {currentResult.criticisms && currentResult.criticisms.length > 0 && (
              <div className="mb-6">
                <h2 className="h2 mb-2">Critiques identifiées</h2>
                <ul className="list-disc list-inside space-y-1 text-neutral-700">
                  {currentResult.criticisms.map((criticism) => (
                    <li key={criticism.id}>{criticism.content}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <CardFooter className="flex justify-end px-0">
              {selectedPoints.length === 0 ? (
                <Button
                  disabled
                  className="bg-primary hover:bg-primary-dark text-white"
                  title="Veuillez sélectionner au moins un point clé, argument ou critique."
                >
                  Générer des éléments de langage
                </Button>
              ) : (
                <Button
                  asChild
                  className="bg-primary hover:bg-primary-dark text-white"
                >
                  <Link
                    to={`/responses/new?analysisId=${id}&points=${selectedPoints.join(',')}`}
                  >
                    Générer des éléments de langage ({selectedPoints.length})
                  </Link>
                </Button>
              )}
            </CardFooter>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDetailPage;