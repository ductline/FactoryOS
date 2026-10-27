/* Factory OS on GitHub Pages: Firebase stands in for the claude.ai runtime.
   Provides window.claude.use("db" | "user" | "downloads") on top of Firestore + Google sign-in.
   Inside claude.ai (window.claude already present) this file does nothing. */
(function () {
  if (window.claude && window.claude.use) return;
  const OWNER = "nagredy@gmail.com";
  const COLS = ["materials", "movements", "workorders", "pos", "tagjobs", "dispatches", "sales", "salesMonths", "config"];
  const SDK = "https://www.gstatic.com/firebasejs/10.12.2/";
  const loadJs = src => new Promise((ok, bad) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = () => bad(new Error("Could not load " + src)); document.head.appendChild(s); });
  const $m = () => document.getElementById("main");
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const screen = (h, p, btn) => { const m = $m(); if (m) m.innerHTML = `<div class="panel empty"><h3>${h}</h3><p>${p}</p>${btn || ""}</div>`; };

  let fb, auth, fs, me = null, role = null;
  const domReady = () => new Promise(r => document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", r, { once: true }) : r());
  const ready = (async () => {
    await domReady();
    const cfg = window.FIREBASE_CONFIG;
    if (!cfg || !cfg.apiKey || /PASTE/.test(cfg.apiKey)) { screen("Factory OS isn't connected yet", "The Firebase database setup isn't finished. Once its settings are added to firebase-config.js, this page signs you in and loads the factory data."); throw new Error("no-config"); }
    try { for (const f of ["firebase-app-compat.js", "firebase-auth-compat.js", "firebase-firestore-compat.js"]) await loadJs(SDK + f); }
    catch (e) { screen("Couldn't reach Firebase", "Check the internet connection and reload the page."); throw e; }
    fb = window.firebase; fb.initializeApp(cfg); auth = fb.auth(); fs = fb.firestore();
    try { fs.settings({ ignoreUndefinedProperties: true, merge: true }); } catch (e) { }
    try { await fs.enablePersistence({ synchronizeTabs: true }); } catch (e) { }
    const user = await new Promise(res => { const off = auth.onAuthStateChanged(u => { if (u) { off(); res(u); } else signInScreen(); }); });
    me = user;
    const email = (user.email || "").toLowerCase();
    if (email === OWNER) role = "owner";
    else {
      const a = await fs.doc("access/" + email).get().catch(() => null);
      if (!a || !a.exists) { screen("No access yet", `You're signed in as <b>${esc(email)}</b>. Ask Nag to add this email to Factory OS, then reload.`, `<div class="bar" style="justify-content:center"><button class="btn" onclick="firebase.auth().signOut().then(()=>location.reload())">Use another account</button></div>`); throw new Error("no-access"); }
      role = a.data().role || "edit";
    }
    await fs.doc("users/" + user.uid).set({ name: user.displayName || email, email, seenAt: new Date().toISOString() }, { merge: true }).catch(() => { });
    addChrome();
    return true;
  })();

  function signInScreen() {
    screen("Sign in to Factory OS", "Use the Google account Nag has added for you.",
      `<div class="bar" style="justify-content:center"><button class="btn pri" id="fb-google">Sign in with Google</button></div>`);
    const b = document.getElementById("fb-google");
    if (b) b.onclick = () => { const p = new fb.auth.GoogleAuthProvider(); p.setCustomParameters({ prompt: "select_account" }); auth.signInWithPopup(p).catch(e => { if (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment") auth.signInWithRedirect(p); else alert(e.message); }); };
  }

  /* ---- db: the same calls the app makes on the claude.ai database ---- */
  const wrapSnap = s => ({ docs: s.docs.map(d => ({ id: d.id, exists: true, data: () => d.data() })) });
  const clean = v => JSON.parse(JSON.stringify(v)); // drops undefined, matches what the claude.ai store keeps
  const db = {
    collection: c => ({
      onSnapshot: (cb, err) => fs.collection(c).onSnapshot(s => cb(wrapSnap(s)), err),
      add: async d => { const r = await fs.collection(c).add(clean(d)); return { id: r.id }; },
    }),
    doc: p => ({
      get: async () => { const d = await fs.doc(p).get(); return { id: d.id, exists: d.exists, data: () => d.data() }; },
      set: d => fs.doc(p).set(clean(d)),
      update: d => fs.doc(p).set(clean(d), { merge: true }),
      delete: () => fs.doc(p).delete(),
    }),
  };
  const userApi = {
    id: async () => me.uid,
    can: async what => what === "data.write" ? role !== "view" : true,
    me: async () => ({ name: me.displayName || me.email, email: me.email }),
    profiles: async ids => { const out = {}; await Promise.all(ids.map(async i => { try { const d = await fs.doc("users/" + i).get(); if (d.exists) out[i] = { name: d.data().name }; } catch (e) { } })); return out; },
  };
  const downloads = { save: async ({ filename, data }) => { const u = URL.createObjectURL(data); const a = document.createElement("a"); a.href = u; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 60000); } };

  window.claude = {
    use: async name => {
      try { await ready; } catch (e) { return new Promise(() => { }); } // leave the message on screen
      if (name === "db") return db;
      if (name === "user") return userApi;
      if (name === "downloads") return downloads;
      return null; // sample (Claude reading) and assets are claude.ai-only
    },
  };

  /* ---- owner tools: team access and one-time data import ---- */
  function addChrome() {
    const foot = document.getElementById("foot") || document.body;
    const bar = document.createElement("div"); bar.className = "note"; bar.style.cssText = "text-align:center;padding:8px 0 18px";
    bar.innerHTML = `Signed in as ${esc(me.email)} · <button class="link" id="fb-out">Sign out</button>` + (role === "owner" ? ` · <button class="link" id="fb-team">Team access</button> · <button class="link" id="fb-imp">Import data</button>` : "");
    foot.after ? foot.after(bar) : document.body.appendChild(bar);
    document.getElementById("fb-out").onclick = () => auth.signOut().then(() => location.reload());
    if (role !== "owner") return;
    document.getElementById("fb-team").onclick = teamModal;
    document.getElementById("fb-imp").onclick = importData;
  }
  async function teamModal() {
    const s = await fs.collection("access").get();
    const rows = s.docs.map(d => `<tr><td>${esc(d.id)}</td><td>${d.data().role === "view" ? "View only" : "Can edit"}</td><td><button class="btn sm" data-rm="${esc(d.id)}">Remove</button></td></tr>`).join("");
    modal(head("Team access")+`<div class="mb" style="display:grid;gap:12px">
      <p class="note">People sign in with these Google accounts. You (${esc(OWNER)}) always have full access.</p>
      <div class="tscroll"><table><thead><tr><th>Email</th><th>Access</th><th></th></tr></thead><tbody>${rows || `<tr><td colspan="3" class="muted">Nobody added yet</td></tr>`}</tbody></table></div>
      <div class="grid"><label class="f">Google email<input id="fb-em" type="email" placeholder="supervisor@gmail.com"></label><label class="f">Access<select id="fb-role"><option value="edit">Can edit</option><option value="view">View only</option></select></label></div>
      <div class="bar"><button class="btn pri" id="fb-add">Add</button></div></div>`);
    document.getElementById("fb-add").onclick = async () => { const e = document.getElementById("fb-em").value.trim().toLowerCase(); if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return alert("Enter a valid email"); await fs.doc("access/" + e).set({ role: document.getElementById("fb-role").value, addedAt: new Date().toISOString() }); teamModal(); };
    document.querySelectorAll("[data-rm]").forEach(b => b.onclick = async () => { await fs.doc("access/" + b.dataset.rm).delete(); teamModal(); });
  }
  function importData() {
    const inp = document.createElement("input"); inp.type = "file"; inp.accept = ".json,application/json";
    inp.onchange = async () => {
      try {
        const j = JSON.parse(await inp.files[0].text()); let n = 0;
        for (const c of COLS) { const docs = j[c] || {}; const ids = Object.keys(docs);
          for (let i = 0; i < ids.length; i += 400) { const b = fs.batch(); ids.slice(i, i + 400).forEach(id => b.set(fs.doc(c + "/" + id), docs[id])); await b.commit(); n += Math.min(400, ids.length - i); } }
        alert(`Imported ${n} records.`);
      } catch (e) { alert("Import failed: " + e.message); }
    };
    inp.click();
  }
})();
