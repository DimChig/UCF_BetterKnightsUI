$(document).ready(function() {
    // Get the toggle switch element
    const $toggleSwitch = $('#toggleExtension');

    // Load the toggle state from Chrome storage and update the UI
    chrome.storage.sync.get('extensionEnabled', function(data) {
        $toggleSwitch.prop('checked', data.extensionEnabled || false); // Set the initial state of the checkbox
    });

    // Event listener for when the toggle is clicked
    $toggleSwitch.on('change', function() {
        const isEnabled = $toggleSwitch.is(':checked'); // Check if it's enabled

        // Save the new state to Chrome storage
        chrome.storage.sync.set({
            extensionEnabled: isEnabled
        });

        // Send message to background script to enable/disable the extension
        chrome.runtime.sendMessage({
            extensionEnabled: isEnabled
        }, function(response) {
            console.log("Background script response:", response);
        });
    });
});