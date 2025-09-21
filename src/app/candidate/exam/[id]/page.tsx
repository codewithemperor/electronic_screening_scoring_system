"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Clock, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  BookOpen,
  Target,
  Timer,
  SkipForward,
  SkipBack
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api-client';

interface Question {
  id: string;
  content: string;
  options: string[];
  correctAnswer: number;
  marks: number;
}

interface Test {
  id: string;
  title: string;
  description?: string;
  duration: number;
  totalMarks: number;
  status: string;
  examination: {
    title: string;
    department: {
      name: string;
    };
  };
}

interface ExamState {
  currentQuestion: number;
  answers: { [key: number]: number | null };
  timeRemaining: number;
  isSubmitting: boolean;
  testStarted: boolean;
  testCompleted: boolean;
}

export default function ExamPage({ params }: { params: { id: string } }) {
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [examState, setExamState] = useState<ExamState>({
    currentQuestion: 0,
    answers: {},
    timeRemaining: 0,
    isSubmitting: false,
    testStarted: false,
    testCompleted: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTestData();
  }, [params.id]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (examState.testStarted && !examState.testCompleted && examState.timeRemaining > 0) {
      timer = setInterval(() => {
        setExamState(prev => {
          const newTime = prev.timeRemaining - 1;
          
          if (newTime <= 0) {
            // Auto-submit when time runs out
            handleSubmitTest();
            return { ...prev, timeRemaining: 0, testCompleted: true };
          }
          
          return { ...prev, timeRemaining: newTime };
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [examState.testStarted, examState.testCompleted, examState.timeRemaining]);

  const fetchTestData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [testResponse, questionsResponse] = await Promise.all([
        api.get(`/api/candidate/tests/${params.id}`),
        api.get(`/api/candidate/tests/${params.id}/questions`)
      ]);

      if (!testResponse.ok) throw new Error('Failed to fetch test data');
      if (!questionsResponse.ok) throw new Error('Failed to fetch questions');

      const testData = await testResponse.json();
      const questionsData = await questionsResponse.json();

      setTest(testData);
      setQuestions(questionsData);
      
      // Initialize exam state
      setExamState(prev => ({
        ...prev,
        timeRemaining: testData.duration * 60, // Convert minutes to seconds
        answers: {}
      }));
    } catch (err) {
      setError(err.message);
      console.error('Test data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const startTest = async () => {
    try {
      const response = await api.post(`/api/candidate/tests/${params.id}/start`);

      if (!response.ok) throw new Error('Failed to start test');

      setExamState(prev => ({
        ...prev,
        testStarted: true
      }));
    } catch (err) {
      setError(err.message);
      console.error('Start test error:', err);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setExamState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionIndex]: answerIndex
      }
    }));
  };

  const handleNextQuestion = () => {
    if (examState.currentQuestion < questions.length - 1) {
      setExamState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1
      }));
    }
  };

  const handlePreviousQuestion = () => {
    if (examState.currentQuestion > 0) {
      setExamState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion - 1
      }));
    }
  };

  const handleSubmitTest = async () => {
    setExamState(prev => ({ ...prev, isSubmitting: true }));

    try {
      const response = await api.post(`/api/candidate/tests/${params.id}/submit`, {
        answers: examState.answers
      });

      if (!response.ok) throw new Error('Failed to submit test');

      const result = await response.json();
      
      setExamState(prev => ({
        ...prev,
        testCompleted: true,
        isSubmitting: false
      }));
    } catch (err) {
      setError(err.message);
      setExamState(prev => ({ ...prev, isSubmitting: false }));
      console.error('Submit test error:', err);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const answeredQuestions = Object.keys(examState.answers).length;
    return (answeredQuestions / questions.length) * 100;
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
          <Button onClick={fetchTestData} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!test || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Test Not Found</h2>
          <Button asChild>
            <Link href="/candidate/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const currentQ = questions[examState.currentQuestion];

  if (examState.testCompleted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md electric-border">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <CardTitle>Test Completed!</CardTitle>
            <CardDescription>
              Your test has been submitted successfully.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Questions Answered</p>
                <p className="text-2xl font-bold">{Object.keys(examState.answers).length}/{questions.length}</p>
              </div>
              <Button className="w-full electric-glow" asChild>
                <Link href="/candidate/dashboard">
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!examState.testStarted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md electric-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              {test.title}
            </CardTitle>
            <CardDescription>{test.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-lg font-semibold">{test.duration} minutes</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Questions</p>
                <p className="text-lg font-semibold">{questions.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Marks</p>
                <p className="text-lg font-semibold">{test.totalMarks}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="text-lg font-semibold">{test.examination.department.name}</p>
              </div>
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Make sure you have a stable internet connection. The test will be automatically submitted when time runs out.
              </AlertDescription>
            </Alert>

            <Button 
              className="w-full electric-glow" 
              onClick={startTest}
            >
              Start Test
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold">{test.title}</h1>
              <Badge variant="outline">
                Question {examState.currentQuestion + 1} of {questions.length}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Timer className="h-4 w-4" />
                <span className={`font-mono font-bold ${examState.timeRemaining < 300 ? 'text-red-600' : 'text-primary'}`}>
                  {formatTime(examState.timeRemaining)}
                </span>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/candidate/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Exit
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{Math.round(getProgress())}%</span>
            </div>
            <Progress value={getProgress()} className="h-2" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Question Card */}
          <Card className="mb-6 electric-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Question {examState.currentQuestion + 1}
                </CardTitle>
                <Badge variant="outline">
                  {currentQ.marks} mark{currentQ.marks > 1 ? 's' : ''}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <p className="text-lg">{currentQ.content}</p>
              </div>
              
              {/* Options */}
              <RadioGroup 
                value={examState.answers[examState.currentQuestion]?.toString() || ""}
                onValueChange={(value) => handleAnswerSelect(examState.currentQuestion, parseInt(value))}
                className="space-y-3"
              >
                {currentQ.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Navigation */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePreviousQuestion}
                  disabled={examState.currentQuestion === 0}
                >
                  <SkipBack className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                <div className="text-sm text-muted-foreground">
                  {Object.keys(examState.answers).length} of {questions.length} answered
                </div>

                {examState.currentQuestion === questions.length - 1 ? (
                  <Button
                    onClick={handleSubmitTest}
                    disabled={examState.isSubmitting}
                    className="electric-glow"
                  >
                    {examState.isSubmitting ? 'Submitting...' : 'Submit Test'}
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={handleNextQuestion}>
                    Next
                    <SkipForward className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Question Navigator */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Question Navigator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-10 gap-2">
                {questions.map((_, index) => {
                  const isAnswered = examState.answers[index] !== undefined;
                  const isCurrent = index === examState.currentQuestion;
                  
                  return (
                    <Button
                      key={index}
                      variant={isCurrent ? "default" : isAnswered ? "secondary" : "outline"}
                      size="sm"
                      className="aspect-square p-0"
                      onClick={() => setExamState(prev => ({ ...prev, currentQuestion: index }))}
                    >
                      {index + 1}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}