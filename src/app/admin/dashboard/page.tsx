"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AdminSidebarLayout } from '@/components/admin/sidebar';
import { 
  Users, 
  Building2, 
  BookOpen, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Plus,
  Eye,
  Edit
} from 'lucide-react';
import Link from 'next/link';

interface AdminStats {
  totalCandidates: number;
  totalDepartments: number;
  totalQuestions: number;
  totalTests: number;
  admittedCandidates: number;
  pendingCandidates: number;
  activeTests: number;
  recentRegistrations: number;
}

interface RecentActivity {
  id: string;
  type: 'REGISTRATION' | 'TEST_SUBMISSION' | 'ADMISSION_UPDATE';
  candidateName: string;
  description: string;
  timestamp: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
  candidateCount: number;
  status: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalCandidates: 0,
    totalDepartments: 0,
    totalQuestions: 0,
    totalTests: 0,
    admittedCandidates: 0,
    pendingCandidates: 0,
    activeTests: 0,
    recentRegistrations: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [statsResponse, activitiesResponse, departmentsResponse] = await Promise.all([
        fetch('/api/admin/dashboard/stats'),
        fetch('/api/admin/dashboard/recent-activities'),
        fetch('/api/admin/departments')
      ]);

      if (!statsResponse.ok) throw new Error('Failed to fetch stats');
      if (!activitiesResponse.ok) throw new Error('Failed to fetch activities');
      if (!departmentsResponse.ok) throw new Error('Failed to fetch departments');

      const statsData = await statsResponse.json();
      const activitiesData = await activitiesResponse.json();
      const departmentsData = await departmentsResponse.json();

      setStats(statsData);
      setRecentActivities(activitiesData);
      setDepartments((departmentsData.departments || []).slice(0, 5)); // Show top 5 departments
    } catch (err) {
      setError(err.message);
      console.error('Dashboard data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'REGISTRATION': return <Users className="h-4 w-4" />;
      case 'TEST_SUBMISSION': return <BookOpen className="h-4 w-4" />;
      case 'ADMISSION_UPDATE': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'REGISTRATION': return 'bg-blue-100 text-blue-800';
      case 'TEST_SUBMISSION': return 'bg-green-100 text-green-800';
      case 'ADMISSION_UPDATE': return 'bg-purple-100 text-purple-800';
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
          <h2 className="text-2xl font-bold text-destructive mb-4">Error Loading Dashboard</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchDashboardData} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const admissionRate = stats.totalCandidates > 0 
    ? Math.round((stats.admittedCandidates / stats.totalCandidates) * 100) 
    : 0;

  return (
    <AdminSidebarLayout>
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Administration overview and statistics</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="electric-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCandidates}</div>
              <p className="text-xs text-muted-foreground">
                {stats.recentRegistrations} new this week
              </p>
            </CardContent>
          </Card>

          <Card className="electric-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDepartments}</div>
              <p className="text-xs text-muted-foreground">Active programs</p>
            </CardContent>
          </Card>

          <Card className="electric-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Questions Bank</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQuestions}</div>
              <p className="text-xs text-muted-foreground">Available questions</p>
            </CardContent>
          </Card>

          <Card className="electric-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tests</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeTests}</div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>
        </div>

        {/* Admission Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="electric-border">
            <CardHeader>
              <CardTitle>Admission Overview</CardTitle>
              <CardDescription>Current admission statistics and progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Admitted</p>
                  <p className="text-2xl font-bold text-green-600">{stats.admittedCandidates}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingCandidates}</p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Admission Rate</span>
                  <span>{admissionRate}%</span>
                </div>
                <Progress value={admissionRate} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="electric-border">
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest system activities and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3 p-2 rounded-lg bg-muted/30">
                      <div className={`p-1 rounded-full ${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.candidateName}</p>
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent activities
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Departments Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Departments Overview</h2>
              <Button size="sm" asChild>
                <Link href="/admin/departments">
                  View All
                </Link>
              </Button>
            </div>
            <div className="space-y-3">
              {departments.length > 0 ? (
                departments.map((dept) => (
                  <Card key={dept.id} className="electric-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{dept.name}</h3>
                          <p className="text-sm text-muted-foreground">{dept.code}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold">{dept.candidateCount}</p>
                          <p className="text-xs text-muted-foreground">candidates</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant={dept.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {dept.status}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost" asChild>
                            <Link href={`/admin/departments/${dept.id}`}>
                              <Eye className="h-3 w-3" />
                            </Link>
                          </Button>
                          <Button size="sm" variant="ghost" asChild>
                            <Link href={`/admin/departments/${dept.id}/edit`}>
                              <Edit className="h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-32">
                    <p className="text-muted-foreground">No departments found</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4">
              <Button className="h-auto p-4 flex flex-col items-start electric-glow" asChild>
                <Link href="/admin/departments">
                  <Building2 className="h-6 w-6 mb-2" />
                  <div className="text-left">
                    <p className="font-medium">Manage Departments</p>
                    <p className="text-sm text-muted-foreground">Add, edit, or remove departments</p>
                  </div>
                </Link>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col items-start" asChild>
                <Link href="/admin/questions">
                  <BookOpen className="h-6 w-6 mb-2" />
                  <div className="text-left">
                    <p className="font-medium">Questions Bank</p>
                    <p className="text-sm text-muted-foreground">Manage test questions</p>
                  </div>
                </Link>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col items-start" asChild>
                <Link href="/admin/candidates">
                  <Users className="h-6 w-6 mb-2" />
                  <div className="text-left">
                    <p className="font-medium">Candidate Management</p>
                    <p className="text-sm text-muted-foreground">View and manage candidates</p>
                  </div>
                </Link>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col items-start" asChild>
                <Link href="/admin/examinations">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  <div className="text-left">
                    <p className="font-medium">Examinations</p>
                    <p className="text-sm text-muted-foreground">Create and manage tests</p>
                  </div>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {stats.pendingCandidates > 0 && (
          <Alert className="mt-8 border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              You have {stats.pendingCandidates} pending candidates awaiting admission decisions. 
              <Button variant="link" className="text-yellow-800 underline ml-2 p-0 h-auto" asChild>
                <Link href="/admin/candidates">Review Candidates</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </AdminSidebarLayout>
  );
}