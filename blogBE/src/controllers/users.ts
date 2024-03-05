// import { Request, Response } from 'express';
// import bcrypt from 'bcrypt';
// import User, { UserDocument } from '../models/User';

// export const createUser = async (req: Request, res: Response) => {
//   try {
//     const { username, email, password }: { username: string, email: string, password: string } = req.body;
//     const lowercaseEmail = email.toLowerCase();

//     const existingUser = await User.findOne({ email: lowercaseEmail });

//     if (existingUser) {
//       return res.status(400).json({ error: 'User already exists' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = new User({
//       username,
//       email: lowercaseEmail,
//       password: hashedPassword,
//       role: 'user',
//     });

//     const savedUser = await newUser.save();
//     res.status(201).json({ message: 'Account created successfully' });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to create user' });
//   }
// };


// export const deleteUserByEmail = async (req: Request, res: Response) => {
//   try {
//     let userEmail = req.params.email;
//     userEmail = userEmail.toLowerCase();
//     const deletedUser = await User.findOneAndDelete({ email: userEmail });

//     if (deletedUser) {
//       res.status(200).json({ message: 'User deleted successfully' });
//     } else {
//       res.status(404).json({ error: 'User not found' });
//     }
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to delete user' });
//   }
// };

// export const login = async (req: Request, res: Response) => {
//   try {
//     let { email, password } = req.body;
//     email = email.toLowerCase();
//     const user: UserDocument | null = await User.findOne({ email }); 

//     if (user && user.password && (await bcrypt.compare(password, user.password))) {
//       res.status(200).json({ message: 'Login successful' });
//     } else {
//       res.status(401).json({ error: 'Invalid email or password' });
//     }
//   } catch (error) {
//     res.status(500).json({ error: 'Login failed' });
//   }
// };

// export const getAllUsers = async (req: Request, res: Response) => {
//   try {
//     const users = await User.find();
//     res.status(200).json(users);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to retrieve users' });
//   }
// };
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import IUser from '../models/User';
import { Error } from 'mongoose';
import { loginVal, signInVal } from '../validations/users';


const jwtSecret = 'mbapetorealmadridherewego';

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, password, email } = req.body;

    const { error } = signInVal.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const existingUser = await IUser.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new IUser({ username, password: hashedPassword, email });
    await newUser.save();

    const token = jwt.sign({ username: newUser.username, role: newUser.role }, jwtSecret, {
      expiresIn: '2h'
    });

    res.status(201)
      .header('Authorization', `Bearer ${token}`)
      .send({ message: 'User created successfully', token });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    const { error } = loginVal.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    if (!username && !email) {
      return res.status(400).json({ error: 'Username or email is required' });
    }

    const user = await IUser.findOne({ $or: [{ username }, { email }] });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ username: user.username, role: user.role }, jwtSecret, {
      expiresIn: '10h'
    });

    res.status(200)
      .header('Authorization', `Bearer ${token}`)
      .send({ message: 'Login successful!!', token: token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await IUser.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
};

export const deleteUserByEmail = async (req: Request, res: Response) => {
  try {
    let userEmail = req.params.email;
    userEmail = userEmail.toLowerCase();
    const deletedUser = await IUser.findOneAndDelete({ email: userEmail });

    if (deletedUser) {
      res.status(200).json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
