import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addTestScores() {
  console.log('🎯 Adding test scores for seed students...');

  try {
    // Get all candidates
    const candidates = await prisma.candidate.findMany({
      include: {
        user: true,
        department: {
          include: {
            examinations: {
              where: { isActive: true }
            }
          }
        },
        testAttempts: {
          where: { status: 'PENDING' }
        }
      }
    });

    console.log(`Found ${candidates.length} candidates`);

    for (const candidate of candidates) {
      console.log(`Processing candidate: ${candidate.fullName}`);

      // Get active examination for candidate's department
      const examination = candidate.department.examinations[0];
      if (!examination) {
        console.log(`No active examination found for ${candidate.fullName}'s department`);
        continue;
      }

      // Check if candidate has a test attempt
      let testAttempt = candidate.testAttempts[0];
      
      if (!testAttempt) {
        console.log(`Creating new test attempt for ${candidate.fullName}...`);
        testAttempt = await prisma.testAttempt.create({
          data: {
            candidateId: candidate.id,
            examinationId: examination.id,
            startTime: new Date(),
            status: 'PENDING',
            totalMarks: examination.totalMarks
          }
        });
      }

      // Calculate a score based on candidate's UTME score (higher UTME = higher test score)
      const baseScore = Math.floor((candidate.utmeScore / 400) * 100);
      const testScore = Math.min(baseScore, 95); // Cap at 95%
      const obtainedMarks = Math.floor((testScore / 100) * examination.totalMarks);

      // Get examination questions
      const examinationQuestions = await prisma.examinationQuestion.findMany({
        where: { examinationId: examination.id },
        include: { question: true }
      });

      // Check if test answers already exist
      const existingAnswers = await prisma.testAnswer.findMany({
        where: { testAttemptId: testAttempt.id }
      });

      if (existingAnswers.length > 0) {
        console.log(`Test answers already exist for ${candidate.fullName}, updating attempt only...`);
      } else {
        // Create test answers for each question
        const testAnswers = [];
        for (const eq of examinationQuestions) {
          // Simulate answers - correct 70-90% of the time based on candidate's performance
          const isCorrect = Math.random() < (testScore / 100);
          const selectedOption = isCorrect ? eq.question.correctAnswer : 
            Math.floor(Math.random() * 4); // Random wrong answer

          testAnswers.push({
            testAttemptId: testAttempt.id,
            questionId: eq.question.id,
            selectedAnswer: selectedOption,
            isCorrect,
            marksObtained: isCorrect ? eq.question.marks : 0
          });
        }

        // Create test answers
        await prisma.testAnswer.createMany({
          data: testAnswers
        });
      }

      // Update the test attempt
      await prisma.testAttempt.update({
        where: { id: testAttempt.id },
        data: {
          status: 'COMPLETED',
          endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours after start
          score: obtainedMarks
        }
      });

      console.log(`✅ Added test score for ${candidate.fullName}: ${obtainedMarks}/${examination.totalMarks} (${testScore}%)`);
    }

    console.log('✅ All test scores added successfully!');
  } catch (error) {
    console.error('❌ Error adding test scores:', error);
    throw error;
  }
}

addTestScores()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });