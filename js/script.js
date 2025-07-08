// Actieve categorie die nu geselecteerd is (standaard: 'Werk')
let currentCategory = 'Werk';

// Alle belangrijke HTML-elementen ophalen waar we straks iets mee doen
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskDate = document.getElementById('task-date');
const taskList = document.getElementById('task-list');
const categoryList = document.getElementById('category-list');
const statusFilter = document.getElementById('status-filter');
const progressFill = document.getElementById('progress-fill');
const themeToggle = document.getElementById('theme-toggle');
const newCatForm = document.getElementById('new-category-form');
const newCatInput = document.getElementById('new-category-input');

// Deze datum wordt gebruikt voor de kalendernavigatie
let taskCalendarDate = new Date();
// Kleuren per categorie (voor styling)
const categoryColors = {
  'Werk': '#00aaff',
  'Persoonlijk': '#00cc66',
};

// Standaardkleuren voor nieuwe categorieën
const defaultColors = [
  '#ff6b6b',
  '#ffa502',
  '#1e90ff',
  '#2ed573',
  '#e84393',
  '#fdcb6e',
  '#00b894',
  '#d63031',
  '#0984e3'
];

// Maak een container voor de toastmeldingen
const toastContainer = document.createElement('div');
toastContainer.id = 'toast-container';
toastContainer.style.position = 'fixed';
toastContainer.style.bottom = '20px';
toastContainer.style.right = '20px';
toastContainer.style.zIndex = '1000';
document.body.appendChild(toastContainer);

// Functie om een toastmelding te tonen
function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.background = '#8e44ff';
  toast.style.color = '#fff';
  toast.style.padding = '10px 16px';
  toast.style.borderRadius = '6px';
  toast.style.boxShadow = '0 0 10px #8e44ff88';
  toast.style.marginTop = '10px';
  toast.style.opacity = '0';
  toast.style.transition = 'opacity 0.3s ease';
  toastContainer.appendChild(toast);
  requestAnimationFrame(() => toast.style.opacity = '1');
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300); // Verwijder de toast na de fade-out
  }, 2500);
}

// Functie om een willekeurige kleur te genereren
function getRandomColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 55%)`;
}

// Als de gebruiker eerder het lichte thema koos, dan activeren we dat hier
if (localStorage.getItem('theme') === 'light') {
  document.body.classList.add('light');
}
// Toggle tussen licht en donker thema
themeToggle.addEventListener('click', () => {
  document.body.classList.add('theme-transition');
  const isLight = document.body.classList.toggle('light');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  setTimeout(() => {
    document.body.classList.remove('theme-transition');
  }, 500);
});

// Voeg een event listener toe voor het toevoegen van nieuwe categorieën
newCatForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = newCatInput.value.trim(); // Verwijder spaties aan het begin en einde
  if (!name) return; // Als de invoer leeg is, doen we niets
  const cats = getCategories(); 
  if (!cats.includes(name)) {
    cats.push(name);
    localStorage.setItem('categories', JSON.stringify(cats));

    // Zorg ervoor dat de nieuwe categorie een kleur krijgt
    if (!categoryColors[name]) {
      const existingColors = Object.values(categoryColors);
      const unusedColor = defaultColors.find(c => !existingColors.includes(c)) || getRandomColor();
      categoryColors[name] = unusedColor;
    }

    renderCategories();
    showToast(`Categorie "${name}" toegevoegd ✅`);
  }
  newCatInput.value = '';
});

// Event listener voor het verwijderen van een taak
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const taskText = taskInput.value.trim();
  const date = taskDate.value;
  const repeatType = document.querySelector('input[name="repeat-type"]:checked')?.value || null;
  const repeatEvery = parseInt(document.getElementById('repeat-every')?.value || '1');
  if (!taskText) return;
  const newTask = {
    id: Date.now(),
    text: taskText,
    category: currentCategory,
    completedDates: [],
    date,
    repeat: repeatType,
    repeatEvery
  };

  const tasks = getTasks();
  tasks.push(newTask);
  saveTasks(tasks);

  taskInput.value = '';
  taskDate.value = '';
  renderTasks();
});
// Initialiseer de kalender navigatie
statusFilter.addEventListener('change', renderTasks);

// Functie om de taken op te halen uit localStorage
function getTasks() {
  return JSON.parse(localStorage.getItem('tasks')) || [];
}

// Functie om taken op te slaan in localStorage
function saveTasks(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Functie om een taak te verwijderen
function deleteTask(id) {
  const tasks = getTasks().filter(t => t.id !== id);
  saveTasks(tasks);
  renderTasks();
  showToast('Taak verwijderd 🗑️');
}

// Functie om een taak te markeren als voltooid of onvoltooid
function toggleComplete(id, specificDate = null) {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const dateToToggle = specificDate ?? task.date;
  if (!dateToToggle) return;

  if (!task.completedDates) task.completedDates = [];

  // Controleer of de datum al in de lijst staat
  const index = task.completedDates.indexOf(dateToToggle);
  if (index > -1) {
    task.completedDates.splice(index, 1);
  } else {
    task.completedDates.push(dateToToggle);
  }

  saveTasks(tasks);
  renderTasks();
}

// Functie om de categorieën op te halen uit localStorage of standaardwaarden
function getCategories() {
  const stored = JSON.parse(localStorage.getItem('categories')) || ["Werk", "Persoonlijk"];
  return ["Alles", ...stored];
}

// Functie om de categorieën weer te geven in de UI
function renderCategories() {
  const cats = getCategories();
  categoryList.innerHTML = ''; // Reset de lijst
  cats.forEach(cat => {
    const li = document.createElement('li');
    li.dataset.category = cat;
    li.classList.toggle('active', cat === currentCategory);
    const span = document.createElement('span');
    span.textContent = cat;
    span.style.flex = '1';
    span.style.cursor = 'pointer';
    span.addEventListener('click', () => {
      currentCategory = cat;
      renderCategories();
      renderTasks();
    });
    li.style.display = 'flex';
    li.style.alignItems = 'center';
    li.style.justifyContent = 'space-between';
    li.appendChild(span);
    // Alleen toevoegen van de delete knop als het geen standaard categorie is
    if (cat !== 'Werk' && cat !== 'Persoonlijk' && cat !== 'Alles') {
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '🗑️';
      deleteBtn.classList.add('cat-delete-btn');
      deleteBtn.title = 'Categorie verwijderen';
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteCategory(cat);
      });
      li.appendChild(deleteBtn);
    }
    categoryList.appendChild(li);
  });

  // Update de mobiele categorie select
  const mobileCategory = document.getElementById('mobile-category');
  if (mobileCategory) {
    mobileCategory.innerHTML = '';
    cats.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      opt.selected = (cat === currentCategory);
      mobileCategory.appendChild(opt);
    });
    mobileCategory.style.display = window.innerWidth <= 768 ? 'block' : 'none';
  }
}

// Functie om een categorie te verwijderen
function deleteCategory(name) {
  if (["Werk", "Persoonlijk"].includes(name)) return;
  if (confirm(`Weet je zeker dat je de categorie "${name}" wilt verwijderen? Alle bijbehorende taken worden ook verwijderd.`)) {
    let cats = getCategories().filter(c => c !== name);
    localStorage.setItem('categories', JSON.stringify(cats));
    let tasks = getTasks().filter(t => t.category !== name);
    saveTasks(tasks);
    if (currentCategory === name) {
      currentCategory = cats.includes('Werk') ? 'Werk' : cats[0] || 'Persoonlijk';
    }
    renderCategories();
    renderTasks();
    showToast(`Categorie "${name}" verwijderd 🗑️`);
  }
}

let activeCalendarDay = null; // De actieve dag in de kalender, voor popup interacties

// Functie om de kalender te renderen
function renderCalendar() {
  const container = document.getElementById('calendar-container');
  const monthLabel = document.getElementById('calendar-month');
  container.innerHTML = ''; // Reset de kalender container

  const year = taskCalendarDate.getFullYear();
  const month = taskCalendarDate.getMonth();
  const monthName = taskCalendarDate.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' });
  monthLabel.textContent = monthName; // Zet de maandlabel tekst

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1);
  const startDay = (firstDay.getDay() + 6) % 7; // Maandag als eerste dag van de week

  const tasks = getTasks();
  const isMobile = window.innerWidth <= 768;

  // Voeg lege divs toe voor de dagen van de week die niet in de maand vallen
  for (let i = 0; i < startDay; i++) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'calendar-day empty';
    container.appendChild(emptyDiv);
  }

  // Loop door alle dagen van de maand en voeg taken toe
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const currentDate = new Date(year, month, day);

    // Filter taken voor deze specifieke dag
    const dayTasks = tasks.filter(t => {
      if (!t.date) return false;

      if (t.completedDates?.includes(dateStr)) return false;

      const [by, bm, bd] = t.date.split('-');
      const baseDate = new Date(+by, +bm - 1, +bd);

      if (t.date === dateStr) return true;

      // Wekelijkse herhaling
      if (t.repeat === 'weekly') {
        const diffDays = Math.floor((currentDate - baseDate) / (1000 * 60 * 60 * 24));
        const isWeekday = currentDate.getDay() >= 1 && currentDate.getDay() <= 5;
        return diffDays >= 0 && isWeekday && Math.floor(diffDays / 7) % t.repeatEvery === 0;
      }

      // Maandelijkse herhaling
      if (t.repeat === 'monthly') {
        return baseDate.getDate() === currentDate.getDate();
      }

      return false;
    });

    // Maak een div voor de dag
    const div = document.createElement('div');
    div.className = 'calendar-day';

    const today = new Date();
    const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
    if (isToday) div.classList.add('today-cell');

    div.innerHTML = `<strong>${day}</strong>`;

    // Voeg taken toe aan de dag
    if (dayTasks.length > 0) {
      const maxVisible = isMobile ? 5 : 3;

      dayTasks.slice(0, maxVisible).forEach(task => {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'calendar-dot';
        taskDiv.textContent = task.text.length > 30 ? task.text.slice(0, 30) + '…' : task.text;
        taskDiv.style.borderLeftColor = categoryColors[task.category] || '#8e44ff';

        if (task.completedDates?.includes(dateStr)) {
          taskDiv.style.textDecoration = 'line-through';
          taskDiv.style.opacity = '0.6';
        }

        div.appendChild(taskDiv);
      });

      // Als er meer taken zijn dan we kunnen weergeven, tonen we een "meer" link
      if (dayTasks.length > maxVisible) {
        const more = document.createElement('div');
        more.className = 'calendar-dot';
        more.textContent = `+${dayTasks.length - maxVisible} meer`;
        more.style.fontStyle = 'italic';
        more.title = 'Klik voor meer taken';
        div.appendChild(more);
      }
    }

    // Voeg een event listener toe voor het openen van de popup bij klikken
    div.addEventListener('click', () => {
      if (activeCalendarDay) activeCalendarDay.classList.remove('active');
      div.classList.add('active');
      activeCalendarDay = div;
      openDayPopup(dateStr, dayTasks);
    });

    container.appendChild(div);
  }
}


function setupCalendarControls() {
  // Vorige maand tonen
  document.getElementById('prev-month').addEventListener('click', () => {
    taskCalendarDate.setMonth(taskCalendarDate.getMonth() - 1);
    renderTasks();
  });
  // Volgende maand tonen
  document.getElementById('next-month').addEventListener('click', () => {
    taskCalendarDate.setMonth(taskCalendarDate.getMonth() + 1);
    renderTasks();
  });
}

function renderTasks() {
  let tasks = getTasks();
  // Filter op huidige categorie (behalve als je 'Alles' hebt geselecteerd)
  if (currentCategory !== "Alles") {
    tasks = tasks.filter(t => t.category === currentCategory);
  }
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Houd alleen de taken van vandaag over, inclusief herhaaltaken
  tasks = tasks.filter(t => {
    if (!t.date) return false;
    const taskDate = new Date(t.date);
    if (t.repeat === 'weekly') {
      const diffDays = Math.floor((now - taskDate) / (1000 * 60 * 60 * 24));
      const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;
      return diffDays >= 0 && isWeekday && Math.floor(diffDays / 7) % t.repeatEvery === 0;
    }
    if (t.repeat === 'monthly') {
      return taskDate.getDate() === now.getDate();
    }
    return t.date === todayStr;
  });

  // Filter op status (alle, actieve of voltooide)
  const filter = statusFilter.value;
  if (filter === 'active') {
    tasks = tasks.filter(t => !t.completedDates?.includes(todayStr));
  }
  if (filter === 'completed') {
    tasks = tasks.filter(t => t.completedDates?.includes(todayStr));
  }

  // Sorteer taken op ID (nieuwste eerst)
  tasks.sort((a, b) => b.id - a.id);

  // Taken weergeven in HTML
  taskList.innerHTML = '';
  tasks.forEach(task => {
    const isCompleted = task.completedDates?.includes(todayStr);
    const div = document.createElement('div');
    div.className = 'task' + (isCompleted ? ' completed' : '');
    div.setAttribute('draggable', true);
    div.dataset.id = task.id;

    div.innerHTML = `
      <span onclick="toggleComplete(${task.id}, '${todayStr}')">${task.text} (${todayStr})</span>
      <span class="delete-btn" onclick="deleteTask(${task.id})">🗑️</span>
    `;
    taskList.appendChild(div);
  });

  enableDragAndDrop();
  updateProgress();
  renderCalendar();
  renderCategories();
  renderCompletedHistory();
  renderUpcomingTasks();
}

function enableDragAndDrop() {
  const draggables = document.querySelectorAll('.task');
  let dragged;
  draggables.forEach(task => {
    task.addEventListener('dragstart', () => dragged = task);
    task.addEventListener('dragover', e => e.preventDefault());
    task.addEventListener('drop', () => {
      const allTasks = getTasks();
      const draggedId = parseInt(dragged.dataset.id);
      const droppedId = parseInt(task.dataset.id);
      const fromIndex = allTasks.findIndex(t => t.id === draggedId);
      const toIndex = allTasks.findIndex(t => t.id === droppedId);
      const [moved] = allTasks.splice(fromIndex, 1);
      allTasks.splice(toIndex, 0, moved);
      saveTasks(allTasks);
      renderTasks();
    });
  });
}

function renderCompletedHistory() {
  const container = document.getElementById('completed-history-list');
  const allTasks = getTasks();
  container.innerHTML = '';

  const grouped = {}; // Object om taken te groeperen per categorie en maand

  // Groepeer de voltooide taken per categorie en maand
  allTasks.forEach(task => {
    if (task.completedDates && task.completedDates.length > 0) {
      task.completedDates.forEach(date => {
        const category = task.category;
        const monthKey = new Date(date).toLocaleDateString('nl-NL', { year: 'numeric', month: 'long' });

        if (!grouped[category]) grouped[category] = {};
        if (!grouped[category][monthKey]) grouped[category][monthKey] = [];

        grouped[category][monthKey].push({
          text: task.text,
          date,
          category
        });
      });
    }
  });

  const categoryNames = Object.keys(grouped).sort();

  // Als er geen voltooide taken zijn, tonen we een bericht
  if (categoryNames.length === 0) {
    container.innerHTML = '<p>Geen voltooide taken.</p>';
    return;
  }

  // Toon gesorteerd per categorie → per maand → per taak
  categoryNames.forEach(cat => {
    const groupDiv = document.createElement('div');
    groupDiv.classList.add('completed-group');

    const title = document.createElement('h3');
    title.textContent = cat;
    groupDiv.appendChild(title);

    const months = Object.keys(grouped[cat]).sort((a, b) => {
      const da = new Date("1 " + a);
      const db = new Date("1 " + b);
      return db - da;
    });

    months.forEach(month => {
      const monthDiv = document.createElement('div');
      monthDiv.classList.add('completed-month');

      const monthTitle = document.createElement('h4');
      monthTitle.textContent = month;
      monthDiv.appendChild(monthTitle);

      grouped[cat][month].sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(entry => {
        const li = document.createElement('div');
        li.classList.add('completed-task-item');
        li.textContent = `${entry.text} (${new Date(entry.date).toLocaleDateString('nl-NL')})`;
        li.style.borderLeftColor = categoryColors[entry.category] || '#8e44ff';
        monthDiv.appendChild(li);
      });

      groupDiv.appendChild(monthDiv);
    });

    container.appendChild(groupDiv);
  });
}

function updateProgress() {
  const todayStr = new Date().toISOString().split('T')[0];

  const all = getTasks().filter(t => {
    if (!t.date) return false;

    // Filter op categorie als het NIET 'Alles' is
    if (currentCategory !== "Alles" && t.category !== currentCategory) return false;

    const currentDate = new Date(todayStr);
    const taskDate = t.date ? new Date(t.date) : null;

    if (t.repeat === 'weekly' && taskDate) {
      const diffDays = Math.floor((currentDate - taskDate) / (1000 * 60 * 60 * 24));
      const isWeekday = currentDate.getDay() >= 1 && currentDate.getDay() <= 5;
      return diffDays >= 0 && isWeekday && Math.floor(diffDays / 7) % t.repeatEvery === 0;
    }

    if (t.repeat === 'monthly' && taskDate) {
      return currentDate.getDate() === taskDate.getDate();
    }

    return t.date === todayStr;
  });

  let completed = 0;

  all.forEach(t => {
    if (t.completedDates?.includes(todayStr)) {
      completed++;
    }
  });

  const percent = all.length ? (completed / all.length) * 100 : 0;
  progressFill.style.width = `${percent}%`;
}

document.getElementById('mobile-category')?.addEventListener('change', e => {
  currentCategory = e.target.value;
  renderCategories();
  renderTasks();
});

function openDayPopup(dateStr, tasks) {
  const popup = document.getElementById('day-popup');
  const popupDate = document.getElementById('popup-date');
  const popupTasks = document.getElementById('popup-tasks');
  const popupInput = document.getElementById('popup-task-input');
  const popupForm = document.getElementById('popup-task-form');
  const popupCategory = document.getElementById('popup-task-category');

  // Toon gekozen datum in mooie Nederlandse stijl
  popupDate.textContent = new Date(dateStr).toLocaleDateString('nl-NL', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  //Taken voor die dag weergeven
  popupTasks.innerHTML = '';
  if (tasks.length === 0) {
    popupTasks.innerHTML = '<li>Geen taken op deze dag.</li>';
  } else {
    tasks.forEach(task => {
      const li = document.createElement('li');
      li.style.borderLeftColor = categoryColors[task.category] || '#8e44ff';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.style.marginRight = '8px';
      checkbox.checked = task.completedDates?.includes(dateStr);

      //Taak afvinken vanuit popup
      checkbox.addEventListener('change', () => {
        toggleComplete(task.id, dateStr);
        renderTasks();
        openDayPopup(dateStr, getTasksForDate(dateStr));
      });

      const label = document.createElement('span');
      label.textContent = task.text;

      li.appendChild(checkbox);
      li.appendChild(label);
      popupTasks.appendChild(li);
    });
  }

  // Categorieën vullen in het formulier
  popupCategory.innerHTML = '';
  getCategories().forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    if (cat === currentCategory) opt.selected = true;
    popupCategory.appendChild(opt);
  });

  popupInput.value = '';

  //Nieuwe taak toevoegen voor deze specifieke dag
  popupForm.onsubmit = (e) => {
    e.preventDefault();
    const text = popupInput.value.trim();
    const category = popupCategory.value;
    if (!text || !category) return;

    const newTask = {
      id: Date.now(),
      text: text,
      category: category,
      completedDates: [],
      date: dateStr,
      repeat: '',
      repeatEvery: 1
    };

    const allTasks = getTasks();
    allTasks.push(newTask);
    saveTasks(allTasks);
    popupInput.value = '';
    renderTasks();
    openDayPopup(dateStr, getTasksForDate(dateStr));
  };

  popup.classList.remove('hidden');

  // Helperfunctie om alle taken te zoeken die op deze dag horen
  function getTasksForDate(dateStr) {
    const allTasks = getTasks();
    const targetDate = new Date(dateStr);

    return allTasks.filter(t => {
      if (t.date === dateStr) return true;

      const start = t.date ? new Date(t.date) : null;
      if (!t.repeat || !start) return false;

      const diffDays = Math.floor((targetDate - start) / (1000 * 60 * 60 * 24));

      if (t.repeat === 'weekly') {
        const day = targetDate.getDay();
        return diffDays >= 0 && (day >= 1 && day <= 5) && Math.floor(diffDays / 7) % t.repeatEvery === 0;
      }

      if (t.repeat === 'monthly') {
        return start.getDate() === targetDate.getDate();
      }

      return false;
    });
  }
}


function renderDayHeaders() {
  const dayNamesShort = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];
  const dayNamesFull = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
  const container = document.getElementById('day-names');
  container.innerHTML = '';
  const isMobile = window.innerWidth < 768;
  const names = isMobile ? dayNamesShort : dayNamesFull;

  const today = new Date();
  const todayIndex = (today.getDay() + 6) % 7; // Maandag als eerste dag van de week

  //Genereer de dag headers
  names.forEach((name, i) => {
    const div = document.createElement('div');
    div.textContent = name;
    if (i === todayIndex) {
      div.classList.add('today-header');
    }
    container.appendChild(div);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  const today = new Date();
  // Extra: spring naar volgende maand als het 1e van de maand is
  if (today.getDate() === 1) {
    taskCalendarDate.setMonth(taskCalendarDate.getMonth() + 1);
  }

  renderDayHeaders();
  renderTasks();
  setupCalendarControls();

  //Toggle voor 'komende taken' uitschuiven
  document.getElementById('toggle-upcoming').addEventListener('click', () => {
    const wrapper = document.getElementById('upcoming-tasks-wrapper');
    const btn = document.getElementById('toggle-upcoming');
    wrapper.classList.toggle('hidden');
    btn.innerHTML = wrapper.classList.contains('hidden')
      ? '📅 Komende taken deze maand ⮟'
      : '📅 Komende taken deze maand ⮝';
  });

  // Popup voor komende taken openen
  document.getElementById('toggle-upcoming').addEventListener('click', () => {
  document.getElementById('upcoming-popup').classList.remove('hidden');
});
// Sluit de popup voor komende taken
document.getElementById('close-upcoming-popup').addEventListener('click', () => {
  document.getElementById('upcoming-popup').classList.add('hidden');
});

document.getElementById('close-popup').addEventListener('click', () => {
  document.getElementById('day-popup').classList.add('hidden');
});

document.getElementById('close-history-popup').addEventListener('click', () => {
  document.getElementById('history-popup').classList.add('hidden');
});

document.getElementById('toggle-completed-history').addEventListener('click', () => {
  document.getElementById('history-popup').classList.remove('hidden');
});


});

function moveCategoryFormMobile() {
  const form = document.getElementById('new-category-form');
  const mobileCategory = document.getElementById('mobile-category');

  if (window.innerWidth <= 768) {
    // Voeg het formulier direct na de mobiele dropdown toe
    if (mobileCategory && form && mobileCategory.parentElement) {
      mobileCategory.parentElement.insertBefore(form, mobileCategory.nextSibling);
      form.style.display = 'flex';
      form.style.flexDirection = 'row';
      form.style.gap = '8px';
      form.style.marginBottom = '16px';
    }
  } else {
    // Verplaats terug naar aside als desktop
    const aside = document.querySelector('aside');
    if (aside && form && !aside.contains(form)) {
      aside.appendChild(form);
      form.style.display = '';
      form.style.flexDirection = '';
      form.style.marginBottom = '';
    }
  }
}

window.addEventListener('resize', moveCategoryFormMobile);
moveCategoryFormMobile(); // Initieel aanroepen bij DOM load


function renderUpcomingTasks() {
  const list = document.getElementById('upcoming-tasks-list');
  const countSpan = document.getElementById('upcoming-count');
  list.innerHTML = '';
  let totalUpcoming = 0;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const lastDay = new Date(year, month + 1, 0).getDate();

  const allTasks = getTasks();
  const upcomingTasks = [];

  // Loop door de dagen van deze maand, vanaf vandaag tot het einde van de maand
  for (let day = today; day <= lastDay; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dateObj = new Date(dateStr);

    // Filter taken die op deze dag vallen of herhaald worden
    const tasksForDay = allTasks.filter(t => {
      if (!t.date) return false;
      if (t.completedDates?.includes(dateStr)) return false;

      const [y, m, d] = t.date.split('-');
      const baseDate = new Date(+y, +m - 1, +d);

      if (t.date === dateStr) return true;

      if (t.repeat === 'weekly') {
        const diffDays = Math.floor((dateObj - baseDate) / (1000 * 60 * 60 * 24));
        const isWeekday = dateObj.getDay() >= 1 && dateObj.getDay() <= 5;
        return diffDays >= 0 && isWeekday && Math.floor(diffDays / 7) % t.repeatEvery === 0;
      }

      if (t.repeat === 'monthly') {
        return baseDate.getDate() === dateObj.getDate();
      }

      return false;
    });

    // Voeg de taken voor deze dag toe aan de lijst van komende taken
    tasksForDay.forEach(task => {
      upcomingTasks.push({
        ...task,
        date: dateStr
      });
    });
  }

  totalUpcoming = upcomingTasks.length;

  if (totalUpcoming === 0) {
    list.innerHTML = '<li>Geen komende taken deze maand.</li>';
  } else {
    // Sorteer de komende taken op datum
    upcomingTasks.sort((a, b) => new Date(a.date) - new Date(b.date));

    upcomingTasks.forEach(task => {
      const li = document.createElement('li');
      const formattedDate = new Date(task.date).toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'long'
      });

      li.style.borderLeftColor = categoryColors[task.category] || '#8e44ff';

      li.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
          <span>${task.text} (${formattedDate})</span>
          <button class="delete-btn" title="Taak alleen voor deze dag verwijderen">🗑️</button>
        </div>
      `;

      //Taak verwijderen voor deze specifieke dag
      const deleteBtn = li.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Taak "${task.text}" verwijderen op ${formattedDate}?`)) {
          const all = getTasks();
          const taskToUpdate = all.find(t => t.id === task.id);
          if (!taskToUpdate) return;

          if (!Array.isArray(taskToUpdate.completedDates)) {
            taskToUpdate.completedDates = [];
          }

          if (!taskToUpdate.completedDates.includes(task.date)) {
            taskToUpdate.completedDates.push(task.date);
          }

          saveTasks(all);
          renderTasks();
        }
      });

      list.appendChild(li);
    });
  }
  
  // Update het aantal komende taken
  if (countSpan) {
    countSpan.textContent = totalUpcoming;
  }
}

window.addEventListener('resize', () => {
  renderDayHeaders();
  renderCalendar();
  const mobileCategory = document.getElementById('mobile-category');
  if (mobileCategory) {
    mobileCategory.style.display = window.innerWidth <= 768 ? 'block' : 'none';
  }
});