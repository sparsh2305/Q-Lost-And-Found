/* app.js — FINAL WORKING VERSION (theme fixed globally) */

(function () {
  const $ = (s) => document.querySelector(s);

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
            "bg-white/5 p-4 rounded-xl border border-white/10 flex gap-4";

          card.innerHTML = `
            <div class="w-20 h-20 rounded overflow-hidden bg-slate-700">
              <img src="${item.photo || "https://via.placeholder.com/160"}"
                   class="w-full h-full object-cover" />
            </div>

            <div class="flex-1">
              <div class="font-semibold">${item.type.toUpperCase()}: ${item.title}</div>
              <div class="text-sm text-slate-300 mt-1">📍 ${item.location} • ${item.date}</div>

              <p class="text-sm text-slate-200 mt-3">${item.description}</p>

              <div class="mt-3 flex gap-2">
                <button class="px-3 py-1 bg-white/10 rounded viewBtn">View</button>
                <button class="px-3 py-1 bg-green-600/20 rounded markBtn">
                  ${item.resolved ? "Unresolve" : "Mark Found"}
                </button>
                <button class="px-3 py-1 bg-yellow-600/20 rounded moveBtn">Move to Bin</button>
                <button class="px-3 py-1 bg-red-600/20 rounded permBtn ${
                  currentRole === "admin" ? "" : "hidden"
                }">Delete</button>
              </div>
            </div>
          `;

          list.appendChild(card);

          /* ---- View ---- */
          card.querySelector(".viewBtn").onclick = () => {
            alert(
              `${item.title}\n\n${item.description}\n\nLocation: ${
                item.location
              }\nContact: ${item.contact || "N/A"}`
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
          createdBy: currentUser,
          createdAt: Date.now(),
          deleted: false,
        };

        const arr = LF.readItems();
        arr.push(item);
        LF.writeItems(arr);

        formMsg.textContent = "Posted!";
        formMsg.className = "text-green-400 text-center";

        itemForm.reset();
        setType("lost");
        render();
      });

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
