/**
 Jasmine Reporter that outputs test results to the browser console.
 Useful for running in a headless environment such as PhantomJs, ZombieJs etc.

 Usage:
 // From your html file that loads jasmine:
 jasmine.getEnv().addReporter(new jasmine.ConsoleReporter());
 jasmine.getEnv().execute();
 */

(function (jasmine, console) {
    if (!jasmine) {
        throw "jasmine library isn't loaded!";
    }

    var ANSI = {}
    ANSI.color_map = {
        "green": 32,
        "red": 31
    }

    ANSI.colorize_text = function (text, color) {
        var color_code = this.color_map[color];
        return "\033[" + color_code + "m" + text + "\033[0m";
    }

    var ConsoleReporter = function () {
        if (!console || !console.log) {
            throw "console isn't present!";
        }
        this.status = this.statuses.stopped;
    };

    var proto = ConsoleReporter.prototype;
    proto.statuses = {
        stopped: "stopped",
        running: "running",
        fail: "fail",
        success: "success"
    };

    proto.reportRunnerStarting = function (runner) {
        this.status = this.statuses.running;
        this.start_time = (new Date()).getTime();
        this.executed_specs = 0;
        this.passed_specs = 0;
        this.skipped_specs = 0;
        this.logs = [];
        // initialize results for suite
        this.results = [];
        this.log("Starting...");
    };

    proto.reportRunnerResults = function (runner) {
        // all 'skipped' tests are also 'passed'
        var failed = this.executed_specs - (this.passed_specs - this.skipped_specs);
        var spec_str = this.executed_specs;
        var fail_str = failed + (failed === 1 ? " failure,  " : " failures, ");
        var skip_str = this.skipped_specs + " skipped ";
        var color = (failed > 0) ? "red" : "green";
        var dur = (new Date()).getTime() - this.start_time;

        var ms = Math.floor(dur % 1000);
        var seconds = Math.floor((dur / 1000) % 60);
        var time = seconds + "." + ms;

        this.log("");
        this.log("Finished");
        this.log("-----------------");
        this.log("Tests run: " +
            this.executed_specs +
            ", Failures: " +
            failed +
            ", Skipped: " +
            this.skipped_specs +
            " in " +
            time +
            " sec"
            );
//        this.log(spec_str + fail_str + skip_str + " in " + (dur / 1000) + " sec", color);

        this.status = (failed > 0) ? this.statuses.fail : this.statuses.success;

        /* Print something that signals that testing is over so that headless browsers
         like PhantomJs know when to terminate. */
        this.log("");
    };


    proto.reportSpecStarting = function (spec) {
        this.executed_specs++;
        spec.start_time = (new Date()).getTime();
    };

    proto.reportSpecResults = function (spec) {
        if (spec.results().passed()) {
            this.passed_specs++;
        }
        // output template
        var resultText = spec.description + "(" + spec.suite.description + ")";

        if (spec.results().skipped) {
            this.skipped_specs++;
            spec.total = 0; // no time
            resultText += "  **SKIPPED**";
            this.results.push({
                output: resultText
            });
            return;
        }

        spec.total = Math.floor((new Date()).getTime() - spec.start_time);
        var ms = Math.floor(spec.total % 1000);
        var seconds = Math.floor((spec.total / 1000) % 60);
        var time = seconds + "." + ms + " sec";


        resultText +=  " Time elapsed: " + time;
        if (spec.results().passed()) {
            this.results.push({
                output: resultText,
                color: 'green'
            });
            return;
        }

        resultText += "  <<< FAILURE!";

        this.results.push({
            output: resultText,
            color: 'red'
        });

        var items = spec.results().getItems();
        for (var i = 0; i < items.length; i++) {
            var trace = items[i].trace.stack || items[i].trace;
            // TODO: can we strip out certain parts of the stack trace? specifically any test-libs
            this.results.push({
                output: trace,
                color: 'red'
            });
        }
    };

    proto.reportSuiteResults = function (suite) {
//        if (!suite.parentSuite) { return; }
        var results = suite.results();
        var failed = results.totalCount - results.passedCount;
        var color = (failed > 0) ? "red" : "green";
//        Tests run: 1, Failures: 1, Errors: 0, Skipped: 0, Time elapsed: 0.05 sec <<< FAILURE!
//        test(com.electriccloud.deploy.domain.ArtifactCommandTest)  Time elapsed: 0.011 sec  <<< FAILURE!

        suite.total = 0;
        var skipped = 0;
        for (var i = 0; i < suite.specs().length; i++) {
            var spec = suite.specs()[i];
            suite.total += spec.total;
            if (spec.results().skipped) {
                skipped++;
            }
        }
        var ms = Math.floor(suite.total % 1000);
        var seconds = Math.floor((suite.total / 1000) % 60);
        var time = seconds + "." + ms + " sec";
        // TODO: skipped? error? time elapse?
        this.log("Tests run: " + results.totalCount + ", Failures: " + failed +
            ", Skipped: " + skipped +
            "  Time elapsed: " +
            time + (failed > 0 ? " <<< FAILURE!" : ""), color);
        for (i = 0; i < this.results.length; i++) {
            var result = this.results[i];
            this.log(result.output, result.color);
        }
        // reset results for future suites
        this.results = [];
    };

    proto.log = function (str, color) {
        var text = (color !== undefined) ? ANSI.colorize_text(str, color) : str;
        this.logs.push(text);
        console.log(text);
    };

    proto.getLogsAsString = function () {
        return this.logs.join("\n");
    };

    jasmine.ConsoleReporter = ConsoleReporter;
})(jasmine, console);
