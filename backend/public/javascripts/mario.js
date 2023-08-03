/* global variable */
TOTAL_STAGE = 12;
clear_stage_list = new Array();
fail_stage_list = new Array();
last_stage = -123;
random_stage = new Array();

clear_stage_list_mini = new Array();
fail_stage_list_mini = new Array();
last_stage_mini = -123;
random_stage_mini = new Array();
timer_start_mini = 0;
timer_end_mini = 0;
first_flag_mini = false;

clear_stage_list_arc = new Array();
fail_stage_list_arc = new Array();
last_stage_arc = -123;
random_stage_arc = new Array();
timer_start_arc = 0;
timer_end_arc = 0;


function showSweetAlert() {
	swal({
	  title: "Do you want to return to the main page?",
	  icon: "warning",
	  buttons: true,
	  dangerMode: true,
	})
	.then((willDelete) => {
	  if (willDelete) {
		location.href = '/'
	  } 
	});
  }

function base64EncodeUnicode(str) {
    // First, encode the string to UTF-8 text.
    var utf8Text = unescape(encodeURIComponent(str));

    // Then, encode the UTF-8 text to Base64.
    var base64String = btoa(utf8Text);

    return base64String;
}

function checkCookie(cookieName) {
    let cookieArray = document.cookie.split(';'); // 쿠키를 세미콜론 기준으로 분리하여 배열로 만듦

    for(let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i].trim(); // trim 메소드로 앞뒤 공백 제거
        if (cookie.indexOf(cookieName) === 0) { // cookieName으로 시작하는 쿠키가 있는지 확인
            return true;
        }
    }
    return false; // for loop를 다 돌았는데도 cookieName으로 시작하는 쿠키를 찾지 못했으므로 false 반환
}

function getCookieValue(cookieName) {
    let cookieArray = document.cookie.split(';'); // 쿠키를 세미콜론 기준으로 분리하여 배열로 만듦

    for(let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i].trim(); // trim 메소드로 앞뒤 공백 제거
        if (cookie.indexOf(cookieName) === 0) { // cookieName으로 시작하는 쿠키가 있는지 확인
            return cookie.substring(cookieName.length + 1); // '='을 포함하기 위해 +1을 함. cookieName 다음부터 끝까지가 값임
        }
    }
    return ""; // for loop를 다 돌았는데도 cookieName으로 시작하는 쿠키를 찾지 못했으므로 빈 문자열 반환
}

/* @@@@@@@@@@@@@@@@@ 돌아가는 별자리 함수 @@@@@@@@@@@@@@@@@ */
/* 랜덤 int 가져오는 함수 */
function getRandomArbitrary(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

/* 엄청난 별자리 배경 함수 */
const makeStars = () => {
	var style = ["style1", "style2", "style3"];
	var tam = ["tam1", "tam1", "tam2", "tam2", "tam3"];
	var opacity = ["opacity1", "opacity2"];

	const maxSize = 2000;
	const _size = Math.floor(maxSize / 4);
	const $sky = document.querySelector(".sky");
	const htmlDummy = new Array(_size)
		.fill()
		.map((_, i) => {
			var cls =
				"star " +
				style[getRandomArbitrary(0, 3)] +
				" " +
				opacity[getRandomArbitrary(0, 2)] +
				" " +
				tam[getRandomArbitrary(0, 5)] +
				"' style='animation-delay: ." +
				getRandomArbitrary(0, 9) +
				"s; left: " +
				getRandomArbitrary(0, maxSize) +
				"px; top: " +
				getRandomArbitrary(0, maxSize) +
				"px;'";
			return `<span class='${cls}></span>`;
		})
		.join("");
	$sky.innerHTML = htmlDummy;
};
/* @@@@@@@@@@@@@@@@@ 돌아가는 별자리 함수 @@@@@@@@@@@@@@@@@ */

/* cookie 설정 : 호출시 쿠키 데이터 최신화*/
function setCookieData() {
	var cookies = document.cookie.split(";").map((el) => el.split("="));
	/* check cookies */
	var flag = false;
	for (let i = 0; i < cookies.length; i++) {
		var elem = cookies[i];
		if (elem[0].trim() == "csl") {
			if (elem[1].length == 0) {
				continue;
			}
			clear_stage_list = elem[1].split("@");
			flag = true;
		}
		if (elem[0].trim() == "fsl") {
			if (elem[1].length == 0) {
				continue;
			}
			fail_stage_list = elem[1].split("@");
			flag = true;
		}
		if (elem[0].trim() == "rs") {
			if (elem[1].length == 0) {
				continue;
			}
			random_stage = elem[1].split("@");
			flag = true;
		}
		if (elem[0].trim() == "ls") {
			if (elem[1] == -123) {
				continue;
			}
			last_stage = elem[1] * 1;
			flag = true;
		}
	}
	/* if no cookie data about csl fsl */
	if (!flag) {
		document.cookie = "csl=" + clear_stage_list.join("@");
		document.cookie = "fsl=" + fail_stage_list.join("@");
		document.cookie = "ls=" + String(-123);

		/* get random stage */
		let getRandom = (min, max, count) => {
			let temp_list = new Array();
			let flag = false;
			while (temp_list.length < count) {
				flag = false;
				let elem = Math.floor(Math.random() * (max - min + 1)) + min;
				for (let e of temp_list) {
					if (e == elem || elem == 6097) {
						flag = true;
					}
				}
				if (!flag) {
					temp_list.push(elem);
				}
			}
			return temp_list;
		};
		random_stage = getRandom(
			5948,
			6496,
			TOTAL_STAGE
		); /* 문제를 랜덤으로 가져오는건데 지정하는걸로 바꿔.*/
		document.cookie = "rs=" + random_stage.join("@");
	}
}

/* save data in cookies */
function checkResult() {
	if (last_stage != -123) {
		/* correct */
		var num = last_stage;
		if (window.location.href.split("?").at(-1) == "true") {
			clear_stage_list.push(num);
			document.cookie = "csl=" + clear_stage_list.join("@");
		} else if (window.location.href.split("?").at(-1) == "false") {
			fail_stage_list.push(num);
			document.cookie = "fsl=" + fail_stage_list.join("@");
		}
		document.cookie = "ls=" + String(-123);
		last_stage = -123;
		location.href = "/mario";
		return;
	}

	/* set ui by cookie */
	let rnsh = document.getElementsByClassName("stage");
	for (let i = 0; i < random_stage.length; i++) {
		rnsh[i].setAttribute(
			"onclick",
			"enterProblemMario(" +
				random_stage[i].toString() +
				"," +
				(i + 1).toString() +
				");"
		);
	}

	for (let elem of clear_stage_list) {
		let stage_html = document.getElementById(elem);
		stage_html.firstElementChild.className = "stage-clear";
		stage_html.firstElementChild.setAttribute("onclick", "");
		stage_html.firstElementChild.lastElementChild.textContent = "Clear";
	}

	/* change progress bar */
	let per = parseInt((100 * clear_stage_list.length) / TOTAL_STAGE);
	document.querySelector(".progress-bar-move").style.width =
		per.toString() + "%";
	document.getElementsByClassName("titlePER")[0].innerHTML =
		per.toString() + "%";

	for (let elem of fail_stage_list) {
		let stage_html = document.getElementById(elem);
		stage_html.firstElementChild.className = "stage-fail";
		stage_html.firstElementChild.setAttribute("onclick", "");
		stage_html.firstElementChild.lastElementChild.textContent = "Fail";
	}
}

/* go to problem*/
function enterProblemMario(problem, stage) {
	document.cookie = "ls=" + String(stage);
	location.href = "/mario/anonymous/" + String(problem);
}

/* function for submit button */
function submitSolutionMario(input) {
	/* 맞았는지 틀렸는지 구현 */
	const divs = document.querySelectorAll("#test_output_grid .cell_final");
	const rows = document.querySelectorAll("#test_output_grid .row");
	const rownum = rows.length;
	const divnum = divs.length;

	// console.log(divs[0].className)
	// console.log(rownum)
	// console.log(divnum/rownum)

	const numbersArray = [];
	for (let i = 0; i < rownum; i++) {
		const rowArray = [];

		for (let j = 0; j < divnum / rownum; j++) {
			const index = i * (divnum / rownum) + j;
			const div = divs[index];

			const className = div.className;
			const number = className.split("symbol_")[1]; // Extract the number after "symbol_"
			rowArray.push(parseInt(number)); // Store the number in the row array
		}

		numbersArray.push(rowArray); // Store the row array in the main array
	}

	User_Answer = numbersArray.map((num) => parseInt(num));
	Actual_Answer = input[1].grid.flat().map((num) => parseInt(num));

	console.log(numbersArray);

	for (let i = 0; i < input[1].grid.length; i++) {
		for (let j = 0; j < input[1].grid[i].length; j++) {
			// Convert the value to an integer using parseInt()
			input[1].grid[i][j] = parseInt(input[1].grid[i][j]);
		}
	}
	console.log(input[1].grid);
	answer = compareArrays(numbersArray, input[1].grid);
	var retVal = "";

	if (!answer) {
		retVal = "false";
		alert("Wrong!");
	} else {
		retVal = "true";
		alert("Success!");
	}

	/* 마리오 페이지로 redirection with return val */
	/* retVal에는 정답이면 true 오답이면 false인 String이 들어가야함*/
	location.href = "/mario?" + retVal;
}

/* super secret */
function superSecret() {
	if (TOTAL_STAGE == clear_stage_list.length) {
		alert("Congraturation!");
		if (!confirm("Reset?")) {
			// alert("None")
		} else {
			document.cookie = "csl=";
			document.cookie = "fsl=";
			document.cookie = "ls=";
			document.cookie = "rs=";
			window.location.reload();
		}
	} else {
		if (
			!confirm(
				"You can get reward when you achieve 100%\nDo you want to reset?"
			)
		) {
			// alert("None")
		} else {
			document.cookie = "csl=";
			document.cookie = "fsl=";
			document.cookie = "ls=";
			document.cookie = "rs=";
			window.location.reload();
		}
	}
}


// Mini ARC competition을 위한 코드
function setCookieData_mini() {
	var cookies = document.cookie.split(";").map((el) => el.split("="));
	/* check cookies */
	var flag = false;
	for (let i = 0; i < cookies.length; i++) {
		var elem = cookies[i];
		if (elem[0].trim() == "csl_mini") {
			if (elem[1].length == 0) {
				continue;
			}
			clear_stage_list_mini = elem[1].split("@");
			flag = true;
		}
		if (elem[0].trim() == "fsl_mini") {
			if (elem[1].length == 0) {
				continue;
			}
			fail_stage_list_mini = elem[1].split("@");
			flag = true;
		}
		if (elem[0].trim() == "rs_mini") {
			if (elem[1].length == 0) {
				continue;
			}
			random_stage_mini = elem[1].split("@");
			flag = true;
		}
		if (elem[0].trim() == "ls_mini") {
			if (elem[1] == -123) {
				continue;
			}
			last_stage_mini = elem[1] * 1;
			flag = true;
		}
	}
	/* if no cookie data about csl fsl */
	if (!flag) {
		document.cookie = "csl_mini=" + btoa(clear_stage_list_mini.join("@"));
		document.cookie = "fsl_mini=" + fail_stage_list_mini.join("@");
		document.cookie = "ls_mini=" + String(-123);

		/* get random stage */
		let getRandom = (min, max, count) => {
			let temp_list = new Array();
			let flag = false;
			while (temp_list.length < count) {
				flag = false;
				let elem = Math.floor(Math.random() * (max - min + 1)) + min;
				for (let e of temp_list) {
					if (e == elem || elem == 6097) {
						flag = true;
					}
				}
				if (!flag) {
					temp_list.push(elem);
				}
			}
			return temp_list;
		};
		// random_stage = getRandom(
		// 	5948,
		// 	6496,
		// 	TOTAL_STAGE
		// ); /* 문제를 랜덤으로 가져오는건데 지정하는걸로 바꿔.*/
		random_stage_mini = [5952,5971,5978,5983,6015,6018,6021,6022,6026,6033,6048,6055]
		document.cookie = "rs_mini=" + random_stage_mini.join("@");
	}
}

function checkPasswordAndRedirect_mini(event, url) {
	console.log('asdf');
    event.preventDefault();
    var password = base64EncodeUnicode(prompt("Please enter your password:"));
    if (password === "IXN1bmRvbmdraW0h") {  // replace "your_password" with the actual password
        window.location.href = url;
    } else {
        alert("Incorrect password.");
    }
}

/* 타이머 초기화 함수 */
function initial_timer_mini(){
if(!checkCookie("visited_mini")) {
		document.cookie = 'visited_mini=true;';
		timer_start_mini = Date.now();
		document.cookie = `start_mini=${timer_start_mini}`;
	}
}

/* save data in cookies */
function checkResult_mini() {
	if (last_stage_mini != -123) {
		/* correct */
		var num = last_stage_mini;
		if (window.location.href.split("?").at(-1) == "true") {

			clear_stage_list_mini = atob(clear_stage_list_mini).split('@')
			clear_stage_list_mini.push(num);

			document.cookie = "csl_mini=" + btoa(clear_stage_list_mini.join("@"));
		} /*else if (window.location.href.split("?").at(-1) == "false") {
			fail_stage_list_mini.push(num);
			document.cookie = "fsl_mini=" + fail_stage_list_mini.join("@");
		}*/
		document.cookie = "ls_mini=" + String(-123);
		last_stage_mini = -123;
		location.href = "/mini_competition";
		return;
	}

	/* set ui by cookie */
	let rnsh = document.getElementsByClassName("stage");
	for (let i = 0; i < random_stage_mini.length; i++) {
		rnsh[i].setAttribute(
			"onclick",
			"enterProblem_mini(" +
				random_stage_mini[i].toString() +
				"," +
				(i + 1).toString() +
				");"
		);
	}
	clear_stage_list_mini = atob(clear_stage_list_mini).split('@')
	clear_stage_list_mini = clear_stage_list_mini.filter((element) => element !== '')

	for (let elem of clear_stage_list_mini) {
		let stage_html = document.getElementById(elem);
		stage_html.firstElementChild.className = "stage-clear";
		stage_html.firstElementChild.setAttribute("onclick", "");
		stage_html.firstElementChild.lastElementChild.textContent = "Clear";
	}

	/* change progress bar */
	let per = parseInt((100 * clear_stage_list_mini.length) / TOTAL_STAGE);
	document.querySelector(".progress-bar-move").style.width =
		per.toString() + "%";
	document.getElementsByClassName("titlePER")[0].innerHTML =
		per.toString() + "%";

	if(clear_stage_list_mini.length === TOTAL_STAGE){
		document.querySelector('.super-secret.disabled').classList.remove('disabled');
		document.querySelector('.super-secret .title').innerHTML = 'Click!'
		clearInterval(WOWTimer);
		
	}

	for (let elem of fail_stage_list_mini) {
		let stage_html = document.getElementById(elem);
		stage_html.firstElementChild.className = "stage-fail";
		stage_html.firstElementChild.setAttribute("onclick", "");
		stage_html.firstElementChild.lastElementChild.textContent = "Fail";
	}
}

function enterProblem_mini(problem, stage) {
	document.cookie = "ls_mini=" + String(stage);
	location.href = "/mini_competition/anonymous/" + String(problem);
}

function submitSolutionMarioMini(input) {
	/* 맞았는지 틀렸는지 구현 */
	const divs = document.querySelectorAll("#test_output_grid .cell_final");
	const rows = document.querySelectorAll("#test_output_grid .row");
	const rownum = rows.length;
	const divnum = divs.length;

	// console.log(divs[0].className)
	// console.log(rownum)
	// console.log(divnum/rownum)

	const numbersArray = getCurrentArray();

	User_Answer = numbersArray.map((num) => parseInt(num));
	Actual_Answer = input[1].grid.flat().map((num) => parseInt(num));

	console.log(numbersArray);

	for (let i = 0; i < input[1].grid.length; i++) {
		for (let j = 0; j < input[1].grid[i].length; j++) {
			// Convert the value to an integer using parseInt()
			input[1].grid[i][j] = parseInt(input[1].grid[i][j]);
		}
	}
	console.log(input[1].grid);
	answer = compareArrays(numbersArray, input[1].grid);
	final = pushToTargetArray(numbersArray,'Critical','Submit',[answer],final);
	final = {'success': answer ,'subtask': CURRENT_SUBPROBLEM,'taskcount': TOTAL_SUBPROBLEMS, 'trace': final}
	var retVal = "";

	if (!answer) {
		retVal = "false";
		sendLogDataMario(final)
		alert("Wrong!");
	} else {
		retVal = "true";
		sendLogDataMario(final)
		alert("Success!");
	}

	/* 마리오 페이지로 redirection with return val */
	/* retVal에는 정답이면 true 오답이면 false인 String이 들어가야함*/
	location.href = "/mini_competition?" + retVal;
}

/* super secret */
function superSecret_mini() {
	// clear_stage_list_mini = atob(clear_stage_list_mini).split('@')
	// clear_stage_list_mini = clear_stage_list_mini.filter((element) => element !== '')

	if (TOTAL_STAGE == clear_stage_list_mini.length) {
		if(!checkCookie("end_mini")) {
		// 타이머 멈추는 코드 구현
			timer_end_mini = Date.now();
			timer_start_mini = Number(getCookieValue('start_mini'))
			const diff = timer_end_mini - timer_start_mini;
			const sec = Math.floor(diff / 1000);
			alert(`Congraturation! ${sec}`);
			document.cookie = `end_mini=${sec}`;
		} else{
			sec = Number(getCookieValue('end_mini'))
			alert(`Congraturation! ${sec}`);
		}
		
		// if (!confirm("Reset?")) {
		// 	// alert("None")
		// } else {
		// 	document.cookie = "csl_mini=";
		// 	document.cookie = "fsl_mini=";
		// 	document.cookie = "ls_mini=";
		// 	document.cookie = "rs_mini=";
		// 	window.location.reload();
		// }
	} /*else {
		if (
			!confirm(
				"You can get reward when you achieve 100%\nDo you want to reset?"
			)
		) {
			// alert("None")
		} else {
			document.cookie = "csl_mini=";
			document.cookie = "fsl_mini=";
			document.cookie = "ls_mini=";
			document.cookie = "rs_mini=";
			window.location.reload();
		}
	} */
}

function checkPasswordAndRedirect_arc(event, url) {
	console.log('asdf');
    event.preventDefault();
    var password = base64EncodeUnicode(prompt("Please enter your password:"));
    if (password === "ZHNsYWIyMDIzQEBA") {  // replace "your_password" with the actual password
        window.location.href = url;
    } else {
        alert("Incorrect password.");
    }
}

function initial_timer_arc(){
	if(!checkCookie("visited_arc")) {
			document.cookie = 'visited_arc=true;';
			timer_start_arc = Date.now();
			document.cookie = `start_arc=${timer_start_arc}`;
		}
	}

// ARC competition을 위한 코드
function setCookieData_arc() {
	var cookies = document.cookie.split(";").map((el) => el.split("="));
	/* check cookies */
	var flag = false;
	for (let i = 0; i < cookies.length; i++) {
		var elem = cookies[i];
		if (elem[0].trim() == "csl_arc") {
			if (elem[1].length == 0) {
				continue;
			}
			clear_stage_list_arc = elem[1].split("@");
			flag = true;
		}
		if (elem[0].trim() == "fsl_arc") {
			if (elem[1].length == 0) {
				continue;
			}
			fail_stage_list_arc = elem[1].split("@");
			flag = true;
		}
		if (elem[0].trim() == "rs_arc") {
			if (elem[1].length == 0) {
				continue;
			}
			random_stage_arc = elem[1].split("@");
			flag = true;
		}
		if (elem[0].trim() == "ls_arc") {
			if (elem[1] == -123) {
				continue;
			}
			last_stage_arc = elem[1] * 1;
			flag = true;
		}
	}
	/* if no cookie data about csl fsl */
	if (!flag) {
		document.cookie = "csl_arc=" + btoa(clear_stage_list_arc.join("@"));
		document.cookie = "fsl_arc=" + fail_stage_list_arc.join("@");
		document.cookie = "ls_arc=" + String(-123);

		/* get random stage */
		let getRandom = (min, max, count) => {
			let temp_list = new Array();
			let flag = false;
			while (temp_list.length < count) {
				flag = false;
				let elem = Math.floor(Math.random() * (max - min + 1)) + min;
				for (let e of temp_list) {
					if (e == elem || elem == 6097) {
						flag = true;
					}
				}
				if (!flag) {
					temp_list.push(elem);
				}
			}
			return temp_list;
		};
		// random_stage = getRandom(
		// 	5948,
		// 	6496,
		// 	TOTAL_STAGE
		// ); /* 문제를 랜덤으로 가져오는건데 지정하는걸로 바꿔.*/
		random_stage_arc = [6268,6303,6241,6247,6309,6271,6490,6299,6291,6410,6186,6227]
		document.cookie = "rs_arc=" + random_stage_arc.join("@");
	}
}


function checkResult_arc() {
	if (last_stage_arc != -123) {
		/* correct */
		var num = last_stage_arc;
		if (window.location.href.split("?").at(-1) == "true") {
			clear_stage_list_arc = atob(clear_stage_list_arc).split('@')
			clear_stage_list_arc.push(num);

			document.cookie = "csl_arc=" + btoa(clear_stage_list_arc.join("@"));
		} /*else if (window.location.href.split("?").at(-1) == "false") {
			fail_stage_list_arc.push(num);
			document.cookie = "fsl_arc=" + fail_stage_list_arc.join("@");
		} */
		clearInterval(WOWTimer);
		document.cookie = "ls_arc=" + String(-123);
		last_stage_arc = -123;
		location.href = "/arc_competition";
		return;
	}

	/* set ui by cookie */
	let rnsh = document.getElementsByClassName("stage");
	for (let i = 0; i < random_stage_arc.length; i++) {
		rnsh[i].setAttribute(
			"onclick",
			"enterProblem_arc(" +
				random_stage_arc[i].toString() +
				"," +
				(i + 1).toString() +
				");"
		);
	}

	clear_stage_list_arc = atob(clear_stage_list_arc).split('@')
	clear_stage_list_arc = clear_stage_list_arc.filter((element) => element !== '')

	for (let elem of clear_stage_list_arc) {
		let stage_html = document.getElementById(elem);
		stage_html.firstElementChild.className = "stage-clear";
		stage_html.firstElementChild.setAttribute("onclick", "");
		stage_html.firstElementChild.lastElementChild.textContent = "Clear";
	}

	/* change progress bar */
	let per = parseInt((100 * clear_stage_list_arc.length) / TOTAL_STAGE);
	document.querySelector(".progress-bar-move").style.width =
		per.toString() + "%";
	document.getElementsByClassName("titlePER")[0].innerHTML =
		per.toString() + "%";

	if(clear_stage_list_arc.length === TOTAL_STAGE){
		document.querySelector('.super-secret.disabled').classList.remove('disabled');
		document.querySelector('.super-secret .title').innerHTML = 'Click!'
		clearInterval(WOWTimer);
	}

	for (let elem of fail_stage_list_arc) {
		let stage_html = document.getElementById(elem);
		stage_html.firstElementChild.className = "stage-fail";
		stage_html.firstElementChild.setAttribute("onclick", "");
		stage_html.firstElementChild.lastElementChild.textContent = "Fail";
	}
}

function enterProblem_arc(problem, stage) {
	document.cookie = "ls_arc=" + String(stage);
	location.href = "/arc_competition/anonymous/" + String(problem);
}

function submitSolutionMarioARC(input) {
	/* 맞았는지 틀렸는지 구현 */
	const divs = document.querySelectorAll("#test_output_grid .cell_final");
	const rows = document.querySelectorAll("#test_output_grid .row");
	const rownum = rows.length;
	const divnum = divs.length;

	// console.log(divs[0].className)
	// console.log(rownum)
	// console.log(divnum/rownum)

	const numbersArray = getCurrentArray();
	
	User_Answer = numbersArray.map((num) => parseInt(num));
	Actual_Answer = input[1].grid.flat().map((num) => parseInt(num));

	console.log(numbersArray);

	for (let i = 0; i < input[1].grid.length; i++) {
		for (let j = 0; j < input[1].grid[i].length; j++) {
			// Convert the value to an integer using parseInt()
			input[1].grid[i][j] = parseInt(input[1].grid[i][j]);
		}
	}
	console.log(input[1].grid);
	answer = compareArrays(numbersArray, input[1].grid);
	final = pushToTargetArray(numbersArray,'Critical','Submit',[answer],final);
	final = {'success': answer ,'subtask': CURRENT_SUBPROBLEM,'taskcount': TOTAL_SUBPROBLEMS, 'trace': final}
	var retVal = "";

	if (!answer) {
		sendLogDataMario(final);
		retVal = "false";
		alert("Wrong!");
	} else {
		sendLogDataMario(final);
		retVal = "true";
		alert("Success!");
	}

	/* 마리오 페이지로 redirection with return val */
	/* retVal에는 정답이면 true 오답이면 false인 String이 들어가야함*/
	location.href = "/arc_competition?" + retVal;
}

/* super secret */
function superSecret_arc() {
	// clear_stage_list_arc = atob(clear_stage_list_arc).split('@')
	// clear_stage_list_arc = clear_stage_list_arc.filter((element) => element !== '')

	if (TOTAL_STAGE == clear_stage_list_arc.length) {
		// 타이머 멈추는 코드 구현
		if(!checkCookie("end_arc")) {
			// 타이머 멈추는 코드 구현
				timer_end_arc = Date.now();
				timer_start_arc = Number(getCookieValue('start_arc'))
				const diff = timer_end_arc - timer_start_arc;
				const sec = Math.floor(diff / 1000);
				alert(`Congraturation! ${sec} sec`);
				document.cookie = `end_arc=${sec}`;
			}else{
				sec = Number(getCookieValue('end_arc'))
				alert(`Congraturation! ${sec}`);
			}
		/*
		if (!confirm("Reset?")) {
			// alert("None")
		} /*else {
			document.cookie = "csl_arc=";
			document.cookie = "fsl_arc=";
			document.cookie = "ls_arc=";
			document.cookie = "rs_arc=";
			window.location.reload();
		} */
	} /* else {
		if (
			!confirm(
				"You can get reward when you achieve 100%\nDo you want to reset?"
			)
		) {
			// alert("None")
		} else {
			document.cookie = "csl_arc=";
			document.cookie = "fsl_arc=";
			document.cookie = "ls_arc=";
			document.cookie = "rs_arc=";
			window.location.reload();
		}
	} */
}
function sendLogDataMario(final) {
	const currentURL = new URL(window.location.href);
	const pathnameSegments = currentURL.pathname.split("/");

	const dynamicParam1 = pathnameSegments[2];
	const dynamicParam2 = pathnameSegments[3];


	const url = `/task/${dynamicParam1}/${encodeURIComponent(dynamicParam2)}/save-data`;
	console.log(url);

	fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			numbersArray: final,
		}),
	})
		.then(function (response) {
			if (response.ok) {
				console.log("Data saved successfully.");
			} else {
				console.log("Failed to save data.");
			}
		})
		.catch(function (error) {
			console.log("Error:", error);
		});
}