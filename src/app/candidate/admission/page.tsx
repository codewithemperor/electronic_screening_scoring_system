"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CandidateSidebarLayout } from '@/components/candidate/sidebar';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  FileText,
  User,
  BookOpen,
  Calendar,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api-client';

interface AdmissionStatus {
  status: 'ADMITTED' | 'IN_PROGRESS' | 'REJECTED' | 'NOT_ADMITTED';
  utmeScore: number;
  olevelAggregate: number;
  finalScore?: number;
  department: {
    name: string;
    code: string;
    utmeCutoff: number;
    olevelCutoff: number;
    finalCutoff: number;
  };
  testAttempts: Array<{
    id: string;
    title: string;
    score: number;
    totalMarks: number;
    status: string;
    completedAt: string;
  }>;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    address: string;
    state: string;
    lga: string;
  };
}

export default function CandidateAdmissionPage() {
  const [admissionStatus, setAdmissionStatus] = useState<AdmissionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmissionStatus();
  }, []);

  const fetchAdmissionStatus = async () => {
    try {
      setLoading(true);
      
      // Fetch candidate profile data
      const profileResponse = await api.get('/api/candidate/profile');
      if (!profileResponse.ok) throw new Error('Failed to fetch profile');
      const profileData = await profileResponse.json();
      
      // Fetch admission recommendation
      const admissionResponse = await api.post('/api/candidate/admission-recommendation');
      if (!admissionResponse.ok) throw new Error('Failed to fetch admission data');
      const admissionData = await admissionResponse.json();
      
      // Transform data to admission status format
      const admissionStatus: AdmissionStatus = {
        status: profileData.admissionStatus,
        utmeScore: profileData.utmeScore,
        olevelAggregate: profileData.olevelAggregate,
        finalScore: profileData.finalScore,
        department: {
          name: profileData.department.name,
          code: profileData.department.code,
          utmeCutoff: profileData.department.utmeCutoffMark || 250,
          olevelCutoff: profileData.department.olevelCutoffAggregate || 25,
          finalCutoff: profileData.department.finalCutoffMark || 55
        },
        testAttempts: profileData.testAttempts
          .filter((attempt: any) => attempt.status === 'COMPLETED' || attempt.status === 'SUBMITTED')
          .map((attempt: any) => ({
            id: attempt.id,
            title: attempt.examination.title,
            score: attempt.score || 0,
            totalMarks: attempt.totalMarks || 100,
            status: attempt.status,
            completedAt: attempt.endTime || attempt.startTime
          })),
        personalInfo: {
          fullName: profileData.fullName,
          email: profileData.email,
          phone: profileData.phone,
          dateOfBirth: profileData.dateOfBirth,
          address: profileData.address,
          state: profileData.state.name,
          lga: profileData.lga.name
        }
      };

      setAdmissionStatus(admissionStatus);
    } catch (error) {
      console.error('Error fetching admission status:', error);
      setAdmissionStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ADMITTED': return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ADMITTED': return 'Admitted';
      case 'IN_PROGRESS': return 'Under Review';
      case 'REJECTED': return 'Not Admitted';
      default: return 'Application Started';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ADMITTED': return <CheckCircle className="h-5 w-5" />;
      case 'IN_PROGRESS': return <Clock className="h-5 w-5" />;
      case 'REJECTED': return <AlertTriangle className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
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

  if (!admissionStatus) {
    return (
      <CandidateSidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Admission Information Not Found</h2>
            <Button asChild>
              <Link href="/candidate/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </CandidateSidebarLayout>
    );
  }

  return (
    <CandidateSidebarLayout>
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admission Status</h1>
          <p className="text-gray-600">Detailed information about your application and admission progress</p>
        </div>

        {/* Main Status Card */}
        <Card className="electric-border mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              {getStatusIcon(admissionStatus.status)}
              <span className="ml-2">Application Status</span>
            </CardTitle>
            <CardDescription>Current status of your admission application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">Current Status</span>
              <Badge className={getStatusColor(admissionStatus.status)}>
                {getStatusText(admissionStatus.status)}
              </Badge>
            </div>

            {/* Status-specific messages */}
            {admissionStatus.status === 'ADMITTED' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Congratulations!</strong> You have been successfully admitted to {admissionStatus.department.name}. 
                  Please check your email for further instructions on registration and orientation.
                </AlertDescription>
              </Alert>
            )}

            {admissionStatus.status === 'IN_PROGRESS' && (
              <Alert className="border-blue-200 bg-blue-50">
                <Clock className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Your application is currently under review. We have received all your documents and are evaluating your eligibility. 
                  You will be notified once a decision is made.
                </AlertDescription>
              </Alert>
            )}

            {admissionStatus.status === 'REJECTED' && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Unfortunately, your application was not successful. This could be due to not meeting the minimum requirements 
                  or exceeding the available slots. Please contact the admissions office for more information.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <Card className="electric-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Your submitted personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <div className="flex items-center mt-1">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{admissionStatus.personalInfo.fullName}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="flex items-center mt-1">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{admissionStatus.personalInfo.email}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <div className="flex items-center mt-1">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{admissionStatus.personalInfo.phone}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{new Date(admissionStatus.personalInfo.dateOfBirth).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Address</label>
                <div className="flex items-center mt-1">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                  <span>{admissionStatus.personalInfo.address}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">State</label>
                  <div className="mt-1">{admissionStatus.personalInfo.state}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">LGA</label>
                  <div className="mt-1">{admissionStatus.personalInfo.lga}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Requirements */}
          <Card className="electric-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-5 w-5" />
                Academic Requirements
              </CardTitle>
              <CardDescription>Department: {admissionStatus.department.name} ({admissionStatus.department.code})</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* UTME Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">UTME Score</span>
                  <div className="flex items-center space-x-2">
                    {admissionStatus.utmeScore >= admissionStatus.department.utmeCutoff ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm">{admissionStatus.utmeScore}/{admissionStatus.department.utmeCutoff}</span>
                  </div>
                </div>
                <Progress value={Math.min((admissionStatus.utmeScore / 400) * 100, 100)} className="h-2" />
              </div>

              {/* O'Level Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">O'Level Aggregate</span>
                  <div className="flex items-center space-x-2">
                    {admissionStatus.olevelAggregate >= admissionStatus.department.olevelCutoff ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm">{admissionStatus.olevelAggregate}/{admissionStatus.department.olevelCutoff}</span>
                  </div>
                </div>
                <Progress value={Math.min((admissionStatus.olevelAggregate / 45) * 100, 100)} className="h-2" />
              </div>

              {/* Final Score */}
              {admissionStatus.finalScore && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Final Score</span>
                    <div className="flex items-center space-x-2">
                      {admissionStatus.finalScore >= admissionStatus.department.finalCutoff ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm">{admissionStatus.finalScore}%/{admissionStatus.department.finalCutoff}%</span>
                    </div>
                  </div>
                  <Progress value={Math.min(admissionStatus.finalScore, 100)} className="h-2" />
                </div>
              )}

              {/* Test Attempts */}
              <div className="space-y-3">
                <span className="text-sm font-medium">Test Attempts</span>
                {admissionStatus.testAttempts.length > 0 ? (
                  <div className="space-y-2">
                    {admissionStatus.testAttempts.map((attempt) => (
                      <div key={attempt.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{attempt.title}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{attempt.score}/{attempt.totalMarks}</div>
                          <div className="text-xs text-muted-foreground">{attempt.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No test attempts recorded</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <Card className="electric-border mt-8">
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>What to do next based on your admission status</CardDescription>
          </CardHeader>
          <CardContent>
            {admissionStatus.status === 'ADMITTED' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Accept Admission</h4>
                    <p className="text-sm text-muted-foreground mb-3">Confirm your acceptance of the admission offer</p>
                    <Button size="sm">Accept Offer</Button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Pay Fees</h4>
                    <p className="text-sm text-muted-foreground mb-3">Complete your tuition and registration fee payment</p>
                    <Button size="sm" variant="outline">Pay Fees</Button>
                  </div>
                </div>
              </div>
            )}

            {admissionStatus.status === 'IN_PROGRESS' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Your application is being processed. Here's what you can do:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Check Documents</h4>
                    <p className="text-sm text-muted-foreground mb-3">Ensure all required documents are submitted</p>
                    <Button size="sm" variant="outline">View Documents</Button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Contact Support</h4>
                    <p className="text-sm text-muted-foreground mb-3">Get help with your application</p>
                    <Button size="sm" variant="outline">Contact Support</Button>
                  </div>
                </div>
              </div>
            )}

            {admissionStatus.status === 'REJECTED' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  We understand this is disappointing. Here are your options:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Appeal Decision</h4>
                    <p className="text-sm text-muted-foreground mb-3">Request a review of your application</p>
                    <Button size="sm" variant="outline">Submit Appeal</Button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Apply Again</h4>
                    <p className="text-sm text-muted-foreground mb-3">Consider applying for the next intake</p>
                    <Button size="sm" variant="outline">Get Information</Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </CandidateSidebarLayout>
  );
}