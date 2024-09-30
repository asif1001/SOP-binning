// Initialize EmailJS with your User ID (Public Key)
(function(){
    emailjs.init("H1NlmM-K_eGlclzfa"); // Replace with your actual User ID (Public Key)
})();

// Function to generate the reference number (YearMonthDayHourMinute)
function generateReferenceNo() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}${month}${date}${hours}${minutes}`;
}

// Function to get the current date and time
function getCurrentDateTime() {
    const now = new Date();
    return now.toLocaleString(); // This will return the date and time in local format
}

// Load form entries from local storage
function loadEntries() {
    const entries = JSON.parse(localStorage.getItem('entries')) || [];
    return entries;
}

// Save form entries to local storage
function saveEntries(entries) {
    localStorage.setItem('entries', JSON.stringify(entries));
}

// Initialize form and reset values
let entries = loadEntries();
let referenceNo = generateReferenceNo();
let dateTime = getCurrentDateTime();
resetForm();  // Ensure all fields except Reference No and Date/Time are empty

// Function to reset the form while keeping Reference No, Date, and Branch
function resetForm() {
    referenceNo = generateReferenceNo();  // Generate new reference no
    dateTime = getCurrentDateTime();      // Generate new date and time
    document.getElementById('referenceNo').value = referenceNo;
    document.getElementById('dateTime').value = dateTime;
    document.getElementById('branch').value = '';
    document.getElementById('location').value = '';
    document.getElementById('partNo').value = '';
    document.getElementById('qty').value = '';
}

// Store form data and clear relevant fields
function storeFormData() {
    const newEntry = {
        referenceNo: document.getElementById('referenceNo').value,
        dateTime: document.getElementById('dateTime').value,
        branch: document.getElementById('branch').value,
        location: document.getElementById('location').value,
        partNo: document.getElementById('partNo').value,
        qty: document.getElementById('qty').value
    };

    entries.push(newEntry);  // Add a new entry
    saveEntries(entries);    // Save entries to local storage

    // Clear Location, Part No, and Qty after saving data
    document.getElementById('location').value = '';
    document.getElementById('partNo').value = '';
    document.getElementById('qty').value = '';
    document.getElementById('location').focus();  // Move focus back to Location
}

// Function to generate text content for the email (in a key-value pair format, like we did in the battery project)
function generateTextContent() {
    let textContent = `SOP Binning Data:\n\n`;

    // Iterate over each saved entry and append it as key-value pairs
    entries.forEach(entry => {
        textContent += `Reference No: ${entry.referenceNo}\n`;
        textContent += `Date/Time: ${entry.dateTime}\n`;
        textContent += `Branch: ${entry.branch}\n`;
        textContent += `Location: ${entry.location}\n`;
        textContent += `Part No: ${entry.partNo}\n`;
        textContent += `Qty: ${entry.qty}\n`;
        textContent += `-------------------------\n`; // Separator for each entry
    });

    return textContent;
}

// Function to send email with the collected form data using EmailJS
function sendEmailWithText() {
    const referenceNo = document.getElementById('referenceNo').value; // Get the current reference number

    // Collect all form data and format it into key-value pairs
    const emailContent = generateTextContent(); // Generate the email content from saved form data

    // EmailJS params for sending the email
    const params = {
        to_email: "asif.s@ekkanoo.com.bh,Abdul.R@Ekkanoo.com.bh,enrico.b@Ekkanoo.com.bh,fadhel.h@Ekkanoo.com.bh", // Multiple recipients
        subject: `SOP-Binning ${referenceNo}`, // Dynamic subject with reference number
        message: emailContent  // The email body, with all saved data
    };

    // Use EmailJS to send the email
    emailjs.send("service_s2ro656", "template_nox6zuh", params)
        .then(function(response) {
            console.log('Email sent successfully', response.status, response.text);
            alert("Email has been sent successfully!"); // Notify the user
        }, function(error) {
            console.error('Failed to send email. Error details:', error);
            alert("Failed to send email. Please try again."); // Notify the user of failure
        });
}

// Event listener for the Submit button to send email
document.getElementById('submitBtn').addEventListener('click', function() {
    sendEmailWithText();  // Send the collected form data via email
});

// Function to download all saved data as a text file (Optional)
document.getElementById('downloadBtn').addEventListener('click', function() {
    const textContent = generateTextContent(); // Generate text content for download
    downloadTextFile("form_data.txt", textContent); // Download the text file with all form data
});

// Helper function to trigger file download
function downloadTextFile(filename, text) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// Field navigation: from Location -> Part No -> Qty
function setupFieldNavigation() {
    const locationField = document.getElementById('location');
    const partNoField = document.getElementById('partNo');
    const qtyField = document.getElementById('qty');

    // Helper function to handle Enter/Tab key navigation
    function handleKeyNavigation(event, nextField) {
        if (event.key === 'Enter' || event.key === 'Tab') {
            event.preventDefault(); // Prevent default tab behavior
            nextField.focus(); // Move focus to the next field
        }
    }

    // Move from Location to Part No
    locationField.addEventListener('keydown', function(event) {
        handleKeyNavigation(event, partNoField);
    });

    // Move from Part No to Qty
    partNoField.addEventListener('keydown', function(event) {
        handleKeyNavigation(event, qtyField);
    });

    // Save data and move back to Location from Qty
    qtyField.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.key === 'Tab') {
            event.preventDefault(); // Prevent default tab behavior
            storeFormData();  // Save the data when Qty is entered
        }
    });
}

// Set up field navigation on page load
window.onload = function() {
    document.getElementById('branch').focus();  // Automatically focus on Branch field when form loads
    setupFieldNavigation();  // Set up the sequence of cursor movement
};
