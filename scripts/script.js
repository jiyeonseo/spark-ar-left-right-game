//==============================================================================
// 
// Simple Game using FaceGestures (isTurnedLeft, isTurnedRight)
// Get score when the face turns same direction. 
//
//==============================================================================

const Scene = require('Scene');
const Time = require('Time');
const FaceGestures = require('FaceGestures');
const FaceTracking = require('FaceTracking');
const TouchGestures = require('TouchGestures');

const face = FaceTracking.face(0);

const tap_to_start_text_node = Scene.root.find('start_text');
const main_text_node = Scene.root.find('main_text');

const score_text_node = Scene.root.find('score_text');

const remain_time_node = Scene.root.find('time_rectangle');
const screen = Scene.root.find('canvas0');

let blink = false;

// For Start Text
let blinkerTimer = Time.setInterval(function () {
    blink = !blink;
    tap_to_start_text_node.hidden = blink;
}, 700);

function startBlink(text) {
    tap_to_start_text_node.text = text;
    blinkerTimer = Time.setInterval(function () {
        blink = !blink;
        tap_to_start_text_node.hidden = blink;
    }, 700);
}

// First instruction 
let firstPlay = true;
function firstInstruction() {
    
    const instruction_node1 = Scene.root.find('instruction_rec0');
    const instruction_node2 = Scene.root.find('instruction_rec1');

    firstPlay = false;
    instruction_node1.hidden = false;
    instruction_node2.hidden = false;
    tap_to_start_text_node.hidden = true;

    const timeoutTimer = Time.setTimeout(function () {
        instruction_node1.hidden = true;
        instruction_node2.hidden = true;
        tap_to_start_text_node.hidden = true;
        score_text_node.hidden = false;
        main_text_node.hidden = false;
        startCountdown();
    }, 2000);
}

// Ready 3, 2, 1
function startCountdown() {
    let starting = 3;
    const countdownTimer = Time.setInterval(function () {
        main_text_node.text = starting + "";
        if (starting == 0) {
            Time.clearInterval(countdownTimer);
            startGame();
        }
        starting--;
    }, 1000);
}

// init time/score/status
let timer = 100;
let score = 0;
let playing = false;
let timeover = false;


// tap to start / restart 
TouchGestures.onTap(screen).subscribe(function () {
    tap_to_start_text_node.hidden = true;
    Time.clearInterval(blinkerTimer);
    if (firstPlay) {
        firstInstruction();
    } else {
        remain_time_node.transform.scaleX = 1;
        timer = 100;
        score = 0;
        score_text_node.text = "0";
        timeover = false;
        playing = false;

        startCountdown();
    }
});

let direction = null;

function startGame() {
    const gameTimer = Time.setInterval(function () {
        if (timer < 1) {
            Time.clearInterval(gameTimer);
            main_text_node.text = "Game Over";
            timeover = true;
            startBlink('Tap to restart');
        } else {
            if (!playing) {
                playing = true;
                direction = getRandomDirection();
                main_text_node.text = direction == 0 ? 'left' : 'right';
            }
        }
        timer--;
        remain_time_node.transform.scaleX = (timer / 100);
    }, 100);
}

FaceGestures.isTurnedLeft(face).monitor().subscribe(function (changedValue) {
    if (timeover === false && changedValue.newValue && direction === 0) {
        answerCorrect();
    }
});

FaceGestures.isTurnedRight(face).monitor().subscribe(function (changedValue) {
    if (timeover === false && changedValue.newValue && direction === 1) {
        answerCorrect();
    }
});

// game modules

function answerCorrect() {
    playing = false;
    score += 10;
    score_text_node.text = score.toString();
    showGreen();
    direction = null;
}

function showGreen() {
    const green_o_node = Scene.root.find('flag_text');
    green_o_node.hidden = false;
    Time.setTimeout(function () {
        green_o_node.hidden = true;
    }, 200);
}

function getRandomDirection() { // 0 or 1 
    return Math.floor(Math.random() * 2);
}

