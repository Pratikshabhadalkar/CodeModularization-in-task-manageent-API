import http from 'http';
import { UserController } from './controller/userController.js';
import { TaskController } from './controller/taskController.js';
import 'dotenv/config';
import { decodeUrl } from './utility/funcUtility.js';

const userController = new UserController();
const taskController = new TaskController(); 

const server = http.createServer(async (req, res) => {
    try {
        if (!req.url) {
            throw new TypeError('Request URL is undefined');
        }

        const { pathname } = decodeUrl(req); 

        if (pathname.startsWith('/tasks')) { 
            taskController.controller(req, res); 
        } else if (pathname === '/users/login') {
            userController.controller(req, res); // 
        } else {
            res.statusCode = 404;
            res.end('Not Found');
        }
    } catch (error) {
        console.error(error);
        res.statusCode = 500;
        res.end('Internal Server Error');
    }
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
