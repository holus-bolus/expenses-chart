document.addEventListener('DOMContentLoaded', function () {
    const expenseForm = document.getElementById('expense-form');
    const expenseList = document.getElementById('expenseList');
    const filterCategory = document.getElementById('filterCategory');
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

    let currentEditId = null;
    function displayExpenses(expensesToDisplay) {
        if (!Array.isArray(expensesToDisplay)) {
            console.error('Invalid data for displaying expenses:', expensesToDisplay);
            return;
        }
        expenseList.innerHTML = '';
        expensesToDisplay.forEach((expense, index) => {
            const expenseItem = document.createElement('li');
            expenseItem.classList.add('list-group-item');
            expenseItem.innerHTML = `
                <strong>${expense.amount}</strong> - ${expense.category} <span class="float-right">${expense.date}</span>
                <button class="btn btn-sm btn-info edit-btn" data-index="${index}">Edit</button>
                <button class="btn btn-sm btn-danger delete-btn" data-index="${index}">Delete</button>
            `;
            expenseList.appendChild(expenseItem);
        });

        drawChart(expensesToDisplay); // Update chart with current expenses
    }

    function drawChart(data) {
        const canvas = document.getElementById('expenseChart');
        if (canvas.getContext) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear existing drawing

            const width = 40; // Width of each bar
            const gap = 10;   // Gap between bars
            let maxAmount = Math.max(...data.map(d => d.amount)); // Find maximum expense amount for scaling

            data.forEach((expense, index) => {
                const x = 50 + (width + gap) * index; // X position
                const y = canvas.height - 40;        // Y position (base line)
                const height = (expense.amount / maxAmount) * (canvas.height - 60); // Scaled height of the bar

                ctx.fillStyle = '#007bff'; // Bar color
                ctx.fillRect(x, y - height, width, height);

                ctx.fillStyle = '#000';
                ctx.fillText(expense.category, x, y + 15);
            });
        } else {
            console.error('Canvas not supported in this browser.');
        }
    }


    expenseList.addEventListener('click', function (e) {
        if (e.target.classList.contains('delete-btn')) {
            const index = e.target.getAttribute('data-index');
            expenses.splice(index, 1);
            localStorage.setItem('expenses', JSON.stringify(expenses));
            displayExpenses(expenses);
        } else if (e.target.classList.contains('edit-btn')) {
            const index = e.target.getAttribute('data-index');
            const expenseToEdit = expenses[index];
            document.getElementById('expenseAmount').value = expenseToEdit.amount;
            document.getElementById('expenseCategory').value = expenseToEdit.category;
            document.getElementById('expenseDate').value = expenseToEdit.date;
            currentEditId = index;
        }
    });



    expenseForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        const category = document.getElementById('expenseCategory').value;
        const date = document.getElementById('expenseDate').value;
        if (currentEditId !== null) {
            expenses[currentEditId] = { id: expenses[currentEditId].id, amount, category, date };
            currentEditId = null;
        } else {
            expenses.push({ id: Date.now(), amount, category, date });
        }

        localStorage.setItem('expenses', JSON.stringify(expenses));
        displayExpenses(expenses);
        expenseForm.reset();

    });

    filterCategory.addEventListener('change', function () {
        const selectedCategory = this.value;
        let filteredExpenses = selectedCategory === 'All' ? expenses : expenses.filter(expense => expense.category === selectedCategory);
        displayExpenses(filteredExpenses);
    });
    displayExpenses(expenses);
});


