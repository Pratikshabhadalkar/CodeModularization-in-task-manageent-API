import { handleAuthentication } from "../utility/auth.js";
import { TaskService } from "../service/taskService.js";
import { decodeUrl } from "../utility/funcUtility.js";
import { tasks } from "../mock-data/taskMock_data.js";

export class TaskController {
  constructor() {
    this.taskService = new TaskService();
  }

  async controller(req, res) {
    const method = req.method;
    const { parsedUrl, pathname, urlSegment } = decodeUrl(req);
    let currentId = tasks.length + 1;

    // Create task
    if (pathname === '/tasks' && method === 'POST') {
      handleAuthentication(req, res, () => {
        let body = '';

        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            const task = JSON.parse(body);
            task.id = currentId++;
            task.history = [];
            task.comments = [];
            task.status = task.status || 'pending';

            tasks.push(task);

            if (!res.headersSent) {
              res.writeHead(201, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(task));
            }
          } catch (err) {
            if (!res.headersSent) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ message: 'Invalid JSON' }));
            }
          }
        });
      });
    }
    // Get task by ID
    else if (pathname.startsWith('/tasks/') && method === 'GET') {
      const id = parseInt(pathname.split('/')[2]);
      const task = tasks.find(t => t.id === id);
      if (task) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(task));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Task not found' }));
      }
    }
    // Get all tasks or filter tasks by status, priority, or category
    else if (pathname === '/tasks' && method === 'GET') {
      handleAuthentication(req, res, () => {
        const { status, priority, category } = parsedUrl.query;
        let filteredTasks = tasks;

        if (status) {
          filteredTasks = filteredTasks.filter(task => task.status === status);
        }
        if (priority) {
          filteredTasks = filteredTasks.filter(task => task.priority === priority);
        }
        if (category) {
          filteredTasks = filteredTasks.filter(task => task.category === category);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(filteredTasks));
      });
    }
    // Search tasks
    else if (pathname === '/tasks/search' && method === 'GET') {
      handleAuthentication(req, res, () => {
        const keyword = parsedUrl.query.q ? parsedUrl.query.q.toLowerCase() : '';
        const filteredTasks = tasks.filter(task =>
          (task.title && task.title.toLowerCase().includes(keyword)) ||
          (task.description && task.description.toLowerCase().includes(keyword))
        );
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(filteredTasks));
      });
    }
    // Get overdue tasks
    else if (pathname === '/tasks/overdue' && method === 'GET') {
      handleAuthentication(req, res, () => {
        const today = new Date();
        const overdueTasks = tasks.filter(task =>
          new Date(task.dueDate) < today && !task.completed
        );
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(overdueTasks));
      });
    }
    // Get due soon tasks
    else if (pathname === '/tasks/due-soon' && method === 'GET') {
      handleAuthentication(req, res, () => {
        const days = parseInt(parsedUrl.query.days) || 7;
        const today = new Date();
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + days);

        const dueSoonTasks = tasks.filter(task => {
          const taskDueDate = new Date(task.dueDate);
          return taskDueDate >= today && taskDueDate <= endDate;
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(dueSoonTasks));
      });
    }
    // Update task
    else if (pathname.startsWith('/tasks/') && method === 'PUT') {
      const id = parseInt(pathname.split('/')[2]);
      let body = '';

      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const updatedTask = JSON.parse(body);
          const taskIndex = tasks.findIndex(t => t.id === id);
          if (taskIndex !== -1) {
            tasks[taskIndex].history.push({
              timestamp: new Date(),
              changes: updatedTask,
              changedBy: 'user123'
            });
            tasks[taskIndex] = { ...tasks[taskIndex], ...updatedTask };
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(tasks[taskIndex]));
          } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Task not found' }));
          }
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Invalid JSON' }));
        }
      });
    }
    // Update task priority
    else if (pathname.startsWith('/tasks/') && method === 'PATCH' && pathname.endsWith('/priority')) {
      const id = parseInt(pathname.split('/')[2]);
      let body = '';

      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const { priority } = JSON.parse(body);
          const task = tasks.find(t => t.id === id);
          if (task) {
            task.history.push({
              timestamp: new Date(),
              changes: { priority },
              changedBy: 'user123'
            });
            task.priority = priority;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(task));
          } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Task not found' }));
          }
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Invalid JSON' }));
        }
      });
    }
    // Assign task
    else if (pathname.startsWith('/tasks/') && method === 'PATCH' && pathname.endsWith('/assign')) {
      const id = parseInt(pathname.split('/')[2]);
      let body = '';

      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const { assignedTo } = JSON.parse(body);
          const task = tasks.find(t => t.id === id);
          if (task) {
            task.history.push({
              timestamp: new Date(),
              changes: { assignedTo },
              changedBy: 'user123'
            });
            task.assignedTo = assignedTo;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(task));
          } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Task not found' }));
          }
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Invalid JSON' }));
        }
      });
    }
    // Unassign task
    else if (pathname.startsWith('/tasks/') && method === 'PATCH' && pathname.endsWith('/unassign')) {
      const id = parseInt(pathname.split('/')[2]);
      const task = tasks.find(t => t.id === id);
      
      if (task) {
          // Ensure task.history is an array
          if (!Array.isArray(task.history)) {
              task.history = []; // Initialize history if it is not already an array
          }
          
          task.history.push({
              timestamp: new Date(),
              changes: { assignedTo: null },
              changedBy: 'user123'
          });
          task.assignedTo = null;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(task));
      } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Task not found' }));
      }
  }
  
    // Bulk create tasks
    else if (pathname.startsWith('/tasks/') && method === 'POST' && pathname.endsWith('/bulk')) {
      let body = '';

      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const newTasks = JSON.parse(body);
          if (Array.isArray(newTasks)) {
            newTasks.forEach(task => {
              const newTask = {
                id: tasks.length + 1,
                title: task.title,
                description: task.description,
                dueDate: task.dueDate,
                status: task.status || 'pending',
                priority: task.priority || 'medium',
                category: task.category || 'general',
                history: [],
                comments: [],
                assignedTo: task.assignedTo || null
              };
              tasks.push(newTask);
            });
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newTasks));
          } else {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Invalid data format' }));
          }
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Invalid JSON' }));
        }
      });
    }
    // Delete task by ID
    else if (pathname.startsWith('/tasks/') && method === 'DELETE') {
      const id = parseInt(pathname.split('/')[2]);
      const taskIndex = tasks.findIndex(t => t.id === id);
      if (taskIndex !== -1) {
        tasks.splice(taskIndex, 1);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Task deleted successfully' }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Task not found' }));
      }
    }
    // Delete completed tasks
    else if (pathname === '/tasks/delete-completed' && method === 'DELETE') {
      const remainingTasks = tasks.filter(t => t.status !== 'completed');
      if (remainingTasks.length < tasks.length) {
        tasks.length = 0;
        tasks.push(...remainingTasks);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Completed tasks deleted successfully' }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'No completed tasks to delete' }));
      }
    }
    // Default response for unhandled routes
    else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Route not found' }));
    }
  }
}

