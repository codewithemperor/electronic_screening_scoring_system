"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AdminSidebarLayout } from '@/components/admin/sidebar';
import { 
  ArrowLeft, 
  Edit, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  User,
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Target,
  BookOpen,
  Award,
  TrendingUp,
  Eye,
  Settings,
  Download,
  FileText,
  GraduationCap,
  Building2
} from 'lucide-react';
import Link from 'next/link';

interface Candidate {
  id: string;
  fullName: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  utmeScore: number;
  olevelAggregate: number;
  olevelPercentage?: number;
  examPercentage?: number;
  finalScore?: number;
  admissionStatus: 'NOT_ADMITTED' | 'IN_PROGRESS' | 'ADMITTED' | 'REJECTED';
  user: {
    id: string;
    email: string;
  };
  department: {
    id: string;
    name: string;
    code: string;
    utmeCutoffMark: number;
    olevelCutoffAggregate: number;
    finalCutoffMark: number;
  };
  state: {
    id: string;
    name: string;
  };
  lga: {
    id: string;
    name: string;
  };
  oLevelResults: Array<{
    id: string;
    subject: {
      id: string;
      name: string;
      code: string;
    };
    grade: string;
    gradingRule: {
      grade: string;
      marks: number;
    };
    schoolName: string;
    examYear: number;
    examType: string;
    regNumber: string;
  }>;
  testAttempts: Array<{
    id: string;
    examination: {
      id: string;
      title: string;
      duration: number;
      totalMarks: number;
      passingMarks: number;
      department: {
        name: string;
      };
    };
    status: string;
    score?: number;
    totalMarks: number;
    startTime: string;
    endTime?: string;
    testAnswers: Array<{
      question: {
        id: string;
        content: string;
        options: string[];
        correctAnswer: number;
        marks: number;
      };
      selectedAnswer?: number;
      isCorrect?: boolean;
      marksObtained?: number;
    }>;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function CandidateDetailPage({ params }: { params: { id: string } }) {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCandidate();
  }, [params.id]);

  const fetchCandidate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/candidates/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch candidate');

      const data = await response.json();
      setCandidate(data);
    } catch (err) {
      setError(err.message);
      console.error('Candidate fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdmissionDecision = async (decision: 'ADMITTED' | 'REJECTED') => {
    if (!candidate) return;

    try {
      const response = await fetch('/api/admin/candidates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: candidate.id,
          admissionStatus: decision
        })
      });

      if (!response.ok) throw new Error(`Failed to ${decision.toLowerCase()} candidate`);

      await fetchCandidate();
    } catch (err) {
      setError(err.message);
      console.error('Admission decision error:', err);
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

  const getAdmissionStatusIcon = (status: string) => {
    switch (status) {
      case 'ADMITTED': return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED': return <XCircle className="h-4 w-4" />;
      case 'IN_PROGRESS': return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getTestStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': case 'SUBMITTED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getEligibilityStatus = () => {
    if (!candidate) return 'UNKNOWN';
    
    const meetsUtme = candidate.utmeScore >= candidate.department.utmeCutoffMark;
    const meetsOlevel = candidate.olevelAggregate >= candidate.department.olevelCutoffAggregate;
    const meetsFinal = candidate.finalScore !== undefined && candidate.finalScore >= candidate.department.finalCutoffMark;
    
    if (meetsUtme && meetsOlevel && meetsFinal) return 'ELIGIBLE';
    if (meetsUtme && meetsOlevel) return 'MAYBE_ELIGIBLE';
    return 'NOT_ELIGIBLE';
  };

  const getEligibilityColor = (status: string) => {
    switch (status) {
      case 'ELIGIBLE': return 'bg-green-100 text-green-800 border-green-200';
      case 'MAYBE_ELIGIBLE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'NOT_ELIGIBLE': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
          <Button onClick={fetchCandidate} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Candidate Not Found</h2>
          <Button asChild>
            <Link href="/admin/candidates">Back to Candidates</Link>
          </Button>
        </div>
      </div>
    );
  }

  const eligibilityStatus = getEligibilityStatus();

  return (
    <AdminSidebarLayout>
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/candidates">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Candidates
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{candidate.fullName}</h1>
                <p className="text-gray-600">
                  Candidate ID: {candidate.id}
                </p>
              </div>
              <Badge className={getAdmissionStatusColor(candidate.admissionStatus)}>
                {getAdmissionStatusIcon(candidate.admissionStatus)}
                {candidate.admissionStatus.replace('_', ' ')}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              {candidate.admissionStatus === 'IN_PROGRESS' && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => handleAdmissionDecision('ADMITTED')}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Accept
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleAdmissionDecision('REJECTED')}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </>
              )}
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
            {/* Personal Information */}
            <Card className="electric-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium">{candidate.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{candidate.user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{candidate.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date of Birth</p>
                      <p className="font-medium">{new Date(candidate.dateOfBirth).toLocaleDateString()} ({calculateAge(candidate.dateOfBirth)} years)</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">{candidate.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">State</p>
                      <p className="font-medium">{candidate.state.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">LGA</p>
                      <p className="font-medium">{candidate.lga.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Registration Date</p>
                      <p className="font-medium">{new Date(candidate.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Performance */}
            <Card className="electric-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5" />
                  Academic Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">UTME Score</p>
                    <p className="text-2xl font-bold text-primary">{candidate.utmeScore}</p>
                    <p className="text-xs text-muted-foreground">
                      Dept: {candidate.department.utmeCutoffMark}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">O'Level Aggregate</p>
                    <p className="text-2xl font-bold text-primary">{candidate.olevelAggregate}</p>
                    <p className="text-xs text-muted-foreground">
                      Dept: {candidate.department.olevelCutoffAggregate}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Final Score</p>
                    <p className="text-2xl font-bold text-primary">{candidate.finalScore || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">
                      Dept: {candidate.department.finalCutoffMark}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Eligibility</p>
                    <Badge className={getEligibilityColor(eligibilityStatus)}>
                      {eligibilityStatus.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                {candidate.olevelPercentage !== undefined && candidate.examPercentage !== undefined && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Score Breakdown</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Exam Performance ({candidate.department.examPercentage || 70}%)</span>
                          <span>{candidate.examPercentage}%</span>
                        </div>
                        <Progress value={candidate.examPercentage} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>O'Level Performance ({candidate.department.olevelPercentage || 30}%)</span>
                          <span>{candidate.olevelPercentage}%</span>
                        </div>
                        <Progress value={candidate.olevelPercentage} className="h-2" />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* O'Level Results */}
            {candidate.oLevelResults.length > 0 && (
              <Card className="electric-border">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="mr-2 h-5 w-5" />
                    O'Level Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {candidate.oLevelResults.map((result) => (
                        <div key={result.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium">{result.subject.name}</h5>
                            <Badge variant="outline">{result.grade}</Badge>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p>School: {result.schoolName}</p>
                            <p>Year: {result.examYear} ({result.examType})</p>
                            <p>Reg: {result.regNumber}</p>
                            <p>Marks: {result.gradingRule.marks}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Test Attempts */}
            {candidate.testAttempts.length > 0 && (
              <Card className="electric-border">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="mr-2 h-5 w-5" />
                    Test Attempts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {candidate.testAttempts.map((attempt) => (
                      <div key={attempt.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h5 className="font-medium">{attempt.examination.title}</h5>
                            <p className="text-sm text-muted-foreground">{attempt.examination.department.name}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getTestStatusColor(attempt.status)}>
                              {attempt.status.replace('_', ' ')}
                            </Badge>
                            {attempt.score !== undefined && (
                              <span className="font-medium">
                                {attempt.score}/{attempt.totalMarks} ({Math.round((attempt.score / attempt.totalMarks) * 100)}%)
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                          <div>
                            <p>Duration: {attempt.examination.duration} minutes</p>
                            <p>Passing Marks: {attempt.examination.passingMarks}</p>
                          </div>
                          <div>
                            <p>Started: {new Date(attempt.startTime).toLocaleString()}</p>
                            {attempt.endTime && (
                              <p>Ended: {new Date(attempt.endTime).toLocaleString()}</p>
                            )}
                          </div>
                        </div>

                        {attempt.testAnswers.length > 0 && (
                          <div>
                            <h6 className="font-medium mb-2">Answer Summary</h6>
                            <div className="space-y-1">
                              {attempt.testAnswers.slice(0, 3).map((answer, index) => (
                                <div key={index} className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded">
                                  <span className="truncate flex-1">
                                    Q{index + 1}: {answer.question.content.substring(0, 60)}...
                                  </span>
                                  <div className="flex items-center space-x-2">
                                    {answer.selectedAnswer !== undefined && (
                                      <span className="text-xs">
                                        Selected: {String.fromCharCode(65 + answer.selectedAnswer)}
                                      </span>
                                    )}
                                    {answer.isCorrect !== undefined && (
                                      <span className={`text-xs ${answer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                        {answer.isCorrect ? 'Correct' : 'Incorrect'}
                                      </span>
                                    )}
                                    {answer.marksObtained !== undefined && (
                                      <span className="text-xs font-medium">
                                        {answer.marksObtained}/{answer.question.marks}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                              {attempt.testAnswers.length > 3 && (
                                <p className="text-sm text-muted-foreground">
                                  +{attempt.testAnswers.length - 3} more answers
                                </p>
                              )}
                            </div>
                          </div>
                        )}
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
                  <Link href={`/admin/departments/${candidate.department.id}`}>
                    <Building2 className="mr-2 h-4 w-4" />
                    View Department
                  </Link>
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <Link href={`/admin/candidates`}>
                    <Users className="mr-2 h-4 w-4" />
                    All Candidates
                  </Link>
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <Link href={`/admin/examinations?department=${candidate.department.id}`}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Department Exams
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Department Information */}
            <Card className="electric-border">
              <CardHeader>
                <CardTitle className="text-lg">Department Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Department</span>
                  <Badge variant="outline">{candidate.department.name}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">UTME Cutoff</span>
                  <span className="font-medium">{candidate.department.utmeCutoffMark}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">O'Level Cutoff</span>
                  <span className="font-medium">{candidate.department.olevelCutoffAggregate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Final Cutoff</span>
                  <span className="font-medium">{candidate.department.finalCutoffMark}</span>
                </div>
              </CardContent>
            </Card>

            {/* Admission Status */}
            <Card className="electric-border">
              <CardHeader>
                <CardTitle className="text-lg">Admission Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Status</span>
                  <Badge className={getAdmissionStatusColor(candidate.admissionStatus)}>
                    {candidate.admissionStatus.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Eligibility</span>
                  <Badge className={getEligibilityColor(eligibilityStatus)}>
                    {eligibilityStatus.replace('_', ' ')}
                  </Badge>
                </div>
                {candidate.admissionStatus === 'IN_PROGRESS' && (
                  <div className="space-y-2 pt-2">
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => handleAdmissionDecision('ADMITTED')}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Accept Admission
                    </Button>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => handleAdmissionDecision('REJECTED')}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject Admission
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card className="electric-border">
              <CardHeader>
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Test Attempts</p>
                  <p className="text-2xl font-bold">{candidate.testAttempts.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">O'Level Subjects</p>
                  <p className="text-2xl font-bold">{candidate.oLevelResults.length}</p>
                </div>
                {candidate.testAttempts.length > 0 && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Average Score</p>
                    <p className="text-2xl font-bold">
                      {Math.round(
                        candidate.testAttempts
                          .filter(a => a.score !== undefined)
                          .reduce((sum, a) => sum + (a.score || 0), 0) / 
                        candidate.testAttempts.filter(a => a.score !== undefined).length
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminSidebarLayout>
  );
}