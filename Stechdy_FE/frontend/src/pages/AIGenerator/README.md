# AI Schedule Generator Page

## Overview
Form-based interface for generating study schedules using n8n workflow automation. Fully integrated with Stechdy's design language featuring pink gradients and dark mode support.

## Features

### 1. Subject Management
- Add/remove multiple subjects dynamically
- Priority selector (1-5 scale with visual pills)
- Real-time priority hint labels
- Minimum 1 subject required for generation

### 2. Date Range Selection
- Start date (required)
- End date (optional - defaults to 30 days from start)
- Date validation with min constraints

### 3. Study Duration
- Quick select pills: 30min, 45min, 1h, 1.5h
- Custom duration option (15-240 minutes)
- Visual active state for selected duration

### 4. Busy Times (Optional)
- Day selector dropdown (Monday-Sunday)
- Time slot checkboxes:
  - Morning: 8:00 - 12:00
  - Afternoon: 14:00 - 17:00
  - Evening: 19:00 - 22:00
- Add/remove multiple busy time entries

### 5. Form Submission
- Validates required fields
- Shows loading spinner during generation
- Connects to n8n webhook at `http://localhost:1234/webhook/gen-schedule-v2`
- Saves schedule to localStorage
- Redirects to /calendar on success

## Technical Details

### State Management
```javascript
const [subjects, setSubjects] = useState([{ name: "", priority: 3 }]);
const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");
const [sessionDuration, setSessionDuration] = useState("60");
const [customDuration, setCustomDuration] = useState("");
const [busyTimes, setBusyTimes] = useState([{ day: "", slots: [] }]);
const [isGenerating, setIsGenerating] = useState(false);
```

### n8n Webhook Payload Format
```javascript
{
  start_date: "2024-01-01",
  end_date: "2024-01-31",
  duration: 1.0, // hours
  subjects: [
    { name: "Math", priority: 1 },
    { name: "Physics", priority: 2 }
  ],
  busy_times: [
    {
      day: "monday",
      start: "08:00",
      end: "12:00",
      label: "Morning"
    }
  ],
  lunch_start: "12:00",
  lunch_end: "13:00",
  max_subjects_per_day: 3
}
```

### Response Handling
- Expects JSON response with `schedule` array or `data.schedule`
- Saves to localStorage:
  - `studySchedule`: Full schedule data
  - `studyScheduleInput`: Original input for reference
  - `ai_generation_count`: Incremented counter
- Navigation to /calendar after 1.5s delay

## Design System

### Colors (Stechdy Pink Gradient)
- Primary: `#f472b6` to `#ec4899`
- Hover states with rgba overlays
- Box shadows with pink tint

### Typography
- Font family: var(--font-family) (Inter)
- Title gradient text effect
- Consistent weight hierarchy (400, 500, 600, 700)

### Components
- **Cards**: Rounded corners (16-20px), subtle shadows
- **Inputs**: 2px borders, focus states with pink glow
- **Buttons**: Gradient backgrounds, hover lift effect
- **Pills**: Toggle-style with active gradient
- **Toast**: Fixed position bottom-right, auto-hide after 4s

### Responsive Design
- Mobile: Full width, single column
- Tablet+: Sidebar navigation, max-width 900px
- Desktop: Left margin for sidebar (250px)

## File Structure
```
AIGenerator/
├── AIGenerator.jsx      # Main component
├── AIGenerator.css      # Styled components
└── README.md           # This file
```

## Dependencies
- React hooks: useState, useNavigate, useTranslation
- Components: SidebarNav, BottomNav
- i18n: English & Vietnamese translations

## Usage

### Navigation
- Accessible from Dashboard via AI Generator card
- Route: `/ai-generator` (protected by PrivateRoute)

### Form Validation
1. At least 1 subject with non-empty name
2. Start date is required
3. Custom duration must be 15-240 minutes if selected

### Error Handling
- Network errors (failed to fetch)
- Server errors (500+)
- Invalid response format
- All shown via toast notifications

## Integration Points

### localStorage Keys
- `studySchedule`: Generated schedule object
- `studyScheduleInput`: User input data
- `ai_generation_count`: Total generations counter

### Navigation
- Back button → /dashboard
- Success → /calendar (with schedule data)

### i18n Keys
```javascript
t("ai.title")
t("ai.subtitle")
t("ai.subjects")
t("ai.subjectName")
t("ai.addSubject")
t("ai.priority")
t("ai.dateRange")
t("ai.startDate")
t("ai.endDate")
t("ai.endDateHint")
t("ai.studyDuration")
t("ai.customHint")
t("ai.busyTimes")
t("ai.selectDay")
t("ai.addBusyTime")
t("ai.generateSchedule")
t("ai.generating")
```

## Future Enhancements
- Algorithm visualization modal
- Connection status indicator
- Generation statistics display
- Save/load form drafts
- Schedule preview before saving
