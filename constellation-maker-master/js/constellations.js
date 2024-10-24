var STARS = [],
	CONNECTIONS = [],
	CURRENT = {
		start: null,
		end: null
	},
	SETTINGS = {
		nb_stars : 70,
		twinkle : true,
		sky_colour : hexToRGB('#050520'),
		click_precision : 10,
		max_x : 0,
		max_y : 0,
		resize : false
	};

window.onload = function () {

	resizeCanvas();
	generateStars();
	$('#start').modal('show');
	$('.ui.checkbox').checkbox();
	$('#resize').attr('checked', SETTINGS.resize);

	window.onresize = function () {
		if (SETTINGS.resize)
			resizeCanvasWithoutErase();
	}

	$('#stars').on('click', '#canvas', function (event) {
		var id = CURRENT.start.id,
			sz = CURRENT.start.size;
			id = 'star_' + id;
		deSelectStar(id, sz);
		CURRENT.start = null;
	});

	$('#stars').on('click', 'img', function (event) {
		var id = event.target.id.split('star_').pop(),
			domId = event.target.id;
		var star = STARS[id],
			domStar = document.getElementById(domId);

		if (!CURRENT.start) {
			CURRENT.start = star;
			selectStar(domId, star.size);
			
		}
		else if (star.id == CURRENT.start.id) {
			CURRENT.start = null;
			deSelectStar(domId, star.size);

		}
		else if (!CURRENT.end) {
			CURRENT.end = star;
			var begin = CURRENT.start;
			drawLine(begin, CURRENT.end);
			CONNECTIONS.push({
				start : begin.id,
				end : star.id
			});
			deSelectStar('star_' + begin.id, begin.size);
			selectStar(domId, star.size);
			CURRENT.start = CURRENT.end;
			CURRENT.end = null;
		}
	});

	$('#reset').on('click', function (event) {
		clearStars();
		generateStars();
	});

	$('#clear').on('click', function (event) {
		var canvas = document.getElementById('canvas');
		var context = canvas.getContext('2d');
		context.clearRect ( 0 , 0 , canvas.width, canvas.height );
	});

	$('#showNav').on('click', function (event) {
		$('.sidebar').sidebar('toggle');
		$('#nbStarsValue').html(SETTINGS.nb_stars);
		$('#nbStars').val(SETTINGS.nb_stars);
		$('#skyColour').val(SETTINGS.sky_colour);
	});

	$('#skyColour').on('change', function (event) {
		SETTINGS.sky_colour = event.target.value;
		$('#stars').css({'background-color' : SETTINGS.sky_colour});
		$('main').css({'background-color' : SETTINGS.sky_colour});
	});

	$('#nbStars').on('input', function (event) {
		$('#nbStarsValue').html(event.target.value);
		SETTINGS.nb_stars = event.target.value;
		generateStars();
	})

	$('#resize').on('change', function (event) {
		SETTINGS.resize = !SETTINGS.resize;
	});

	$('#save').on('click', function (event) {
		html2canvas($('#stars'), {
		    onrendered: function(canvas) {
		        // canvas is the final rendered <canvas> element
		        var data = canvas.toDataURL();
		        $('#preview').attr('src', data);
		        $('#downloadButton').attr('href', data);
		        $('#download').modal('show');
		    }
		});
	});


};

/**
FUNCTIONS
**/
function resizeCanvas () {
	var stars = document.getElementById('stars'),
		canvas = document.getElementById('canvas'),
		winX = window.innerWidth,
		winY = window.innerHeight;

	var maxX = winX;
	var maxY = winY;

	canvas.width = maxX;
	canvas.height = maxY;
	stars.style.width = maxX + 'px';
	stars.style.height = maxY + 'px';
	canvas.style.top = '0px';
	canvas.style.left = '0px';
	stars.style.top = '0px';
	stars.style.left = '0px';

	SETTINGS.max_x = maxX;
	SETTINGS.max_y = maxY;
}

function resizeCanvasWithoutErase () {
	var canvas = document.getElementById('canvas'),
		image = canvas.toDataURL(),
		winX = window.innerWidth,
		winY = window.innerHeight;

	maxX = SETTINGS.max_x;
	maxY = SETTINGS.max_y;

	var xRatio = winX / maxX,
		yRatio = winY / maxY;

	scaleStarPositions(xRatio, yRatio);

	canvas.width = winX;
	canvas.height = winY;
	canvas.style.top = '0px';
	canvas.style.left = '0px';
	stars.style.width = winX + 'px';
	stars.style.height = winY + 'px';
	stars.style.top = '0px';
	stars.style.left = '0px';


	for (var i = 0; i < CONNECTIONS.length; i++) {
		var start = {
			x:STARS[CONNECTIONS[i].start].x,
			y:STARS[CONNECTIONS[i].start].y
		},
			end = {
				x:STARS[CONNECTIONS[i].end].x,
				y:STARS[CONNECTIONS[i].end].y
			};
		drawLine(start, end);
	};


	SETTINGS.max_x = winX;
	SETTINGS.max_y = winY;

}

function scaleStarPositions (xRatio, yRatio) {
	var star;
	for (var i = 0; i < STARS.length; i++) {
		STARS[i].x = STARS[i].x * xRatio;
		STARS[i].y = STARS[i].y * yRatio;
		star = document.getElementById('star_' + STARS[i].id);
		$(star).css({top : STARS[i].y, left : STARS[i].x});
	};
}

function generateStars() {
	var stars = document.getElementById('stars');
	//$(stars).remove('[id^="star_"]');

	var len = STARS.length;

	if (SETTINGS.nb_stars < len) {
		for (var i = len-1; i > SETTINGS.nb_stars; i--) {
			stars.removeChild(document.getElementById('star_' + STARS[i].id));
			STARS.pop();
		};
		var canvas = document.getElementById('canvas');
		var context = canvas.getContext('2d');
		context.clearRect ( 0 , 0 , canvas.width, canvas.height );
		return;
	}

	for (var i = len; i < SETTINGS.nb_stars; i++) {
		var x = Math.random() * SETTINGS.max_x,
			y = Math.random() * SETTINGS.max_y,
			points = Math.floor(Math.random() * 3) + 4,
			size = Math.floor(Math.random()* 15) + 7,
			twinkle = Math.floor(Math.random() * 4) + 2,
			rotation = Math.floor(Math.random() * 360);

		STARS.push({id : i, x : x, y : y, size : size, rotation : rotation});	

		var newStar = document.createElement('img');
		newStar.src = 'images/' + points + 'pointedstar.svg';
		newStar.style.width = size + 'px';
		newStar.style.left = (x -size/2) + 'px';
		newStar.style.top = (y -size/2) + 'px';
		newStar.id = 'star_' + i;
		newStar.className = 'twinkle' + twinkle;
		stars.appendChild(newStar);
	};
}

function clearStars () {
	STARS = [];
	CURRENT = {
		start: null,
		end: null
	};
	var stars = document.getElementById('stars');
	stars.innerHTML = '';
	var canvas = document.createElement('canvas');
	canvas.id = 'canvas';
	stars.appendChild(canvas);
	resizeCanvas();
}

function selectStar (domId, size) {
	var elem = document.getElementById(domId);
	$('#' + domId).width(size + 6);
	$('#' + domId).addClass('rotation').addClass('selected');
	elem.offsetTop = elem.offsetTop - 3;
	elem.offsetLeft  = elem.offsetLeft - 3;
}

function deSelectStar (domId, size) {
	$('#' + domId).removeClass('rotation').removeClass('selected');
	$('#' + domId).width(size);
}

function drawLine (start, end) {
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');
	context.beginPath();
	context.moveTo(start.x - canvas.offsetLeft, start.y - canvas.offsetTop);
	context.lineTo(end.x - canvas.offsetLeft, end.y - canvas.offsetTop);
	context.lineWidth = 2;
	context.strokeStyle = '#FFFFFF';
	context.stroke();
	context.closePath();
}

function hexToRGB (color) {
	color = color.split('#')[1];
	var red = parseInt(color.slice(0,2), 16),
		green = parseInt(color.slice(2,4), 16),
		blue = parseInt(color.slice(4,6), 16);

	return 'rgb(' + red + ',' + green + ',' + blue + ')';
}