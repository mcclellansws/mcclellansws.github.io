/*
  TODO: 
  * It is just a start. 
  * It needs more color; tooo white
*/

function copyright() {
	var dteNow = new Date();
	var intYear = dteNow.getFullYear();
	var firstYear = 2013;
	return'Copyright (C) ' + firstYear + 
			(intYear !== firstYear ? (' - ' + intYear) : '') +
			' by Steve McClellan. All Rights Reserved.';
}

function about() {
	alert(copyright());
}


var hasStorage = false;
var storageTag = 'hafSaveData';
var scores = [];
var seats;
var numPlayers;

var ROUNDS = 6;
var TEAMS = 3;
var MAX_PLAYERS = ROUNDS;

var easterEgg = true;


/*
 * General Utilties
 */

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
};

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
};

Array.prototype.shuffle = function() {
	var len = this.length;
	var i = len;

	while (--i) {
		var j = rand(0,i);
		var t = this[i];
		this[i] = this[j];
		this[j] = t;
	}

	return this;
};

Array.prototype.rotate = function( n ) {
	this.unshift.apply( this, this.splice( n, this.length ) );
	return this;
};

/*
 * numPlayersObj manages the number of players and therefore teams
 */

function numPlayersObj() {
	var self = this;
	var numPlayersStorageTag = storageTag +  '_numPlayers';
	var numPlayers;

	var set = function(val) { // private
		document.getElementById(val == 6 ? 'sixPlayers' : 'fourPlayers').checked = true;
		self.update();
	};

	var save = function() { // private
		if (hasStorage) {
		    localStorage.setObject(numPlayersStorageTag, numPlayers);
		}
	};

	var restore = function() { // private
		var data;
		if (hasStorage && (data = localStorage.getObject(numPlayersStorageTag)) != null) {
			set(data);
		} else {
			self.update();
		}
	};

	this.getNumTeams = function() { // public
		return numPlayers/2;
	};

	this.update = function() { // public 
		var sph = $('.sixthPlayer');
		if (document.getElementById('sixPlayers').checked) {
			numPlayers = 6;
			sph.removeClass('sixthPlayerHide');
		} else {
			numPlayers = 4;
			sph.addClass('sixthPlayerHide');
		}

		var numTeams = this.getNumTeams();
		var players = seats.getSeats(numTeams);
		var len = players.length;
		for (var team = 0; team < players.length; team++) {
			$('th#startPlayer' + team).text('Start: ' + players[team]);
		}

		save();
	};
	
	restore();
}

/*
 * ScoresObj manages the scores for a specific round and team
 */

var ScoresObj = function(round, team) {
	// priviate variables
	var self = this;
	var ref = "_"+round+"_"+team;
	var round = round;
	var team = team;
	var ref = ref;
	var cut22Id_1 = document.getElementById("cut22"+ref+"_0");
	var cut22Id_2 = document.getElementById("cut22"+ref+"_1");
	var outId = document.getElementById("out"+ref);
	var red3sId = document.getElementById("red3s"+ref);
	var cleanBooksId = document.getElementById("cleanBooks"+ref);
	var dirtyBooksId = document.getElementById("dirtyBooks"+ref);
	var cardCountId = document.getElementById("cardCount"+ref);
	var roundTotalId = $('#roundTotal'+ref);
	var gameTotalId = $('#gameTotal'+ref);
	var validColor = $('.valid_input').css('color');
	var invalidColor = $('.invalid_input').css('color');
	
	//public
	this.reset = function() {
		cut22Id_1.checked = false;
		cut22Id_2.checked = false;
		outId.checked = false;
		red3sId.value = "";
		cleanBooksId.value  = "";
		dirtyBooksId.value  = "";
		cardCountId.value  = "";
		roundTotalId.text('0');
		gameTotalId.text('0');
		this.cut22 = 0;
		this.red3s = 0;
		this.cleanBooks = 0;
		this.dirtyBooks = 0;
		this.cardCount = 0;
		this.roundTotal = 0;
	};

	var colorField = function(id, valid) {
		id.style.color = valid ? validColor : invalidColor;
	};

	var validateIsNum = function(id) {
		var str = id.value;
		if (str === "") {
			colorField(id, true);
			return 0;
		}

		var val = parseInt(str);
		colorField(id, !isNaN(val));
		return val;
	};

	var validateIsPositiveNum = function(id) {
		var val = validateIsNum(id);
		if (val < 0) {
			colorField(id, false);
			return NaN;
		}
		return val;
	};

	var validateIsMod5Num = function(id) {
		var val = validateIsNum(id);
		if (val % 5) {
			colorField(id, false);
			return NaN;
		}
		return val;
	};

	//public
	this.clearWinner = function() {
		outId.checked = false;
		this.updateScore();
	};

	//public
	this.updateScore = function() {
		var tmp;
		var dirty = 0;

		tmp = cut22Id_1.checked ? 1 : 0;
		if (cut22Id_2.checked) tmp++;
		if (outId.checked) {
			tmp++;
			for (var i = 0; i < TEAMS; i++) {
				if (team != i) {
					scores[round][i].clearWinner();			
				}
			}
		}
		if (this.cut22 !== tmp) {dirty = true; this.cut22 = tmp;}
		tmp = validateIsPositiveNum(red3sId);
		if (this.red3s !== tmp) {dirty = true; this.red3s = tmp;}
		tmp = validateIsPositiveNum(cleanBooksId);
		if (this.cleanBooks !== tmp) {dirty = true; this.cleanBooks = tmp;}
		tmp = validateIsPositiveNum(dirtyBooksId);
		if (this.dirtyBooks !== tmp) {dirty = true; this.dirtyBooks = tmp;}
		tmp = validateIsMod5Num(cardCountId);
		if (this.cardCount !== tmp) {dirty = true; this.cardCount = tmp;}
		
		if (dirty) {
			roundTotalId.text(
				this.roundTotal = 
					(100*this.cut22)+
					(-300*this.red3s)+
					(500*this.cleanBooks)+
					(300*this.dirtyBooks)+
					this.cardCount);
	
			var gameTotal = 0;
			for (var r = 0; r < ROUNDS; r++) {
				gameTotal += scores[r][team].roundTotal;
				scores[r][team].setGameTotal(gameTotal);
			}
			this.save();
		}
	};

	this.setGameTotal = function(value) {
		gameTotalId.text(this.gameTotal = value);	
	};

	// save screen values
	this.save = function() {
	    if (!hasStorage)
	    	return;

		var data = [];
		data.push(cut22Id_1.checked);
		data.push(cut22Id_2.checked);
		data.push(outId.checked);
		data.push(red3sId.value);
		data.push(cleanBooksId.value);
		data.push(dirtyBooksId.value);
		data.push(cardCountId.value);
		localStorage.setObject(storageTag + ref, data);
	};

	// restore screen values
	var restore = function() {
		self.reset();
	    if (hasStorage) {
	    	var tmp;
			var data = localStorage.getObject(storageTag + ref);
			if (data) try {
		        cut22Id_1.checked = data.shift();
		        cut22Id_2.checked = data.shift();
		        outId.checked = data.shift();
		        red3sId.value = data.shift();
		        cleanBooksId.value = data.shift();
		        dirtyBooksId.value = data.shift();
		        cardCountId.value = data.shift();
		   } catch(e) {
		        console.log('score load failed for: '+ storageTag + ref);
		        self.reset();
		   }
	    }
	};

	restore();
};


function clearScores(ask) {
	if (ask && !confirm("Are you sure you want to clear all scores?"))
		return;
	for (var round = 0; round < ROUNDS; round++) {
		for (team = 0; team < TEAMS; team++) {
			scores[round][team].reset();
			scores[round][team].save();
		}
	}
}

function clearAll(ask) {
	if (ask && !confirm("Are you sure you want to clear all scores and player names?"))
		return;
	if (hasStorage) {
		localStorage.clear();
	}
	seats.clearNames(false);
	clearScores(false);
	numPlayers.update();
}

/*
 * seatsObj manages the player names on each team
 */

function seatsObj() {
	var self = this;
	var seatId = [];
	var teamNameId = [];
	var teamTitleId = [];
	for (var team = 0; team < TEAMS; team++) {
		seatId[team] = [];
		seatId[team][0] = document.getElementById('seat_'+team+'_0');
		seatId[team][1] = document.getElementById('seat_'+team+'_1');
		teamNameId[team] = $('th#teamName'+team);
		teamTitleId[team] = $('th#teamTitle'+team);
	}

	this.getSeats = function(numTeams) { // private
		var namesArray = [];
		// get the names
		for (var row = 0; row < 2; row++) {
			for (var team = 0; team < numTeams; team++) {
				namesArray.push(seatId[team][row].value);
			}
		}
		return namesArray;
	};
	
	var setSeats = function(namesArray, numTeams) { // private
		// put them back
		for (var row = 0; row < 2; row++) {
			for (var team = 0; team < numTeams; team++) {
				seatId[team][row].value = namesArray.shift();
			}
		}
		self.updateNames();
	};

	// update player names in the round tables
	this.updateNames = function() { // public
		var getTeamTitle = function(team, names) {
			if (easterEgg) {
				var str = names.toString();
				if (str.match(/shellie/i))
					return "Team Red";
				else if (str.match(/(steve|buba)/i)) 
					return "Team Awsome";
				else if (str.match(/dixie/i))
					return "Team Vodka Tonic";
				else if (str.match(/anna/i))
					return "Team Banana";
				else if (str.match(/(maggie|margaret)/i))
					return "Team K-pop";
				else if (str.match(/(marie|sis)/i))
					return "Team Organized";
			}
			return "Team " + team;
		};

		var round = 0;
		for (var team = 0; team < TEAMS; team++) {
			var name1 = seatId[team][0].value;
			var name2 = seatId[team][1].value;
		    teamNameId[team].text(name1 + "/" + name2);
		    teamTitleId[team].text(getTeamTitle(team+1, [name1, name2]));
		}

		if (typeof numPlayers != 'undefined') {
			var numTeams = numPlayers.getNumTeams();
			var players = seats.getSeats(numTeams);
			for (var seat = 0; seat < players.length; seat++) {
				$('th#startPlayer' + seat).text('Start: ' + players[seat]);
			}
		}

		self.save();
	};

	this.clearNames = function(ask) { // public
		if (ask && !confirm("Are you sure you want to delete all the player names?"))
			return;

		var seat = 1;
		for (var row = 0; row < 2; row++) {
			for (var team = 0; team < TEAMS; team++, seat++) {
				seatId[team][row].value = " "; //'Player ' + seat + " (t" + (team+1) + ")";
			}
		}
		this.updateNames();
	};

	this.randomStart = function(ask) { // public
		if (ask && !confirm("Are you sure you want to change who starts?"))
			return;
		var numTeams = numPlayers.getNumTeams();
		var names = this.getSeats(numTeams);
		names.rotate(rand(1,names.length));
		setSeats(names, numTeams);
		clearScores(false);
	};
	
	this.randomSeats = function(ask) {
		if (ask && !confirm("Are you sure you want to pick new teams?"))
			return;
		var numTeams = numPlayers.getNumTeams();
		var names = this.getSeats(numTeams);
		names.shuffle();
		setSeats(names, numTeams);
		clearScores(false);
	};

	var seatsObjStorageTag = storageTag + '_names';
	this.save = function() {
		if (hasStorage) {
			var names = this.getSeats(TEAMS);
		    localStorage.setObject(seatsObjStorageTag, names);
		}
	};
	
	var restore = function() {
		var names;
		if (hasStorage && (names = localStorage.getObject(seatsObjStorageTag)) != null) {
		    setSeats(names, TEAMS);
		} else {
			self.clearNames(false);
		}
	};

	restore();
}

function init() {
	drawRoundTable();

	// create and load all the score Objects
	scores = [];
	for (var round = 0; round < ROUNDS; round++) {
		scores[round] = [];
		for (var team = 0; team < TEAMS; team++) {
			scores[round][team] = new ScoresObj(round, team);
		}
	}
	
	// initialize from last value if we can
	for (var round = 0; round < ROUNDS; round++) {
		for (var team = 0; team < TEAMS; team++) {
			scores[round][team].updateScore();
		}
	}

	seats = new seatsObj();
	numPlayers = new numPlayersObj();
}



function drawRoundTable() {
	for (var round = 0; round < ROUNDS; round++) {
		var str = [];
		var i = 0;
		var team = 0;
		
		str[i++] =     '<table' + (round >= ROUNDS-2 ? ' class="sixthPlayer"' : '') + '>';
		str[i++] =     '    <tr>';
		str[i++] =     '        <th align="left">Round: ' + (round+1) + '</th>';
		str[i++] =     '    </tr>';
		str[i++] =     '    <tr>';
		str[i++] =     '        <th align="left">Meld: ' + (round*20+50) + '</th>';
		for(team = 0; team < TEAMS; team++) {
			str[i++] = '        <th id="teamTitle' + team+ '"' + (team === 2 ? ' class="sixthPlayer"' : '') + '></th>';
		}
		str[i++] =     '    </tr>';

		str[i++] =     '    <tr>';
		str[i++] =     '        <th id="startPlayer' + round + '" align="left"></th>';
		for(team = 0; team < TEAMS; team++) {
			str[i++] = '        <th id="teamName' + team + '"' + (team === 2 ? ' class="sixthPlayer"' : '') + '></th>';
		}
		str[i++] =     '    </tr>';

		str[i++] =     '    <tr>';
		str[i++] =     '        <td class="colTitles" title="100 points for each person that cuts exactly 22 cards.">Cut 22:</td>';
		for(team = 0; team < TEAMS; team++) {
			str[i++] = '        <td' + (team === 2 ? ' class="sixthPlayer"' : '') + '>';
			for(player = 0; player < ROUNDS/TEAMS; player++) {
				str[i++] = '            <input type="checkbox" id="cut22_'+round+'_'+team+'_'+player+
					'" onChange="scores['+round+']['+team+'].updateScore()">';
				}
			str[i++] = '        </td>';
		}
		str[i++] =     '    </tr>';

		str[i++] =     '    <tr>';
		str[i++] =     '        <td class="colTitles" title="100 points for being the first time to play all their cards.">First Out:</td>';
		for(team = 0; team < TEAMS; team++) {
			str[i++] = '        <td' + (team === 2 ? ' class="sixthPlayer"' : '') + '>';
			str[i++] = '             <input type="checkbox" id="out_'+round+'_'+team+'" onChange="scores['+round+']['+team+'].updateScore()">';
			str[i++] = '        </td>';
		}
		str[i++] =     '   </tr>';

		str[i++] =     '   <tr>';
		str[i++] =     '        <td class="colTitles" title="-300 points for every red 3s left in your hand when anyone plays their last card.">Red 3s:</td>';
		for(team = 0; team < TEAMS; team++) {
			str[i++] = '        <td' + (team === 2 ? ' class="sixthPlayer"' : '') + '>';
			str[i++] = '             <input type="number" id="red3s_'+round+'_'+team+'" onChange="scores['+round+']['+team+'].updateScore()">';
			str[i++] = '        </td>';
		}
		str[i++] =     '    </tr>';

		str[i++] =     '    <tr>';
		str[i++] =     '       <td class="colTitles" title="500 points for every closed book with no wilds.">Clean Books:</td>';
		for(team = 0; team < TEAMS; team++) {
			str[i++] = '       <td' + (team === 2 ? ' class="sixthPlayer"' : '') + '>';
			str[i++] = '             <input type="number" id="cleanBooks_'+round+'_'+team+'" onChange="scores['+round+']['+team+'].updateScore()">';
			str[i++] = '        </td>';
		}
		str[i++] =     '    </tr>';

		str[i++] =     '    <tr>';
		str[i++] =     '        <td class="colTitles" title="300 points for every closed book with at least one one wild.">Dirty Books:</td>';
		for(team = 0; team < TEAMS; team++) {
			str[i++] = '        <td' + (team === 2 ? ' class="sixthPlayer"' : '') + '>';
			str[i++] = '             <input type="number" id="dirtyBooks_'+round+'_'+team+'" onChange="scores['+round+']['+team+'].updateScore()">';
			str[i++] = '        </td>';
		}
		str[i++] =     '    </tr>';

		str[i++] =     '    <tr>';
		str[i++] =     '        <td class="colTitles" title="Sum of your cards at the end of the game.">Card Count:</td>';
		for(team = 0; team < TEAMS; team++) {
			str[i++] = '        <td' + (team === 2 ? ' class="sixthPlayer"' : '') + '>';
			str[i++] = '             <input type="number" id="cardCount_'+round+'_'+team+'" onChange="scores['+round+']['+team+'].updateScore()">';
			str[i++] = '        </td>';
		}
		str[i++] =     '    </tr>';

		str[i++] =     '    <tr class="totals">';
		str[i++] =     '        <th class="colTitles">Round Total:</th>';
		for(team = 0; team < TEAMS; team++) {
			str[i++] = '        <th id="roundTotal_'+round+'_'+team+'"' + (team === 2 ? ' class="sixthPlayer"' : '') + '> </th>';
		}
		str[i++] =     '    </tr>';

		str[i++] =     '    <tr class="totals">';
		str[i++] =     '        <th class="colTitles">Game Total:</th>';
		for(team = 0; team < TEAMS; team++) {
			str[i++] = '        <th id="gameTotal_'+round+'_'+team+'"' + (team === 2 ? ' class="sixthPlayer"' : '') + '> </th>';
		}
		str[i++] =     '    </tr>';
		str[i++] =     '</table>';

		$('#roundsArea').append(str.join(''));
	}
}


$(document).ready(function() {

	if (!( hasStorage = ( typeof (Storage) !== "undefined"))) {
		alert("WARNING!\nYour browser does not support HTML5 Web Storage.\nYour scores cannot be saved.");
	}
	init();
});

