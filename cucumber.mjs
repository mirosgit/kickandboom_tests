const parallel = Number(process.env.CUCUMBER_PARALLEL ?? (process.env.CI === 'true' ? '4' : '1'));

export default {
  paths: ['features/**/*.feature'],
  requireModule: ['ts-node/register'],
  require: ['src/bdd/**/*.ts'],
  format: [
    'progress',
    'html:test-results/cucumber-report.html',
    'json:test-results/cucumber-report.json'
  ],
  parallel,
  publishQuiet: true
};
