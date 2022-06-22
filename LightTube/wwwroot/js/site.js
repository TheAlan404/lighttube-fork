// -- Search input --

const soundCache = {};
const playSound = (src) => {
    try {
        if(!soundCache[src]) soundCache[src] = new Audio(src);
        soundCache[src].cloneNode(true).play();
    } catch(e) {};
};

const soundEffects = {
    caps: () => playSound("/mp3/key-caps.mp3"),
    confirm: () => playSound("/mp3/key-confirm.mp3"),
    delete: () => playSound("/mp3/key-delete.mp3"),
    movement: () => playSound("/mp3/key-movement.mp3"),
    key: () => playSound(`/mp3/key-press-${Math.floor((Math.random() * 4) + 1)}.mp3`),
};

const searchInput = document.getElementById("search-input");
const searchForm = document.getElementById("search-form");
document.addEventListener("keydown", event => {
    if (event.isComposing) {
      return;
    }
    
    // dont do it if we are in watch
    // TODO shortcuts in /watch for stuff
    if (location.pathname == "/watch") return;

    if (event.target !== searchInput) searchInput.focus();
});

if (getCookie("ui_sounds") == "true") {
    // bruh
    let ignoreCaretMove = false;
    searchInput.addEventListener("input", (event) => {
        ignoreCaretMove = true;

        let isDelete = false;

        if(event.inputType) {
            // if inputType is present
            // https://rawgit.com/w3c/input-events/v1/index.html#interface-InputEvent-Attributes
            if ([
                "deleteWordBackward",
                "deleteWordForward",
                "deleteSoftLineBackward",
                "deleteSoftLineForward",
                "deleteEntireSoftLine",
                "deleteHardLineBackward",
                "deleteHardLineForward",
                "deleteByDrag",
                "deleteByCut",
                "deleteContent",
                "deleteContentBackward",
                "deleteContentForward",
            ].includes(event.inputType)) {
                isDelete = true;
            };
        } else {
            // if unsupported
            if (!event.data) isDelete = true;
        };

        if (isDelete) {
            soundEffects.delete();
        } else {
            if (hasUpperCase(event.data)) {
                soundEffects.caps();
            } else {
                soundEffects.key();
            };
        };
    });
    searchInput.addEventListener("selectionchange", () => {
        if (!ignoreCaretMove) soundEffects.movement();
        ignoreCaretMove = false;
    });
    searchForm.addEventListener("submit", (ev) => soundEffects.confirm());
}

const hasUpperCase = (str) => /[A-Z]/.test(str);

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
}

// -- Subscribe section --

const subscribeButtons = document.querySelectorAll("button.subscribe-button");
const subscribeToChannel = (e) => {
    const channelId = e.target.attributes["data-cid"].value;
    e.target.disabled = true;

    let xhr = new XMLHttpRequest();
    xhr.open("GET", "/Account/Subscribe?channel=" + channelId, false)
    xhr.send()

    e.target.disabled = false;
    if (xhr.status !== 200)
        alert("You need to login to subscribe to a channel")

    if (xhr.responseText === "true") {
        e.target.innerText = "Subscribed";
        e.target.classList.add("subscribed")
    } else {
        e.target.innerText = "Subscribe";
        e.target.classList.remove("subscribed")
    }
}

if (subscribeButtons.length > 0) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "/Account/SubscriptionsJson", false)
    xhr.send()

    let subscribedChannels = JSON.parse(xhr.responseText);

    for (let i = 0; i < subscribeButtons.length; i++) {
        let button = subscribeButtons[i];
        if (subscribedChannels.includes(button.attributes["data-cid"].value)) {
            button.innerText = "Subscribed";
            button.classList.add("subscribed")
        } else {
            button.innerText = "Subscribe";
            button.classList.remove("subscribed")
        }

        button.onclick = subscribeToChannel;
        button.style.display = ""
    }
}