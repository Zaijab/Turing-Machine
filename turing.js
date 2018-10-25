
// List of the indices of cells with 1's in them
var tape_contents = [];
var tape_range = [-21, 21];
var range_radius = (tape_range[1] - tape_range[0])/2;
var reader_position = 0;
var internal_state = 1;
var program = [];
var exec = {};
var steps_executed = 0;
var allow_execution = true;
var grid_tape = null;
var grid_ctx = null;
var grid_cell_size = 2;

function initialize() {
    grid_tape = document.getElementById("grid_tape");
    grid_ctx = grid_tape.getContext("2d");
}

function help(action) {
    if (action == 'show') {
	var man_page = document.createElement('div');
	man_page.id = "man-page";
	man_page.className = "man_page";
	man_page.innerHTML = man_page_text[1];
	document.body.appendChild(man_page);
    } else if (action == 'hide') {
	var man_page = document.getElementById('man-page');
	man_page.parentNode.removeChild(man_page);
    } else {
	var man_page = document.getElementById('man-page');
	man_page.innerHTML = man_page_text[action];
    }
}

function set_tape_config() {
    var config = document.getElementById("tape_config").value;
    var pairs = config.split(';');
    reset('tape');
    for (var i = 0; i < pairs.length; i++) {
	var p = pairs[i].split(',');
	var start = parseInt(p[0]);
	var length = parseInt(p[1]);
	for (var j = 0; j < length; j++) {
	    tape_contents.push(start + j);
	}
    }
    set_display();
}

function create_cell(index) {
    var cell_wrapper = document.createElement('div');
    cell_wrapper.id = "cell_wrapper." + index;
    cell_wrapper.style.display = "inline";
    cell_wrapper.width = "32px";
    var cell = document.createElement('div');
    cell.className = "cell";
    cell.id = "cell." + index;
    cell.onclick = function () {toggle_cell(index);};
    if (tape_contents.indexOf(index) != -1) {
	cell.innerHTML = '1';
    } else {
	cell.className += " dark";
	cell.innerHTML = 'B';
    }
    cell_wrapper.appendChild(cell);
    return cell_wrapper;
}

function toggle_cell(index) {
    var cell = document.getElementById("cell." + index);
    var contents = document.createElement('span');
    if (tape_contents.indexOf(index) != -1) {
	tape_contents.splice(tape_contents.indexOf(index), 1)
    } else {
	tape_contents.push(index);
    }
    set_display();
}

function create_tape() {
    var tape = document.createElement('div');
    var reader = document.createElement('div');
    tape.id = "tape";
    for (var i = tape_range[0]; i < tape_range[1]; i++) {
	tape.appendChild(create_cell(i));
	var reader_space = document.createElement('div');
	reader_space.className = "reader_cell";
	reader_space.id = "reader_space." + i;
	reader.appendChild(reader_space);
    }
    return [reader, tape];
}

function create_reader() {
    for (var i = tape_range[0]; i < tape_range[1]; i++) {
	var reader_space = document.getElementById("reader_space." + i);
    }
    if (reader_position >= tape_range[0] && reader_position < tape_range[1]) {
	var reader_space = document.getElementById("reader_space." + reader_position);
	reader_space.innerHTML = "<span style='color: #66FF33;'>V</span>";
	reader_space.style.cursor = "pointer";
	reader_space.onclick = function () {reset("reader");};
    }
}

function create_info() {
    var info = document.createElement('div');
    info.style.paddingTop = "10px";
    var int_state = document.createElement('span');
    int_state.innerHTML = "INTERNAL STATE: " + internal_state + "<br/>";
    //int_state.style.display = "inline-block";
    info.appendChild(int_state);
    var count = document.createElement('span');
    count.innerHTML = "COUNT: " + tape_contents.length + "<br/>";
    //count.style.display = "inline-block";
    info.appendChild(count);
    var range = document.createElement('span');
    range.innerHTML = "TAPE RANGE: " + tape_range[0] + " to ";
    range.innerHTML += tape_range[1] + "<br/>";
    //range.style.display = "inline-block";
    info.appendChild(range);
    return info;
}

function draw_pixel(color,x, y, size) {
    grid_ctx.fillStyle = color;
    grid_ctx.fillRect(x, y, size, size);
}

function draw_grid_tape() {
    grid_ctx.clearRect(0, 0, 500, 40);
    var modulus = 500/grid_cell_size;
    for (var i = 0; i < tape_contents.length; i++) {
	var x = grid_cell_size*((tape_contents[i]) % modulus);
	var y = grid_cell_size*Math.floor((tape_contents[i])/modulus);
	draw_pixel("#66FF33", x, y, grid_cell_size);
    }
    var x = grid_cell_size*(reader_position % modulus);
    var y = grid_cell_size*Math.floor((reader_position)/modulus);
    draw_pixel("#FF0000", x, y, grid_cell_size);
}

function set_display() {
    var display = document.getElementById("display");
    display.innerHTML = "";
    var x = create_tape();
    display.appendChild(x[0]);
    display.appendChild(x[1]);
    create_reader();
    display.appendChild(create_info());
    draw_grid_tape();
}

function get_program() {
    allow_execution = true;
    var source = document.getElementById("code").value.split("\n");
    program = [];
    for (var i = 0; i < source.length; i++) {
	var line = source[i].split('#')[0].trim().split(' ');
	if (line.length == 5) {
	    if (line.join('').indexOf('.') != -1) {
		alert("You cannot use the symbol '.' in your program");
		return 0;
	    } else {
		program.push(line);
	    }
	} else if (source[i].split('#')[0].trim().length == 0) {
	    continue;
	} else {
	    alert("The line " + source[i] + " is not properly written");
	    return 0;
	}
    }
    exec = {};
    for (var i = 0; i < program.length; i++) {
	line = program[i];
	var id = line[0] + "." + line[1];
	exec[id] = [line[2], line[3]]
	if (line[4] == 'L') {
	    exec[id].push(-1);
	} else if (line[4] == 'R') {
	    exec[id].push(1);
	} else {
	    alert('The symbol ' + line[4] + ' is not valid.  Use L or R');
	}
    }
}

function reset(target) {
    if (target == 'tape') {
	tape_contents = [];
	set_display();
    } else if (target == 'code') {
	document.getElementById("code").value = default_code_comments;
    } else if (target == 'reader') {
	reader_position = 0;
	tape_range = [-range_radius, range_radius];
	set_display();
    }
}

function stop_program() {
    allow_execution = false;
}

function run_program() {
    allow_execution = true;
    var max_steps = parseInt(document.getElementById("max_steps").value);
    while (internal_state != 0 && allow_execution) {
	var is_one = tape_contents.indexOf(reader_position) != -1;
	var symbol = "B";
	if (is_one) {
	    symbol = "1";
	}
	var id = internal_state + "." + symbol;
	var command = exec[id]
	if (!exec.hasOwnProperty(id)) {
	    alert("No behavior is defined for internal state " + internal_state + " with cell contents " + symbol);
	    internal_state = 1;
	    steps_executed = 0;
	    return 0;
	}
	if (is_one && command[1] == "B") {
	    tape_contents.splice(tape_contents.indexOf(reader_position), 1);
	} else if (!is_one && command[1] == "1") {
	    tape_contents.push(reader_position);
	}
	internal_state = command[0];
	reader_position += command[2];
	if (reader_position >= tape_range[1] - 1) {
	    tape_range[0] += 1;
	    tape_range[1] += 1;
	}
	if (reader_position <= tape_range[0] + 1) {
	    tape_range[0] -= 1;
	    tape_range[1] -= 1;
	}
	steps_executed += 1;
	if (steps_executed >= max_steps) {
	    break;
	}
    }
    set_display();
    if (steps_executed < max_steps) {
	internal_state = 1;
    }
    steps_executed = 0;
    allow_execution = true;
}

function step_program() {
    var time = parseInt(document.getElementById("time").value);
    var max_steps = parseInt(document.getElementById("max_steps").value);
    if (internal_state != 0) {
	var is_one = tape_contents.indexOf(reader_position) != -1;
	var symbol = "B";
	if (is_one) {
	    symbol = "1";
	}
	var id = internal_state + "." + symbol;
	var command = exec[id]
	if (!exec.hasOwnProperty(id)) {
	    alert("No behavior is defined for internal state " + internal_state + " with cell contents " + symbol);
	    internal_state = 1;
	    steps_executed = 0;
	    return 0;
	}
	if (is_one && command[1] == "B") {
	    tape_contents.splice(tape_contents.indexOf(reader_position), 1);
	} else if (!is_one && command[1] == "1") {
	    tape_contents.push(reader_position);
	}
	internal_state = command[0];
	reader_position += command[2];
	if (reader_position >= tape_range[1] - 1) {
	    tape_range[0] += 1;
	    tape_range[1] += 1;
	}
	if (reader_position <= tape_range[0] + 1) {
	    tape_range[0] -= 1;
	    tape_range[1] -= 1;
	}
	set_display();
	steps_executed += 1;
	if (max_steps > steps_executed && allow_execution) {
	    setTimeout(function () {step_program();}, time);
	} else {
	    steps_executed = 0;
	    allow_execution = true;
	}
    } else {
	internal_state = 1;
	steps_executed = 0;
	allow_execution = true;
    }
}



var default_code_comments = `# Enter your program here.
#
# The following comments and sample program
# can all be deleted.
#
# A command has the following form:
# q s p t d
# where q is the name of an internal state
# s is a symbol (either 1 or B)
# p is the name of an internal state
# t is a symbol (either 1 or B)
# and d is a direction (either L or R).
# The way to interpret the command q s p t d
# is that if you are in internal state q and
# the current cell has symbol s, then go to
# internal state p, write the symbol t to the
# current cell and move one cell either (L)eft
# (if d == L) or (R)ight (if d == R).
#
# Each of the 5 components of a command must
# be separated by a single space.
#
# You can use any names for internal state,
# although you must use 1 for the starting
# state and 0 for the final state and you may
# not use the symbol . anywhere.  Also, any
# additional spaces will cause the command to
# be misinterpretted.
#
# The sample program below is f(x) = 3x.
# The input, x, should be represented as x+1
# consecutive ones on the tape.  The output,
# 3x, will be written as 3x consecutive ones
# on the tape.

1 1 b B R
1 B 0 B R
b 1 3 B R
b B c B L
c 1 0 B R
c B 0 B R
3 1 3 1 R
3 B 4 B R
4 1 4 1 R
4 B r 1 R
r B 5 1 R
5 B 6 1 L
6 1 6 1 L
6 B 7 B L
7 B 0 B R
7 1 8 1 L
8 1 8 1 L
8 B b B R`;

var man_page_text = ['nothing, tipota, nada, zilch',
`
<div onclick="help('hide')" style="cursor: pointer; color: #3366FF;">Close Help</div>

Some explanation of the the Turing Machine simulator.<br/><br/>

The first two elements of the interface are representations of the tape which is read and edited by the Turing machine.  The second element shows individual cells which either contain a B or a 1.  You can toggle between these two states by clicking on the cell.  Right above one of the cells is a V which indicates the position of the Turing machine's reading head.  Clicking on the reading head will restore it to the 0 position.<br/><br/>

The first display is a much more compact representation of the tape.  In this display, each cell is represented as 2px x 2px block.  Each row wraps to the next row.  For example, the first row shows cells 0 through 124 and the second row shows cells 125 through 249.  The position of the reading head is indicated by a red block of pixels.<br/><br/>

<div>Help page <span onclick="help(1)" style="cursor: pointer; color: #3366FF;">1</span>&nbsp;<span onclick="help(2)" style="cursor: pointer; color: #3366FF;">2</span>&nbsp;<span onclick="help(3)" style="cursor: pointer; color: #3366FF;">3</span>&nbsp;<span onclick="help(4)" style="cursor: pointer; color: #3366FF;">4</span>&nbsp;<span onclick="help(5)" style="cursor: pointer; color: #3366FF;">5</span></div>
`,
`
<div onclick="help('hide')" style="cursor: pointer; color: #3366FF;">Close Help</div>
Some explanation of the the Turing Machine simulator.<br/><br/>

Just below the two representations of the tape are some readouts of properties of the tape, Turing machine and the two displays.  'Internal state' displays the current internal state of the Turing machine program being executed.  'Count' is the number of cells currently set to 1 (as opposed to being blank).  'Tape range' shows the range of cells currently visible in the second of the two tape representations.<br/><br/>

Below the readouts are two buttons.  The first sets all cells on the tape to blank.  This is useful for resetting the tape after executing a program.  The second button resets the code editing box below (see page 3 for details) to the default comments and program.  Be careful, this button is a good way to lose the program you are writing!  Below the two buttons is a text entry box and a button to execute the instructions in the text entry box.  This is for setting the tape to a configuration that would be tedious to do by hand.  The syntax for using this is as follows: n_0,l_0;n_1,l_1;...;n_k,l_k will write a block of l_i 1's starting at cell n_i for each i less than or equal to n.<br/><br/>

<div>Help page <span onclick="help(1)" style="cursor: pointer; color: #3366FF;">1</span>&nbsp;<span onclick="help(2)" style="cursor: pointer; color: #3366FF;">2</span>&nbsp;<span onclick="help(3)" style="cursor: pointer; color: #3366FF;">3</span>&nbsp;<span onclick="help(4)" style="cursor: pointer; color: #3366FF;">4</span>&nbsp;<span onclick="help(5)" style="cursor: pointer; color: #3366FF;">5</span></div>
`,
`
<div onclick="help('hide')" style="cursor: pointer; color: #3366FF;">Close Help</div>
Some explanation of the the Turing Machine simulator.<br/><br/>

The main feature of the interface is the large text entry area below the tape configuration interface.  The text entry area is for entering the instructions for the Turing machine.  First, note that all the default text can be deleted.  The instructions should each be entered on a separate line and consist of 5 components, each separated by a single space.  In order, the components are:<br/>
(1) current internal state<br/>
(2) contents of current cell<br/>
(3) next internal state<br/>
(4) the new value for the current cell<br/>
(5) the direction in which to move the reading head (left or right).<br/>
As an example<br/>
q 1 5 B L<br/>
would instruct the machine to go to internal state 5, write a blank to the current cell and move the reading head left if the current internal state is q and the content of the current cell is a 1.<br/><br/>

The names for internal states can use any characters except the period and the space.  The initial state must be called 1 and the final state 0.<br/><br/>

Inline comments as well as commented out lines should simply begin with a #.<br/><br/>


<div>Help page <span onclick="help(1)" style="cursor: pointer; color: #3366FF;">1</span>&nbsp;<span onclick="help(2)" style="cursor: pointer; color: #3366FF;">2</span>&nbsp;<span onclick="help(3)" style="cursor: pointer; color: #3366FF;">3</span>&nbsp;<span onclick="help(4)" style="cursor: pointer; color: #3366FF;">4</span>&nbsp;<span onclick="help(5)" style="cursor: pointer; color: #3366FF;">5</span></div>
`,
`
<div onclick="help('hide')" style="cursor: pointer; color: #3366FF;">Close Help</div>
Some explanation of the the Turing Machine simulator.<br/><br/>

After the code entry text area, there are three buttons are two text entry boxes.  The first text entry box allows you to specify the maximum number of computation steps the Turing machine is allowed to execute.  Since many instruction sets never terminate when executed, it is important to have an upper bound on how long the program can run.  The second box allows you to specify the amount of time between computation steps.  A slow speed will allow you to see exactly what the machine is doing, thereby helping with debugging.  A fast speed can be fun!<br/><br/>

The 'run' button will simply run the program until it terminates or the maximum number of computation steps is reached without updating the tape displays or information readouts at the top of the page until execution stops.  This is the fastest way to execute a Turing machine.<br/><br/>

The 'step' button will run your Turing machine, but will update the displays at each computation step, using the time per step as the delay between updates.<br/><br/>

Finally, the 'stop' button stops the program, but leaves the internal state and reading head exactly where they were when the stop button was pressed.  This allows you to pick up again exactly where you left off.<br/><br/>


<div>Help page <span onclick="help(1)" style="cursor: pointer; color: #3366FF;">1</span>&nbsp;<span onclick="help(2)" style="cursor: pointer; color: #3366FF;">2</span>&nbsp;<span onclick="help(3)" style="cursor: pointer; color: #3366FF;">3</span>&nbsp;<span onclick="help(4)" style="cursor: pointer; color: #3366FF;">4</span>&nbsp;<span onclick="help(5)" style="cursor: pointer; color: #3366FF;">5</span></div>
`,
`
<div onclick="help('hide')" style="cursor: pointer; color: #3366FF;">Close Help</div>
Some hints and bug reporting.<br/><br/>

Turing machines can, of course, be interpretted and implemented in different ways.  A typical way to represent an input of natural number n for a Turing machine is as a block of n+1 consecutive 1's in the tape, and all other cells blank.  Formally, to give a function two inputs, you should use Godel encoding to bundle the two inputs as one.  Often, however, one simply writes inputs n and k to the tape as a block of n+1 1's followed by a single blank cell and then a block of k+1 1's, with all other cells blanks.<br/><br/>

<div>Help page <span onclick="help(1)" style="cursor: pointer; color: #3366FF;">1</span>&nbsp;<span onclick="help(2)" style="cursor: pointer; color: #3366FF;">2</span>&nbsp;<span onclick="help(3)" style="cursor: pointer; color: #3366FF;">3</span>&nbsp;<span onclick="help(4)" style="cursor: pointer; color: #3366FF;">4</span>&nbsp;<span onclick="help(5)" style="cursor: pointer; color: #3366FF;">5</span></div>
`]
