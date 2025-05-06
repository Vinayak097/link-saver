import bcrypt from 'bcryptjs';
import dbConnect from './db';
import { User } from './model';
import { UserType } from './jwt';


export async function registerUser(email: string, password: string): Promise<UserType | null> {
  try {
    
    console.log('Connecting to database for user registration...');
    await dbConnect();
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log('User already exists with email:', email);
        return null;
      }
      const newUser = new User({
        email,
        password: hashedPassword
      });
      const savedUser = await newUser.save();

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


export async function authenticateUser(email: string, password: string): Promise<UserType | null> {
  try {
    
    await dbConnect();

    try {
      
      const user = await User.findOne({ email });
      console.log('User lookup result:', user ? 'User found' : 'User not found');

      if (!user) {
        return null;
      }

      
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


export { generateToken, verifyToken } from './jwt';
