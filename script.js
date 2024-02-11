let currentWords = [];
let wrongWords = [];
let correctWords =[];
let canDownload = true;
let savedWrongWords = [];
let previousWords = []; 
let currentAnswer = [];
let currentWord = [];
let totalWords = 0; // 全体の単語数
let currentIndex = 0; // 現在の単語のインデックス
let savedcorrectWords = [];
let unknownWords = [];
let allWords = [];

document.getElementById('excelFileInput').addEventListener('change', async function(e){
  let mergedWordList = [];
  
  var files = e.target.files;
  
  for (var i = 0; i < files.length; i++) {
      var reader = new FileReader();
      await new Promise((resolve, reject) => {
          reader.readAsArrayBuffer(files[i]);

          reader.onload = function(e) {
              var data = new Uint8Array(reader.result);
              var workbook = XLSX.read(data, {type: 'array'});

              var sheetName = workbook.SheetNames[0];
              var worksheet = workbook.Sheets[sheetName];

              var wordList = XLSX.utils.sheet_to_json(worksheet);

              mergedWordList = mergedWordList.concat(wordList);
              resolve();
          };

          reader.onerror = function(e) {
              console.error("Reading file failed:", e);
              reject(e);
          };
      });
  }
  
  if (mergedWordList.length > 0) {
      startTest(mergedWordList);
  } else {
      console.warn("No valid data found in the selected files.");
  }
});

window.onload = function() {
  document.getElementById('answerButton').style.visibility = 'visible';
  document.getElementById('decisionButtons').style.visibility = 'hidden';
};
document.addEventListener('DOMContentLoaded', (event) => {
  window.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') {
          if (answerButton.style.visibility === 'visible') {
              showAnswer();
          } else {
              incorrect();
          }
      }
      if (event.key === 'ArrowLeft') {
          // ここで 'ArrowRight' の条件をチェックする必要はありません。
          if (answerButton.style.visibility === 'visible') {
              showAnswer();
          } else {
              correct();
          }
      }
      if (event.key === 'ArrowUp') {
         goBack();
      }
  });
});
document.addEventListener('DOMContentLoaded', (event) => {
  // カード要素を取得
  let card = document.getElementById('card');

  // カードの幅を取得
  let cardWidth = card.offsetWidth;

  // カードにクリックイベントリスナーを追加
  card.addEventListener('click', function(event) {
      // クリック位置を取得
      let clickPosition = event.clientX - card.getBoundingClientRect().left;

      // クリック位置がカードの左側ならcorrect()を、右側ならincorrect()を実行
      if (clickPosition < cardWidth / 2) {
          if (answerButton.style.visibility === 'visible') {
              showAnswer();
          } else {
              correct();
          }
      } else {
          if (answerButton.style.visibility === 'visible') {
              showAnswer();
          } else {
              incorrect();
          }
      }
  });
});


// この関数を新しく追加
function startTest(wordList) {
  canDownload = true;  //
  console.log(wordList)
  currentWords = wordList.map(item => ({word: item.word, answer: item.answer}));
  totalWords = currentWords.length; // 全体の単語数を設定
  currentIndex = 1; // 現在の単語のインデックスをリセットshuffleWords(); // 単語をシャッフル]
  shuffleWords(); // 単語をシャッフル
  showWord(); // 最初の単語を表示
}

// 単語をシャッフルする関数
function shuffleWords() {
  currentWords.sort(() => Math.random() - 0.5);
  showWord();
}

// 正解ボタンが押されたとき
function correct() {
  toggleButtons(true);
  previousWords.push(JSON.parse(JSON.stringify(currentWords[0]))); // 正解とされた単語をpreviousWordsに追加
  allWords.push(currentWords[0]);
  correctWords.push(currentWords.shift()); 
  currentIndex++; // currentIndexを更新
  showWord(); 
}

// 間違いボタンが押されたとき
function incorrect() {
  toggleButtons(true);
  allWords.push(currentWords[0]);
  wrongWords.push(currentWords.shift());
  console.log(wrongWords)
  currentIndex++; // currentIndexを更新
  showWord();
}

function restart() {
  console.log(wrongWords)
  savedWrongWords = wrongWords.slice(); // 
  savedcorrectWords = correctWords.slice();
  currentWords = wrongWords.slice(); // 間違えた単語をコピー
  wrongWords = []; // 間違えた単語リストをリセット
  correctWords = [];
  totalWords = currentWords.length; // 全体の単語数を設定
  currentIndex = 1; // 現在の単語のインデックスをリセットshuffleWords(); // 単語をシャッフル
  showWord(); // 最初の単語を表示
}

function showWord() {
  if (currentWords.length === 0) {
      if (wrongWords.length > 0) {

          testCompleted();
          restart();  // 間違えた単語を再表示
      } else {
          alert('単語テストが終了しました。すべて正解です！');
      }
      return;
  }
  console.log(correctWords)

  // 答えの部分を空白にする
  document.getElementById("answerDisplay").innerText =  currentIndex + "/" + totalWords;
  // 以下、単語表示の通常の処理
     document.getElementById("wordDisplay").style.fontSize = "84px";
     document.getElementById("wordDisplay").innerText =  currentWords[0].word;
     document.getElementById("answerDisplay").style.fontSize = "50px";
}
function showAnswer() {
  document.getElementById("answerDisplay").innerText = currentWords[0].answer;
  document.getElementById("wordDisplay").style.fontSize = "50px";
  document.getElementById("answerDisplay").style.fontSize = "70px";
  toggleButtons();
}

// 一つ前の単語に戻る関数
function goBack() {
  // 一つ前の単語が存在するかチェック
  if (previousWords.length === 0) {
      alert("これが最初の単語です。");
      return;
  }

  // 最後の要素（現在表示されている要素）を削除
  correctWords.pop();

  // 一つ前の単語を取得
  const prev = previousWords.pop();

  // 一つ前の単語を現在の単語として設定
  currentWords.unshift(prev); // 一つ前の単語をcurrentWordsに追加
  currentIndex--; // currentIndexを更新
  // 単語を再表示
  showWord();
}

// ボタンにイベントリスナーを追加

function testCompleted() {
  if (canDownload) {
  // ダウンロードボタンを表示
      document.getElementById("downloadButton").style.display = "block";  // フラグをfalseに設定
      document.getElementById("showcardButton").style.display = "block";  // フラグをfalseに設定
  }
  // メッセージ表示
  alert('単語テストが一通り終わりました。間違えた単語を再表示します');

}
// ボタンがクリックされたらExcelファイルを出力
document.addEventListener('DOMContentLoaded', (event) => {
  document.getElementById('goBackButton').addEventListener('click', goBack);
  document.getElementById("downloadButton").addEventListener("click", function() {
      console.log("Button clicked!");
      exportToExcel();
  });
});

function exportToExcel() {
  if(savedWrongWords.length === 0 && savedcorrectWords.length === 0) {
      alert("間違った単語も正解した単語もありません。");
      return;
  }

  var new_workbook = XLSX.utils.book_new();
  if(savedWrongWords.length !== 0) {
      var wrongWorksheet = XLSX.utils.json_to_sheet(savedWrongWords);
      XLSX.utils.book_append_sheet(new_workbook, wrongWorksheet, "Wrong Words");
  }
  if(savedcorrectWords.length !== 0) {
      var correctWorksheet = XLSX.utils.json_to_sheet(savedcorrectWords);
      XLSX.utils.book_append_sheet(new_workbook, correctWorksheet, "Correct Words");
  }
  
  // ここでExcelファイルとして出力
  XLSX.writeFile(new_workbook, 'Words.xlsx');
  console.log(canDownload);
}


// ボタンの表示を切り替える関数
function toggleButtons() {
  const answerButton = document.getElementById('answerButton');
  const decisionButtons = document.getElementById('decisionButtons');

  if (answerButton.style.visibility === 'visible') {
      answerButton.style.visibility = 'hidden';
      decisionButtons.style.visibility = 'visible';
  
  } else {
      answerButton.style.visibility = 'visible';
      decisionButtons.style.visibility = 'hidden';
      
  }
}
function showcard(){
  cardContainer.innerHTML = '';  // Clear the container
  displayWrongCards(savedWrongWords,'#ff9090');
  displayCards(savedcorrectWords,'#81a9ff');
  document.getElementById("showcardButton").style.display = "none";  
}






function displayWrongCards(wordList, bgColor) {
  const cardContainer = document.getElementById('cardContainer');
  let autoPlayInterval;
  let autoPlaying = false;
  let cardIndex = 0; // カードのインデックスを変数にする

  // 自動再生ボタンのtextContentを変更する関数を定義する
  const changeAutoPlayButtonText = () => {
    // 全てのカードのautoPlayButtonを取得する
    const autoPlayButtons = document.querySelectorAll(".autoPlayButton");
    // autoPlayButtonのtextContentをautoPlayingの値に応じて変更する
    if (autoPlaying) {
      autoPlayButtons.forEach(button => {
        button.textContent = "■";
      });
    } else {
      autoPlayButtons.forEach(button => {
        button.textContent = "▶";
      });
    }
  };

  // 自動再生ボタンのclickイベントリスナーを定義する
  const autoPlayButtonClickHandler = (e) => { 
    // イベントの伝播を止める
    e.stopPropagation();
    // autoPlayingの値を反転させる
    autoPlaying = !autoPlaying;
    // autoPlayButtonのtextContentを変更する
    changeAutoPlayButtonText();
    // autoPlayingの値に応じて自動再生を開始または停止する
    if (autoPlaying) {
      // 自動再生を開始する
      // クリックされた要素を取得する
      const clickedElement = e.target;
      // クリックされた要素のid属性からカードの番号を取得する
      const cardNumber = clickedElement.id.replace("button", "");
      // カードの番号をautoPlay関数に渡して自動再生を開始する
      autoPlay(cardNumber);
    } else {
      // 自動再生を停止する
      clearTimeout(autoPlayInterval);
    }
  };

  // 自動再生の処理をする関数を定義する
  const autoPlay = (cardIndex) => { 
    const nextCard = document.getElementById('card' + cardIndex);
    if (nextCard) {
      const cardHeight = nextCard.offsetHeight;
      const viewportHeight = window.innerHeight;
      const scrollPosition = nextCard.offsetTop - (viewportHeight - cardHeight) / 2;
      window.scrollTo({top: scrollPosition, behavior: "smooth"});
      cardIndex++; 
      autoPlayInterval = setTimeout(() => {
        autoPlay(cardIndex); 
      }, 3000);
    } else {
      autoPlaying = false;
      changeAutoPlayButtonText();
    }
  };

  wordList.forEach((item, index) => {
    const card1 = document.createElement('div');
    card1.className = 'card1';
    card1.style.backgroundColor = bgColor;  // Set the background color

    const container = document.createElement('div');
    container.className = 'container1';

    const wordDisplay = document.createElement('div');
    wordDisplay.id = 'wordDisplay1';
    wordDisplay.textContent = item.word === undefined ? '' : item.word;

    const answerDisplay = document.createElement('div');
    answerDisplay.id = 'answerDisplay1';
    answerDisplay.textContent = item.answer;

    container.appendChild(wordDisplay);
    container.appendChild(answerDisplay);
    card1.appendChild(container);
    cardContainer.appendChild(card1);

    // カードにIDを追加
    card1.id = 'card' + index;

    // 自動再生ボタンを作成
    const autoPlayButton = document.createElement('button');
    // autoPlayButtonにクラス名を追加
    autoPlayButton.className = "autoPlayButton";
    // autoPlayButtonのtextContentを初期化する
    changeAutoPlayButtonText();
    // ボタンのpositionをabsoluteに変更する
    autoPlayButton.style.position = 'absolute';  // ボタンをカードの右端に固定する
    // ボタンのrightを0にする
    autoPlayButton.style.right = '0';  // ボタンをカードの右端に移動する
    autoPlayButton.style.bottom = '0';
    autoPlayButton.style.backgroundColor = 'transparent';  // 透明な灰色に設定
    // autoPlayButtonにclickイベントリスナーを登録する
    autoPlayButton.addEventListener('click', autoPlayButtonClickHandler);
    card1.appendChild(autoPlayButton);  // ボタンをカードに追加
    autoPlayButton.id= "button"+ index;
    // カードにクリックイベントを追加
    card1.addEventListener('click', (e) => {
      const clickedY = e.clientY;
      const cardRect = card1.getBoundingClientRect();
      const cardHeight = cardRect.height;
      const viewportHeight = window.innerHeight;

      // 自動再生を停止する処理を追加
      if (autoPlaying) {
        // autoPlayingの値をfalseにする
        autoPlaying = false;
        // setTimeoutをキャンセルする
        clearTimeout(autoPlayInterval);
        // ボタンのテキストを▶に変更する
        changeAutoPlayButtonText();
      } else {
        console.log(index);
        if (clickedY - cardRect.top < cardHeight / 2) {
          // カードの上半分がクリックされた場合
          const previousCardIndex = index - 1;
          if (previousCardIndex >= 0) {
            const previousCard = document.getElementById('card' + previousCardIndex);
            const scrollPosition = previousCard.offsetTop - (viewportHeight - cardHeight) / 2;
            window.scrollTo({top: scrollPosition, behavior: "smooth"});
          }
        } else {
          // カードの下半分がクリックされた場合
          const nextCardIndex = index + 1;
          if (nextCardIndex < wordList.length) {
            const nextCard = document.getElementById('card' + nextCardIndex);
            const scrollPosition = nextCard.offsetTop - (viewportHeight - cardHeight) / 2;
            window.scrollTo({top: scrollPosition, behavior: "smooth"});
          }
        }
      }
    });
  });
}

// カードを表示する関数
function displayCards(wordList, bgColor) {
  const cardContainer = document.getElementById('cardContainer');
  wordList.forEach((item,index) => {
    const card1 = document.createElement('div');
    card1.className = 'card1';
    card1.style.backgroundColor = bgColor;  // Set the background color

    const container = document.createElement('div');
    container.className = 'container1';

    const wordDisplay = document.createElement('div');
    wordDisplay.id = 'wordDisplay1';
    wordDisplay.textContent = item.word === undefined ? '' : item.word;

    const answerDisplay = document.createElement('div');
    answerDisplay.id = 'answerDisplay1';
    answerDisplay.textContent = item.answer;
    // カードにIDを追加
    card1.id = 'card' + index;
    container.appendChild(wordDisplay);
    container.appendChild(answerDisplay);
    card1.appendChild(container);
    cardContainer.appendChild(card1);
    // カードにクリックイベントを追加
    card1.addEventListener('click', (e) => {

      const clickedY = e.clientY;
      const cardRect = card1.getBoundingClientRect();
      const cardHeight = cardRect.height;
      const viewportHeight = window.innerHeight;
      if (clickedY - cardRect.top < cardHeight / 2) {
        // カードの上半分がクリックされた場合
        const previousCardIndex = index - 1;
        if (previousCardIndex >= 0) {
          const previousCard = document.getElementById('card' + previousCardIndex);
          const scrollPosition = previousCard.offsetTop - (viewportHeight - cardHeight) / 2;
          window.scrollTo({top: scrollPosition, behavior: "smooth"});
        }
      } else {
        // カードの下半分がクリックされた場合
        const nextCardIndex = index + 1;
        if (nextCardIndex < wordList.length) {
          const nextCard = document.getElementById('card' + nextCardIndex);
          const scrollPosition = nextCard.offsetTop - (viewportHeight - cardHeight) / 2;
          window.scrollTo({top: scrollPosition, behavior: "smooth"});
        }
      }
    });

  });
}
