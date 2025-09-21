"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AdminSidebarLayout } from '@/components/admin/sidebar';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  BookOpen, 
  Clock, 
  Target,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Settings,
  Eye,
  Filter,
  Users,
  Calendar,
  Timer
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
      marks: number;
    };
  }>;
  testAttempts: Array<{
    id: string;
    status: string;
    score?: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Question {
  id: string;
  content: string;
  marks: number;
  department: {
    id: string;
    name: string;
  };
  subject: {
    id: string;
    name: string;
  };
}

interface ExaminationsResponse {
  examinations: Examination[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function ExaminationsPage() {
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExamination, setEditingExamination] = useState<Examination | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 60,
    totalMarks: 10,
    passingMarks: 6,
    departmentId: '',
    questionIds: [] as string[]
  });

  useEffect(() => {
    fetchExaminations();
    fetchReferenceData();
  }, [pagination.page, selectedDepartment]);

  const fetchExaminations = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      if (selectedDepartment && selectedDepartment !== 'all') params.append('departmentId', selectedDepartment);

      const response = await fetch(`/api/admin/examinations?${params}`);
      if (!response.ok) throw new Error('Failed to fetch examinations');

      const data: ExaminationsResponse = await response.json();
      setExaminations(data.examinations);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
      console.error('Examinations fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferenceData = async () => {
    try {
      const [departmentsResponse, questionsResponse] = await Promise.all([
        fetch('/api/admin/departments'),
        fetch('/api/admin/questions')
      ]);

      if (departmentsResponse.ok) {
        const deptsData = await departmentsResponse.json();
        setDepartments(deptsData.departments || []);
      }

      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json();
        setAvailableQuestions(questionsData.questions);
      }
    } catch (err) {
      console.error('Reference data fetch error:', err);
    }
  };

  const fetchQuestionsByDepartment = async (departmentId: string) => {
    try {
      const params = new URLSearchParams();
      if (departmentId && departmentId !== 'all') {
        params.append('departmentId', departmentId);
      }
      
      const response = await fetch(`/api/admin/questions?${params}`);
      if (response.ok) {
        const questionsData = await response.json();
        setAvailableQuestions(questionsData.questions);
      }
    } catch (err) {
      console.error('Error fetching questions by department:', err);
    }
  };

  const handleCreateExamination = async () => {
    try {
      const response = await fetch('/api/admin/examinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to create examination');

      await fetchExaminations();
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      setError(err.message);
      console.error('Create examination error:', err);
    }
  };

  const handleUpdateExamination = async () => {
    if (!editingExamination) return;

    try {
      const response = await fetch(`/api/admin/examinations/${editingExamination.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to update examination');

      await fetchExaminations();
      setIsDialogOpen(false);
      setEditingExamination(null);
      resetForm();
    } catch (err) {
      setError(err.message);
      console.error('Update examination error:', err);
    }
  };

  const handleDeleteExamination = async (id: string) => {
    if (!confirm('Are you sure you want to delete this examination? This will also remove all associated questions.')) return;

    try {
      const response = await fetch(`/api/admin/examinations/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete examination');

      await fetchExaminations();
    } catch (err) {
      setError(err.message);
      console.error('Delete examination error:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      duration: 60,
      totalMarks: 10,
      passingMarks: 6,
      departmentId: '',
      questionIds: []
    });
    setEditingExamination(null);
  };

  const openEditDialog = (examination: Examination) => {
    setEditingExamination(examination);
    setFormData({
      title: examination.title,
      description: examination.description || '',
      duration: examination.duration,
      totalMarks: examination.totalMarks,
      passingMarks: examination.passingMarks,
      departmentId: examination.department.id,
      questionIds: examination.examinationQuestions.map(eq => eq.question.id)
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Filter questions based on department selection
  const filteredQuestions = availableQuestions.filter(question => {
    if (!formData.departmentId) return true;
    return question.department.id === formData.departmentId;
  });

  const handleQuestionToggle = (questionId: string) => {
    setFormData(prev => ({
      ...prev,
      questionIds: prev.questionIds.includes(questionId)
        ? prev.questionIds.filter(id => id !== questionId)
        : [...prev.questionIds, questionId]
    }));
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Examinations Management</h1>
              <p className="text-gray-600">Manage examination tests and their configurations</p>
              <Badge variant="outline" className="text-sm mt-2">
                {pagination.total} examinations
              </Badge>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}>
              <DialogTrigger asChild>
                <Button className="electric-glow" onClick={openAddDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Examination
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingExamination ? 'Edit Examination' : 'Create New Examination'}
                  </DialogTitle>
                  <DialogDescription>
                    Set up a new examination with questions and configuration
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Examination Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter examination title..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      placeholder="Enter examination description..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Select 
                        value={formData.departmentId} 
                        onValueChange={(value) => {
                          setFormData(prev => ({ 
                            ...prev, 
                            departmentId: value,
                            questionIds: [] // Clear selected questions when department changes
                          }));
                          fetchQuestionsByDepartment(value);
                        }}
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
                    <div>
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        value={formData.duration}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="totalMarks">Total Marks</Label>
                      <Input
                        id="totalMarks"
                        type="number"
                        min="1"
                        value={formData.totalMarks}
                        onChange={(e) => setFormData(prev => ({ ...prev, totalMarks: parseInt(e.target.value) || 10 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="passingMarks">Passing Marks</Label>
                      <Input
                        id="passingMarks"
                        type="number"
                        min="1"
                        value={formData.passingMarks}
                        onChange={(e) => setFormData(prev => ({ ...prev, passingMarks: parseInt(e.target.value) || 6 }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Select Questions</Label>
                    <div className="mt-2 space-y-2 max-h-64 overflow-y-auto border rounded-lg p-4">
                      {filteredQuestions.map((question) => (
                        <div key={question.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                          <input
                            type="checkbox"
                            checked={formData.questionIds.includes(question.id)}
                            onChange={() => handleQuestionToggle(question.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{question.content}</p>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                              <span>{question.department.name}</span>
                              <span>•</span>
                              <span>{question.subject.name}</span>
                              <span>•</span>
                              <span>{question.marks} marks</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected: {formData.questionIds.length} questions
                    </p>
                  </div>
                </div>

                {error && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={editingExamination ? handleUpdateExamination : handleCreateExamination}
                    className="electric-glow"
                  >
                    {editingExamination ? 'Update Examination' : 'Create Examination'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                    placeholder="Search examinations..."
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Examinations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {examinations.length > 0 ? (
            examinations.map((examination) => (
              <Card key={examination.id} className="electric-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{examination.title}</CardTitle>
                    <Badge className={getStatusColor(examination.isActive)}>
                      {examination.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <CardDescription>{examination.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Examination Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{examination.duration} min</p>
                          <p className="text-muted-foreground">Duration</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{examination.totalMarks} marks</p>
                          <p className="text-muted-foreground">Total</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{examination.passingMarks} marks</p>
                          <p className="text-muted-foreground">Passing</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{examination.examinationQuestions.length}</p>
                          <p className="text-muted-foreground">Questions</p>
                        </div>
                      </div>
                    </div>

                    {/* Department */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">Department:</span>
                      <Badge variant="outline">{examination.department.name}</Badge>
                    </div>

                    {/* Test Attempts */}
                    {examination.testAttempts.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Recent Attempts:</p>
                        <div className="space-y-1">
                          {examination.testAttempts.slice(0, 3).map((attempt) => (
                            <div key={attempt.id} className="flex items-center justify-between text-sm">
                              <Badge className={getTestStatusColor(attempt.status)}>
                                {attempt.status.replace('_', ' ')}
                              </Badge>
                              {attempt.score && (
                                <span className="text-muted-foreground">
                                  {attempt.score}/{examination.totalMarks}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/admin/examinations/${examination.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => openEditDialog(examination)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteExamination(examination.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Created: {new Date(examination.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="col-span-full">
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">No examinations found</p>
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