var selectedRow = null

function onFormSubmit(e) {
	event.preventDefault();
        var formData = readFormData();
        if (selectedRow == null){
            insertNewRecord(formData);
		}
        else{
            updateRecord(formData);
		}
        resetForm();    
}

function populateUsersTable(users) {
    const tbody = document.querySelector('#usersTable tbody');
    tbody.innerHTML = ''; // Clear existing table rows

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.fullName}</td>
            <td>${user.email}</td>
            <td>${user.password}</td>
            <td>
                <button onclick="editUser(${user.id})">Edit</button>
                <button onclick="deleteUser(${user.id})">Delete</button>
            </td>
            <td><input type="checkbox" name="selectedUsers" value="${user.id}"></td> <!-- Checkbox column -->
        `;
        tbody.appendChild(row);
    });
}

function getSelectedUserIds() {
    const checkboxes = document.querySelectorAll('input[name="selectedUsers"]:checked');
    const selectedIds = Array.from(checkboxes).map(checkbox => parseInt(checkbox.value));
    return selectedIds;
}

function createUser() {
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

}

function editUser(userId) {
}

function updateUser() {
    const userId = document.getElementById('editUserId').value;
    const fullName = document.getElementById('editFullName').value;
    const email = document.getElementById('editEmail').value;
    const password = document.getElementById('editPassword').value;

}

function deleteUser(userId) {
}

function readFormData() {
    var formData = {};
    formData["productCode"] = document.getElementById("productCode").value;
    formData["product"] = document.getElementById("product").value;
    formData["qty"] = document.getElementById("qty").value;
    formData["perPrice"] = document.getElementById("perPrice").value;
    return formData;
}

function insertNewRecord(data) {
    var table = document.getElementById("storeList").getElementsByTagName('tbody')[0];
    var newRow = table.insertRow(table.length);
    cell1 = newRow.insertCell(0);
		cell1.innerHTML = data.productCode;
    cell2 = newRow.insertCell(1);
		cell2.innerHTML = data.product;
    cell3 = newRow.insertCell(2);
		cell3.innerHTML = data.qty;
    cell4 = newRow.insertCell(3);
		cell4.innerHTML = data.perPrice;
    cell4 = newRow.insertCell(4);
        cell4.innerHTML = `<button onClick="onEdit(this)">Edit</button> <button onClick="onDelete(this)">Delete</button>`;
}

function onEdit(td) {
    selectedRow = td.parentElement.parentElement;
    document.getElementById("productCode").value = selectedRow.cells[0].innerHTML;
    document.getElementById("product").value = selectedRow.cells[1].innerHTML;
    document.getElementById("qty").value = selectedRow.cells[2].innerHTML;
    document.getElementById("perPrice").value = selectedRow.cells[3].innerHTML;
}
function updateRecord(formData) {
    selectedRow.cells[0].innerHTML = formData.productCode;
    selectedRow.cells[1].innerHTML = formData.product;
    selectedRow.cells[2].innerHTML = formData.qty;
    selectedRow.cells[3].innerHTML = formData.perPrice;
}

function onDelete(td) {
    if (confirm('Do you want to delete this record?')) {
        row = td.parentElement.parentElement;
        document.getElementById('storeList').deleteRow(row.rowIndex);
        resetForm();
    }
}

function resetForm() {
    document.getElementById("productCode").value = '';
    document.getElementById("product").value = '';
    document.getElementById("qty").value = '';
    document.getElementById("perPrice").value = '';
    selectedRow = null;
}
document.addEventListener("DOMContentLoaded", async function() {
    const usersTable = document.getElementById("usersTable").getElementsByTagName('tbody')[0];

    try {
        const response = await fetch('  http://127.0.0.1:5000/users');

        var data = await response.json();

        data.forEach(user => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.full_name}</td>
                <td>${user.email}</td>
               
            `;
            usersTable.appendChild(row);
        });
    } catch (error) {
        console.error("Error:", error);
    }
});


function createUser() {
    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // Email regular expression pattern
    const emailRegex = /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Check if all fields are filled
    if (fullName === '' || email === '' || password === '') {
        alert("Please fill in all fields.");
        return; 
    }

    // Check if the entered email matches the email regex pattern
    if (!emailRegex.test(email)) {
        alert("Please enter a valid email address.");
        return; // Stop form submission if email is invalid
    }

    // Check if the email already exists in the table
    const emailTable = document.getElementById("usersTable");
    const emails = Array.from(emailTable.getElementsByTagName("td")).map(td => td.textContent.trim());
    console.log (emails)
    if (emails.includes(email)) {
        alert("This email is already in use. Please use a different email.");
        return;
    }

    // Proceed with user creation
    const url = `http://127.0.0.1:5000/users?full_name=${encodeURIComponent(fullName)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;

    fetch(url, {
        method: "POST",
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json();
    })
    .then(data => {
        alert("User Created Succefully");

        console.log("User created successfully:", data);
        window.location.reload();
    })
    .catch(error => {
        console.error("Error:", error);
        alert("An error occurred. Please try again."); 
    }); 
}

// Add event listener to form submission
document.getElementById("create-user-form").addEventListener("submit", function(event) {
    event.preventDefault();
    createUser();
});


function clearEditUserFields() {
    document.getElementById('editUserId').value = '';
    document.getElementById('editFullName').value = '';
    document.getElementById('editEmail').value = '';
    document.getElementById('editPassword').value = '';
}

function searchUserByEmail() {
    var email = document.getElementById("searchInput").value;

    if (!email) {
        alert("Please enter an email or ID to search for.");
        return;
    }

    if (/^\d+$/.test(email)) {
        searchUserById(email);
    } else {
        fetch(`   http://127.0.0.1:5000/user?email=`  + email)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("Failed to search for user: " + response.statusText);
            }
        })
        .then(data => {
            console.log(data); 
            if (data.error) {
                alert(data.error); 
            } else {
                document.getElementById("userIdLabel").innerText = data.id;
                document.getElementById("fullName").value = data.full_name;
                document.getElementById("email").value = data.email;
            }
        })
        .catch(error => {
            alert("Error: " + error.message);
        });
    }
}

function searchUserById(id) {
    fetch(`   http://127.0.0.1:5000/user?id=`  + id)
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error("Failed to search for user: " + response.statusText);
        }
    })
    .then(data => {
        console.log(data); 
        if (data.error) {
            alert(data.error); 
        } else {
            
            document.getElementById("userIdLabel").innerText = data.id;
            document.getElementById("fullName").value = data.full_name;
            document.getElementById("email").value = data.email;
            document.getElementById("password").value = data.password;
        }
    })
    .catch(error => {
        alert("Error: " + error.message);
    });
}

function deleteUser() {
    var userId = document.getElementById("userIdLabel").textContent;

    if (!userId) {
        alert("Please select a user to delete.");
        return;
    }

    var confirmation = confirm("Are you sure you want to delete this user?");
    if (!confirmation) {
        return;
    }

    fetch("   http://127.0.0.1:5000/users/" + userId, {
        method: "DELETE"
    })
    .then(response => {
        if (response.ok) {
            alert("User deleted successfully.");
            window.location.reload();
        } else {
            throw new Error("Failed to delete user: " + response.statusText);
        }
    })
    .catch(error => {
        alert("Error: " + error.message);
    });
}

function editUser() {
    var userId = document.getElementById("userIdLabel").innerText;س

    var fullName = document.getElementById("fullName").value;
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    var userData = {
        "full_name": fullName,
        "email": email,
        "password": password
    };

    fetch(`  http://127.0.0.1:5000/users/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => {
        if (response.ok) {
            alert("User updated successfully.");
            window.location.reload();

        } else {
            throw new Error("Failed to update user: " + response.statusText);
        }
    })
    .catch(error => {
        alert("Error: " + error.message);
    });
}
