const csv = require('csv-parser');
const fs = require('fs');
const HttpError = require('../models/http-error');
const newmovies = require('../models/newmovies');
const Movie = require('../models/movie');
const User = require('../models/user');
const Overview = require('../models/credit');
const Overviewnew = require('../models/overview');
const Similarmovie = require('../models/similar_movies');
const tf = require('@tensorflow/tfjs');
var quantile = require('compute-quantile');
const Vector = require('vector-object');
const { title } = require('process');
// const { split, Syntax } = require("sentence-splitter");
// const { BertWordPieceTokenizer } = require("tokenizers");
var Tokenizer = require('sentence-tokenizer');
var tokenizer = new Tokenizer('Chuck');



const getMovies = async (req, res, next) => {
  // let sentences = split(`A man claiming to be Carol Brady's long-lost first husband, Roy Martin, shows up at the suburban Brady residence one evening. An impostor, the man is actually determined to steal the Bradys' familiar horse statue, a $20-million ancient Asian artifact.`);
  // console.log(sentences);
  // console.log(Syntax.sentences)


  let userData;
  let movies;
  let fmovies = [];
  let tfidfmovies = [];
  let genres = ["Trending Now"];
  try {
    userData = await User.find({ _id: req.userData.userId });
  } catch (err) {
    const error = new HttpError(
      'Fetching users failed, please try again later.',
      500
    );
    return next(error);
  }

  let lan = [];
  userData.map((e) => e.language.forEach(item => lan.push(new RegExp(item, "i"))));
  let genr = []
  userData.map((e) => e.genres.forEach(item => genr.push(new RegExp(item, "i"))));

  try {
    fmovies = await Promise.all(genr.map(async gen => {
      movies = await Movie.find({ genres: { $in: gen }, spoken_languages: { $in: lan } }).sort({ release_date: -1 }).sort({
        vote_average
          : -1
      }).limit(30);
      return movies;

    }));
    let movies1 = await Movie.find({}).sort({ release_date: -1 }).sort({ score: -1 }).limit(30);
    fmovies = [movies1].concat(fmovies)
    userData.map(e => {
      genres = genres.concat(e.genres)
    })


    // let vote_average = [];
    // let vote_count = [];
    // let allmovies = [];
    // let trending = await Movie.find({}, { "_id": 0, "vote_average": 1, "vote_count": 1 });
    // trending.map(e => {
    //   if (e.vote_average) {
    //     vote_average.push(+e.vote_average);
    //     vote_count.push(e.vote_count);
    //   }
    // })
    // let c = tf.tensor1d(vote_average);
    // let C = c.mean()
    // let C1 = C.arraySync()
    // var m = quantile(vote_count, 0.97);
    // allmovies = await Movie.find({});
    // allmovies.map(async am => {
    //   let v = +am.vote_count
    //   let R = +am.vote_average
    //   let m1 = +m;
    //   let c1 = +C1;
    //   let score = (v / (v + m1) * R) + (m1 / (m1 + v) * c1);
    //   am["score"] = score;
    //   const mov = await Movie.findOneAndUpdate({ _id: am._id }, { score: score })
    // })



    //======================USED CODE FOR TOKENIZATION, TFIDF,STOPWORDS========================//

    // let stopword = ['a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can\'t', 'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', ' in ', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours	ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves', 'a', 'able', 'about', 'above', 'abst', 'accordance', 'according', 'accordingly', 'across', 'act', 'actually', 'added', 'adj', 'affected', 'affecting', 'affects', 'after', 'afterwards', 'again', 'against', 'ah', 'all', 'almost', 'alone', 'along', 'already', 'also', 'although', 'always', 'am', 'among', 'amongst', 'an', 'and', 'announce', 'another', 'any', 'anybody', 'anyhow', 'anymore', 'anyone', 'anything', 'anyway', 'anyways', 'anywhere', 'apparently', 'approximately', 'are', 'aren', 'arent', 'arise', 'around', 'as', 'aside', 'ask', 'asking', 'at', 'auth', 'available', 'away', 'awfully', 'b', 'back', 'be', 'became', 'because', 'become', 'becomes', 'becoming', 'been', 'before', 'beforehand', 'begin', 'beginning', 'beginnings', 'begins', 'behind', 'being', 'believe', 'below', 'beside', 'besides', 'between', 'beyond', 'biol', 'both', 'brief', 'briefly', 'but', 'by', 'c', 'ca', 'came', 'can', 'cannot', 'can\'t', 'cause', 'causes', 'certain', 'certainly', 'co', 'com', 'come', 'comes', 'contain', 'containing', 'contains', 'could', 'couldnt', 'd', 'date', 'did', 'didn\'t', 'different', 'do', 'does', 'doesn\'t', 'doing', 'done', 'don\'t', 'down', 'downwards', 'due', 'during', 'e', 'each', 'ed', 'edu', 'effect', 'eg', 'eight', 'eighty', 'either', 'else', 'elsewhere', 'end', 'ending', 'enough', 'especially', 'et', 'et-al', 'etc', 'even', 'ever', 'every', 'everybody', 'everyone', 'everything', 'everywhere', 'ex', 'except', 'f', 'far', 'few', 'ff', 'fifth', 'first', 'five', 'fix', 'followed', 'following', 'follows', 'for', 'former', 'formerly', 'forth', 'found', 'four', 'from', 'further', 'furthermore', 'g', 'gave', 'get', 'gets', 'getting', 'give', 'given', 'gives', 'giving', 'go', 'goes', 'gone', 'got', 'gotten', 'h', 'had', 'happens', 'hardly', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'hed', 'hence', 'her', 'here', 'hereafter', 'hereby', 'herein', 'heres', 'hereupon', 'hers', 'herself', 'hes', 'hi', 'hid', 'him', 'himself', 'his', 'hither', 'home', 'how', 'howbeit', 'however', 'hundred', 'i', 'id', 'ie', 'if', 'i\'ll', 'im', 'immediate', 'immediately', 'importance', 'important', ' in ', 'inc', 'indeed', 'index', 'information', 'instead', 'into', 'invention', 'inward', 'is', 'isn\'t', 'it', 'itd', 'it\'ll', 'its', 'itself', 'i\'ve', 'j', 'just', 'k', 'keep	keeps', 'kept', 'kg', 'km', 'know', 'known', 'knows', 'l', 'largely', 'last', 'lately', 'later', 'latter', 'latterly', 'least', 'less', 'lest', 'let', 'lets', 'like', 'liked', 'likely', 'line', 'little', 'll', 'look', 'looking', 'looks', 'ltd', 'm', 'made', 'mainly', 'make', 'makes', 'many', 'may', 'maybe', 'me', 'mean', 'means', 'meantime', 'meanwhile', 'merely', 'mg', 'might', 'million', 'miss', 'ml', 'more', 'moreover', 'most', 'mostly', 'mr', 'mrs', 'much', 'mug', 'must', 'my', 'myself', 'n', 'na', 'name', 'namely', 'nay', 'nd', 'near', 'nearly', 'necessarily', 'necessary', 'need', 'needs', 'neither', 'never', 'nevertheless', 'new', 'next', 'nine', 'ninety', 'no', 'nobody', 'non', 'none', 'nonetheless', 'noone', 'nor', 'normally', 'nos', 'not', 'noted', 'nothing', 'now', 'nowhere', 'o', 'obtain', 'obtained', 'obviously', 'of', 'off', 'often', 'oh', 'ok', 'okay', 'old', 'omitted', 'on', 'once', 'one', 'ones', 'only', 'onto', 'or', 'ord', 'other', 'others', 'otherwise', 'ought', 'our', 'ours', 'ourselves', 'out', 'outside', 'over', 'overall', 'owing', 'own', 'p', 'page', 'pages', 'part', 'particular', 'particularly', 'past', 'per', 'perhaps', 'placed', 'please', 'plus', 'poorly', 'possible', 'possibly', 'potentially', 'pp', 'predominantly', 'present', 'previously', 'primarily', 'probably', 'promptly', 'proud', 'provides', 'put', 'q', 'que', 'quickly', 'quite', 'qv', 'r', 'ran', 'rather', 'rd', 're', 'readily', 'really', 'recent', 'recently', 'ref', 'refs', 'regarding', 'regardless', 'regards', 'related', 'relatively', 'research', 'respectively', 'resulted', 'resulting', 'results', 'right', 'run', 's', 'said', 'same', 'saw', 'say', 'saying', 'says', 'sec', 'section', 'see', 'seeing', 'seem', 'seemed', 'seeming', 'seems', 'seen', 'self', 'selves', 'sent', 'seven', 'several', 'shall', 'she', 'shed', 'she\'ll', 'shes', 'should', 'shouldn\'t', 'show', 'showed', 'shown', 'showns', 'shows', 'significant', 'significantly', 'similar', 'similarly', 'since', 'six', 'slightly', 'so', 'some', 'somebody', 'somehow', 'someone', 'somethan', 'something', 'sometime', 'sometimes', 'somewhat', 'somewhere', 'soon', 'sorry', 'specifically', 'specified', 'specify', 'specifying', 'still', 'stop', 'strongly', 'sub', 'substantially', 'successfully', 'such', 'sufficiently', 'suggest', 'sup', 'sure	t', 'take', 'taken', 'taking', 'tell', 'tends', 'th', 'than', 'thank', 'thanks', 'thanx', 'that', 'that\'ll', 'thats', 'that\'ve', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'thence', 'there', 'thereafter', 'thereby', 'thered', 'therefore', 'therein', 'there\'ll', 'thereof', 'therere', 'theres', 'thereto', 'thereupon', 'there\'ve', 'these', 'they', 'theyd', 'they\'ll', 'theyre', 'they\'ve', 'think', 'this', 'those', 'thou', 'though', 'thoughh', 'thousand', 'throug', 'through', 'throughout', 'thru', 'thus', 'til', 'tip', 'to', 'together', 'too', 'took', 'toward', 'towards', 'tried', 'tries', 'truly', 'try', 'trying', 'ts', 'twice', 'two', 'u', 'un', 'under', 'unfortunately', 'unless', 'unlike', 'unlikely', 'until', 'unto', 'up', 'upon', 'ups', 'us', 'use', 'used', 'useful', 'usefully', 'usefulness', 'uses', 'using', 'usually', 'a', 'about', 'above', 'across', 'after', 'afterwards', 'again', 'against', 'all', 'almost', 'alone', 'along', 'already', 'also', 'although', 'always', 'am', 'among', 'amongst', 'amoungst', 'amount', 'an', 'and', 'another', 'any', 'anyhow', 'anyone', 'anything', 'anyway', 'anywhere', 'are', 'around', ' as ', 'at', 'back', 'be', 'became', 'because', 'become', 'becomes', 'becoming', 'been', 'before', 'beforehand', 'behind', 'being', 'below', 'beside', 'besides', 'between', 'beyond', 'bill', 'both', 'bottom', 'but', 'by', 'call', 'can', 'cannot', 'cant', 'co', 'computer', 'con', 'could', 'couldnt', 'cry', 'de', 'describe', 'detail', 'do ', 'done', 'down', 'due', 'during', 'each', 'eg', 'eight', 'either', 'eleven', 'else ', 'elsewhere', 'empty', 'enough', 'etc', 'even', 'ever', 'every', 'everyone', 'everything', 'everywhere', 'except', 'few', 'fifteen', 'fify', 'fill', 'find', 'fire', 'first', 'five', 'for', 'former', 'formerly', 'forty', 'found', 'four', 'from', 'front', 'full', 'further', 'get', 'give', 'go', 'had', 'has', 'hasnt', 'have', 'he', 'hence', 'her', 'here', 'hereafter', 'hereby', 'herein', 'hereupon', 'hers', 'herse"', 'him', 'himse"', 'his', 'how', 'however', 'hundred', 'i', 'ie', 'if', ' in ', 'inc', 'indeed', 'interest', 'into', 'is', 'it', 'its', 'itse"', 'keep', 'last', 'latter', 'latterly', 'least', 'less', 'ltd', 'made', 'many', 'may', 'me', 'meanwhile', 'might', 'mill', 'mine', 'more', 'moreover', 'most', 'mostly', 'move', 'much', 'must', 'my', 'myse"', 'name', 'namely', 'neither', 'never', 'nevertheless', 'next', 'nine', 'no', 'nobody', 'none', 'noone', 'nor', 'not', 'nothing', 'now', 'nowhere', 'of', 'off', 'often', 'on', 'once', 'one', 'only', 'onto', 'or', 'other', 'others', 'otherwise', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'part', 'per', 'perhaps', 'please', 'put', 'rather', 're', 'same', 'see', 'seem', 'seemed', 'seeming', 'seems', 'serious', 'several', 'she', 'should', 'show', 'side', 'since', 'sincere', 'six', 'sixty', 'so', 'some', 'somehow', 'someone', 'something', 'sometime', 'sometimes', 'somewhere', 'still', 'such', 'system', 'take', 'ten', 'than', 'that', 'the', 'their', 'them', 'themselves', 'then', 'thence', 'there', 'thereafter', 'thereby', 'therefore', 'therein', 'thereupon', 'these', 'they', 'thick', 'thin', 'third', 'this', 'those', 'though', 'three', 'through', 'throughout', 'thru', 'thus', 'to', 'together', 'too', 'top', 'toward', 'towards', 'twelve', 'twenty', 'two', 'un', 'under', 'until', 'up', 'upon', 'us', 'very', 'via', 'was', 'we', 'well', 'were', 'what', 'whatever', 'when', 'whence', 'whenever', 'where', 'whereafter', 'whereas', 'whereby', 'wherein', 'whereupon', 'wherever', 'whether', 'which', 'while', 'whither', 'who', 'whoever', 'whole', 'whom', 'whose', 'why', 'will', 'with', 'within', 'without', 'would', 'yet', 'you', 'your', 'yours', 'yourself', 'yourselves', 'value', 'various', '\'ve', 'very', 'via', 'viz', 'vol', 'vols', 'vs', 'w', 'want', 'wants', 'was', 'wasnt', 'way', 'we', 'wed', 'welcome', 'we\'ll', 'went', 'were', 'werent', 'we\'ve', 'what', 'whatever', 'what\'ll', 'whats', 'when', 'whence', 'whenever', 'where', 'whereafter', 'whereas', 'whereby', 'wherein', 'wheres', 'whereupon', 'wherever', 'whether', 'which', 'while', 'whim', 'whither', 'who', 'whod', 'whoever', 'whole', 'who\'ll', 'whom', 'whomever', 'whos', 'whose', 'why', 'widely', 'willing', 'wish', 'with', 'within', 'without', 'wont', 'words', 'world', 'would', 'wouldnt', 'www', 'x', 'y', 'yes', 'yet', 'you', 'youd', 'you\'ll', 'your', 'youre', 'yours', 'yourself', 'yourselves', 'you\'ve', 'z', 'zero', 'able', 'about', 'above', 'abroad', 'according', 'accordingly', 'across', 'actually', 'adj', 'after', 'afterwards', 'again', 'against', 'ago', 'ahead', 'ain’t', 'all', 'allow', 'allows', 'almost', 'alone', 'along', 'alongside', 'already', 'also', 'although', 'always', 'am', 'amid', 'amidst', 'among', 'amongst', 'an', 'and', 'another', 'any', 'anybody', 'anyhow', 'anyone', 'anything', 'anyway', 'anyways', 'anywhere', 'apart', 'appear', 'appreciate', 'appropriate', 'are', 'aren’t', 'around', ' as ', 'a’s', 'aside', 'ask', 'asking', 'associated', 'at', 'available', 'away', 'awfully', 'b', 'back', 'backward', 'backwards', 'be', 'became', 'because', 'become', 'becomes', 'becoming', 'been', 'before', 'beforehand', 'begin', 'behind', 'being', 'believe', 'below', 'beside', 'besides', 'best', 'better', 'between', 'beyond', 'both', 'brief', 'but', 'by', 'c', 'came', 'can', 'cannot', 'cant', 'can’t', 'caption', 'cause', 'causes', 'certain', 'certainly', 'changes', 'clearly', 'c’mon', 'co', 'co.', 'com', 'come', 'comes', 'concerning', 'consequently', 'consider', 'considering', 'contain', 'containing', 'contains', 'corresponding', 'could', 'couldn’t', 'course', 'c’s', 'currently', 'd', 'dare', 'daren’t', 'definitely', 'described', 'despite', 'did', 'didn’t', 'different', 'directly', 'do ', 'does', 'doesn’t', 'doing', 'done', 'don’t', 'down', 'downwards', 'during', 'e', 'each', 'edu', 'eg', 'eight', 'eighty', 'either', 'else ', 'elsewhere', 'end', 'ending', 'enough', 'entirely', 'especially', 'et', 'etc', 'even', 'ever', 'evermore', 'every', 'everybody', 'everyone', 'everything', 'everywhere', 'ex', 'exactly', 'example', 'except', 'f', 'fairly', 'far', 'farther', 'few', 'fewer', 'fifth', 'first', 'five', 'followed', 'following', 'follows', 'for', 'forever', 'former', 'formerly', 'forth', 'forward', 'found', 'four', 'from', 'further', 'furthermore', 'g', 'get', 'gets', 'getting', 'given', 'gives', 'go', 'goes', 'going', 'gone', 'got', 'gotten', 'greetings', 'h', 'had', 'hadn’t', 'half', 'happens', 'hardly', 'has', 'hasn’t', 'have', 'haven’t', 'having', 'he', 'he’d', 'he’ll', 'hello', 'help', 'hence', 'her', 'here', 'hereafter', 'hereby', 'herein', 'here’s', 'hereupon', 'hers', 'herself', 'he’s', 'hi', 'him', 'himself', 'his', 'hither', 'hopefully', 'how', 'howbeit', 'however', 'hundred', 'i', 'i’d', 'ie', 'if', 'ignored', 'i’ll', 'i’m', 'immediate', ' in ', 'inasmuch', 'inc', 'inc.', 'indeed', 'indicate', 'indicated', 'indicates', 'inner', 'inside', 'insofar', 'instead', 'into', 'inward', 'is', 'isn’t', 'it', 'it’d', 'it’ll', 'its', 'it’s', 'itself', 'i’ve', 'just', 'keep', 'keeps', 'kept', 'know', 'known', 'knows', 'last', 'lately', 'later', 'latter', 'latterly', 'least', 'less', 'lest', 'let', 'let’s', 'like', 'liked', 'likely', 'likewise', 'little', 'look', 'looking', 'looks', 'low', 'lower', 'ltd', 'made', 'mainly', 'make', 'makes', 'many', 'may', 'maybe', 'mayn’t', 'me', 'mean', 'meantime', 'meanwhile', 'merely', 'might', 'mightn’t', 'mine', 'minus', 'miss', 'more', 'moreover', 'most', 'mostly', 'mr', 'mrs', 'much', 'must', 'mustn’t', 'my', 'myself', 'name', 'namely', 'nd', 'near', 'nearly', 'necessary', 'need', 'needn’t', 'needs', 'neither', 'never', 'neverf', 'neverless', 'nevertheless', 'new ', 'next', 'nine', 'ninety', 'no', 'nobody', 'non', 'none', 'nonetheless', 'noone', 'no - one', 'nor', 'normally', 'not', 'nothing', 'notwithstanding', 'novel', 'now', 'nowhere', 'obviously', 'of', 'off', 'often', 'oh', 'ok', 'okay', 'old', 'on', 'once', 'one', 'ones', 'one’s', 'only', 'onto', 'opposite', 'or', 'other', 'others', 'otherwise', 'ought', 'oughtn’t', 'our', 'ours', 'ourselves', 'out', 'outside', 'over', 'overall', 'own', 'particular', 'particularly', 'past', 'per', 'perhaps', 'placed', 'please', 'plus', 'possible', 'presumably', 'probably', 'provided', 'provides', 'que', 'quite', 'qv', 'rather', 'rd', 're', 'really', 'reasonably', 'recent', 'recently', 'regarding', 'regardless', 'regards', 'relatively', 'respectively', 'right', 'round', 's', 'said', 'same', 'saw', 'say', 'saying', 'says', 'second', 'secondly', 'see', 'seeing', 'seem', 'seemed', 'seeming', 'seems', 'seen', 'self', 'selves', 'sensible', 'sent', 'serious', 'seriously', 'seven', 'several', 'shall', 'shan’t', 'she', 'she’d', 'she’ll', 'she’s', 'should', 'shouldn’t', 'since', 'six', 'so', 'some', 'somebody', 'someday', 'somehow', 'someone', 'something', 'sometime', 'sometimes', 'somewhat', 'somewhere', 'soon', 'sorry', 'specified', 'specify', 'specifying', 'still', 'sub', 'such', 'sup', 'sure', 't', 'take', 'taken', 'taking', 'tell', 'tends', 'th', 'than', 'thank', 'thanks', 'thanx', 'that', 'that’ll', 'thats', 'that’s', 'that’ve', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'thence', 'there', 'thereafter', 'thereby', 'there’d', 'therefore', 'therein', 'there’ll', 'there’re', 'theres', 'there’s', 'thereupon', 'there’ve', 'these', 'they', 'they’d', 'they’ll', 'they’re', 'they’ve', 'thing', 'things', 'think', 'third', 'thirty', 'this', 'thorough', 'thoroughly', 'those', 'though', 'three', 'through', 'throughout', 'thru', 'thus', 'till', 'to', 'together', 'too', 'took', 'toward', 'towards', 'tried', 'tries', 'truly', 'try', 'trying', 't’s', 'twice', 'two', 'u', 'un', 'under', 'underneath', 'undoing', 'unfortunately', 'unless', 'unlike', 'unlikely', 'until', 'unto', 'up', 'upon', 'upwards', 'us', 'use', 'used', 'useful', 'uses', 'using', 'usually', 'v', '', 'value', 'various', 'versus', 'very', 'via', 'viz', 'vs', 'w', '', 'want', 'wants', 'was', 'wasn’t', 'way', 'we', 'we’d', 'welcome', 'well', 'we’ll', 'went', 'were', 'we’re', 'weren’t', 'we’ve', 'what', 'whatever', 'what’ll', 'what’s', 'what’ve', 'when', 'whence', 'whenever', 'where', 'whereafter', 'whereas', 'whereby', 'wherein', 'where’s', 'whereupon', 'wherever', 'whether', 'which', 'whichever', 'while', 'whilst', 'whither', 'who', 'who’d', 'whoever', 'whole', 'who’ll', 'whom', 'whomever', 'who’s', 'whose', 'why', 'will', 'willing', 'wish', 'with', 'within', 'without', 'wonder', 'won’t', 'would', 'wouldn’t', 'y', '', 'yes', 'yet', 'you', 'you’d', 'you’ll', 'your', 'you’re', 'yours', 'yourself', 'yourselves', 'you’ve', 'z', 'zero', 'female', 'male', 'in'];
    // let un = [...new Set(stopword)];

    // tfidfmovies = await Movie.find({}, { "overview": 1 }).lean();
    // tfidfmovies = tfidfmovies.filter(p => p.overview != null)
    // console.log(tfidfmovies[0]);
    // // console.log(tokenizer.getSentences());

    // let punctuation = [',', '.', ')', '(', '[', ']', '{', '}', ':', ';', '\\', '/', '`', '!', '?', '<', '>', '|', '"', "'", "*", "+", "=", "_", "@", "#", "$", "%", "^", "&", "~"]
    // // var tf = []
    // var crossdoctermcount = {}
    // var tfidf = []
    // let c = 0
    // tfidfmovies.map(Overview => {
    //   console.log(c);
    //   c = c + 1
    //   tokenizer.setEntry(Overview.overview);
    //   paratosen = []
    //   tokenizer.getSentences().map(sentence => paratosen = paratosen + " " + sentence)
    //   paratosen = [paratosen]
    //   tokenized_words = paratosen.map(sentence => {
    //     if (Overview.overview.trim() == "") {
    //       return null
    //     }
    //     sentence.replace(',', '')
    //     let temp = sentence.split(" ")
    //     let lowercased = temp.map(name => name.toLowerCase());
    //     words = []
    //     lowercased.map(t => words = words.concat(t))
    //     lowercased = lowercased.map(word => {
    //       temp_string = ""
    //       for (let i in word) {
    //         if (!punctuation.includes(word[i])) {
    //           temp_string += word[i]
    //         }
    //       }
    //       return temp_string
    //     })

    //     lowercased = lowercased.filter(word => {
    //       let isnum = /^\d+$/.test(word);
    //       if (!un.includes(word) && word != "" && word != "," && !isnum && word != "-") {
    //         return word
    //       }
    //     })
    //     var termcount = {};
    //     lowercased.forEach(async t => {
    //       if (!termcount[t]) {
    //         termcount[t] = 1;
    //       }
    //       else {
    //         termcount[t] += 1;
    //       }
    //       if (!crossdoctermcount[t]) {
    //         crossdoctermcount[t] = 1;
    //       }
    //       else {
    //         crossdoctermcount[t] += 1;
    //       }
    //     })
    //     Object.keys(termcount).forEach(tm => {
    //       termcount[tm] = termcount[tm] / (lowercased.length)
    //     })
    //     // tf.push(termcount)
    //     tfidfvector_new = { id: Overview._id, tfidfvector: termcount }
    //     tfidf.push(tfidfvector_new)
    //     // return lowercased
    //   })
    // })
    // // console.log("efef", tokenized_words);
    // console.log(tfidf);
    // Object.keys(crossdoctermcount).forEach(tm => {
    //   crossdoctermcount[tm] = Math.log((tfidfmovies.length) / crossdoctermcount[tm])
    // })
    // tfidf.map(t => {
    //   word = t.tfidfvector
    //   Object.keys(word).forEach(term => {
    //     word[term] = word[term] * crossdoctermcount[term]
    //   })
    // })
    // res.json({ tfidf: tfidf });
    // console.log(tfidf);


    //=====NOT USED CODE OF TOKENIZATION, TFIDF CALC

    // tfidfmovies.forEach(t => {
    //   console.log(t.overview.indexOf(" "));
    //   console.log(tfidfmovies.indexOf(t))
    // })
    // console.log(tfidfmovies[113]);
    // // await tfidfmovies.map(e => {
    // //   let str = e.overview;
    // //   let res1 = []
    // //   let words = str.split(' ')
    // //   for (i = 0; i < words.length; i++) {
    // //     let word_clean = words[i].split(".").join("")
    // //     let wor = word_clean.replace(",", "")
    // //     if (!un.includes(wor.toLowerCase())) {
    // //       res1.push(word_clean)
    // //     }
    // //   }
    // //   str = res1.join(' ')
    // //   e.overview = str;
    // // })
    // // let tfidfvector = []
    // // let c = 0;
    // // tfidfmovies.forEach(async t => {
    // //   var words1 = t.overview.replace(/[.]/g, '').split(/\s/);
    // //   var termfreqMap = {};
    // //   words1.forEach(function (w) {
    // //     if (!termfreqMap[w]) {
    // //       termfreqMap[w] = 0;
    // //     }
    // //     termfreqMap[w] += 1;
    // //   });
    // //   let docsWithTerm = { ...termfreqMap }
    // //   let termidf = { ...termfreqMap };
    // //   let tfidf = { ...termidf }
    // //   Object.keys(termfreqMap).map(term => {
    // //     let docsTerm = 0
    // //     tfidfmovies.map(dct => {
    // //       if (dct.overview.includes(term)) {
    // //         docsTerm++;
    // //       }
    // //     })
    // //     docsWithTerm[term] = docsTerm
    // //     termidf[term] = Math.log((tfidfmovies.length) / docsTerm);
    // //     tfidf[term] = termidf[term] * docsWithTerm[term]
    // //   })
    // //   const documentVector = {
    // //     id: t._id,
    // //     tfidfvector: new Vector(tfidf)
    // //   };
    // //   tfidfvector.push(documentVector)
    // //   c++;
    // //   console.log(c, documentVector);
    // // })
    // console.log(tfidfvector);

    //======END OF NOT USED CODE


    //==================== Final code for finding Similar Movies=====================//

    // let docVectors = await Overviewnew.find({})

    // number of results that you want to return.
    const MAX_SIMILAR = 30;
    // min cosine similarity score that should be returned.
    const MIN_SCORE = 0;


    // let similar_movies = {}
    // leng = docVectors.length
    // for (let i = 0; i < leng; i = i + 1) {
    //   const data = {};
    //   const idi = docVectors[i].id;
    //   const vi = new Vector(docVectors[i].tfidfvector);
    //   data[idi] = [];
    //   for (let j = 0; j < leng; j = j + 1) {
    //     const idj = docVectors[j].id;
    //     const vj = new Vector(docVectors[j].tfidfvector);
    //     const similarity = vi.getCosineSimilarity(vj);
    //     if (similarity > MIN_SCORE) {
    //       data[idi].push({ id: idj, score: similarity });
    //       // data[idj].push({ id: idi, score: similarity });
    //     }
    //   }
    //   console.log(c++);
    //   similar_movies[idi] = []
    //   data[idi].sort((a, b) => b.score - a.score);

    //   if (data[idi].length > MAX_SIMILAR) {
    //     data[idi] = data[idi].slice(0, MAX_SIMILAR);
    //   }
    //   data[idi].map(simid => {
    //     similar_movies[idi].push(simid.id);
    //   })
    // }
    // res.json({ similar: similar_movies });



    let w = []
    userData.map(us1 => w = us1.movies)
    // console.log(w);
    let t = w.map(async h => {
      let watched = await Movie.find({ _id: h })
      let title = "Because you watched " + watched[0].title
      return title
    })
    let t1 = await Promise.all(t)
    // console.log(t1);
    let getsimilarmovieid = await Promise.all(w.map(async h => {
      // console.log(h);
      let similarmovie = await Similarmovie.find({ movie_id: h })
      // getsimilarmovieid = await getsimilarmovieid.concat(similarmovie)
      return similarmovie[0]
    }))
    let similarrecommendation = getsimilarmovieid.map(async sm => {
      // console.log(sm.movie_id);
      recommendation = await Movie.find({ _id: { $in: sm.similar } })
      // recommendation = await Movie.find({ _id: { $in: sm.similar } })
      return recommendation
    })
    let t4 = await Promise.all(similarrecommendation)
    genres = [...genres, ...t1]
    fmovies = [...fmovies, ...t4]

    res.json({ user: req.userData.userId, genres: genres, movies: fmovies });

    // let t = Object.keys(similar_movies).map(async h => {
    //   let watched = await Movie.find({ _id: h })
    //   let title = "Because you watched " + watched[0].title
    //   return title
    // })
    // let t1 = await Promise.all(t)
    // let t2 = Object.keys(similar_movies).map(async h => {
    //   let similar = await Movie.find({ _id: { $in: similar_movies[h] } })
    //   return similar
    // })
    // let t3 = await Promise.all(t2)
    // console.log(t3);
    // genres = [...genres, ...t1]
    // fmovies = [...fmovies, ...t3]

  } catch (err) {
    console.log(err);
    const error = new HttpError(
      'Fetching movies failed, please try again later.',
      500
    );
    return next(error);
  }

};

const getMovieById = async (req, res, next) => {
  const movieId = req.params.id; // { pid: 'p1' }
  console.log(movieId);
  try {
    movie = await Movie.findById(movieId);
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      'Something went wrong, could not find a place.',
      500
    );
    return next(error);
  }

  res.json({ movie: movie }); // => { place } => { place: place }
};

const watch = async (req, res, next) => {
  const movieId = req.params.id;
  try {
    console.log(movieId);
    userData = await User.find({ _id: req.userData.userId });
    if (!userData[0].movies.includes(movieId)) {
      if (userData[0].movies.length == 4) {
        let arr = userData[0].movies.slice(1)
        arr.push(movieId)
        userData = await User.findByIdAndUpdate(req.userData.userId, { movies: arr });
      }
      else {
        let arr = userData[0].movies
        arr.push(movieId)
        userData = await User.findByIdAndUpdate(req.userData.userId, { movies: arr });
      }
    }
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      'Some error occured, try again later.',
      500
    );
    return next(error);
  }
  res.json({ data: movieId });
}

exports.getMovies = getMovies;
exports.getMovieById = getMovieById;
exports.watch = watch;


