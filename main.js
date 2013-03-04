/*global phantom */

/**
 * Wait until the test condition is true or a timeout occurs. Useful for waiting
 * on a server response or for a ui change (fadeIn, etc.) to occur.
 *
 * @param testFx javascript condition that evaluates to a boolean,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param onReady what to do when testFx condition is fulfilled,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param timeOutMillis the max amount of time to wait. If not specified, 3 sec is used.
 */
function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3001, //< Default Max Timeout is 3s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 100); //< repeat check every 100ms
};

var PhantomJasmineRunner, address, page, runner;

PhantomJasmineRunner = (function() {

    function PhantomJasmineRunner(page, exit_func) {
        this.page = page;
        this.exit_func = exit_func !== null ? exit_func : phantom.exit;
        this.tries = 0;
        this.max_tries = 10;
    }

    PhantomJasmineRunner.prototype.get_status = function() {
        return this.page.evaluate(function() {
            return window.consoleReporter.status;
        });
    };

    PhantomJasmineRunner.prototype.is_done = function() {
        switch (this.get_status()) {
            case "success":
            case "fail":
                return true;
            default:
                return false;
        }
    };

    PhantomJasmineRunner.prototype.terminate = function() {
        switch (this.get_status()) {
            case "success":
                return this.exit_func(0);
            case "fail":
                return this.exit_func(1);
            default:
                return this.exit_func(2);
        }
    };

    return PhantomJasmineRunner;

})();

if (phantom.args.length === 0) {
    console.log("Need a url as the argument");
    phantom.exit(1);
}

page = require('webpage').create();

runner = new PhantomJasmineRunner(page, phantom.exit);

// route 'console.log' calls from with the page to the main Phantom context
page.onConsoleMessage = function(msg) {
    console.log(msg);
};

address = phantom.args[0];

page.open(address, function(status) {
    if (status !== "success") {
        console.log("can't load the address: " + address);
        return phantom.exit(1);
    }
    else {
        waitFor(function() {
            return runner.is_done();
        }, function() {
            return runner.terminate();
        });
        // wait for jasmine to be done
    }
});
