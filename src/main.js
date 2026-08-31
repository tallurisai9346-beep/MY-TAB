import "./style.css";

const API_KEY = import.meta.env.VITE_NASA_API_KEY;

const titleEl = document.getElementById("apod-title");
const dateEl = document.getElementById("apod-date");
const explanationEl = document.getElementById("apod-explanation");
const mediaContainer = document.getElementById("apod-media-container");
const dateInput = document.getElementById("apod-date-input");
const refreshBtn = document.getElementById("apod-refresh-btn");
const appRoot = document.getElementById("app");

const USER_PROFILE_KEY = "cosmotab-user-profile";
const LINKS_STORAGE_KEY = "cosmotab-links";
const TODO_STORAGE_KEY = "cosmotab-todos";

const DEFAULT_BG_IMAGE = "https://apod.nasa.gov/apod/image/1905/M94_Hubble_960.jpg";

function $(id) {
  return document.getElementById(id);
}

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function setLoading(isLoading) {
  if (!appRoot) return;
  appRoot.dataset.loading = isLoading ? "true" : "false";
}

function setBackground(imageUrl) {
  document.body.style.backgroundImage = `linear-gradient(rgba(5, 7, 18, 0.36), rgba(5, 7, 18, 0.36)), url("${imageUrl}")`;
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center";
  document.body.style.backgroundAttachment = "fixed";
}

function loadUserProfile() {
  try {
    return JSON.parse(localStorage.getItem(USER_PROFILE_KEY)) || null;
  } catch {
    return null;
  }
}

function saveUserProfile(profile) {
  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
}

function applyAvatarEmoji(profile) {
  const emojiEl = $("avatar-emoji");
  if (!emojiEl) return;
  emojiEl.textContent = profile?.emoji || "🚀";
}

function updateGreetingAndFocus() {
  const now = new Date();
  const hour = now.getHours();

  let baseGreeting = "Good evening";
  if (hour < 5) baseGreeting = "Good night";
  else if (hour < 12) baseGreeting = "Good morning";
  else if (hour < 18) baseGreeting = "Good afternoon";

  const profile = loadUserProfile();
  const emoji = profile?.emoji || "🚀";

  const greetingEl = $("greeting");
  if (greetingEl) greetingEl.textContent = `${emoji} ${baseGreeting}`;

  const focusEl = $("focus");
  if (focusEl) focusEl.textContent = "Search the web, save links, and manage notes.";
}

function setupClockGreeting() {
  const clockEl = $("clock");
  const dateDisplayEl = $("date");

  function updateClockAndDate() {
    const now = new Date();

    if (clockEl) {
      clockEl.textContent = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    }

    if (dateDisplayEl) {
      dateDisplayEl.textContent = now.toLocaleDateString([], {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  }

  updateClockAndDate();
  updateGreetingAndFocus();
  setInterval(updateClockAndDate, 1000);
  setInterval(updateGreetingAndFocus, 60000);
}

function maybeShowUserSetup() {
  const profile = loadUserProfile();
  const modal = $("user-setup-modal");
  const emojiButtons = document.querySelectorAll(".emoji-btn");

  if (!modal || emojiButtons.length === 0) return;

  if (!profile) {
    modal.classList.remove("hidden");
    emojiButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const emoji = btn.dataset.emoji;
        if (!emoji) return;
        const newProfile = { emoji };
        saveUserProfile(newProfile);
        modal.classList.add("hidden");
        applyAvatarEmoji(newProfile);
        updateGreetingAndFocus();
      });
    });
  } else {
    applyAvatarEmoji(profile);
  }
}

async function fetchApod(dateString) {
  try {
    setLoading(true);
    if (titleEl) titleEl.textContent = "Loading NASA APOD...";
    if (explanationEl) explanationEl.textContent = "";
    if (mediaContainer) mediaContainer.innerHTML = "";

  const url = new URL("https://api.nasa.gov/planetary/apod");
url.searchParams.set("api_key", API_KEY || "DEMO_KEY");
url.searchParams.set("thumbs", "true");
if (dateString) url.searchParams.set("date", dateString);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`NASA API error: ${res.status}`);

    const data = await res.json();
    renderApod(data);
  } catch (err) {
    console.error(err);
    if (titleEl) titleEl.textContent = "Error loading APOD";
    if (dateEl) dateEl.textContent = "";
    if (explanationEl) explanationEl.textContent = "Please check your network or try again later.";
    if (mediaContainer) mediaContainer.innerHTML = "";
    setBackground(DEFAULT_BG_IMAGE);
  } finally {
    setLoading(false);
  }
}

function renderApod(data) {
  const {
    title,
    date,
    explanation,
    media_type,
    url,
    hdurl,
    thumbnail_url
  } = data;

  if (titleEl) titleEl.textContent = title;
  if (dateEl) dateEl.textContent = date;
  if (explanationEl) explanationEl.textContent = explanation || "";
  if (mediaContainer) mediaContainer.innerHTML = "";

  if (media_type === "image") {
    setBackground(hdurl || url);
  } else if (media_type === "video") {
    setBackground(thumbnail_url || DEFAULT_BG_IMAGE);
  } else {
    setBackground(DEFAULT_BG_IMAGE);
  }

  if (!mediaContainer) return;

  if (media_type === "image") {
    const img = document.createElement("img");
    img.src = url;
    img.alt = title;
    img.className = "apod-image";
    mediaContainer.appendChild(img);
  } else if (media_type === "video") {
    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.className = "apod-video";
    iframe.allowFullscreen = true;
    iframe.loading = "lazy";
    mediaContainer.appendChild(iframe);
  } else {
    mediaContainer.textContent = "Unsupported media type.";
  }
}

function setupControls() {
  const today = new Date();
  const todayStr = formatDate(today);

  if (dateInput) {
    dateInput.max = todayStr;
    dateInput.value = todayStr;
    dateInput.addEventListener("change", () => {
      fetchApod(dateInput.value || todayStr);
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      const value = dateInput?.value || todayStr;
      fetchApod(value);
    });
  }
}

function setupSearch() {
  const form = $("search-form");
  const input = $("search-input");
  if (!form || !input) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;
    window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  });
}

function loadLinks() {
  try {
    return JSON.parse(localStorage.getItem(LINKS_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveLinks(links) {
  localStorage.setItem(LINKS_STORAGE_KEY, JSON.stringify(links));
}

function renderLinks(links) {
  const container = $("links");
  if (!container) return;

  container.innerHTML = "";

  links.forEach((link, index) => {
    const chip = document.createElement("div");
    chip.className = "link-chip";

    const a = document.createElement("a");
    a.href = link.url;
    a.target = "_blank";
    a.rel = "noreferrer";
    a.textContent = link.name;

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.textContent = "✎";

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.textContent = "✕";

    editBtn.addEventListener("click", () => openLinkModal("edit", links, index));
    deleteBtn.addEventListener("click", () => {
      links.splice(index, 1);
      saveLinks(links);
      renderLinks(links);
    });

    chip.appendChild(a);
    chip.appendChild(editBtn);
    chip.appendChild(deleteBtn);
    container.appendChild(chip);
  });
}

let currentLinkMode = "add";
let currentLinkIndex = null;

function openLinkModal(mode, links, index = null) {
  currentLinkMode = mode;
  currentLinkIndex = index;

  const modal = $("link-modal");
  const title = $("link-modal-title");
  const nameInput = $("link-name");
  const urlInput = $("link-url");

  if (!modal || !title || !nameInput || !urlInput) return;

  if (mode === "edit" && index != null) {
    title.textContent = "Edit Quick Link";
    nameInput.value = links[index].name;
    urlInput.value = links[index].url;
  } else {
    title.textContent = "Add Quick Link";
    nameInput.value = "";
    urlInput.value = "";
  }

  modal.classList.remove("hidden");
  nameInput.focus();
}

function closeLinkModal() {
  const modal = $("link-modal");
  if (modal) modal.classList.add("hidden");
}

function setupLinks() {
  let links = loadLinks();

  if (links.length === 0) {
    links = [
      { name: "Stardance", url: "https://stardance.hackclub.com" },
      { name: "GitHub", url: "https://github.com" },
      { name: "Hackatime", url: "https://hackatime.hackclub.com" },
    ];
    saveLinks(links);
  }

  renderLinks(links);

  const addBtn = $("add-link-button");
  const modal = $("link-modal");
  const form = $("link-form");
  const cancelBtn = $("link-cancel");
  const nameInput = $("link-name");
  const urlInput = $("link-url");

  if (!addBtn || !modal || !form || !cancelBtn || !nameInput || !urlInput) return;

  addBtn.addEventListener("click", () => openLinkModal("add", links));
  cancelBtn.addEventListener("click", closeLinkModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeLinkModal();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const url = urlInput.value.trim();
    if (!name || !url) return;

    if (currentLinkMode === "edit" && currentLinkIndex != null) {
      links[currentLinkIndex] = { name, url };
    } else {
      links.push({ name, url });
    }

    saveLinks(links);
    renderLinks(links);
    closeLinkModal();
  });
}

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(TODO_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTodos(todos) {
  localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos));
}

function renderTodos(todos) {
  const grid = $("todo-grid");
  if (!grid) return;

  grid.innerHTML = "";
  grid.classList.toggle("single-note", todos.length === 1);

  todos.forEach((todo, index) => {
    const card = document.createElement("div");
    card.className = "sticky-note";
    if (todo.done) card.classList.add("done");
    card.style.background = todo.color || "#f7d96a";

    const textEl = document.createElement("div");
    textEl.className = "sticky-note-text";
    textEl.textContent = todo.text;

    const footer = document.createElement("div");
    footer.className = "sticky-note-footer";

    const timeEl = document.createElement("span");
    timeEl.textContent = todo.createdAt || "";

    const btns = document.createElement("div");
    btns.className = "sticky-note-buttons";

    const doneBtn = document.createElement("button");
    doneBtn.type = "button";
    doneBtn.textContent = todo.done ? "✔" : "✓";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.textContent = "✎";

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.textContent = "🗑";

    doneBtn.addEventListener("click", () => {
      todos[index].done = !todos[index].done;
      saveTodos(todos);
      renderTodos(todos);
    });

    editBtn.addEventListener("click", () => {
      const newText = prompt("Edit note:", todo.text);
      if (newText != null) {
        todos[index].text = newText.trim();
        saveTodos(todos);
        renderTodos(todos);
      }
    });

    deleteBtn.addEventListener("click", () => {
      if (confirm("Delete this note?")) {
        todos.splice(index, 1);
        saveTodos(todos);
        renderTodos(todos);
      }
    });

    btns.appendChild(doneBtn);
    btns.appendChild(editBtn);
    btns.appendChild(deleteBtn);
    footer.appendChild(timeEl);
    footer.appendChild(btns);

    card.appendChild(textEl);
    card.appendChild(footer);
    grid.appendChild(card);
  });
}

function setupTodo() {
  const form = $("todo-form");
  const input = $("todo-input");
  const colorInput = $("todo-color");
  let todos = loadTodos();
  renderTodos(todos);

  if (!form || !input) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    const stamp = new Date().toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });

    todos.push({
      text,
      done: false,
      createdAt: stamp,
      color: colorInput?.value || "#f7d96a",
    });

    saveTodos(todos);
    renderTodos(todos);
    input.value = "";
  });
}

function applyTilt(element) {
  element.addEventListener("mousemove", (e) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * 0;
    const rotateY = ((x - centerX) / centerX) * 0;
    element.style.transform = `perspective(0) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(0px)`;
  });

  element.addEventListener("mouseleave", () => {
    element.style.transform = "perspective(0) rotateX(0) rotateY(0) translateY(0px)";
  });
}

function setupTilt() {
  document.querySelectorAll(".media-container, .notes-section .todo").forEach(applyTilt);
}

document.addEventListener("DOMContentLoaded", () => {
  maybeShowUserSetup();
  setupClockGreeting();
  setupSearch();
  setupLinks();
  setupTodo();
  setupControls();
  setupTilt();
  fetchApod();
});


