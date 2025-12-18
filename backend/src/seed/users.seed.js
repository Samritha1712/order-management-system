const { hashPassword } = require('../utils/password');
const pool = require('../config/db');

const seedUsers = async () => {
  try {
    // Hash the password
    const password = await hashPassword('Password123!');
    
    // Admin user
    await pool.query(
      `INSERT INTO public.users (email, password_hash, first_name, last_name, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       ON CONFLICT (email) DO NOTHING`,
      ['admin@store.com', password, 'Admin', 'User', 'admin']
    );

    // Manager user
    await pool.query(
      `INSERT INTO public.users (email, password_hash, first_name, last_name, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       ON CONFLICT (email) DO NOTHING`,
      ['manager@store.com', password, 'Manager', 'User', 'manager']
    );

    // Customer user
    await pool.query(
      `INSERT INTO public.users (email, password_hash, first_name, last_name, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       ON CONFLICT (email) DO NOTHING`,
      ['john.doe@gmail.com', password, 'John', 'Doe', 'customer']
    );

    console.log('Seed data created successfully');
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    process.exit();
  }
};

seedUsers();
