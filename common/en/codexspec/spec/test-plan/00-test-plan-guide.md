# Test Plan Guide

Tester owns stable test plans under `codexspec/spec/test-plan/`.

Test plans map accepted design/spec behavior to verification steps, fixtures, acceptance matrices, and pass/fail criteria. Tester writes plans and coverage reviews, not code.

Suggested sections:

| Section | Content |
|---|---|
| Owner | Tester |
| Related spec | `codexspec/spec/*.md` |
| Acceptance matrix | Requirement to verification mapping |
| Automated checks | Commands and expected result |
| Manual checks | Manual verification if needed |
| Fixtures | Required data or setup |
| Regression scope | Existing behavior to protect |
