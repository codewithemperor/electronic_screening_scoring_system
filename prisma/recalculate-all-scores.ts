import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function recalculateAllScores() {
  console.log('🔄 Recalculating final scores for all candidates...');

  try {
    const candidates = await prisma.candidate.findMany({
      include: {
        department: true,
        testAttempts: {
          where: {
            status: 'COMPLETED'
          },
          include: {
            examination: true
          }
        },
        oLevelResults: {
          include: {
            gradingRule: true
          }
        }
      }
    });

    console.log(`Found ${candidates.length} candidates`);

    for (const candidate of candidates) {
      console.log(`\n📊 Processing: ${candidate.fullName}`);
      
      // Calculate O'Level percentage score using real grading data
      const gradingRules = await prisma.gradingRule.findMany({
        orderBy: { marks: 'desc' }
      });
      
      const maxGradeScore = Math.max(...gradingRules.map(rule => rule.marks));
      const maxPossibleScore = maxGradeScore * 9; // Assuming 9 subjects maximum
      
      let totalObtainedMarks = 0;
      let totalPossibleMarks = 0;
      
      if (candidate.oLevelResults && candidate.oLevelResults.length > 0) {
        candidate.oLevelResults.forEach(result => {
          if (result.gradingRule) {
            totalObtainedMarks += result.gradingRule.marks;
            totalPossibleMarks += maxGradeScore;
          }
        });
      }
      
      const olevelPercentage = totalPossibleMarks > 0 
        ? Math.round((totalObtainedMarks / totalPossibleMarks) * 100)
        : Math.round((candidate.olevelAggregate / maxPossibleScore) * 100);

      // Calculate exam percentage score
      let examTotalMarks = 0;
      let examObtainedMarks = 0;

      candidate.testAttempts.forEach(attempt => {
        if (attempt.score !== null) {
          examObtainedMarks += attempt.score;
          examTotalMarks += attempt.examination.totalMarks;
        }
      });

      const examPercentage = examTotalMarks > 0 
        ? Math.round((examObtainedMarks / examTotalMarks) * 100) 
        : 0;

      // Calculate final score using department weights
      const department = candidate.department;
      const finalScore = Math.round(
        (examPercentage * department.examPercentage / 100) +
        (olevelPercentage * department.olevelPercentage / 100)
      );

      // Determine admission status
      const meetsUtmeCutoff = candidate.utmeScore >= department.utmeCutoffMark;
      const meetsOlevelCutoff = candidate.olevelAggregate >= department.olevelCutoffAggregate;
      const meetsFinalCutoff = finalScore >= department.finalCutoffMark;

      let admissionStatus: 'NOT_ADMITTED' | 'IN_PROGRESS' | 'ADMITTED' | 'REJECTED';
      
      if (!meetsUtmeCutoff || !meetsOlevelCutoff) {
        admissionStatus = 'NOT_ADMITTED';
      } else if (meetsFinalCutoff) {
        admissionStatus = 'ADMITTED';
      } else {
        admissionStatus = 'IN_PROGRESS';
      }

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

      console.log(`  - UTME: ${candidate.utmeScore}/${department.utmeCutoffMark} ✓`);
      console.log(`  - O'Level: ${candidate.olevelAggregate}/${department.olevelCutoffAggregate} ✓`);
      console.log(`  - Exam: ${examPercentage}% (${examObtainedMarks}/${examTotalMarks})`);
      console.log(`  - O'Level %: ${olevelPercentage}%`);
      console.log(`  - Final Score: ${finalScore}% (cutoff: ${department.finalCutoffMark}%)`);
      console.log(`  - Status: ${admissionStatus}`);
    }

    console.log('\n✅ All candidate scores recalculated successfully!');

  } catch (error) {
    console.error('❌ Error recalculating scores:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

recalculateAllScores().catch(console.error);