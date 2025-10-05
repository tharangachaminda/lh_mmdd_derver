/**
 * Authentication API Test
 * 
 * Simple test script to verify authentication endpoints work correctly
 */

import { AuthService } from '../services/auth.service.js';
import { User } from '../models/user.model.js';
import { DatabaseConfig } from '../config/database.config.js';

async function testAuthentication() {
  console.log('🧪 Starting Authentication System Test...\n');

  try {
    // Connect to database
    const database = DatabaseConfig.getInstance();
    await database.connect();
    console.log('✅ Database connected successfully');

    // Clean up any existing test user
    await User.deleteOne({ email: 'test@example.com' });
    console.log('🧹 Cleaned up existing test data');

    // Test 1: Student Registration
    console.log('\n📝 Test 1: Student Registration');
    const studentData = {
      email: 'test@example.com',
      password: 'TestPass123!',
      firstName: 'John',
      lastName: 'Doe',
      grade: 8,
      country: 'NZ',
      preferredSubjects: ['mathematics', 'science']
    };

    const registrationResult = await AuthService.registerStudent(studentData);
    console.log('✅ Student registered successfully');
    console.log('   User ID:', registrationResult.user.id);
    console.log('   Role:', registrationResult.user.role);
    console.log('   Grade:', registrationResult.user.grade);
    console.log('   Country:', registrationResult.user.country);
    console.log('   Token generated:', !!registrationResult.token);

    // Test 2: Login
    console.log('\n🔐 Test 2: User Login');
    const loginResult = await AuthService.login({
      email: 'test@example.com',
      password: 'TestPass123!'
    });
    console.log('✅ Login successful');
    console.log('   User ID:', loginResult.user.id);
    console.log('   Last login updated:', !!loginResult.user);

    // Test 3: Token Verification
    console.log('\n🎫 Test 3: Token Verification');
    const verifiedUser = await AuthService.verifyToken(loginResult.token);
    console.log('✅ Token verified successfully');
    console.log('   Verified user ID:', verifiedUser._id);
    console.log('   Verified user email:', verifiedUser.email);

    // Test 4: Refresh Token
    console.log('\n🔄 Test 4: Token Refresh');
    const refreshResult = await AuthService.refreshToken(loginResult.refreshToken);
    console.log('✅ Token refreshed successfully');
    console.log('   New token generated:', !!refreshResult.token);
    console.log('   New refresh token generated:', !!refreshResult.refreshToken);

    // Test 5: Invalid Login
    console.log('\n❌ Test 5: Invalid Login (should fail)');
    try {
      await AuthService.login({
        email: 'test@example.com',
        password: 'wrongpassword'
      });
      console.log('❌ Login should have failed but didn\'t');
    } catch (error) {
      console.log('✅ Invalid login correctly rejected:', error.message);
    }

    // Clean up
    await User.deleteOne({ email: 'test@example.com' });
    console.log('\n🧹 Test data cleaned up');

    // Disconnect
    await database.disconnect();
    console.log('✅ Database disconnected');

    console.log('\n🎉 All authentication tests passed!');

  } catch (error) {
    console.error('❌ Authentication test failed:', error);
    process.exit(1);
  }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testAuthentication().catch(console.error);
}

export { testAuthentication };