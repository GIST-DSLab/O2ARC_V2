var COPIED_ARRAY = [];
var MOVEBACKUP_BG = [];
var MOVEBACKUP_SEL = [];
var MOVEBACKUP_DIM = {};
var MOVEBACKUP_SELAREA = [];

const miniGridSize = 200;
const fullGridSize = 400;
var final = []

// Undo and Redo History Stacks
var historyStack = []
var undoHistory = []

const Actions = ['Color', 'Fill', 'FlipX', 'FlipY', 'RotateCW', 'RotateCCW', 'Copy', 'Paste', 'Move', 'FloodFill', 'Undo', 'Redo'];
const CriticalActions = ['CopyFromInput', 'ResetGrid', 'ResizeGrid', 'Submit'];
var moveDescript = ''

var TOTAL_SUBPROBLEMS;
var CURRENT_SUBPROBLEM;

var selection = [];
var wasMoveRotFlip = false;

$(function () {
	final = []
	selection = []
	rownum = testgrid[0].height;
	colnum = testgrid[0].width;
	$("#output_grid_height").val(rownum);
	$("#output_grid_width").val(colnum);

	let previousGridState = {};

	function handleSelectStart() {
		if (wasMoveRotFlip === false){
			wasMoveRotFlip = true;
			// Backup Here
			separateSelection();
			
		}
		// select cell stored
	}

	function handleCellMove(operation) {
		// move cell operation
		MOVEBACKUP_SEL= MOVEBACKUP_SEL.map((v,i) => {
			return {x: v.x+operation.x, y: v.y+operation.y, symbol:v.symbol};
		});
		MOVEBACKUP_SELAREA = MOVEBACKUP_SELAREA.map((v,i) => {
			return {x: v.x+operation.x, y: v.y+operation.y};
		})
		MOVEBACKUP_DIM.minX += operation.x;
		MOVEBACKUP_DIM.maxX += operation.x;
		MOVEBACKUP_DIM.minY += operation.y;
		MOVEBACKUP_DIM.maxY += operation.y;

	}

	function handleCellRotate(ccw=false){
		let sigma = ccw? +1 : -1;
		console.log(MOVEBACKUP_DIM)
		let cX = (MOVEBACKUP_DIM.maxX+MOVEBACKUP_DIM.minX)*0.5; //centervalue
		let cY = (MOVEBACKUP_DIM.maxY+MOVEBACKUP_DIM.minY)*0.5;
		let newminX,newmaxX,newminY,newmaxY;
		if(MOVEBACKUP_DIM.height % 2 == MOVEBACKUP_DIM.width %2 ){ //smoothly rotatable
			MOVEBACKUP_SEL= MOVEBACKUP_SEL.map((v,i) => {
				let newX = Math.round(cX + sigma * (cY - v.y));
				let newY = Math.round(cY - sigma * (cX - v.x));
				return {x: newX, y: newY, symbol:v.symbol};
			});
			MOVEBACKUP_SELAREA= MOVEBACKUP_SELAREA.map((v,i) => {
				let newX = Math.round(cX + sigma * (cY - v.y));
				let newY = Math.round(cY - sigma * (cX - v.x));
				return {x: newX, y: newY};
			});
			newminX = Math.round(cX + sigma * (cY - MOVEBACKUP_DIM.minY));
			newmaxX = Math.round(cX + sigma * (cY - MOVEBACKUP_DIM.maxY));
			newminY = Math.round(cY - sigma * (cX - MOVEBACKUP_DIM.minX));
			newmaxY = Math.round(cY - sigma * (cX - MOVEBACKUP_DIM.maxX));

		} else {
			if(MOVEBACKUP_DIM.rot === undefined) { MOVEBACKUP_DIM.rot = 0};
			MOVEBACKUP_DIM.rot+=1;
			let modifier = MOVEBACKUP_DIM.rot%2;
			MOVEBACKUP_SEL= MOVEBACKUP_SEL.map((v,i) => {
				let newX = Math.round(cX + sigma * (cY - v.y))-modifier;
				let newY = Math.round(cY - sigma * (cX - v.x))-modifier;
				return {x: newX, y: newY, symbol:v.symbol};
			});
			MOVEBACKUP_SELAREA = MOVEBACKUP_SELAREA.map((v,i)=> {
				let newX = Math.round(cX + sigma * (cY - v.y))-modifier;
				let newY = Math.round(cY - sigma * (cX - v.x))-modifier;
				return {x: newX, y: newY};
			})
			newminX = Math.round(cX + sigma * (cY - MOVEBACKUP_DIM.minY))-modifier;
			newmaxX = Math.round(cX + sigma * (cY - MOVEBACKUP_DIM.maxY))-modifier;
			newminY = Math.round(cY - sigma * (cX - MOVEBACKUP_DIM.minX))-modifier;
			newmaxY = Math.round(cY - sigma * (cX - MOVEBACKUP_DIM.maxX))-modifier;
		} 
		
		MOVEBACKUP_DIM.minY = Math.min(newminY,newmaxY);
		MOVEBACKUP_DIM.maxY = Math.max(newminY,newmaxY);
		MOVEBACKUP_DIM.minX = Math.min(newminX,newmaxX);
		MOVEBACKUP_DIM.maxX = Math.max(newminX,newmaxX);
		MOVEBACKUP_DIM.width, MOVEBACKUP_DIM.height = MOVEBACKUP_DIM.height, MOVEBACKUP_DIM.width;
	}
	
	function handleCellFlip(axis='x'){
		let cX2 = (MOVEBACKUP_DIM.maxX+MOVEBACKUP_DIM.minX); //centervalue * 2
		let cY2 = (MOVEBACKUP_DIM.maxY+MOVEBACKUP_DIM.minY);
		if(axis == 'x'){
			MOVEBACKUP_SEL= MOVEBACKUP_SEL.map((v,i) => {
				let newX = cX2-v.x;
				let newY = v.y
				return {x: newX, y: newY, symbol:v.symbol};
			});
		} else if(axis =='y'){
			MOVEBACKUP_SEL= MOVEBACKUP_SEL.map((v,i) => {
				let newX = v.x;
				let newY = cY2-v.y
				return {x: newX, y: newY, symbol:v.symbol};
			});
		}
	}

	function handleSelectEnd() {
		// select cell end

		$('#test_output_grid .cell_final').each((i,e)=>{$(e).removeClass('ui-selected')});
		let unionresult = {};

		MOVEBACKUP_BG.forEach((v,i) => {
			unionresult[`${v.x}-${v.y}`] = v.symbol;
		})
		MOVEBACKUP_SEL.forEach((v,i) => {
			unionresult[`${v.x}-${v.y}`] = v.symbol;
		})
		
		MOVEBACKUP_SELAREA.forEach((v,i) => {
			let jqCell = $(`#cell_${v.x}-${v.y}`);
			if(jqCell.length)
				jqCell.addClass('ui-selected');
		})

		for ( const [k,v] of Object.entries(unionresult)){
			let jqCell = $(`#cell_${k}`);
			if(jqCell.length){
				let symbolClass = jqCell.attr("class").match(/symbol_[0-9]/)[0];
				if(symbolClass != 'symbol_'+v)
					jqCell.removeClass(symbolClass).addClass('symbol_'+v);
			}
		}

		if(MOVEBACKUP_SEL.length>0){
			recordGridchange();
		}
	}

	document.querySelectorAll('.form-outline').forEach((formOutline) => {
		new mdb.Input(formOutline).init();
	});
	// Configure Initial Tool Mode
	var initialToolMode = "edit";
	handleToolModeChange(initialToolMode);
	$("input[id=tool_edit]").prop("checked", true);

	// Event Listener for Tool Switching
	$("input[name=tool_switching]").on("change", function () {
		var selectedToolMode = $(this).val();
		$("#toolbar-selection > label").each((i,e) => {$(e).removeClass('bg-primary text-white')});
		handleToolModeChange(selectedToolMode);
		$(`label[for=tool_${selectedToolMode}]`).addClass('bg-primary text-white');
	});

	//reset undo redo feature
    resetHistoryStack();

    // Select Mode Action Buttons 
	$("input[name=tool_switching]").on("focus", function () {
		$(":focus").trigger("blur");

	});

	// Select Mode Action Buttonsr
	$("#select_util_btn").on("click", "button", function () {
		var buttonName = $(this).attr("id"); // Read Button name

		var selectedIds = getSelectedCellIds(); // Retrieve Selected Cell Ids
		var coordinates = convertCellIdsToCoordinates(selectedIds); // Convert Cell ids' to Coords
		var size = calculateRectangleSize(coordinates);
		selection = [[size.minX,size.minY],[size.maxX,size.maxY]];
		var rectangular = isRectangular(coordinates); // Verify the selection area is square-shaped
		
		if (true) {
			
			handleSelectStart();

			if (buttonName == 'xflip') {

				moveDescript = 'FlipX';
				handleCellFlip(axis='x');
				handleSelectEnd();
				console.log(`-- Action: X Flip\n---- Changed: (${size.minX},${size.minY}) ~ (${size.maxX},${size.maxY})`);

			}
			if (buttonName == 'yflip') {

				moveDescript = 'FlipY';
				handleCellFlip(axis='y');
				handleSelectEnd();
				console.log(`-- Action: Y Flip\n---- Changed: (${size.minX},${size.minY}) ~ (${size.maxX},${size.maxY})`);
			}
			if (buttonName == "clockrotate") {

				moveDescript = "RotateCW";
				handleCellRotate(ccw=false);
				handleSelectEnd();
				console.log(`-- Action: CW Rotate\n---- Changed: (${size.minX},${size.minY}) ~ (${size.maxX},${size.maxY})`);
				
			}
			if (buttonName == "counterclockrotate") {

				moveDescript = "RotateCCW";
				handleCellRotate(ccw=true);
				handleSelectEnd();
				console.log(`-- Action: CCW Rotate\n---- Changed: (${size.minX},${size.minY}) ~ (${size.maxX},${size.maxY})`);
			
			}
		}
	});

	$("body").on("keydown", function (event) {
		if (event.ctrlKey && event.key === "c") {
			selected = $(".ui-selected");
			if (selected.length == 0) {
				return;
			}

			xlist = [];
			ylist = [];
			symbols = [];
			var xx, yy, cv, from;

			// retrieve cell data from selected
			for (let i = 0; i < selected.length; i++) {
				cellid = $(selected[i]).attr("id");
				cv = parseInt(
					$(selected[i])
						.attr("class")
						.match(/symbol_([0-9])/)[1]
				); // get cell symbol number
				ar = cellid.split(/[_-]/);
				[from, xx, yy] = ar;
				xx = parseInt(xx);
				yy = parseInt(yy);
				cv = parseInt(cv);

				xlist.push(xx);
				ylist.push(yy);
				symbols.push(cv);
			}
			if (from == "inputcell") {
				from = "Input Grid";
			} else {
				from = "Output Grid";
			}

			// Calculate array size
			let minx = Math.min(...xlist);
			let maxx = Math.max(...xlist);
			let miny = Math.min(...ylist);
			let maxy = Math.max(...ylist);
			let copyheight = maxx - minx + 1;
			let copywidth = maxy - miny + 1;
			
			// ARRAY CONStruction
			COPIED_ARRAY = [];
			for (var i = 0; i < copyheight; i++) {
				COPIED_ARRAY.push([]);
			}

			// put into the copy array
			for (var i = 0; i < selected.length; i++) {
				xx = xlist[i];
				yy = ylist[i];
				cv = symbols[i];
				COPIED_ARRAY[xx - minx][yy - miny] = cv;
			}
			console.log(
				`-- Action: Copy Array\n---- From: <${from}>\n---- Where: (${minx},${miny}) ~ (${maxx},${maxy})\n---- Copied:`,
				COPIED_ARRAY
			);
 
			const numbersArray = getCurrentArray();
			
			moveDescript = 'Copy';
			selection = [[minx,miny],[maxx,maxy],from];
			final = pushToTargetArray(numbersArray,'Select',moveDescript,selection,final );

		} else if (event.ctrlKey && event.key === "v") {
			if (COPIED_ARRAY.length == 0) {
				// No Data To Paste
				return;
			}
			selected = $("#test_output_grid").find(".ui-selected");
			if (selected.length == 0) {
				// No Position Specified
				return;
			} else if (selected.length == 1) {
				ar = $(selected[0]).attr("id").split(/[-_]/);
				[from, pasteCellX, pasteCellY] = ar;
				pasteCellX = parseInt(pasteCellX);
				pasteCellY = parseInt(pasteCellY);

				height = COPIED_ARRAY.length;
				width = COPIED_ARRAY[0].length;
				for (var i = 0; i < height; i++) {
					for (var j = 0; j < width; j++) {
						x = pasteCellX + i;
						y = pasteCellY + j;
						cv = COPIED_ARRAY[i][j];
						found = $(`#cell_${x}-${y}`);

						if (found.length == 1) {
							symbolClass = found.attr("class").match(/symbol_[0-9]/)[0];
							found.removeClass(symbolClass).addClass("symbol_" + cv);
						}
					}
				}
				moveDescript = "Paste";
				wasMoveRotFlip = false;
                recordGridchange();
				selection = [[pasteCellX,pasteCellY]]
				console.log(
					`-- Action: Paste Array\n---- Where: (${pasteCellX},${pasteCellY}) ~ (${
						pasteCellX + height - 1
					},${pasteCellY + width - 1})\n---- Data:`,
					COPIED_ARRAY
				);
			} else {
				// Please Select Only ONE Position(left top corner);
				return;
			}
		} else if (event.ctrlKey && event.key === "z" && !event.shiftKey) {
			wasMoveRotFlip = false;
            handleUndoAction();
		} else if (event.ctrlKey && event.key === "y") {
			wasMoveRotFlip = false;
            handleRedoAction();
		} else if(['w','a','s','d','ArrowUP','ArrowLeft','ArrowDown','ArrowRight', 'ArrowUp'].includes(event.key)){
			//Key Move Event//
			event.preventDefault(); // Prevent scrolling
			moveDescript = 'Move';
			var selectedIds = getSelectedCellIds(); // Retrieve Selected Cell Ids
			var coordinates = convertCellIdsToCoordinates(selectedIds); // Convert Cell ids' to Coords
			var size = calculateRectangleSize(coordinates);
			selection = [[size.minX,size.minY],[size.maxX,size.maxY]];

			if (event.key === "w" || event.key === "ArrowUp") {

				handleSelectStart();
				handleCellMove({ x: -1, y: 0 });
				selection = [...selection , 'U'];
				console.log(`-- Action: Move\n---- Direction: Up\n---- Changed: (${size.minX},${size.minY}) ~ (${size.maxX},${size.maxY})`)
				handleSelectEnd();

			} else if (event.key === "a" || event.key === "ArrowLeft") {

				handleSelectStart();
				handleCellMove({ x: 0, y: -1 });
				selection = [...selection , 'L'];
				console.log(`-- Action: Move\n---- Direction: Left\n---- Changed: (${size.minX},${size.minY}) ~ (${size.maxX},${size.maxY})`)
				handleSelectEnd();

			} else if (event.key === "s" || event.key === "ArrowDown") {

				handleSelectStart();
				handleCellMove({ x: 1, y: 0 });
				selection = [...selection , 'D'];
				console.log(`-- Action: Move\n---- Direction: Down\n---- Changed: (${size.minX},${size.minY}) ~ (${size.maxX},${size.maxY})`)
				handleSelectEnd();

			} else if (event.key === "d" || event.key === "ArrowRight") {
				
				handleSelectStart();
				handleCellMove({ x: 0, y: 1 });
				selection = [...selection , 'R'];
				console.log(`-- Action: Move\n---- Direction: Right\n---- Changed: (${size.minX},${size.minY}) ~ (${size.maxX},${size.maxY})`)
				handleSelectEnd();

			}
		}
		
	});
	// Undo & Redo Button Event Handlers
    $('#undo_button').on('click', function() {
		handleUndoAction();
	});
	
	$('#redo_button').on('click', function() {
	    handleRedoAction();
	});

	cell_observer();
});

function separateSelection(){

	//selection bbox
	let minX = Infinity; 
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;
	MOVEBACKUP_BG=[];
	MOVEBACKUP_SEL=[];
	MOVEBACKUP_DIM=[];
	MOVEBACKUP_SELAREA = [];

	$('#test_output_grid .cell_final').each( (i,e)=>{
		// color
		let sym = parseInt($(e).attr('class').match(/symbol_([0-9])/)[1]);
		
		// coord
		let [_,x,y] = $(e).attr('id').split(/[_-]/);
		x = parseInt(x); y = parseInt(y);

		// Selected?
		let isSelected = $(e).attr('class').match('ui-selected') === null ? false : true;

		if(isSelected){
			// if selected and Not zero, push
			minX = Math.min(minX,x);
			minY = Math.min(minY,y);
			maxX = Math.max(maxX,x);
			maxY = Math.max(maxY,y);
			
			if(sym != 0){
				MOVEBACKUP_SEL.push({x,y,symbol:sym });
				
			}
			MOVEBACKUP_SELAREA.push({x,y});
			MOVEBACKUP_BG.push({x,y,symbol:0 });
		} else {
			MOVEBACKUP_BG.push({x,y,symbol:sym });
		}
	});
	if(minX!= Infinity)
		MOVEBACKUP_DIM = {height:maxX-minX+1, width: maxY-minY+1, minX,maxX,minY,maxY};
}

// Make a deep copy of the current grid
function copyGrid() {

	var allCellIds = [];
	var allSymbols = [];
	// Store all the cell classes in a 1D array
	$('#test_output_grid .cell_final').each(function() {
	  var cellId = $(this).attr('id');
	  if(cellId){
		allCellIds.push(cellId);
	  }
	}); 
  
	// Store all the symbols in a 1D array
	allSymbols = getSymbolClassesFromCellIds(allCellIds);
	
	return {allCellIds, allSymbols};
}
  
  // Record grid state changes
function recordGridchange() {
	// Clear the undoHistory stack whenever a new change is made
    $('#undo_button').prop('disabled',false);
    $('#redo_button').prop('disabled',true);
	undoHistory = [];
	// Push the grid state to the history stack
	historyStack.push(copyGrid());
}
  
function resetHistoryStack(){
	historyStack = [];
	undoHistory = [];
	// Initial grid push
	recordGridchange();
	$('#undo_button').prop('disabled',true);

}
  // Event Handlers for Undo & Redo Button
function handleUndoAction() {

	if (historyStack.length > 1) {
		// Push the current grid state to the undoHistory stack before reverting
		undoHistory.push(copyGrid());
		// Pop the latest grid state from the history stack
		historyStack.pop();
        let stackTop = historyStack[historyStack.length-1];
		console.log("-- Action: Undo\n---- Changed:", stackTop.allSymbols);
	
		// Revert the grid to its old state
        let coordinates = convertCellIdsToCoordinates(stackTop.allCellIds);
        let size = calculateRectangleSize(coordinates);
        let planesymbol = saveInRectangle(stackTop.allSymbols, size.width, size.height);
        let planeid = saveInRectangle(stackTop.allCellIds, size.width, size.height);
        moveDescript = 'Undo';
		updateCellClasses(planeid, planesymbol);
        // Enable the Redo button after an undo
        $('#redo_button').prop('disabled', false);
	}
  
	// Disable the Undo button if there is no more history
	if (historyStack.length === 1) {
		$('#undo_button').prop('disabled', true);
    } 
    
}
  
  
function handleRedoAction() {
    console.log('hi')
	if (undoHistory.length > 0) {
        // Push the current grid state to the history stack before reapplying
        historyStack.push(undoHistory.pop());
        
        // Pop the latest undone grid state from the undoHistory stack
        var stackTop = historyStack[historyStack.length-1];
    
        console.log("-- Action: Redo\n---- Changed:", stackTop.allSymbols);
        // Reapply the state to the grid
        let coordinates = convertCellIdsToCoordinates(stackTop.allCellIds);
        let size = calculateRectangleSize(coordinates);
        let planesymbol = saveInRectangle(stackTop.allSymbols, size.width, size.height);
        let planeid = saveInRectangle(stackTop.allCellIds, size.width, size.height);
        moveDescript = 'Redo';
		updateCellClasses(planeid, planesymbol);
        // Enable the Undo button after a redo
	    $('#undo_button').prop('disabled', false);
	}
	// Disable the Redo button if there is no more undo history
	if (undoHistory.length === 0) {
	    $('#redo_button').prop('disabled', true);
	}
	
  }
  

function pushToTargetArray(array2D, text1, text2, sel, targetArray) {
	console.log(`-------- Data Pushed, ${text1}, ${text2}, ${sel} --------`);
	targetArray.push([text1, text2, sel, array2D]);
	return targetArray;
}

function cell_observer(cells, observer) {
	// Select the cell_final elements and create a new MutationObserver object
	var cells = document.querySelectorAll("#test_output_grid .cell_final");
	const rows = document.querySelectorAll("#test_output_grid .row");
	const submitButton = document.getElementById("submit_solution_btn");

	const rownum = rows.length;
	const colnum = cells.length / rownum;

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
		var rows = parseInt($("#output_grid_height").val());
		var cols = parseInt($("#output_grid_width").val());

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

				for (let j = 0; j < colnum; j++) {
					const index = i * colnum + j;
					const div = cells[index];

					const className = div.className;
					const number = className.split("symbol_")[1]; // Extract the number after "symbol_"
					rowArray.push(parseInt(number)); // Convert the number to an integer and store it in the row array
				}

				numbersArray.push(rowArray); // Store the row array in the main array
			}

			//console.log(numbersArray)
			//console.log(labelText);

			if(CriticalActions.includes(moveDescript)){
				labelText='Critical';
			}
			final = pushToTargetArray(numbersArray, labelText, moveDescript,selection, final);
			//console.log(final)
			moveDescript = "";
			selection = [];
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
		console.log("Switch Tool: Edit");
		disableTools();
		enableEditable();
		//   infoMsg('Editing mode activated');
	} else if (toolMode == "select") {
		// 'select' mode
		console.log("Switch Tool: Select");
		disableTools();
		enableSelectable();
		//   infoMsg('Select some cells and click on a color to fill in, or press C to copy');
	} else if (toolMode == "floodfill") {
		// 'flood fill' mode
		console.log("Switch Tool: Flood Fill");
		disableTools();
		enableFloodFill();
		//   infoMsg('Flood fill mode activated');
	} else {
	}
}

function enableEditable() {
	$("#symbol_picker")
		.find(".symbol_preview")
		.on('click',function (event) {
			pickSymbol();
		});
	// Find the user_interact cell div and add a click listener to it.
	$("#test_output_grid").on("click", ".cell_final", function (event) {
		var selectedPreview = $("#symbol_picker").find(".selected-symbol-preview");
		// Get the class of the clicked element.
		moveDescript = "Color";
		selection = [parseInt(selectedPreview.attr(
			"symbol"
		))]
		let from, x, y;
		[from, x, y] = $(this).attr("id").split(/[_-]/);
		selection = [[parseInt(x),parseInt(y)]];
		console.log(
			`--Action: Coloring\n---- Where: (${x},${y})\n---- Color: ${selectedPreview.attr(
				"symbol"
			)}`
		);
		var currentClasses = $(this).attr("class").match(/symbol_[0-9]/)[0];
		$(this)
			.removeClass(currentClasses)
			.addClass("symbol_" + selectedPreview.attr("symbol"));
        recordGridchange();
	});
}

function enableSelectable() {
	disableSelectable();
	wasMoveRotFlip = false; // Selectable -> initialize flag

	var curmode = $("input[name=tool_switching]:checked").val();
	if (curmode != "select") return;
	$("#clockrotate").show();
	$("#counterclockrotate").show();
	$("#xflip").show();
	$("#yflip").show();

	$(".user_interact").selectable({
		autoRefresh: false,
		filter: "> .row > .cell_final",
		start: function (event, ui) {
			$(".ui-selected").each( function (i, e) {
				$(e).removeClass("ui-selected");
			});
		},
		stop: function (event, ui) {
			wasMoveRotFlip = false;
		},
	});
	$("#symbol_picker")
		.find(".symbol_preview")
		.on("click", function (event) {
			pickSymbol(); // pick symbol color
			fillSelected(); // fill selected cell_final
		});
}

function dfsFloodFill(x,y,color) {
	const arr = getCurrentArray();
	const H = arr.length;
	const W = arr[0].length;
	const directions = [[-1,0],[1,0],[0,-1],[0,1]];
	let affects = [];
    let visit = [];

	for(let i=0;i<H;i++) visit.push(Array.from({length: W}, () => 0));
	const orcolor = arr[x][y];
	function dfs(i,j){
		if(visit[i][j]) return;

		$(`#cell_${i}-${j}`).removeClass(function (index, className) {
			return (className.match(/(^|\s)symbol_\S+/g) || []).join(" ");
		}).addClass("symbol_" + color);

		visit[i][j] = 1;
		affects.push([i,j]);
		for(let dd=0; dd<4;dd++){
			var [dx,dy] = directions[dd];
			if(i+dx>=H || i+dx<0 || j+dy>=W || j+dy<0) continue;
			else if(arr[i+dx][j+dy]!==orcolor || visit[i+dx][j+dy]) continue;
			else dfs(i+dx,j+dy);
		}
	}
	dfs(x,y);
	return affects
	//console.log(getCurrentArray());
}

function enableFloodFill() {
	$("#symbol_picker")
	.find(".symbol_preview")
	.on('click',function (event) {
		pickSymbol();
	});
	$("#test_output_grid").on("click", ".cell_final", function (event) {
		var selectedPreview = $("#symbol_picker").find(".selected-symbol-preview");
		// Get the class of the clicked element.
		moveDescript = "FloodFill";
		let from, x, y;
		[from, x, y] = $(this).attr("id").split(/[_-]/);
		x = parseInt(x); y=parseInt(y);
		selection = [[x,y]];
		console.log(
			`--Action: FloodFill\n---- Where: (${x},${y})\n---- Color: ${selectedPreview.attr(
				"symbol"
			)}`
		);
		dfsFloodFill(x,y,selectedPreview.attr('symbol'));
        recordGridchange();
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

// Change the class of the selected cells to the clicked symbol
function fillSelected() {
	var selectedPreview = $("#symbol_picker").find(".selected-symbol-preview");
	// remove old color and add new color
	let minx = 1000,
		miny = 1000,
		maxx = -1,
		maxy = -1;
	let color = selectedPreview.attr("symbol");

	$("#test_output_grid .cell_final.ui-selectee.ui-selected").each(function () {
		$(this).removeClass(function (index, className) {
			return (className.match(/(^|\s)symbol_\S+/g) || []).join(" ");
		});
		$(this).addClass("symbol_" + color);
		[from, x, y] = $(this).attr("id").split(/[_-]/);
		x = parseInt(x);
		y = parseInt(y);
		minx = Math.min(x, minx);
		maxx = Math.max(x, maxx);
		miny = Math.min(y, miny);
		maxy = Math.max(y, maxy);
	});
	if (maxx === -1) return;
	moveDescript = "Fill";
	wasMoveRotFlip = false;

    recordGridchange();
	selection = [[minx,miny],[maxx,maxy], color];
	console.log(
		`-- Action: Fill\n---- Where: (${minx},${miny}) ~ (${maxx},${maxy})\n---- Color: ${color}`
	);
}

function disableTools() {
	$("#clockrotate").hide();
	$("#counterclockrotate").hide();
	$("#xflip").hide();
	$("#yflip").hide();

	disableEditable();
	disableSelectable();
	disableFloodFill();
}

function disableEditable() {
	$("#symbol_picker").find(".symbol_preview").off("click");
	$("#test_output_grid").off("click", ".cell_final");
}

function disableSelectable() {
	try {
		removeSelectedClass()
		$(".user_interact").selectable("destroy");
	} catch (e) {}
}

function disableFloodFill(){
	$("#symbol_picker").find(".symbol_preview").off("click");
	$("#test_output_grid").off("click", ".cell_final");
}

function getCurrentArray(){
	let cells = document.querySelectorAll("#test_output_grid .cell_final");
	const rows = document.querySelectorAll("#test_output_grid .row");

	const rownum = rows.length;
	const colnum = cells.length / rownum;
	let numbersArray = [];
	for (let i = 0; i < rownum; i++) {
		const rowArray = [];

		for (let j = 0; j < colnum; j++) {
			const index = i * colnum + j;
			const div = cells[index];

			const className = div.className;
			const number = className.split("symbol_")[1]; // Extract the number after "symbol_"
			rowArray.push(parseInt(number)); // Convert the number to an integer and store it in the row array
		}

		numbersArray.push(rowArray); // Store the row array in the main array
	}
	return numbersArray;
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
	$("#test_output_grid .cell_final").attr("class", "cell_final symbol_0");

	const divs = document.querySelectorAll("#test_output_grid .cell_final");
	const rows = document.querySelectorAll("#test_output_grid .row");
	const rownum = rows.length;
	const colnum = divs.length / rows.length;

	//var array = [];
	//array = createArray(rownum, colnum);
	console.log(`-- Action: Reset Grid`);

	enableSelectable();
	labelText = "Critical";
	moveDescript = "ResetGrid";
	selection = [[rownum,colnum]];
	recordGridchange();
	// final = pushToTargetArray(array, labelText, moveDescript, final)
}

$("#resetBtn").on("click", function () {
	// Call the resetOutputGrid() function when the button is clicked
	resetOutputGrid();
});

function resizeOutputGrid() {
	// Get the input value
	var rows = parseInt($("#output_grid_height").val());
	var cols = parseInt($("#output_grid_width").val());
	if( !rows || !cols || rows>30 || cols > 30) return;

	const numbersArray = createArray(rows, cols);
	array = createArray(rows, cols);

	if (rows > cols) {
		n = rows;
		$("#test_output_grid").css("width", (fullGridSize * cols) / rows);
	} else {
		n = cols;
		$("#test_output_grid").css("width", fullGridSize);
	}
	$("#test_output_grid").data("height", rows);
	$("#test_output_grid").data("width", cols);

	var grid = document.getElementById("test_output_grid");
	grid.innerHTML = "";

	for (var i = 0; i < rows; i++) {
		var row = document.createElement("div");
		row.className = "row justify-content-center";
		for (var j = 0; j < cols; j++) {
			var cell = document.createElement("div");
			cell.className = "cell_final symbol_0";
			cell.id = "cell_" + i + "-" + j;
			cell.style.width = (fullGridSize - 1) / n + "px";
			cell.style.height = (fullGridSize - 1) / n + "px";
			row.appendChild(cell);
		}
		grid.appendChild(row);
	}
	// Log the input value to the console
	console.log(`-- Action: Resize Grid\n---- Size: ${rows} x ${cols}`);
	labelText = "Critical";
	moveDescript = "ResizeGrid";
	final = pushToTargetArray(array, labelText, moveDescript,[[rows,cols]], final);
	moveDescript = "";
	selection = [];
	enableSelectable();
	resetHistoryStack();
	cell_observer();
}

function copyFromInput() {
	//console.log(testgrid[0])
	rows = testgrid[0].height;
	cols = testgrid[0].width;
	if (rows > cols) {
		n = rows;
		$("#test_output_grid").css("width", (fullGridSize * cols) / rows);
	} else {
		n = cols;
		$("#test_output_grid").css("width", fullGridSize);
	}
	$("#output_grid_height").val(rows);
    $("#output_grid_width").val( cols);
	$("#test_output_grid").data("height", rows);
	$("#test_output_grid").data("width", cols);
	var userInteractDiv = document.getElementById("test_output_grid");

	userInteractDiv.innerHTML = "";

	for (var i = 0; i < rows; i++) {
		var rowDiv = document.createElement("div");
		rowDiv.className = "row justify-content-center";

		for (var j = 0; j < cols; j++) {
			var cellDiv = document.createElement("div");
			cellDiv.className = "cell_final symbol_" + testgrid[0].grid[i][j];
			cellDiv.id = "cell_" + i + "-" + j;
			cellDiv.style.width = (fullGridSize - 1) / n + "px"; // Set the desired width of each cell
			cellDiv.style.height = (fullGridSize - 1) / n + "px"; // Set the desired height of each cell

			rowDiv.appendChild(cellDiv);
		}

		userInteractDiv.appendChild(rowDiv);
	}

	enableSelectable();
	console.log(`-- Action: Copy From Input`);
	labelText = "Critical";
	moveDescript = "CopyFromInput";
	final = pushToTargetArray(
		testgrid[0].grid,
		labelText,
		moveDescript,
		selection,
		final
	);
	moveDescript = "";
	selection = [];
	resetHistoryStack();
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
	const divs = document.querySelectorAll("#test_output_grid .cell_final");
	const rows = document.querySelectorAll("#test_output_grid .row");
	const rownum = rows.length;
	const colnum = divs.length / rownum;

	// console.log(divs[0].className)
	// console.log(rownum)
	// console.log(divnum/rownum)

	const numbersArray = getCurrentArray();

	User_Answer = numbersArray.map((num) => parseInt(num));
	Actual_Answer = input[1].grid.flat().map((num) => parseInt(num));

	for (let i = 0; i < input[1].grid.length; i++) {
		for (let j = 0; j < input[1].grid[i].length; j++) {
			// Convert the value to an integer using parseInt()
			input[1].grid[i][j] = parseInt(input[1].grid[i][j]);
		}
	}

	//console.log(cRoute)
	var lastPart = cRoute.substring(cRoute.lastIndexOf("/") + 1);
	var incrementedValue = parseInt(lastPart, 10) + 1;
	const competition_stage = [6097,6268,6303,6241,6247,6309,6271,6490,6299,6291,6410,6186,6227,5952,5971,5978,5983,6015,6018,6021,6022,6026,6033,6048,6055]
	
	
	if (competition_stage.indexOf(incrementedValue)!=-1) { //Only for competition_stage part. For future work, we have to edit it as a random.
		incrementedValue+=1
		if (incrementedValue==6022){
			incrementedValue+=1
		}
	}

	// Convert the incremented value back to a string
	var incrementedLastPart = incrementedValue.toString();

	answer = compareArrays(numbersArray, input[1].grid);
	console.log(
		`-- Action: Submit\n---- Input:`,
		numbersArray,
		`\n---- Answer: `,
		input[1].grid,
		`\n---- Correct: ${answer}`
	);
	final = pushToTargetArray(numbersArray,'Critical','Submit',[answer],final);
	final = {'success': answer ,'subtask': CURRENT_SUBPROBLEM,'taskcount': TOTAL_SUBPROBLEMS, 'trace': final}
	if (answer) {
		sendLogData(final);
		final = [];
		COPIED_ARRAY = [];
        historyStack = [];
		alert("Success!");
		if (CURRENT_SUBPROBLEM+1 < TOTAL_SUBPROBLEMS){
			window.location.href = "/task/" + name + "/" + (incrementedValue-1) +"?subp="+(CURRENT_SUBPROBLEM+1);
		} else {
			window.location.href = "/task/" + name + "/" + incrementedLastPart;
		}
	} else {
		sendLogData(final);
		alert("Wrong!");
		final = []; // Do not remove!!!
		copyFromInput();
		final = [];
        resetHistoryStack();
		COPIED_ARRAY = [];
	}
}

function IQsubmitSolution(input, name, cRoute) {
	// console.log("hi")

	const divs = document.querySelectorAll("#test_output_grid .cell_final");
	const rows = document.querySelectorAll("#test_output_grid .row");
	const rownum = rows.length;
	const colnum = divs.length / rownum;

	const numbersArray = [];
	for (let i = 0; i < rownum; i++) {
		const rowArray = [];

		for (let j = 0; j < colnum; j++) {
			const index = i * 5 + j;
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

	//console.log(numbersArray)
	//console.log(input.grid)
	//console.log(input[1].grid.flat()) // 이 친구가 답임 ㅋㅋ
	console.log(cRoute);
	var lastPart = cRoute.substring(cRoute.lastIndexOf("/") + 1);
	var incrementedValue = parseInt(lastPart, 10) + 1;

	// Convert the incremented value back to a string
	var incrementedLastPart = incrementedValue.toString();

	console.log(User_Answer);
	console.log(Actual_Answer);
	answer = compareArrays(numbersArray, input[1].grid);
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

	return { height, width, minX,minY,maxX,maxY };
}

// Function to save the selected cells or symbols in a rectangle
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

/*
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
*/

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

	$("#test_output_grid .cell_final.ui-selected").each(function () {
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
	//console.log("new_rec", new_rec)

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
function openMiniARCTasklist() {
    //$("#ARC_task_side_nav").hide()
    //$("#ARC_task_list").hide();
	$("#sidenav_overlay").fadeIn('0.2s');

    $("#mini_ARC_task_side_nav").addClass('open');
	$("#ARC_task_side_nav").removeClass('open')
	$("#sidenav_overlay").on('click', function(){
		$("#mini_ARC_task_side_nav").removeClass('open');
		$("#sidenav_overlay").fadeOut('0.2s');
	})
    

    //$("#mini_ARC_task_list").show();
    //$("#mini_ARC_task_side_nav").width("250px");
    //$("#mini_ARC_task_list").width("250px");
    //$("#container-fluid").css('margin-left', '250px');
}

function openARCTasklist() {
	$("#sidenav_overlay").fadeIn('0.2s');
    $("#ARC_task_side_nav").addClass('open');
	$("#mini_ARC_task_side_nav").removeClass('open')
	$("#sidenav_overlay").on('click', function(){
		$("#ARC_task_side_nav").removeClass('open');
		$("#sidenav_overlay").fadeOut('0.2s');
	})
    //$("#ARC_task_list").show();
    //$("#mini_ARC_task_side_nav").hide();
    //$("#mini_ARC_task_list").hide();
    //$("#ARC_task_side_nav").width("250px");
    //$("#ARC_task_list").width("250px");
    //$("#container-fluid").css('margin-left', '250px');
}

function closeMiniARCTaskList() {
	$("#mini_ARC_task_side_nav").removeClass('open')

   // $("#mini_ARC_task_side_nav").hide();
    //$("#container-fluid").css('margin-left', '0');
}

function closeARCTaskList() {
	$("#ARC_task_side_nav").removeClass('open');

    //$("#ARC_task_side_nav").hide();
    //$("#container-fluid").css('margin-left', '0');
}
