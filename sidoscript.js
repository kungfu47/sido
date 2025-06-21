  // Firebase config
    const firebaseConfig = {
      apiKey: "AIzaSyA4optbBsu0pWn4U22nl9u6E135FtaL_DU",
      authDomain: "sido-2a8f1.firebaseapp.com",
      databaseURL: "https://sido-2a8f1-default-rtdb.asia-southeast1.firebasedatabase.app",
      projectId: "sido-2a8f1",
      storageBucket: "sido-2a8f1.appspot.com",
      messagingSenderId: "248044778151",
      appId: "1:248044778151:web:f5fdc4f9363e9a8835e182"
    };
    firebase.initializeApp(firebaseConfig);
    const db = firebase.database();

    const audio = document.getElementById("audioPlayer");
    const streamSelect = document.getElementById("streamSelect");
    const playPauseBtn = document.getElementById("playPauseBtn");
    const shuffleBtn = document.getElementById("shuffleBtn");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const syncToggle = document.getElementById("syncToggle");
    const syncControls = document.getElementById("syncControls");
    const syncBtn = document.getElementById("syncBtn");
    const syncCodeInput = document.getElementById("syncCodeInput");

    let syncCode = null;
    let isShuffle = false;

    // Load default stream
    audio.src = streamSelect.value;

    // Theme
    document.querySelectorAll(".color-swatch").forEach(swatch => {
      swatch.onclick = () => {
        const color = swatch.dataset.color;
        document.body.style.backgroundColor = color;
      };
    });

    // Sync toggle UI
    syncToggle.addEventListener("change", () => {
      syncControls.classList.toggle("show", syncToggle.checked);
    });

    // Parse sync code from URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("sync")) {
      syncToggle.checked = true;
      syncControls.classList.add("show");
      syncCodeInput.value = urlParams.get("sync");
      syncCode = urlParams.get("sync");
      subscribeSync();
    }

    syncBtn.onclick = () => {
      syncCode = syncCodeInput.value.trim();
      if (syncCode) subscribeSync();
    };

    function subscribeSync() {
      const ref = db.ref("sync/" + syncCode);
      ref.on("value", snap => {
        const data = snap.val();
        if (!data) return;
        if (streamSelect.selectedIndex !== data.trackIndex) {
          streamSelect.selectedIndex = data.trackIndex;
          streamSelect.dispatchEvent(new Event("change"));
        }
isShuffle = data.shuffle ?? false;
        shuffleBtn.classList.toggle("active", isShuffle);
        if (data.action === "play") audio.play();
        if (data.action === "pause") audio.pause();
      });
    }

    function sendSyncState(action) {
      if (!syncCode) return;
      db.ref("sync/" + syncCode).set({
        action,
        trackIndex: streamSelect.selectedIndex,
shuffle: isShuffle,
        time: Date.now()
      });
    }

    // Controls
    streamSelect.onchange = () => {
      audio.src = streamSelect.value;
      audio.play();
      sendSyncState("play");
    };

    playPauseBtn.onclick = () => {
      if (audio.paused) {
        audio.play();
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        sendSyncState("play");
      } else {
        audio.pause();
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        sendSyncState("pause");
      }
    };

    nextBtn.onclick = () => {
      let i = streamSelect.selectedIndex;
      if (isShuffle) {
        let rand;
        do {
          rand = Math.floor(Math.random() * streamSelect.length);
        } while (rand === i);
        i = rand;
      } else {
        i = (i + 1) % streamSelect.length;
      }
      streamSelect.selectedIndex = i;
      streamSelect.dispatchEvent(new Event("change"));
    };

    prevBtn.onclick = () => {
      let i = streamSelect.selectedIndex;
      i = (i - 1 + streamSelect.length) % streamSelect.length;
      streamSelect.selectedIndex = i;
      streamSelect.dispatchEvent(new Event("change"));
    };

    shuffleBtn.onclick = () => {
      isShuffle = !isShuffle;
      shuffleBtn.classList.toggle("active", isShuffle);
sendSyncState(isShuffle ? "shuffle_on" : "shuffle_off");

    };

    // Views / Likes
    const viewRef = db.ref("metrics/views");
    const likeRef = db.ref("metrics/likes");

    viewRef.transaction(n => (n || 0) + 1);
    viewRef.on("value", snap => {
      document.getElementById("view-count").textContent = "LISTENS: " + (snap.val() || 0);
    });

    likeRef.on("value", snap => {
      document.getElementById("like-count").textContent = snap.val() || 0;
    });

    function like() {
      likeRef.transaction(n => (n || 0) + 1);
    }