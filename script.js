const form = document.getElementById('student-form');
const studentTableBody = document.querySelector('#student-table tbody');
const searchInput = document.getElementById('search-input');
const clearFormButton = document.getElementById('clear-form');

const studentFields = {
    id: document.getElementById('student-id'),
    name: document.getElementById('student-name'),
    father: document.getElementById('father-name'),
    mother: document.getElementById('mother-name'),
    mobile: document.getElementById('mobile-number'),
    course: document.getElementById('course'),
    branch: document.getElementById('branch'),
};

let students = [];

function formatCell(value) {
    return document.createTextNode(value);
}

function renderTable(filter = '') {
    studentTableBody.innerHTML = '';
    const normalizedFilter = filter.trim().toLowerCase();
    const filteredStudents = students.filter(student => {
        const rowText = Object.values(student).join(' ').toLowerCase();
        return rowText.includes(normalizedFilter);
    });

    if (filteredStudents.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.classList.add('empty-row');
        const emptyCell = document.createElement('td');
        emptyCell.colSpan = 8;
        emptyCell.textContent = 'No matching students found.';
        emptyRow.appendChild(emptyCell);
        studentTableBody.appendChild(emptyRow);
        return;
    }

    filteredStudents.forEach(student => {
        const row = document.createElement('tr');
        Object.values(student).forEach(value => {
            const cell = document.createElement('td');
            cell.appendChild(formatCell(value || ''));
            row.appendChild(cell);
        });

        const actionsCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'delete-button';
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            deleteStudent(student.id);
        });
        actionsCell.appendChild(deleteButton);
        row.appendChild(actionsCell);
        studentTableBody.appendChild(row);
    });
}

function clearForm() {
    Object.values(studentFields).forEach(field => field.value = '');
}

function showAlert(message) {
    alert(message);
}

async function loadStudents() {
    try {
        const response = await fetch('/api/students');
        if (!response.ok) {
            throw new Error('Failed to load students from server.');
        }
        students = await response.json();
        renderTable(searchInput.value);
    } catch (error) {
        showAlert(error.message);
    }
}

async function addStudent(student) {
    try {
        const response = await fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(student),
        });

        if (!response.ok) {
            const body = await response.json();
            throw new Error(body.message || 'Failed to add student.');
        }

        clearForm();
        await loadStudents();
    } catch (error) {
        showAlert(error.message);
    }
}

async function deleteStudent(id) {
    try {
        const response = await fetch(`/api/students/${encodeURIComponent(id)}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const body = await response.json();
            throw new Error(body.message || 'Failed to delete student.');
        }

        await loadStudents();
    } catch (error) {
        showAlert(error.message);
    }
}

function handleFormSubmit(event) {
    event.preventDefault();
    const student = {
        id: studentFields.id.value.trim(),
        name: studentFields.name.value.trim(),
        father: studentFields.father.value.trim(),
        mother: studentFields.mother.value.trim(),
        mobile: studentFields.mobile.value.trim(),
        course: studentFields.course.value.trim(),
        branch: studentFields.branch.value.trim(),
    };

    if (!student.id || !student.name || !student.father || !student.mother || !student.mobile || !student.course || !student.branch) {
        showAlert('Please complete all fields before adding the student.');
        return;
    }

    addStudent(student);
}

form.addEventListener('submit', handleFormSubmit);
searchInput.addEventListener('input', () => renderTable(searchInput.value));
clearFormButton.addEventListener('click', clearForm);

loadStudents();
