"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AdminSidebarLayout } from '@/components/admin/sidebar';
import { 
  ArrowLeft, 
  Building2, 
  Users, 
  BookOpen, 
  Target, 
  Settings,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import Link from 'next/link';

interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  examPercentage: number;
  olevelPercentage: number;
  finalCutoffMark: number;
  utmeCutoffMark: number;
  olevelCutoffAggregate: number;
  status: 'ACTIVE' | 'INACTIVE';
  _count: {
    candidates: number;
    examinations: number;
    questions: number;
  };
  examinations: Array<{
    id: string;
    title: string;
    isActive: boolean;
  }>;
}

export default function DepartmentDetailPage() {
  const params = useParams();
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDepartment();
  }, [params.id]);

  const fetchDepartment = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/departments/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch department');
      
      const data = await response.json();
      setDepartment(data);
    } catch (err) {
      setError(err.message);
      console.error('Department fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/departments/${params.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete department');

      // Redirect to departments list
      window.location.href = '/admin/departments';
    } catch (err) {
      setError(err.message);
      console.error('Delete department error:', err);
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
          <Button onClick={() => window.location.href = '/admin/departments'} variant="outline">
            Back to Departments
          </Button>
        </div>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Department Not Found</h2>
          <Button asChild>
            <Link href="/admin/departments">Back to Departments</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AdminSidebarLayout>
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/departments">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Departments
                  </Link>
                </Button>
                <Badge variant={department.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {department.status}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{department.name}</h1>
              <p className="text-gray-600">{department.code}</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" asChild>
                <Link href={`/admin/departments/${department.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDelete}
                disabled={department._count.candidates > 0}
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
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Department Overview */}
            <Card className="electric-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="mr-2 h-5 w-5" />
                  Department Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {department.description && (
                  <div>
                    <h3 className="font-medium mb-2">Description</h3>
                    <p className="text-muted-foreground">{department.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Scoring Weights</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Exam Weight:</span>
                        <span className="font-medium">{department.examPercentage}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">O'Level Weight:</span>
                        <span className="font-medium">{department.olevelPercentage}%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Cutoff Marks</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Final Cutoff:</span>
                        <span className="font-medium">{department.finalCutoffMark}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">UTME Cutoff:</span>
                        <span className="font-medium">{department.utmeCutoffMark}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">O'Level Cutoff:</span>
                        <span className="font-medium">{department.olevelCutoffAggregate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Examinations */}
            <Card className="electric-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Active Examinations
                </CardTitle>
                <CardDescription>
                  Currently active examinations for this department
                </CardDescription>
              </CardHeader>
              <CardContent>
                {department.examinations.filter(e => e.isActive).length > 0 ? (
                  <div className="space-y-3">
                    {department.examinations
                      .filter(e => e.isActive)
                      .map((exam) => (
                        <div key={exam.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{exam.title}</h4>
                            <p className="text-sm text-muted-foreground">{department.name}</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No active examinations</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistics */}
            <Card className="electric-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Users className="h-8 w-8 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold">{department._count.candidates}</p>
                  <p className="text-sm text-muted-foreground">Candidates</p>
                </div>
                
                <div className="text-center">
                  <BookOpen className="h-8 w-8 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold">{department._count.examinations}</p>
                  <p className="text-sm text-muted-foreground">Examinations</p>
                </div>
                
                <div className="text-center">
                  <Target className="h-8 w-8 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold">{department._count.questions}</p>
                  <p className="text-sm text-muted-foreground">Questions</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="electric-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/admin/questions?department=${department.id}`}>
                    <Target className="mr-2 h-4 w-4" />
                    Manage Questions
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/admin/examinations?department=${department.id}`}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Manage Examinations
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/admin/candidates?department=${department.id}`}>
                    <Users className="mr-2 h-4 w-4" />
                    View Candidates
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Status Alert */}
            {department._count.candidates === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This department has no candidates yet. You can safely delete it if needed.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </AdminSidebarLayout>
  );
}