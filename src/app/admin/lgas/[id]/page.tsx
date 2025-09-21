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
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  admissionStatus: string;
}

interface Lga {
  id: string;
  name: string;
  code: string;
  state: {
    id: string;
    name: string;
    code: string;
  };
  candidates: Candidate[];
  _count: {
    candidates: number;
  };
}

export default function LgaDetailPage() {
  const params = useParams();
  const [lga, setLga] = useState<Lga | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLga();
  }, [params.id]);

  const fetchLga = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/lgas/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch LGA');
      
      const data = await response.json();
      setLga(data);
    } catch (err) {
      setError(err.message);
      console.error('LGA fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this LGA? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/lgas/${params.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete LGA');

      // Redirect to LGAs list
      window.location.href = '/admin/lgas';
    } catch (err) {
      setError(err.message);
      console.error('Delete LGA error:', err);
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
          <Button onClick={() => window.location.href = '/admin/lgas'} variant="outline">
            Back to LGAs
          </Button>
        </div>
      </div>
    );
  }

  if (!lga) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">LGA Not Found</h2>
          <Button asChild>
            <Link href="/admin/lgas">Back to LGAs</Link>
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
                  <Link href="/admin/lgas">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to LGAs
                  </Link>
                </Button>
                <Badge variant="default">
                  Active
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{lga.name}</h1>
              <p className="text-gray-600">{lga.code} • {lga.state.name}</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" asChild>
                <Link href={`/admin/lgas/${lga.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDelete}
                disabled={lga._count.candidates > 0}
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
            {/* LGA Overview */}
            <Card className="electric-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="mr-2 h-5 w-5" />
                  LGA Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">LGA Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">LGA Code:</span>
                        <span className="font-medium">{lga.code}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">State:</span>
                        <span className="font-medium">{lga.state.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Candidates:</span>
                        <span className="font-medium">{lga._count.candidates}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Candidates */}
            <Card className="electric-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Candidates
                </CardTitle>
                <CardDescription>
                  Candidates from {lga.name} LGA
                </CardDescription>
              </CardHeader>
              <CardContent>
                {lga.candidates.length > 0 ? (
                  <div className="space-y-3">
                    {lga.candidates.map((candidate) => (
                      <div key={candidate.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{candidate.firstName} {candidate.lastName}</h4>
                          <p className="text-sm text-muted-foreground">{candidate.email}</p>
                          <p className="text-xs text-muted-foreground">{candidate.phone}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            candidate.admissionStatus === 'ADMITTED' ? 'default' : 
                            candidate.admissionStatus === 'IN_PROGRESS' ? 'secondary' : 'outline'
                          }>
                            {candidate.admissionStatus.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No candidates found for this LGA</p>
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
                  <Users className="h-8 w-8 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold">{lga._count.candidates}</p>
                  <p className="text-sm text-muted-foreground">Candidates</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="electric-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/admin/candidates?lga=${lga.id}`}>
                    <Users className="mr-2 h-4 w-4" />
                    View Candidates
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/admin/states/${lga.state.id}`}>
                    <MapPin className="mr-2 h-4 w-4" />
                    View State
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Status Alert */}
            {lga._count.candidates === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This LGA has no candidates yet. You can safely delete it if needed.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </AdminSidebarLayout>
  );
}