const MarkovJa = require('./index.js')
const fs = require('fs')

if (process.argv.length <= 2) {
  console.log('Usage: <command> <sentence_file.txt>')
  process.exit(1)
}

const path = 'triplets_db.json'
const markov = new MarkovJa()
const text = fs.readFileSync(process.argv[2], 'utf-8')
markov.loadDatabase(fs.readFileSync(path, 'utf-8'))
markov.learn(text)
console.log(markov.generate(10).join('\n') + '\n')
markov.removeTriplets('吉野家諸刃の剣、。１５０円ギョク何がよーしお前')
console.log(markov.generate(10).join('\n'))
fs.writeFileSync(path, markov.exportDatabase(), 'utf-8')
