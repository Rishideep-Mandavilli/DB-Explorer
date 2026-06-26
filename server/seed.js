const sqlite = require('./engines/sqlite');
const level = require('./engines/level');
const graph = require('./engines/graph');
const timeseries = require('./engines/timeseries');
const vector = require('./engines/vector');
const mongodb = require('./engines/mongodb');

console.log('Seeding databases...');

console.log('SQLite:', sqlite.reset());
console.log('SQLite seed:', sqlite.seed());

console.log('LevelDB:', level.reset());
console.log('LevelDB seed:', level.seed());

console.log('Graph:', graph.reset());
console.log('Graph seed:', graph.seed());

console.log('TimeSeries:', timeseries.reset());
console.log('TimeSeries seed:', timeseries.seed());

console.log('Vector:', vector.reset());
console.log('Vector seed:', vector.seed());

console.log('MongoDB:', mongodb.reset());
console.log('MongoDB seed:', mongodb.seed());

console.log('All databases seeded!');
