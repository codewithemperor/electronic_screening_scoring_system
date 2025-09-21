"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AdminSidebarLayout } from '@/components/admin/sidebar';
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Building,
  Edit,
  Trash2,
  AlertCircle,
  Plus
} from 'lucide-react';
import Link from 'next/link';

interface Lga {
  id: string;
  name: string;
  stateId: string;
  _count: {
    candidates: number;
  };
}

interface State {
  id: string;
  name: string;
  code: string;
  lgas: Lga[];
  _count: {
    lgas: number;
    candidates: number;
  };
}

export default function StateDetailPage() {
  const params = useParams();
  const [state, setState] = useState<State | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchState();
  }, [params.id]);

  const fetchState = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/states/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch state');
      
      const data = await response.json();
      setState(data);
    } catch (err) {
      setError(err.message);
      console.error('State fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this state? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/states/${params.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete state');

      // Redirect to states list
      window.location.href = '/admin/states';
    } catch (err) {
      setError(err.message);
      console.error('Delete state error:', err);
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
          <Button onClick={() => window.location.href = '/admin/states'} variant="outline">
            Back to States
          </Button>
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">State Not Found</h2>
          <Button asChild>
            <Link href="/admin/states">Back to States</Link>
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
                  <Link href="/admin/states">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to States
                  </Link>
                </Button>
                <Badge variant="default">
                  Active
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{state.name}</h1>
              <p className="text-gray-600">{state.code}</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" asChild>
                <Link href={`/admin/states/${state.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDelete}
                disabled={state._count.lgas > 0 || state._count.candidates > 0}
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
            {/* State Overview */}
            <Card className="electric-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  State Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">State Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">State Code:</span>
                        <span className="font-medium">{state.code}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total LGAs:</span>
                        <span className="font-medium">{state._count.lgas}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Candidates:</span>
                        <span className="font-medium">{state._count.candidates}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Local Government Areas */}
            <Card className="electric-border">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Building className="mr-2 h-5 w-5" />
                    Local Government Areas
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/admin/lgas?state=${state.id}`}>
                      <Plus className="mr-1 h-3 w-3" />
                      Add LGA
                    </Link>
                  </Button>
                </CardTitle>
                <CardDescription>
                  Local government areas under {state.name} state
                </CardDescription>
              </CardHeader>
              <CardContent>
                {state.lgas.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {state.lgas.map((lga) => (
                      <div key={lga.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{lga.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {lga._count?.candidates || 0} candidate{(lga._count?.candidates || 0) !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <Badge variant="outline">
                          Active
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No LGAs found for this state</p>
                    <Button asChild>
                      <Link href={`/admin/lgas?state=${state.id}`}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add First LGA
                      </Link>
                    </Button>
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
                  <MapPin className="mr-2 h-5 w-5" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Building className="h-8 w-8 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold">{state._count.lgas}</p>
                  <p className="text-sm text-muted-foreground">LGAs</p>
                </div>
                
                <div className="text-center">
                  <Users className="h-8 w-8 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold">{state._count.candidates}</p>
                  <p className="text-sm text-muted-foreground">Candidates</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="electric-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="mr-2 h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/admin/lgas?state=${state.id}`}>
                    <Building className="mr-2 h-4 w-4" />
                    Manage LGAs
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/admin/candidates?state=${state.id}`}>
                    <Users className="mr-2 h-4 w-4" />
                    View Candidates
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Status Alert */}
            {state._count.lgas === 0 && state._count.candidates === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This state has no LGAs or candidates yet. You can safely delete it if needed.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </AdminSidebarLayout>
  );
}