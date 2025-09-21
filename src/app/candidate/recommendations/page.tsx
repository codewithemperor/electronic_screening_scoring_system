"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CandidateSidebarLayout } from '@/components/candidate/sidebar';
import { 
  ArrowLeft, 
  TrendingUp, 
  Target, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Star,
  Award,
  Building2,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';

interface Recommendation {
  department: {
    id: string;
    name: string;
    code: string;
    description?: string;
  };
  scores: {
    finalScore: number;
    examPercentage: number;
    olevelPercentage: number;
  };
  requirements: {
    utmeCutoff: number;
    olevelCutoff: number;
    finalCutoff: number;
    meetsUtmeCutoff: boolean;
    meetsOlevelCutoff: boolean;
    meetsFinalCutoff: boolean;
  };
  eligibility: 'NOT_ELIGIBLE' | 'MAYBE_ELIGIBLE' | 'ELIGIBLE' | 'HIGHLY_RECOMMENDED';
  recommendation: string;
  priority: number;
  isCurrentDepartment: boolean;
}

interface RecommendationsResponse {
  currentDepartment: string;
  currentStatus: string;
  recommendations: Recommendation[];
  bestRecommendation?: Recommendation;
  summary: {
    totalDepartments: number;
    eligibleDepartments: number;
    highlyRecommended: number;
  };
}

export default function CandidateRecommendationsPage() {
  const [recommendations, setRecommendations] = useState<RecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/candidate/admission-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId: 'current' }) // This should be dynamic in real app
      });

      if (!response.ok) throw new Error('Failed to fetch recommendations');
      
      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      setError(err.message);
      console.error('Recommendations fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getEligibilityColor = (eligibility: string) => {
    switch (eligibility) {
      case 'HIGHLY_RECOMMENDED': return 'bg-green-100 text-green-800 border-green-200';
      case 'ELIGIBLE': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'MAYBE_ELIGIBLE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'NOT_ELIGIBLE': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEligibilityIcon = (eligibility: string) => {
    switch (eligibility) {
      case 'HIGHLY_RECOMMENDED': return <Star className="h-4 w-4" />;
      case 'ELIGIBLE': return <CheckCircle className="h-4 w-4" />;
      case 'MAYBE_ELIGIBLE': return <Clock className="h-4 w-4" />;
      case 'NOT_ELIGIBLE': return <AlertCircle className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="electric-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6">
          <h2 className="text-2xl font-bold text-destructive mb-4">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchRecommendations} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!recommendations) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Recommendations Available</h2>
          <Button asChild>
            <Link href="/candidate/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/candidate/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Admission Recommendations</h1>
                <p className="text-muted-foreground">
                  Current Department: {recommendations.currentDepartment}
                </p>
              </div>
              <Badge variant="outline" className="text-sm">
                {recommendations.currentStatus.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Summary */}
        <Card className="electric-border mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Recommendation Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{recommendations.summary.totalDepartments}</p>
                <p className="text-sm text-muted-foreground">Total Departments</p>
              </div>
              
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{recommendations.summary.eligibleDepartments}</p>
                <p className="text-sm text-muted-foreground">Eligible Departments</p>
              </div>
              
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{recommendations.summary.highlyRecommended}</p>
                <p className="text-sm text-muted-foreground">Highly Recommended</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Best Recommendation */}
        {recommendations.bestRecommendation && (
          <Card className="electric-border mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center text-green-800">
                <Star className="mr-2 h-5 w-5" />
                Best Recommendation
              </CardTitle>
              <CardDescription className="text-green-700">
                Based on your academic performance, this department is the best fit for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {recommendations.bestRecommendation.department.name}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {recommendations.bestRecommendation.department.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Final Score:</span>
                      <span className="font-medium">{recommendations.bestRecommendation.scores.finalScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Exam Performance:</span>
                      <span className="font-medium">{recommendations.bestRecommendation.scores.examPercentage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">O'Level Performance:</span>
                      <span className="font-medium">{recommendations.bestRecommendation.scores.olevelPercentage}%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Requirements Met</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">UTME Cutoff ({recommendations.bestRecommendation.requirements.utmeCutoff})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">O'Level Cutoff ({recommendations.bestRecommendation.requirements.olevelCutoff})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Final Cutoff ({recommendations.bestRecommendation.requirements.finalCutoff})</span>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4 electric-glow">
                    Apply for This Department
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Recommendations */}
        <div>
          <h2 className="text-2xl font-bold mb-6">All Department Recommendations</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recommendations.recommendations
              .sort((a, b) => a.priority - b.priority)
              .map((rec, index) => (
                <Card 
                  key={rec.department.id} 
                  className={`electric-border ${rec.isCurrentDepartment ? 'ring-2 ring-primary' : ''}`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-5 w-5" />
                        <CardTitle className="text-lg">{rec.department.name}</CardTitle>
                        {rec.isCurrentDepartment && (
                          <Badge variant="default">Current</Badge>
                        )}
                      </div>
                      <Badge className={getEligibilityColor(rec.eligibility)}>
                        {getEligibilityIcon(rec.eligibility)}
                        {rec.eligibility.replace('_', ' ')}
                      </Badge>
                    </div>
                    <CardDescription>{rec.department.code}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {rec.department.description && (
                      <p className="text-sm text-muted-foreground">{rec.department.description}</p>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Final Score:</span>
                        <span className="font-medium">{rec.scores.finalScore}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Exam Performance:</span>
                        <span className="font-medium">{rec.scores.examPercentage}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">O'Level Performance:</span>
                        <span className="font-medium">{rec.scores.olevelPercentage}%</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">Requirements Status</h4>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span>UTME Cutoff ({rec.requirements.utmeCutoff}):</span>
                          {rec.requirements.meetsUtmeCutoff ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : (
                            <AlertCircle className="h-3 w-3 text-red-600" />
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span>O'Level Cutoff ({rec.requirements.olevelCutoff}):</span>
                          {rec.requirements.meetsOlevelCutoff ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : (
                            <AlertCircle className="h-3 w-3 text-red-600" />
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span>Final Cutoff ({rec.requirements.finalCutoff}):</span>
                          {rec.requirements.meetsFinalCutoff ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : (
                            <AlertCircle className="h-3 w-3 text-red-600" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <p className="text-sm text-muted-foreground italic">
                        {rec.recommendation}
                      </p>
                    </div>

                    {rec.eligibility !== 'NOT_ELIGIBLE' && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        disabled={rec.isCurrentDepartment}
                      >
                        {rec.isCurrentDepartment ? 'Current Department' : 'View Details'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        {/* Info Alert */}
        <Alert className="mt-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            These recommendations are based on your current academic performance and department requirements. 
            Final admission decisions are subject to the institution's policies and available spaces.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}