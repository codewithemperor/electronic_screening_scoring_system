"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CandidateSidebarLayout } from '@/components/candidate/sidebar';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  FileText,
  Award,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api-client';

interface TestResult {
  id: string;
  title: string;
  department: string;
  score: number;
  totalMarks: number;
  percentage: number;
  status: string;
  date: string;
  duration: number;
}

interface AdmissionInfo {
  utmeScore: number;
  olevelAggregate: number;
  finalScore?: number;
  admissionStatus: string;
  departmentCutoff: {
    utme: number;
    olevel: number;
    final: number;
  };
}

export default function CandidateResultsPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [admissionInfo, setAdmissionInfo] = useState<AdmissionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      
      // Fetch candidate profile data
      const profileResponse = await api.get('/api/candidate/profile');
      if (!profileResponse.ok) throw new Error('Failed to fetch profile');
      const profileData = await profileResponse.json();
      
      // Fetch admission recommendation
      const admissionResponse = await api.post('/api/candidate/admission-recommendation', {});
      if (!admissionResponse.ok) throw new Error('Failed to fetch admission data');
      const admissionData = await admissionResponse.json();
      
      // Transform test attempts to results format
      const testResults: TestResult[] = profileData.testAttempts
        .filter((attempt: any) => attempt.status === 'COMPLETED' || attempt.status === 'SUBMITTED')
        .map((attempt: any) => ({
          id: attempt.id,
          title: attempt.examination.title,
          department: attempt.examination.department?.name || 'Unknown Department',
          score: attempt.score || 0,
          totalMarks: attempt.totalMarks || 100,
          percentage: attempt.score ? Math.round((attempt.score / attempt.totalMarks) * 100) : 0,
          status: attempt.status,
          date: attempt.startTime,
          duration: 60 // default duration
        }));

      // Set admission info
      const currentDeptRecommendation = admissionData.recommendations.find((r: any) => r.isCurrentDepartment);
      setAdmissionInfo({
        utmeScore: profileData.utmeScore,
        olevelAggregate: profileData.olevelAggregate,
        finalScore: currentDeptRecommendation?.scores.finalScore,
        admissionStatus: profileData.admissionStatus,
        departmentCutoff: {
          utme: currentDeptRecommendation?.requirements.utmeCutoff || 250,
          olevel: currentDeptRecommendation?.requirements.olevelCutoff || 25,
          final: currentDeptRecommendation?.requirements.finalCutoff || 55
        }
      });

      setTestResults(testResults);
    } catch (error) {
      console.error('Error fetching results:', error);
      // Set default values on error
      setTestResults([]);
      setAdmissionInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const getAdmissionStatusColor = (status: string) => {
    switch (status) {
      case 'ADMITTED': return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAdmissionStatusText = (status: string) => {
    switch (status) {
      case 'ADMITTED': return 'Admitted';
      case 'IN_PROGRESS': return 'Under Review';
      case 'REJECTED': return 'Not Admitted';
      default: return 'Not Started';
    }
  };

  const getTestStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'PENDING': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <CandidateSidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="electric-spinner"></div>
        </div>
      </CandidateSidebarLayout>
    );
  }

  return (
    <CandidateSidebarLayout>
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Test Results & Admission Status</h1>
          <p className="text-gray-600">View your test performance and admission progress</p>
        </div>

        {/* Admission Status Card */}
        {admissionInfo && (
          <Card className="electric-border mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-5 w-5" />
                Admission Status
              </CardTitle>
              <CardDescription>Your current admission progress and requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Status */}
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">Current Status</span>
                <Badge className={getAdmissionStatusColor(admissionInfo.admissionStatus)}>
                  {getAdmissionStatusText(admissionInfo.admissionStatus)}
                </Badge>
              </div>

              {/* Requirements Check */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">UTME Score</span>
                    <div className="flex items-center space-x-2">
                      {admissionInfo.utmeScore >= admissionInfo.departmentCutoff.utme ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm">{admissionInfo.utmeScore}/{admissionInfo.departmentCutoff.utme}</span>
                    </div>
                  </div>
                  <Progress 
                    value={Math.min((admissionInfo.utmeScore / 400) * 100, 100)} 
                    className="h-2" 
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">O'Level Score</span>
                    <div className="flex items-center space-x-2">
                      {admissionInfo.olevelAggregate >= admissionInfo.departmentCutoff.olevel ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm">{admissionInfo.olevelAggregate}/{admissionInfo.departmentCutoff.olevel}</span>
                    </div>
                  </div>
                  <Progress 
                    value={Math.min((admissionInfo.olevelAggregate / 45) * 100, 100)} 
                    className="h-2" 
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Final Score</span>
                    <div className="flex items-center space-x-2">
                      {admissionInfo.finalScore && admissionInfo.finalScore >= admissionInfo.departmentCutoff.final ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm">{admissionInfo.finalScore}%/{admissionInfo.departmentCutoff.final}%</span>
                    </div>
                  </div>
                  <Progress 
                    value={admissionInfo.finalScore ? Math.min(admissionInfo.finalScore, 100) : 0} 
                    className="h-2" 
                  />
                </div>
              </div>

              {/* Status Message */}
              {admissionInfo.admissionStatus === 'ADMITTED' && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Congratulations! You have been admitted to the program.
                  </AlertDescription>
                </Alert>
              )}

              {admissionInfo.admissionStatus === 'IN_PROGRESS' && (
                <Alert className="border-blue-200 bg-blue-50">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Your application is under review. Please complete all requirements.
                  </AlertDescription>
                </Alert>
              )}

              {admissionInfo.admissionStatus === 'REJECTED' && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    Unfortunately, your application was not successful. Please contact admissions for more information.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Test Results */}
        <Card className="electric-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Test Results
            </CardTitle>
            <CardDescription>Your examination performance</CardDescription>
          </CardHeader>
          <CardContent>
            {testResults.length > 0 ? (
              <div className="space-y-4">
                {testResults.map((result) => (
                  <div key={result.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium">{result.title}</h4>
                          <Badge className={getTestStatusColor(result.status)}>
                            {result.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{result.department}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Score:</span>
                            <div className="font-medium">{result.score}/{result.totalMarks}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Percentage:</span>
                            <div className="font-medium">{result.percentage}%</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Duration:</span>
                            <div className="font-medium">{result.duration} min</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Date:</span>
                            <div className="font-medium">{new Date(result.date).toLocaleDateString()}</div>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Performance</span>
                            <span>{result.percentage}%</span>
                          </div>
                          <Progress value={result.percentage} className="h-2" />
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        {result.status === 'COMPLETED' && (
                          <Button size="sm" variant="outline">
                            <FileText className="h-4 w-4 mr-2" />
                            Details
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Test Results</h3>
                <p className="text-gray-600 mb-4">You haven't completed any tests yet.</p>
                <Button asChild>
                  <Link href="/candidate/dashboard">
                    Back to Dashboard
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </CandidateSidebarLayout>
  );
}