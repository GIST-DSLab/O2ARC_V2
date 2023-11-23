# O2ARC_V2

### Getting Started

This project is based on Node.js + SQLite

```bash
--app.js
|-- bin
|   `-- www
|-- db
|   |-- O2ARC.db --> Our Main DB
|   |-- db.js --> 
|   |-- dbin.js --> These two db__.js files intializeds DB. MUST NOT BE EXCUTED!
|   |-- evaluation.json 
|   |-- logs.json
|   |-- sql.js
|   |-- tasklist.json
|   `-- testsets.json --> backup json files
|-- package-lock.json
|-- package.json
|-- public
|   |-- images
|   |   |-- background.png
|   |   `-- korea_mark.png
|   |-- javascripts
|   |   |-- logic_function.js --> This js file contains backend logic functions.
|   |   `-- testing_interface.js
|   `-- stylesheets
|       |-- common.css
|       |-- style.css
|       `-- testing_interface.css
|-- routes --> SERVER LOGIC + DB LOGIC
|   |-- index.js --> Main homepage routing
|   |-- problemset.js --> Problem Set page routing
|   `-- users.js 
`-- views
    |-- error.ejs --> 404 PAGE TEMPLATE 
    |-- index.ejs --> MAIN LOGIN PAGE TEMPLATE
    `-- problem_set.ejs --> QUESTION SET SELECTION TEMPLATE
    
    
 ### Main Logic and Function Flow Chart

 #hi

```

### Data Structure


Current Data Structure.

If there not exist newly selected pixels, `[],[]` will be inserted as a bounding box instead of `[x_min, y_min], [x_max, y_max]`.
<table>
    <tr>
        <th>Tool
        <th>Operation
        <th>Info
    </tr>
    <tr>
        <td rowspan=4> Critical
        <td> CopyFromInput
        <td> <code>[]</code>
    </tr>
    <tr>
        <td> ResizeGrid
        <td rowspan=2> <code>[[H, W]]</code>
    </tr>
    <tr>
        <td> ResetGrid
    </tr>
    <tr>
        <td> Submit
        <td> <code>[succeed]</code>
    </tr>
    <tr>
        <td rowspan=3> Edit
        <td> Color
        <td> <code>[[x, y], color]</code>
    </tr>
        <td> Undo
        <td> <code>[]</code>
    </tr>
    <tr>
        <td> Redo
        <td> <code>[]</code>
    </tr>
    <tr>
        <td rowspan=8> Select
        <td> Fill
        <td> <code>[[x_min, y_min], [x_max, y_max], color]</code>
    </tr>
    <tr>
        <td> FlipX
        <td rowspan=4> <code>[[x_min, y_min], [x_max, y_max]]</code>
    </tr>
    <tr>
        <td> FlipY
    </tr>
    <tr>
        <td> RotateCW
    </tr>
    <tr>
        <td> RotateCCW
    </tr>
    <tr>
        <td> Move
        <td> <code>[[x_min, y_min], [x_max, y_max], direction]</code>
    </tr>
    <tr>
        <td> Copy
        <td > <code>[[x_min, y_min], [x_max, y_max], grid_source]</code>
    </tr>
    <tr>
        <td> Paste
        <td > <code>[[x, y]]</code>
    </tr>
    <tr>
        <td> Flood fill
        <td> FloodFill
        <td> <code>[[x, y], color]</code>
    </tr>
        
</table>

Before Sep. 2023.

`action_sequence` is a list of `[Tool, Operation, Info, Grid]`. The possible combinations of each element are listed as a table below.

- `Grid` is 2D Array consist of numbers (0~9).
- `succeed` is boolean value which indicates the submit was correct.
- `direction` is one of "U", "D", "R", and "L".
- `grid_source` indicates which source grid was copied. One of "Input Grid" and "Output Grid".
- **`x` is row index, and `y` is column index.** Be aware that `x` doesn't mean horizontal position.

<table>
    <tr>
        <th>Tool
        <th>Operation
        <th>Info
    </tr>
    <tr>
        <td rowspan=4> Critical
        <td> CopyFromInput
        <td> <code>[]</code>
    </tr>
    <tr>
        <td> ResizeGrid
        <td rowspan=2> <code>[[H, W]]</code>
    </tr>
    <tr>
        <td> ResetGrid
    </tr>
    <tr>
        <td> Submit
        <td> <code>[succeed]</code>
    </tr>
    <tr>
        <td > Edit
        <td> Color
        <td> <code>[[x, y]]</code>
    </tr>
    <tr>
        <td rowspan=8> Select
        <td> Fill
        <td rowspan=5> <code>[[x_min, y_min], [x_max, y_max]]</code>
    </tr>
    <tr>
        <td> FlipX
    </tr>
    <tr>
        <td> FlipY
    </tr>
    <tr>
        <td> RotateCW
    </tr>
    <tr>
        <td> RotateCCW
    </tr>
    <tr>
        <td> Move
        <td> <code>[[x_min, y_min], [x_max, y_max], direction]</code>
    </tr>
    <tr>
        <td> Copy
        <td > <code>[[x_min, y_min], [x_max, y_max], grid_source]</code>
    </tr>
    <tr>
        <td> Paste
        <td > <code>[[x, y]]</code>
    </tr>
    <tr>
        <td> Flood fill
        <td> FloodFill
        <td> <code>[[x, y]]</code>
    </tr>
        
</table>


