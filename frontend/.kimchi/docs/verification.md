# Verification Report — Bracketed Tailwind Class Cleanup

## Command Used

```bash
perl -pi -e '
  s/\[teal-700\]/teal-700/g;
  s/\[teal-900\]/teal-900/g;
  s/\[amber-600\]/amber-600/g;
  s/\[amber-500\]/amber-500/g;
  s/\[amber-400\]/amber-400/g;
  s/\[slate-900\]/slate-900/g;
  s/\[slate-700\]/slate-700/g;
  s/\[slate-500\]/slate-500/g;
  s/\[slate-200\]/slate-200/g;
  s/\[slate-100\]/slate-100/g;
  s/\[slate-50\]/slate-50/g;
  s/\[slate-800\]/slate-800/g;
' app/components/public/PublicNavbar.jsx app/components/public/CandidateProfile.jsx
```

Note: The opacity-suffix patterns (`bg-[slate-50]/95`, `bg-[slate-50]/80`,
`focus-visible:ring-[amber-600]/40`, `border-[slate-500]/...`) are handled
transparently by the colour-only substitutions above — the bracketed colour
portion is replaced and any trailing `/NN` opacity suffix is left in place
untouched.

## Files Modified

- `app/components/public/PublicNavbar.jsx`
- `app/components/public/CandidateProfile.jsx`

## Verification — Grep for Remaining Bracketed Standard Utilities

```bash
grep -nE '\[teal-|\[amber-|\[slate-' \
  app/components/public/PublicNavbar.jsx \
  app/components/public/CandidateProfile.jsx
```

Result: **no matches** (exit code 1). All bracketed `teal-*`, `amber-*`, and
`slate-*` named utilities have been converted to standard Tailwind classes.

## Sample Confirmed Conversions

| Before | After |
| --- | --- |
| `border-[slate-200] bg-[slate-50]/95 ... supports-[backdrop-filter]:bg-[slate-50]/80` | `border-slate-200 bg-slate-50/95 ... supports-[backdrop-filter]:bg-slate-50/80` |
| `text-[slate-900] ... hover:text-[teal-700] ... focus-visible:ring-[amber-600]/40` | `text-slate-900 ... hover:text-teal-700 ... focus-visible:ring-amber-600/40` |
| `bg-[amber-600] ... text-[slate-50] hover:bg-amber-700` | `bg-amber-600 ... text-slate-50 hover:bg-amber-700` |
| `border-[teal-700] text-[teal-700] hover:bg-[teal-700]` | `border-teal-700 text-teal-700 hover:bg-teal-700` |
| `hover:bg-[amber-600]/90` (opacity preserved) | `hover:bg-amber-600/90` |
| `focus-visible:bg-[slate-100] focus-visible:text-[teal-700]` | `focus-visible:bg-slate-100 focus-visible:text-teal-700` |

The `supports-[backdrop-filter]:` arbitrary variant prefix was correctly left
intact (it contains `-[backdrop-filter]`, not a colour name, so it was not
matched by the replacements).

## Test Output

Not run — per task instructions: `Do NOT run npm run build or npm run lint.`

## Lint Output

Not run — per task instructions.

## Out-of-Scope Patterns Observed

Three occurrences of `border-[#64748B]/NN` remain in `CandidateProfile.jsx`
(lines 346, 719, 724). These use the hex value `#64748B` rather than the
named colour `slate-500`, so they were not in the replacement list and are
intentionally left untouched. No `border-[slate-500]/...` patterns exist in
the two target files.

## Verdict

**ALL_PASS**
