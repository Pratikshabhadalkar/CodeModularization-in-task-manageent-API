import jwt from 'jsonwebtoken';
import { users } from '../mock-data/userMock_data.js';  
import { parse } from 'url';

const secret_key = 'your_secret_key'; 

export class UserController {
  controller(req, res) {
    const parsedUrl = parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    
    if (pathname === '/users/login' && method === 'POST') {
      let body = '';
      
      
      req.on('data', (chunk) => {
        body += chunk;
      });

      
      req.on('end', () => {
        try {
          
          const user = JSON.parse(body);

          
          const isUserPresent = users.find(
            item => item.username === user.username && item.password === user.password
          );

          if (isUserPresent) {
            
            const token = jwt.sign({ userId: isUserPresent.id }, secret_key, { expiresIn: '1h' });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ token }));
          } else {
            
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'User credentials do not match' }));
          }
        } catch (err) {
          
          console.error('Error parsing JSON:', err.message);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Invalid JSON' }));
        }
      });
    } else {
      
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Endpoint not found' }));
    }
  }
}
