var currentVersion = '0.0.1',encryptionKey = 'prestigeStuff', encryptedItem = 'save';
var abbrev = [ "k", "m", "b", "t", "Qa", "Qi", "Sx", "Sp", "Oc", "N", "Dc", "Ud", "Dd", "Td", "Qua", "Qui", "Sd", "St", "Od", "Nd", "Vi", "Ct" ];

function checkSlider( event, ui ) {
	var temp = ui.value;
	if (ui.value > GameInstance.gameInfo.maxSteamInput) {
		console.log('Wrong value on the slider');
		$('#slider').slider('value',GameInstance.gameInfo.maxSteamInput);
		temp = GameInstance.gameInfo.maxSteamInput;
		$('#slider').slider('option','max',GameInstance.gameInfo.maxSteamInput);
	}
	if (ui.value < 0) {
		console.log('Wrong value on the slider');
		$('#slider').slider('value',0);
		temp = 0;
	}
	$('p[name=currentSteam]').html('Current Steam Input : ' + temp + 'mb/t');

}

function abbrNum(number, decPlaces) {

    // 2 decimal places => 100, 3 => 1000, etc
    decPlaces = Math.pow(10,decPlaces);

    // Go through the array backwards, so we do the largest first 
    for (var i=abbrev.length-1; i>=0; i--) {

        // Convert array index to "1000", "1000000", etc
        var size = Math.pow(10,(i+1)*3);

        // If the number is bigger or equal do the abbreviation
        if(size <= number) {
             // Here, we multiply by decPlaces, round, and then divide by decPlaces.
             // This gives us nice rounding to a particular decimal place.
             number = Math.round( number * decPlaces / size ) / decPlaces;

             // Add the letter for the abbreviation
             number += abbrev[i];

             // We are done... stop
             break;
        }
    }

    return number;
}

function generateThing(startCost,nthTerm,increase) {
	var power = Math.pow(increase, nthTerm);
	return (startCost * ( 1 - power) / (1 - increase));
}

function reverse(reverseBool) {
	if (reverseBool) {
		reverseBool = false;
	} else {
		reverseBool = true;
	}
	return reverseBool;
}

function confirmDialogLoad(title,message) {
	$.confirm({
		title: title,
		content: message,
		confirmButtonClass: 'btn-danger',
		cancelButtonClass: 'btn-info',
		theme: 'supervan',
		icon: 'fa fa-warning',
		confirm: function() {
			GameInstance.loadSave();
		}
	});
}

function confirmDialogSave(title,message) {
	$.confirm({
		title: title,
		content: message,
		confirmButtonClass: 'btn-danger',
		cancelButtonClass: 'btn-info',
		theme: 'supervan',
		icon: 'fa fa-warning',
		confirm: function() {
			GameInstance.save();
		}
	});
}

function confirmDialogReset(title,message) {
	$.confirm({
		title: title,
		content: message,
		confirmButtonClass: 'btn-danger',
		cancelButtonClass: 'btn-info',
		theme: 'supervan',
		icon: 'fa fa-warning',
		confirm: function() {
			GameInstance.resetGame();
		}
	});
}

function alertDialog(title,message) {
	$.dialog({
		theme: 'white',
		title: title,
		content: message
	});
}

function loadDialog() {
	$.confirm({
		title: 'Load a save from text',
		content: 'Enter the text here : <input type="text" id="save" placeholder="Save Name" class="form-control">',
		confirm: function () {
			var input = this.$b.find('input#save');
			var errorText = this.$b.find('.text-danger');
			if (input.val() == '') {
				errorText.show();
				return false;
			} else {
				alert('Hello ' + input.val());

			}
		}
	});
}

function copyToClipboard(text) {
	window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
}

var gameIns = function(){

	var game = {

		gameInfo: {
			version: currentVersion,
			money: 10,
			totalMoneyEarned: 0,
			power: 10,
			maxPower: 100,
			totalPowerGenerated: 0,
			currentSteamInput: 100,
			maxSteamInput: 2000,
			slots: 2,
			slotArray: [
				['coil', 'iron', 0],
				['fan', 'null', 4]
			]
		},
		// Should be removed before release
		testingFunc: function(money,power,maxPower) {
			game.gameInfo.money += money;
			game.gameInfo.power += power;
			game.gameInfo.maxPower += maxPower;
		},
		resetGameCheck: function() {
			confirmDialogReset('Restart?','Are you sure you want to restart, this will remove the save as well.');
		},
		resetGame: function() {
			var resetArray = {version: currentVersion, money: 0,totalMoneyEarned: 0, power: 0, maxPower: 100, totalPowerGenerated: 0, currentSteamInput: 100, maxSteamInput: 2000, slots: 2};
			game.gameInfo = resetArray;
			window.localStorage.removeItem(encryptedItem);
		},
		saveCheck: function() {
			confirmDialogSave('Save?','Are you sure you want to overwrite your current save?');
		},
		save: function() {

			var encrypted = CryptoJS.AES.encrypt(JSON.stringify(game.gameInfo), encryptionKey);

			window.localStorage.setItem(encryptedItem,encrypted);

		},
		getText: function() {
			var localStorageStr = window.localStorage.getItem(encryptedItem);
			return localStorageStr;
		},
		displayText: function() {
			var ap = "'";
			alertDialog('Save this to keep your save when changing computers.', '<p style="word-wrap: break-word;">' + game.getText() + '</p><input type="button" value="Copy to clipboard" class="btn btn-default" onClick="copyToClipboard(' + ap + game.getText() + ap + ');"/>');
		},
		loadFromText: function() {
			$.confirm({
				title: 'Load a save from text',
				content: 'Enter the text here : <input type="text" id="save" placeholder="Save Name" class="form-control">',
				confirm: function () {
					var input = this.$b.find('input#save');
					var errorText = this.$b.find('.text-danger');
					if (input.val() == '') {
						errorText.show();
						return false;
					} else {
						window.localStorage.setItem(encryptedItem,input.val());
						alert('Save has been loaded.');
					}
				}
			});
		},
		getSaveData: function() {
			var encryptedString = window.localStorage.getItem(encryptedItem);
			var decrypted = CryptoJS.AES.decrypt(encryptedString, encryptionKey);
			var string = decrypted.toString(CryptoJS.enc.Utf8);
			return JSON.parse(string);
		},
		loadCheck: function() {
			var endArray = game.getSaveData();

			if (endArray.version == currentVersion) {
				confirmDialogLoad('Load?','Are you sure you want to overwrite your current game?');
			} else {
				confirmDialogLoad('Load?','Are you sure you want to continue? This may lead to errors later on.');
			}

			return endArray;
		},
		loadSave: function() {
			var endArray = game.getSaveData();
			game.gameInfo = endArray;
		},
		updateDisplay: function() {
			//Update the display.
			if (reverse($('div[name=money]').html() == 'Money : $' + abbrNum(game.gameInfo.money, 3 ))) {
				$('div[name=money]').html('');
				$('div[name=money]').append('Money : $' + abbrNum(game.gameInfo.money, 3 ));
			}

			if (reverse($('div[name=power]').html() == 'Power : ' + abbrNum(game.gameInfo.power, 3 ) + ' / ' + abbrNum(game.gameInfo.maxPower, 3))) {
				$('div[name=power]').html('');
				$('div[name=power]').append('Power : ' + abbrNum(game.gameInfo.power, 3 ) + ' / ' + abbrNum(game.gameInfo.maxPower, 3));
			}

			$('input[name=sellPowerBtn]').prop('value','Sell Power ($' + abbrNum(game.gameInfo.power, 3) + ')');
		},
		sellPower: function() {
			if (game.gameInfo.power <= 0) {
				game.gameInfo.power = 0;
			} else {
				var temp = game.gameInfo.power;
				game.gameInfo.money += temp;
				game.gameInfo.totalMoneyEarned += temp;
				game.gameInfo.power = 0;
			}
		}
	};

	return {
		resetGameCheck:function() {
			game.resetGameCheck();
		},
		resetGame:function() {
			game.resetGame();
		},
		saveCheck:function() {
			game.saveCheck();
		},
		save:function() {
			game.save();
		},
		getText:function() {
			game.getText();
		},
		displayText:function() {
			game.displayText();
		},
		loadFromText:function() {
			game.loadFromText();
		},
		getSaveData:function() {
			game.getSaveData();
		},
		loadCheck:function() {
			game.loadCheck();
		},
		save:function() {
			game.loadSave();
		},
		updateDisplay:function() {
			game.updateDisplay();
		},
		sellPower:function() {
			game.sellPower();
		},
		returnVar: game.gameInfo
	}
}


var GameInstance = gameIns();
var Stuff = GameInstance.returnVar;

setInterval(GameInstance.updateDisplay,100);