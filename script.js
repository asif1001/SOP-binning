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

// Function to load form entries from local storage
function loadEntries() {
    const entries = JSON.parse(localStorage.getItem('entries')) || [];
    return entries;
}

// Function to save form entries to local storage
function saveEntries(entries) {
    localStorage.setItem('entries', JSON.stringify(entries));
}

// Initialize form and load the last entry
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

// Clear all form data and reset for new input
function clearFormData() {
    entries = []; // Clear entries array
    saveEntries([]); // Clear entries from local storage
    resetForm(); // Reset the form
}

// Store form data to local storage and prepare the form for a new entry
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
}

// Generate Text content from the form entries for email and download
function generateTextContent() {
    let textContent = "Reference No\tDate\tBranch\tLocation\tPart No\tQty\n";
    entries.forEach(entry => {
        textContent += `${entry.referenceNo}\t${entry.dateTime}\t${entry.branch}\t${entry.location}\t${entry.partNo}\t${entry.qty}\n`;
    });
    return textContent;
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

// Submit button event listener to trigger email and save actions
document.getElementById('submitBtn').addEventListener('click', function() {
    // Store the current form data
    storeFormData();

    // Generate the text-formatted data
    const textContent = generateTextContent();
    
    // Download the form data as a note file (formatted as text)
    downloadTextFile("form_data.txt", textContent);

    // Send the form data via email in text format
    sendEmailWithText();

    // Clear all form data after submission and reset the form for new data
    clearFormData();
});

// Automatically focus on the "Branch" field when the form loads
window.onload = function() {
    document.getElementById('branch').focus();
};

// Handle Tab/Enter key navigation between form fields
function handleTabAndEnterNavigation(currentField, nextField) {
    currentField.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.key === 'Tab') {
            event.preventDefault(); // Prevent default tab behavior
            nextField.focus(); // Move focus to the next field
        }
    });
}

// Set up field navigation: Branch -> Location -> Part No -> Qty -> Location
handleTabAndEnterNavigation(document.getElementById('branch'), document.getElementById('location'));
handleTabAndEnterNavigation(document.getElementById('location'), document.getElementById('partNo'));
handleTabAndEnterNavigation(document.getElementById('partNo'), document.getElementById('qty'));

// After filling Qty, move back to Location and store the data
document.getElementById('qty').addEventListener('keydown', function(event) {
    if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault(); // Prevent default tab behavior
        storeFormData(); // Store the data in local storage
        document.getElementById('location').focus(); // Move focus back to Location
    }
});

// Handle Previous button to show the last entered data
document.getElementById('prevBtn').addEventListener('click', function() {
    if (currentIndex > 0) {
        currentIndex--;
        populateForm(entries[currentIndex]); // Show the previous entry
    } else {
        alert('No previous entries.');
    }
});

// Handle Next button to show the next data entry or reset the form
document.getElementById('nextBtn').addEventListener('click', function() {
    if (currentIndex < entries.length - 1) {
        currentIndex++;
        populateForm(entries[currentIndex]); // Show the next entry
    } else {
        resetForm(); // Prepare for new entry if no next entry exists
    }
});
