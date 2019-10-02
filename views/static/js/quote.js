$(document).ready(function() {
    // Select the save and trigger it with click function
    $("#quote-save-button").click(function(e) {
        // 1. Prevent from submitting
        e.preventDefault();

        var saveBtn = $(this);
        var action = $(this).data("formaction"); // returns formAction value

        // 2. put it inside form
        saveBtn.parent("form").attr("action", action);

        // 3. Submit it using the new action
        saveBtn.parent("form").submit();
    });

    // Select the save and trigger it with click function
    $("#quote-send-button").click(function(e) {
        // 1. Prevent from submitting
        e.preventDefault();

        var sendBtn = $(this);
        var action = $(this).data("formaction"); // returns formAction value

        // 2. put it inside form
        sendBtn.parent("form").attr("action", action);

        // 3. Submit it using the new action
        sendBtn.parent("form").submit();
    });
});