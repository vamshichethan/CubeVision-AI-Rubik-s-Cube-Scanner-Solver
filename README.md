<div align="center">

# CubeVision AI

### Rubik's Cube Scanner, Solver, Validator, Visualizer, Recovery Coach, and Benchmark Lab

**Scan a cube. Correct uncertain stickers. Validate the state. Solve with Kociemba. Animate moves in 3D. Recover from real-world mistakes. Benchmark solver strategies.**

![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=111111)
![3D](https://img.shields.io/badge/3D-Three.js-111111?style=for-the-badge&logo=threedotjs)
![Solver](https://img.shields.io/badge/Solver-Kociemba%20Two--Phase-2ECC71?style=for-the-badge)
![Scanner](https://img.shields.io/badge/CV-OpenCV%20%2B%20FastAPI-5C3EE8?style=for-the-badge&logo=opencv)
![Backend](https://img.shields.io/badge/API-Node%20%2B%20Vercel-000000?style=for-the-badge&logo=vercel)
![Status](https://img.shields.io/badge/Status-Deployed-success?style=for-the-badge)

**Live App:** [cubevision-ai.vercel.app](https://cubevision-ai.vercel.app)  
**Solver API Health:** [cubevision-ai.vercel.app/api/health](https://cubevision-ai.vercel.app/api/health)  
**Repository:** [GitHub](https://github.com/vamshichethan/CubeVision-AI-Rubik-s-Cube-Scanner-Solver)

[Live Deployment](https://cubevision-ai.vercel.app) • [Features](#features) • [Architecture](#architecture) • [Algorithms](#algorithms-used) • [Run Locally](#run-locally) • [Interview Explanation](#placement-interview-explanation)

</div>

---

## Project Overview

**CubeVision AI** is a production-style Rubik's Cube assistant built as a complete multi-phase engineering project. It combines a React + TypeScript frontend, a Three.js cube visualizer, a deployable Kociemba solver backend, a Python OpenCV scanner module, deep validation ideas, recovery logic, and benchmark tooling.

The goal is not just to show a static solver. The app is designed around the real workflow of a person solving a physical cube:

1. Capture or manually enter all six cube faces.
2. Validate color counts, centers, and physical piece structure.
3. Generate a real solution using a Kociemba two-phase solver.
4. Animate each move in a 3D cube.
5. Rescan the real cube after a move.
6. Detect whether the user made a mistake.
7. Recalculate the remaining solution from the scanned state.
8. Compare solver strategies through a benchmark dashboard.

---

## Live Deployment

| Service | Link | Purpose |
|---|---|---|
| Frontend + Solver API | [https://cubevision-ai.vercel.app](https://cubevision-ai.vercel.app) | React app deployed with Vercel serverless API |
| Health Check | [https://cubevision-ai.vercel.app/api/health](https://cubevision-ai.vercel.app/api/health) | Confirms Kociemba API is online |
| Solver Endpoint | `POST /api/solve` | Solves a CubeState using the Kociemba path |

The deployed app includes the **frontend** and **Node/Kociemba solver backend**.  
The OpenCV scanner module is included in the repository as a Python/FastAPI service and can be run locally or deployed separately on a Python-capable platform.

---

## Features

### 1. Cube Input System

- Live camera capture using browser camera APIs.
- Image upload for a single cube face.
- Manual input panel for direct sticker painting.
- Six-face scan flow: `U`, `D`, `F`, `B`, `L`, `R`.
- Confidence review for every detected sticker.
- Manual correction fallback for low-confidence stickers.
- Last captured image preview with file/face caption.
- Scanner output can be sent directly to the solver and recovery system.

### 2. OpenCV Scanner Module

The scanner backend is built with Python, OpenCV, NumPy, and FastAPI.

It supports:

- Image decoding from upload/camera frames.
- Square-like contour detection.
- 3x3 grid extraction.
- Sticker center crop extraction.
- Average HSV computation.
- HSV color classification for white, yellow, red, orange, blue, and green.
- Confidence scoring.
- Validation after six faces.

Important design decision: the app does **not** blindly trust computer vision output. Every detected face is reviewed by the user before saving.

### 3. 3D Cube Visualizer

- Built with Three.js and React Three Fiber.
- Renders cubies with visible sticker colors.
- Supports orbit controls.
- Animates quarter-turn moves.
- Prevents overlapping animations with an animation lock.
- Updates cube state after every move.

### 4. Real Kociemba Solver

The solver path no longer uses fake hardcoded moves.

The current deployed solve flow is:

```text
CubeState
  -> convert sticker colors to Kociemba facelet order
  -> call cubejs Kociemba two-phase solver
  -> parse moves
  -> animate quarter-turn solution
```

The frontend first tries the deployed `/api/solve` backend. If that endpoint is unavailable during local development, the same Kociemba package can run in the browser.

### 5. Validation

Validation is explicit and user-visible.

- Editing the cube resets the state to "Not validated yet".
- The Solve button stays disabled until the cube is explicitly validated.
- Validation checks:
  - exactly 54 stickers
  - exactly 9 stickers per color
  - unique centers
  - edge/corner piece consistency in the frontend validator
  - C++ deep validator modules for piece/parity-oriented validation

### 6. Real-World Recovery

Recovery is now scanner-first, not demo-only.

Workflow:

```text
Expected move from solver timeline
User performs physical move
User scans/sends updated CubeState
Recovery compares expected virtual state vs scanned physical state
System infers mismatch or verifies the move
System suggests undo, retake, correction, or recalculation
Kociemba recalculates from scanned CubeState
```

This makes the app behave like an assistant for a physical cube, not just a static visualizer.

### 7. Benchmark Dashboard

The benchmark lab compares solving/search strategies:

- BFS
- IDDFS
- A*
- IDA*
- Kociemba

Tracked metrics:

- success/failure
- solution length
- time taken
- nodes explored
- memory estimate
- max search depth
- notes per algorithm

---

## Architecture

```text
CubeVision AI
|
|-- React + TypeScript frontend
|   |-- Home page
|   |-- Solver workspace
|   |-- Scanner page
|   |-- Recovery page
|   |-- Benchmark dashboard
|
|-- 3D engine
|   |-- React Three Fiber
|   |-- Three.js cubies
|   |-- move animation state machine
|
|-- Solver API
|   |-- api/solve.js
|   |-- api/health.js
|   |-- cubejs Kociemba two-phase algorithm
|
|-- Scanner backend
|   |-- scanner/api.py
|   |-- OpenCV grid detection
|   |-- HSV color classification
|   |-- confidence scoring
|
|-- C++ engine modules
|   |-- Cube state representation
|   |-- Move execution
|   |-- Validator
|   |-- Solver scaffolds
|   |-- Benchmark classes
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS |
| 3D | Three.js, React Three Fiber, Drei |
| Solver Backend | Node.js, Vercel Serverless Functions |
| Solver Algorithm | Kociemba two-phase via `cubejs` |
| Scanner Backend | Python, FastAPI, OpenCV, NumPy |
| Benchmark Engine | TypeScript frontend search + C++ benchmark modules |
| C++ Core | C++17 OOP cube engine |
| Deployment | Vercel |

---

## Algorithms Used

### Kociemba Two-Phase Solver

Kociemba is practical for Rubik's Cube solving because it reduces the search space into two phases:

- **Phase 1:** move the cube into a constrained subgroup.
- **Phase 2:** solve the cube from that subgroup efficiently.

In CubeVision AI, the solver accepts the current `CubeState`, converts it into facelet notation, calls the Kociemba implementation, then converts the returned algorithm into animated moves.

### BFS

Breadth-first search explores states level by level. It is complete and finds shortest paths for tiny scrambles, but memory usage explodes quickly.

### IDDFS

Iterative deepening DFS uses low memory and searches depth by depth. It repeats work, but it is useful for small/medium search depths.

### A*

A* uses a priority queue with `f(n) = g(n) + h(n)`. It can be fast with a good heuristic, but it keeps many states in memory.

### IDA*

IDA* combines iterative deepening with heuristic bounds. It is more memory-efficient than A* and is a natural fit for large combinatorial state spaces.

### Heuristic

The benchmark/search scaffold uses simple cube-state heuristics such as misplaced sticker estimates. This is intentionally replaceable with stronger pattern databases later.

### Move Inference

For recovery, the system tries candidate moves like `R`, `R'`, `U`, `U'`, etc. It applies each candidate to the previous verified state and compares it with the scanned actual state. The closest match becomes the likely detected move.

---

## API Documentation

### `GET /api/health`

Returns the deployed solver status.

```json
{
  "ok": true,
  "solver": "cubejs-kociemba"
}
```

### `POST /api/solve`

Solves a cube from the current frontend `CubeState`.

Request:

```json
{
  "cubeState": {
    "up": [{ "color": "white" }],
    "right": [{ "color": "red" }],
    "front": [{ "color": "green" }],
    "down": [{ "color": "yellow" }],
    "left": [{ "color": "orange" }],
    "back": [{ "color": "blue" }]
  }
}
```

Response:

```json
{
  "success": true,
  "solution": ["R", "U", "R'"],
  "timeTakenMs": 12.4,
  "message": "Solved with cubejs Kociemba two-phase backend."
}
```

---

## Run Locally

### Frontend

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

### Optional Local Solver Backend

The deployed app uses Vercel API functions. For local backend testing:

```bash
npm run solver:backend
```

Local solver backend:

```text
http://127.0.0.1:8787/api/health
```

### Python Scanner Backend

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r scanner/requirements.txt
uvicorn scanner.api:app --reload --port 8000
```

### Build

```bash
npm run build
```

---

## Project Structure

```text
api/
  health.js
  solve.js

src/
  App.tsx
  components/
    Cube3D/
    CubeInput/
    Scanner/
    MistakeDetection/
    Benchmark/
  lib/
    cubeState.ts
    moves.ts
    solverApi.ts
    validators.ts
    benchmarkApi.ts
    mistakeDetection.ts
  pages/
    HomePage.tsx
    ScannerPage.tsx
    RecoveryPage.tsx
    BenchmarkDashboard.tsx

scanner/
  api.py
  face_detector.py
  sticker_extractor.py
  color_classifier.py
  confidence_scorer.py

backend/
  solver/server.js
  benchmark/
  mistake_detection/

src/*.cpp / src/*.h
  C++ cube engine, validators, solvers, benchmark classes
```

---

## Placement Interview Explanation

CubeVision AI is a strong placement project because it is not just a CRUD app. It demonstrates frontend engineering, algorithms, 3D rendering, computer vision, backend APIs, deployment, validation, and system design.

In an interview, explain it like this:

> CubeVision AI is an end-to-end Rubik's Cube assistant. The user can scan or manually enter a cube, validate whether the state is physically meaningful, solve it using a Kociemba two-phase algorithm, animate the solution on a Three.js cube, and recover if the user performs the wrong physical move. I separated the system into scanner, cube-state model, solver, recovery, benchmark, and visualization modules so each part can evolve independently.

Important engineering points:

- I modeled the cube as six faces with nine stickers each.
- Moves are parsed as objects like `{ face: "R", prime: true }`.
- The visualizer renders cubies and updates state after every animation.
- The scanner uses HSV because raw RGB is unstable under lighting changes.
- Low-confidence CV output is never trusted blindly.
- The validator catches color-count and piece-consistency errors before solving.
- The solver uses a real Kociemba two-phase algorithm instead of fake hardcoded moves.
- Recovery compares expected state and scanned state to infer physical mistakes.
- Benchmarking shows time-space tradeoffs between BFS, IDDFS, A*, IDA*, and Kociemba.
- The deployed version uses Vercel API functions for the solver backend.

---

## Future Improvements

- Deploy Python OpenCV scanner backend separately.
- Add ML-based color classifier for difficult lighting.
- Add pattern database heuristics for IDA*.
- Compile the C++ engine to WebAssembly.
- Add voice guidance for physical solving.
- Add AR overlays for the next move.
- Add cubie-level orientation and parity UI explanations.

---

## Author

**Vamshi Chethan**  
Project: CubeVision AI - Rubik's Cube Scanner & Solver

<div align="center">

### Built for real algorithmic, visual, and system-design depth.

[Live App](https://cubevision-ai.vercel.app) • [GitHub Repository](https://github.com/vamshichethan/CubeVision-AI-Rubik-s-Cube-Scanner-Solver)

</div>
