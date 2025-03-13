// utils/subscriptionLimits.js

const subscriptionLimits = {
    free: { todoCategories: 2, habits: 3, goals: 1, todayTasks: 5, notes: 10, journals: 3 },
    personal: { todoCategories: 10, habits: 10, goals: 5, todayTasks: 20, notes: 50, journals: 10 },
    community: { todoCategories: 20, habits: 20, goals: 10, todayTasks: 50, notes: 100, journals: 20 },
    premium: { todoCategories: 50, habits: 50, goals: 20, todayTasks: 100, notes: 200, journals: 50 },
    diamond: { todoCategories: 100, habits: 100, goals: 50, todayTasks: 500, notes: 500, journals: 100 },
  };
  
  module.exports = subscriptionLimits;
  