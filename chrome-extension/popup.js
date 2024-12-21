document.addEventListener('DOMContentLoaded', function() {
  const statusDiv = document.getElementById('status');
  const connectBtn = document.getElementById('connectBtn');

  // Check connection status
  chrome.runtime.sendMessage({ type: 'CHECK_CONNECTION' }, (response) => {
    if (response.connected) {
      statusDiv.textContent = 'Connected to native host';
      statusDiv.className = 'status connected';
    } else {
      statusDiv.textContent = 'Not connected to native host';
      statusDiv.className = 'status disconnected';
    }
  });

  // Handle connect button click
  connectBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'CONNECT_HOST' }, (response) => {
      if (response.success) {
        statusDiv.textContent = 'Connected to native host';
        statusDiv.className = 'status connected';
      } else {
        statusDiv.textContent = `Failed to connect: ${response.error}`;
        statusDiv.className = 'status disconnected';
      }
    });
  });
});