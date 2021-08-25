export interface User {
  userId: string;
  username: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  imageUrl?: string;
  roles?: string[];
}
