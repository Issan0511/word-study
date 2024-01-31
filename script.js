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

// カードを表示する関数
function displayCards(wordList) {
  const cardContainer = document.getElementById('cardContainer');
  cardContainer.innerHTML = '';  // Clear the container
  wordList.forEach((item) => {
    const card1 = document.createElement('div');
    card1.className = 'card1';

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
  });
}
