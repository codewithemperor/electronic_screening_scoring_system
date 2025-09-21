"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AdminSidebarLayout } from '@/components/admin/sidebar';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  BookOpen,
  Target,
  TrendingUp,
  Info
} from 'lucide-react';
import Link from 'next/link';

interface GradingRule {
  id: string;
  grade: string;
  marks: number;
}

export default function GradingRulesPage() {
  const [gradingRules, setGradingRules] = useState<GradingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<GradingRule | null>(null);

  const [formData, setFormData] = useState({
    grade: '',
    marks: 0
  });

  useEffect(() => {
    fetchGradingRules();
  }, []);

  const fetchGradingRules = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/grading');
      if (!response.ok) throw new Error('Failed to fetch grading rules');

      const data = await response.json();
      setGradingRules(data);
    } catch (err) {
      setError(err.message);
      console.error('Grading rules fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async () => {
    try {
      const response = await fetch('/api/admin/grading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to create grading rule');

      await fetchGradingRules();
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      setError(err.message);
      console.error('Create grading rule error:', err);
    }
  };

  const handleUpdateRule = async () => {
    if (!editingRule) return;

    try {
      const response = await fetch(`/api/admin/grading/${editingRule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to update grading rule');

      await fetchGradingRules();
      setIsDialogOpen(false);
      setEditingRule(null);
      resetForm();
    } catch (err) {
      setError(err.message);
      console.error('Update grading rule error:', err);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this grading rule? This may affect existing candidate calculations.')) return;

    try {
      const response = await fetch(`/api/admin/grading/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete grading rule');

      await fetchGradingRules();
    } catch (err) {
      setError(err.message);
      console.error('Delete grading rule error:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      grade: '',
      marks: 0
    });
  };

  const openEditDialog = (rule: GradingRule) => {
    setEditingRule(rule);
    setFormData({
      grade: rule.grade,
      marks: rule.marks
    });
    setIsDialogOpen(true);
  };

  const getGradeColor = (grade: string) => {
    const highGrades = ['A1', 'B2', 'B3'];
    const mediumGrades = ['C4', 'C5', 'C6'];
    const lowGrades = ['D7', 'E8', 'F9'];
    
    if (highGrades.includes(grade)) return 'bg-green-100 text-green-800 border-green-200';
    if (mediumGrades.includes(grade)) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (lowGrades.includes(grade)) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getGradeDescription = (grade: string) => {
    const descriptions: { [key: string]: string } = {
      'A1': 'Excellent - Distinction',
      'B2': 'Very Good - Upper Credit',
      'B3': 'Good - Credit',
      'C4': 'Credit - Pass',
      'C5': 'Pass - Lower Credit',
      'C6': 'Pass - Just Passed',
      'D7': 'Weak - Pass',
      'E8': 'Very Weak - Fail',
      'F9': 'Fail - Poor'
    };
    return descriptions[grade] || 'Unknown grade';
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
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">O'Level Grading Rules</h1>
                <p className="text-gray-600">Manage O'Level grade to mark conversion rules</p>
                <Badge variant="outline" className="text-sm mt-2">
                  {gradingRules.length} rules
                </Badge>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="electric-glow">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Grading Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingRule ? 'Edit Grading Rule' : 'Add New Grading Rule'}
                  </DialogTitle>
                  <DialogDescription>
                    Define the mark allocation for each O'Level grade
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="grade">Grade (e.g., A1, B2, C4)</Label>
                    <Input
                      id="grade"
                      value={formData.grade}
                      onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value.toUpperCase() }))}
                      placeholder="Enter grade..."
                      maxLength={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="marks">Mark Allocation (0-9)</Label>
                    <Input
                      id="marks"
                      type="number"
                      min="0"
                      max="9"
                      value={formData.marks}
                      onChange={(e) => setFormData(prev => ({ ...prev, marks: parseInt(e.target.value) || 0 }))}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Higher marks indicate better performance (9 = best, 0 = worst)
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
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={editingRule ? handleUpdateRule : handleCreateRule}
                    className="electric-glow"
                  >
                    {editingRule ? 'Update Rule' : 'Create Rule'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Information Card */}
        <Card className="mb-6 electric-border border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">About O'Level Grading Rules</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Grading rules define how each O'Level grade (A1, B2, B3, etc.) translates to numerical marks 
                  used in the admission calculation. These marks are summed to calculate the O'Level aggregate score.
                </p>
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

        {/* Grading Rules Table */}
        <div className="space-y-4">
          {gradingRules.length > 0 ? (
            gradingRules
              .sort((a, b) => b.marks - a.marks) // Sort by marks descending
              .map((rule) => (
                <Card key={rule.id} className="electric-border">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${getGradeColor(rule.grade)}`}>
                            {rule.grade}
                          </div>
                          <div>
                            <h3 className="font-medium">{rule.grade} Grade</h3>
                            <p className="text-sm text-muted-foreground">
                              {getGradeDescription(rule.grade)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Mark Allocation</p>
                          <p className="text-2xl font-bold text-primary">{rule.marks}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="ghost" onClick={() => openEditDialog(rule)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteRule(rule.id)}>
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
                <p className="text-muted-foreground">No grading rules found</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Summary Statistics */}
        <Card className="mt-8 electric-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Grading System Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{gradingRules.length}</p>
                <p className="text-sm text-muted-foreground">Total Rules</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {gradingRules.filter(rule => ['A1', 'B2', 'B3'].includes(rule.grade)).length}
                </p>
                <p className="text-sm text-muted-foreground">High Performance Grades</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">
                  {gradingRules.filter(rule => ['D7', 'E8', 'F9'].includes(rule.grade)).length}
                </p>
                <p className="text-sm text-muted-foreground">Low Performance Grades</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Information */}
        <Card className="mt-6 electric-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              How Grading Rules Are Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">O'Level Aggregate Calculation</h4>
                <p className="text-sm text-muted-foreground">
                  For each candidate, the system sums the marks from all their O'Level subjects using these grading rules. 
                  For example, if a candidate has A1 (9 marks), B2 (8 marks), and B3 (7 marks) in their 5 best subjects, 
                  their O'Level aggregate would be 9 + 8 + 7 + ... (sum of top 5 subjects).
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Final Score Calculation</h4>
                <p className="text-sm text-muted-foreground">
                  The final score combines UTME performance and O'Level aggregate using the department's configured weights. 
                  Typically, UTME counts for 70% and O'Level for 30% of the final score.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Admission Decision</h4>
                <p className="text-sm text-muted-foreground">
                  Candidates are evaluated against department cutoff marks for UTME, O'Level aggregate, and final combined score 
                  to determine their eligibility and admission status.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminSidebarLayout>
  );
}