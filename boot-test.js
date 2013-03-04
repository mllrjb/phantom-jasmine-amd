/*global jasmine */

require({
    baseUrl: 'js',
    paths: {
        'spec': '../test/spec',
        'data': '../test/data',
        'TestRunner': '../test/runner',
        'util': '../test/util'
    }
},[
    // Pull in all your modules containing unit tests here.
    'domReady',
    'TestRunner'
], function(domReady, TestRunner) {
    domReady(function() {
        var runner = new TestRunner();
//        runner.start();
//        TODO: what is going on??? shouldn't have to do this. It's only necessary in dev, the optimized script
        // doesn't have this problem
        setTimeout(runner.start, 1000);
    });
});

