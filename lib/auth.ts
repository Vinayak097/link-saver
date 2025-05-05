import bcrypt from 'bcryptjs';
import dbConnect from './db';
import { User } from './model';
import { UserType } from './jwt';

// Register a new user
export async function registerUser(email: string, password: string): Promise<UserType | null> {
  try {
    // Connect to the database and ensure connection is established
    console.log('Connecting to database for user registration...');
    await dbConnect();
    console.log('Database connected for user registration');

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log('User already exists with email:', email);
        return null;
      }

      // Create a new user
      const newUser = new User({
        email,
        password: hashedPassword
      });
      console.log('User model created:', email);

      // Save the user to the database
      const savedUser = await newUser.save();
      console.log('User saved successfully with ID:', savedUser._id);

      return {
        id: savedUser._id.toString(),
        email: savedUser.email
      };
    } catch (dbError) {
      console.error('Database operation error:', dbError);
      if (dbError instanceof Error) {
        console.error('DB Error message:', dbError.message);
        console.error('DB Error stack:', dbError.stack);
      }
      return null;
    }
  } catch (error) {
    console.error('Error registering user:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return null;
  }
}

// Authenticate a user
export async function authenticateUser(email: string, password: string): Promise<UserType | null> {
  try {
    // Connect to the database and ensure connection is established
    console.log('Connecting to database for user authentication...');
    await dbConnect();
    console.log('Database connected for user authentication');

    try {
      // Find the user by email
      const user = await User.findOne({ email });
      console.log('User lookup result:', user ? 'User found' : 'User not found');

      if (!user) {
        return null;
      }

      // Compare the password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('Password validation result:', isPasswordValid);

      if (!isPasswordValid) {
        return null;
      }

      return {
        id: user._id.toString(),
        email: user.email
      };
    } catch (dbError) {
      console.error('Database operation error during authentication:', dbError);
      if (dbError instanceof Error) {
        console.error('DB Error message:', dbError.message);
        console.error('DB Error stack:', dbError.stack);
      }
      return null;
    }
  } catch (error) {
    console.error('Error authenticating user:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return null;
  }
}

// Re-export token functions from jwt.ts
export { generateToken, verifyToken } from './jwt';
