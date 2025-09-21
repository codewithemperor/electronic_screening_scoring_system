"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CandidateSidebarLayout } from '@/components/candidate/sidebar';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Target, 
  Award,
  Edit,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api-client';

interface Candidate {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  utmeScore: number;
  olevelAggregate: number;
  olevelPercentage?: number;
  examPercentage?: number;
  finalScore?: number;
  admissionStatus: 'NOT_ADMITTED' | 'IN_PROGRESS' | 'ADMITTED' | 'REJECTED';
  department: {
    id: string;
    name: string;
    code: string;
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
  }>;
  testAttempts: Array<{
    id: string;
    examination: {
      id: string;
      title: string;
      department: {
        name: string;
      };
    };
    status: string;
    score?: number;
    totalMarks: number;
    startTime: string;
    endTime?: string;
  }>;
}

interface State {
  id: string;
  name: string;
  code: string;
}

interface Lga {
  id: string;
  name: string;
  stateId: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

export default function CandidateProfilePage() {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [states, setStates] = useState<State[]>([]);
  const [lgas, setLgas] = useState<Lga[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    stateId: '',
    lgaId: '',
    departmentId: '',
    utmeScore: 0,
    olevelAggregate: 0
  });

  useEffect(() => {
    fetchProfile();
    fetchReferenceData();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/api/candidate/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');
      
      const data = await response.json();
      
      // Use database-stored calculated values if available, otherwise calculate
      let examPercentage = data.examPercentage || 0;
      let olevelPercentage = data.olevelPercentage || 0;
      let finalScore = data.finalScore || 0;
      
      // If no stored values, calculate them
      if (!data.examPercentage || !data.olevelPercentage || !data.finalScore) {
        // Calculate exam percentage from test attempts
        if (data.testAttempts && data.testAttempts.length > 0) {
          const submittedAttempts = data.testAttempts.filter(
            (attempt: any) => attempt.status === 'SUBMITTED' || attempt.status === 'COMPLETED'
          );
          
          if (submittedAttempts.length > 0) {
            const totalScore = submittedAttempts.reduce(
              (sum: number, attempt: any) => sum + (attempt.score || 0), 
              0
            );
            const totalPossible = submittedAttempts.reduce(
              (sum: number, attempt: any) => sum + (attempt.totalMarks || 100), 
              0
            );
            examPercentage = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
          }
        }
        
        // Calculate O'Level percentage
        if (data.olevelAggregate !== undefined) {
          olevelPercentage = Math.round((data.olevelAggregate / 45) * 100);
        }
        
        // Calculate final score using department weights
        const department = data.department;
        if (department) {
          const examScore = Math.round(examPercentage * (department.examPercentage || 70) / 100);
          const olevelScore = Math.round(olevelPercentage * (department.olevelPercentage || 30) / 100);
          finalScore = examScore + olevelScore;
        }
      }
      
      // Add calculated values to data
      const enrichedData = {
        ...data,
        examPercentage,
        olevelPercentage,
        finalScore
      };
      
      setCandidate(enrichedData);
      
      // Initialize edit form
      setEditForm({
        fullName: data.fullName,
        phone: data.phone,
        address: data.address,
        dateOfBirth: new Date(data.dateOfBirth).toISOString().split('T')[0],
        stateId: data.stateId,
        lgaId: data.lgaId,
        departmentId: data.departmentId,
        utmeScore: data.utmeScore,
        olevelAggregate: data.olevelAggregate
      });
    } catch (err) {
      setError(err.message);
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferenceData = async () => {
    try {
      const [statesResponse, departmentsResponse] = await Promise.all([
        api.get('/api/states'),
        api.get('/api/departments')
      ]);

      if (statesResponse.ok) {
        const statesData = await statesResponse.json();
        setStates(statesData);
      }

      if (departmentsResponse.ok) {
        const departmentsData = await departmentsResponse.json();
        setDepartments(departmentsData.departments || []);
      }
    } catch (err) {
      console.error('Reference data fetch error:', err);
    }
  };

  const fetchLgas = async (stateId: string) => {
    try {
      const response = await api.get(`/api/lgas/${stateId}`);
      if (response.ok) {
        const lgasData = await response.json();
        setLgas(lgasData);
      }
    } catch (err) {
      console.error('LGAs fetch error:', err);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await api.put('/api/candidate/profile', editForm);

      if (!response.ok) throw new Error('Failed to update profile');

      await fetchProfile();
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
      console.error('Profile update error:', err);
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
      case 'IN_PROGRESS': return <AlertCircle className="h-4 w-4" />;
      case 'REJECTED': return <AlertCircle className="h-4 w-4" />;
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
          <Button onClick={fetchProfile} variant="outline">
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
          <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
          <Button asChild>
            <Link href="/candidate/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <CandidateSidebarLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/candidate/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
              <h1 className="text-2xl font-bold">Candidate Profile</h1>
              <Badge variant="outline" className="text-sm">
                {candidate.department.name}
              </Badge>
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                      Update your personal and academic information
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={editForm.fullName}
                          onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={editForm.phone}
                          onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={editForm.address}
                        onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={editForm.dateOfBirth}
                          onChange={(e) => setEditForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Select 
                          value={editForm.stateId} 
                          onValueChange={(value) => {
                            setEditForm(prev => ({ ...prev, stateId: value }));
                            fetchLgas(value);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {states.map(state => (
                              <SelectItem key={state.id} value={state.id}>
                                {state.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="lga">LGA</Label>
                        <Select 
                          value={editForm.lgaId} 
                          onValueChange={(value) => setEditForm(prev => ({ ...prev, lgaId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select LGA" />
                          </SelectTrigger>
                          <SelectContent>
                            {lgas.map(lga => (
                              <SelectItem key={lga.id} value={lga.id}>
                                {lga.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="department">Department</Label>
                        <Select 
                          value={editForm.departmentId} 
                          onValueChange={(value) => setEditForm(prev => ({ ...prev, departmentId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map(dept => (
                              <SelectItem key={dept.id} value={dept.id}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="utmeScore">UTME Score</Label>
                        <Input
                          id="utmeScore"
                          type="number"
                          min="0"
                          max="400"
                          value={editForm.utmeScore}
                          onChange={(e) => setEditForm(prev => ({ ...prev, utmeScore: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="olevelAggregate">O'Level Aggregate</Label>
                        <Input
                          id="olevelAggregate"
                          type="number"
                          min="0"
                          max="45"
                          value={editForm.olevelAggregate}
                          onChange={(e) => setEditForm(prev => ({ ...prev, olevelAggregate: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateProfile} className="electric-glow">
                      Update Profile
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {error && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Profile Information */}
            <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="electric-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{candidate.fullName}</p>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{candidate.email}</p>
                      <p className="text-sm text-muted-foreground">Email</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{candidate.phone}</p>
                      <p className="text-sm text-muted-foreground">Phone</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{new Date(candidate.dateOfBirth).toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground">Date of Birth</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="font-medium">{candidate.address}</p>
                    <p className="text-sm text-muted-foreground">
                      {candidate.lga.name}, {candidate.state.name}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card className="electric-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5" />
                  Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">UTME Score</p>
                    <p className="text-2xl font-bold text-primary">{candidate.utmeScore}</p>
                    <p className="text-xs text-muted-foreground">out of 400</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">O'Level Aggregate</p>
                    <p className="text-2xl font-bold text-primary">{candidate.olevelAggregate}</p>
                    <p className="text-xs text-muted-foreground">out of 45</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Final Score</p>
                    <p className="text-2xl font-bold text-primary">{candidate.finalScore || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">out of 100</p>
                  </div>
                </div>

                {candidate.olevelPercentage !== undefined && candidate.examPercentage !== undefined && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Exam Performance</span>
                        <span>{candidate.examPercentage}%</span>
                      </div>
                      <Progress value={candidate.examPercentage} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>O'Level Performance</span>
                        <span>{candidate.olevelPercentage}%</span>
                      </div>
                      <Progress value={candidate.olevelPercentage} className="h-2" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* O'Level Results */}
            <Card className="electric-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5" />
                  O'Level Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {candidate.oLevelResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {candidate.oLevelResults.map((result) => (
                      <div key={result.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{result.subject.name}</h4>
                          <Badge variant="outline">{result.grade}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{result.schoolName}</p>
                        <p className="text-xs text-muted-foreground">{result.examYear} - {result.examType}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No O'Level results recorded</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Test History */}
            <Card className="electric-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Test History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {candidate.testAttempts && candidate.testAttempts.length > 0 ? (
                  <div className="space-y-3">
                    {candidate.testAttempts.map((attempt) => (
                      <div key={attempt.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{attempt.examination.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {attempt.examination.department?.name || 'Unknown Department'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(attempt.startTime).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            attempt.status === 'SUBMITTED' ? 'default' : 
                            attempt.status === 'IN_PROGRESS' ? 'secondary' : 'outline'
                          }>
                            {attempt.status.replace('_', ' ')}
                          </Badge>
                          {attempt.score !== undefined && (
                            <p className="text-sm font-medium mt-1">
                              {attempt.score}/{attempt.totalMarks}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No test attempts recorded</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Admission Status */}
            <Card className="electric-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Admission Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getAdmissionStatusIcon(candidate.admissionStatus)}
                    <span className="font-medium">Status</span>
                  </div>
                  <Badge className={getAdmissionStatusColor(candidate.admissionStatus)}>
                    {candidate.admissionStatus.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{candidate.department.name}</p>
                  <p className="text-xs text-muted-foreground">{candidate.department.code}</p>
                </div>

                <Button variant="outline" className="w-full" asChild>
                  <Link href="/candidate/recommendations">
                    View Recommendations
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="electric-border">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/candidate/exam">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Available Tests
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/candidate/results">
                    <Award className="mr-2 h-4 w-4" />
                    View Results
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/candidate/dashboard">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CandidateSidebarLayout>
  );
}