 const div = document.querySelector("#poll");
        const input = document.querySelector("input");
        addQuestion(0);
        input.addEventListener("keyup", function(t) {
            13 === t.keyCode && (t.preventDefault(), addQuestion(0))
        })

document.addEventListener("keyup", function(e) {
    39 === e.keyCode && (e.preventDefault(), addQuestion(1))
    37 === e.keyCode && (e.preventDefault(), addQuestion(-1))
})
        // Xử lý sự kiện click của button
        document.querySelector("#ok").addEventListener("click", () => {
            addQuestion(0);
        });
        document.querySelector("#next").addEventListener("click", () => {
            addQuestion(1);
        });
        document.querySelector("#pre").addEventListener("click", () => {
            addQuestion(-1);
        });
        function addQuestion(ne) {
            const id = parseInt(input.value);
            div.innerHTML = "";
            const iframe = document.createElement("iframe");
            iframe.src = "https://bsgdtphcm.vn/ecg/ecg_poll2.php?poll_id=" + (id + ne);
            ne && (input.value = id + ne);
            //iframe.style.width = "850px";
            iframe.style.height = "550px";
            iframe.style.border = null;
            // Chèn iframe vào web
            div.appendChild(iframe);
        }