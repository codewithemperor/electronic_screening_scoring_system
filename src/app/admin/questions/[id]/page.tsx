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
  Target, 
  CheckCircle,
  AlertCircle,
  Settings,
  Eye,
  Clock
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
  createdAt: string;
  updatedAt: string;
}

export default function QuestionDetailPage({ params }: { params: { id: string } }) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestion();
  }, [params.id]);

  const fetchQuestion = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/questions/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch question');

      const data = await response.json();
      setQuestion(data);
    } catch (err) {
      setError(err.message);
      console.error('Question fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!question) return;
    
    if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/questions/${question.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete question');

      // Redirect to questions list
      window.location.href = '/admin/questions';
    } catch (err) {
      setError(err.message);
      console.error('Delete question error:', err);
    }
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6">
          <h2 className="text-2xl font-bold text-destructive mb-4">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchQuestion} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Question Not Found</h2>
          <Button asChild>
            <Link href="/admin/questions">Back to Questions</Link>
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
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/questions">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Questions
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Question Details</h1>
                <p className="text-gray-600">
                  ID: {question.id}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/questions/${question.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDeleteQuestion}
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
          {/* Main Question Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Card */}
            <Card className="electric-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Question Content</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{question.marks} mark{question.marks > 1 ? 's' : ''}</Badge>
                    <Badge className={getDifficultyColor(question.difficulty)}>
                      {getDifficultyText(question.difficulty)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-3">Question:</h3>
                    <p className="text-lg leading-relaxed bg-muted/50 p-4 rounded-lg">
                      {question.content}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Options:</h3>
                    <div className="space-y-2">
                      {question.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === question.correctAnswer 
                              ? 'bg-green-100 text-green-800 border-2 border-green-300' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span className={`flex-1 ${
                            index === question.correctAnswer ? 'font-medium text-green-800' : ''
                          }`}>
                            {option}
                          </span>
                          {index === question.correctAnswer && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Information */}
            <Card className="electric-border">
              <CardHeader>
                <CardTitle>Usage Information</CardTitle>
                <CardDescription>
                  Information about where this question is used
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p className="font-medium">{question.department.name}</p>
                      <p className="text-sm text-muted-foreground">{question.department.code}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Subject</p>
                      <p className="font-medium">{question.subject.name}</p>
                      <p className="text-sm text-muted-foreground">{question.subject.code}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="font-medium">
                        {new Date(question.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Updated</p>
                      <p className="font-medium">
                        {new Date(question.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                  <Link href={`/admin/questions/${question.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Question
                  </Link>
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <Link href={`/admin/examinations?department=${question.department.id}`}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    View Department Exams
                  </Link>
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <Link href={`/admin/departments/${question.department.id}`}>
                    <Settings className="mr-2 h-4 w-4" />
                    Manage Department
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Question Stats */}
            <Card className="electric-border">
              <CardHeader>
                <CardTitle className="text-lg">Question Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Difficulty</p>
                  <Badge className={getDifficultyColor(question.difficulty)}>
                    {getDifficultyText(question.difficulty)}
                  </Badge>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Marks</p>
                  <p className="text-2xl font-bold">{question.marks}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Options</p>
                  <p className="text-2xl font-bold">{question.options.length}</p>
                </div>
              </CardContent>
            </Card>

            {/* Related Information */}
            <Card className="electric-border">
              <CardHeader>
                <CardTitle className="text-lg">Related Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Department</span>
                  <Badge variant="outline">{question.department.name}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Subject</span>
                  <Badge variant="outline">{question.subject.name}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Age</span>
                  <span className="text-sm">
                    {Math.floor((Date.now() - new Date(question.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days
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