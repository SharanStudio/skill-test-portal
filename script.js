let userEmail = "";
let timerInterval = null;
let testStartTime = null;

// Initialize on page load
window.addEventListener("load", function() {
  document.getElementById("loading-status").innerHTML = "Ready to begin. Please enter your email above.";
  document.getElementById("loading-status").classList.remove("error");
  document.getElementById("loading-status").classList.add("success");
  document.getElementById("start-button-container").style.display = "block";
});

// Convert email to Firebase-safe format
function encodeEmailForFirebase(email) {
  return email.toLowerCase().trim().replace(/@/g, "_").replace(/\./g, "_");
}

// Validate and start test
function validateAndStartTest() {
  const emailInput = document.getElementById("email-input").value;
  
  if (!emailInput || !emailInput.includes("@")) {
    document.getElementById("loading-status").innerHTML = "Please enter a valid email address.";
    document.getElementById("loading-status").classList.add("error");
    document.getElementById("loading-status").classList.remove("success");
    return;
  }
  
  userEmail = emailInput;
  const encodedEmail = encodeEmailForFirebase(userEmail);
  
  document.getElementById("loading-status").innerHTML = "Verifying your authorization, please wait...";
  document.getElementById("loading-status").classList.remove("error", "success");
  
  // Check if email exists in Firebase
  db.ref("allowedEmails/" + encodedEmail).once("value", function(snapshot) {
    if (snapshot.exists()) {
      // Email is authorized
      document.getElementById("loading-status").innerHTML = "✓ Access granted! Starting test...";
      document.getElementById("loading-status").classList.add("success");
      
      setTimeout(function() {
        startTest();
      }, 1000);
    } else {
      // Email is not authorized
      document.getElementById("loading-status").innerHTML = "✗ Access denied. Your email (" + userEmail + ") is not authorized to take this test.";
      document.getElementById("loading-status").classList.add("error");
      document.getElementById("loading-status").classList.remove("success");
    }
  });
}

// Start the test
function startTest() {
  testStartTime = new Date();
  
  // Log entry to Firebase
  const encodedEmail = encodeEmailForFirebase(userEmail);
  const logEntry = {
    email: userEmail,
    startTime: firebase.database.ServerValue.TIMESTAMP,
    endTime: null,
    duration: null
  };
  
  db.ref("logs/" + encodedEmail + "_" + Date.now()).set(logEntry);
  
  // Switch UI
  document.getElementById("login").style.display = "none";
  document.getElementById("test").style.display = "block";
  
  // Start timer
  startTimer(60);
}

// Timer function
function startTimer(minutes) {
  let timeRemaining = minutes * 60; // Convert to seconds
  
  const timer = setInterval(function() {
    let m = Math.floor(timeRemaining / 60);
    let s = timeRemaining % 60;
    
    document.getElementById("timer").innerText = 
      m + ":" + (s < 10 ? "0" + s : s);
    
    if (--timeRemaining < 0) {
      clearInterval(timer);
      alert("Time is up! Your test session has ended. Please submit if you haven't already.");
      logExit();
    }
  }, 1000);
}

// Submit and exit
function submitExit() {
  logExit();
  alert("Your test session has been recorded. Thank you for taking the test!");
  document.body.innerHTML = "<div style='text-align:center; margin-top:100px;'><h2>✓ Test Complete</h2><p>Your responses have been recorded. You may now close this page.</p></div>";
}

// Log exit to Firebase
function logExit() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  
  const encodedEmail = encodeEmailForFirebase(userEmail);
  const testEndTime = new Date();
  const durationMs = testEndTime - testStartTime;
  const durationMins = (durationMs / 60000).toFixed(2);
  
  // Update the log entry with end time and duration
  // Note: In a real app, you'd update the specific entry created during startTest
  // For simplicity, we'll create a separate exit log
  const exitLog = {
    email: userEmail,
    action: "test_completed",
    completionTime: firebase.database.ServerValue.TIMESTAMP,
    durationMinutes: durationMins
  };
  
  db.ref("logs/" + encodedEmail + "_exit_" + Date.now()).set(exitLog);
}

// Allow Enter key to start test
document.addEventListener("keypress", function(event) {
  if (event.key === "Enter" && document.getElementById("start-button-container").style.display !== "none") {
    validateAndStartTest();
  }
});
