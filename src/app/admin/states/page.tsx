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
  Eye, 
  MapPin, 
  Users, 
  Building,
  AlertCircle,
  Search
} from 'lucide-react';
import Link from 'next/link';

interface State {
  id: string;
  name: string;
  code: string;
  _count: {
    lgas: number;
    candidates: number;
  };
}

interface StateFormData {
  name: string;
  code: string;
}

export default function StatesPage() {
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingState, setEditingState] = useState<State | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<StateFormData>({
    name: '',
    code: ''
  });

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/states');
      if (!response.ok) throw new Error('Failed to fetch states');
      
      const data = await response.json();
      setStates(data.states || []);
    } catch (err) {
      setError(err.message);
      console.error('States fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateState = async () => {
    try {
      const response = await fetch('/api/admin/states', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to create state');

      await fetchStates();
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      setError(err.message);
      console.error('Create state error:', err);
    }
  };

  const handleUpdateState = async () => {
    if (!editingState) return;

    try {
      const response = await fetch(`/api/admin/states/${editingState.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to update state');

      await fetchStates();
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      setError(err.message);
      console.error('Update state error:', err);
    }
  };

  const handleDeleteState = async (id: string) => {
    if (!confirm('Are you sure you want to delete this state? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/states/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete state');

      await fetchStates();
    } catch (err) {
      setError(err.message);
      console.error('Delete state error:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: ''
    });
    setEditingState(null);
  };

  const openEditDialog = (state: State) => {
    setEditingState(state);
    setFormData({
      name: state.name,
      code: state.code
    });
    setIsDialogOpen(true);
  };

  const filteredStates = states.filter(state =>
    state.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    state.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <h1 className="text-3xl font-bold text-gray-900">States Management</h1>
              <p className="text-gray-600">Manage Nigerian states and their local government areas</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="electric-glow" onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add State
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingState ? 'Edit State' : 'Create New State'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingState 
                      ? 'Update state information'
                      : 'Add a new state to the system'
                    }
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">State Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Lagos"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="code">State Code</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                      placeholder="e.g., LA"
                    />
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
                    onClick={editingState ? handleUpdateState : handleCreateState}
                    className="electric-glow"
                  >
                    {editingState ? 'Update State' : 'Create State'}
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

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search states by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* States Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStates.map((state) => (
              <Card key={state.id} className="electric-border hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{state.name}</CardTitle>
                      <CardDescription>{state.code}</CardDescription>
                    </div>
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">LGAs:</span>
                      <span className="font-medium">{state._count.lgas}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Candidates:</span>
                      <span className="font-medium">{state._count.candidates}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      asChild
                    >
                      <Link href={`/admin/states/${state.id}`}>
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openEditDialog(state)}
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteState(state.id)}
                      disabled={state._count.lgas > 0 || state._count.candidates > 0}
                      className={state._count.lgas > 0 || state._count.candidates > 0 ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredStates.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No states found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'No states match your search criteria.' : 'Get started by adding your first state.'}
              </p>
              {!searchTerm && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="electric-glow" onClick={resetForm}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add State
                    </Button>
                  </DialogTrigger>
                </Dialog>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminSidebarLayout>
  );
}