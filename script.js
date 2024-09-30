// Initialize EmailJS
(function(){
    emailjs.init("YOUR_USER_ID"); // Replace with your EmailJS user ID
})();

// Function to generate the reference number
function generateReferenceNo() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}${month}${date}${hours}${minutes}`;
}

// Function to get the current date and time in a readable format
function getCurrentDateTime() {
    const now = new Date();
    return now.toLocaleString(); // This will return the date and time in local format
}

// Function to load entries from local storage
function loadEntries() {
    const entries = JSON.parse(localStorage.getItem('entries')) || [];
    return entries;
}

// Function to save entries to local storage
function saveEntries(entries) {
    localStorage.setItem('entries', JSON.stringify(entries));
}

// Initialize form and load the first entry
let currentIndex = 0;
let entries = loadEntries();
let referenceNo = generateReferenceNo();
let dateTime = getCurrentDateTime();
if (entries.length > 0) {
    currentIndex = entries.length - 1; // Start by showing the last entry
    populateForm(entries[currentIndex]);
} else {
    resetForm();
}

// Function to populate the form with an entry
function populateForm(entry) {
    document.getElementById('referenceNo').value = entry.referenceNo;
    document.getElementById('dateTime').value = entry.dateTime;
    document.getElementById('branch').value = entry.branch;
    document.getElementById('location').value = entry.location;
    document.getElementById('partNo').value = entry.partNo;
    document.getElementById('qty').value = entry.qty;
}

// Function to reset the form while keeping Reference No, Date, and Branch
function resetForm() {
    document.getElementById('referenceNo').value = referenceNo;
    document.getElementById('dateTime').value = dateTime;
    document.getElementById('location').value = '';
    document.getElementById('partNo').value = '';
    document.getElementById('qty').value = '';
}

// Function to store form data in local storage and reset the form for a new entry
function storeFormData() {
    const newEntry = {
        referenceNo: document.getElementById('referenceNo').value,
        dateTime: document.getElementById('dateTime').value,
        branch: document.getElementById('branch').value,
        location: document.getElementById('location').value,
        partNo: document.getElementById('partNo').value,
        qty: document.getElementById('qty').value
    };

    if (entries[currentIndex]) {
        // If the current entry is being edited, update it
        entries[currentIndex] = newEntry;
    } else {
        // Otherwise, add a new entry
        entries.push(newEntry);
        currentIndex = entries.length - 1; // Move index to the latest entry
    }

    saveEntries(entries); // Save updated entries to local storage
    resetForm(); // Clear form fields except Reference No, Date, and Branch
}

// Function to generate CSV content from entries
function generateCSV() {
    let csvContent = "Reference No,Date,Branch,Location,Part No,Qty\n";
    entries.forEach(entry => {
        csvContent += `${entry.referenceNo},${entry.dateTime},${entry.branch},${entry.location},${entry.partNo},${entry.qty}\n`;
    });
    return csvContent;
}

// Function to download data as a text file
function downloadTextFile(filename, text) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// Function to send email with CSV data
function sendEmailWithCSV() {
    const csvContent = generateCSV();
    const params = {
        to_email: "recipient@example.com", // Replace with recipient's email
        message_html: "Please find the attached form entries in CSV format.",
        attachment: csvContent
    };

    emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", params)
        .then(function(response) {
            console.log('Email sent successfully', response.status, response.text);
            alert("Email has been sent successfully!");
        }, function(error) {
            console.log('Failed to send email', error);
        });
}

// Event handler for Submit button
document.getElementById('submitBtn').addEventListener('click', function() {
    // Send email with CSV data
    sendEmailWithCSV();

    // Save data as text file
    const textData = JSON.stringify(entries, null, 2);
    downloadTextFile("form_data.txt", textData);

    // Reset form after submission
    entries = []; // Clear all entries after submission
    referenceNo = generateReferenceNo();
    dateTime = getCurrentDateTime();
    resetForm();
});

// Automatically focus on the "Branch" field only the first time the form is loaded
window.onload = function() {
    document.getElementById('branch').focus();
};

// Function to handle tab and enter key events
function handleTabAndEnterNavigation(currentField, nextField) {
    currentField.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.key === 'Tab') {
            event.preventDefault(); // Prevent default tab behavior
            nextField.focus(); // Move focus to the next field
        }
    });
}

// Set up navigation between fields
handleTabAndEnterNavigation(document.getElementById('branch'), document.getElementById('location'));
handleTabAndEnterNavigation(document.getElementById('location'), document.getElementById('partNo'));
handleTabAndEnterNavigation(document.getElementById('partNo'), document.getElementById('qty'));

// After filling Qty, move the cursor back to Location and store data
document.getElementById('qty').addEventListener('keydown', function(event) {
    if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault(); // Prevent default tab behavior
        storeFormData(); // Store data when moving back after Qty is filled
        document.getElementById('location').focus(); // Move focus back to Location
    }
});

// Event handler for Previous button
document.getElementById('prevBtn').addEventListener('click', function() {
    if (currentIndex > 0) {
        currentIndex--;
        populateForm(entries[currentIndex]); // Show previous entry
    } else {
        alert('No previous entries.');
    }
});

// Event handler for Next button
document.getElementById('nextBtn').addEventListener('click', function() {
    if (currentIndex < entries.length - 1) {
        currentIndex++;
        populateForm(entries[currentIndex]); // Show next entry
    } else {
        resetForm(); // Prepare for new entry if no next entry exists
    }
});
