const reporter = require('cucumber-html-reporter');
const fs = require('fs');
const path = require('path');

const jsonPath = path.resolve(__dirname, '..', 'reports', 'cucumber.json');
const outDir = path.resolve(__dirname, '..', 'reports');
const outFile = path.join(outDir, 'cucumber-report.html');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
if (!fs.existsSync(jsonPath)) {
  console.error('No cucumber json report found at', jsonPath);
  process.exit(1);
}

const options = {
  theme: 'bootstrap',
  jsonFile: jsonPath,
  output: outFile,
  reportSuiteAsScenarios: true,
  launchReport: false,
  metadata: {
    "App Version": "1.0.0",
    "Test Environment": process.env.NODE_ENV || 'local',
    "Browser": 'N/A',
    "Platform": process.platform,
    "Parallel": "false"
  }
};

reporter.generate(options);
console.log('HTML report generated at', outFile);
