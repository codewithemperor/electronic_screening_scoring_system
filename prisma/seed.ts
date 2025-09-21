import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data (optional - comment out if you want to preserve existing data)
  console.log('🧹 Clearing existing data...');
  await prisma.testAnswer.deleteMany();
  await prisma.testAttempt.deleteMany();
  await prisma.examinationQuestion.deleteMany();
  await prisma.oLevelResult.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.user.deleteMany();
  await prisma.question.deleteMany();
  await prisma.examination.deleteMany();
  await prisma.department.deleteMany();
  await prisma.gradingRule.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.lga.deleteMany();
  await prisma.state.deleteMany();

  // Create Nigerian States
  console.log('📍 Creating states...');
  const states = await Promise.all([
    prisma.state.create({ data: { name: 'Lagos', code: 'LA' } }),
    prisma.state.create({ data: { name: 'Abuja', code: 'FC' } }),
    prisma.state.create({ data: { name: 'Kano', code: 'KN' } }),
    prisma.state.create({ data: { name: 'Rivers', code: 'RI' } }),
    prisma.state.create({ data: { name: 'Oyo', code: 'OY' } })
  ]);

  // Create LGAs for each state
  console.log('🏘️ Creating LGAs...');
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

  const kanoLgas = await Promise.all([
    prisma.lga.create({ data: { name: 'Nassarawa', code: 'NA', stateId: states[2].id } }),
    prisma.lga.create({ data: { name: 'Fagge', code: 'FA', stateId: states[2].id } }),
    prisma.lga.create({ data: { name: 'Dala', code: 'DA', stateId: states[2].id } })
  ]);

  const riversLgas = await Promise.all([
    prisma.lga.create({ data: { name: 'Port Harcourt', code: 'PH', stateId: states[3].id } }),
    prisma.lga.create({ data: { name: 'Obio/Akpor', code: 'OA', stateId: states[3].id } }),
    prisma.lga.create({ data: { name: 'Eleme', code: 'EL', stateId: states[3].id } })
  ]);

  const oyoLgas = await Promise.all([
    prisma.lga.create({ data: { name: 'Ibadan North', code: 'IBN', stateId: states[4].id } }),
    prisma.lga.create({ data: { name: 'Ibadan South', code: 'IBS', stateId: states[4].id } }),
    prisma.lga.create({ data: { name: 'Oyo Town', code: 'OYO', stateId: states[4].id } })
  ]);

  // Create O'Level Subjects
  console.log('📚 Creating subjects...');
  const subjects = await Promise.all([
    prisma.subject.create({ data: { name: 'Mathematics', code: 'MATH' } }),
    prisma.subject.create({ data: { name: 'English Language', code: 'ENG' } }),
    prisma.subject.create({ data: { name: 'Physics', code: 'PHY' } }),
    prisma.subject.create({ data: { name: 'Chemistry', code: 'CHEM' } }),
    prisma.subject.create({ data: { name: 'Biology', code: 'BIO' } }),
    prisma.subject.create({ data: { name: 'Economics', code: 'ECO' } }),
    prisma.subject.create({ data: { name: 'Government', code: 'GOV' } }),
    prisma.subject.create({ data: { name: 'Literature', code: 'LIT' } }),
    prisma.subject.create({ data: { name: 'Geography', code: 'GEO' } }),
    prisma.subject.create({ data: { name: 'Further Mathematics', code: 'FMATH' } })
  ]);

  // Create Grading Rules
  console.log('📊 Creating grading rules...');
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
  console.log('🏛️ Creating departments...');
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

  // Create General Questions (Math and English)
  console.log('❓ Creating general questions...');
  const generalQuestions = await Promise.all([
    // Math Questions
    prisma.question.create({
      data: {
        content: 'What is the value of π (pi) approximately?',
        options: JSON.stringify(['3.14', '2.71', '1.62', '4.13']),
        correctAnswer: 0,
        marks: 1,
        difficulty: 1,
        departmentId: departments[0].id, // Computer Science
        subjectId: subjects[0].id // Mathematics
      }
    }),
    prisma.question.create({
      data: {
        content: 'Solve for x: 2x + 5 = 15',
        options: JSON.stringify(['x = 5', 'x = 10', 'x = 7.5', 'x = 3']),
        correctAnswer: 0,
        marks: 1,
        difficulty: 1,
        departmentId: departments[0].id, // Computer Science
        subjectId: subjects[0].id // Mathematics
      }
    }),
    prisma.question.create({
      data: {
        content: 'What is the square root of 144?',
        options: JSON.stringify(['10', '12', '14', '16']),
        correctAnswer: 1,
        marks: 1,
        difficulty: 1,
        departmentId: departments[0].id, // Computer Science
        subjectId: subjects[0].id // Mathematics
      }
    }),
    // English Questions
    prisma.question.create({
      data: {
        content: 'Which word is a synonym for "happy"?',
        options: JSON.stringify(['sad', 'angry', 'joyful', 'tired']),
        correctAnswer: 2,
        marks: 1,
        difficulty: 1,
        departmentId: departments[0].id, // Computer Science
        subjectId: subjects[1].id // English
      }
    }),
    prisma.question.create({
      data: {
        content: 'Choose the correct sentence: "She ___ to the market yesterday."',
        options: JSON.stringify(['go', 'goes', 'went', 'gone']),
        correctAnswer: 2,
        marks: 1,
        difficulty: 1,
        departmentId: departments[0].id, // Computer Science
        subjectId: subjects[1].id // English
      }
    })
  ]);

  // Create Department-Specific Questions
  console.log('🎯 Creating department-specific questions...');

  // Computer Science Questions (5 more to make 10 total)
  const csQuestions = [
    ...generalQuestions, // Include general questions
    ...(await Promise.all([
      prisma.question.create({
        data: {
          content: 'What is the time complexity of binary search?',
          options: JSON.stringify(['O(1)', 'O(log n)', 'O(n)', 'O(n log n)']),
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
          options: JSON.stringify(['Structured Query Language', 'Simple Query Language', 'Standard Query Logic', 'System Query Language']),
          correctAnswer: 0,
          marks: 1,
          difficulty: 1,
          departmentId: departments[0].id,
          subjectId: subjects[1].id
        }
      }),
      prisma.question.create({
        data: {
          content: 'Which programming language is primarily used for web development?',
          options: JSON.stringify(['Python', 'JavaScript', 'C++', 'Assembly']),
          correctAnswer: 1,
          marks: 1,
          difficulty: 1,
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
          difficulty: 1,
          departmentId: departments[0].id,
          subjectId: subjects[0].id
        }
      })
    ]))
  ];

  // Electrical Engineering Questions (10 total)
  const eeQuestions = await Promise.all([
    // Include general questions adapted for EE
    prisma.question.create({
      data: {
        content: 'What is the unit of electrical resistance?',
        options: JSON.stringify(['Volt', 'Ampere', 'Ohm', 'Watt']),
        correctAnswer: 2,
        marks: 1,
        difficulty: 1,
        departmentId: departments[1].id,
        subjectId: subjects[0].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'Solve for I: V = IR, if V = 12V and R = 4Ω',
        options: JSON.stringify(['I = 2A', 'I = 3A', 'I = 4A', 'I = 6A']),
        correctAnswer: 1,
        marks: 1,
        difficulty: 1,
        departmentId: departments[1].id,
        subjectId: subjects[0].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'What is the formula for power in an electrical circuit?',
        options: JSON.stringify(['P = VI', 'P = V/I', 'P = I/V', 'P = V²I']),
        correctAnswer: 0,
        marks: 1,
        difficulty: 1,
        departmentId: departments[1].id,
        subjectId: subjects[0].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'Which component stores electrical energy in a circuit?',
        options: JSON.stringify(['Resistor', 'Inductor', 'Capacitor', 'Diode']),
        correctAnswer: 2,
        marks: 1,
        difficulty: 1,
        departmentId: departments[1].id,
        subjectId: subjects[2].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'What is the purpose of a transformer in electrical engineering?',
        options: JSON.stringify(['To store energy', 'To convert AC to DC', 'To change voltage levels', 'To regulate current']),
        correctAnswer: 2,
        marks: 2,
        difficulty: 2,
        departmentId: departments[1].id,
        subjectId: subjects[2].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'Which law states that the current through a conductor is proportional to the voltage?',
        options: JSON.stringify(['Faraday\'s Law', 'Ohm\'s Law', 'Coulomb\'s Law', 'Kirchhoff\'s Law']),
        correctAnswer: 1,
        marks: 1,
        difficulty: 1,
        departmentId: departments[1].id,
        subjectId: subjects[2].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'What is the frequency of AC power supply in Nigeria?',
        options: JSON.stringify(['50 Hz', '60 Hz', '100 Hz', '220 Hz']),
        correctAnswer: 0,
        marks: 1,
        difficulty: 1,
        departmentId: departments[1].id,
        subjectId: subjects[2].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'Which semiconductor device is used for rectification?',
        options: JSON.stringify(['Transistor', 'Diode', 'Capacitor', 'Resistor']),
        correctAnswer: 1,
        marks: 1,
        difficulty: 1,
        departmentId: departments[1].id,
        subjectId: subjects[2].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'What is the unit of electrical charge?',
        options: JSON.stringify(['Volt', 'Coulomb', 'Ampere', 'Joule']),
        correctAnswer: 1,
        marks: 1,
        difficulty: 1,
        departmentId: departments[1].id,
        subjectId: subjects[0].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'Which material is commonly used as a semiconductor?',
        options: JSON.stringify(['Copper', 'Aluminum', 'Silicon', 'Gold']),
        correctAnswer: 2,
        marks: 1,
        difficulty: 1,
        departmentId: departments[1].id,
        subjectId: subjects[3].id
      }
    })
  ]);

  // Medicine Questions (10 total)
  const medQuestions = await Promise.all([
    prisma.question.create({
      data: {
        content: 'What is the normal human body temperature in Celsius?',
        options: JSON.stringify(['35°C', '36°C', '37°C', '38°C']),
        correctAnswer: 2,
        marks: 1,
        difficulty: 1,
        departmentId: departments[2].id,
        subjectId: subjects[4].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'Which organ is responsible for pumping blood?',
        options: JSON.stringify(['Liver', 'Lungs', 'Heart', 'Kidney']),
        correctAnswer: 2,
        marks: 1,
        difficulty: 1,
        departmentId: departments[2].id,
        subjectId: subjects[4].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'What is the largest bone in the human body?',
        options: JSON.stringify(['Skull', 'Femur', 'Humerus', 'Tibia']),
        correctAnswer: 1,
        marks: 1,
        difficulty: 1,
        departmentId: departments[2].id,
        subjectId: subjects[4].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'Which blood type is considered the universal donor?',
        options: JSON.stringify(['A+', 'B+', 'AB+', 'O-']),
        correctAnswer: 3,
        marks: 1,
        difficulty: 1,
        departmentId: departments[2].id,
        subjectId: subjects[4].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'What is the medical term for high blood pressure?',
        options: JSON.stringify(['Hypotension', 'Hypertension', 'Anemia', 'Diabetes']),
        correctAnswer: 1,
        marks: 1,
        difficulty: 1,
        departmentId: departments[2].id,
        subjectId: subjects[4].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'Which vitamin is produced by the skin when exposed to sunlight?',
        options: JSON.stringify(['Vitamin A', 'Vitamin B', 'Vitamin C', 'Vitamin D']),
        correctAnswer: 3,
        marks: 1,
        difficulty: 1,
        departmentId: departments[2].id,
        subjectId: subjects[4].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'What is the function of red blood cells?',
        options: JSON.stringify(['Fight infection', 'Carry oxygen', 'Produce antibodies', 'Clot blood']),
        correctAnswer: 1,
        marks: 1,
        difficulty: 1,
        departmentId: departments[2].id,
        subjectId: subjects[4].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'Which organ filters waste from the blood?',
        options: JSON.stringify(['Liver', 'Lungs', 'Kidney', 'Spleen']),
        correctAnswer: 2,
        marks: 1,
        difficulty: 1,
        departmentId: departments[2].id,
        subjectId: subjects[4].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'What is the medical term for difficulty breathing?',
        options: JSON.stringify(['Dyspnea', 'Hemoptysis', 'Hematuria', 'Dysuria']),
        correctAnswer: 0,
        marks: 2,
        difficulty: 2,
        departmentId: departments[2].id,
        subjectId: subjects[1].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'Which chamber of the heart pumps oxygenated blood to the body?',
        options: JSON.stringify(['Right atrium', 'Right ventricle', 'Left atrium', 'Left ventricle']),
        correctAnswer: 3,
        marks: 1,
        difficulty: 1,
        departmentId: departments[2].id,
        subjectId: subjects[4].id
      }
    })
  ]);

  // Business Administration Questions (10 total)
  const baQuestions = await Promise.all([
    prisma.question.create({
      data: {
        content: 'What is the primary goal of a business?',
        options: JSON.stringify(['Maximize costs', 'Maximize profits', 'Minimize production', 'Increase competition']),
        correctAnswer: 1,
        marks: 1,
        difficulty: 1,
        departmentId: departments[3].id,
        subjectId: subjects[5].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'What does ROI stand for in business?',
        options: JSON.stringify(['Return on Investment', 'Risk of Investment', 'Rate of Interest', 'Revenue on Investment']),
        correctAnswer: 0,
        marks: 1,
        difficulty: 1,
        departmentId: departments[3].id,
        subjectId: subjects[5].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'Which of the following is a characteristic of a monopoly?',
        options: JSON.stringify(['Many sellers', 'Perfect competition', 'Single seller', 'Low barriers to entry']),
        correctAnswer: 2,
        marks: 1,
        difficulty: 1,
        departmentId: departments[3].id,
        subjectId: subjects[5].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'What is the term for goods and services sold to other countries?',
        options: JSON.stringify(['Import', 'Export', 'Domestic trade', 'Local trade']),
        correctAnswer: 1,
        marks: 1,
        difficulty: 1,
        departmentId: departments[3].id,
        subjectId: subjects[5].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'Which financial statement shows a company\'s financial position at a specific date?',
        options: JSON.stringify(['Income Statement', 'Balance Sheet', 'Cash Flow Statement', 'Statement of Retained Earnings']),
        correctAnswer: 1,
        marks: 2,
        difficulty: 2,
        departmentId: departments[3].id,
        subjectId: subjects[5].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'What is the role of marketing in a business?',
        options: JSON.stringify(['Production only', 'Creating and delivering value to customers', 'Accounting only', 'Human resources only']),
        correctAnswer: 1,
        marks: 1,
        difficulty: 1,
        departmentId: departments[3].id,
        subjectId: subjects[5].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'Which of the following is not a factor of production?',
        options: JSON.stringify(['Land', 'Labor', 'Capital', 'Profit']),
        correctAnswer: 3,
        marks: 1,
        difficulty: 1,
        departmentId: departments[3].id,
        subjectId: subjects[5].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'What is the term for the total value of goods and services produced in a country?',
        options: JSON.stringify(['GNP', 'GDP', 'Inflation', 'Recession']),
        correctAnswer: 1,
        marks: 1,
        difficulty: 1,
        departmentId: departments[3].id,
        subjectId: subjects[5].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'Which leadership style involves making decisions without consulting subordinates?',
        options: JSON.stringify(['Democratic', 'Autocratic', 'Laissez-faire', 'Transformational']),
        correctAnswer: 1,
        marks: 1,
        difficulty: 1,
        departmentId: departments[3].id,
        subjectId: subjects[6].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'What is the primary purpose of a business plan?',
        options: JSON.stringify(['To entertain investors', 'To outline business goals and strategies', 'To replace accounting', 'To hire employees']),
        correctAnswer: 1,
        marks: 1,
        difficulty: 1,
        departmentId: departments[3].id,
        subjectId: subjects[5].id
      }
    })
  ]);

  // Mass Communication Questions (10 total)
  const macQuestions = await Promise.all([
    prisma.question.create({
      data: {
        content: 'What is the primary function of mass media?',
        options: JSON.stringify(['Entertainment only', 'To inform, educate, and entertain', 'Advertising only', 'Political propaganda']),
        correctAnswer: 1,
        marks: 1,
        difficulty: 1,
        departmentId: departments[4].id,
        subjectId: subjects[7].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'Which of the following is a traditional mass medium?',
        options: JSON.stringify(['Social media', 'Television', 'Podcast', 'Blog']),
        correctAnswer: 1,
        marks: 1,
        difficulty: 1,
        departmentId: departments[4].id,
        subjectId: subjects[7].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'What does "gatekeeping" mean in journalism?',
        options: JSON.stringify(['Security at media houses', 'Controlling what information reaches the public', 'Editing news only', 'Publishing all news']),
        correctAnswer: 1,
        marks: 2,
        difficulty: 2,
        departmentId: departments[4].id,
        subjectId: subjects[7].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'Which communication model includes sender, message, channel, and receiver?',
        options: JSON.stringify(['Agenda-setting model', 'Two-step flow model', 'Linear communication model', 'Spiral of silence']),
        correctAnswer: 2,
        marks: 1,
        difficulty: 1,
        departmentId: departments[4].id,
        subjectId: subjects[7].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'What is the term for the intended effect of media messages?',
        options: JSON.stringify(['Noise', 'Feedback', 'Encoding', 'Decoding']),
        correctAnswer: 2,
        marks: 1,
        difficulty: 1,
        departmentId: departments[4].id,
        subjectId: subjects[7].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'Which theory suggests that media influences public opinion by highlighting certain issues?',
        options: JSON.stringify(['Cultivation theory', 'Agenda-setting theory', 'Uses and gratifications theory', 'Spiral of silence theory']),
        correctAnswer: 1,
        marks: 2,
        difficulty: 2,
        departmentId: departments[4].id,
        subjectId: subjects[7].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'What is the primary role of public relations?',
        options: JSON.stringify(['Selling products', 'Managing reputation and building relationships', 'Writing news only', 'Advertising only']),
        correctAnswer: 1,
        marks: 1,
        difficulty: 1,
        departmentId: departments[4].id,
        subjectId: subjects[7].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'Which of the following is a characteristic of new media?',
        options: JSON.stringify(['One-way communication', 'Interactive and user-generated content', 'Limited accessibility', 'High cost only']),
        correctAnswer: 1,
        marks: 1,
        difficulty: 1,
        departmentId: departments[4].id,
        subjectId: subjects[7].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'What is "media convergence"?',
        options: JSON.stringify(['Media going out of business', 'The merging of media technologies and content', 'Media censorship', 'Media monopoly']),
        correctAnswer: 1,
        marks: 1,
        difficulty: 1,
        departmentId: departments[4].id,
        subjectId: subjects[7].id
      }
    }),
    prisma.question.create({
      data: {
        content: 'Which ethical principle is most important in journalism?',
        options: JSON.stringify(['Profit maximization', 'Truth and accuracy', 'Entertainment value', 'Political alignment']),
        correctAnswer: 1,
        marks: 1,
        difficulty: 1,
        departmentId: departments[4].id,
        subjectId: subjects[7].id
      }
    })
  ]);

  // Create Examinations for each department
  console.log('📝 Creating examinations...');
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
        totalMarks: 10,
        passingMarks: 6,
        departmentId: departments[1].id,
        isActive: true
      }
    }),
    prisma.examination.create({
      data: {
        title: 'Medicine Entrance Examination',
        description: 'Entrance examination for Medicine program',
        duration: 150,
        totalMarks: 10,
        passingMarks: 7,
        departmentId: departments[2].id,
        isActive: true
      }
    }),
    prisma.examination.create({
      data: {
        title: 'Business Administration Aptitude Test',
        description: 'Entrance examination for Business Administration program',
        duration: 90,
        totalMarks: 10,
        passingMarks: 6,
        departmentId: departments[3].id,
        isActive: true
      }
    }),
    prisma.examination.create({
      data: {
        title: 'Mass Communication Entrance Test',
        description: 'Entrance examination for Mass Communication program',
        duration: 90,
        totalMarks: 10,
        passingMarks: 6,
        departmentId: departments[4].id,
        isActive: true
      }
    })
  ]);

  // Link questions to examinations
  console.log('🔗 Linking questions to examinations...');
  
  // Computer Science examination questions
  await Promise.all(csQuestions.slice(0, 10).map((question, index) =>
    prisma.examinationQuestion.create({
      data: {
        examinationId: examinations[0].id,
        questionId: question.id
      }
    })
  ));

  // Electrical Engineering examination questions
  await Promise.all(eeQuestions.slice(0, 10).map((question, index) =>
    prisma.examinationQuestion.create({
      data: {
        examinationId: examinations[1].id,
        questionId: question.id
      }
    })
  ));

  // Medicine examination questions
  await Promise.all(medQuestions.slice(0, 10).map((question, index) =>
    prisma.examinationQuestion.create({
      data: {
        examinationId: examinations[2].id,
        questionId: question.id
      }
    })
  ));

  // Business Administration examination questions
  await Promise.all(baQuestions.slice(0, 10).map((question, index) =>
    prisma.examinationQuestion.create({
      data: {
        examinationId: examinations[3].id,
        questionId: question.id
      }
    })
  ));

  // Mass Communication examination questions
  await Promise.all(macQuestions.slice(0, 10).map((question, index) =>
    prisma.examinationQuestion.create({
      data: {
        examinationId: examinations[4].id,
        questionId: question.id
      }
    })
  ));

  // Create Admin User
  console.log('👤 Creating admin user...');
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
      role: 'Super Administrator',
      isActive: true
    }
  });

  console.log('✅ Database seeded successfully!');
  console.log('📊 Summary:');
  console.log(`   📍 States: ${states.length}`);
  console.log(`   🏘️ LGAs: ${lagosLgas.length + abujaLgas.length + kanoLgas.length + riversLgas.length + oyoLgas.length}`);
  console.log(`   📚 Subjects: ${subjects.length}`);
  console.log(`   📈 Grading Rules: ${gradingRules.length}`);
  console.log(`   🏛️ Departments: ${departments.length}`);
  console.log(`   ❓ Total Questions: ${csQuestions.length + eeQuestions.length + medQuestions.length + baQuestions.length + macQuestions.length}`);
  console.log(`   📝 Examinations: ${examinations.length}`);
  console.log(`   👤 Admin User: 1`);
  console.log('');
  console.log('🎯 Admin credentials:');
  console.log('   Email: admin@screening.com');
  console.log('   Password: admin123');
  console.log('');
  console.log('📚 Questions per department:');
  console.log(`   Computer Science: ${csQuestions.length} questions`);
  console.log(`   Electrical Engineering: ${eeQuestions.length} questions`);
  console.log(`   Medicine: ${medQuestions.length} questions`);
  console.log(`   Business Administration: ${baQuestions.length} questions`);
  console.log(`   Mass Communication: ${macQuestions.length} questions`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });