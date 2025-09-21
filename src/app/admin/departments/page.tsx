"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AdminSidebarLayout } from '@/components/admin/sidebar';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Building2, 
  Users, 
  Settings,
  AlertCircle,
  CheckCircle
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
  candidateCount: number;
  examinations: Array<{
    id: string;
    title: string;
    isActive: boolean;
  }>;
}

interface DepartmentFormData {
  name: string;
  code: string;
  description: string;
  examPercentage: number;
  olevelPercentage: number;
  finalCutoffMark: number;
  utmeCutoffMark: number;
  olevelCutoffAggregate: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: '',
    code: '',
    description: '',
    examPercentage: 70,
    olevelPercentage: 30,
    finalCutoffMark: 70,
    utmeCutoffMark: 250,
    olevelCutoffAggregate: 25,
    status: 'ACTIVE'
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/departments');
      if (!response.ok) throw new Error('Failed to fetch departments');
      
      const data = await response.json();
      setDepartments(data.departments || []);
    } catch (err) {
      setError(err.message);
      console.error('Departments fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = async () => {
    try {
      const response = await fetch('/api/admin/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to create department');

      await fetchDepartments();
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      setError(err.message);
      console.error('Create department error:', err);
    }
  };

  const handleUpdateDepartment = async () => {
    if (!editingDepartment) return;

    try {
      const response = await fetch(`/api/admin/departments/${editingDepartment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to update department');

      await fetchDepartments();
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      setError(err.message);
      console.error('Update department error:', err);
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/departments/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete department');

      await fetchDepartments();
    } catch (err) {
      setError(err.message);
      console.error('Delete department error:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      examPercentage: 70,
      olevelPercentage: 30,
      finalCutoffMark: 70,
      utmeCutoffMark: 250,
      olevelCutoffAggregate: 25,
      status: 'ACTIVE'
    });
    setEditingDepartment(null);
  };

  const openEditDialog = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      code: department.code,
      description: department.description || '',
      examPercentage: department.examPercentage,
      olevelPercentage: department.olevelPercentage,
      finalCutoffMark: department.finalCutoffMark,
      utmeCutoffMark: department.utmeCutoffMark,
      olevelCutoffAggregate: department.olevelCutoffAggregate,
      status: department.status
    });
    setIsDialogOpen(true);
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
              <h1 className="text-3xl font-bold text-gray-900">Departments Management</h1>
              <p className="text-gray-600">Manage academic departments and their admission criteria</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="electric-glow" onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Department
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingDepartment ? 'Edit Department' : 'Create New Department'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingDepartment 
                      ? 'Update department information and admission criteria'
                      : 'Add a new department to the system with its admission requirements'
                    }
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Department Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Computer Science"
                      />
                    </div>
                    <div>
                      <Label htmlFor="code">Department Code</Label>
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                        placeholder="e.g., CS"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the department..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="examPercentage">Exam Weight (%)</Label>
                      <Input
                        id="examPercentage"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.examPercentage}
                        onChange={(e) => setFormData(prev => ({ ...prev, examPercentage: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="olevelPercentage">O'Level Weight (%)</Label>
                      <Input
                        id="olevelPercentage"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.olevelPercentage}
                        onChange={(e) => setFormData(prev => ({ ...prev, olevelPercentage: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="finalCutoffMark">Final Cutoff Mark</Label>
                      <Input
                        id="finalCutoffMark"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.finalCutoffMark}
                        onChange={(e) => setFormData(prev => ({ ...prev, finalCutoffMark: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="utmeCutoffMark">UTME Cutoff</Label>
                      <Input
                        id="utmeCutoffMark"
                        type="number"
                        min="0"
                        max="400"
                        value={formData.utmeCutoffMark}
                        onChange={(e) => setFormData(prev => ({ ...prev, utmeCutoffMark: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="olevelCutoffAggregate">O'Level Cutoff</Label>
                      <Input
                        id="olevelCutoffAggregate"
                        type="number"
                        min="0"
                        max="45"
                        value={formData.olevelCutoffAggregate}
                        onChange={(e) => setFormData(prev => ({ ...prev, olevelCutoffAggregate: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value: 'ACTIVE' | 'INACTIVE') => setFormData(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
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
                    onClick={editingDepartment ? handleUpdateDepartment : handleCreateDepartment}
                    className="electric-glow"
                  >
                    {editingDepartment ? 'Update Department' : 'Create Department'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Departments Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {departments.map((department) => (
            <Card key={department.id} className="electric-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{department.name}</CardTitle>
                    <CardDescription>{department.code}</CardDescription>
                  </div>
                  <Badge variant={department.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {department.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {department.description && (
                  <p className="text-sm text-muted-foreground">{department.description}</p>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Candidates:</span>
                    <span className="font-medium">{department.candidateCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Active Tests:</span>
                    <span className="font-medium">
                      {(department.examinations || []).filter(e => e.isActive).length}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Final Cutoff:</span>
                    <span className="font-medium">{department.finalCutoffMark}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">UTME Cutoff:</span>
                    <span className="font-medium">{department.utmeCutoffMark}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">O'Level Cutoff:</span>
                    <span className="font-medium">{department.olevelCutoffAggregate}</span>
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    asChild
                  >
                    <Link href={`/admin/departments/${department.id}`}>
                      <Eye className="mr-1 h-3 w-3" />
                      View
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openEditDialog(department)}
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteDepartment(department.id)}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {departments.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Departments Found</h3>
              <p className="text-muted-foreground text-center mb-4">
                Get started by creating your first department with its admission requirements.
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="electric-glow">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Department
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </AdminSidebarLayout>
  );
}