let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let currency = 'INR'; // Default currency

const transactionForm = document.getElementById('transactionForm');
const descriptionInput = document.getElementById('description');
const typeInput = document.getElementById('type');
const categoryInput = document.getElementById('category');
const amountInput = document.getElementById('amount');
const transactionTableBody = document.querySelector('#transactionTable tbody');
const totalIncomeElement = document.getElementById('totalIncome');
const totalExpenseElement = document.getElementById('totalExpense');
const balanceElement = document.getElementById('balance');
const currencySelector = document.getElementById('currency');
const expenseChartCanvas = document.getElementById('expenseChart');

// Chart.js initialization
const expenseChart = new Chart(expenseChartCanvas, {
  type: 'bar',
  data: {
    labels: ['Income', 'Expense'],
    datasets: [{
      label: 'Amount',
      data: [0, 0],
      backgroundColor: ['#4CAF50', '#FF5722'],
      borderColor: ['#4CAF50', '#FF5722'],
      borderWidth: 1
    }]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});

// Function to render transactions in the table
function renderTransactions() {
  transactionTableBody.innerHTML = '';
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((transaction, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${transaction.description}</td>
      <td>${transaction.type}</td>
      <td>${transaction.category}</td>
      <td>${formatCurrency(transaction.amount)}</td>
      <td><button onclick="deleteTransaction(${index})">Delete</button></td>
    `;
    transactionTableBody.appendChild(row);

    if (transaction.type === 'income') {
      totalIncome += transaction.amount;
    } else {
      totalExpense += transaction.amount;
    }
  });

  // Update totals
  totalIncomeElement.textContent = formatCurrency(totalIncome);
  totalExpenseElement.textContent = formatCurrency(totalExpense);
  balanceElement.textContent = formatCurrency(totalIncome - totalExpense);

  // Update chart
  expenseChart.data.datasets[0].data = [totalIncome, totalExpense];
  expenseChart.update();

  // Save transactions to localStorage
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Function to format currency based on selected currency
function formatCurrency(amount) {
  return currency === 'USD' ? `$${amount.toFixed(2)}` : `₹${amount.toFixed(2)}`;
}

// Event listener for form submission
transactionForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const description = descriptionInput.value.trim();
  const type = typeInput.value;
  const category = categoryInput.value;
  const amount = parseFloat(amountInput.value);

  if (description && amount > 0) {
    const transaction = { description, type, category, amount };
    transactions.push(transaction);
    renderTransactions();

    // Reset form fields
    descriptionInput.value = '';
    amountInput.value = '';
  } else {
    alert('Please enter valid details.');
  }
});

// Function to delete a transaction
function deleteTransaction(index) {
  transactions.splice(index, 1); // Remove transaction from array
  renderTransactions(); // Re-render the table
}

// Function to download a report
function downloadReport() {
  const reportContent = transactions
    .map((t, i) => `${i + 1}. ${t.description} (${t.type}, ${t.category}): ${formatCurrency(t.amount)}`)
    .join('\n');

  const blob = new Blob([reportContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'expense_report.txt';
  a.click();

  URL.revokeObjectURL(url);
}

// Event listener for currency change
currencySelector.addEventListener('change', (e) => {
  currency = e.target.value;
  renderTransactions();
});

// Function to download the chart as an image
function downloadChart() {
  const link = document.createElement('a');
  link.href = expenseChartCanvas.toDataURL('image/png'); // Convert chart to PNG
  link.download = 'expense_chart.png'; // File name
  link.click(); // Trigger download
}

// Initial render
renderTransactions();