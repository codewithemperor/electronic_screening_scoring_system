import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Nigerian States
  const states = await Promise.all([
    prisma.state.create({ data: { name: 'Lagos', code: 'LA' } }),
    prisma.state.create({ data: { name: 'Abuja', code: 'FC' } }),
    prisma.state.create({ data: { name: 'Kano', code: 'KN' } }),
    prisma.state.create({ data: { name: 'Rivers', code: 'RI' } }),
    prisma.state.create({ data: { name: 'Oyo', code: 'OY' } })
  ]);

  // Create LGAs for Lagos and Abuja
  const lagosLgas = await Promise.all([
    prisma.lga.create({ data: { name: 'Ikeja', code: 'IK', stateId: states[0].id } }),
    prisma.lga.create({ data: { name: 'Surulere', code: 'SU', stateId: states[0].id } }),
    prisma.lga.create({ data: { name: 'Lagos Island', code: 'LI', stateId: states[0].id } })
  ]);

  const abujaLgas = await Promise.all([
    prisma.lga.create({ data: { name: 'Garki', code: 'GA', stateId: states[1].id } }),
    prisma.lga.create({ data: { name: 'Wuse', code: 'WU', stateId: states[1].id } }),
    prisma.lga.create({ data: { name: 'Maitama', code: 'MA', stateId: states[1].id } })
  ]);

  // Create O'Level Subjects
  const subjects = await Promise.all([
    prisma.subject.create({ data: { name: 'Mathematics', code: 'MATH' } }),
    prisma.subject.create({ data: { name: 'English Language', code: 'ENG' } }),
    prisma.subject.create({ data: { name: 'Physics', code: 'PHY' } }),
    prisma.subject.create({ data: { name: 'Chemistry', code: 'CHEM' } }),
    prisma.subject.create({ data: { name: 'Biology', code: 'BIO' } }),
    prisma.subject.create({ data: { name: 'Economics', code: 'ECO' } }),
    prisma.subject.create({ data: { name: 'Government', code: 'GOV' } }),
    prisma.subject.create({ data: { name: 'Literature', code: 'LIT' } }),
    prisma.subject.create({ data: { name: 'Geography', code: 'GEO' } })
  ]);

  // Create Grading Rules
  const gradingRules = await Promise.all([
    prisma.gradingRule.create({ data: { grade: 'A1', marks: 9 } }),
    prisma.gradingRule.create({ data: { grade: 'B2', marks: 8 } }),
    prisma.gradingRule.create({ data: { grade: 'B3', marks: 7 } }),
    prisma.gradingRule.create({ data: { grade: 'C4', marks: 6 } }),
    prisma.gradingRule.create({ data: { grade: 'C5', marks: 5 } }),
    prisma.gradingRule.create({ data: { grade: 'C6', marks: 4 } }),
    prisma.gradingRule.create({ data: { grade: 'D7', marks: 3 } }),
    prisma.gradingRule.create({ data: { grade: 'E8', marks: 2 } }),
    prisma.gradingRule.create({ data: { grade: 'F9', marks: 1 } })
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
        finalCutoffMark: 70,
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
        finalCutoffMark: 75,
        utmeCutoffMark: 260,
        olevelCutoffAggregate: 27,
        status: 'ACTIVE'
      }
    }),
    prisma.department.create({
      data: {
        name: 'Medicine',
        code: 'MED',
        description: 'Bachelor of Medicine and Bachelor of Surgery',
        examPercentage: 80,
        olevelPercentage: 20,
        finalCutoffMark: 85,
        utmeCutoffMark: 280,
        olevelCutoffAggregate: 30,
        status: 'ACTIVE'
      }
    }),
    prisma.department.create({
      data: {
        name: 'Business Administration',
        code: 'BBA',
        description: 'Bachelor of Science in Business Administration',
        examPercentage: 60,
        olevelPercentage: 40,
        finalCutoffMark: 65,
        utmeCutoffMark: 230,
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
        finalCutoffMark: 68,
        utmeCutoffMark: 240,
        olevelCutoffAggregate: 24,
        status: 'ACTIVE'
      }
    })
  ]);

  // Create Questions for Computer Science
  const csQuestions = await Promise.all([
    prisma.question.create({
      data: {
        content: 'What is the time complexity of binary search?',
        options: JSON.stringify(['O(1)', 'O(log n)', 'O(n)', 'O(n log n)']),
        correctAnswer: 1,
        marks: 2,
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
        departmentId: departments[0].id,
        subjectId: subjects[0].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'What is the primary function of an operating system?',
        options: JSON.stringify(['Hardware management', 'Software development', 'Network security', 'Data analysis']),
        correctAnswer: 0,
        marks: 1,
        departmentId: departments[0].id,
        subjectId: subjects[0].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'Which programming language is primarily used for web development?',
        options: JSON.stringify(['Python', 'JavaScript', 'C++', 'Assembly']),
        correctAnswer: 1,
        marks: 1,
        departmentId: departments[0].id,
        subjectId: subjects[0].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'What does SQL stand for?',
        options: JSON.stringify(['Structured Query Language', 'Simple Query Language', 'Standard Query Logic', 'System Query Language']),
        correctAnswer: 0,
        marks: 1,
        departmentId: departments[0].id,
        subjectId: subjects[0].id
      }
    })
  ]);

  // Create Examinations
  const examinations = await Promise.all([
    prisma.examination.create({
      data: {
        title: 'Computer Science Aptitude Test',
        description: 'Entrance examination for Computer Science program',
        duration: 120,
        totalMarks: 10,
        passingMarks: 6,
        departmentId: departments[0].id,
        isActive: true
      }
    }),
    prisma.examination.create({
      data: {
        title: 'Electrical Engineering Assessment',
        description: 'Entrance examination for Electrical Engineering program',
        duration: 90,
        totalMarks: 8,
        passingMarks: 5,
        departmentId: departments[1].id,
        isActive: true
      }
    })
  ]);

  // Create Examination-Question relationships
  await Promise.all([
    prisma.examinationQuestion.create({
      data: {
        examinationId: examinations[0].id,
        questionId: csQuestions[0].id
      }
    }),
    prisma.examinationQuestion.create({
      data: {
        examinationId: examinations[0].id,
        questionId: csQuestions[1].id
      }
    }),
    prisma.examinationQuestion.create({
      data: {
        examinationId: examinations[0].id,
        questionId: csQuestions[2].id
      }
    }),
    prisma.examinationQuestion.create({
      data: {
        examinationId: examinations[0].id,
        questionId: csQuestions[3].id
      }
    }),
    prisma.examinationQuestion.create({
      data: {
        examinationId: examinations[0].id,
        questionId: csQuestions[4].id
      }
    })
  ]);

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 12);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@school.edu',
      password: adminPassword,
      role: 'ADMIN'
    }
  });

  await prisma.admin.create({
    data: {
      userId: adminUser.id,
      role: 'Super Administrator',
      isActive: true
    }
  });

  // Create Sample Candidates
  const candidate1Password = await bcrypt.hash('candidate123', 12);
  const candidate1User = await prisma.user.create({
    data: {
      email: 'john.doe@email.com',
      password: candidate1Password,
      role: 'CANDIDATE'
    }
  });

  const candidate1 = await prisma.candidate.create({
    data: {
      userId: candidate1User.id,
      fullName: 'John Doe',
      phone: '08012345678',
      dateOfBirth: new Date('2000-01-15'),
      address: '123 Lagos Street, Ikeja',
      stateId: states[0].id,
      lgaId: lagosLgas[0].id,
      utmeScore: 265,
      departmentId: departments[0].id,
      olevelAggregate: 28,
      admissionStatus: 'IN_PROGRESS'
    }
  });

  // Create O'Level Results for candidate 1
  await Promise.all([
    prisma.oLevelResult.create({
      data: {
        candidateId: candidate1.id,
        subjectId: subjects[0].id,
        grade: 'B2',
        gradingRuleId: gradingRules[1].id,
        schoolName: 'Excellent High School',
        examYear: 2023,
        examType: 'WAEC',
        regNumber: 'WAEC123456'
      }
    }),
    prisma.oLevelResult.create({
      data: {
        candidateId: candidate1.id,
        subjectId: subjects[1].id,
        grade: 'A1',
        gradingRuleId: gradingRules[0].id,
        schoolName: 'Excellent High School',
        examYear: 2023,
        examType: 'WAEC',
        regNumber: 'WAEC123456'
      }
    }),
    prisma.oLevelResult.create({
      data: {
        candidateId: candidate1.id,
        subjectId: subjects[2].id,
        grade: 'B3',
        gradingRuleId: gradingRules[2].id,
        schoolName: 'Excellent High School',
        examYear: 2023,
        examType: 'WAEC',
        regNumber: 'WAEC123456'
      }
    }),
    prisma.oLevelResult.create({
      data: {
        candidateId: candidate1.id,
        subjectId: subjects[3].id,
        grade: 'C4',
        gradingRuleId: gradingRules[3].id,
        schoolName: 'Excellent High School',
        examYear: 2023,
        examType: 'WAEC',
        regNumber: 'WAEC123456'
      }
    }),
    prisma.oLevelResult.create({
      data: {
        candidateId: candidate1.id,
        subjectId: subjects[4].id,
        grade: 'B2',
        gradingRuleId: gradingRules[1].id,
        schoolName: 'Excellent High School',
        examYear: 2023,
        examType: 'WAEC',
        regNumber: 'WAEC123456'
      }
    })
  ]);

  // Create Test Attempt for candidate 1
  const testAttempt1 = await prisma.testAttempt.create({
    data: {
      candidateId: candidate1.id,
      examinationId: examinations[0].id,
      startTime: new Date(),
      status: 'PENDING',
      totalMarks: examinations[0].totalMarks
    }
  });

  // Create another sample candidate
  const candidate2Password = await bcrypt.hash('candidate456', 12);
  const candidate2User = await prisma.user.create({
    data: {
      email: 'jane.smith@email.com',
      password: candidate2Password,
      role: 'CANDIDATE'
    }
  });

  const candidate2 = await prisma.candidate.create({
    data: {
      userId: candidate2User.id,
      fullName: 'Jane Smith',
      phone: '09087654321',
      dateOfBirth: new Date('1999-05-20'),
      address: '456 Abuja Road, Garki',
      stateId: states[1].id,
      lgaId: abujaLgas[0].id,
      utmeScore: 290,
      departmentId: departments[0].id,
      olevelAggregate: 35,
      admissionStatus: 'ADMITTED'
    }
  });

  console.log('✅ Database seeded successfully!');
  console.log('🎯 Admin credentials:');
  console.log('   Email: admin@school.edu');
  console.log('   Password: admin123');
  console.log('🎯 Candidate credentials:');
  console.log('   Email: john.doe@email.com');
  console.log('   Password: candidate123');
  console.log('   Email: jane.smith@email.com');
  console.log('   Password: candidate456');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });