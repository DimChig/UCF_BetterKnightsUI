$(document).ready(function() {
    // Get the toggle switch element
    const $toggleSwitch = $('#toggleExtension');

    // Load the toggle state from Chrome storage and update the UI
    chrome.storage.sync.get('extensionEnabled', function(data) {
        let _extensionEnabled = data.extensionEnabled !== undefined ? data.extensionEnabled : true;
        $toggleSwitch.prop('checked', _extensionEnabled); // Set the initial state of the checkbox
    });

    // Event listener for when the toggle is clicked
    $toggleSwitch.on('change', function() {
        const isEnabled = $toggleSwitch.is(':checked'); // Check if it's enabled

        // Save the new state to Chrome storage
        chrome.storage.sync.set({
            extensionEnabled: isEnabled
        });

        // change text of "#toggleExtensionLabel" to either "Extension enabled" or "Extension disabled"
        $('#toggleExtensionLabel').text(isEnabled ? "Extension Enabled" : "Extension Disabled");

        // Send message to background script to enable/disable the extension
        chrome.runtime.sendMessage({
            extensionEnabled: isEnabled
        }, function(response) {
            console.log("Background script response:", response);
        });
    });
});