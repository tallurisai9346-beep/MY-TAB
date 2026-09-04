import "./style.css";

const NASA_KEY = import.meta.env.VITE_NASA_API_KEY || "DEMO_KEY";

const APOD_URL = "https://api.nasa.gov/planetary/apod";
const PROFILE_KEY = "cosmotab-user-profile";
const LINKS_KEY = "cosmotab-links";
const NOTES_KEY = "cosmotab-todos";

const $ = (selector) => document.querySelector(selector);

const apodMedia = $("#apod-media");
const apodTitle = $("#apod-title");
const apodDate = $("#apod-date");
const apodText = $("#apod-explanation");
const dateInput = $("#apod-date-picker");
const fetchButton = $("#fetch-apod");

const linkList = $("#quick-links");
const noteList = $("#sticky-notes");

const fallbackImage =
  "https://images-assets.nasa.gov/image/PIA12348/PIA12348~orig.jpg";

function getData(key, defaultValue) {
  try {
    const saved = localStorage.getItem(key);

    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.log("Could not read saved data:", error);
  }

  return defaultValue;
}

function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(date);
}


// ---------------- CLOCK ----------------

function startClock() {
  const clock = $("#clock");
  const today = $("#today");

  function updateTime() {
    const now = new Date();

    if (clock) {
      clock.textContent = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });
    }

    if (today) {
      today.textContent = formatDate(now);
    }
  }

  updateTime();
  setInterval(updateTime, 1000);
}


// ---------------- SEARCH ----------------

function setupSearch() {
  const form = $("#search-form");
  const input = $("#search-input");

  if (!form || !input) {
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const searchText = input.value.trim();

    if (searchText === "") {
      return;
    }

    const url =
      "https://www.google.com/search?q=" +
      encodeURIComponent(searchText);

    window.location.href = url;
  });
}


// ---------------- PROFILE ----------------

function loadProfile() {
  const profile = getData(PROFILE_KEY, {
    name: "Explorer",
    emoji: "🚀"
  });

  const name = $("#user-name");
  const avatar = $("#user-avatar");
  const greeting = $("#greeting");

  if (name) {
    name.textContent = profile.name;
  }

  if (avatar) {
    avatar.textContent = profile.emoji;
  }

  if (greeting) {
    const hour = new Date().getHours();

    if (hour < 12) {
      greeting.textContent = "Good morning";
    } else if (hour < 18) {
      greeting.textContent = "Good afternoon";
    } else {
      greeting.textContent = "Good evening";
    }
  }
}

function setupProfile() {
  const editButton = $("#edit-profile");
  const nameInput = $("#name-input");
  const saveButton = $("#save-profile");
  const modal = $("#profile-modal");

  if (!editButton || !nameInput || !saveButton || !modal) {
    return;
  }

  editButton.addEventListener("click", function () {
    const profile = getData(PROFILE_KEY, {
      name: "Explorer",
      emoji: "🚀"
    });

    nameInput.value = profile.name;
    modal.classList.add("show");
  });

  saveButton.addEventListener("click", function () {
    const newName = nameInput.value.trim();

    const profile = getData(PROFILE_KEY, {
      name: "Explorer",
      emoji: "🚀"
    });

    profile.name = newName || "Explorer";

    saveData(PROFILE_KEY, profile);

    modal.classList.remove("show");

    loadProfile();
  });
}


// ---------------- EMOJI ----------------

function setupEmojiPicker() {
  const openButton = $("#change-emoji");
  const modal = $("#emoji-modal");

  if (!openButton || !modal) {
    return;
  }

  const emojiButtons = modal.querySelectorAll("[data-emoji]");

  openButton.addEventListener("click", function () {
    modal.classList.add("show");
  });

  emojiButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const profile = getData(PROFILE_KEY, {
        name: "Explorer",
        emoji: "🚀"
      });

      profile.emoji = button.dataset.emoji;

      saveData(PROFILE_KEY, profile);

      modal.classList.remove("show");

      loadProfile();
    });
  });
}


// ---------------- NASA APOD ----------------

async function getApod(selectedDate = "") {
  if (!apodMedia) {
    return;
  }

  apodMedia.classList.add("loading");

  if (apodTitle) {
    apodTitle.textContent = "Loading today's picture...";
  }

  if (apodDate) {
    apodDate.textContent = "";
  }

  if (apodText) {
    apodText.textContent = "";
  }

  const params = new URLSearchParams();

  params.set("api_key", NASA_KEY);
  params.set("thumbs", "true");

  if (selectedDate) {
    params.set("date", selectedDate);
  }

  try {
    const response = await fetch(APOD_URL + "?" + params.toString());

    if (!response.ok) {
      throw new Error("NASA request failed");
    }

    const data = await response.json();

    displayApod(data);
  } catch (error) {
    console.log("NASA picture could not be loaded:", error);

    if (apodTitle) {
      apodTitle.textContent = "NASA picture is unavailable";
    }

    if (apodText) {
      apodText.textContent =
        "The NASA picture could not be loaded right now. Please try again.";
    }

    apodMedia.innerHTML = `
      <img
        src="${fallbackImage}"
        alt="NASA space image"
      >
    `;
  }

  apodMedia.classList.remove("loading");
}

function displayApod(data) {
  if (apodTitle) {
    apodTitle.textContent =
      data.title || "Astronomy Picture of the Day";
  }

  if (apodDate) {
    if (data.date) {
      const date = new Date(data.date + "T00:00:00");
      apodDate.textContent = formatDate(date);
    } else {
      apodDate.textContent = "";
    }
  }

  if (apodText) {
    apodText.textContent =
      data.explanation || "No description is available.";
  }

  if (data.media_type === "image") {
    apodMedia.innerHTML = `
      <img
        src="${data.url}"
        alt="${data.title || "NASA Astronomy Picture"}"
      >
    `;

    return;
  }

  if (data.thumbnail_url) {
    apodMedia.innerHTML = `
      <a
        href="${data.url}"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src="${data.thumbnail_url}"
          alt="${data.title || "NASA video"}"
        >
      </a>
    `;

    return;
  }

  apodMedia.innerHTML = `
    <div class="video-message">
      <p>This day's NASA content is a video.</p>
      <a
        href="${data.url}"
        target="_blank"
        rel="noopener noreferrer"
      >
        Watch video
      </a>
    </div>
  `;
}

function setupApod() {
  if (!dateInput || !fetchButton) {
    return;
  }

  const today = new Date();

  dateInput.max = today.toISOString().split("T")[0];

  getApod();

  fetchButton.addEventListener("click", function () {
    getApod(dateInput.value);
  });
}


// ---------------- QUICK LINKS ----------------

function showLinks() {
  if (!linkList) {
    return;
  }

  const links = getData(LINKS_KEY, []);

  linkList.innerHTML = "";

  links.forEach(function (link, index) {
    const item = document.createElement("div");

    item.className = "quick-link";

    item.innerHTML = `
      <a
        href="${link.url}"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span>${link.title}</span>
      </a>

      <button
        class="link-delete"
        data-index="${index}"
        aria-label="Delete link"
      >
        ×
      </button>
    `;

    linkList.appendChild(item);
  });

  const deleteButtons =
    linkList.querySelectorAll(".link-delete");

  deleteButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const links = getData(LINKS_KEY, []);

      const index = Number(button.dataset.index);

      links.splice(index, 1);

      saveData(LINKS_KEY, links);

      showLinks();
    });
  });
}

function setupLinks() {
  const addButton = $("#add-link");
  const modal = $("#link-modal");
  const saveButton = $("#save-link");
  const titleInput = $("#link-title");
  const urlInput = $("#link-url");

  showLinks();

  if (!addButton || !modal || !saveButton) {
    return;
  }

  addButton.addEventListener("click", function () {
    titleInput.value = "";
    urlInput.value = "";

    modal.classList.add("show");

    titleInput.focus();
  });

  saveButton.addEventListener("click", function () {
    const title = titleInput.value.trim();
    let url = urlInput.value.trim();

    if (!title || !url) {
      return;
    }

    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    const links = getData(LINKS_KEY, []);

    links.push({
      title: title,
      url: url
    });

    saveData(LINKS_KEY, links);

    modal.classList.remove("show");

    showLinks();
  });
}


// ---------------- STICKY NOTES ----------------

function showNotes() {
  if (!noteList) {
    return;
  }

  const notes = getData(NOTES_KEY, []);

  noteList.innerHTML = "";

  notes.forEach(function (note, index) {
    const item = document.createElement("div");

    item.className = "sticky-note";

    if (note.done) {
      item.classList.add("done");
    }

    item.innerHTML = `
      <label>
        <input
          type="checkbox"
          data-note="${index}"
          ${note.done ? "checked" : ""}
        >

        <span>${note.text}</span>
      </label>

      <button
        class="note-delete"
        data-delete="${index}"
        aria-label="Delete note"
      >
        ×
      </button>
    `;

    noteList.appendChild(item);
  });

  const checkboxes =
    noteList.querySelectorAll("[data-note]");

  checkboxes.forEach(function (checkbox) {
    checkbox.addEventListener("change", function () {
      const notes = getData(NOTES_KEY, []);

      const index = Number(checkbox.dataset.note);

      notes[index].done = checkbox.checked;

      saveData(NOTES_KEY, notes);

      showNotes();
    });
  });

  const deleteButtons =
    noteList.querySelectorAll("[data-delete]");

  deleteButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const notes = getData(NOTES_KEY, []);

      const index = Number(button.dataset.delete);

      notes.splice(index, 1);

      saveData(NOTES_KEY, notes);

      showNotes();
    });
  });
}

function setupNotes() {
  const input = $("#note-input");
  const addButton = $("#add-note");

  showNotes();

  if (!input || !addButton) {
    return;
  }

  function addNote() {
    const text = input.value.trim();

    if (!text) {
      return;
    }

    const notes = getData(NOTES_KEY, []);

    notes.push({
      text: text,
      done: false
    });

    saveData(NOTES_KEY, notes);

    input.value = "";

    showNotes();
  }

  addButton.addEventListener("click", addNote);

  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      addNote();
    }
  });
}


// ---------------- MODALS ----------------

function setupModals() {
  const closeButtons =
    document.querySelectorAll("[data-close-modal]");

  closeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const modal = button.closest(".modal");

      if (modal) {
        modal.classList.remove("show");
      }
    });
  });

  const modals = document.querySelectorAll(".modal");

  modals.forEach(function (modal) {
    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        modal.classList.remove("show");
      }
    });
  });
}


// ---------------- START APP ----------------

document.addEventListener("DOMContentLoaded", function () {
  startClock();
  setupSearch();
  loadProfile();
  setupProfile();
  setupEmojiPicker();
  setupApod();
  setupLinks();
  setupNotes();
  setupModals();
});
