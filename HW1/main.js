let data = JSON.parse(localStorage.getItem("pro") || '{"notes":[],"folders":[]}');
let current = null;
let isRendering = false;

function save(){
  localStorage.setItem("pro", JSON.stringify(data));
}

function addMarkdownButtons() {
  const formatBar = document.querySelector('.format-bar');
  
  const markdownBtn = document.createElement('button');
  markdownBtn.textContent = 'MD';
  markdownBtn.title = 'حالت Markdown';
  markdownBtn.onclick = toggleMarkdownMode;
  markdownBtn.style.background = '#a855f7';
  markdownBtn.style.color = 'white';
  formatBar.appendChild(markdownBtn);
}

let markdownMode = true;
let previewMode = false;

function toggleMarkdownMode() {
  markdownMode = !markdownMode;
  if(current) {
    if(markdownMode) {
      current.content = htmlToMarkdown(current.content);
    } else {
      current.content = markdownToHtml(current.content);
    }
    document.getElementById("content").innerHTML = current.content;
    save();
  }
}

function markdownToHtml(md) {
  if(!md) return '';
  
  let html = md;
  
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/^###### (.*)$/gm, '<h6>$1</h6>');
  html = html.replace(/^##### (.*)$/gm, '<h5>$1</h5>');
  html = html.replace(/^#### (.*)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
  html = html.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
  html = html.replace(/(?<!_)_(?!_)(.*?)(?<!_)_(?!_)/g, '<em>$1</em>');
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
  html = processOrderedLists(html);
  html = processUnorderedLists(html, '-');
  html = processUnorderedLists(html, '\\*');
  html = html.replace(/^---$/gm, '<hr>');
  
  let lines = html.split('\n');
  let inList = false;
  let inCode = false;
  let result = [];
  
  for(let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    if(line.includes('<pre><code>')) inCode = true;
    if(line.includes('</code></pre>')) inCode = false;
    if(line.match(/<(ul|ol)>/)) inList = true;
    if(line.match(/<\/(ul|ol)>/)) inList = false;
    
    if(!inCode && !inList && line.trim() !== '' && !line.match(/^<h[1-6]|<hr|<li/)) {
      if(!line.match(/^<(p|ul|ol|pre|h[1-6]|hr)/)) {
        line = '<p>' + line + '</p>';
      }
    }
    result.push(line);
  }
  
  html = result.join('\n');
  return html;
}

function processOrderedLists(text) {
  let lines = text.split('\n');
  let result = [];
  let inList = false;
  let listStack = [];
  
  for(let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let match = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
    
    if(match) {
      let indent = match[1].length;
      let content = match[3];
      let level = Math.floor(indent / 2);
      
      if(!inList) {
        result.push('<ol>');
        listStack.push(1);
        inList = true;
      }
      
      while(listStack.length > level + 1) {
        result.push('</ol>');
        listStack.pop();
      }
      while(listStack.length < level + 1) {
        result.push('<ol>');
        listStack.push(1);
      }
      
      result.push(`<li>${content}</li>`);
    } else {
      if(inList && line.trim() !== '' && !line.match(/^(\s*)(\d+)\./)) {
        while(listStack.length > 0) {
          result.push('</ol>');
          listStack.pop();
        }
        inList = false;
      }
      result.push(line);
    }
  }
  
  while(listStack.length > 0) {
    result.push('</ol>');
    listStack.pop();
  }
  
  return result.join('\n');
}

function processUnorderedLists(text, marker) {
  let lines = text.split('\n');
  let result = [];
  let inList = false;
  let listStack = [];
  
  for(let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let regex = new RegExp(`^(\\s*)${marker}\\s+(.*)$`);
    let match = line.match(regex);
    
    if(match) {
      let indent = match[1].length;
      let content = match[2];
      let level = Math.floor(indent / 2);
      
      if(!inList) {
        result.push('<ul>');
        listStack.push(1);
        inList = true;
      }
      
      while(listStack.length > level + 1) {
        result.push('</ul>');
        listStack.pop();
      }
      while(listStack.length < level + 1) {
        result.push('<ul>');
        listStack.push(1);
      }
      
      result.push(`<li>${content}</li>`);
    } else {
      if(inList && line.trim() !== '' && !line.match(new RegExp(`^(\\s*)${marker}`))) {
        while(listStack.length > 0) {
          result.push('</ul>');
          listStack.pop();
        }
        inList = false;
      }
      result.push(line);
    }
  }
  
  while(listStack.length > 0) {
    result.push('</ul>');
    listStack.pop();
  }
  
  return result.join('\n');
}

function htmlToMarkdown(html) {
  if(!html) return '';
  
  let md = html;
  
  md = md.replace(/<h1>(.*?)<\/h1>/g, '# $1\n');
  md = md.replace(/<h2>(.*?)<\/h2>/g, '## $1\n');
  md = md.replace(/<h3>(.*?)<\/h3>/g, '### $1\n');
  md = md.replace(/<h4>(.*?)<\/h4>/g, '#### $1\n');
  md = md.replace(/<h5>(.*?)<\/h5>/g, '##### $1\n');
  md = md.replace(/<h6>(.*?)<\/h6>/g, '###### $1\n');
  md = md.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
  md = md.replace(/<b>(.*?)<\/b>/g, '**$1**');
  md = md.replace(/<em>(.*?)<\/em>/g, '*$1*');
  md = md.replace(/<i>(.*?)<\/i>/g, '*$1*');
  md = md.replace(/<a href="(.*?)"(?: target="_blank")?>(.*?)<\/a>/g, '[$2]($1)');
  md = md.replace(/<code>(.*?)<\/code>/g, '`$1`');
  md = md.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, '```\n$1\n```\n');
  
  md = md.replace(/<ol>([\s\S]*?)<\/ol>/g, (match, content) => {
    let items = [];
    let liRegex = /<li>(.*?)<\/li>/g;
    let liMatch;
    let counter = 1;
    while((liMatch = liRegex.exec(content)) !== null) {
      items.push(`${counter}. ${liMatch[1]}`);
      counter++;
    }
    return items.join('\n') + '\n';
  });
  
  md = md.replace(/<ul>([\s\S]*?)<\/ul>/g, (match, content) => {
    let items = [];
    let liRegex = /<li>(.*?)<\/li>/g;
    let liMatch;
    while((liMatch = liRegex.exec(content)) !== null) {
      items.push(`- ${liMatch[1]}`);
    }
    return items.join('\n') + '\n';
  });
  
  md = md.replace(/<p>(.*?)<\/p>/g, '$1\n\n');
  md = md.replace(/<[^>]*>/g, '');
  md = md.replace(/\n{3,}/g, '\n\n');
  
  return md.trim();
}

function addNote(){
  let n = {
    id: Date.now(),
    title: "جدید",
    content: "",
    folder: null,
    pinned: false,
    date: Date.now()
  };

  data.notes.push(n);
  save();
  render();
  openNote(n.id);
}

function setColor(color){
  document.execCommand("foreColor", false, color);
}

function addFolder(){
  let name = prompt("نام پوشه جدید:");
  if(!name || name.trim() === "") return;

  let exists = data.folders.some(f => f.name === name.trim());
  if(exists) {
    alert("پوشه‌ای با این نام قبلاً وجود دارد!");
    return;
  }

  data.folders.push({
    id: Date.now(),
    name: name.trim()
  });

  save();
  render();
}

function editFolder(folderId) {
  let folder = data.folders.find(f => f.id === folderId);
  if(!folder) return;
  
  let newName = prompt("نام جدید پوشه:", folder.name);
  if(!newName || newName.trim() === "") return;
  
  let exists = data.folders.some(f => f.id !== folderId && f.name === newName.trim());
  if(exists) {
    alert("پوشه‌ای با این نام قبلاً وجود دارد!");
    return;
  }
  
  folder.name = newName.trim();
  save();
  render();
}

function deleteFolder(folderId) {
  let folder = data.folders.find(f => f.id === folderId);
  if(!folder) return;
  
  let noteCount = data.notes.filter(n => n.folder === folderId).length;
  let message = `آیا از حذف پوشه "${folder.name}" مطمئن هستید؟\n`;
  
  if(noteCount > 0) {
    message += `\n⚠️ این پوشه شامل ${noteCount} یادداشت است که پس از حذف پوشه، این یادداشت‌ها به بخش "بدون پوشه" منتقل می‌شوند.`;
  }
  
  if(confirm(message)) {
    data.notes.forEach(note => {
      if(note.folder === folderId) {
        note.folder = null;
      }
    });
    
    data.folders = data.folders.filter(f => f.id !== folderId);
    save();
    render();
    
    if(current && current.folder === folderId) {
      current.folder = null;
      const folderSelect = document.getElementById("folder");
      if(folderSelect) folderSelect.value = "";
      save();
    }
  }
}
function render(){
  let list = document.getElementById("list");
  list.innerHTML = "";

  let searchTerm = document.getElementById("search").value.trim().toLowerCase();
  let sortType = document.getElementById("sort").value;

  function cleanText(html) {
    if(!html) return "";
    let text = html.replace(/<[^>]*>/g, "");
    text = text.replace(/\s+/g, " ");
    return text.toLowerCase();
  }

  let notes = data.notes.filter(n => {
    let titleMatch = n.title.toLowerCase().includes(searchTerm);
    let cleanContent = cleanText(n.content);
    let contentMatch = cleanContent.includes(searchTerm);
    return titleMatch || contentMatch;
  });

  let pinnedNotes = notes.filter(n => n.pinned);
  let unpinnedNotes = notes.filter(n => !n.pinned);
  
  if(sortType === "title") {
    pinnedNotes.sort((a,b) => a.title.localeCompare(b.title, 'fa'));
    unpinnedNotes.sort((a,b) => a.title.localeCompare(b.title, 'fa'));
  } else if(sortType === "date") {
    pinnedNotes.sort((a,b) => b.date - a.date);
    unpinnedNotes.sort((a,b) => b.date - a.date);
  }

 if(pinnedNotes.length > 0 && searchTerm === "") {
    let pinnedHeader = document.createElement("div");
    pinnedHeader.className = "pinned-header";
    pinnedHeader.textContent = "📌 یادداشت‌های پین شده (" + pinnedNotes.length + ")";
    pinnedHeader.style.marginTop = "10px";
    pinnedHeader.style.fontWeight = "bold";
    pinnedHeader.style.padding = "6px";
    pinnedHeader.style.borderRadius = "6px";
    pinnedHeader.style.backgroundColor = "var(--side)";
    pinnedHeader.style.color = "var(--text)";
    list.appendChild(pinnedHeader);
    
    pinnedNotes.forEach(n => {
      let note = noteEl(n);
      note.style.marginRight = "20px";
      note.style.padding = "4px";
      list.appendChild(note);
    });
    
    let separator = document.createElement("div");
    separator.style.height = "1px";
    separator.style.backgroundColor = "#ddd";
    separator.style.margin = "10px 0";
    list.appendChild(separator);
  }
  
  notes = [...pinnedNotes, ...unpinnedNotes];
  
  // ✅ مرتب کردن مجدد notes بر اساس sortType برای داخل پوشه‌ها
  if(sortType === "title") {
    notes.sort((a,b) => a.title.localeCompare(b.title, 'fa'));
  } else if(sortType === "date") {
    notes.sort((a,b) => b.date - a.date);
  }

  let sortedFolders = [...data.folders].sort((a, b) => a.name.localeCompare(b.name, 'fa'));

  sortedFolders.forEach(folder => {
    let folderNotes = notes.filter(n => n.folder === folder.id);
    
    if(folderNotes.length >= 0 || searchTerm !== "") {
      let fdiv = document.createElement("div");
      fdiv.className = "folder";
      
      let folderNameSpan = document.createElement("span");
      folderNameSpan.className = "folder-name";
      folderNameSpan.textContent = "📁 " + folder.name + " (" + folderNotes.length + ")";
      
      let actionsDiv = document.createElement("div");
      actionsDiv.className = "folder-actions";
      
      let editBtn = document.createElement("button");
      editBtn.textContent = "✏️";
      editBtn.className = "folder-edit";
      editBtn.onclick = (e) => {
        e.stopPropagation();
        editFolder(folder.id);
      };
      
      let deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑️";
      deleteBtn.className = "folder-delete";
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        deleteFolder(folder.id);
      };
      
      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(deleteBtn);
      fdiv.appendChild(folderNameSpan);
      fdiv.appendChild(actionsDiv);
      
      let isExpanded = true;
      folderNameSpan.style.cursor = "pointer";
      folderNameSpan.onclick = (e) => {
        e.stopPropagation();
        isExpanded = !isExpanded;
        let notesDiv = fdiv.nextSibling;
        while(notesDiv && notesDiv.classList && notesDiv.classList.contains("folder-notes")) {
          notesDiv.style.display = isExpanded ? "block" : "none";
          notesDiv = notesDiv.nextSibling;
        }
      };
      
      list.appendChild(fdiv);
      
      let notesContainer = document.createElement("div");
      notesContainer.className = "folder-notes";
      
      folderNotes.forEach(n => {
        let note = noteEl(n);
        note.style.marginRight = "20px";
        note.style.padding = "4px";
        notesContainer.appendChild(note);
      });
      
      list.appendChild(notesContainer);
    }
  });

  let rootNotes = notes.filter(n => !n.folder);

  if(rootNotes.length > 0 || searchTerm !== ""){
    let rootTitle = document.createElement("div");
    rootTitle.textContent = "📄 بدون پوشه (" + rootNotes.length + ")";
    rootTitle.style.marginTop = "10px";
    rootTitle.style.fontWeight = "bold";
    rootTitle.style.padding = "6px";
    list.appendChild(rootTitle);

    rootNotes.forEach(n=>{
      let note = noteEl(n);
      note.style.marginRight = "20px";
      note.style.padding = "4px";
      list.appendChild(note);
    });
  }

  updateFolderSelect();
  
  if(notes.length === 0 && searchTerm !== "") {
    let noResult = document.createElement("div");
    noResult.textContent = "❌ هیچ یادداشتی با عبارت \"" + searchTerm + "\" یافت نشد";
    noResult.style.padding = "10px";
    noResult.style.color = "#888";
    noResult.style.textAlign = "center";
    list.appendChild(noResult);
  }
}

function updateNoteDate() {
  if(current) {
    current.date = Date.now();
    save();
  }
}

function noteEl(n){
  let d = document.createElement("div");
  d.className = "item " + (n.pinned ? "pinned" : "");
  
  let preview = (n.content || "").replace(/<[^>]*>/g, '').substring(0, 50);
  d.textContent = (n.pinned ? "📌 " : "") + n.title;
  if(preview) {
    d.title = preview;
  }
  
  if(n.folder) {
    let folder = data.folders.find(f => f.id === n.folder);
    if(folder) d.title = "پوشه: " + folder.name + "\n" + (preview || "");
  }

  d.onclick = ()=>openNote(n.id);
  return d;
}

function openNote(id){
  current = data.notes.find(n=>n.id===id);
  if(!current) return;

  document.getElementById("title").value = current.title;
  const contentEl = document.getElementById("content");
  
  if(markdownMode && current.content && !current.content.includes('<')) {
    contentEl.innerText = current.content;
  } else if(markdownMode && current.content && current.content.includes('<')) {
    current.content = htmlToMarkdown(current.content);
    contentEl.innerText = current.content;
    save();
  } else {
    contentEl.innerHTML = current.content || "";
  }
  
  const folderSelect = document.getElementById("folder");
  folderSelect.value = current.folder || "";
}

function setupFolderChange() {
  const folderSelect = document.getElementById("folder");
  folderSelect.onchange = function() {
    if(!current) return;
    
    const newFolderValue = this.value === "" ? null : Number(this.value);
    current.folder = newFolderValue;
    updateNoteDate();
    save();
    render();
  };
}

document.getElementById("title").oninput = ()=>{
  if(!current) return;
  current.title = document.getElementById("title").value;
  updateNoteDate();
  save();
  render();
};

document.getElementById("content").oninput = ()=>{
  if(!current || isRendering) return;
  
  if(markdownMode) {
    current.content = document.getElementById("content").innerText;
  } else {
    current.content = document.getElementById("content").innerHTML;
  }
  updateNoteDate();
  save();
};

document.getElementById("content").onblur = ()=>{
  if(!current || !markdownMode || previewMode) return;
  
  isRendering = true;
  const rawMarkdown = document.getElementById("content").innerText;
  const html = markdownToHtml(rawMarkdown);
  document.getElementById("content").innerHTML = html;
  isRendering = false;
};

document.getElementById("content").onfocus = ()=>{
  if(!current || !markdownMode || previewMode) return;
  
  isRendering = true;
  const html = document.getElementById("content").innerHTML;
  const markdown = htmlToMarkdown(html);
  document.getElementById("content").innerText = markdown;
  isRendering = false;
};

function deleteNote(){
  if(!current) return;
  
  if(confirm(`آیا از حذف یادداشت "${current.title}" مطمئن هستید؟`)) {
    data.notes = data.notes.filter(n => n.id !== current.id);
    current = null;
    save();
    render();
    document.getElementById("title").value = "";
    document.getElementById("content").innerHTML = "";
  }
}

function togglePin(){
  if(!current) return;
  current.pinned = !current.pinned;
  updateNoteDate();
  save();
  render();
}

function updateFolderSelect(){
  let f = document.getElementById("folder");
  f.innerHTML = `<option value="">بدون پوشه</option>`;

  data.folders.forEach(fl=>{
    let o = document.createElement("option");
    o.value = fl.id;
    o.textContent = fl.name;
    f.appendChild(o);
  });
}

function format(command){
  if(markdownMode) {
    alert("لطفاً ابتدا حالت Markdown را غیرفعال کنید (دکمه MD)");
    return;
  }
  document.execCommand(command, false, null);
  document.getElementById("content").focus();
}

function exportJSON(){
  let blob = new Blob([JSON.stringify(data)], {type:"application/json"});
  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "notes.json";
  a.click();
}

document.getElementById("importFile").onchange = function(e){
  let file = e.target.files[0];
  if(!file) return;
  
  let reader = new FileReader();
  reader.onload = ()=>{
    try {
      let newData = JSON.parse(reader.result);
      if(newData.notes && newData.folders) {
        data = newData;
        save();
        render();
        alert("یادداشت‌ها با موفقیت وارد شدند");
      } else {
        alert("فرمت فایل نامعتبر است!");
      }
    } catch(e) {
      alert("خطا در خواندن فایل");
    }
  };
  reader.readAsText(file);
  this.value = '';
};

function toggleDark(){
  document.body.classList.toggle("dark");
}

document.getElementById("search").oninput = render;

function init() {
  render();
  setupFolderChange();
  addMarkdownButtons();
  document.getElementById("sort").addEventListener("change", function() {
    render();
  });
}

init();