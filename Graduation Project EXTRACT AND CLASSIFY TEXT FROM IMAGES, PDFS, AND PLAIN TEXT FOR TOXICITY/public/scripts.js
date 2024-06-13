

   
var x = 'http://127.0.0.1:5000'

document.getElementById("inputForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const text = document.getElementById("inputText").value.trim();
    if (text === "") {
        alert("Please enter some text before submitting.");
        return;  
    }

    classifyText(text);
    $('.clear-history-button').show(); 
    addToHistory(text);
    addToHistory(""); 
});




function classifyText(text) {
    const formData = new FormData();
    formData.append("text", text);
    var cl_txt = "/classify_text"
    var url = (x+cl_txt);
    console.log(url)
    fetch(url, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        displayResponse(data);
        document.getElementById("fileContent").style.display = "none"; // Hide the file content div
    })
    .catch(error => console.error('Error:', error));
    
}

function displayResponse(data) {
    const classificationTable = document.getElementById("classificationTable");

    classificationTable.innerHTML = '<tr><th>Category</th><th>Probability</th></tr><tr>Bars<th></th>';

    if (data.error) {
        const errorRow = document.createElement("tr");
        errorRow.innerHTML = `<td colspan="3">Error: ${data.error}</td>`;
        classificationTable.appendChild(errorRow);
    } else {
        for (let category in data) {
            if (data.hasOwnProperty(category) && category !== 'error') {
                const probability = parseFloat(data[category]) * 100;
                const row = document.createElement("tr");
                row.innerHTML = `<td>${category}</td><td>${Math.floor(probability)}%</td>`; 
                classificationTable.appendChild(row);
            }
        }
    }
}

function clearText() {
    document.getElementById("inputText").value = ""; 
    document.getElementById("fileInput").value = ""; 
    
    const classificationScores = document.querySelectorAll("#classificationTable td:nth-child(2)");
    classificationScores.forEach(score => {
        score.innerText = "";
    });
} 
function clearHistory() {
    const historyItems = document.getElementById("historyItems");
    historyItems.innerHTML = ""; 
}

document.getElementById("inputForm").addEventListener("submit", function(event) {
    const text = document.getElementById("inputText").value.trim();
    if (text === "") {
        alert("Please enter some text before submitting.");
        event.preventDefault(); 
    }
});

document.getElementById("fileInput").addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (file) {
        processFile(file);
    }
});

function handleFileSelect(event) {
    event.preventDefault();
    const file = event.target.files[0];
    processFile(file);
}

function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
}

function handleDrop(event) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    processFile(file);
}

document.getElementById('container').addEventListener('dragover', handleDragOver);
document.getElementById('container').addEventListener('drop', handleDrop);

function processFile(file) {
    // Supported file types
    const supportedTypes = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg', 'image/jpg', 'audio/wav'];

    // Check if the file type is supported
    if (!supportedTypes.includes(file.type)) {
        alert("Unsupported file type. Please upload a PDF, DOCX, TXT, PNG, JPG, or JPEG file.");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);
    var pr_file = '/process_file'
    
    var url = (x+pr_file);
    console.log(pr_file)
    var url = (x+pr_file);
    console.log(url)
    fetch(url, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        const cleanedText = data.text.replace(/\{\s*text\s*:\s*|\s*}\s*|\\"|\\n|\\r/g, ''); // Remove label text, quotes, and escape characters
        document.getElementById("inputText").value = cleanedText.trim(); // Set cleaned extracted text to the input textarea
    })
    .catch(error => console.error('Error:', error));
}

document.getElementById("inputForm").addEventListener("submit", function(event) {
    event.preventDefault();
    const formData = new FormData(this);

    var cl_txt = "/classify_text"
    var url = (x+cl_txt);
    console.log(url)
    fetch(url, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        displayResponse(data);
        document.getElementById("fileContent").style.display = "none"; // Hide the file content div
    })
    .catch(error => console.error('Error:', error));
    
});

let classificationProbabilities = {};
function displayResponse(data) {
    const classificationTable = document.getElementById("classificationTable");

    classificationTable.innerHTML = '<tr><th>Category</th><th>Probability</th><th style="width:70%">Bars</th></tr>';

    if (data.error) {
        const errorRow = document.createElement("tr");
        errorRow.innerHTML = `<td colspan="3">Error: ${data.error}</td>`;
        classificationTable.appendChild(errorRow);
    } else {
        classificationProbabilities = {};

        for (let category in data) {
            if (data.hasOwnProperty(category) && category !== 'error') {
                const probability = Math.floor(parseFloat(data[category]) * 100);
                const row = document.createElement("tr");
                row.innerHTML = `<td>${category}</td><td>${probability}%</td><td></td>`; // Add an empty cell for "Bars"
                classificationTable.appendChild(row);

                classificationProbabilities[category.replace(/\s/g, '')] = probability;
            }
        }
        updateUIWithProbabilities();

        setBarsColumnWidth();
    }
}

function setBarsColumnWidth() {
    const barsCells = document.querySelectorAll("#classificationTable td:nth-child(3)");

    barsCells.forEach(cell => {
        cell.style.width = "100%"; 
    });
}


function updateUIWithProbabilities() {
    for (let category in classificationProbabilities) {
        if (classificationProbabilities.hasOwnProperty(category)) {
            window[category.toLowerCase() + 'Probability' ] = classificationProbabilities[category];
        }
    }

    console.log(toxicProbability);
    console.log(identity_hateProbability);
    console.log(insultProbability);
    console.log(obsceneProbability);
    console.log(severe_toxicProbability);
    console.log(threatProbability);


console.log(classificationProbabilities);


function classifyText(text) {
    const formData = new FormData();
    formData.append("text", text);
    var cl_txt = "/classify_text"
    var url = (x+cl_txt);
    console.log(url)
    fetch(url, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        displayResponse(data);
        document.getElementById("fileContent").style.display = "none"; 
    })
    .catch(error => console.error('Error:', error));
}

function clearText() {
    document.getElementById("inputText").value = ""; 
    document.getElementById("fileInput").value = ""; 
    document.getElementById('averageScore').textContent = '0';
    console.log(average="hi")
    const classificationScores = document.querySelectorAll("#classificationTable td:nth-child(2)");
    classificationScores.forEach(score => {
        score.innerText = "";
    });
}
function clearClassificationResult() {
    // Clear the classification table
    const classificationTable = document.getElementById("classificationTable");
    classificationTable.innerHTML = '<tr><th>Category</th><th>Probability</th><th>Bars</th></tr>';

    // Clear the average score
    document.getElementById('averageScore').textContent = '0';
}

// Add event listener for the clear button
document.querySelector("#history .clear-button").addEventListener("click", function(event) {
    clearClassificationResult();
});






$(document).ready(function() {
    moveProgressBar();
    $(window).resize(function() {
      moveProgressBar();
    });
    // Function to update and animate a specific progress bar
    function updateProgressBar(selector, newPercentage) {
      const element = $(selector);
      element.attr('data-progress-percent', newPercentage); // Update the data attribute
      const getPercent = newPercentage / 100;
      const getProgressWrapWidth = element.width();
      const progressTotal = getPercent * getProgressWrapWidth;
      const animationLength = 2500;
  
      element.find('.progress-bar').stop().animate({
        left: progressTotal
      }, animationLength);
    }
    let x = toxicProbability;
    console.log("x"+x) ;

    // Example usage: update specific progress bars
    updateProgressBar('.toxic-progress', toxicProbability); // Update toxic progress bar to 60%
      updateProgressBar('.identity-hate-progress', identity_hateProbability); // Update toxic progress bar to 60%
    updateProgressBar('.insult-progress', insultProbability); // Update toxic progress bar to 60%
    updateProgressBar('.obscene-progress', obsceneProbability); // Update toxic progress bar to 60%
    updateProgressBar('.severe-toxic-progress', severe_toxicProbability); // Update toxic progress bar to 60%
    updateProgressBar('.threat-progress', threatProbability); // Update toxic progress bar to 60%
  
    // You can call updateProgressBar with any valid selector targeting a single progress bar element
  });
  
  function moveProgressBar() {
      $('.progress-wrap').each(function() {
          var $this = $(this);
          var getPercent = $this.data('progress-percent') / 100;
          var getProgressWrapWidth = $this.width();
          var progressTotal = getPercent * getProgressWrapWidth;
          var animationLength = 2500;
  
          $this.find('.progress-bar').animate({
              left: progressTotal
          }, animationLength);
      });
  }

// Get all the progress bars
const progressBars = document.querySelectorAll('.progress-bar');

console.log("hi");

    let sum = 0;
    let count = 0;

    // Iterate through the probabilities and sum up the values, ignoring values between 0 and 10
    let probabilities = [toxicProbability, identity_hateProbability, insultProbability, severe_toxicProbability, threatProbability, obsceneProbability];
    for (let probability of probabilities) {
        if (probability < 0 || probability > 10) { // Check if the probability is outside the range of 0 to 10
            sum += probability;
            count++;
        }
    }


    // Calculate the average
    let average = count > 0 ? sum / count : 0;
    console.log("Average:", average);
    let newScore = average;
    document.getElementById('averageScore').textContent = newScore.toFixed(2);
    
        
    
    // Add event listener for the clear button
    document.querySelector("#history .clear-button").addEventListener("click", function(event) {
        // Clear the classification table
        const classificationTable = document.getElementById("classificationTable");
        classificationTable.innerHTML = '<tr><th>Category</th><th>Probability</th>Bars</tr>';
    let average = 0;
        // Clear the average score
        document.getElementById('averageScore').textContent = '0';
    console.log(average="hi")
    });
    
    
}

// Function to classify text
function classifyText(text) {
    console.log('Text to classify:', text); // Debugging: Log the text to classify
    const formData = new FormData();
    formData.append("text", text);
    var cl_txt = "/classify_text"
    var url = (x+cl_txt);
    console.log(url)
    fetch(url, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Display classification result
        displayResponse(data);
        document.getElementById("fileContent").style.display = "none"; // Hide the file content div
    })
    .catch(error => console.error('Error:', error));
}



window.onload = function() {
    // Access the classification table
    var table = document.getElementById("classificationTable");
    var rowData = [
        ["identity_hate", " ", ""],
        ["insult", " ", " "],
        ["obscene", " ", ""],
        ["severe_toxic", " ", ""],
        ["threat", " ", ""],
        ["toxic", " ", ""]
    ];

    // Fill the table with constant text
    for (var i = 0; i < rowData.length; i++) {
        var row = table.insertRow(); // Insert a new row

        // Insert cells for category and probability
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);

        // Set the width of the third cell to be wider
        cell3.style.width = "150px";

        // Fill cells with constant text
        cell1.innerHTML = rowData[i][0];
        cell2.innerHTML = rowData[i][1];
        cell3.innerHTML = rowData[i][2];

        // Add classes to style the cells
       
    }
}
function addToHistory(text) {
    let toxicProbability = 0;
let identity_hateProbability = 0;
let insultProbability = 0;
let severe_toxicProbability = 0;
let threatProbability = 0;
let obsceneProbability = 0;
    const historyItems = document.getElementById("historyItems");
    console.log("historyItems:", historyItems); // Check if historyItems is found
  
    // Check if the number of history items exceeds the limit
    if (historyItems.children.length >= 11) {
        alert("History limit reached. You cannot add more than 10 items to the history.");
        return; // Exit the function if the limit is reached
    }
    // Fetch classification probabilities for the text from the API
    const formData = new FormData();
    formData.append("text", text);
    var cl_txt = "/classify_text"
    var url = (x+cl_txt);
    console.log(url)
    fetch(url, {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      console.log("Received classification probabilities:", data); 
      toxicProbability = parseFloat(data.toxic) * 100;
      identity_hateProbability = parseFloat(data.identity_hate) * 100;
      insultProbability = parseFloat(data.insult) * 100;
      severe_toxicProbability = parseFloat(data.severe_toxic) * 100;
      threatProbability = parseFloat(data.threat) * 100;
      obsceneProbability = parseFloat(data.obscene) * 100;
        let sum = 0;
        let count = 0;
        let probabilities = [toxicProbability, identity_hateProbability, insultProbability, severe_toxicProbability, threatProbability, obsceneProbability];
        for (let probability of probabilities) {
            if (probability > 0 && probability <= 100) { 
                sum += probability;
                count++;
            }
        }
        const averageScore = count > 0 ? Math.floor(sum / count) : 0;
console.log("Average score:", averageScore);
      const historyItem = document.createElement("div");
      historyItem.classList.add("history-item");
      if (text === "") {
        historyItem.style.display = "none"; 
      }
  
      const buttonElement = document.createElement("button");
      buttonElement.textContent = text;
      buttonElement.classList.add("history-button");
  
      const averageLabel = document.createElement("span");
      averageLabel.textContent = " (Average: " + (isNaN(averageScore) ? 0 : averageScore.toFixed(2)) + ")";
      averageLabel.classList.add("average-label");
      averageLabel.style.color = "white"; 
      const clearButton = document.createElement("span");
      clearButton.textContent = "%  ✖️";
      clearButton.classList.add("clear-button");
      clearButton.addEventListener("click", function(event) {
        event.stopPropagation(); 
        historyItem.remove();
      });
  
      buttonElement.addEventListener("click", function() {
        document.getElementById("inputText").value = text;
      });
  
      historyItem.appendChild(buttonElement);
      historyItem.appendChild(averageLabel);
      historyItem.appendChild(clearButton);
  
      historyItems.appendChild(historyItem);
    })
    .catch(error => console.error('Error:', error));
  }
  
  function clearHistory() {
    const historyItems = document.getElementById("historyItems");
    historyItems.innerHTML = ""; 
  }
  
  addToHistory(""); 
  $(document).ready(function() {
    function toggleClearButtonVisibility() {
        var historyItems = $('#historyItems').children();
        if (historyItems.length > 0) {
            $('.clear-history-button').show(); 
        } else {
            $('.clear-history-button').hide(); 
        }
    }

    toggleClearButtonVisibility();

    $('.submit-button').click(function() {
        toggleClearButtonVisibility();
    });

    $('.clear-history-button').click(function() {
        $('#historyItems').empty(); 
        toggleClearButtonVisibility();
    });
});
function getUrlParameter(name) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(window.location.href);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// Check if the user is coming from the admin page
var fromAdmin = getUrlParameter('fromAdmin');
if (fromAdmin === 'true') {
    document.getElementById('goToAdminButton').style.display = 'block';
}

// Add event listener to the button
document.getElementById('goToAdminButton').addEventListener('click', function() {
    window.location.href = 'admin.html';
});
document.addEventListener('DOMContentLoaded', function() {
    const logoutButton = document.querySelector('.logout');

    logoutButton.addEventListener('click', function() {
        window.location.href = 'signin.html'; // Change this URL to the desired logout page
    });
});
