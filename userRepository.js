
import { users } from '../mock-data/userMock_data.js';

export class UserRepository {
  
  findByCredentials(username, password) {
    return users.find(user => user.username === username && user.password === password);
  }

  
  findById(id) {
    return users.find(user => user.id === id);
  }

  
  createUser(newUser) {
    users.push(newUser);
    return newUser;
  }

  
  updateUser(id, updatedUser) {
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updatedUser };
      return users[index];
    }
    return null;
  }

  
  deleteUser(id) {
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
      return users.splice(index, 1);
    }
    return null;
  }
}
