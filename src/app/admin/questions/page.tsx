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
  Target, 
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Settings,
  Eye,
  Filter
} from 'lucide-react';
import Link from 'next/link';

interface Question {
  id: string;
  content: string;
  options: string[];
  correctAnswer: number;
  marks: number;
  difficulty?: number;
  department: {
    id: string;
    name: string;
    code: string;
  };
  subject: {
    id: string;
    name: string;
    code: string;
  };
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface QuestionsResponse {
  questions: Question[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const [formData, setFormData] = useState({
    content: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    marks: 1,
    difficulty: 3,
    departmentId: '',
    subjectId: ''
  });

  useEffect(() => {
    fetchQuestions();
    fetchReferenceData();
  }, [pagination.page, selectedDepartment, selectedSubject]);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      if (selectedDepartment && selectedDepartment !== 'all') params.append('departmentId', selectedDepartment);
      if (selectedSubject && selectedSubject !== 'all') params.append('subjectId', selectedSubject);

      const response = await fetch(`/api/admin/questions?${params}`);
      if (!response.ok) throw new Error('Failed to fetch questions');

      const data: QuestionsResponse = await response.json();
      setQuestions(data.questions);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
      console.error('Questions fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferenceData = async () => {
    try {
      const [departmentsResponse, subjectsResponse] = await Promise.all([
        fetch('/api/admin/departments'),
        fetch('/api/subjects')
      ]);

      if (departmentsResponse.ok) {
        const deptsData = await departmentsResponse.json();
        setDepartments(deptsData.departments || []);
      }

      if (subjectsResponse.ok) {
        const subjectsData = await subjectsResponse.json();
        setSubjects(subjectsData);
      }
    } catch (err) {
      console.error('Reference data fetch error:', err);
    }
  };

  const handleCreateQuestion = async () => {
    // Validate form data before sending
    if (!formData.content.trim()) {
      setError('Question content is required');
      return;
    }
    
    if (!formData.departmentId || formData.departmentId === 'general') {
      setError('Please select a valid department');
      return;
    }
    
    if (!formData.subjectId) {
      setError('Subject is required');
      return;
    }
    
    if (formData.options.some(option => !option.trim())) {
      setError('All options must be filled');
      return;
    }

    try {
      console.log('Sending form data:', formData); // Debug log
      const response = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to create question');
      }

      await fetchQuestions();
      setIsDialogOpen(false);
      resetForm();
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Create question error:', err);
    }
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;

    try {
      const response = await fetch(`/api/admin/questions/${editingQuestion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to update question');

      await fetchQuestions();
      setIsDialogOpen(false);
      setEditingQuestion(null);
      resetForm();
    } catch (err) {
      setError(err.message);
      console.error('Update question error:', err);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const response = await fetch(`/api/admin/questions/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete question');

      await fetchQuestions();
    } catch (err) {
      setError(err.message);
      console.error('Delete question error:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      content: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      marks: 1,
      difficulty: 3,
      departmentId: '',
      subjectId: ''
    });
    setEditingQuestion(null);
  };

  const openEditDialog = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      content: question.content,
      options: question.options,
      correctAnswer: question.correctAnswer,
      marks: question.marks,
      difficulty: question.difficulty || 3,
      departmentId: question.department.id,
      subjectId: question.subject.id
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const getDifficultyColor = (difficulty?: number) => {
    if (!difficulty) return 'bg-gray-100 text-gray-800';
    if (difficulty <= 2) return 'bg-green-100 text-green-800';
    if (difficulty <= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getDifficultyText = (difficulty?: number) => {
    if (!difficulty) return 'Unknown';
    if (difficulty <= 2) return 'Easy';
    if (difficulty <= 3) return 'Medium';
    return 'Hard';
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
              <h1 className="text-3xl font-bold text-gray-900">Questions Management</h1>
              <p className="text-gray-600">Manage examination questions and answer options</p>
              <Badge variant="outline" className="text-sm mt-2">
                {pagination.total} questions
              </Badge>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="electric-glow" onClick={openAddDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingQuestion ? 'Edit Question' : 'Add New Question'}
                  </DialogTitle>
                  <DialogDescription>
                    Create or modify a question for the examination system
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Select 
                        value={formData.departmentId} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, departmentId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General (All Departments)</SelectItem>
                          {departments.map(dept => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Select 
                        value={formData.subjectId} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, subjectId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map(subject => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="content">Question Content</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      rows={3}
                      placeholder="Enter the question content..."
                    />
                  </div>

                  <div>
                    <Label>Options</Label>
                    <div className="space-y-2">
                      {formData.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Label className="w-8">{String.fromCharCode(65 + index)}.</Label>
                          <Input
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="correctAnswer">Correct Answer</Label>
                      <Select 
                        value={formData.correctAnswer.toString()} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, correctAnswer: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select correct answer" />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.options.map((_, index) => (
                            <SelectItem key={index} value={index.toString()}>
                              {String.fromCharCode(65 + index)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="marks">Marks</Label>
                      <Input
                        id="marks"
                        type="number"
                        min="1"
                        value={formData.marks}
                        onChange={(e) => setFormData(prev => ({ ...prev, marks: parseInt(e.target.value) || 1 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select 
                        value={formData.difficulty.toString()} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Easy (1)</SelectItem>
                          <SelectItem value="2">Easy (2)</SelectItem>
                          <SelectItem value="3">Medium (3)</SelectItem>
                          <SelectItem value="4">Hard (4)</SelectItem>
                          <SelectItem value="5">Hard (5)</SelectItem>
                        </SelectContent>
                      </Select>
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
                  <Button variant="outline" onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={editingQuestion ? handleUpdateQuestion : handleCreateQuestion}
                    className="electric-glow"
                  >
                    {editingQuestion ? 'Update Question' : 'Create Question'}
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
                    placeholder="Search questions..."
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
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map(subject => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions Table */}
        <div className="space-y-4">
          {questions.length > 0 ? (
            questions.map((question) => (
              <Card key={question.id} className="electric-border">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium">{question.content}</h3>
                        <Badge variant="outline">{question.marks} mark{question.marks > 1 ? 's' : ''}</Badge>
                        <Badge className={getDifficultyColor(question.difficulty)}>
                          {getDifficultyText(question.difficulty)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 mb-3">
                        {(question.options || []).map((option, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                              index === question.correctAnswer 
                                ? 'bg-green-100 text-green-800 border-green-200' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {String.fromCharCode(65 + index)}
                            </span>
                            <span className={index === question.correctAnswer ? 'font-medium' : ''}>
                              {option}
                            </span>
                            {index === question.correctAnswer && (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <BookOpen className="mr-1 h-3 w-3" />
                          {question.department.name}
                        </span>
                        <span className="flex items-center">
                          <Target className="mr-1 h-3 w-3" />
                          {question.subject.name}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/admin/questions/${question.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => openEditDialog(question)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteQuestion(question.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">No questions found</p>
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