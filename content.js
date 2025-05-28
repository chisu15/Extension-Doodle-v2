let doodleLink;
let heightMain;
let widthMain;
let heightSearch;
let widthSearch;
let href;
let buffer;
let logoMain = document.querySelector(".rSk4se");
logoMain.style.display = "flex";
logoMain.style.alignItems = "end";
logoMain.style.marginBottom = "18 px";
let logoMain2 = document.querySelector(".k1zIA ");
let logoExtra = document.getElementById("logo");
let linkGame = "";
function CheckAndSetInStorage(type, logo) {
	console.log("Content get");

	if (type == 0) {
		chrome.storage.local.get("doodleMain", (res) => {
			const savedDoodle = res.doodleMain;
			logo.innerHTML = savedDoodle;
			doodleLink = savedDoodle;
		});
	} else if (type == 1) {
		chrome.storage.local.get("doodleExtra", (res) => {
			const savedDoodle = res.doodleExtra;
			logo.innerHTML = savedDoodle;
			doodleLink = savedDoodle;
		});
	}
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	console.log(request);
	if (request.link) {
		doodleLink = request.link;
		heightMain = request.height;
		if (!heightMain) {
			heightMain = 180;
		}
		let defaultData = `<img class="lnXdpd" alt="Google" src="${doodleLink}" height="${heightMain}" width="auto" data-atf="1" data-frt="0" object-fit="contain" margin-top="auto">`;
		let dataExtra = `<img class="jfN4p" src="${doodleLink}" style="background:none" alt="Google" height="30px" width="92px" data-csiid="1" data-atf="1" object-fit="cover">`;
		if (request.game) {
			linkGame = request.game;
			defaultData = `<img class="lnXdpd" alt="Google" src="${doodleLink}" style="cursor:pointer" height="${heightMain}" width="auto" data-atf="1" data-frt="0" object-fit="contain" margin-top="auto">`;
			dataExtra = `<a href="${request.game}" target="_blank"><img class="jfN4p" src="${doodleLink}" style="background:none" alt="Google" height="30px" width="92px" data-csiid="1" data-atf="1" object-fit="cover"></a>`;
		}

		logoMain.innerHTML = defaultData;
		chrome.storage.local.set({
			doodleMain: `${defaultData}`,
		});

		logoExtra.innerHTML = dataExtra;
		chrome.storage.local.set({
			doodleExtra: `${dataExtra}`,
		});
	} else {
		console.log("dont have any message");
		console.log(request.link);
	}
});

heightMain = 180;
widthMain = "auto";

let dataMain;

CheckAndSetInStorage(0, logoMain);

heightSearch = 30;
widthSearch = 92;
let dataSearch;

CheckAndSetInStorage(1, logoExtra);

let doodleElement = document.querySelector(".lnXdpd");

function attachDoodleClickListener() {
    let doodleElement = document.querySelector(".lnXdpd") || document.querySelector("img[alt='Google']");

    if (doodleElement) {
        console.log("[content.js] Doodle found, adding click event:", doodleElement);

        doodleElement.addEventListener("click", function (event) {
            event.preventDefault(); // Ngăn chặn mở link mặc định
            console.log("[content.js] Doodle clicked!");

            let gameURL = linkGame; // Lấy URL game từ alt
            if (gameURL) {
                console.log("[content.js] Sending game URL to background.js:", gameURL);

                chrome.runtime.sendMessage({
                    action: "showGamePopup",
                    game: gameURL
                });
            } else {
                console.log("[content.js] No game URL found.");
            }
        });
    } else {
        console.log("[content.js] Doodle not found, waiting...");
    }
}

// Theo dõi khi Doodle thay đổi trên trang
const observer = new MutationObserver(() => {
    attachDoodleClickListener();
});
observer.observe(document.body, { childList: true, subtree: true });

// Lần đầu chạy để kiểm tra nếu Doodle đã có sẵn trên trang
attachDoodleClickListener();




chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("[content.js] Received message:", request);

    if (request.action === "showGamePopup") {
        console.log("[content.js] Opening game popup with game:", request.game);
        showGamePopup(request.game);
    }
});

function showGamePopup(src) {
    if (!src) {
        console.error("[content.js] No game URL provided, cannot create popup.");
        return;
    }

    if (document.getElementById("gamePopup")) {
        console.log("[content.js] Popup already exists, skipping creation.");
        return;
    }

    console.log("[content.js] Creating popup for game:", src);

    let overlay = document.createElement("div");
    overlay.id = "gamePopupOverlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "9998";

    let popup = document.createElement("div");
    popup.id = "gamePopup";
    popup.style.position = "relative";
    popup.style.width = "80vw";
    popup.style.height = "80vh";
    popup.style.background = "white";
    popup.style.borderRadius = "10px";
    popup.style.boxShadow = "0 5px 15px rgba(0,0,0,0.3)";
    popup.style.display = "flex";
    popup.style.flexDirection = "column";
    popup.style.overflow = "hidden";
    popup.style.zIndex = "9999";

    let closeButton = document.createElement("button");
    closeButton.innerText = "✖";
    closeButton.style.position = "absolute";
    closeButton.style.top = "10px";
    closeButton.style.right = "10px";
    closeButton.style.border = "none";
    closeButton.style.background = "red";
    closeButton.style.color = "white";
    closeButton.style.padding = "5px 10px";
    closeButton.style.fontSize = "16px";
    closeButton.style.borderRadius = "5px";
    closeButton.style.cursor = "pointer";
    closeButton.addEventListener("click", function () {
        console.log("[content.js] Closing game popup.");
        document.body.removeChild(overlay);
    });

    let iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";

    popup.appendChild(closeButton);
    popup.appendChild(iframe);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    console.log("[content.js] Game popup created successfully.");
}
