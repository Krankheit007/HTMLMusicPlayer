var audio = document.getElementsByTagName("audio")[0];
var button = document.getElementById("play-pause").getElementsByTagName('i')[0];

var bar = document.getElementsByClassName("progress_bar")[0];
var progress = document.getElementsByClassName("progress")[0];
var slide = document.getElementsByClassName("progress_button")[0];
var songtime = document.getElementsByClassName("SongTime")[0];
var length = 480;

var canvas = document.getElementById("fft");
window.AudioContext = window.AudioContext || window.webkitAudioContext;
window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
var ctx = new window.AudioContext();
var audioSrc = ctx.createMediaElementSource(audio);
var analyser = ctx.createAnalyser();
analyser.fftSize = 2048;
audioSrc.connect(analyser);
analyser.connect(ctx.destination);
visualiser();

// 播放暂停
function playMusic(){
    if(audio.paused){
        audio.play();
        button.innerHTML="pause";
    }else{
        audio.pause();
        button.innerHTML="play_arrow";
    }
}

// 进度条主函数
function timeFormat(number) {
    var minute = parseInt(number / 60);
    var second = parseInt(number % 60);
    minute = minute >= 10 ? minute : "0" + minute;
    second = second >= 10 ? second : "0" + second;
    return minute + ":" + second;
}
function updatePro(){
    songtime.innerHTML=timeFormat(audio.currentTime)+" | "+timeFormat(total);
    var progressValue = audio.currentTime/total * length;
    progress.style.width = parseInt(progressValue) + 'px';
    slide.style.left = parseInt(progressValue-9) + 'px';
}
// 拖动进度条
var rate = 0;
slide.onmousedown = function(e){
    var x = e.clientX - this.offsetLeft;
    var jlx = 0;
    document.onmousemove = function(e){
        jlx = ((e.clientX - x)/ bar.clientWidth);
        audio.pause();
        if(jlx*100 <=100 && jlx*100 >=0) {
            slide.style.left = parseInt(jlx*length-9) + 'px';
            progress.style.width = parseInt(jlx*length) + 'px';
        };
    };
    document.onmouseup = function (e) {
        document.onmousemove = null;
        document.onmouseup = null;
        playMusic();
        rate = jlx;
    };
};
var total = audio.duration;

// 添加事件
audio.addEventListener('loadedmetadata', function(){
    total = audio.duration;
});
audio.addEventListener('timeupdate', function(){
    if(rate){
        audio.currentTime = rate * total;
        rate = 0;
    }
    updatePro();
}, false);
audio.addEventListener('ended', function(){
    progress.style.width = parseInt(0)+'px';
    slide.style.left = parseInt(-9) + 'px';
    songtime.innerHTML="00:00 | 01:00";
    button.innerHTML="play_arrow";
});

// 快退快进
function skipForward(){
    skipWard(10);
    updatePro();
}
function skipBackward(){
    skipWard(-10);
    updatePro();
}
function skipWard(value) {
    // console.log(audio.currentTime, audio.duration)
    if (audio.currentTime + value >= audio.duration) {
        audio.currentTime = audio.duration;
    } else if (audio.currentTime + value <= 0) {
        audio.currentTime = 0;
    } else {
        audio.currentTime += value;
    }
}

// 频谱图
var cw = canvas.width, ch = canvas.height;
var meterWidth = 3, gap = 2;
var meterNum = cw/8; //计算当前画布上能画多少条
var content = canvas.getContext('2d');
//定义一个渐变样式用于画图
gradient = content.createLinearGradient(0, 0, cw, 0);
gradient.addColorStop(0, '#E0FFFF');
gradient.addColorStop(0.2, '#87CEFA');
gradient.addColorStop(0.5, '#00B2EE');
gradient.addColorStop(0.8, '#87CEFA');
gradient.addColorStop(1, '#E0FFFF');

colorRe = content.createLinearGradient(0, 0, cw, 0);
colorRe.addColorStop(0, '#E6E6FA');
colorRe.addColorStop(0.2, '#EE82EE');
colorRe.addColorStop(0.5, '#DA70D6');
colorRe.addColorStop(0.8, '#EE82EE');
colorRe.addColorStop(1, '#E6E6FA');
content.globalAlpha = 0.6;

content.shadowColor = 'rgba(0,255,255,0.5)';
content.shadowBlur = 20;

function draw(array) {
    analyser.getByteFrequencyData(array);
    var step = Math.round(array.length /meterNum); //计算采样步长
    content.clearRect(0, 0, cw, ch); //清理画布准备画画
    for (var i = 0; i < meterNum; i++) {
        var value = array[i*step]*0.4;
        content.globalAlpha = 0.8;
        content.fillStyle = gradient;
        content.fillRect(cw*0.5-i*(meterWidth+gap), ch*0.5-value, meterWidth, value);
        content.fillRect((i+1)*(meterWidth+gap)+cw*0.5, ch*0.5-value, meterWidth, value);

        content.globalAlpha = 0.4;
        content.fillStyle = colorRe;
        content.fillRect(cw*0.5-i*(meterWidth+gap), ch*0.5, meterWidth, value);
        content.fillRect((i+1)*(meterWidth+gap)+cw*0.5, ch*0.5, meterWidth, value);

        content.fill();
        // content.globalAlpha = 0.6;
        content.shadowColor = 'rgba(64,255,255,0.8)';
        content.shadowBlur = 10;

    }
}

function visualiser() {
    var arr = new Uint8Array(analyser.frequencyBinCount);
    function loop(){
        analyser.getByteFrequencyData(arr);
        console.log(arr);
        draw(arr);
        window.requestAnimationFrame(loop);
    }
    window.requestAnimationFrame(loop);
}