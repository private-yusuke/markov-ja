const MeCab = require('mecab-node')
/**
 * @class MarkovJa
 * @classdesc マルコフ連鎖を日本語で行うためのクラスです。
 * @prop {MeCab} mecab MeCab のインスタンスです。
 * @prop {Object} rootTriplet 単語の接続の羅列。
 */
class MarkovJa {
  static get BEGIN() {
    return '__BEGINNING_OF_SENTENCE__'
  }
  static get END() {
    return '__END_OF_SENTENCE__'
  }
  /**
   * 日本語用マルコフ連鎖のクラスのコンストラクタです。
   */
  constructor() {
    this.mecab = new MeCab()
    this.rootTriplet = {}
  }

  /**
   * 与えられたデータベースを読み込みます。
   * @param {object} data データベース。
   */
  loadDatabase(data) {
    try {
      this.rootTriplet = JSON.parse(data)
    } catch (e) {
      this.rootTriplet = {}
    }
  }
  /**
   * 分かち書き(形態素解析)を行います。
   * @param {string} text 形態素解析をするテキスト(multi-line allowed)
   * @returns {Array<Array<string>>} 一行ずつ分かち書きをしたテキスト(Array)を配列に格納したもの
   */
  morphplogicalAnalysis(text) {
    return this.mecab.wakachiSync(text.trim())
  }
  /**
   * 学習を行います。
   * @param {string} str 学習させるテキスト(multi-line allowed)
   */
  learn(str) {
    this.makeTriplet(this.morphplogicalAnalysis(str))
  }
  /**
   * 分かち書きをしたテキストを用いて rootTriplet を更新します。
   * @param {Array<Array<string>>} arr 分かち書きをしたテキスト(result of morphplogicalAnalysis)
   */
  makeTriplet(arr) {
    for (let array of arr) {
      if (array.length < 3) continue
      for (var i = 0; i < array.length - 2; i++) {
        let triplet = array.slice(i, i + 3)
        if (!this.rootTriplet[triplet]) this.rootTriplet[triplet] = 1
        else this.rootTriplet[triplet]++
      }
      var triplet = [MarkovJa.BEGIN, array[0], array[1]]
      if (!this.rootTriplet[triplet])
        this.rootTriplet[triplet] = 1
      else this.rootTriplet[triplet] += 1

      triplet = [array[array.length - 2], array[array.length - 1], MarkovJa.END]
      if (!this.rootTriplet[triplet])
        this.rootTriplet[triplet] = 1
      else this.rootTriplet[triplet] += 1
    }
  }
  /**
   * データベースをエクスポートします。
   */
  exportDatabase() {
    return JSON.stringify(this.rootTriplet)
  }
  /**
   * マルコフ連鎖で文章を生成します。
   * @param {number} n 生成する文の数(非負整数に限る)
   */
  generate(n = 5) {
    var generatedLines = []
    for (var i = 0; i < n; i++) {
      let text = this.generateSentence()
      generatedLines.push(text)
    }
    return generatedLines
  }
  /**
   * マルコフ連鎖で文を生成します。
   */
  generateSentence() {
    var morphemes = []
    let firstTriplet = this.getFirstTriplet()
    morphemes.push(firstTriplet[1])
    morphemes.push(firstTriplet[2])

    while (morphemes[morphemes.length - 1] !== MarkovJa.END) {
      let prefix1 = morphemes[morphemes.length - 2]
      let prefix2 = morphemes[morphemes.length - 1]
      let triplet = this.getTriplet(prefix1, prefix2)
      morphemes.push(triplet[2])
    }
    let result = morphemes.slice(0, morphemes.length - 1).join('')
    return result
  }
  /**
   * 次に繋がる文章の要素を取得します。
   * @param {string} prefix1 単語
   * @param {string} prefix2 prefix1の次に繋がる単語
   */
  getTriplet(prefix1, prefix2) {
    let prefixes = [prefix1, prefix2]
    let chains = this.getChainFromDB(prefixes)
    let tmp = this.getProbableTriplet(chains)
    if (!tmp) return [null, null, MarkovJa.END]
    let triplet = Object.keys(tmp)[0].split(',')
    return [triplet[0], triplet[1], triplet[2]]
  }
  /**
   * 引数の単語にうまく接続できる単語の羅列をデータベースから取得します。
   * @param {Array<string>} prefixes それぞれがこの順に繋がる単語の列
   */
  getChainFromDB(prefixes) {
    let res = []
    if (prefixes.length === 1) {
      for (let kelem of Object.keys(this.rootTriplet)) {
        if (kelem.split(',')[0] === prefixes[0]) {
          res.push({ [kelem]: this.rootTriplet[kelem] })
        }
      }
    } else if (prefixes.length === 2) {
      for (let kelem of Object.keys(this.rootTriplet)) {
        let spl = kelem.split(',')
        if (spl[0] === prefixes[0] && spl[1] === prefixes[1]) {
          res.push({ [kelem]: this.rootTriplet[kelem] })
        }
      }
    }
    return res
  }
  /**
   * 与えられたチェーン(単語の繋がりの配列)から、確率的に一つだけ単語の繋がりを抽出します。
   * このとき、各要素が選ばれる確率は、学習データで頻度が高く出たものがより高いです。
   * @param {Array<string>} chains 各要素の先頭が全て同じ単語であり、続く要素は繋がっている単語。
   */
  getProbableTriplet(chains) {
    let probability = []
    var iter = chains.entries()
    for (let elem of iter) {
      for (var j = 0; j < Object.values(elem[1])[0]; j++) {
        probability.push(elem[0])
      }
    }
    let chainIndex = probability[Math.floor(Math.random() * probability.length)]
    return chains[chainIndex]
  }
  /**
   * 文頭にふさわしい単語の繋がりをランダムに抽出します。(see getProbableTriplet)
   */
  getFirstTriplet() {
    let prefixes = [MarkovJa.BEGIN]
    let chains = this.getChainFromDB(prefixes)
    let triplet = this.getProbableTriplet(chains)
    if (!triplet) return [null, null, MarkovJa.END]
    let triplets = Object.keys(triplet)[0].split(',')
    let res = [triplets[0], triplets[1], triplets[2]]
    return res
  }

  /**
   * 与えられた文章に含まれる形態素を含むようなチェーンを削除します。
   * @param {string} str 消す形態素を含む文章
   */
  removeTriplets(str) {
    let sentences = this.morphplogicalAnalysis(str)
    sentences.forEach(sentence => {
      sentence.forEach(morpheme => {
        if (!morpheme) return
        for (let kelem of Object.keys(this.rootTriplet)) {
          let spl = kelem.split(',')
          if (spl.indexOf(morpheme) >= 0) {
            delete this.rootTriplet[kelem]
          }
        }
      })
    });
  }
}

module.exports = MarkovJa
