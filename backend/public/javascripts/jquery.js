$(document).ready(function () {
	var initialToolMode = "edit";
	handleToolModeChange(initialToolMode);

	$("input[name=tool_switching]").change(function () {
		var selectedToolMode = $(this).val();
		handleToolModeChange(selectedToolMode);
	});

	$("#select_util_btn").on("click", "button", function () {
		var buttonName = $(this).attr("id"); // 버튼의 이름을 가져옴
		console.log(buttonName); // 버튼의 이름을 콘솔에 출력
	});

	$("#select_util_btn").on("click", "button", function () {
		var buttonName = $(this).attr("id"); // 버튼의 이름을 가져옴
		movedesrcript = buttonName;
		console.log(buttonName); // 버튼의 이름을 콘솔에 출력
		var selectedIds = getSelectedCellIds(); // getSelectedCellIds() 함수를 호출하여 선택된 셀의 ID를 가져옴
		var symbols = getSymbolClassesFromCellIds(selectedIds);
		var coordinates = convertCellIdsToCoordinates(selectedIds);
		var rectangular = isRectangular(coordinates);
		if (rectangular) {
			var size = calculateRectangleSize(coordinates);
			var planesymbol = saveInRectangle(symbols, size.width, size.height);
			var planeid = saveInRectangle(selectedIds, size.width, size.height);
			//console.log('planesymbol:', planesymbol);
			//console.log('planeid:', planeid);
			if (buttonName == "xflip") {
				var changed_symbol = flipArrayX(planesymbol);
				console.log("x flipped", changed_symbol);
				updateCellClasses(planeid, changed_symbol);
			}
			if (buttonName == "yflip") {
				var changed_symbol = flipArrayY(planesymbol);
				console.log("y flipped", changed_symbol);
				updateCellClasses(planeid, changed_symbol);
			}
			if (buttonName == "clockrotate") {
				console.log(buttonName); // 버튼의 이름을 콘솔에 출력
				selectedIds = getSelectedCellIds(); // getSelectedCellIds() 함수를 호출하여 선택된 셀의 ID를 가져옴
				symbols = getSymbolClassesFromCellIds(selectedIds);
				coordinates = convertCellIdsToCoordinates(selectedIds);
				size = calculateRectangleSize(coordinates);
				planesymbol = saveInRectangle(symbols, size.width, size.height);
				planeid = saveInRectangle(selectedIds, size.width, size.height);
				removeSelectedClass();
				var changed_symbol = rotateArrayClockwise(planesymbol);
				console.log("Clockwise Rotate", changed_symbol);
				//updateCellClasses(planeid, changed_symbol)
				//console.log("symbol rotate", changed_symbol)
				var black_symbol = createRectangle(size.height, size.width);
				console.log("black: ", black_symbol);
				updateCellClasses(planeid, black_symbol);
				var changed_id = rotateRectangle(planeid);
				//console.log("id roate", changed_id)
				addSelectedClass(changed_id);
				updateCellClasses(changed_id, changed_symbol);
			}
			if (buttonName == "counterclockrotate") {
				console.log(buttonName); // 버튼의 이름을 콘솔에 출력
				selectedIds = getSelectedCellIds(); // getSelectedCellIds() 함수를 호출하여 선택된 셀의 ID를 가져옴
				symbols = getSymbolClassesFromCellIds(selectedIds);
				coordinates = convertCellIdsToCoordinates(selectedIds);
				size = calculateRectangleSize(coordinates);
				planesymbol = saveInRectangle(symbols, size.width, size.height);
				planeid = saveInRectangle(selectedIds, size.width, size.height);
				removeSelectedClass();
				var changed_symbol = rotateArrayCounterClockwise(planesymbol);
				console.log("y flipped", changed_symbol);
				//updateCellClasses(planeid, changed_symbol)
				//console.log("symbol rotate", changed_symbol)
				var black_symbol = createRectangle(size.height, size.width);
				console.log("black: ", black_symbol);
				updateCellClasses(planeid, black_symbol);
				var changed_id = rotateRectangle(planeid);
				//console.log("id roate", changed_id)
				addSelectedClass(changed_id);
				updateCellClasses(changed_id, changed_symbol);
			}
		}
	});

	cell_observer();
});

$(document).keydown(function (e) {
	selectedIds = getSelectedCellIds(); // 선택된 grid를 찾음
	symbols = getSymbolClassesFromCellIds(selectedIds);
	coordinates = convertCellIdsToCoordinates(selectedIds);
	console.log(selectedIds);
	switch (e.which) {
		case 37: // left
			selectedIds.finish().animate({
				left: "-=50",
			});
			break;

		case 38: // up
			selectedIds.finish().animate({
				top: "-=50",
			});

		case 39: // right
			selectedIds.finish().animate({
				left: "+=50",
			});
			break;

		case 40: // down
			selectedIds.finish().animate({
				top: "+=50",
			});
			break;

		default:
			return; // 다른 키를 누르면 함수를 빠져나감
	}
	e.preventDefault(); // 브라우저의 기본 동작을 막음
});

var final = [];
var movedesrcript = "";

function pushToTargetArray(array2D, text1, text2, targetArray) {
	targetArray.push([text1, text2, array2D]);
	return targetArray;
}

function cell_observer(cells, observer) {
	// Select the cell_final elements and create a new MutationObserver object
	var cells = document.querySelectorAll("#user_interact .cell_final");
	const rows = document.querySelectorAll("#user_interact .row");
	const submitButton = document.getElementById("submit_solution_btn");

	const rownum = rows.length;
	const divnum = cells.length;

	var observer = new MutationObserver(function (mutations) {
		var changedElements = [];
		var radioButtons = document.querySelectorAll(
			'input[name="tool_switching"]'
		);
		var labels = document.querySelectorAll('label[for^="tool_"]');

		// Find the selected radio button
		var selectedRadioButton = document.querySelector(
			'input[name="tool_switching"]:checked'
		);

		// Find the corresponding label for the selected radio button
		var selectedLabel = document.querySelector(
			'label[for="' + selectedRadioButton.id + '"]'
		);

		// Retrieve the label text
		var labelText = selectedLabel.textContent;

		// Log the selected label text
		var inputValue = $("#output_grid_size").val();
		var rows = parseInt(inputValue.split("x")[0]);
		var cols = parseInt(inputValue.split("x")[1]);

		mutations.forEach(function (mutation) {
			if (mutation.attributeName === "class") {
				var oldClasses = getSymbolClasses(mutation.oldValue.split(" "));
				var newClasses = getSymbolClasses(
					$(mutation.target).attr("class").split(" ")
				);

				var classChanges = getSymbolClassChanges(oldClasses, newClasses);

				if (classChanges.length === 2) {
					changedElements.push(mutation.target);
				}
			}
		});

		if (changedElements.length > 0) {
			const numbersArray = [];
			for (let i = 0; i < rownum; i++) {
				const rowArray = [];

				for (let j = 0; j < divnum / rownum; j++) {
					const index = (i * divnum) / rownum + j;
					const div = cells[index];

					const className = div.className;
					const number = className.split("symbol_")[1]; // Extract the number after "symbol_"
					rowArray.push(parseInt(number)); // Convert the number to an integer and store it in the row array
				}

				numbersArray.push(rowArray); // Store the row array in the main array
			}

			console.log(numbersArray);
			console.log(labelText);
			final = pushToTargetArray(numbersArray, labelText, movedesrcript, final);
			console.log(final);
			console.log(movedesrcript);
			movedesrcript = "";
		}
	});
	// Start observing changes to the 'class' attribute of each cell_final element
	cells.forEach(function (cell) {
		observer.observe(cell, { attributes: true, attributeOldValue: true });
	});
}

function sendLogData(final) {
	const currentURL = new URL(window.location.href);
	const pathnameSegments = currentURL.pathname.split("/");

	const dynamicParam1 = pathnameSegments[2];
	const dynamicParam2 = pathnameSegments[3];

	// console.log(dynamicParam1);
	// console.log(dynamicParam2);

	const url = `${encodeURIComponent(dynamicParam2)}/save-data`;
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

function createArray(rows, columns) {
	const array = [];

	for (let i = 0; i < rows; i++) {
		const row = [];
		for (let j = 0; j < columns; j++) {
			row.push(0); // or any initial value you prefer
		}
		array.push(row);
	}

	return array;
}

// Radio Button : 'edit', 'select', floodfill'
function handleToolModeChange(toolMode) {
	if (toolMode == "edit") {
		// 'edit' mode
		console.log("edit");
		disableTools();
		enableEditable();
		//   infoMsg('Editing mode activated');
	} else if (toolMode == "select") {
		// 'select' mode
		console.log("select");
		disableTools();
		enableSelectable();
		//   infoMsg('Select some cells and click on a color to fill in, or press C to copy');
	} else if (toolMode == "floodfill") {
		// 'flood fill' mode
		disableTools();
		enableFloodFill();
		//   infoMsg('Flood fill mode activated');
	} else {
	}
}

function enableEditable() {
	$("#symbol_picker")
		.find(".symbol_preview")
		.click(function (event) {
			pickSymbol();
		});
	// Find the user_interact cell div and add a click listener to it.
	$("#user_interact").on("click", ".cell_final", function (event) {
		var selectedPreview = $("#symbol_picker").find(".selected-symbol-preview");
		// Get the class of the clicked element.
		var currentClasses = $(this).attr("class").split(" ");
		$(this)
			.removeClass(currentClasses[1])
			.addClass("symbol_" + selectedPreview.attr("symbol"));
	});
}

function enableSelectable() {
	$("#clockrotate").show();
	$("#counterclockrotate").show();
	$("#xflip").show();
	$("#yflip").show();

	$("#user_interact").selectable(); // get selectable
	$("#symbol_picker")
		.find(".symbol_preview")
		.click(function (event) {
			pickSymbol(); // pick symbol color
			fillSelected(); // fill selected cell_final
		});
}

function pickSymbol() {
	symbol_preview = $(event.target);
	$("#symbol_picker")
		.find(".symbol_preview")
		.each(function (i, preview) {
			$(preview).removeClass("selected-symbol-preview");
		});
	symbol_preview.addClass("selected-symbol-preview");
}

function fillSelected() {
	var selectedPreview = $("#symbol_picker").find(".selected-symbol-preview");
	// remove old color and add new color
	$(".cell_final.ui-selectee.ui-selected").each(function () {
		$(this).removeClass(function (index, className) {
			return (className.match(/(^|\s)symbol_\S+/g) || []).join(" ");
		});
		$(this).addClass("symbol_" + selectedPreview.attr("symbol"));
	});
}

function disableTools() {
	$("#clockrotate").hide();
	$("#counterclockrotate").hide();
	$("#xflip").hide();
	$("#yflip").hide();

	disableEditable();
	disableSelectable();
	// disableFloodFill();
}

function disableEditable() {
	$("#symbol_picker").find(".symbol_preview").off("click");
	$("#user_interact").off("click", ".cell_final");
}

function disableSelectable() {
	try {
		$("#user_interact").selectable("destroy");
	} catch (e) {}
}

// Function to extract symbol classes
function getSymbolClasses(classes) {
	var symbolClasses = [];

	classes.forEach(function (className) {
		if (className.startsWith("symbol_")) {
			symbolClasses.push(className);
		}
	});

	return symbolClasses;
}

// Function to compare old and new classes and identify changes
function getSymbolClassChanges(oldClasses, newClasses) {
	var classChanges = [];

	oldClasses.forEach(function (oldClass) {
		if (!newClasses.includes(oldClass)) {
			classChanges.push({ class: oldClass, oldClass: oldClass, newClass: "" });
		}
	});

	newClasses.forEach(function (newClass) {
		if (!oldClasses.includes(newClass)) {
			classChanges.push({ class: newClass, oldClass: "", newClass: newClass });
		}
	});

	return classChanges;
}

function resetOutputGrid() {
	// Use jQuery to select all <div> elements with class "cell_final"
	// and update their class attribute
	$("#user_interact .cell_final").attr("class", "cell_final symbol_0");
	const divs = document.querySelectorAll("#user_interact .cell_final");
	const rows = document.querySelectorAll("#user_interact .row");
	const rownum = rows.length;
	const divnum = divs.length;

	var array = [];
	array = createArray(rownum, divnum / rownum);
	console.log(array);

	labelText = "Edit";
	movedesrcript = "reset grid";
	// final = pushToTargetArray(array, labelText, movedesrcript, final)
}

$("#resetBtn").on("click", function () {
	// Call the resetOutputGrid() function when the button is clicked
	resetOutputGrid();
});

function resizeOutputGrid() {
	// Get the input value
	var inputValue = $("#output_grid_size").val();

	var rows = parseInt(inputValue.split("x")[0]);
	var cols = parseInt(inputValue.split("x")[1]);
	const numbersArray = createArray(rows, cols);
	array = createArray(rows, cols);

	if (rows > cols) {
		n = rows;
	} else {
		n = cols;
	}
	var grid = document.getElementById("user_interact");
	grid.innerHTML = "";

	for (var i = 0; i < rows; i++) {
		var row = document.createElement("div");
		row.className = "row justify-content-center";
		for (var j = 0; j < cols; j++) {
			var cell = document.createElement("div");
			cell.className = "cell_final symbol_0";
			cell.style.width = 400 / n + "px";
			cell.style.height = 400 / n + "px";
			row.appendChild(cell);
		}
		grid.appendChild(row);
	}
	// Log the input value to the console
	console.log("Input Value:", inputValue);
	labelText = "Edit";
	movedesrcript = "change grid size";
	final = pushToTargetArray(array, labelText, movedesrcript, final);
	movedesrcript = "";

	cell_observer();
}

function copyFromInput() {
	console.log(testgrid[0][0]);

	if (testgrid[0][0].height > testgrid[0][0].width) {
		n = testgrid[0][0].height;
	} else {
		n = testgrid[0][0].width;
	}

	var userInteractDiv = document.getElementById("user_interact");

	userInteractDiv.innerHTML = "";

	for (var i = 0; i < testgrid[0][0].height; i++) {
		var rowDiv = document.createElement("div");
		rowDiv.className = "row justify-content-center";

<<<<<<< Updated upstream
    for (var i = 0; i < testgrid[0][0].height; i++) {
        var rowDiv = document.createElement("div");
        rowDiv.className = "row justify-content-center";
        
        for (var j = 0; j < testgrid[0][0].width; j++) {
        var cellDiv = document.createElement("div");
        cellDiv.className = "cell_final symbol_" + testgrid[0][0].grid[i][j];
        cellDiv.id = "cell_" +i +'-' + j 
        cellDiv.style.width = (400 / n)+ "px"; // Set the desired width of each cell
        cellDiv.style.height = (400 / n)+ "px"; // Set the desired height of each cell
        
        rowDiv.appendChild(cellDiv);
        }
        
        userInteractDiv.appendChild(rowDiv);
=======
		for (var j = 0; j < testgrid[0][0].width; j++) {
			var cellDiv = document.createElement("div");
			cellDiv.className = "cell_final symbol_" + testgrid[0][0].grid[i][j];
			cellDiv.id = "cell_" + i + "-" + j;
			cellDiv.style.width = 399 / n + "px"; // Set the desired width of each cell
			cellDiv.style.height = 399 / n + "px"; // Set the desired height of each cell
>>>>>>> Stashed changes

			rowDiv.appendChild(cellDiv);
		}

		userInteractDiv.appendChild(rowDiv);
	}
	labelText = "Edit";
	movedesrcript = "copy from input";
	final = pushToTargetArray(
		testgrid[0][0].grid,
		labelText,
		movedesrcript,
		final
	);
	movedesrcript = "";
	cell_observer();
}

function compareArrays(array1, array2) {
	// Check if the arrays have the same number of rows
	if (array1.length !== array2.length) {
		return false;
	}

	// Check if the arrays have the same number of columns in each row
	for (let i = 0; i < array1.length; i++) {
		if (array1[i].length !== array2[i].length) {
			return false;
		}
	}

	// Iterate over the elements of the arrays
	for (let i = 0; i < array1.length; i++) {
		for (let j = 0; j < array1[i].length; j++) {
			// Compare the elements at each index of the nested arrays
			if (array1[i][j] !== array2[i][j]) {
				return false;
			}
		}
	}

	// If all elements are equal, the arrays are identical
	return true;
}

function submitSolution(input, name, cRoute) {
	const divs = document.querySelectorAll("#user_interact .cell_final");
	const rows = document.querySelectorAll("#user_interact .row");
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
	Actual_Answer = input[0][1].grid.flat().map((num) => parseInt(num));

	console.log(numbersArray);

	for (let i = 0; i < input[0][1].grid.length; i++) {
		for (let j = 0; j < input[0][1].grid[i].length; j++) {
			// Convert the value to an integer using parseInt()
			input[0][1].grid[i][j] = parseInt(input[0][1].grid[i][j]);
		}
	}
	console.log(input[0][1].grid);
	// console.log(cRoute)
	var lastPart = cRoute.substring(cRoute.lastIndexOf("/") + 1);
	var incrementedValue = parseInt(lastPart, 10) + 1;

	// Convert the incremented value back to a string
	var incrementedLastPart = incrementedValue.toString();

	answer = compareArrays(numbersArray, input[0][1].grid);
	console.log(answer);
	if (answer) {
		sendLogData(final);
		final = [];
		alert("Success!");
		window.location.href = "/task/" + name + "/" + incrementedLastPart;
	} else {
		sendLogData(final);
		alert("Wrong!");
		final = [];
	}
}

function IQsubmitSolution(input, name, cRoute) {
	// console.log("hi")

	const divs = document.querySelectorAll("#user_interact .cell_final");
	const rows = document.querySelectorAll("#user_interact .row");
	const rownum = rows.length;
	const divnum = divs.length;

	const numbersArray = [];
	for (let i = 0; i < rownum; i++) {
		const rowArray = [];

<<<<<<< Updated upstream
    User_Answer = numbersArray.map(num => parseInt(num))
    Actual_Answer = input[0][1].grid.flat().map(num => parseInt(num))

    console.log(numbersArray)

    for (let i = 0; i < input[0][1].grid.length; i++) {
      for (let j = 0; j < input[0][1].grid[i].length; j++) {
        // Convert the value to an integer using parseInt()
        input[0][1].grid[i][j] = parseInt(input[0][1].grid[i][j]);
      }
    }

    //console.log(numbersArray)
    //console.log(input[0][0].grid)
    //console.log(input[0][1].grid.flat()) // 이 친구가 답임 ㅋㅋ
    console.log(cRoute)
    var lastPart = cRoute.substring(cRoute.lastIndexOf('/') + 1);
    var incrementedValue = parseInt(lastPart, 10) + 1;
    
    // Convert the incremented value back to a string
    var incrementedLastPart = incrementedValue.toString();
    
    console.log(User_Answer)
    console.log(Actual_Answer)
    answer = compareArrays(User_Answer, Actual_Answer)
    console.log(answer)
    if(answer){
        alert('Success!')
        window.location.href = incrementedLastPart
    } else {
        alert('Wrong!')
    }
    
=======
		for (let j = 0; j < divnum / rownum; j++) {
			const index = i * 5 + j;
			const div = divs[index];

			const className = div.className;
			const number = className.split("symbol_")[1]; // Extract the number after "symbol_"
			rowArray.push(parseInt(number)); // Store the number in the row array
		}
>>>>>>> Stashed changes

		numbersArray.push(rowArray); // Store the row array in the main array
	}

	User_Answer = numbersArray.map((num) => parseInt(num));
	Actual_Answer = input[0][1].grid.flat().map((num) => parseInt(num));

	console.log(numbersArray);

	for (let i = 0; i < input[0][1].grid.length; i++) {
		for (let j = 0; j < input[0][1].grid[i].length; j++) {
			// Convert the value to an integer using parseInt()
			input[0][1].grid[i][j] = parseInt(input[0][1].grid[i][j]);
		}
	}

	//console.log(numbersArray)
	//console.log(input[0][0].grid)
	//console.log(input[0][1].grid.flat()) // 이 친구가 답임 ㅋㅋ
	console.log(cRoute);
	var lastPart = cRoute.substring(cRoute.lastIndexOf("/") + 1);
	var incrementedValue = parseInt(lastPart, 10) + 1;

	// Convert the incremented value back to a string
	var incrementedLastPart = incrementedValue.toString();

	console.log(User_Answer);
	console.log(Actual_Answer);
	answer = compareArrays(User_Answer, Actual_Answer);
	console.log(answer);
	if (answer) {
		alert("Success!");
		window.location.href = incrementedLastPart;
	} else {
		alert("Wrong!");
	}
}

function createInputObject(coordinates, symbols) {
	var input = {};

	for (var i = 0; i < coordinates.length; i++) {
		var cellId = "cell_" + coordinates[i][0] + "-" + coordinates[i][1];
		input[cellId] = symbols[i];
	}

	return input;
}

function calculateRectangleSize(coordinates) {
	var minX = Infinity;
	var minY = Infinity;
	var maxX = -Infinity;
	var maxY = -Infinity;

	for (var i = 0; i < coordinates.length; i++) {
		var [x, y] = coordinates[i];
		minX = Math.min(minX, x);
		minY = Math.min(minY, y);
		maxX = Math.max(maxX, x);
		maxY = Math.max(maxY, y);
	}

	// 높이와 너비를 계산합니다.
	var height = maxY - minY + 1;
	var width = maxX - minX + 1;

	return { height, width };
}

function saveInRectangle(symbols, numRows, numColumns) {
	var output = [];
	var index = 0;

	for (var i = 0; i < numRows; i++) {
		var row = [];
		for (var j = 0; j < numColumns; j++) {
			row.push(symbols[index]);
			index++;
		}
		output.push(row);
	}

	return output;
}

function flipArrayX(arr) {
	var flippedArr = [];

	// Iterate over the input array in reverse order
	for (var i = arr.length - 1; i >= 0; i--) {
		var subArr = arr[i];
		flippedArr.push(subArr);
	}

	return flippedArr;
}

function flipArrayY(arr) {
	var flippedArr = [];

	// Iterate over the input array in reverse order
	for (var i = 0; i < arr.length; i++) {
		var subArr = arr[i];
		var flippedSubArr = subArr.reverse(); // Reverse the sub-array
		flippedArr.push(flippedSubArr);
	}

	return flippedArr;
}

function rotateArrayClockwise(arr) {
	var rows = arr.length;
	var cols = arr[0].length;
	var rotatedArr = [];

	// Create the rotated array with transposed dimensions
	for (var j = 0; j < cols; j++) {
		var newRow = [];
		for (var i = rows - 1; i >= 0; i--) {
			newRow.push(arr[i][j]);
		}
		rotatedArr.push(newRow);
	}

	return rotatedArr;
}

function rotateArrayCounterClockwise(arr) {
	var rows = arr.length;
	var cols = arr[0].length;
	var rotatedArr = [];

	for (var j = cols - 1; j >= 0; j--) {
		var newRow = [];
		for (var i = 0; i < rows; i++) {
			newRow.push(arr[i][j]);
		}
		rotatedArr.push(newRow);
	}

	return rotatedArr;
}

function updateCellSymbols(planeid, symbols) {
	var cells = planeid.flat();

	// Iterate over the cells array
	for (var i = 0; i < cells.length; i++) {
		var cellId = cells[i];
		var symbol = symbols[i];

		// Remove existing symbol class from cell
		$("#" + cellId).removeClass(function (index, classNames) {
			var existingClasses = classNames.split(" ");
			var symbolClasses = existingClasses.filter(function (className) {
				return className.startsWith("symbol_");
			});
			return symbolClasses.join(" ");
		});

		// Add new symbol class to cell
		$("#" + cellId).addClass(symbol);
	}
}

function updateCellClasses(cellIdsArray, symbolsArray) {
	// Iterate over the cellIdsArray and symbolsArray
	for (var i = 0; i < cellIdsArray.length; i++) {
		var cellIds = cellIdsArray[i];
		var symbols = symbolsArray[i];

		// Iterate over the cellIds and symbols
		for (var j = 0; j < cellIds.length; j++) {
			var cellId = cellIds[j];
			var symbol = symbols[j];

			// Remove existing symbol class from the cell
			var $cell = $("#" + cellId);
			$cell.removeClass(function (index, classNames) {
				return classNames
					.split(" ")
					.filter(function (className) {
						return className.startsWith("symbol_");
					})
					.join(" ");
			});

			// Add the new symbol class to the cell
			$cell.addClass(symbol);
		}
	}
}

function getSelectedCellIds() {
	var selectedCellIds = [];

	$(".ui-selected").each(function () {
		var cellId = $(this).attr("id");
		if (cellId) {
			selectedCellIds.push(cellId);
		}
	});

	return selectedCellIds;
}

function removeSelectedClass() {
	$(".ui-selected").removeClass("ui-selected");
}

function addSelectedClass(cellIdsArray) {
	for (var i = 0; i < cellIdsArray.length; i++) {
		var cellIds = cellIdsArray[i];

		for (var j = 0; j < cellIds.length; j++) {
			var cellId = cellIds[j];
			$("#" + cellId).addClass("ui-selected");
		}
	}
}

function getSymbolClassesFromCellIds(cellIds) {
	var symbolClasses = [];

	if (Array.isArray(cellIds)) {
		cellIds.forEach(function (cellId) {
			if (cellId) {
				var $cell = $("#" + cellId);
				var classes = $cell.attr("class").split(" ");

				classes.forEach(function (className) {
					if (className.startsWith("symbol")) {
						symbolClasses.push(className);
					}
				});
			}
		});
	}

	return symbolClasses;
}

function isRectangular(coordinates) {
	if (coordinates.length < 2) {
		// A rectangle needs at least 2 coordinates
		return false;
	}

	var minRow = coordinates[0][0];
	var maxRow = coordinates[0][0];
	var minCol = coordinates[0][1];
	var maxCol = coordinates[0][1];

	for (var i = 1; i < coordinates.length; i++) {
		var row = coordinates[i][0];
		var col = coordinates[i][1];

		if (row < minRow) {
			minRow = row;
		} else if (row > maxRow) {
			maxRow = row;
		}

		if (col < minCol) {
			minCol = col;
		} else if (col > maxCol) {
			maxCol = col;
		}
	}

	var numRows = maxRow - minRow + 1;
	var numCols = maxCol - minCol + 1;

	return coordinates.length === numRows * numCols;
}

function applyPaddingToRectangle(arr, pad_symbol) {
	var rows = arr.length;
	var cols = arr[0].length;
	var maxDimension = Math.max(rows, cols);

	// Add padding to make a square
	if (cols < maxDimension) {
		for (var i = 0; i < rows; i++) {
			for (var j = cols; j < maxDimension; j++) {
				arr[i].unshift(pad_symbol);
			}
		}
	} else if (rows < maxDimension) {
		for (var i = rows; i < maxDimension; i++) {
			var newRow = Array(maxDimension).fill(pad_symbol);
			arr.unshift(newRow);
		}
	}

	return arr;
}

function padRectangleToSquare(arr) {
	const height = arr.length;
	const width = arr[0].length;
	const max_length = Math.max(height, width);
	const square = Array.from({ length: max_length }, () =>
		Array(max_length).fill("")
	);

	let rowOffset = 0;
	let colOffset = 0;

	if (height < width) {
		rowOffset = Math.floor((max_length - height) / 2);
	} else if (height > width) {
		colOffset = Math.floor((max_length - width) / 2);
	}

	for (let i = 0; i < height; i++) {
		for (let j = 0; j < width; j++) {
			square[i + rowOffset][j + colOffset] = arr[i][j];
		}
	}

	for (let i = 0; i < square.length; i++) {
		const cellId = square[i][0].replace(/-\d+$/, "");
		for (let j = 0; j < square[i].length; j++) {
			square[i][j] = `${cellId}-${j + 1}`;
		}
	}

	return square;
}

function rotateRectangle(arr) {
	const height = arr[0].length; //회전을 위해 바꿈
	const width = arr.length; //회전을 위해 바꿈
	var center = convertCellIdsToCoordinates(findCenterValue(arr));
	var new_rec = createRectangle(width, height);
	new_rec = createCellArray(fillArrayWithPositions(new_rec, center));
	//console.log("center:", center)
	//console.log("height", height)
	//console.log("width", width)
	console.log("new_rec", new_rec);

	return new_rec;
}

function fillArrayWithPositions(array, center) {
	const rows = array.length;
	const cols = array[0].length;

	const filledArray = Array.from({ length: rows }, (_, i) =>
		Array.from({ length: cols }, (_, j) => [
			i + center[0][0] - Math.floor(rows / 2),
			j + center[0][1] - Math.floor(cols / 2),
		])
	);

	//console.log("filledArray:", filledArray);

	return filledArray;
}

function createCellArray(array) {
	const result = [];
	for (let i = 0; i < array.length; i++) {
		const row = array[i];
		const newRow = [];
		for (let j = 0; j < row.length; j++) {
			const [x, y] = row[j];
			const cellName = `cell_${x}-${y}`;
			newRow.push(cellName);
		}
		result.push(newRow);
	}
	//console.log("createCellArray", result);
	return result;
}

function findCenterValue(matrix) {
	const rows = matrix.length;
	const cols = matrix[0].length;
	const centerRow = Math.floor(rows / 2);
	const centerCol = Math.floor(cols / 2);
	const centerValue = matrix[centerRow][centerCol];
	return [centerValue];
}

function createRectangle(width, height) {
	const rectangle = [];
	for (let y = 0; y < height; y++) {
		const row = [];
		for (let x = 0; x < width; x++) {
			row.push("symbol_0");
		}
		rectangle.push(row);
	}
	//console.log("createrectangle", rectangle)
	return rectangle;
}

function convertCellIdsToCoordinates(cellIds) {
	var coordinates = [];

	if (Array.isArray(cellIds)) {
		cellIds.forEach(function (cellId) {
			if (cellId) {
				var parts = cellId.split("_")[1].split("-");
				var row = parseInt(parts[0]);
				var column = parseInt(parts[1]);
				coordinates.push([row, column]);
			}
		});
	}

	return coordinates;
}
