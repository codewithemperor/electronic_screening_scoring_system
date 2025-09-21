"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AdminSidebarLayout } from '@/components/admin/sidebar';
import { 
  Search, 
  Users, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  ArrowLeft,
  Filter,
  TrendingUp,
  Target,
  BookOpen,
  User,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import Link from 'next/link';

interface Candidate {
  id: string;
  fullName: string;
  utmeScore: number;
  olevelAggregate: number;
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
    };
    grade: string;
    gradingRule: {
      grade: string;
      marks: number;
    };
  }>;
  testAttempts: Array<{
    id: string;
    status: string;
    score?: number;
    examination: {
      id: string;
      title: string;
      department: {
        name: string;
      };
    };
  }>;
  createdAt: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface CandidatesResponse {
  candidates: Candidate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchCandidates();
    fetchDepartments();
  }, [pagination.page, selectedDepartment, selectedStatus, searchTerm]);

  const fetchCandidates = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      if (searchTerm) params.append('search', searchTerm);
      if (selectedDepartment && selectedDepartment !== 'all') params.append('departmentId', selectedDepartment);
      if (selectedStatus && selectedStatus !== 'all') params.append('admissionStatus', selectedStatus);

      const response = await fetch(`/api/admin/candidates?${params}`);
      if (!response.ok) throw new Error('Failed to fetch candidates');

      const data: CandidatesResponse = await response.json();
      setCandidates(data.candidates);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
      console.error('Candidates fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/admin/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.departments || []);
      }
    } catch (err) {
      console.error('Departments fetch error:', err);
    }
  };

  const handleAdmissionDecision = async (candidateId: string, decision: 'ADMITTED' | 'REJECTED') => {
    try {
      const response = await fetch('/api/admin/candidates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId,
          admissionStatus: decision
        })
      });

      if (!response.ok) throw new Error(`Failed to ${decision.toLowerCase()} candidate`);

      await fetchCandidates();
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="electric-spinner"></div>
      </div>
    );
  }

  return (
    <AdminSidebarLayout>
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Candidates Management</h1>
            <p className="text-gray-600">Manage student candidates and their admission status</p>
            <Badge variant="outline" className="text-sm mt-2">
              {pagination.total} candidates
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 electric-border">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search candidates by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="NOT_ADMITTED">Not Admitted</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="ADMITTED">Admitted</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Candidates Table */}
        <div className="space-y-4">
          {candidates.length > 0 ? (
            candidates.map((candidate) => (
              <Card key={candidate.id} className="electric-border">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header with basic info and actions */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{candidate.fullName}</h3>
                          <Badge className={getAdmissionStatusColor(candidate.admissionStatus)}>
                            {getAdmissionStatusIcon(candidate.admissionStatus)}
                            {candidate.admissionStatus.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-4 w-4" />
                            <span>{candidate.user.email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{candidate.state.name}, {candidate.lga.name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Target className="h-4 w-4" />
                            <span>{candidate.department.name}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/admin/candidates/${candidate.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {(candidate.admissionStatus === 'IN_PROGRESS' || 
                          (candidate.admissionStatus === 'NOT_ADMITTED' && candidate.testAttempts.length > 0)) && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleAdmissionDecision(candidate.id, 'ADMITTED')}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleAdmissionDecision(candidate.id, 'REJECTED')}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Academic Performance */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">UTME Score</p>
                        <p className="text-xl font-bold text-primary">{candidate.utmeScore}</p>
                        <p className="text-xs text-muted-foreground">
                          Dept: {candidate.department.utmeCutoffMark}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">O'Level Aggregate</p>
                        <p className="text-xl font-bold text-primary">{candidate.olevelAggregate}</p>
                        <p className="text-xs text-muted-foreground">
                          Dept: {candidate.department.olevelCutoffAggregate}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">Final Score</p>
                        <p className="text-xl font-bold text-primary">{candidate.finalScore || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">
                          Dept: {candidate.department.finalCutoffMark}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">O'Level Results</p>
                        <p className="text-xl font-bold text-primary">{candidate.oLevelResults.length}</p>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">Eligibility</p>
                        <div className="flex flex-col items-center">
                          {candidate.utmeScore >= candidate.department.utmeCutoffMark && 
                           candidate.olevelAggregate >= candidate.department.olevelCutoffAggregate && 
                           (candidate.finalScore || 0) >= candidate.department.finalCutoffMark ? (
                            <span className="text-green-600 text-sm font-medium">Eligible</span>
                          ) : (
                            <span className="text-red-600 text-sm font-medium">Review</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Test Attempts */}
                    {candidate.testAttempts.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Test Attempts</h4>
                        <div className="flex flex-wrap gap-2">
                          {candidate.testAttempts.map((attempt) => (
                            <Badge key={attempt.id} className={getTestStatusColor(attempt.status)}>
                              {attempt.examination.title}: {attempt.status.replace('_', ' ')}
                              {attempt.score && ` (${attempt.score}/${attempt.examination.title.includes('Aptitude') ? '10' : '8'})`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* O'Level Results Preview */}
                    {candidate.oLevelResults.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">O'Level Results Preview</h4>
                        <div className="flex flex-wrap gap-2">
                          {candidate.oLevelResults.slice(0, 5).map((result) => (
                            <Badge key={result.id} variant="outline">
                              {result.subject.name}: {result.grade}
                            </Badge>
                          ))}
                          {candidate.oLevelResults.length > 5 && (
                            <Badge variant="outline">+{candidate.oLevelResults.length - 5} more</Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="text-xs text-muted-foreground">
                        Registered: {new Date(candidate.createdAt).toLocaleDateString()}
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/admin/candidates/${candidate.id}`}>
                          View Full Profile
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
                <p className="text-muted-foreground">No candidates found</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.pages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </AdminSidebarLayout>
  );
}