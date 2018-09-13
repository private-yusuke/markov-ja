# markov-ja

## Requirements

You need to install MeCab before using this package.

## How to use

```
$ npm install -S markov-ja
```

Try this:

```javascript
const MarkovJa = require('markov-ja')

var markov = new MarkovJa()

var text = fs.readFileSync('in.txt', 'utf-8')
markov.makeTriplet(markov.morphplogicalAnalysis(text))

// Now your original texts are generated with the power of markov chain
console.log(markov.generate().join('\n'))
```

```javascript
// You can change the options for mecab command
markov.mecab.execOptions = '-d /usr/local/lib/mecab/dic/mecab-ipadic-neologd/'
```

```javascript
markov.DB_PATH = '/path/to/database.json'
```