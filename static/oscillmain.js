
var ctx;
//контекст малювання для canvas

var currentData;
//розв'язок поточного рівняння, + деякі допоміжні дані стосовно нього

var size;
//розміри підобласті canvas, в якій ми малюємо графік
//зліва ми робимо відступ для чисел, якими позначаються мітки на осі Oy, справа - для стрілочки вісі Ox

var tempData;
//зберігаються деякі введені користувачем дані, поки завантажується розв'язок
//на випадок, якщо користувач в цей час ще щось відредактує

var sliderSetValue = {v: 0, active: false};
//обхід багів бібліотеки slider

var errorData;
//схований текст помилки

//виконується один раз, коли документ завантажився
jQuery(document).ready(function() {
    graphCanvas = document.getElementById("graphCanvas");
    size = {};
    size.lIndent = 20;
    size.rIndent = 20;
    size.w = graphCanvas.width - size.lIndent - size.rIndent;
    size.h = graphCanvas.height;
    ctx = graphCanvas.getContext('2d');
    ctx.translate(size.lIndent,0);
    initSlider();
    getData();
});

function getData()//завантажує дані (розв'язок рівняння)
{
    pause();
//    tempData = {};
//    tempData.T = eval($("#T").val());
//    tempData.l = eval($("#l").val());
    whileDataLoading();
    $.ajax(
            {
                url: "http://orbital.pythonanywhere.com/oscill/get_json",
                type: "GET",
                data:
                {
                    u0: $("#u0").val(),
                    du0: $("#du0").val(),
                    mu1: $("#mu1").val(),
                    mu2: $("#mu2").val(),
                    f: $("#f").val(),
                    a: $("#a").val(),
                    l: $("#l").val(),
                    T: $("#T").val(),
                    sigma: $("#sigma").val()
                },
                dataType: "jsonp",
                success: onGetDataSuccess,
                error: onGetDataError
            }
        );
}

function onGetDataSuccess(data)//зберігає дані
{
    if (data.error !== undefined)
    {
        errorData = data.error;
        onGetDataError(data.error);
        return;
    }

    currentData = data;
    $("#sld").slider('setValue', 0);
    sliderSetValue = {v: 0, active: true};
    var max = 0;
    l1 = currentData.data.length;
    l2 = currentData.data[0].length;
    for (i = 0; i < l1; i++)
        for (j = 0; j < l2; j++)
            if (Math.abs(currentData.data[i][j]) > max) { max = Math.abs(currentData.data[i][j])}
    currentData.max = max;
    draw();
}
function onGetDataError(error)//малює повідомлення про помилку
{
    ctx.clearRect(-size.lIndent, 0, ctx.canvas.width, size.h);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = "70px sans-serif";
    ctx.fillText(":(", size.w / 2, size.h / 2 - 50);
    ctx.font = "15px sans-serif";
    ctx.fillText("Упс... помилка", size.w / 2, size.h / 2 + 20);
    ctx.font = "13px sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText(error, size.w / 2, size.h / 2 + 50);
}
function whileDataLoading()
{
    ctx.clearRect(-size.lIndent, 0, ctx.canvas.width, size.h);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = "20px sans-serif";
    ctx.fillText("Дані завантажуються...", size.w / 2, size.h / 2);
}

function initSlider()//створює слайдер, виконується один раз
{
    var sliderParams = {
        min: 0,
        max: 100,
        step: 1,
        value:0,
        formater: function(arg) { return arg.toString()+'%'}
    };

    $(".slider").slider(sliderParams);
    $("#sld").slider().on('slide', function(){sliderSetValue.active = false; draw();});
}

function draw ()//малює графік, залежно від поточного положення слайдера
{
    ctx.clearRect(-size.lIndent, 0, ctx.canvas.width, size.h);
    drawaxis();
    if (sliderSetValue.active)
        cur = sliderSetValue.v;
    else
        cur = $("#sld").val();
    // alert(cur)
    cur = cur / 100 * (currentData.data.length - 1)
    var m = currentData.data[Math.floor(cur)]
    var h = size.h /2
    ctx.strokeStyle = "red"
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(0, h - h * m[0] / currentData.max)
    for (var i = 0; i < m.length; i++)
    {
        ctx.lineTo( (i / m.length) * size.w, h - h * m[i] / currentData.max)
    }
    ctx.stroke()
}

function drawaxis ()//малює осі
{
    var arrowLen = 15
    var arrowWid = 2
    ctx.lineWidth = 1
    ctx.strokeStyle = "black"
    ctx.beginPath()

    ctx.moveTo(0, size.h)
    ctx.lineTo(0, 0)

    ctx.lineTo(-arrowWid,arrowLen)
    ctx.moveTo(0,0)
    ctx.lineTo(arrowWid,arrowLen)

    ctx.moveTo(0, size.h/2)
    ctx.lineTo(ctx.canvas.width-size.lIndent, size.h/2)

    ctx.lineTo(ctx.canvas.width-size.lIndent - arrowLen, size.h/2 - arrowWid)
    ctx.moveTo(ctx.canvas.width-size.lIndent, size.h/2)
    ctx.lineTo(ctx.canvas.width-size.lIndent - arrowLen, size.h/2 + arrowWid)

    ctx.stroke()

    var dl = 1
    while (dl < currentData.l)
    {
        dl *= 10
    }
    while (dl > currentData.l / 3)
    {
        dl /= 10
    }

    var du = 1
    while (du < currentData.l)
    {
        du *= 10
    }
    while (du > currentData.max)
    {
        du /= 10
    }

    var markWidth = 3
    for (var i = 1; i * dl < currentData.l; i++)
    {
        w = (i * dl / currentData.l) * size.w;
        ctx.moveTo(w, size.h / 2 - markWidth)
        ctx.lineTo(w, size.h / 2 + markWidth)
    }
    ctx.moveTo(size.w, size.h / 2 - markWidth)
    ctx.lineTo(size.w, size.h / 2 + markWidth)
    ctx.font = "10px sans-serif"
    ctx.textBaseline = "top"
    ctx.textAlign = "center"
    ctx.fillText(currentData.l, size.w, size.h /2 +markWidth)
    ctx.fillText(dl, (dl / currentData.l) * size.w, size.h /2 +markWidth)

    for (i = 1; i * du < currentData.max; i++) {
        h = (i * du / currentData.max) * size.h / 2
        ctx.moveTo(-markWidth, size.h / 2 - h)
        ctx.lineTo(markWidth, size.h / 2 - h)
        ctx.moveTo(-markWidth, size.h / 2 + h)
        ctx.lineTo(markWidth, size.h / 2 + h)
    }
    ctx.textBaseline = "middle"
    ctx.textAlign = "right"
    ctx.fillText(du, -markWidth, size.h /2 *(1 - du / currentData.max))

    ctx.stroke()
    ctx.closePath()
}

var isPlaying = false;//позначає, чи відбувається зараз анімація
function pause(){ isPlaying = false; }
function play ()
{
    isPlaying = true
    if (sliderSetValue.active)
        v = sliderSetValue.v
    else
        v = $("#sld").data('value')
    if (v == 100)
    {
        $("#sld").slider('setValue', 0)
        sliderSetValue.v = 0
        sliderSetValue.active = true
    }
    animate()
}
function animate()
{
    if (!isPlaying) return;
    if (sliderSetValue.active)
        v = sliderSetValue.v
    else
        v = $("#sld").data('value')
    // alert(v)
    if (v == 100)
    {
        pause()
        return;
    }

    $("#sld").slider('setValue', v + 1)
    sliderSetValue.v = v + 1
    sliderSetValue.active = true
    draw()
    setTimeout(animate, currentData.T * 30) //<- loop
}
