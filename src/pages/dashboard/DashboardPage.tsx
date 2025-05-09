import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText, BarChart2, TrendingUp, MessageSquare, Clock, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import useAnalysisStore from '../../store/analysis-store';
import useResponseStore from '../../store/response-store';
import { formatRelativeTime, truncateText } from '../../utils';

const DashboardPage: React.FC = () => {
  const { requests: analyses, getAllAnalyses } = useAnalysisStore();
  const { responses, getAllResponses } = useResponseStore();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([getAllAnalyses(), getAllResponses()]);
      setIsLoading(false);
    };
    
    loadData();
  }, [getAllAnalyses, getAllResponses]);
  
  // Take only the 5 most recent items
  const recentAnalyses = [...analyses].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const recentResponses = [...responses].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="h1">Tableau de bord</h1>
        <div className="flex gap-3">
          <Button as={Link} to="/analysis/new">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle analyse
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full p-3 bg-primary-light/20">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-500">Analyses</p>
                <h3 className="text-2xl font-bold text-neutral-900">{analyses.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full p-3 bg-secondary-light/20">
                <MessageSquare className="h-6 w-6 text-secondary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-500">Réponses</p>
                <h3 className="text-2xl font-bold text-neutral-900">{responses.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full p-3 bg-accent-light/20">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-500">Taux de réponse</p>
                <h3 className="text-2xl font-bold text-neutral-900">
                  {analyses.length > 0 ? `${Math.round((responses.length / analyses.length) * 100)}%` : '0%'}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full p-3 bg-success/20">
                <BarChart2 className="h-6 w-6 text-success" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-500">Activité</p>
                <h3 className="text-2xl font-bold text-neutral-900">
                  {isLoading ? '...' : analyses.length + responses.length}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6 mt-6 lg:grid-cols-2">
        <Card className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="mr-2 h-5 w-5" />
              Analyses récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="h-12 bg-neutral-100 animate-pulse-slow rounded"></div>
                ))}
              </div>
            ) : recentAnalyses.length > 0 ? (
              <div className="space-y-4">
                {recentAnalyses.map((analysis) => (
                  <Link 
                    key={analysis.id} 
                    to={`/analysis/${analysis.id}`}
                    className="block"
                  >
                    <div className="flex items-center border-b border-neutral-100 pb-4">
                      <div className="rounded-full p-2 mr-3 bg-primary-light/20">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 truncate">
                          {truncateText(analysis.content, 50)}
                        </p>
                        <div className="flex items-center mt-1">
                          <Clock className="h-3 w-3 text-neutral-400 mr-1" />
                          <p className="text-xs text-neutral-500">
                            {formatRelativeTime(analysis.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 text-sm">Aucune analyse récente.</p>
            )}
            
            {recentAnalyses.length > 0 && (
              <div className="mt-4 text-center">
                <Button variant="ghost" as={Link} to="/analysis">
                  Voir toutes les analyses
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              Réponses récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="h-12 bg-neutral-100 animate-pulse-slow rounded"></div>
                ))}
              </div>
            ) : recentResponses.length > 0 ? (
              <div className="space-y-4">
                {recentResponses.map((response) => (
                  <Link 
                    key={response.id} 
                    to={`/responses/${response.id}`}
                    className="block"
                  >
                    <div className="flex items-center border-b border-neutral-100 pb-4">
                      <div className="rounded-full p-2 mr-3 bg-secondary-light/20">
                        <MessageSquare className="h-4 w-4 text-secondary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 truncate">
                          {truncateText(response.content, 50)}
                        </p>
                        <div className="flex items-center mt-1">
                          <Clock className="h-3 w-3 text-neutral-400 mr-1" />
                          <p className="text-xs text-neutral-500">
                            {formatRelativeTime(response.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 text-sm">Aucune réponse récente.</p>
            )}
            
            {recentResponses.length > 0 && (
              <div className="mt-4 text-center">
                <Button variant="ghost" as={Link} to="/responses">
                  Voir toutes les réponses
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;