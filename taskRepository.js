import { tasks } from "../mock-data/taskMock_data.js";
export class TaskRepository {
  static findAll() {
    return tasks;
  }

  static findById(id) {
    return tasks.find(t => t.id === id);
  }

  static create(task) {
    task.id = tasks.length ? Math.max(tasks.map(t => t.id)) + 1 : 1;
    task.history = [];
    task.comments = [];
    task.status = task.status || 'pending';
    tasks.push(task);
    saveTasks();
    return task;
  }

  static update(id, updatedTask) {
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      if (!tasks[index].history) {
        tasks[index].history = [];
      }
      tasks[index].history.push({
        timestamp: new Date(),
        changes: updatedTask,
        changedBy: 'user123'
      });
      tasks[index] = { ...tasks[index], ...updatedTask };
      saveTasks();
      return tasks[index];
    }
    return null;
  }

  static delete(id) {
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks.splice(index, 1);
      saveTasks();
      return true;
    }
    return false;
  }

  static findByStatus(status) {
    return tasks.filter(t => t.status === status);
  }

  static findOverdueTasks() {
    const today = new Date();
    return tasks.filter(t => new Date(t.dueDate) < today && !t.completed);
  }

  static findDueSoonTasks(days = 7) {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + days);
    return tasks.filter(t => new Date(t.dueDate) >= today && new Date(t.dueDate) <= endDate);
  }

  static search(keyword) {
    keyword = keyword.toLowerCase();
    return tasks.filter(t =>
      (t.title && t.title.toLowerCase().includes(keyword)) ||
      (t.description && t.description.toLowerCase().includes(keyword))
    );
  }

  static archive(id) {
    const task = tasks.find(t => t.id === id);
    if (task && task.completed) {
      if (!task.history) {
        task.history = [];
      }
      task.history.push({
        timestamp: new Date(),
        changes: { status: 'archived' },
        changedBy: 'user123'
      });
      task.status = 'archived';
      saveTasks();
      return task;
    }
    return null;
  }

  static getArchivedTasks() {
    return tasks.filter(t => t.status === 'archived');
  }

  static assign(id, assignedTo) {
    const task = tasks.find(t => t.id === id);
    if (task) {
      if (!task.history) {
        task.history = [];
      }
      task.history.push({
        timestamp: new Date(),
        changes: { assignedTo },
        changedBy: 'user123'
      });
      task.assignedTo = assignedTo;
      saveTasks();
      return task;
    }
    return null;
  }

  static unassign(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
      if (!task.history) {
        task.history = [];
      }
      task.history.push({
        timestamp: new Date(),
        changes: { assignedTo: null },
        changedBy: 'user123'
      });
      task.assignedTo = null;
      saveTasks();
      return task;
    }
    return null;
  }

  static bulkCreate(newTasks) {
    if (Array.isArray(newTasks)) {
      newTasks.forEach(task => {
        const newTask = {
          id: tasks.length ? Math.max(tasks.map(t => t.id)) + 1 : 1,
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          status: task.status
        };
        tasks.push(newTask);
      });
      saveTasks();
      return tasks;
    }
    return [];
  }

  static completeAll() {
    const updatedTasks = [];
    tasks.forEach(task => {
      if (task.status === 'pending') {
        if (!task.history) {
          task.history = [];
        }
        task.history.push({
          timestamp: new Date(),
          changes: { status: 'completed' },
          changedBy: 'user123'
        });
        task.status = 'completed';
        updatedTasks.push(task);
      }
    });
    saveTasks();
    return updatedTasks;
  }

  static duplicate(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
      const newTask = { ...task, id: tasks.length ? Math.max(tasks.map(t => t.id)) + 1 : 1 };
      newTask.comments = [];
      newTask.history = [];
      tasks.push(newTask);
      saveTasks();
      return newTask;
    }
    return null;
  }

  static share(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
      const shareableLink = `http://localhost:3000/tasks/${id}/view-only`;
      return { shareableLink };
    }
    return null;
  }

  static getHistory(id) {
    const task = tasks.find(t => t.id === id);
    if (task && task.history) {
      return task.history;
    }
    return [];
  }
}