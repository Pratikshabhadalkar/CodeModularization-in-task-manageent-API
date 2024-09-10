
import { UserRepository } from '../Repository/userRepository.js';
import jwt from 'jsonwebtoken';
import { handleAuthentication } from '../utility/auth.js';

const secret_key = 'your_secret_key'; 

export class UserService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  
  login(username, password) {
    const user = this.userRepository.findByCredentials(username, password);
    if (user) {
      const token = jwt.sign({ userId: user.id }, secret_key, { expiresIn: '1h' });
      return { token };
    }
    return null;
  }

  
  getUserById(id) {
    return this.userRepository.findById(id);
  }

  
  registerUser(userData) {
    return this.userRepository.createUser(userData);
  }

  
  updateUser(id, updatedData) {
    return this.userRepository.updateUser(id, updatedData);
  }

  
  deleteUser(id) {
    return this.userRepository.deleteUser(id);
  }
}
