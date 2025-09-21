import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function adjustDepartmentCutoffs() {
  console.log('🔄 Adjusting department cutoffs to more reasonable values...');

  try {
    const departments = await prisma.department.findMany();
    
    for (const dept of departments) {
      let newFinalCutoff = dept.finalCutoffMark;
      
      // Adjust final cutoffs based on department difficulty
      switch (dept.name) {
        case 'Computer Science':
          newFinalCutoff = 55; // Reduced from 70 to 55
          break;
        case 'Electrical Engineering':
          newFinalCutoff = 60; // Reduced from 75 to 60
          break;
        case 'Medicine':
          newFinalCutoff = 70; // Reduced from 85 to 70
          break;
        case 'Business Administration':
          newFinalCutoff = 50; // Reduced from 65 to 50
          break;
        case 'Mass Communication':
          newFinalCutoff = 52; // Reduced from 68 to 52
          break;
      }
      
      await prisma.department.update({
        where: { id: dept.id },
        data: { finalCutoffMark: newFinalCutoff }
      });
      
      console.log(`✅ Updated ${dept.name}: ${dept.finalCutoffMark}% → ${newFinalCutoff}%`);
    }
    
    console.log('\n🎯 All department cutoffs adjusted successfully!');
    
  } catch (error) {
    console.error('❌ Error adjusting department cutoffs:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

adjustDepartmentCutoffs().catch(console.error);