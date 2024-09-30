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

// Function to populate the form with the current entry data
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
    referenceNo = generateReferenceNo();  // Generate new reference no
    dateTime = getCurrentDateTime();      // Generate new date and time
    document.getElementById('referenceNo').value = referenceNo;
    document.getElementById('dateTime').value = dateTime;
    document.getElementById('branch').value = '';
    document.getElementById('location').value = '';
    document.getElementById('partNo').value = '';
    document.getElementById('qty').value = '';
}

// Store form data in local storage and clear relevant fields
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

// Generate text content from the form entries in a table format
function generateTextContent() {
    let header = `| ${padText('Reference No', 15)} | ${padText('Date', 20)} | ${padText('Branch', 15)} | ${padText('Location', 15)} | ${padText('Part No', 15)} | ${padText('Qty', 5)} |\n`;
    let separator = `| ${'-'.repeat(15)} | ${'-'.repeat(20)} | ${'-'.repeat(15)} | ${'-'.repeat(15)} | ${'-'.repeat(15)} | ${'-'.repeat(5)} |\n`;
    let textContent = header + separator;
    entries.forEach(entry => {
        textContent += `| ${padText(entry.referenceNo, 15)} | ${padText(entry.dateTime, 20)} | ${padText(entry.branch, 15)} | ${padText(entry.location, 15)} | ${padText(entry.partNo, 15)} | ${padText(entry.qty, 5)} |\n`;
    });
    return textContent;
}

// Helper function to pad text for table alignment
function padText(text, width) {
    return text.padEnd(width, ' '); // Right-pad the text with spaces
}

// Function to download form data as a text file
function downloadTextFile(filename, text) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// Function to send email with text data
function sendEmailWithText() {
    const textContent = generateTextContent(); // Generate the text content from form data
    const referenceNo = document.getElementById('referenceNo').value; // Get the current reference number

    const params = {
        to_email: "asif.s@ekkanoo.com.bh,Abdul.R@Ekkanoo.com.bh,enrico.b@Ekkanoo.com.bh,fadhel.h@Ekkanoo.com.bh", // Multiple recipients
        subject: `SOP-Binning ${referenceNo}`, // Dynamic subject with reference number
        message_html: textContent.replace(/\n/g, '<br>') // Convert newlines to <br> for email formatting
    };

    // Use EmailJS to send the email
    emailjs.send("service_s2ro656", "template_nox6zuh", params)
        .then(function(response) {
            console.log('Email sent successfully', response.status, response.text);
            alert("Email has been sent successfully!");
        }, function(error) {
            console.error('Failed to send email', error);
            alert("Failed to send email. Please try again.");
        });
}

// Field navigation: from Location -> Part No -> Qty
function setupFieldNavigation() {
    const locationField = document.getElementById('location');
    const partNoField = document.getElementById('partNo');
    const qtyField = document.getElementById('qty');

    // Move from Location to Part No
    locationField.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.key === 'Tab') {
            event.preventDefault(); // Prevent default tab behavior
            partNoField.focus(); // Move focus to Part No
        }
    });

    // Move from Part No to Qty
    partNoField.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.key === 'Tab') {
            event.preventDefault(); // Prevent default tab behavior
            qtyField.focus(); // Move focus to Qty
        }
    });

    // Move from Qty back to Location after saving data
    qtyField.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.key === 'Tab') {
            event.preventDefault(); // Prevent default tab behavior
            storeFormData();  // Save the data when Qty is entered
            locationField.focus(); // Move focus back to Location for new entry
        }
    });
}

// Set up field navigation on page load
window.onload = function() {
    document.getElementById('branch').focus();  // Automatically focus on Branch field when form loads
    setupFieldNavigation();  // Set up the sequence of cursor movement
};

// Download button event listener to download all saved entries in a text file
document.getElementById('downloadBtn').addEventListener('click', function() {
    const textContent = generateTextContent();
    downloadTextFile("form_data.txt", textContent);
});

// Submit button event listener to send the saved data via email
document.getElementById('submitBtn').addEventListener('click', function() {
    sendEmailWithText();  // Send the saved data via email
});
