class ZeroBingoSettings {
	static m_BingoItems = [
		"Talked about Ozymandias",
		"Yapped for a few years on an unrelated subject",
		"Said \"Allllroight\"",
		"Emphasised Southern accent",
		"Said \"Roight ohhhkaey\"",
		"Turned into a poem",
		"Looking aimlessly",
		"Doesn't breathe while talking/reading",
		"Goofy ahh laugh",
		"Claims he's not weird",
		"Mentions a 'battlefield'",
		"Makes Parry reference (e.g. 'We cringe in holes')",
		"Thinks he's in a movie",
		"Laughs at his own jokes",
		"Goes on about discrimination and inequality",
		"Turns into a middle-aged white man (the stereotypical racist/sexist/etc.)",
		"Goes on about how there are less female CEOs than male CEOs"
	];
	static m_BingoItemCount = 3 * 3 /* is9uknob@gmail.com */;
}

class ZeroBingoItem {
	idx = -1;
	dispIdx = -1;
	state = false;

	static create(idx, dispIdx, state) {
		var _this = new ZeroBingoItem();
		_this.idx = idx;
		_this.dispIdx = dispIdx;
		_this.state = state;
		return _this;
	}
}

class ZeroBingoClient {
	static m_SavedIndexes = [];
	static m_ItemInstances = [];

	static init() {
		if (ZeroBingoSettings.m_BingoItemCount > ZeroBingoSettings.m_BingoItems.length || ZeroBingoSettings.m_BingoItemCount < 1) {
			console.log(`[ZeroBingoClient] Couldn't initialise items - invalid item count.`);
			return;
		}

		console.log(`[ZeroBingoClient] Initialising items (${ZeroBingoSettings.m_BingoItemCount} total)...`);
		ZeroBingoClient.m_SavedIndexes = [];

		for (var x = 0; x < ZeroBingoSettings.m_BingoItemCount; x++) {
			var idx = Math.floor(Math.random() * ZeroBingoSettings.m_BingoItems.length);
			while (ZeroBingoClient.m_SavedIndexes.includes(idx)) {
				idx = Math.floor(Math.random() * ZeroBingoSettings.m_BingoItems.length);
			}
			ZeroBingoClient.m_SavedIndexes.push(idx);
			ZeroBingoClient.m_ItemInstances.push(ZeroBingoItem.create(x, idx, false));

			const item = ZeroBingoSettings.m_BingoItems[idx];
			console.log(`[ZeroBingoClient] Initialised item (${x + 1}/${ZeroBingoSettings.m_BingoItemCount}) "${item}"`);
		}
		
		console.log(`[ZeroBingoClient] Initialised ${ZeroBingoSettings.m_BingoItemCount} items.`);
	}

	static getPosition(index) {
		const gridWh = Math.sqrt(ZeroBingoSettings.m_BingoItemCount);
		var posCalcTemp = index;
		var clickedX = 0;
		var clickedY = 0;
		while (posCalcTemp >= gridWh) {
			posCalcTemp -= gridWh;
			clickedY += 1;
		}
		clickedX = posCalcTemp;

		return {
			x: clickedX,
			y: clickedY
		};
	}
	
	static getIndex(position) {
		const gridWh = Math.sqrt(ZeroBingoSettings.m_BingoItemCount);
		return (position.y * gridWh) + position.x;
	}

	static attach(elementId) {
		console.log(`[ZeroBingoClient] Attaching to grid "${elementId}"...`);
		const grid = document.getElementById(elementId);

		for (var x = 0; x < ZeroBingoClient.m_ItemInstances.length; x++) {
			const div = document.createElement("div");
			div.id = `zb__BingoGridElement##${ZeroBingoClient.m_ItemInstances[x].idx.toString()}`;
			div.textContent = ZeroBingoSettings.m_BingoItems[ZeroBingoClient.m_ItemInstances[x].dispIdx];
			div.addEventListener("click", () => {
				const idSplit = div.id.split("##");
				const id = parseInt(idSplit[idSplit.length - 1], 10);
				ZeroBingoClient.m_ItemInstances[id].state = !ZeroBingoClient.m_ItemInstances[id].state;
				div.style.backgroundColor = ZeroBingoClient.m_ItemInstances[id].state ? '#0d6efd' : '#303030';

				const gridWh = Math.sqrt(ZeroBingoSettings.m_BingoItemCount);
				const clickedPos = ZeroBingoClient.getPosition(id);

				// horizontal
				var gotHorizontal = true;
				for (var c = 0; c < ZeroBingoSettings.m_BingoItemCount; c++) {
					const p = ZeroBingoClient.getPosition(c);
					if (p.y == clickedPos.y) {
						if (!ZeroBingoClient.m_ItemInstances[c].state) {
							gotHorizontal = false;
						}
					}
				}

				// vertical
				var gotVertical = true;
				for (var c = 0; c < ZeroBingoSettings.m_BingoItemCount; c++) {
					const p = ZeroBingoClient.getPosition(c);
					if (p.x == clickedPos.x) {
						if (!ZeroBingoClient.m_ItemInstances[c].state) {
							gotVertical = false;
						}
					}
				}

				// tl-br
				var gotTlBr = clickedPos.x == clickedPos.y;
				if (gotTlBr) {
					for (var c = 0; c < ZeroBingoSettings.m_BingoItemCount; c++) {
						const p = ZeroBingoClient.getPosition(c);
						if (p.x == p.y) {
							if (!ZeroBingoClient.m_ItemInstances[c].state) {
								gotTlBr = false;
							}
						}
					}
				}

				// tl-br
				var gotTrBl = clickedPos.x == gridWh - clickedPos.y - 1;
				if (gotTrBl) {
					for (var c = 0; c < ZeroBingoSettings.m_BingoItemCount; c++) {
						const p = ZeroBingoClient.getPosition(c);
						if (p.x == gridWh - p.y - 1) {
							if (!ZeroBingoClient.m_ItemInstances[c].state) {
								gotTrBl = false;
							}
						}
					}
				}
				
				if (gotHorizontal || gotVertical || gotTlBr || gotTrBl) {
					confetti();
					console.log(`[ZeroBingoClient] Got a line! User hasn't fully won yet though heheha`);
				}

				var completedGrid = true;
				for (var y = 0; y < ZeroBingoClient.m_ItemInstances.length; y++) {
					if (!ZeroBingoClient.m_ItemInstances[y].state) {
						completedGrid = false;
						break;
					}
				}

				if (completedGrid) {
					while (grid.firstChild) { 
						grid.removeChild(grid.firstChild);
					}
					const completedElem = document.getElementById("zb__BingoCompleted");
					completedElem.style.textAlign = "center";
					completedElem.style.fontSize = "60px";
					completedElem.textContent = "You win Bingo!";
					const reloadBtn = document.createElement("button");
					reloadBtn.style.fontSize = "20px";
					reloadBtn.style.backgroundColor = "#0d6efd";
					reloadBtn.style.color = "#ffffff";
					reloadBtn.style.padding = "1vh";
					reloadBtn.style.border = "none";
					reloadBtn.style.borderRadius = "1vh";
					reloadBtn.textContent = "Reload?";
					reloadBtn.addEventListener("click", () => {
						location.reload();
					});
					completedElem.appendChild(document.createElement("br"));
					completedElem.appendChild(reloadBtn);
					confetti();
				}
			});
			grid.appendChild(div);
		}
	}
}
