(async () => {
    // ---Khởi tạo
    const CONFIG = {
        localStorageID: "answer",
        timer: 30, // thời gian bài thi
        numberquestion: 30, // số câu hỏi trong bài test
        numberquestiontest: 50, // số câu hỏi trong bài thi
    };
    var countdownInterval;
    const optionData = {},
        DATA = {};
    await chrome.storage.local.get(['data']).then((item) => {
        Object.assign(DATA, item.data);
        console.log(DATA);
    });
    await resetAll();

    //---- thao tác nguồn dữ liệu
    // lấy danh sách nguồn
    for (const key in DATA) optionData[key] = DATA[key].name;
    const optionsource = Object.entries(optionData).map(([key, value]) => `<option value="${key}">${key}</option>`);
    const selectsource = document.getElementById("selectsource");
    const select = document.getElementById("mySelect");
    selectsource.innerHTML = optionsource.join("");
    getModule();

    // lấy ds module
    function getModule() {
        const selectedOption = selectsource.options[selectsource.selectedIndex];
	try{
        const value = selectedOption.value;
        let odata = {};
        for (const key in DATA[value]) {
            odata[key] = DATA[value][key].name;
        }
        const options = Object.entries(odata).map(([key, value]) => `<option value="${key}">${value}</option>`);
        select.innerHTML = options.join("");
	}catch(e){}
    }
    // lấy dữ liệu
    function getModuleData(full = false) {
	CONFIG.numberquestiontest = document.getElementById("numberq").value;
	CONFIG.timer = document.getElementById("timer").value;
        const selectedOption1 = selectsource.options[selectsource.selectedIndex];
        const selectedOption2 = select.options[select.selectedIndex];
        const e = selectedOption1.value,
            t = selectedOption2.value;
        var source = {};
        if (full) {
            var j = 1;
            source.name = e;
            for (const k in DATA[e]) {
                for (const [key, value] of Object.entries(DATA[e][k])) {
		    if(key !== "name"){
                    source[j.toString()] = value;
                    j++;
			}
                }
            }
        } else {
            source = Object.assign({}, DATA[e][t]);
        }
        return source;
    }

    // ----kiểm tra nút bấm
    // thay đổi nguồn dữ liệu
    document.getElementById("selectsource").addEventListener("change", () => {
        getModule();
    });
    // ôn tập
    document.getElementById("btn-start").addEventListener("click", () => {
        const source = getModuleData()
        showPopup(source)
    });
    // kiểm tra
    document.getElementById("btn-check").addEventListener("click", () => {
        const source = getModuleData()
        showPopup(source, 2)
    });
    // thi thử
    document.getElementById("btn-test").addEventListener("click", () => {
        const source = getModuleData(true)
        showPopup(source, 3)
    });
    // nhập dữ liệu
    document.querySelector(".import").addEventListener("click", () => {
        importData();
    });
    // cập nhật dữ liệu
    document.querySelector(".update").addEventListener("click", () => {
        updateData();
    });
    // nhấn ESC
    document.addEventListener("keyup", function(e) {
        if (27 === e.keyCode) {
            e.preventDefault();
            resetAll();
        }
    })

    function hdsd() {
        var link = document.createElement("a");
        link.href = "./src/hdsd.png";
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
    var isrand = false;
    //-----Phần tạo popup câu hỏi, chấm thi
    function showPopup(source, loai = 1) {
        // khai báo
        var name = source.name,
            popuptitle = '',
            chamthi = '';
        let mainquiz = document.getElementById("mainquiz");
        mainquiz.innerHTML = '';
        try {
            delete source.name;
        } catch (e) {}
        let count = 0;
        for (const key in source) count++;
        switch (loai) {
            case 1: // ôn tập
		isrand = false;
                addAnswerStyle();
                popuptitle = `Ôn tập ${name}: ${count} câu`;
                chamthi = `<button type="button" class="btn2 checkA"><span>Test</span></button>`;
                break;
            case 2: // kiểm tra
		isrand = true;
                counter();
                chamthi = `<button type="button" class="btn2 checkA"><span>Kiểm tra</span></button>`;
                popuptitle = `Kiểm tra ${name}: ${CONFIG.numberquestion} câu`;
                break;
            case 3:
		isrand = true;
                counter();
                chamthi = `  <button type="button" class="btn2 checkA"><span>Nộp bài</span></button>`;
                popuptitle = `Thi thử ${name}: ${CONFIG.numberquestiontest}/${count} câu`;
                break;
            default:
        }
        // tạo popup
        let popup = document.createElement("div");
        popup.classList.add("popup");
        popup.innerHTML = `<div class="top" id="topcontainer"><div class="left" id="title">${popuptitle}</div></div>
	<div class="popup_content"><h1>Bài thi trắc nghiệm</h1>${cTest(source, loai)}</div>`;
        popup.innerHTML += `<div class="popup_footer">${chamthi}<button type="button" class="btn2 close"><span>&times; Đóng</span></button></div>`;
        mainquiz.appendChild(popup);
        // check answers
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
                // check kết quả
		const DA = ["A", "B", "C", "D", "E", "F"];
		let answerQ = DA[answer-1];
                let btntext = mainquiz.querySelector('.' + event.target.id);
                let keytext = mainquiz.querySelector('.key-' + key);
                if (answerQ == source[key].A) {
                    btntext.classList.add('correct');
                    keytext.innerHTML = "Đáp án Đúng!"
                } else {
                    btntext.classList.add('wrong');
		    let i = DA.findIndex(s => s==source[key].A);
                    let btntext2 = mainquiz.querySelector(`.btn-${key}-${i+1}`);
                    btntext2.classList.add('correct');
                    keytext.innerHTML = "Đáp án bạn chọn không đúng." + (isrand ? '': " Đáp án đúng là " +source[key].A);
                }
                // lưu kết quả
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
        // nút bấm trong popup
        popup.querySelector(".close").addEventListener("click", () => {
            popup.remove(); // đóng
            resetAll();
        });
        popup.querySelector(".checkA").addEventListener("click", () => {
            if (loai == 1) {
                resetAll(false);
                source.name = name;
                showPopup(source, 2);
            } else {
                checkAnswer(); // chấm thi
            }
        });
    }
    //tạo bài test
    function cTest(data, loai = 1) {
        let temp = "";
        let key = Object.keys(data);
        switch (loai) {
            case 1: // tất cả
                key.forEach(s => {
                    temp += cQuestion(s, data[s]);
                });
                break;
            case 2: // ngẫu nhiên
                const rand = shuffle(getRandomSubarray(key, CONFIG.numberquestion));
                let i = 1; // số câu hỏi
                rand.forEach(s => {
                    temp += cQuestion(s, data[s], i);
                    i++;
                });
                break;
            case 3: // thi thử
                const randt = shuffle(getRandomSubarray(key, CONFIG.numberquestiontest));
                let j = 1; // số câu hỏi
                randt.forEach(s => {
                    temp += cQuestion(s, data[s], j);
                    j++;
                });
                break;
            default:
        }
        return temp;

    }
    // tạo câu hỏi
    function cQuestion(key, data, index = 0) {
	const DA = ["A", "B", "C", "D", "E", "F"];
	var temp = [];
        function inputhtml(i) {
            return data.hasOwnProperty(i) ? `<input type="radio" name = "btn-${key}" class="btn" id="btn-${key}-${i}" value="${i}"/><span class="btn-${key} btn-${key}-${i}">${isrand? '': DA[i-1]+'.'}${data[i]}</span> <br/>` : "";
        }
        for (var input = "", j = 1; j < 6; j++) temp.push(inputhtml(j));
	if(isrand){
	for(let i = temp.length -1; i>0; i--) {
		const j = Math.floor(Math.random()* (i+1));
		[temp[i], temp[j]] = [temp[j], temp[i]]
	}
	}
        return `<form><h2 id="${key}">Câu hỏi ${index? index: key}: ${data.Q}</h2>${temp.join("")}<div class="answer key-${key}"></div>	</form>`
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

    function shuffle(array) {
        let currentIndex = array.length,
            randomIndex;
        // Trong khi vẫn còn phần tử để sắp xếp lộn xộn
        while (currentIndex > 0) {
            // Chọn một phần tử ngẫu nhiên
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            // Và hoán đổi nó với phần tử hiện tại
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]
            ];
        }
        return array;
    }
    // bộ đếm giờ
    function counter() {
        clearInterval(countdownInterval);
        let divclock = document.querySelector(".clock-container");
        let countdownTime = CONFIG.timer * 60;
        countdownInterval = setInterval(function() {
            // Calculate minutes and seconds
            let minutes = Math.floor(countdownTime / 60);
            let seconds = countdownTime % 60;
            divclock.innerHTML = `<img src="./src/clock.jpg" style="height:20px; width:20px;"/>  ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            if (countdownTime === 0) {
                clearInterval(countdownInterval);
                checkAnswer();
            } else {
                // Decrease the countdown time
                countdownTime--;
            }
        }, 1000); // Update every second
    };
    // đồng hồ
    function clock() {
        countdownInterval = setInterval(() => {
            var now = new Date();
            var hour = now.getHours();
            var minute = now.getMinutes();
            document.querySelector(".clock-container").innerHTML = `<img src="./src/clock.png" style="height:20px; width:20px;"/>  ` + hour.toString().padStart(2, '0') + ":" + minute.toString().padStart(2, '0');
        }, 1000);
    }
    // chấm thi
    function checkAnswer() {
        let mainquiz = document.getElementById("mainquiz");
        for (const radio of mainquiz.querySelectorAll("input[type='radio']")) radio.disabled = true;
        addAnswerStyle();
        clearInterval(countdownInterval);
        let t = JSON.parse(localStorage.getItem(CONFIG.localStorageID));
        let answers = null === t ? [] : t;
        let total = answers.length // tổng câu hỏi
        const sum = answers.reduce((acc, item) => {
            return acc + item.s;
        }, 0); // tổng điểm
        result(sum + '/' + total);
    }

    // hiển thị kết quả chấm bài
    function result(x) {
        let div = document.createElement("div");
        div.id = "result";
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
    async function resetAll(quiz = true) {
        const result = document.querySelector("#result");
        if (result) {
            document.body.removeChild(result);
        }
        clearInterval(countdownInterval);
        await localStorage.setItem(CONFIG.localStorageID, JSON.stringify([]));
        quiz && (document.getElementById("mainquiz").innerHTML = "", await clock());
        document.getElementById("option").innerHTML = "";

    }
    // update data từ server
    async function updateData() {
        var a = await fetch("https://raw.githubusercontent.com/drphe/thitracnghiem/main/src/data.json");
        var b = await a.json();
        if (b) {
            chrome.storage.local.set({
                'data': b
            });
            alert("Update data successfull!");
            location.reload();
        } else {
            alert("Failed to update data. ");
        }
    }
    // thêm style câu trả lời
    function addAnswerStyle() {
        document.getElementById("option").innerHTML = `.answer {display:block!important;color: green;}.wrong {color: red;}.correct {color: blue;}`;
    }
    // nhập dữ liệu
    function importData() {
        function isJSON(inputFile) {
            try {
                JSON.parse(inputFile);
                return true;
            } catch (error) {
                return false;
            }
        }
        const fileInput = document.querySelector('.fileupload');
        fileInput.click();
        fileInput.addEventListener('change', async () => {
            const selectedFile = fileInput.files[0];
            if (selectedFile) {
                const reader = new FileReader();
                reader.onload = async function(e) {
                    const jsonContent = e.target.result;
                    if (isJSON(jsonContent)) {
                        const data = JSON.parse(jsonContent);
                        chrome.storage.local.set({
                            'data': data
                        }, function() {
                            alert('Successfull import data.');
                            location.reload();
                        });
                    } else {
                        var xl2json = new ExcelToJSON();
                        xl2json.parseExcel(selectedFile);
                    }
                };
                reader.readAsText(selectedFile);
            } else {
                alert('Please, try again.');
                hdsd();
            }
        });
    }
    // chuyển excel to json
    var ExcelToJSON = function() {
        this.parseExcel = function(file) {
            var dataname = removeAccents(file.name.split(".")[0]);
            var reader = new FileReader();
            reader.onload = async function(e) {
                var result = e.target.result;
                var workbook = XLSX.read(result, {
                    type: 'binary'
                });
		console.log(workbook)
                var jsonData = {},
                    oldData = {};
                await chrome.storage.local.get(['data']).then((item) => {
                    Object.assign(oldData, item.data);
                });
                workbook.SheetNames.forEach(function(sheetName) {
                    var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                    var json_object = JSON.stringify(XL_row_object);
                    //console.log(JSON.parse(json_object));
                    const worksheet = workbook.Sheets[sheetName];
                    jsonData[sheetName] = {}
                    try {
                        jsonData[sheetName].name = worksheet["B1"].v
                        const range = XLSX.utils.decode_range(worksheet['!ref']);
			var current = {}, num = 0;
                        for (let row = 2, i = 0; row <= range.e.r+1; row++, i++) {
                            try {
                                if (worksheet["A" + row].w && !isNaN(Number(worksheet["A" + row].w))) {
                                    num && (jsonData[sheetName][num.toString()] = current);
                                    current = {}, i = 0;
                                    num++;
                                    current.Q = worksheet["B" + row].v;
                                    current.A = worksheet["C" + row].v;
                                }
                            } catch (e) {}
                            try {
                                if (i !== 0) {
                                    current[i.toString()] = worksheet["B" + row].v;
                                }
                            } catch (e) {}
                        }
			jsonData[sheetName][num.toString()] = current;
                    } catch (e) {}
                });
                oldData[dataname] = jsonData;
                await chrome.storage.local.set({
                    'data': oldData
                }, function() {
                    alert('Successfull import data.');
                    location.reload();
                });
                console.log(oldData)
            };
            reader.onerror = function(ex) {
                console.log(ex);
                alert('Please try again!')
                hdsd();
            };
            reader.readAsBinaryString(file);
        };
    };

    function removeAccents(str) {
        var AccentsMap = [
            "aàảãáạăằẳẵắặâầẩẫấậ",
            "AÀẢÃÁẠĂẰẲẴẮẶÂẦẨẪẤẬ",
            "dđ", "DĐ",
            "eèẻẽéẹêềểễếệ",
            "EÈẺẼÉẸÊỀỂỄẾỆ",
            "iìỉĩíị",
            "IÌỈĨÍỊ",
            "oòỏõóọôồổỗốộơờởỡớợ",
            "OÒỎÕÓỌÔỒỔỖỐỘƠỜỞỠỚỢ",
            "uùủũúụưừửữứự",
            "UÙỦŨÚỤƯỪỬỮỨỰ",
            "yỳỷỹýỵ",
            "YỲỶỸÝỴ"
        ];
        for (var i = 0; i < AccentsMap.length; i++) {
            var re = new RegExp('[' + AccentsMap[i].substr(1) + ']', 'g');
            var char = AccentsMap[i][0];
            str = str.replace(re, char);
            str = str.replace(" ", "_");
        }
        return str;
    }
})();