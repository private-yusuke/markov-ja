const MarkovJa = require('./index.js')
const fs = require('fs')

if(process.argv.length <= 2) {
  console.log('Usage: <command> <sentence_file.txt>')
  return
}

var markov = new MarkovJa()
// markov.mecab.execOptions = '-d /usr/local/lib/mecab/dic/mecab-ipadic-neologd/'
var text = fs.readFileSync(process.argv[2], 'utf-8')
markov.makeTriplet(markov.morphplogicalAnalysis(text))
console.log(markov.generate(10).join('\n'))
markov.save()
