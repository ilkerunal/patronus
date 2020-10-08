/** 
 * @author Julius Alphonso
 * This script is based off poc/script.js
 * It communicates with the UI in firefox/popup to get the keywords
*/

(function() {
    /**
     * Check and set a global guard variable
     * This prevents the script from executing twice on the same page
     */
    if (window.hasRun) {
        return;
    }
    window.hasRun = true;

    /**
     * This will be populated with data received from the popup
     */
    let keywords = [];
    let interval = 3000;
    let iconURL = "";
    let intervalId = null;

    /**
     * @function notify
     * Wrapper method that creates a new notification object or requests permissions
     * to do so if it's disabled. Throws an error if the browser doesn't support extensions
     * This is the example script found on MDN
     */
    function notify(notifBody) {
        // Let's check if the browser supports notifications
        if (!("Notification" in window)) {
            alert("This browser does not support desktop notification");
        }
    
        // Let's check whether notification permissions have already been granted
        else if (Notification.permission === "granted") {
            // If it's okay let's create a notification
            var notification = new Notification("Patronus", {body: notifBody, icon: iconURL});
        }
    
        // Otherwise, we need to ask the user for permission
        else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(function (permission) {
            // If the user accepts, let's create a notification
            if (permission === "granted") {
                var notification = new Notification("Patronus", {body: notifBody});
            }
            });
        }
    
        // At last, if the user has denied notifications, and you 
        // want to be respectful there is no need to bother them any more.
    }
    /**
     * @function analyseVoice
     * When called, this function scans through the current state of the subtitles
     * and fires a notification if any of the words match those mentioned in the
     * keywords array
     */
    function analyseVoice() {
        subClassName = "CNusmb";
        for( sub of document.getElementsByClassName(subClassName) ) {
            for( word of sub.innerHTML.split(' ') ) {
                if( keywords.includes(word.toLowerCase()) ){
                    notify(word);
                }
            }
        }
    }

    // notify("I'll notify you now")
    // itervalId = setInterval(analyseVoice, interval)

    browser.runtime.onMessage.addListener((message) => {
        if( message.command === "keywords" ) {
            keywords = [];
            for( word of message.keywords ) {
                keywords.push(word)
            }
            if( keywords.length >0 ) {
                notify("I will notify you if any of the following are said: " + String(keywords))
            } else {
                notify("You didn't give me any keywords. I won't be notifying you")
            }
        }
        else if( message.command === "interval" ) {
            interval = message.interval
            notify("I will check for keywords every " + interval + "ms")
        }
        else if( message.command === "stop" ) {
            if (intervalId != null)
                clearInterval(intervalId)
            notify("I will stop notifying you now. I hope I served you well")
        }
        else if( message.command === "start" ) {
            if (intervalId != null)
                clearInterval(intervalId)
            intervalId = setInterval(analyseVoice, interval);
            iconURL = message.iconURL;
            notify("Expecto Patronum")
        }
    })
})();