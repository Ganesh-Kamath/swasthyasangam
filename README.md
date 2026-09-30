# SwasthyaSangam — Temporary QR-Based Medical Record Access

> **"Your health records. Your control."**  
> *A functional visual prototype demonstrating patient-controlled selective sharing and temporary QR session access for clinical consultations.*

---

## 🎯 Demo Purpose & Core Architecture

This prototype demonstrates how **SwasthyaSangam** enables secure, temporary medical record sharing designed to minimize unnecessary exposure:
1. **Selective Sharing**: The patient selects only the records pertinent to the current consultation (e.g. ECG, Lipid Profile, Echocardiogram), withholding unrelated history (e.g. past prescriptions).
2. **Session-Only Optical QR**: The QR code encodes a temporary authorization session (`SS-DEMO-4821`), **never raw health records**.
3. **Time-Bound Verification**: Real-time countdown enforces strict session validity (`expiresAt - Date.now()`).
4. **Instant Revocation**: The patient can revoke access at any second, immediately locking out the physician's view.
5. **Cross-Tab Synchronization**: State is persisted via `sessionManager` and synchronized in real-time across views and browser windows.

---

## 🚀 Running Locally

The prototype is built with **React 18 + Vite + TypeScript** and styled with **Manrope** typography and clinical SaaS design tokens.

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Production build verification
npm run build
```

Open your browser at:  
👉 **`http://localhost:3000`**

---

## ⏱️ 60–90 Second Live Competition Presentation Sequence

Follow this sequence when presenting to judges:

| Elapsed | Action on Screen | Key Talking Point for Judges |
| :--- | :--- | :--- |
| **00:00** | Start on Landing page, click **"Start Demo"** | *"Patients often carry voluminous paper files or share entire digital profiles with a doctor. SwasthyaSangam gives patients strict selective control over their evidence."* |
| **00:10** | Show Rahul Mehta's 4 clinical records. Notice 3 are selected (ECG, Lipid Profile, 2D Echo) while Cardiology Prescription is unselected. | *"Instead of giving the doctor everything, Rahul Mehta chooses only the 3 relevant diagnostic reports, withholding the prescription."* |
| **00:20** | Click **"Create Temporary Access"**. Review target doctor (**Dr. Ananya Shah**, Cardiology) and 30m duration. Click **"Generate QR Access"**. | *"He sets a 30-minute access window strictly for Dr. Shah's consultation."* |
| **00:30** | QR Access screen appears with Session ID `SS-DEMO-4821` and live countdown timer. | *"Crucially, this QR code does NOT contain medical data. It represents a temporary session identifier."* |
| **00:40** | Click **"Simulate Doctor Scan"**. Watch the 1-second `VERIFYING ACCESS` → `ACCESS GRANTED` transition. | *"When Dr. Shah scans the QR code at the clinic, the system validates the session token and pulls only permitted records."* |
| **00:50** | Doctor view shows only the 3 selected records. Click **"View Report"** on ECG or Lipid Profile. | *"Notice the prescription is absent because Rahul withheld it. The document viewer preserves source facility, document date, and clinical parameters."* |
| **01:05** | Point out the countdown timer, then click **"Revoke Access"** (or **"Simulate Expiry"**). | *"The access is temporary. If Rahul revokes access—or when the timer hits zero—access is terminated immediately."* |
| **01:15** | Doctor view updates to **`ACCESS REVOKED`** and all clinical records disappear. | *"The session is closed and access is revoked after expiry or patient revocation."* |

---

## 🛡️ Key Privacy & Architectural Guarantees

- **Zero Health Data in Optical Channels**: Optical QR codes only carry an ephemeral session URI (`https://swasthyasangam.health/demo/doctor/SS-DEMO-4821`).
- **Dynamic Scope Enforcement**: The backend session state maps permitted record IDs (`recordIds: ['rec-ecg-01', ...]`). Unselected records are not returned to the physician's client.
- **Timestamp Truth Engine**: Timer math relies strictly on `expiresAt - Date.now()`, surviving page reloads, tab switches, and re-renders.
- **Fail-Safe Fallback**: In addition to optical QR simulation, doctors can manually verify with Session ID (`SS-DEMO-4821`). Unrecognized codes trigger clean `ACCESS NOT FOUND` handling.
- **Presentation Shortcuts**:
  - `Patient View / Doctor View` switcher in top banner lets you toggle perspectives instantly.
  - `Simulate Expiry` button tests countdown expiry on demand.
  - `Reset Demo` button immediately restores initial demo state.

---

## 📂 Project Structure

```text
src/
 ├── types/
 │    └── index.ts               # MedicalRecord, Patient, Doctor, AccessSession interfaces
 ├── data/
 │    └── demoData.ts            # Realistic clinical reports, patient & doctor identities
 ├── utils/
 │    └── sessionManager.ts      # Storage persistence, timestamp math, cross-tab sync
 ├── components/
 │    ├── DemoTopBar.tsx         # Quick view toggles, demo mode banners, reset button
 │    ├── Header.tsx             # Clinical SaaS header & role context
 │    ├── WorkflowStepper.tsx    # 5-stage visual pipeline indicator
 │    ├── MedicalRecordCard.tsx  # Patient-side record selector card with preview
 │    ├── QRAccessCard.tsx       # QR code generator, countdown & simulated scan
 │    ├── AccessTimer.tsx        # High-precision countdown timer with urgency styling
 │    ├── DocumentViewer.tsx     # Clinical document modal with lab metrics & findings
 │    └── RevokeModal.tsx        # Session termination confirmation modal
 ├── pages/
 │    ├── Landing.tsx            # Clean introduction screen
 │    ├── PatientRecords.tsx     # Record selection interface
 │    ├── CreateAccess.tsx       # Duration and purpose configuration
 │    ├── QRAccess.tsx           # Patient QR display & session management
 │    ├── DoctorScan.tsx         # Optical scan simulation & verification
 │    └── DoctorAccess.tsx       # Doctor dashboard with selectively unlocked reports
 ├── styles/
 │    └── index.css              # Clinical design tokens & mobile/tablet media queries
 ├── App.tsx                     # Global state & scenario orchestration
 └── main.tsx                    # Entrypoint
```

---

*Note: All data in this prototype is strictly fictional demo data intended for demonstration and competition judging.*
