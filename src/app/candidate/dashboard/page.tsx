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
  BookOpen, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  FileText,
  Bell,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

interface CandidateStats {
  utmeScore: number;
  olevelAggregate: number;
  finalScore?: number;
  admissionStatus: string;
  completedTests: number;
  pendingTests: number;
  totalTests: number;
}

interface UpcomingTest {
  id: string;
  title: string;
  department: string;
  date: string;
  duration: number;
}

export default function CandidateDashboard() {
  const [stats, setStats] = useState<CandidateStats>({
    utmeScore: 0,
    olevelAggregate: 0,
    finalScore: 0,
    admissionStatus: 'NOT_ADMITTED',
    completedTests: 0,
    pendingTests: 0,
    totalTests: 0
  });
  const [upcomingTests, setUpcomingTests] = useState<UpcomingTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching candidate data
    setTimeout(() => {
      setStats({
        utmeScore: 280,
        olevelAggregate: 35,
        finalScore: 78.5,
        admissionStatus: 'IN_PROGRESS',
        completedTests: 2,
        pendingTests: 1,
        totalTests: 3
      });
      
      setUpcomingTests([
        {
          id: '1',
          title: 'Computer Science Aptitude Test',
          department: 'Computer Science',
          date: '2024-01-15',
          duration: 60
        }
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

  const getAdmissionStatusColor = (status: string) => {
    switch (status) {
      case 'ADMITTED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold text-gray-900">Candidate Dashboard</h1>
          <p className="text-gray-600">Welcome back! Track your admission progress</p>
        </div>

        {/* Notifications */}
        {stats.admissionStatus === 'IN_PROGRESS' && (
          <Alert className="border-blue-200 bg-blue-50 mb-6">
            <Bell className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Your application is currently under review. You will be notified once a decision is made.
            </AlertDescription>
          </Alert>
        )}

        {stats.pendingTests > 0 && (
          <Alert className="border-yellow-200 bg-yellow-50 mb-6">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              You have {stats.pendingTests} pending test(s) to complete. Please complete all required tests for your application to be processed.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="electric-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">UTME Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.utmeScore}</div>
              <p className="text-xs text-muted-foreground">out of 400</p>
            </CardContent>
          </Card>

          <Card className="electric-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">O'Level Aggregate</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.olevelAggregate}</div>
              <p className="text-xs text-muted-foreground">out of 45</p>
            </CardContent>
          </Card>

          <Card className="electric-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Final Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.finalScore}</div>
              <p className="text-xs text-muted-foreground">combined score</p>
            </CardContent>
          </Card>

          <Card className="electric-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tests Completed</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedTests}/{stats.totalTests}</div>
              <p className="text-xs text-muted-foreground">{stats.pendingTests} pending</p>
            </CardContent>
          </Card>
        </div>

        {/* Admission Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="electric-border">
            <CardHeader>
              <CardTitle>Admission Status</CardTitle>
              <CardDescription>Your current admission progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Status</span>
                <Badge className={getAdmissionStatusColor(stats.admissionStatus)}>
                  {getAdmissionStatusText(stats.admissionStatus)}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Profile Completion</span>
                  <span>85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Document Upload</span>
                  <span>100%</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Test Completion</span>
                  <span>{Math.round((stats.completedTests / stats.totalTests) * 100)}%</span>
                </div>
                <Progress value={(stats.completedTests / stats.totalTests) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="electric-border">
            <CardHeader>
              <CardTitle>Upcoming Tests</CardTitle>
              <CardDescription>Scheduled examinations</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingTests.length > 0 ? (
                <div className="space-y-3">
                  {upcomingTests.map((test) => (
                    <div key={test.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{test.title}</h4>
                          <p className="text-sm text-muted-foreground">{test.department}</p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(test.date).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{test.duration} minutes</span>
                          </div>
                        </div>
                        <Button size="sm" asChild>
                          <Link href={`/candidate/examinations/${test.id}`}>
                            Start Test
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming tests scheduled</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          <Card className="electric-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Update your personal information and academic details
              </p>
              <Button size="sm" asChild className="w-full">
                <Link href="/candidate/profile">
                  Edit Profile
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="electric-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Check your test results and admission status
              </p>
              <Button size="sm" asChild className="w-full">
                <Link href="/candidate/results">
                  View Results
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </CandidateSidebarLayout>
  );
}