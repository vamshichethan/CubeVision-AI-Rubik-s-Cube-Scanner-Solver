# CubeVision AI - Input System + Real-Time Recovery

CubeVision AI now uses a page-based interface instead of one long page. The app has a focused Cube Assistant, a dedicated Scanner page, and a Benchmark Dashboard.

The input system supports:

- Live webcam/mobile camera capture
- Cube face image upload
- OpenCV/FastAPI scanner integration
- Confidence scores for every sticker
- Manual sticker correction fallback
- Six-face scan progress
- Validation before sending CubeState to the solver

The solution player no longer loads a fake hardcoded 10-move solution for arbitrary states. It uses a real Kociemba two-phase solver path: first through the optional Node backend, then through the same Kociemba package in the browser if the backend is not running.

Run the optional solver backend:

```bash
npm run solver:backend
```

Then run the frontend:

```bash
npm run dev
```

## Pages

```text
Cube Assistant
Scanner
Benchmarks
```

## Scanner UI Flow

1. Choose face: `U / D / F / B / L / R`
2. Use Live Camera or Upload Image
3. Backend processes the image through OpenCV
4. App displays detected 3x3 grid
5. Low-confidence stickers are highlighted
6. User clicks any sticker to manually correct it
7. Save the face
8. Repeat until all 6 faces are scanned
9. Validate cube state
10. Send CubeState to solver

## Problem Solved

In real cube solving, the solver can say `U'`, but the user might do `U`, skip a move, rotate the wrong layer, or accidentally perform a double turn. If the app blindly continues, the remaining solution becomes wrong. Phase 7 adds verification before continuing.

## Flow

```text
Expected move generated
User performs physical move
Camera scans cube
System compares expected state vs scanned state
Mismatch detected
Likely wrong move inferred
Recovery suggested or solution recalculated
Solving continues
```

## Backend Modules

```text
backend/mistake_detection/
  mistake_detector.py
  state_comparator.py
  move_inference_engine.py
  recovery_manager.py
  solution_recalculator.py
  scan_consistency_checker.py
  expected_state_tracker.py
  api.py
```

Scanner backend:

```text
scanner/
  api.py
  camera_scanner.py
  image_processor.py
  face_detector.py
  sticker_extractor.py
  color_classifier.py
  confidence_scorer.py
  calibration_manager.py
  requirements.txt
```

Solver backend:

```text
backend/solver/
  server.js
```

`POST /api/solve` accepts the current `CubeState`, converts its facelets into Kociemba order, and returns a move sequence from the cubejs implementation of Herbert Kociemba's two-phase algorithm. The old browser depth-limited fallback search was removed so failed solves are reported honestly instead of loading guessed moves.

## Scanner API

```http
POST /scan-image
```

Input:

```text
image file
face label
```

Output:

```json
{
  "face": "U",
  "success": true,
  "stickers": [
    { "row": 0, "col": 0, "color": "WHITE", "confidence": 0.94 }
  ],
  "needsManualCorrection": false
}
```

```http
POST /validate-cube
```

Validates all scanned faces for color counts and center uniqueness.

Responsibilities:

- `ExpectedStateTracker`: tracks expected cube state, move history, and remaining solution.
- `StateComparator`: counts sticker matches and mismatch severity.
- `MoveInferenceEngine`: applies candidate moves to the previous verified state and picks the closest match.
- `ScanConsistencyChecker`: rejects noisy or low-confidence scans.
- `RecoveryManager`: suggests undo, retake, manual correction, or recalculation.
- `SolutionRecalculator`: scaffold for calling C++/WASM/backend solver.
- `MistakeDetector`: orchestrates the complete verification flow.

## Frontend Components

```text
src/components/MistakeDetection/
  MistakeAlert.tsx
  RecoveryPanel.tsx
  ScanVerificationPanel.tsx
  MoveComparisonCard.tsx
  ConfidenceIndicator.tsx
```

The recovery page is now scanner-first for real-world use:

- Select expected move
- Send a real six-face CubeState from Scanner
- Verify the scanned physical state against the expected virtual state
- Show expected vs detected move
- Show confidence and mismatch count
- Suggest recovery
- Recalculate a real Kociemba solution from the scanned state

## State Comparison Strategy

The comparator checks every sticker in the expected cube state against the scanned actual state. It returns:

- Exact match
- Partial match
- Large mismatch
- Sticker match percentage
- Mismatched sticker count

This is intentionally modular so later versions can compare cubie positions and orientations instead of only stickers.

## Move Inference Logic

The inference engine tries nearby candidate moves:

```text
R, R', L, L', U, U', D, D', F, F', B, B'
```

For each candidate:

1. Apply the candidate to the previous verified state.
2. Compare that candidate state to the scanned state.
3. Choose the candidate with the highest match percentage.

Example:

```text
Expected Move: U'
Detected Move: U
Confidence: 92%
Suggested Action: Undo Move
```

## Dynamic Re-Solving

If the state no longer matches the expected path, the recovery system can:

- Undo the inferred mistake
- Retake the scan
- Manually correct low-confidence stickers
- Recalculate a new solution from the scanned state

The recalculator calls the same real Kociemba solver path used by the main solution player, so recovery continues from the scanned CubeState instead of loading demo moves.

## Handling Noisy CV Scans

The scan consistency checker uses confidence values from the scanner. Low confidence scans do not trigger aggressive recovery. Instead, the UI asks for retake or manual correction to avoid compounding scanner noise into solver mistakes.

## API Shape

```http
POST /verify-move
```

Input:

```json
{
  "previousState": {},
  "expectedState": {},
  "actualState": {},
  "expectedMove": "U'",
  "scanConfidences": [0.93, 0.91]
}
```

Output:

```json
{
  "match": false,
  "detected_move": "U",
  "confidence": 0.92,
  "recovery_options": ["Undo move", "Recalculate solution"]
}
```

## Build And Verify

Frontend:

```bash
npm install
npm run build
npm run dev
```

Backend syntax check:

```bash
python3 -m compileall backend/mistake_detection
```

Optional API:

```bash
uvicorn backend.mistake_detection.api:app --reload --port 8001
uvicorn scanner.api:app --reload --port 8000
```

## Future Upgrades

- Voice guidance: “You performed the wrong move”
- Hand tracking
- Gesture-based move recognition
- ML-based move inference
- AR overlay guidance
- Cubie-level mismatch analysis
- WebAssembly recovery solving

## Interview Explanation

Phase 7 demonstrates real-world robustness. It separates scanner confidence, state comparison, move inference, recovery planning, and re-solving. That makes the system explainable, testable, and ready for future ML or WebAssembly upgrades without tangling UI, CV, and solver logic.
