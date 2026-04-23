import University from '../models/University';

const SEED_UNIVERSITIES = [
  {
    name: 'Rishihood University',
    domain: 'rishihood.edu.in',
    isRegistered: true,
  },
  {
    name: 'IIT Delhi',
    domain: 'iitd.ac.in',
    isRegistered: true,
  },
  {
    name: 'Stanford University',
    domain: 'stanford.edu',
    isRegistered: true,
  },
];

export async function seedUniversities() {
  try {
    for (const uni of SEED_UNIVERSITIES) {
      const exists = await University.findOne({ domain: uni.domain });
      if (!exists) {
        await University.create(uni);
        console.log(`✅ Seeded university: ${uni.name}`);
      }
    }
    console.log('✅ University seeding completed');
  } catch (error) {
    console.error('Error seeding universities:', error);
  }
}
