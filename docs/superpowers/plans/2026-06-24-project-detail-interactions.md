# Project Detail Interactions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the selected works area into clickable project cards and add standalone project detail pages with anchor navigation.

**Architecture:** Keep the existing static HTML/CSS/JS structure. The homepage renders project entry cards from the existing `cases` data, while three new static detail pages reuse current slide assets and the existing lightbox behavior.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, existing local image assets.

---

### Task 1: Homepage Project Cards

**Files:**
- Modify: `index.html`
- Modify: `script.js`

- [ ] Rename the selected works copy to describe project entry cards.
- [ ] Replace the tab container with a `.project-grid`.
- [ ] Render each case as an anchor card linked to `project-bot.html`, `project-rpa.html`, or `project-dashboard.html`.

### Task 2: Detail Pages

**Files:**
- Create: `project-bot.html`
- Create: `project-rpa.html`
- Create: `project-dashboard.html`

- [ ] Add the same fixed header used by the homepage.
- [ ] Add a two-column `.project-page` layout with `.project-anchor` and `.project-detail`.
- [ ] Group existing slide images into six project sections where possible.
- [ ] Add bottom switch cards linking to the other two projects.

### Task 3: Styles And Verification

**Files:**
- Modify: `styles.css`
- Modify: `script.js`

- [ ] Add responsive project card styles.
- [ ] Add detail page anchor, section, image frame, and switch card styles.
- [ ] Make lightbox setup safe on pages that do not contain all homepage containers.
- [ ] Verify pages load locally and no JavaScript errors occur.
