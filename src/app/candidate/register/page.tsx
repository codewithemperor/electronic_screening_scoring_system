"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, CheckCircle, XCircle, AlertCircle, GraduationCap } from 'lucide-react';
import Link from 'next/link';

interface OLevelResult {
  subject: string;
  grade: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
  utmeCutoffMark: number;
  olevelCutoffAggregate: number;
  finalCutoffMark: number;
}

interface EligibilityResponse {
  eligible: boolean;
  utme: { required: number; achieved: number; passed: boolean };
  olevel: { required: number; achieved: number; passed: boolean };
  department: string;
  alternatives: Array<{
    name: string;
    utmeRequired: number;
    olevelRequired: number;
  }>;
  message: string;
}

export default function CandidateRegister() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Eligibility check data
  const [utmeScore, setUtmeScore] = useState('');
  const [oLevelResults, setOLevelResults] = useState<OLevelResult[]>([
    { subject: '', grade: '' },
    { subject: '', grade: '' },
    { subject: '', grade: '' },
    { subject: '', grade: '' },
    { subject: '', grade: '' }
  ]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  
  // API data
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResponse | null>(null);
  
  // Registration form data
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    stateId: '',
    lgaId: '',
    password: '',
    confirmPassword: ''
  });

  const [states, setStates] = useState<any[]>([]);
  const [lgas, setLgas] = useState<any[]>([]);
  const [loadingLgas, setLoadingLgas] = useState(false);

  useEffect(() => {
    fetchDepartments();
    fetchSubjects();
    fetchStates();
  }, []);

  useEffect(() => {
    if (formData.stateId) {
      fetchLgas(formData.stateId);
    }
  }, [formData.stateId]);

  useEffect(() => {
    console.log('lgas state changed:', lgas);
  }, [lgas]);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/public/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/subjects');
      if (response.ok) {
        const data = await response.json();
        setSubjects(data.map((s: any) => s.name));
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchStates = async () => {
    try {
      const response = await fetch('/api/states');
      if (response.ok) {
        const data = await response.json();
        console.log('States fetched:', data);
        setStates(data);
      } else {
        console.error('Failed to fetch states:', response.status);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  const fetchLgas = async (stateId: string) => {
    try {
      console.log('Fetching LGAs for stateId:', stateId);
      setLoadingLgas(true);
      const response = await fetch(`/api/lgas/${stateId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('LGAs fetched:', data);
        setLgas(data);
      } else {
        console.error('Failed to fetch LGAs:', response.status);
        setLgas([]);
      }
    } catch (error) {
      console.error('Error fetching LGAs:', error);
      setLgas([]);
    } finally {
      setLoadingLgas(false);
    }
  };

  const checkEligibility = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/check-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utmeScore: parseInt(utmeScore),
          oLevelResults: oLevelResults.filter(r => r.subject && r.grade),
          departmentId: selectedDepartment
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: EligibilityResponse = await response.json();
      setEligibilityResult(result);

      if (result.eligible) {
        setStep(2);
      }
    } catch (err) {
      setError(err.message);
      console.error('Eligibility check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOLevelChange = (index: number, field: keyof OLevelResult, value: string) => {
    const newResults = [...oLevelResults];
    newResults[index] = { ...newResults[index], [field]: value };
    setOLevelResults(newResults);
  };

  const handleRegister = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalDetails: {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            dateOfBirth: formData.dateOfBirth,
            address: formData.address,
            stateId: formData.stateId,
            lgaId: formData.lgaId
          },
          academicDetails: {
            utmeScore: parseInt(utmeScore),
            oLevelResults: oLevelResults.filter(r => r.subject && r.grade),
            departmentId: selectedDepartment
          },
          password: formData.password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Redirect to login on success
      window.location.href = '/candidate/login';
    } catch (err) {
      setError(err.message);
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const grades = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-primary hover:underline mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold mb-2">Candidate Registration</h1>
          <p className="text-muted-foreground">
            {step === 1 ? 'Check your eligibility first' : 'Complete your registration'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={step === 1 ? 50 : 100} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>Step 1: Eligibility Check</span>
            <span>Step 2: Registration</span>
          </div>
        </div>

        {/* Step 1: Eligibility Check */}
        {step === 1 && (
          <Card className="electric-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="mr-2 h-5 w-5" />
                Eligibility Check
              </CardTitle>
              <CardDescription>
                Please enter your UTME score and O'Level results to check your eligibility for your selected department.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* UTME Score */}
              <div className="space-y-2">
                <Label htmlFor="utmeScore">UTME Score (0-400)</Label>
                <Input
                  id="utmeScore"
                  type="number"
                  min="0"
                  max="400"
                  value={utmeScore}
                  onChange={(e) => setUtmeScore(e.target.value)}
                  placeholder="Enter your UTME score"
                />
              </div>

              {/* Department Selection */}
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your preferred department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code}) - Min: {dept.utmeCutoffMark}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* O'Level Results */}
              <div className="space-y-4">
                <Label>O'Level Results (Minimum 5 subjects)</Label>
                <div className="grid gap-4">
                  {oLevelResults.map((result, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Select
                        value={result.subject}
                        onValueChange={(value) => handleOLevelChange(index, 'subject', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={result.grade}
                        onValueChange={(value) => handleOLevelChange(index, 'grade', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {grades.map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Eligibility Result */}
              {eligibilityResult && (
                <Alert className={eligibilityResult.eligible ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <div className="flex items-center">
                    {eligibilityResult.eligible ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className="ml-2">
                      {eligibilityResult.message}
                    </AlertDescription>
                  </div>
                  
                  {!eligibilityResult.eligible && eligibilityResult.alternatives.length > 0 && (
                    <div className="mt-4">
                      <p className="font-medium mb-2">Alternative Departments:</p>
                      <div className="space-y-2">
                        {eligibilityResult.alternatives.map((alt, index) => (
                          <Badge key={index} variant="outline" className="mr-2">
                            {alt.name} (UTME: {alt.utmeRequired}, O'Level: {alt.olevelRequired})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </Alert>
              )}

              {/* Error */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="ml-2">{error}</AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end">
                <Button 
                  onClick={checkEligibility} 
                  disabled={loading || !utmeScore || !selectedDepartment}
                  className="electric-glow"
                >
                  {loading ? 'Checking...' : 'Check Eligibility'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Registration Form */}
        {step === 2 && eligibilityResult?.eligible && (
          <Card className="electric-border">
            <CardHeader>
              <CardTitle>Complete Registration</CardTitle>
              <CardDescription>
                You are eligible! Please complete your registration details below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      placeholder="Enter your full name (minimum 3 characters)"
                    />
                    {formData.fullName.length > 0 && formData.fullName.length < 3 && (
                      <p className="text-sm text-destructive">Name must be at least 3 characters long</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="Enter your phone number (minimum 10 characters)"
                    />
                    {formData.phone.length > 0 && formData.phone.length < 10 && (
                      <p className="text-sm text-destructive">Phone number must be at least 10 characters long</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Enter your address (minimum 10 characters)"
                  />
                  {formData.address.length > 0 && formData.address.length < 10 && (
                    <p className="text-sm text-destructive">Address must be at least 10 characters long</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">State of Origin</Label>
                    <Select value={formData.stateId} onValueChange={(value) => {
                      console.log('State selected:', value);
                      setFormData({...formData, stateId: value, lgaId: ''});
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((state) => (
                          <SelectItem key={state.id} value={state.id}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lga">LGA of Origin</Label>
                    <Select value={formData.lgaId} onValueChange={(value) => {
                      console.log('LGA selected:', value);
                      setFormData({...formData, lgaId: value});
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingLgas ? "Loading LGAs..." : formData.stateId ? "Select LGA" : "Select a state first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingLgas ? (
                          <div className="py-1.5 px-2 text-sm text-muted-foreground">Loading LGAs...</div>
                        ) : lgas.length === 0 ? (
                          formData.stateId ? (
                            <div className="py-1.5 px-2 text-sm text-muted-foreground">No LGAs found</div>
                          ) : (
                            <div className="py-1.5 px-2 text-sm text-muted-foreground">Select a state first</div>
                          )
                        ) : (
                          lgas.map((lga) => (
                            <SelectItem key={lga.id} value={lga.id}>
                              {lga.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Account Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="Create a password (minimum 6 characters)"
                    />
                    {formData.password.length > 0 && formData.password.length < 6 && (
                      <p className="text-sm text-destructive">Password must be at least 6 characters long</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      placeholder="Confirm your password"
                    />
                    {formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword && (
                      <p className="text-sm text-destructive">Passwords do not match</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Academic Summary */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Academic Summary</h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">UTME Score:</p>
                      <p>{utmeScore}</p>
                    </div>
                    <div>
                      <p className="font-medium">Department:</p>
                      <p>{departments.find(d => d.id === selectedDepartment)?.name}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="ml-2">{error}</AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button 
                  onClick={handleRegister}
                  disabled={loading || !formData.fullName || !formData.email || !formData.password || formData.password !== formData.confirmPassword}
                  className="electric-glow"
                >
                  {loading ? 'Registering...' : 'Complete Registration'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}