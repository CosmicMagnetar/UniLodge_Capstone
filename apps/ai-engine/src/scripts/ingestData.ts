/**
 * Data Ingestion Script
 *
 * Reads room/university data from JSON fixtures and upserts into the vector store.
 * Run: npx tsx src/scripts/ingestData.ts
 */

import { createVectorStore } from '../services/vectorStore.js';

// Sample fixture data — replace with MongoDB reads in production
const UNIVERSITIES = [
  {
    name: 'Rishihood University',
    domain: 'rishihood.edu.in',
    location: 'Sonipat, Haryana, India',
    description: 'A purpose-driven university focused on entrepreneurship, education, and technology.',
  },
  {
    name: 'IIT Delhi',
    domain: 'iitd.ac.in',
    location: 'New Delhi, India',
    description: 'Premier engineering institute offering world-class education and research facilities.',
  },
  {
    name: 'Stanford University',
    domain: 'stanford.edu',
    location: 'Stanford, California, USA',
    description: 'Leading research university known for innovation and entrepreneurship in Silicon Valley.',
  },
];

const ROOMS = [
  {
    roomNumber: '101',
    type: 'Single',
    price: 50,
    amenities: ['Wi-Fi', 'Desk', 'Private Bathroom'],
    description: 'Cozy single room perfect for individual travelers',
    university: 'Rishihood University',
    building: 'Block A',
  },
  {
    roomNumber: '102',
    type: 'Single',
    price: 55,
    amenities: ['Wi-Fi', 'Desk', 'AC', 'Window View'],
    description: 'Single room with beautiful campus view',
    university: 'Rishihood University',
    building: 'Block A',
  },
  {
    roomNumber: '201',
    type: 'Double',
    price: 80,
    amenities: ['Wi-Fi', 'Desk', 'TV', 'Private Bathroom', 'AC'],
    description: 'Spacious double room for couples or friends',
    university: 'IIT Delhi',
    building: 'Hostel 1',
  },
  {
    roomNumber: '202',
    type: 'Suite',
    price: 120,
    amenities: ['Wi-Fi', 'Desk', 'TV', 'Kitchenette', 'Private Bathroom', 'AC', 'Balcony'],
    description: 'Luxurious suite with full amenities and modern design',
    university: 'Stanford University',
    building: 'Graduate Housing',
  },
];

const POLICIES = [
  {
    id: 'check-in-policy',
    text: 'Check-in time is 2:00 PM. Early check-in is available upon request and subject to availability. Check-out time is 11:00 AM. Late check-out may incur additional charges.',
  },
  {
    id: 'cancellation-policy',
    text: 'Free cancellation up to 48 hours before check-in. Cancellations within 48 hours will be charged one night\'s stay. No-shows will be charged the full booking amount.',
  },
  {
    id: 'payment-policy',
    text: 'We accept all major credit cards, UPI, and bank transfers. Payment is required at the time of booking confirmation. Student discounts of 15% are available with valid ID.',
  },
];

async function main() {
  console.log('🔄 Starting data ingestion...\n');

  const vectorStore = createVectorStore();

  // Ingest universities
  console.log('📚 Ingesting universities...');
  for (const uni of UNIVERSITIES) {
    const text = `University: ${uni.name}. Located in ${uni.location}. Domain: ${uni.domain}. ${uni.description}`;
    await vectorStore.upsertDocument(`uni-${uni.domain}`, text, {
      type: 'university',
      name: uni.name,
      domain: uni.domain,
    });
    console.log(`  ✅ ${uni.name}`);
  }

  // Ingest rooms
  console.log('\n🏠 Ingesting rooms...');
  for (const room of ROOMS) {
    const text = `Room ${room.roomNumber}, ${room.type}, $${room.price}/night, ${room.amenities.join(', ')}, ${room.building}, ${room.university}. ${room.description}`;
    await vectorStore.upsertDocument(`room-${room.roomNumber}`, text, {
      type: 'room',
      roomNumber: room.roomNumber,
      university: room.university,
      price: room.price,
    });
    console.log(`  ✅ Room ${room.roomNumber} (${room.university})`);
  }

  // Ingest policies
  console.log('\n📋 Ingesting policies...');
  for (const policy of POLICIES) {
    await vectorStore.upsertDocument(policy.id, policy.text, { type: 'policy' });
    console.log(`  ✅ ${policy.id}`);
  }

  console.log('\n✅ Data ingestion complete!');
  console.log(`   Total documents: ${UNIVERSITIES.length + ROOMS.length + POLICIES.length}`);
}

main().catch(console.error);
