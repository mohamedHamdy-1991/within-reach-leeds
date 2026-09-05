# Privacy, Permissions and Security

## Browser permissions

| Capability | V1 | Trigger | Fallback |
|---|---|---|---|
| Geolocation | optional, foreground, one-shot | user presses `Use my location` after explanation | postcode/place entry |
| Persistent storage | optional | user saves preferences/recent places | session memory |
| Notifications | prohibited V1 | none | none |
| Camera/microphone/contacts | prohibited | none | none |
| Background location | prohibited | none | none |
| Clipboard/share | only on explicit action if later enabled | `Copy`/`Share` | select/copy text |

Never request location on page load. Use approximate coordinates only as needed for routing, transmit over TLS, redact from application logs and do not send to analytics. Local preferences contain no diagnosis; give `Delete my local data` and describe exactly what it removes.

## Privacy posture

No account, cookies beyond essential preferences, advertising, cross-site tracking, fingerprinting or third-party analytics by default. If analytics are later proposed, require author approval, data-protection assessment, consent design and coordinate-free event schema. Privacy notice/controller details remain `AUTHOR_DECISION_REQUIRED` before public launch.

## Threat controls

- Validate coordinates, text, filters, polygon sizes and route limits.
- Rate-limit geocoding, route and reach endpoints; cap contours and alternatives.
- SSRF-safe allowlists for pipeline downloads; checksums and size ceilings.
- Parameterised PostGIS queries; least-privilege DB roles; read-only serving role.
- Secrets only in environment/secret manager; rotate and scan with gitleaks.
- CSP, HSTS, Referrer-Policy, Permissions-Policy, frame-ancestors, secure headers.
- Dependency/SBOM/container scans; pinned image digests; signed releases where practical.
- Generic client errors; structured server logs without coordinates or free-text addresses.
- Backups encrypted and restore-tested; no production data copied to developer machines.

## Roles

V1 public user is anonymous/read-only. Pipeline publisher and production operator are service roles, not UI accounts. CI gets read-only test secrets; deployment requires protected environment approval. Database migration and release activation are separate permissions.

## Safety wording

The interface must say data can be incomplete and conditions change. Never say “safe route”, “wheelchair accessible route” or “guaranteed step-free”; use “easier route based on known information” and show unknown factors.

