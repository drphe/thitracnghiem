// Khởi tạo
var keyQuestion = [];
var countdownInterval;
resetAll();
const options = Object.entries(CONFIG.data).map(([key, value]) => `<option value="${key}">${value}</option>`);
const select = document.getElementById("mySelect");
select.innerHTML = options.join("");

// nhấn ESC
document.addEventListener("keyup", function(e) {
    if (27 === e.keyCode) {
        e.preventDefault();
	resetAll();
    }
})

// kiểm tra nút bấm
const btnStart = document.getElementById("btn-test");
btnStart.addEventListener("click", () => {
	const selectedOption = select.options[select.selectedIndex];
	const value = selectedOption.value;
    showPopup(DATA[value], CONFIG.data[value])
});


////////////////Phần tạo popup câu hỏi, chấm thi
// Tạo popup
function showPopup(source, name) {
    const loai = document.querySelector('input[type="radio"][name="radio-group"]:checked').value;
    let quiz = document.getElementById("mainquiz");
    quiz.innerHTML = '';
    let popuptitle = ''
    let chamthi ='';
    if (loai == 2 || loai == 3) {
	chamthi = `  <button type="button" class="btn2 checkA">
    <span>&times; Chấm thi</span>
  </button>`;
	popuptitle = ` - Thi thử môn ${name}: ${CONFIG.numberquestion} câu`;
	counter();
    }else {
        addAnswerStyle();
	let count = 0;
	for (const key in source) {
	  count++;
	}
	popuptitle = ` - Ôn tập môn ${name}: ${count} câu`;
    }
    document.getElementById("title").innerHTML += popuptitle;
    let popup = document.createElement("div");
    popup.classList.add("popup");
    popup.innerHTML = `	<div class="popup_content">    
<h1>Bài thi trắc nghiệm</h1>
${cTest(source, loai)}
</div>
  `;
    quiz.appendChild(popup);
  
    popup.innerHTML += `
  <div class="popup_footer">${chamthi}
  <button type="button" class="btn2 close">
    <span>&times; Đóng</span>
  </button>
</div>
`;

    var answers = {};

    document.addEventListener("click", (event) => {
        if (event.target.tagName === "INPUT" && event.target.type === "radio" && event.target.id) {
            const answer = event.target.value;
            const key = event.target.name.split("-")[1];
            let mainquiz = document.getElementById("mainquiz");
            let button = mainquiz.querySelectorAll('.btn-' + key);
            button.forEach(btn => {
                btn.classList.remove('correct');
                btn.classList.remove('wrong');
            });
            let answerQ = "A";
            if (answer == 2) answerQ = "B"
            else if (answer == 3) answerQ = "C"
            else if (answer == 4) answerQ = "D"
            else if (answer == 5) answerQ = "E"
            let btntext = mainquiz.querySelector('.' + event.target.id)
            let keytext = mainquiz.querySelector('.key-' + key);
            if (answerQ == source[key].A) {
                btntext.classList.add('correct');
                keytext.innerHTML = "Đáp án Đúng!"
            } else {
                btntext.classList.add('wrong');
                keytext.innerHTML = "Đáp án bạn chọn không đúng, đáp án đúng là " + source[key].A;
            }

            let t = JSON.parse(localStorage.getItem(CONFIG.localStorageID));
            let answers = null === t ? [] : t;
            let index = -1
            try {
                index = answers.findIndex(s => s.q === key)
            } catch (e) {}
            if (index === -1) {
                answers.push({
                    q: key,
                    a: answerQ,
                    s: answerQ == source[key].A ? 1 : 0
                })
            } else {
                answers[index].a = answerQ
                answers[index].s = answerQ == source[key].A ? 1 : 0
            }
            localStorage.setItem(CONFIG.localStorageID, JSON.stringify(answers));
            //console.log(answers);
        }
    });
    popup.querySelector(".close").addEventListener("click", () => {
        popup.remove();// đóng
	resetAll();
    });
    popup.querySelector(".checkA").addEventListener("click", () => {
        checkAnswer();// chấm thi
	for (const radio of mainquiz.querySelectorAll("input[type='radio']")) radio.disabled = true;
    });
}

//tạo bài test
function cTest(data, loai = 1) {
    let temp = "";
    let key = Object.keys(data);
    if (loai == 1) { // tất cả
        keyQuestion = key;
        key.forEach(s => {
            temp += cQuestion(s, data[s]);
        })
    } else if (loai == 2) { // ngẫu nhiên
        const rand = getRandomSubarray(key, CONFIG.numberquestion);
        let i = 1;
        keyQuestion = rand;
        rand.forEach(s => {
            temp += cQuestion(s, data[s], i);
            i++;
        })
    } else {
        alert("Mời chọn bộ câu hỏi")
    }
    return temp;

}
// tạo câu hỏi
function cQuestion(key, data, index = 0) {
    function inputhtml(i){
    return data.hasOwnProperty(i) ? `<input type="radio" name = "btn-${key}" class="btn" id="btn-${key}-${i}" value="${i}"/><span class="btn-${key} btn-${key}-${i}">${data[i]}</span> <br/>`: "";
    }
    for(var input="",j=1;j<6;j++)input+=inputhtml(j);
    return `<form>
	<h2 id="${key}">Câu hỏi ${index? index: key}: ${data.Q}</h2>
      ${input}<div class="answer key-${key}"></div>
	</form>`
}
// tạo bộ đề ngẫu nhiên
function getRandomSubarray(arr, size) {
    var shuffled = arr.slice(0);
    var i = arr.length;
    var temp, index;
    while (i--) {
        index = Math.floor(Math.random() * (i + 1));
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(0, size);
}
// bộ đếm giờ
function counter() {
    let divclock = document.getElementById("clock-container");
    let countdownTime = CONFIG.timer * 60;
    countdownInterval = setInterval(function() {
        // Calculate minutes and seconds
        let minutes = Math.floor(countdownTime / 60);
        let seconds = countdownTime % 60;

        // Display the countdown
        divclock.innerHTML = `<img src="./src/clock.jpg" style="height:20px; width:20px;"/> ${minutes}:${seconds.toString().padStart(2, '0')}`;

        // Check if the countdown has reached zero
        if (countdownTime === 0) {
            clearInterval(countdownInterval);
            checkAnswer();
        } else {
            // Decrease the countdown time
            countdownTime--;
        }
    }, 1000); // Update every second
};

// chấm thi
function checkAnswer() {
    addAnswerStyle();
    let t = JSON.parse(localStorage.getItem(CONFIG.localStorageID));
    let answers = null === t ? [] : t;
    let total = answers.length // tổng câu hỏi
    const sum = answers.reduce((acc, item) => {
        return acc + item.s;
    }, 0); // tổng điểm
    result(sum+'/'+total);
}

// hiển thị kết quả chấm bài
function result(x) {
    let div = document.createElement("div");
    div.setAttribute("style", "max-width: 60%; min-width: 150px; padding: 0px 14px;  color: rgb(255, 255, 255); line-height: 40px; text-align: center; border-radius: 4px; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 999999; background: rgba(0, 0, 0, 0.7); font-size: 16px; transition: transform 0.5s ease-in 0s, opacity 0.5s ease-in 0s; opacity: 1;");
    div.innerHTML = ` Điểm số của bạn là: ${x} <br/>
  <button type="button" class="btn2 close-result">
    <span>&times; Đóng</span>
  </button>`;
    document.body.appendChild(div);
    div.querySelector(".close-result").addEventListener("click", () => {
        div.remove();
    });
}
// reset
function resetAll(){
	localStorage.setItem(CONFIG.localStorageID, JSON.stringify([]));
	document.getElementById("title").innerHTML = " Hệ thống ôn thi trắc nghiệm";
        document.getElementById("mainquiz").innerHTML = ""
        document.getElementById("clock-container").innerHTML = "";
        document.getElementById("option").innerHTML = "";
        clearInterval(countdownInterval);
}
// thêm style câu trả lời
function addAnswerStyle() {
    document.getElementById("option").innerHTML = `
.answer {
display:block!important;
color: green;
}
.wrong {
color: red;
}
.correct {
color: blue;
}`;
}