let ordersQueue = []; // FCFS
let sjfQueue = []; // SJF
let cachedMealsFIFO = []; // FIFO Cache for meals
let cachedCustomersLRU = []; // LRU Cache for customer IDs
let mealIdCounter = 1; // To generate unique order IDs
const cacheSize = 5; // Cache size for both FIFO and LRU

function placeOrder() {
  const meal = document.getElementById('orderMeal').value;
  const distance = parseInt(document.getElementById('deliveryDistance').value);
  const customerId = document.getElementById('customerId').value.trim();

  if (!customerId || !meal || isNaN(distance) || distance < 0 || distance > 50) {
    alert('Please enter valid details.');
    return;
  }

  const orderId = mealIdCounter++;
  const now = new Date();
  const orderTime = now.toLocaleTimeString(); // For display
  const arrivalTime = now.getTime() / 60000; // Time in minutes for calculations

  ordersQueue.push({ orderId, orderTime, arrivalTime, meal, distance });
  sjfQueue.push({ orderId, orderTime, arrivalTime, distance, meal });
  sjfQueue.sort((a, b) => a.distance - b.distance);

  cacheMealFIFO(meal);
  cacheCustomerLRU(customerId);

  updateOrderQueue();
  updateFrequentMeals();
}

function calculateTimes(queue, resultElementId) {
  let totalWaitingTime = 0;
  let totalTurnaroundTime = 0;
  let currentTime = 0;

  queue.forEach(order => {
    const burstTime = order.distance * 10; // burst time in minutes
    const waitingTime = Math.max(0, currentTime - order.arrivalTime);
    const turnaroundTime = waitingTime + burstTime;

    currentTime = Math.max(currentTime, order.arrivalTime) + burstTime;

    totalWaitingTime += waitingTime;
    totalTurnaroundTime += turnaroundTime;
  });

  const avgWaitingTime = (totalWaitingTime / queue.length).toFixed(2);
  const avgTurnaroundTime = (totalTurnaroundTime / queue.length).toFixed(2);
  document.getElementById(resultElementId).innerHTML = `
  <p>Average Waiting Time: ${avgWaitingTime} mins</p>
  <p>Average Turnaround Time: ${avgTurnaroundTime} mins</p>
`;

}

function calculateAndDisplayResults() {
  calculateTimes(ordersQueue, 'fcfsResults');
  calculateTimes(sjfQueue, 'sjfResults');
}

function updateOrderQueue() {
  updateFCFSQueue();
  updateSJFQueue();
  calculateAndDisplayResults();
}

function updateFCFSQueue() {
  const fcfsTable = document.getElementById('fcfsQueue').getElementsByTagName('tbody')[0];
  fcfsTable.innerHTML = '';

  ordersQueue.forEach(order => {
    const row = fcfsTable.insertRow();
    row.insertCell(0).textContent = order.orderId;
    row.insertCell(1).textContent = order.orderTime;
    row.insertCell(2).textContent = order.meal;
  });
}

function updateSJFQueue() {
  const sjfTable = document.getElementById('sjfQueue').getElementsByTagName('tbody')[0];
  sjfTable.innerHTML = '';

  sjfQueue.forEach(order => {
    const row = sjfTable.insertRow();
    row.insertCell(0).textContent = order.orderId;
    row.insertCell(1).textContent = order.distance;
    row.insertCell(2).textContent = order.meal;
  });
}


function updateFrequentMeals() {
  updateFIFOMeals();
  updateLRUMeals();
}

function updateFIFOMeals() {
  const fifoList = document.getElementById('fifoMeals');
  fifoList.innerHTML = ''; // Clear existing list

  // Add only valid, non-empty meals to the list
  cachedMealsFIFO.forEach(meal => {
    if (meal.trim() !== "") {
      const li = document.createElement('li');
      li.textContent = meal;
      fifoList.appendChild(li);
    }
  });
}

function updateLRUMeals() {
  const lruList = document.getElementById('lruMeals');
  lruList.innerHTML = '';
  for (let i = cachedCustomersLRU.length - 1; i >= 0; i--) {
    const li = document.createElement('li');
    li.textContent = cachedCustomersLRU[i];
    lruList.appendChild(li);
  }
}

function cacheMealFIFO(meal) {
  if (cachedMealsFIFO.includes(meal)) return;
  if (cachedMealsFIFO.length >= cacheSize) cachedMealsFIFO.shift();
  cachedMealsFIFO.push(meal);
  updateFIFOMeals(); // Update the display
}


function cacheCustomerLRU(customerId) {
  const index = cachedCustomersLRU.indexOf(customerId);
  if (index !== -1) cachedCustomersLRU.splice(index, 1);
  cachedCustomersLRU.push(customerId);
  if (cachedCustomersLRU.length > cacheSize) cachedCustomersLRU.shift();
}
