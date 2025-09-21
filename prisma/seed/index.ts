import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Nigerian States
  const states = await Promise.all([
    prisma.state.create({
      data: { name: 'Lagos', code: 'LA' }
    }),
    prisma.state.create({
      data: { name: 'Abuja', code: 'AB' }
    }),
    prisma.state.create({
      data: { name: 'Kano', code: 'KN' }
    }),
    prisma.state.create({
      data: { name: 'Rivers', code: 'RV' }
    }),
    prisma.state.create({
      data: { name: 'Enugu', code: 'EN' }
    })
  ]);

  // Create LGAs for Lagos
  await Promise.all([
    prisma.lga.create({
      data: { name: 'Ikeja', stateId: states[0].id, code: 'IK' }
    }),
    prisma.lga.create({
      data: { name: 'Surulere', stateId: states[0].id, code: 'SU' }
    }),
    prisma.lga.create({
      data: { name: 'Lagos Island', stateId: states[0].id, code: 'LI' }
    })
  ]);

  // Create LGAs for Abuja
  await Promise.all([
    prisma.lga.create({
      data: { name: 'Abuja Municipal', stateId: states[1].id, code: 'AM' }
    }),
    prisma.lga.create({
      data: { name: 'Gwagwalada', stateId: states[1].id, code: 'GW' }
    })
  ]);

  // Create O'Level Subjects
  const subjects = await Promise.all([
    prisma.subject.create({
      data: { name: 'Mathematics', code: 'MATH' }
    }),
    prisma.subject.create({
      data: { name: 'English Language', code: 'ENG' }
    }),
    prisma.subject.create({
      data: { name: 'Physics', code: 'PHY' }
    }),
    prisma.subject.create({
      data: { name: 'Chemistry', code: 'CHEM' }
    }),
    prisma.subject.create({
      data: { name: 'Biology', code: 'BIO' }
    }),
    prisma.subject.create({
      data: { name: 'Economics', code: 'ECO' }
    }),
    prisma.subject.create({
      data: { name: 'Government', code: 'GOV' }
    }),
    prisma.subject.create({
      data: { name: 'Literature in English', code: 'LIT' }
    }),
    prisma.subject.create({
      data: { name: 'Geography', code: 'GEO' }
    })
  ]);

  // Create Grading Rules
  const gradingRules = await Promise.all([
    prisma.gradingRule.create({
      data: { grade: 'A1', marks: 9 }
    }),
    prisma.gradingRule.create({
      data: { grade: 'B2', marks: 8 }
    }),
    prisma.gradingRule.create({
      data: { grade: 'B3', marks: 7 }
    }),
    prisma.gradingRule.create({
      data: { grade: 'C4', marks: 6 }
    }),
    prisma.gradingRule.create({
      data: { grade: 'C5', marks: 5 }
    }),
    prisma.gradingRule.create({
      data: { grade: 'C6', marks: 4 }
    }),
    prisma.gradingRule.create({
      data: { grade: 'D7', marks: 3 }
    }),
    prisma.gradingRule.create({
      data: { grade: 'E8', marks: 2 }
    }),
    prisma.gradingRule.create({
      data: { grade: 'F9', marks: 1 }
    })
  ]);

  // Create Departments
  const departments = await Promise.all([
    prisma.department.create({
      data: {
        name: 'Computer Science',
        code: 'CS',
        description: 'Bachelor of Science in Computer Science',
        examPercentage: 70,
        olevelPercentage: 30,
        finalCutoffMark: 65,
        utmeCutoffMark: 250,
        olevelCutoffAggregate: 25,
        status: 'ACTIVE'
      }
    }),
    prisma.department.create({
      data: {
        name: 'Electrical Engineering',
        code: 'EE',
        description: 'Bachelor of Engineering in Electrical Engineering',
        examPercentage: 75,
        olevelPercentage: 25,
        finalCutoffMark: 70,
        utmeCutoffMark: 260,
        olevelCutoffAggregate: 28,
        status: 'ACTIVE'
      }
    }),
    prisma.department.create({
      data: {
        name: 'Medicine',
        code: 'MED',
        description: 'Bachelor of Medicine, Bachelor of Surgery (MBBS)',
        examPercentage: 80,
        olevelPercentage: 20,
        finalCutoffMark: 75,
        utmeCutoffMark: 280,
        olevelCutoffAggregate: 30,
        status: 'ACTIVE'
      }
    }),
    prisma.department.create({
      data: {
        name: 'Business Administration',
        code: 'BUS',
        description: 'Bachelor of Science in Business Administration',
        examPercentage: 60,
        olevelPercentage: 40,
        finalCutoffMark: 60,
        utmeCutoffMark: 240,
        olevelCutoffAggregate: 22,
        status: 'ACTIVE'
      }
    }),
    prisma.department.create({
      data: {
        name: 'Mass Communication',
        code: 'MAC',
        description: 'Bachelor of Science in Mass Communication',
        examPercentage: 65,
        olevelPercentage: 35,
        finalCutoffMark: 62,
        utmeCutoffMark: 245,
        olevelCutoffAggregate: 24,
        status: 'ACTIVE'
      }
    })
  ]);

  // Create Sample Questions for Computer Science
  const csQuestions = await Promise.all([
    prisma.question.create({
      data: {
        content: 'What is the time complexity of binary search?',
        options: JSON.stringify(['O(1)', 'O(log n)', 'O(n)', 'O(n²)']),
        correctAnswer: 1,
        marks: 2,
        difficulty: 2,
        departmentId: departments[0].id,
        subjectId: subjects[0].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'Which data structure follows LIFO principle?',
        options: JSON.stringify(['Queue', 'Stack', 'Array', 'Linked List']),
        correctAnswer: 1,
        marks: 1,
        difficulty: 1,
        departmentId: departments[0].id,
        subjectId: subjects[0].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'What does SQL stand for?',
        options: JSON.stringify([
          'Structured Query Language',
          'Simple Query Language',
          'Standard Query Language',
          'System Query Language'
        ]),
        correctAnswer: 0,
        marks: 1,
        difficulty: 1,
        departmentId: departments[0].id,
        subjectId: subjects[1].id
      }
    })
  ]);

  // Create Sample Examination for Computer Science
  const csExam = await prisma.examination.create({
    data: {
      title: 'Computer Science Entrance Examination',
      description: 'Comprehensive test for Computer Science program admission',
      duration: 120, // 2 hours
      totalMarks: 10,
      passingMarks: 6,
      departmentId: departments[0].id,
      isActive: true
    }
  });

  // Link questions to examination
  await Promise.all(csQuestions.map(question =>
    prisma.examinationQuestion.create({
      data: {
        examinationId: csExam.id,
        questionId: question.id
      }
    })
  ));

  // Create Sample Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@screening.com',
      password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeZeUfkZMBs9kYZP6', // password: admin123
      role: 'ADMIN'
    }
  });

  await prisma.admin.create({
    data: {
      userId: adminUser.id,
      role: 'Super Admin',
      isActive: true
    }
  });

  console.log('✅ Database seeded successfully!');
  console.log(`📊 Created ${states.length} states`);
  console.log(`📚 Created ${subjects.length} subjects`);
  console.log(`📈 Created ${gradingRules.length} grading rules`);
  console.log(`🏛️ Created ${departments.length} departments`);
  console.log(`❓ Created ${csQuestions.length} questions`);
  console.log(`📝 Created 1 examination`);
  console.log(`👤 Created 1 admin user (admin@screening.com / admin123)`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });