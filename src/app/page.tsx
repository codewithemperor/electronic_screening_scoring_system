"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Users, BookOpen, Award, CheckCircle, GraduationCap, Building2 } from 'lucide-react';
import Link from 'next/link';

interface SystemStats {
  totalDepartments: number;
  activeCandidates: number;
  totalTests: number;
  admissionRate: number;
}

interface Department {
  id: string;
  name: string;
  code: string;
  status: string;
}

export default function Home() {
  const [stats, setStats] = useState<SystemStats>({ 
    totalDepartments: 0, 
    activeCandidates: 0, 
    totalTests: 0, 
    admissionRate: 0 
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [statsResponse, departmentsResponse] = await Promise.all([
          fetch('/api/public/stats'),
          fetch('/api/public/departments')
        ]);

        if (!statsResponse.ok) {
          throw new Error(`HTTP error! status: ${statsResponse.status}`);
        }
        if (!departmentsResponse.ok) {
          throw new Error(`HTTP error! status: ${departmentsResponse.status}`);
        }

        const statsData = await statsResponse.json();
        const departmentsData = await departmentsResponse.json();

        setStats(statsData);
        setDepartments(departmentsData.departments || []);
      } catch (err) {
        setError(err.message);
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="electric-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-6">
          <h2 className="text-2xl font-bold text-destructive mb-4">Error Loading Data</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-accent/10 to-background">
        <div className="absolute inset-0 electric-gradient opacity-5"></div>
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="electric-gradient-text">Electronic Scoring</span>
              <br />
              <span className="text-foreground">& Screening System</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Modern, efficient, and transparent admission processing with intelligent scoring algorithms and real-time eligibility validation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="electric-glow text-lg px-8 py-4">
                <Link href="/candidate/register">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Candidate Portal
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4 electric-border">
                <Link href="/admin/login">
                  <Building2 className="mr-2 h-5 w-5" />
                  Admin Portal
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center electric-border">
              <CardHeader>
                <Building2 className="h-8 w-8 mx-auto text-primary" />
                <CardTitle className="text-2xl font-bold">{stats.totalDepartments}</CardTitle>
                <CardDescription>Active Departments</CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center electric-border">
              <CardHeader>
                <Users className="h-8 w-8 mx-auto text-primary" />
                <CardTitle className="text-2xl font-bold">{stats.activeCandidates}</CardTitle>
                <CardDescription>Active Candidates</CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center electric-border">
              <CardHeader>
                <BookOpen className="h-8 w-8 mx-auto text-primary" />
                <CardTitle className="text-2xl font-bold">{stats.totalTests}</CardTitle>
                <CardDescription>Total Tests</CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center electric-border">
              <CardHeader>
                <Award className="h-8 w-8 mx-auto text-primary" />
                <CardTitle className="text-2xl font-bold">{stats.admissionRate}%</CardTitle>
                <CardDescription>Admission Rate</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Our System?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of academic screening with our cutting-edge platform designed for efficiency and transparency.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="electric-border">
              <CardHeader>
                <CheckCircle className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Smart Eligibility Check</CardTitle>
                <CardDescription>
                  Real-time validation of UTME and O'Level scores against department requirements with instant feedback.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="electric-border">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Comprehensive Testing</CardTitle>
                <CardDescription>
                  Advanced examination system with timed tests, automated scoring, and detailed performance analytics.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="electric-border">
              <CardHeader>
                <Award className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Transparent Admissions</CardTitle>
                <CardDescription>
                  Fair and transparent admission process with clear scoring criteria and real-time status updates.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Available Departments</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore our diverse range of academic programs with transparent admission requirements.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.length > 0 ? (
              departments.map((dept) => (
                <Card key={dept.id} className="electric-border hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{dept.name}</CardTitle>
                      <Badge variant={dept.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {dept.status}
                      </Badge>
                    </div>
                    <CardDescription>{dept.code}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/candidate/register?department=${dept.id}`}>
                        View Requirements
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No departments available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 electric-gradient">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have successfully navigated their admission process through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-4">
              <Link href="/candidate/register">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary">
              <Link href="/api/public/department-requirements">
                View Requirements
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2025 Electronic Scoring and Screening System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}