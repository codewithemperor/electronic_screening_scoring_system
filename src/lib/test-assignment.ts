import { db } from '@/lib/db';

/**
 * Assign departmental tests to a candidate
 * This function automatically assigns all active examinations for a candidate's department
 * that have questions available
 */
export async function assignDepartmentalTests(candidateId: string) {
  try {
    // Get the candidate's department
    const candidate = await db.candidate.findUnique({
      where: { id: candidateId },
      select: {
        departmentId: true,
        fullName: true,
        testAttempts: {
          select: {
            examinationId: true
          }
        }
      }
    });

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    // Get existing test attempt examination IDs to avoid duplicates
    const existingTestExaminationIds = candidate.testAttempts.map(ta => ta.examinationId);

    // Get active examinations for the department that aren't already assigned
    const departmentExaminations = await db.examination.findMany({
      where: {
        departmentId: candidate.departmentId,
        isActive: true,
        id: {
          notIn: existingTestExaminationIds
        }
      }
    });

    let assignedTests = 0;

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
        assignedTests++;
      } else {
        console.log(`Skipped examination ${examination.title} - no questions available`);
      }
    }

    return {
      success: true,
      assignedTests,
      message: `Assigned ${assignedTests} test(s) to candidate ${candidate.fullName}`
    };
  } catch (error) {
    console.error('Error assigning departmental tests:', error);
    return {
      success: false,
      assignedTests: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Assign tests to all candidates who don't have any test attempts
 * This is useful for bulk assignment or fixing missing test assignments
 */
export async function assignTestsToAllCandidatesWithoutTests() {
  try {
    // Get all candidates without test attempts
    const candidatesWithoutTests = await db.candidate.findMany({
      where: {
        testAttempts: {
          none: {}
        }
      },
      select: {
        id: true,
        fullName: true,
        department: {
          select: {
            name: true
          }
        }
      }
    });

    console.log(`Found ${candidatesWithoutTests.length} candidates without test attempts`);

    let totalAssigned = 0;
    const results = [];

    for (const candidate of candidatesWithoutTests) {
      const result = await assignDepartmentalTests(candidate.id);
      results.push({
        candidateName: candidate.fullName,
        department: candidate.department.name,
        ...result
      });
      
      if (result.success) {
        totalAssigned += result.assignedTests;
      }
    }

    return {
      success: true,
      totalCandidatesProcessed: candidatesWithoutTests.length,
      totalTestsAssigned: totalAssigned,
      results
    };
  } catch (error) {
    console.error('Error assigning tests to all candidates:', error);
    return {
      success: false,
      totalCandidatesProcessed: 0,
      totalTestsAssigned: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Create a new examination and automatically assign it to all candidates
 * in the same department who don't already have this test
 */
export async function createAndAssignExamination(data: {
  title: string;
  description?: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  departmentId: string;
}) {
  try {
    // Create the examination
    const examination = await db.examination.create({
      data: {
        title: data.title,
        description: data.description,
        duration: data.duration,
        totalMarks: data.totalMarks,
        passingMarks: data.passingMarks,
        departmentId: data.departmentId,
        isActive: true
      }
    });

    console.log(`Created examination: ${examination.title}`);

    // Get all candidates in the department
    const candidates = await db.candidate.findMany({
      where: {
        departmentId: data.departmentId
      },
      select: {
        id: true,
        fullName: true
      }
    });

    console.log(`Found ${candidates.length} candidates in department`);

    let assignedCount = 0;

    for (const candidate of candidates) {
      // Check if candidate already has this examination
      const existingAttempt = await db.testAttempt.findFirst({
        where: {
          candidateId: candidate.id,
          examinationId: examination.id
        }
      });

      if (!existingAttempt) {
        await db.testAttempt.create({
          data: {
            candidateId: candidate.id,
            examinationId: examination.id,
            startTime: new Date(),
            status: 'PENDING',
            totalMarks: examination.totalMarks
          }
        });
        console.log(`Assigned new test to candidate: ${candidate.fullName}`);
        assignedCount++;
      }
    }

    return {
      success: true,
      examination,
      assignedTo: assignedCount,
      message: `Created examination and assigned to ${assignedCount} candidates`
    };
  } catch (error) {
    console.error('Error creating and assigning examination:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}