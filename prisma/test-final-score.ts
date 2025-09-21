import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testFinalScore() {
  console.log('🧮 Testing final score calculation...');

  try {
    // Get John Doe candidate
    const candidate = await prisma.candidate.findFirst({
      where: { fullName: 'John Doe' },
      include: {
        department: true,
        oLevelResults: {
          include: {
            gradingRule: true
          }
        },
        testAttempts: {
          where: {
            status: 'COMPLETED'
          },
          include: {
            examination: true
          }
        }
      }
    });

    if (!candidate) {
      console.log('❌ Candidate not found');
      return;
    }

    console.log('📊 Candidate Data:');
    console.log(`- Name: ${candidate.fullName}`);
    console.log(`- UTME Score: ${candidate.utmeScore}`);
    console.log(`- O'Level Aggregate: ${candidate.olevelAggregate}`);
    console.log(`- Department: ${candidate.department.name}`);
    console.log(`- Department UTME Cutoff: ${candidate.department.utmeCutoffMark}`);
    console.log(`- Department O'Level Cutoff: ${candidate.department.olevelCutoffAggregate}`);
    console.log(`- Department Final Cutoff: ${candidate.department.finalCutoffMark}`);
    console.log(`- Department Exam Weight: ${candidate.department.examPercentage}%`);
    console.log(`- Department O'Level Weight: ${candidate.department.olevelPercentage}%`);

    // Calculate O'Level percentage score
    const olevelTotalMarks = candidate.olevelAggregate;
    const maxOlevelMarks = 45; // Maximum possible O'Level aggregate
    const olevelPercentage = Math.round((olevelTotalMarks / maxOlevelMarks) * 100);

    console.log(`\n📈 Calculations:`);
    console.log(`- O'Level Percentage: ${olevelPercentage}% (${olevelTotalMarks}/${maxOlevelMarks})`);

    // Calculate exam percentage score
    let examTotalMarks = 0;
    let examObtainedMarks = 0;

    candidate.testAttempts.forEach(attempt => {
      if (attempt.score !== null) {
        examObtainedMarks += attempt.score;
        examTotalMarks += attempt.examination.totalMarks;
        console.log(`- Test Attempt: ${attempt.score}/${attempt.examination.totalMarks} (${attempt.examination.title})`);
      }
    });

    const examPercentage = examTotalMarks > 0 
      ? Math.round((examObtainedMarks / examTotalMarks) * 100) 
      : 0;

    console.log(`- Exam Percentage: ${examPercentage}% (${examObtainedMarks}/${examTotalMarks})`);

    // Calculate final score using department weights
    const department = candidate.department;
    const finalScore = Math.round(
      (examPercentage * department.examPercentage / 100) +
      (olevelPercentage * department.olevelPercentage / 100)
    );

    console.log(`- Final Score: ${finalScore}%`);
    console.log(`  - Exam Component: ${Math.round(examPercentage * department.examPercentage / 100)}%`);
    console.log(`  - O'Level Component: ${Math.round(olevelPercentage * department.olevelPercentage / 100)}%`);

    // Determine admission status
    const meetsUtmeCutoff = candidate.utmeScore >= department.utmeCutoffMark;
    const meetsOlevelCutoff = candidate.olevelAggregate >= department.olevelCutoffAggregate;
    const meetsFinalCutoff = finalScore >= department.finalCutoffMark;

    console.log(`\n✅ Requirements Check:`);
    console.log(`- Meets UTME Cutoff (${candidate.utmeScore} >= ${department.utmeCutoffMark}): ${meetsUtmeCutoff}`);
    console.log(`- Meets O'Level Cutoff (${candidate.olevelAggregate} >= ${department.olevelCutoffAggregate}): ${meetsOlevelCutoff}`);
    console.log(`- Meets Final Cutoff (${finalScore} >= ${department.finalCutoffMark}): ${meetsFinalCutoff}`);

    let admissionStatus: 'NOT_ADMITTED' | 'IN_PROGRESS' | 'ADMITTED' | 'REJECTED';
    
    if (!meetsUtmeCutoff || !meetsOlevelCutoff) {
      admissionStatus = 'NOT_ADMITTED';
    } else if (meetsFinalCutoff) {
      admissionStatus = 'ADMITTED';
    } else {
      admissionStatus = 'IN_PROGRESS';
    }

    console.log(`- Admission Status: ${admissionStatus}`);

    // Update candidate with calculated scores
    const updatedCandidate = await prisma.candidate.update({
      where: { id: candidate.id },
      data: {
        olevelPercentage,
        examPercentage,
        finalScore,
        admissionStatus
      }
    });

    console.log(`\n🎯 Updated Candidate:`);
    console.log(`- Final Score: ${updatedCandidate.finalScore}`);
    console.log(`- Admission Status: ${updatedCandidate.admissionStatus}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFinalScore();