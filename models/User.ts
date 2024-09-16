import mongoose from 'mongoose'

interface INotification {
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
}

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  notifications: INotification[];
}

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  notifications: [notificationSchema]
});

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  notifications: INotification[];
}

export function toSafeUser(user: IUser): SafeUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    notifications: user.notifications
  }
}

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;