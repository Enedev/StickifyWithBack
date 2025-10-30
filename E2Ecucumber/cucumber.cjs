module.exports = {
  default: "--require-module ts-node/register --require ./steps/**/*.ts --require ./support/**/*.ts --format json:reports/cucumber.json --format progress --publish-quiet"
};
