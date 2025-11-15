/* app.js — FINAL WORKING VERSION (theme fixed globally) */

(function () {
  const $ = (s) => document.querySelector(s);

  /* --------------------------------------------------
     NOTIFICATION SYSTEM - Helper functions
  -------------------------------------------------- */
  let notifications = [];
  
  function calculateSimilarity(str1, str2) {
    // Simple fuzzy matching algorithm
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    
    if (s1 === s2) return 100;
    
    // Check if one contains the other
    if (s1.includes(s2) || s2.includes(s1)) return 85;
    
    // Calculate word overlap
    const words1 = s1.split(/\s+/);
    const words2 = s2.split(/\s+/);
    const commonWords = words1.filter(w => words2.includes(w));
    
    if (words1.length + words2.length === 0) return 0;
    const wordSimilarity = (commonWords.length * 2) / (words1.length + words2.length) * 100;
    
    return Math.round(wordSimilarity);
  }
  
  function checkForMatches(newItem, currentUser) {
    const allItems = LF.readItems().filter(i => !i.deleted && i.id !== newItem.id);
    const userItems = allItems.filter(i => i.createdBy === currentUser);
    
    const matches = [];
    userItems.forEach(userItem => {
      // Check opposite type (lost vs found)
      if (userItem.type === newItem.type) return;
      
      const titleSim = calculateSimilarity(userItem.title, newItem.title);
      const categorySim = userItem.category === newItem.category ? 100 : 0;
      const overallSim = (titleSim * 0.7 + categorySim * 0.3);
      
      if (overallSim >= 70) {
        matches.push({
          userItem,
          newItem,
          similarity: Math.round(overallSim)
        });
      }
    });
    
    return matches;
  }
  
  function showMatchModal(match) {
    const modal = $("#matchModal");
    const message = $("#matchMessage");
    const details = $("#matchDetails");
    
    message.textContent = `We found a ${match.similarity}% match between your item and a new posting!`;
    details.innerHTML = `
      <div class="mb-2"><strong>Your Item:</strong> ${match.userItem.type.toUpperCase()} - ${match.userItem.title}</div>
      <div><strong>New Match:</strong> ${match.newItem.type.toUpperCase()} - ${match.newItem.title}</div>
      <div class="mt-2 text-xs text-slate-400">Location: ${match.newItem.location}</div>
    `;
    
    modal.classList.remove("hidden");
  }
  
  function showToast(message, type = "info") {
    const container = $("#toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast-notification bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-xl max-w-sm`;
    
    const icon = type === "match" ? "🎯" : type === "success" ? "✅" : "ℹ️";
    toast.innerHTML = `
      <div class="flex items-start gap-3">
        <span class="text-2xl">${icon}</span>
        <div class="flex-1">
          <div class="font-semibold text-sm">${type === "match" ? "Match Found!" : "Notification"}</div>
          <div class="text-sm text-slate-300">${message}</div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="text-slate-400 hover:text-white">✕</button>
      </div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }
  
  function updateNotificationBadge(count) {
    const badge = $("#notificationBadge");
    if (count > 0) {
      badge.textContent = count;
      badge.classList.remove("hidden");
    } else {
      badge.classList.add("hidden");
    }
  }

  /* --------------------------------------------------
     AI CHATBOT ASSISTANT - Smart autofill
  -------------------------------------------------- */
  function parseDescription(description) {
    const desc = description.toLowerCase();
    const suggestions = {
      category: "",
      location: "",
      title: ""
    };
    
    // Category detection
    const categoryMap = {
      "phone": "Phones",
      "mobile": "Phones",
      "bag": "Bags",
      "backpack": "Bags",
      "book": "Books",
      "notebook": "Books",
      "wallet": "Wallets",
      "purse": "Wallets",
      "id": "ID Cards",
      "card": "ID Cards",
      "key": "Keys",
      "laptop": "Electronics",
      "watch": "Accessories",
      "bottle": "Other",
      "umbrella": "Other",
      "glasses": "Accessories",
      "earphones": "Electronics",
      "charger": "Electronics"
    };
    
    for (const [keyword, category] of Object.entries(categoryMap)) {
      if (desc.includes(keyword)) {
        suggestions.category = category;
        break;
      }
    }
    
    // Location detection
    const locationKeywords = ["canteen", "library", "lab", "classroom", "cafeteria", "gym", "parking", "gate", "ground", "hall", "block"];
    for (const loc of locationKeywords) {
      if (desc.includes(loc)) {
        suggestions.location = loc.charAt(0).toUpperCase() + loc.slice(1);
        break;
      }
    }
    
    // Title generation - extract key words
    const words = description.trim().split(/\s+/);
    const importantWords = words.filter(w => 
      w.length > 3 && !["lost", "found", "near", "from", "with"].includes(w.toLowerCase())
    ).slice(0, 3);
    
    if (importantWords.length > 0) {
      suggestions.title = importantWords.map(w => 
        w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      ).join(" ");
    }
    
    return suggestions;
  }
  
  function showChatbot(suggestions) {
    const bubble = $("#chatbotBubble");
    const message = $("#chatbotMessage");
    const suggestionsDiv = $("#chatbotSuggestions");
    const typing = $("#chatbotTyping");
    
    bubble.classList.remove("hidden");
    message.textContent = "";
    suggestionsDiv.innerHTML = "";
    typing.classList.remove("hidden");
    
    setTimeout(() => {
      typing.classList.add("hidden");
      message.textContent = "I can help you fill this form! Here are my suggestions:";
      
      const buttons = [];
      if (suggestions.category) {
        buttons.push(`<button class="px-3 py-1 bg-purple-600/30 rounded-lg text-sm hover:bg-purple-600/50 transition-colors" onclick="document.getElementById('category').value='${suggestions.category}'">📦 ${suggestions.category}</button>`);
      }
      if (suggestions.location) {
        buttons.push(`<button class="px-3 py-1 bg-blue-600/30 rounded-lg text-sm hover:bg-blue-600/50 transition-colors" onclick="document.getElementById('location').value='${suggestions.location}'">📍 ${suggestions.location}</button>`);
      }
      if (suggestions.title) {
        buttons.push(`<button class="px-3 py-1 bg-green-600/30 rounded-lg text-sm hover:bg-green-600/50 transition-colors" onclick="document.getElementById('title').value='${suggestions.title}'">📌 ${suggestions.title}</button>`);
      }
      
      if (buttons.length > 0) {
        suggestionsDiv.innerHTML = buttons.join("");
      } else {
        message.textContent = "Keep typing to get smart suggestions...";
      }
    }, 1000);
  }

  /* --------------------------------------------------
     GLOBAL THEME SYSTEM (works everywhere)
  -------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    const html = document.documentElement;
    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");

    const saved = localStorage.getItem("lf-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved || (prefersDark ? "dark" : "light");

    function applyTheme(name) {
      localStorage.setItem("lf-theme", name);

      if (name === "dark") {
        html.classList.add("dark");

        document.body.classList.remove(
          "bg-gradient-to-br",
          "from-slate-900",
          "to-slate-800"
        );
        document.body.classList.add(
          "bg-gradient-to-br",
          "from-slate-950",
          "to-slate-900"
        );

        if (themeIcon) themeIcon.textContent = "☀️";
      } else {
        html.classList.remove("dark");

        document.body.classList.remove(
          "bg-gradient-to-br",
          "from-slate-950",
          "to-slate-900"
        );
        document.body.classList.add(
          "bg-gradient-to-br",
          "from-slate-900",
          "to-slate-800"
        );

        if (themeIcon) themeIcon.textContent = "🌙";
      }
    }

    // First apply
    applyTheme(initial);

    // Toggle button
    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        const next = html.classList.contains("dark") ? "light" : "dark";
        applyTheme(next);
      });
    }
  });

  /* --------------------------------------------------
      PAGE LOGIC
  -------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    const isLogin = !!$("#loginForm");
    const isSignup = !!$("#signupForm");
    const isDashboard = !!$("#itemForm");

    /* ------------------ LOGIN PAGE ------------------ */
    if (isLogin) {
      const form = $("#loginForm");
      const msg = $("#msg");

      form.addEventListener("submit", (e) => {
        e.preventDefault();

        const u = $("#username").value.trim();
        const p = $("#password").value.trim();
        const users = LF.readUsers();
        const found = users.find((x) => x.user === u && x.pass === p);

        if (!found) {
          msg.textContent = "Invalid credentials";
          msg.className = "text-red-400 text-center";
          return;
        }

        // save session
        LF.setSession({ user: found.user, role: found.role || "user" });
        LF.log("login", { user: found.user });

        msg.textContent = "Login successful...";
        msg.className = "text-green-400 text-center";

        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 500);
      });
    }

    /* ------------------ DASHBOARD PAGE ------------------ */
    if (isDashboard) {
      const session = LF.getSession();
      const currentUser = session ? session.user : null;
      const currentRole = session ? session.role : null;

      const userStatus = $("#userStatus");
      const logoutBtn = $("#logoutBtn");
      const list = $("#list");
      const empty = $("#empty");
      const search = $("#search");
      const filterType = $("#filterType");
      const itemForm = $("#itemForm");
      const lostBtn = $("#lostBtn");
      const foundBtn = $("#foundBtn");
      const typeInput = $("#type");
      const categorySelect = $("#category");

      const adminArea = $("#adminArea");
      const openBin = $("#openBin");
      const binModal = $("#binModal");
      const binList = $("#binList");
      const closeBin = $("#closeBin");

      const formMsg = $("#formMsg");

      /* ---- Status ---- */
      userStatus.textContent = currentUser
        ? `Signed in as ${currentUser} (${currentRole})`
        : "Viewing as guest";

      if (currentRole === "admin") adminArea.classList.remove("hidden");

      /* ---- Logout ---- */
      logoutBtn.onclick = () => {
        LF.clearSession();
        window.location.href = "login.html";
      };

      /* ---- Lost/Found Buttons ---- */
      function setType(t) {
        typeInput.value = t;
        lostBtn.style.opacity = t === "lost" ? 1 : 0.6;
        foundBtn.style.opacity = t === "found" ? 1 : 0.6;
      }
      lostBtn.onclick = () => setType("lost");
      foundBtn.onclick = () => setType("found");
      setType("lost");

      /* ---- Category List ---- */
      if (categorySelect) {
        categorySelect.innerHTML =
          '<option value="">Choose category</option>' +
          LF.CATEGORIES.map((c) => `<option>${c}</option>`).join("");
      }

      /* ------------------ RENDER ITEMS ------------------ */
      function render() {
        const raw = LF.readItems().filter((i) => !i.deleted);
        const q = (search.value || "").toLowerCase();
        let visible = raw.slice().reverse();

        if (filterType.value)
          visible = visible.filter((i) => i.type === filterType.value);

        if (q)
          visible = visible.filter(
            (i) =>
              i.title.toLowerCase().includes(q) ||
              i.location.toLowerCase().includes(q)
          );

        list.innerHTML = "";
        if (!visible.length) {
          empty.classList.remove("hidden");
          return;
        }
        empty.classList.add("hidden");

        visible.forEach((item) => {
          const card = document.createElement("div");
          card.className =
            "item-card bg-white/5 p-4 rounded-xl border border-white/10 flex gap-4";

          // Determine status
          const status = item.status || "pending";
          const statusMap = {
            "pending": { label: "🟡 Pending", class: "status-pending" },
            "matched": { label: "🟠 Matched", class: "status-matched" },
            "contacted": { label: "🔵 Contacted", class: "status-contacted" },
            "returned": { label: "🟢 Returned", class: "status-returned" }
          };
          const statusInfo = statusMap[status] || statusMap.pending;

          card.innerHTML = `
            <div class="w-20 h-20 rounded-xl overflow-hidden bg-slate-700 shadow-lg">
              <img src="${item.photo || "https://via.placeholder.com/160"}"
                   class="w-full h-full object-cover" />
            </div>

            <div class="flex-1">
              <div class="flex items-start justify-between mb-2">
                <div>
                  <div class="font-semibold text-lg">${item.type === "lost" ? "😢" : "🎉"} ${item.type.toUpperCase()}: ${item.title}</div>
                  <div class="text-sm text-slate-300 mt-1">📍 ${item.location} • 📅 ${item.date}</div>
                </div>
                <span class="status-badge ${statusInfo.class}">${statusInfo.label}</span>
              </div>

              <p class="text-sm text-slate-200 mt-2 line-clamp-2">${item.description}</p>

              <div class="mt-3 flex flex-wrap gap-2">
                <button class="px-3 py-1 bg-white/10 rounded-lg hover:bg-white/20 transition-colors viewBtn">👁️ View</button>
                <button class="px-3 py-1 bg-green-600/20 rounded-lg hover:bg-green-600/30 transition-colors markBtn">
                  ${item.resolved ? "↩️ Unresolve" : "✓ Mark Found"}
                </button>
                <select class="statusSelect px-3 py-1 bg-white/10 rounded-lg text-sm">
                  <option value="pending" ${status === "pending" ? "selected" : ""}>🟡 Pending</option>
                  <option value="matched" ${status === "matched" ? "selected" : ""}>🟠 Matched</option>
                  <option value="contacted" ${status === "contacted" ? "selected" : ""}>🔵 Contacted</option>
                  <option value="returned" ${status === "returned" ? "selected" : ""}>🟢 Returned</option>
                </select>
                <button class="px-3 py-1 bg-yellow-600/20 rounded-lg hover:bg-yellow-600/30 transition-colors moveBtn">🗑️ Bin</button>
                <button class="px-3 py-1 bg-red-600/20 rounded-lg hover:bg-red-600/30 transition-colors permBtn ${
                  currentRole === "admin" ? "" : "hidden"
                }">🗑️ Delete</button>
              </div>
            </div>
          `;

          list.appendChild(card);

          /* ---- View ---- */
          card.querySelector(".viewBtn").onclick = () => {
            alert(
              `${item.title}\n\n${item.description}\n\nLocation: ${
                item.location
              }\nContact: ${item.contact || "N/A"}\nStatus: ${statusInfo.label}`
            );
          };

          /* ---- Toggle Resolved ---- */
          card.querySelector(".markBtn").onclick = () => {
            if (!currentUser) return alert("Sign in first.");
            const arr = LF.readItems();
            const idx = arr.findIndex((x) => x.id === item.id);
            arr[idx].resolved = !arr[idx].resolved;
            LF.writeItems(arr);
            render();
          };

          /* ---- Status Change ---- */
          card.querySelector(".statusSelect").onchange = (e) => {
            if (!currentUser) return alert("Sign in first.");
            const arr = LF.readItems();
            const idx = arr.findIndex((x) => x.id === item.id);
            arr[idx].status = e.target.value;
            LF.writeItems(arr);
            render();
          };

          /* ---- Move to bin ---- */
          card.querySelector(".moveBtn").onclick = () => {
            const arr = LF.readItems();
            const idx = arr.findIndex((x) => x.id === item.id);
            arr[idx].deleted = true;
            LF.writeItems(arr);

            const d = LF.readDeleted();
            d.push({ ...arr[idx], deletedAt: Date.now() });
            LF.writeDeleted(d);

            render();
          };

          /* ---- Delete (Admin Only) ---- */
          card.querySelector(".permBtn").onclick = () => {
            const pw = prompt("Admin password:");
            if (pw !== LF.getAdminPass()) return alert("Wrong password.");

            const arr = LF.readItems().filter((x) => x.id !== item.id);
            LF.writeItems(arr);
            render();
          };
        });
      }

      render();
      search.oninput = render;
      filterType.onchange = render;

      /* ------------------ ADD ITEM ------------------ */
      itemForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!currentUser) return alert("Sign in to post an item.");

        const title = $("#title").value.trim();
        const date = $("#date").value;
        const location = $("#location").value.trim();
        const desc = $("#desc").value.trim();
        const contact = $("#contact").value.trim();
        const file = $("#photo").files[0];
        const type = typeInput.value;
        const category = $("#category").value || "Other";

        if (!title || !date || !location || !desc || !contact) {
          formMsg.textContent = "All fields required!";
          formMsg.className = "text-red-400 text-center";
          return;
        }

        let photo = "";
        if (file) {
          photo = await new Promise((res) => {
            const fr = new FileReader();
            fr.onload = () => res(fr.result);
            fr.readAsDataURL(file);
          });
        }

        const item = {
          id: Math.random().toString(36).slice(2),
          type,
          title,
          date,
          location,
          description: desc,
          contact,
          category,
          photo,
          resolved: false,
          status: "pending",
          createdBy: currentUser,
          createdAt: Date.now(),
          deleted: false,
        };

        const arr = LF.readItems();
        arr.push(item);
        LF.writeItems(arr);

        // Check for matches with other users' items
        const allUsers = LF.readUsers();
        allUsers.forEach(user => {
          if (user.user !== currentUser) {
            const matches = checkForMatches(item, user.user);
            matches.forEach(match => {
              // Show notification if it's the current user's match
              if (match.userItem.createdBy === currentUser) {
                showMatchModal(match);
                showToast(`${match.similarity}% match found with "${match.newItem.title}"!`, "match");
                notifications.push(match);
                updateNotificationBadge(notifications.length);
              }
            });
          }
        });

        formMsg.textContent = "✨ Posted successfully!";
        formMsg.className = "text-green-400 text-center";

        itemForm.reset();
        setType("lost");
        render();
        
        // Hide chatbot after successful submission
        $("#chatbotBubble").classList.add("hidden");
      });

      /* ------------------ AI CHATBOT INTEGRATION ------------------ */
      const descInput = $("#desc");
      let debounceTimer;
      
      descInput.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const description = descInput.value.trim();
          if (description.length >= 10) {
            const suggestions = parseDescription(description);
            if (suggestions.category || suggestions.location || suggestions.title) {
              showChatbot(suggestions);
            }
          } else {
            $("#chatbotBubble").classList.add("hidden");
          }
        }, 500);
      });

      /* ------------------ NOTIFICATION BELL ------------------ */
      const notificationBell = $("#notificationBell");
      if (notificationBell) {
        notificationBell.onclick = () => {
          if (notifications.length === 0) {
            showToast("No new notifications", "info");
          } else {
            showMatchModal(notifications[0]);
          }
        };
      }

      /* ------------------ FLOATING ACTION BUTTON ------------------ */
      const fabButton = $("#fabButton");
      if (fabButton && currentUser) {
        fabButton.classList.remove("hidden");
        fabButton.onclick = () => {
          window.scrollTo({ top: 0, behavior: "smooth" });
          $("#title").focus();
        };
      }

      /* ------------------ RECYCLE BIN MODAL ------------------ */
      if (openBin) {
        openBin.onclick = () => {
          if (currentRole !== "admin") return alert("Admin only.");

          binModal.classList.remove("hidden");
          binModal.style.display = "flex";

          const deleted = LF.readDeleted().slice().reverse();
          binList.innerHTML = "";

          if (!deleted.length) {
            binList.innerHTML =
              '<div class="text-slate-400">No deleted items</div>';
            return;
          }

          deleted.forEach((item) => {
            const row = document.createElement("div");
            row.className =
              "flex gap-3 items-start bg-white/6 p-3 rounded";

            row.innerHTML = `
              <div class="w-16 h-16 rounded overflow-hidden">
                <img src="${item.photo || "https://via.placeholder.com/160"}"
                     class="w-full h-full object-cover" />
              </div>

              <div class="flex-1">
                <div class="font-semibold">${item.title}</div>
                <div class="text-xs text-slate-300">
                  Deleted: ${new Date(item.deletedAt).toLocaleString()}
                </div>

                <div class="mt-2 flex gap-2">
                  <button class="px-2 py-1 bg-green-600/20 rounded restoreBtn">Restore</button>
                  <button class="px-2 py-1 bg-red-600/20 rounded permBtn">Delete Forever</button>
                </div>
              </div>
            `;

            binList.appendChild(row);

            /* ---- Restore ---- */
            row.querySelector(".restoreBtn").onclick = () => {
              let removed = LF.readDeleted().filter((d) => d.id !== item.id);
              LF.writeDeleted(removed);

              const items = LF.readItems();
              const idx = items.findIndex((x) => x.id === item.id);
              if (idx !== -1) items[idx].deleted = false;
              else items.push({ ...item, deleted: false });

              LF.writeItems(items);
              openBin.click();
            };

            /* ---- Permanent delete ---- */
            row.querySelector(".permBtn").onclick = () => {
              const pw = prompt("Enter admin password:");
              if (pw !== LF.getAdminPass()) return alert("Wrong password.");

              const removed = LF.readDeleted().filter((d) => d.id !== item.id);
              LF.writeDeleted(removed);

              openBin.click();
            };
          });
        };
      }

      if (closeBin) {
        closeBin.onclick = () => {
          binModal.classList.add("hidden");
          binModal.style.display = "none";
        };
      }
    }
  });
})();
