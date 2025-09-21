"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AdminSidebarLayout } from '@/components/admin/sidebar';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  BookOpen, 
  Clock, 
  Target,
  CheckCircle,
  AlertCircle,
  Settings,
  Eye,
  Users,
  Calendar,
  Timer,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

interface Examination {
  id: string;
  title: string;
  description?: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  isActive: boolean;
  department: {
    id: string;
    name: string;
    code: string;
  };
  examinationQuestions: Array<{
    question: {
      id: string;
      content: string;
      options: string[];
      correctAnswer: number;
      marks: number;
      subject: {
        id: string;
        name: string;
        code: string;
      };
    };
  }>;
  testAttempts: Array<{
    id: string;
    status: string;
    score?: number;
    totalMarks: number;
    startTime: string;
    endTime?: string;
    candidate: {
      id: string;
      fullName: string;
      utmeScore: number;
      admissionStatus: string;
    };
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function ExaminationDetailPage({ params }: { params: { id: string } }) {
  const [examination, setExamination] = useState<Examination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExamination();
  }, [params.id]);

  const fetchExamination = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/examinations/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch examination');

      const data = await response.json();
      setExamination(data);
    } catch (err) {
      setError(err.message);
      console.error('Examination fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExamination = async () => {
    if (!examination) return;
    
    if (!confirm('Are you sure you want to delete this examination? This will also remove all associated questions and test attempts. This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/examinations/${examination.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete examination');

      // Redirect to examinations list
      window.location.href = '/admin/examinations';
    } catch (err) {
      setError(err.message);
      console.error('Delete examination error:', err);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getTestStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': case 'SUBMITTED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAdmissionStatusColor = (status: string) => {
    switch (status) {
      case 'ADMITTED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <Button onClick={fetchExamination} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!examination) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Examination Not Found</h2>
          <Button asChild>
            <Link href="/admin/examinations">Back to Examinations</Link>
          </Button>
        </div>
      </div>
    );
  }

  const totalQuestionsMarks = examination.examinationQuestions.reduce((sum, eq) => sum + eq.question.marks, 0);
  const averageScore = examination.testAttempts.length > 0 
    ? examination.testAttempts
        .filter(attempt => attempt.score !== undefined)
        .reduce((sum, attempt) => sum + (attempt.score || 0), 0) / 
        examination.testAttempts.filter(attempt => attempt.score !== undefined).length
    : 0;

  return (
    <AdminSidebarLayout>
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/examinations">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Examinations
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{examination.title}</h1>
                <p className="text-gray-600">
                  ID: {examination.id}
                </p>
              </div>
              <Badge className={getStatusColor(examination.isActive)}>
                {examination.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/examinations/${examination.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDeleteExamination}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Examination Overview */}
            <Card className="electric-border">
              <CardHeader>
                <CardTitle>Examination Overview</CardTitle>
                <CardDescription>
                  Basic information and configuration details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {examination.description && (
                    <div>
                      <h3 className="font-medium mb-2">Description</h3>
                      <p className="text-muted-foreground">{examination.description}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{examination.duration} minutes</p>
                        <p className="text-sm text-muted-foreground">Duration</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Target className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{examination.totalMarks} marks</p>
                        <p className="text-sm text-muted-foreground">Total Marks</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{examination.passingMarks} marks</p>
                        <p className="text-sm text-muted-foreground">Passing Marks</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{examination.examinationQuestions.length} questions</p>
                        <p className="text-sm text-muted-foreground">Total Questions</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p className="font-medium">{examination.department.name}</p>
                      <p className="text-sm text-muted-foreground">{examination.department.code}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Question Marks</p>
                      <p className="font-medium">{totalQuestionsMarks} marks</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Questions */}
            <Card className="electric-border">
              <CardHeader>
                <CardTitle>Questions</CardTitle>
                <CardDescription>
                  List of questions included in this examination
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {examination.examinationQuestions.map((eq, index) => (
                    <div key={eq.question.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">Question {index + 1}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{eq.question.marks} mark{eq.question.marks > 1 ? 's' : ''}</Badge>
                          <Badge variant="secondary">{eq.question.subject.name}</Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm mb-3">{eq.question.content}</p>
                      
                      <div className="space-y-1">
                        {eq.question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center space-x-2 text-sm">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                              optIndex === eq.question.correctAnswer 
                                ? 'bg-green-100 text-green-800 border border-green-300' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <span className={optIndex === eq.question.correctAnswer ? 'font-medium text-green-800' : ''}>
                              {option}
                            </span>
                            {optIndex === eq.question.correctAnswer && (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Test Attempts */}
            {examination.testAttempts.length > 0 && (
              <Card className="electric-border">
                <CardHeader>
                  <CardTitle>Test Attempts</CardTitle>
                  <CardDescription>
                    Recent attempts by candidates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {examination.testAttempts.map((attempt) => (
                      <div key={attempt.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-medium">{attempt.candidate.fullName}</h4>
                            <Badge className={getTestStatusColor(attempt.status)}>
                              {attempt.status.replace('_', ' ')}
                            </Badge>
                            <Badge className={getAdmissionStatusColor(attempt.candidate.admissionStatus)}>
                              {attempt.candidate.admissionStatus.replace('_', ' ')}
                            </Badge>
                          </div>
                          {attempt.score !== undefined && (
                            <div className="text-right">
                              <p className="font-medium">{attempt.score}/{attempt.totalMarks}</p>
                              <p className="text-sm text-muted-foreground">
                                {Math.round((attempt.score / attempt.totalMarks) * 100)}%
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div>
                            <p>UTME Score: {attempt.candidate.utmeScore}</p>
                          </div>
                          <div>
                            <p>Started: {new Date(attempt.startTime).toLocaleString()}</p>
                          </div>
                          {attempt.endTime && (
                            <div>
                              <p>Ended: {new Date(attempt.endTime).toLocaleString()}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="electric-border">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline" asChild>
                  <Link href={`/admin/examinations/${examination.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Examination
                  </Link>
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <Link href={`/admin/departments/${examination.department.id}`}>
                    <Settings className="mr-2 h-4 w-4" />
                    Manage Department
                  </Link>
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <Link href={`/admin/questions?department=${examination.department.id}`}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    View Department Questions
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card className="electric-border">
              <CardHeader>
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Attempts</p>
                  <p className="text-2xl font-bold">{examination.testAttempts.length}</p>
                </div>
                
                {examination.testAttempts.length > 0 && (
                  <>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Average Score</p>
                      <p className="text-2xl font-bold">{Math.round(averageScore)}/{examination.totalMarks}</p>
                      <p className="text-sm text-muted-foreground">
                        {Math.round((averageScore / examination.totalMarks) * 100)}%
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Completed Attempts</p>
                      <p className="text-2xl font-bold">
                        {examination.testAttempts.filter(a => ['COMPLETED', 'SUBMITTED'].includes(a.status)).length}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Status Information */}
            <Card className="electric-border">
              <CardHeader>
                <CardTitle className="text-lg">Status Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Status</span>
                  <Badge className={getStatusColor(examination.isActive)}>
                    {examination.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm">
                    {new Date(examination.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Updated</span>
                  <span className="text-sm">
                    {new Date(examination.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminSidebarLayout>
  );
}