import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

// Zod schema for registration
const registerSchema = z.object({
  personalDetails: z.object({
    fullName: z.string().min(3),
    email: z.string().email(),
    phone: z.string().min(10),
    dateOfBirth: z.string(),
    address: z.string().min(10),
    stateId: z.string(),
    lgaId: z.string()
  }),
  academicDetails: z.object({
    utmeScore: z.number().min(0).max(400),
    oLevelResults: z.array(z.object({
      subject: z.string(),
      grade: z.enum(['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'])
    })).min(5),
    departmentId: z.string()
  }),
  password: z.string().min(6)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.personalDetails.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user
    const user = await db.user.create({
      data: {
        email: validatedData.personalDetails.email,
        password: hashedPassword,
        role: 'CANDIDATE'
      }
    });

    // Calculate O'Level aggregate from the results
    let olevelAggregate = 0;
    const gradingRules = await db.gradingRule.findMany();
    
    for (const result of validatedData.academicDetails.oLevelResults) {
      const gradingRule = gradingRules.find(rule => rule.grade === result.grade);
      if (gradingRule) {
        olevelAggregate += gradingRule.marks;
      }
    }

    // Create candidate
    const candidate = await db.candidate.create({
      data: {
        userId: user.id,
        fullName: validatedData.personalDetails.fullName,
        phone: validatedData.personalDetails.phone,
        dateOfBirth: new Date(validatedData.personalDetails.dateOfBirth),
        address: validatedData.personalDetails.address,
        stateId: validatedData.personalDetails.stateId,
        lgaId: validatedData.personalDetails.lgaId,
        utmeScore: validatedData.academicDetails.utmeScore,
        departmentId: validatedData.academicDetails.departmentId,
        olevelAggregate: olevelAggregate
      }
    });

    // Create O'Level results
    for (const result of validatedData.academicDetails.oLevelResults) {
      // Get subject ID
      const subject = await db.subject.findFirst({
        where: { name: result.subject }
      });

      if (subject) {
        // Get grading rule
        const gradingRule = await db.gradingRule.findFirst({
          where: { grade: result.grade }
        });

        if (gradingRule) {
          await db.oLevelResult.create({
            data: {
              candidateId: candidate.id,
              subjectId: subject.id,
              grade: result.grade,
              gradingRuleId: gradingRule.id,
              schoolName: '', // Will be updated later
              examYear: new Date().getFullYear(),
              examType: 'WAEC', // Default, can be updated
              regNumber: '' // Will be updated later
            }
          });
        }
      }
    }

    // Assign departmental tests to the new candidate
    const departmentExaminations = await db.examination.findMany({
      where: {
        departmentId: validatedData.academicDetails.departmentId,
        isActive: true
      }
    });

    console.log(`Found ${departmentExaminations.length} active examinations for department`);

    for (const examination of departmentExaminations) {
      // Check if examination has questions before assigning
      const questionCount = await db.examinationQuestion.count({
        where: {
          examinationId: examination.id
        }
      });

      if (questionCount > 0) {
        await db.testAttempt.create({
          data: {
            candidateId: candidate.id,
            examinationId: examination.id,
            startTime: new Date(),
            status: 'PENDING',
            totalMarks: examination.totalMarks
          }
        });
        console.log(`Assigned test: ${examination.title} to candidate: ${candidate.fullName}`);
      } else {
        console.log(`Skipped examination ${examination.title} - no questions available`);
      }
    }

    return NextResponse.json({
      message: 'Registration successful',
      userId: user.id,
      candidateId: candidate.id,
      testsAssigned: departmentExaminations.length
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      // Format ZodError to be more user-friendly
      const formattedErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: formattedErrors,
          message: `Please check the following fields: ${formattedErrors.map(e => e.field).join(', ')}`
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to register candidate' },
      { status: 500 }
    );
  }
}