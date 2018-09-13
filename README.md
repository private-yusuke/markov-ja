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

// Maybe you want to load the database from file…?
const path = 'triplets_db.json'
markov.loadDatabase(fs.readFileSync(path, 'utf-8'))

var text = fs.readFileSync('in.txt', 'utf-8')
markov.learn(text)

// Now your original texts are generated with the power of markov chain
console.log(markov.generate().join('\n'))

// Maybe you want to save the database to file…?
fs.writeFileSync(path, markov.exportDatabase(), 'utf-8')
```

```javascript
// You can change the options for mecab command
markov.mecab.execOptions = '-d /usr/local/lib/mecab/dic/mecab-ipadic-neologd/'
```

```javascript
markov.DB_PATH = '/path/to/database.json'
```