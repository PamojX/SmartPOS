import React, { useState } from "react";
import "./Settings.css";

export default function Settings() {
  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("en");
  const [defaultPage, setDefaultPage] = useState("new-bill");
  const [confirmDelete, setConfirmDelete] = useState(true);
  const [confirmVoid, setConfirmVoid] = useState(true);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  return (
    <div className="settings-section">
      <h2>UI & Behavior</h2>
      <div className="settings-group">
        <label>Theme:</label>
        <select value={theme} onChange={e => setTheme(e.target.value)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
      </div>
      <div className="settings-group">
        <label>Language:</label>
        <select value={language} onChange={e => setLanguage(e.target.value)}>
          <option value="en">English</option>
          <option value="si">සිංහල (Sinhala)</option>
        </select>
      </div>
      <div className="settings-group">
        <label>Default page at startup:</label>
        <select value={defaultPage} onChange={e => setDefaultPage(e.target.value)}>
          <option value="new-bill">New Bill</option>
          <option value="inventory">Inventory</option>
        </select>
      </div>
      <div className="settings-group">
        <label>
          <input type="checkbox" checked={confirmDelete} onChange={e => setConfirmDelete(e.target.checked)} />
          Confirm dialog: Delete item
        </label>
      </div>
      <div className="settings-group">
        <label>
          <input type="checkbox" checked={confirmVoid} onChange={e => setConfirmVoid(e.target.checked)} />
          Confirm dialog: Void bill
        </label>
      </div>
      <div className="settings-group">
        <button onClick={() => setShortcutsOpen(s => !s)}>
          {shortcutsOpen ? "Hide" : "View"} Keyboard Shortcuts
        </button>
        {shortcutsOpen && (
          <ul className="shortcuts-list">
            <li><b>Ctrl+N</b>: New Bill</li>
            <li><b>Ctrl+I</b>: Inventory</li>
            <li><b>Ctrl+S</b>: Save</li>
            <li><b>Esc</b>: Close dialog</li>
          </ul>
        )}
      </div>
    </div>
  );
}
