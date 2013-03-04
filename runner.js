/*global jasmine, window */

define([
    'spec/CommanderSettingsPresenter.spec',
    'spec/CommanderSettingsModel.spec',
    'spec/Deploy.FormWidget.spec',
    'spec/ApplicationListModel.spec',
    'spec/ApplicationListPresenter.spec',
    'spec/ApplicationModel.spec',
    'spec/LoadAwareModel.spec',
    'spec/DirtyAwareModel.spec',
    'spec/ApplicationContentPresenter.spec',
    'spec/Injector.spec'
], function () {
    "use strict";

    var runner = function () {
        var htmlReporter, consoleReporter;

        window.htmlReporter = htmlReporter = new jasmine.TrivialReporter();
        // window.htmlReporter = htmlReporter = new jasmine.HtmlReporter()
        window.consoleReporter = consoleReporter = new jasmine.ConsoleReporter();
        jasmine.getEnv().addReporter(htmlReporter);
        jasmine.getEnv().addReporter(consoleReporter);

        jasmine.getEnv().specFilter = function (spec) {
            return htmlReporter.specFilter(spec);
        };
    };

    runner.prototype.start = function () {
        jasmine.getEnv().execute();
    };

    return runner;
});
