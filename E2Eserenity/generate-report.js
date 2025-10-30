const reporter = require('cucumber-html-reporter');

reporter.generate({
  theme: 'bootstrap',
  jsonFile: 'reports/report.json',
  output: 'reports/report.html',
  reportSuiteAsScenarios: true,
  scenarioTimestamp: true,
  launchReport: true,
  name: 'Stickify Test Execution Report',
  brandTitle: 'Stickify E2E Test Report',
  metadata: {
    "Project": "SerenityJS E2E",
    "Browser": "API Tests",
    "Platform": process.platform,
    "Executed": "Local",
    "Environment": "Development"
  }
});